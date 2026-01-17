class Slideshow {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.isPaused = false;
        this.slideDuration = 5000; // 5 Sekunden pro Slide
        this.progressInterval = null;
        this.progressStart = 0;
        
        // Einstellungen
        this.settings = {
            slideDuration: 5,
            startSlide: 0,
            autoHideControls: true,
            showProgress: true,
            enableTransitions: true,
            transitionSpeed: 1,
            imageFit: 'cover',
            captionPosition: 'bottom',
            fontSize: 32
        };
        
        // Bildverwaltung
        this.customImages = [];
        this.imageCounter = 0;
        
        // Passwort-Schutz
        this.isLocked = false;
        this.correctPassword = 'admin123'; // Standard-Passwort
        
        this.loadSettings();
        this.loadCustomImages();
        this.loadPasswordProtection();
        this.init();
    }
    
    init() {
        this.showSlide(this.settings.startSlide);
        this.startSlideshow();
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.setupSettingsModal();
        this.hideControlsAfterDelay();
        this.applySettings();
    }
    
    showSlide(index) {
        // Alle Slides ausblenden
        this.slides.forEach(slide => slide.classList.remove('active'));
        
        // Aktiven Slide anzeigen
        this.slides[index].classList.add('active');
        this.currentSlide = index;
        
        // Fortschrittsbalken zurücksetzen
        this.resetProgress();
        
        // Fehlerbehandlung für Bilder
        const img = this.slides[index].querySelector('img');
        if (img) {
            img.onerror = () => {
                console.error(`Fehler beim Laden des Bildes: ${img.src}`);
                this.showErrorMessage(`Bild konnte nicht geladen werden: ${img.src}`);
            };
        }
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }
    
    startSlideshow() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        
        if (!this.isPaused) {
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, this.slideDuration);
            
            this.startProgress();
        }
    }
    
    stopSlideshow() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
        
        this.stopProgress();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.isPaused) {
            this.stopSlideshow();
            pauseBtn.innerHTML = '▶️ Wiedergabe';
        } else {
            this.startSlideshow();
            pauseBtn.innerHTML = '⏸️ Pause';
        }
    }
    
    toggleFullscreen() {
        const elem = document.documentElement;
        
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    startProgress() {
        this.progressStart = Date.now();
        this.progressInterval = setInterval(() => {
            const elapsed = Date.now() - this.progressStart;
            const progress = (elapsed / this.slideDuration) * 100;
            
            if (progress <= 100) {
                document.querySelector('.progress-fill').style.width = progress + '%';
            }
        }, 50);
    }
    
    stopProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    resetProgress() {
        this.stopProgress();
        document.querySelector('.progress-fill').style.width = '0%';
        if (!this.isPaused) {
            this.startProgress();
        }
    }
    
    setupEventListeners() {
        // Button-Steuerung
        document.getElementById('settingsBtn').addEventListener('click', () => {
            if (this.isLocked) {
                this.showPasswordModal('settings');
            } else {
                this.openSettingsModal();
            }
        });
        
        document.getElementById('unlockBtn').addEventListener('click', () => {
            this.toggleLock();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            if (this.isLocked) {
                this.showPasswordModal('fullscreen');
            } else {
                this.toggleFullscreen();
            }
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.isLocked) {
                this.showPasswordModal('pause');
            } else {
                this.togglePause();
            }
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.isLocked) {
                this.showPasswordModal('next');
            } else {
                this.nextSlide();
                this.resetProgress();
            }
        });
        
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.isLocked) {
                this.showPasswordModal('prev');
            } else {
                this.prevSlide();
                this.resetProgress();
            }
        });
        
        // Touch-Steuerung für mobile Geräte
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        this.handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
                this.resetProgress();
            }
        };
        
        // Maus-Steuerung
        document.addEventListener('click', (e) => {
            if (e.target.closest('.controls')) return;
            
            const clickX = e.clientX;
            const screenWidth = window.innerWidth;
            
            if (clickX < screenWidth / 2) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
            this.resetProgress();
        });
        
        // Vollbild-Änderungen überwachen
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        // Sichtbarkeits-Änderungen (Tab-Wechsel)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopSlideshow();
            } else if (!this.isPaused) {
                this.startSlideshow();
            }
        });
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    this.resetProgress();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    this.resetProgress();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        });
    }
    
    hideControlsAfterDelay() {
        let hideTimeout;
        let isMouseMoving = false;
        
        const showControls = () => {
            isMouseMoving = true;
            document.querySelector('.controls').classList.add('visible');
            clearTimeout(hideTimeout);
            
            hideTimeout = setTimeout(() => {
                if (!this.isPaused && isMouseMoving) {
                    document.querySelector('.controls').classList.remove('visible');
                    isMouseMoving = false;
                }
            }, 2000);
        };
        
        const hideControlsImmediately = () => {
            if (!this.isPaused) {
                document.querySelector('.controls').classList.remove('visible');
                isMouseMoving = false;
            }
        };
        
        document.addEventListener('mousemove', showControls);
        document.addEventListener('touchstart', showControls);
        document.addEventListener('touchmove', showControls);
        
        // Controls ausblenden wenn Maus still steht
        let mouseStopTimeout;
        document.addEventListener('mousemove', () => {
            clearTimeout(mouseStopTimeout);
            mouseStopTimeout = setTimeout(() => {
                hideControlsImmediately();
            }, 3000);
        });
        
        // Bei Pause immer Controls anzeigen
        const originalTogglePause = this.togglePause.bind(this);
        this.togglePause = () => {
            originalTogglePause();
            if (this.isPaused) {
                document.querySelector('.controls').classList.add('visible');
            } else {
                setTimeout(() => {
                    hideControlsImmediately();
                }, 1000);
            }
        };
        
        // Controls bei Klick auf Control-Container sichtbar halten
        document.querySelector('.controls').addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            document.querySelector('.controls').classList.add('visible');
        });
        
        document.querySelector('.controls').addEventListener('mouseleave', () => {
            if (!this.isPaused) {
                hideTimeout = setTimeout(() => {
                    document.querySelector('.controls').classList.remove('visible');
                }, 1000);
            }
        });
        
        // Tastatur-Controls kurz anzeigen
        document.addEventListener('keydown', () => {
            showControls();
        });
        
        // Initiales Verstecken nach 3 Sekunden
        setTimeout(() => {
            if (!this.isPaused) {
                hideControlsImmediately();
            }
        }, 3000);
    }
    
    handleFullscreenChange() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '🔻 Vollbild verlassen';
        } else {
            fullscreenBtn.innerHTML = '🖥️ Vollbild';
        }
    }
    
    // Einstellungen Methoden
    loadSettings() {
        const saved = localStorage.getItem('slideshowSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('slideshowSettings', JSON.stringify(this.settings));
    }
    
    applySettings() {
        // Slide-Dauer anwenden
        this.slideDuration = this.settings.slideDuration * 1000;
        
        // Fortschrittsbalken ein/ausblenden
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.display = this.settings.showProgress ? 'block' : 'none';
        
        // Übergänge anwenden
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
            slide.style.transition = this.settings.enableTransitions 
                ? `opacity ${this.settings.transitionSpeed}s ease-in-out` 
                : 'none';
        });
        
        // Bildanpassung anwenden
        const images = document.querySelectorAll('.slide img');
        images.forEach(img => {
            img.style.objectFit = this.settings.imageFit;
        });
        
        // Textposition anwenden
        const captions = document.querySelectorAll('.slide-caption');
        captions.forEach(caption => {
            // Position zurücksetzen
            caption.style.top = 'auto';
            caption.style.bottom = 'auto';
            caption.style.left = '50%';
            caption.style.transform = 'translateX(-50%)';
            caption.style.fontSize = this.settings.fontSize + 'px';
            
            switch(this.settings.captionPosition) {
                case 'top':
                    caption.style.top = '50px';
                    break;
                case 'center':
                    caption.style.top = '50%';
                    caption.style.transform = 'translate(-50%, -50%)';
                    break;
                case 'bottom':
                default:
                    caption.style.bottom = '50px';
                    break;
            }
        });
        
        // Controls Auto-Hide anwenden
        if (!this.settings.autoHideControls) {
            document.querySelector('.controls').classList.add('visible');
        }
    }
    
    setupSettingsModal() {
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.querySelector('.close');
        
        // Modal schließen
        closeBtn.addEventListener('click', () => {
            this.closeSettingsModal();
        });
        
        // Modal schließen bei Klick außerhalb
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSettingsModal();
            }
        });
        
        // Einstellungen-Listener
        document.getElementById('slideDuration').addEventListener('input', (e) => {
            document.getElementById('durationValue').textContent = e.target.value + 's';
        });
        
        document.getElementById('fontSize').addEventListener('input', (e) => {
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        });
        
        // Bildverwaltung-Listener
        this.setupImageUpload();
        
        // Passwort-Modal-Listener
        this.setupPasswordModal();
        
        // Speichern und Zurücksetzen
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveCurrentSettings();
        });
        
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });
    }
    
    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'block';
        
        // Aktuelle Werte in die UI laden
        document.getElementById('slideDuration').value = this.settings.slideDuration;
        document.getElementById('durationValue').textContent = this.settings.slideDuration + 's';
        document.getElementById('startSlide').value = this.settings.startSlide;
        document.getElementById('autoHideControls').checked = this.settings.autoHideControls;
        document.getElementById('showProgress').checked = this.settings.showProgress;
        document.getElementById('enableTransitions').checked = this.settings.enableTransitions;
        document.getElementById('transitionSpeed').value = this.settings.transitionSpeed;
        document.getElementById('imageFit').value = this.settings.imageFit;
        document.getElementById('captionPosition').value = this.settings.captionPosition;
        document.getElementById('fontSize').value = this.settings.fontSize;
        document.getElementById('fontSizeValue').textContent = this.settings.fontSize + 'px';
        
        // Slide-Optionen aktualisieren
        const startSlideSelect = document.getElementById('startSlide');
        startSlideSelect.innerHTML = '';
        this.slides.forEach((slide, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Slide ${index + 1}`;
            startSlideSelect.appendChild(option);
        });
        startSlideSelect.value = this.settings.startSlide;
    }
    
    closeSettingsModal() {
        document.getElementById('settingsModal').style.display = 'none';
    }
    
    saveCurrentSettings() {
        this.settings.slideDuration = parseFloat(document.getElementById('slideDuration').value);
        this.settings.startSlide = parseInt(document.getElementById('startSlide').value);
        this.settings.autoHideControls = document.getElementById('autoHideControls').checked;
        this.settings.showProgress = document.getElementById('showProgress').checked;
        this.settings.enableTransitions = document.getElementById('enableTransitions').checked;
        this.settings.transitionSpeed = parseFloat(document.getElementById('transitionSpeed').value);
        this.settings.imageFit = document.getElementById('imageFit').value;
        this.settings.captionPosition = document.getElementById('captionPosition').value;
        this.settings.fontSize = parseInt(document.getElementById('fontSize').value);
        
        this.saveSettings();
        this.applySettings();
        this.closeSettingsModal();
        
        // Slideshow neu starten mit neuen Einstellungen
        this.stopSlideshow();
        this.showSlide(this.settings.startSlide);
        this.startSlideshow();
    }
    
    resetSettings() {
        // Standardwerte wiederherstellen
        this.settings = {
            slideDuration: 5,
            startSlide: 0,
            autoHideControls: true,
            showProgress: true,
            enableTransitions: true,
            transitionSpeed: 1,
            imageFit: 'cover',
            captionPosition: 'bottom',
            fontSize: 32
        };
        
        this.saveSettings();
        this.applySettings();
        this.openSettingsModal(); // Modal mit neuen Werten neu laden
    }
    
    // Bildverwaltung Methoden
    setupImageUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        // Klick auf Upload-Bereich
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Dateiauswahl
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // Drag & Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
    }
    
    handleFileSelect(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const imageData = {
                        id: ++this.imageCounter,
                        src: e.target.result,
                        title: file.name.replace(/\.[^/.]+$/, ''), // Dateiendung entfernen
                        fileName: file.name
                    };
                    
                    this.customImages.push(imageData);
                    this.updateGallery();
                    this.updateSlideshow();
                    this.saveCustomImages();
                };
                
                reader.readAsDataURL(file);
            } else {
                this.showErrorMessage(`Nur Bild-Dateien sind erlaubt: ${file.name}`);
            }
        });
    }
    
    updateGallery() {
        const container = document.getElementById('galleryContainer');
        container.innerHTML = '';
        
        this.customImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.draggable = true;
            item.dataset.index = index;
            
            item.innerHTML = `
                <div class="gallery-item-number">${index + 1}</div>
                <img src="${image.src}" alt="${image.title}">
                <div class="gallery-item-info">
                    <input type="text" class="gallery-item-title" value="${image.title}" 
                           placeholder="Bildtitel" data-index="${index}">
                    <div class="gallery-item-actions">
                        <button class="gallery-item-btn gallery-item-move" data-index="${index}">
                            ↕️ Verschieben
                        </button>
                        <button class="gallery-item-btn gallery-item-delete" data-index="${index}">
                            🗑️ Löschen
                        </button>
                    </div>
                </div>
            `;
            
            // Drag & Drop Events
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.innerHTML);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });
            
            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                
                const draggedIndex = parseInt(document.querySelector('.dragging').dataset.index);
                const targetIndex = parseInt(item.dataset.index);
                
                if (draggedIndex !== targetIndex) {
                    this.moveImage(draggedIndex, targetIndex);
                }
            });
            
            container.appendChild(item);
        });
        
        // Event Listener für Buttons und Titelfelder
        this.setupGalleryEvents();
    }
    
    setupGalleryEvents() {
        // Titel-Änderungen
        document.querySelectorAll('.gallery-item-title').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.customImages[index].title = e.target.value;
                this.saveCustomImages();
                this.updateSlideshow();
            });
        });
        
        // Löschen-Buttons
        document.querySelectorAll('.gallery-item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.deleteImage(index);
            });
        });
    }
    
    moveImage(fromIndex, toIndex) {
        const [movedImage] = this.customImages.splice(fromIndex, 1);
        this.customImages.splice(toIndex, 0, movedImage);
        
        this.updateGallery();
        this.updateSlideshow();
        this.saveCustomImages();
    }
    
    deleteImage(index) {
        if (confirm(`Möchten Sie dieses Bild wirklich löschen?\n${this.customImages[index].title}`)) {
            this.customImages.splice(index, 1);
            this.updateGallery();
            this.updateSlideshow();
            this.saveCustomImages();
        }
    }
    
    updateSlideshow() {
        const container = document.querySelector('.slideshow-container');
        container.innerHTML = '';
        
        this.customImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide fade';
            slide.innerHTML = `
                <img src="${image.src}" alt="${image.title}">
                <div class="slide-caption">${image.title}</div>
            `;
            container.appendChild(slide);
        });
        
        // Slides neu initialisieren
        this.slides = document.querySelectorAll('.slide');
        
        if (this.slides.length > 0) {
            this.currentSlide = Math.min(this.currentSlide, this.slides.length - 1);
            this.showSlide(this.currentSlide);
            this.applySettings();
        } else {
            // Keine Bilder - Platzhalter anzeigen
            container.innerHTML = `
                <div class="slide active" style="display: flex; align-items: center; justify-content: center; flex-direction: column; color: white; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📷</div>
                    <h2>Keine Bilder vorhanden</h2>
                    <p>Laden Sie Bilder über die Einstellungen hoch</p>
                </div>
            `;
            this.slides = [];
        }
        
        // Start-Slide-Optionen aktualisieren
        this.updateStartSlideOptions();
    }
    
    updateStartSlideOptions() {
        const startSlideSelect = document.getElementById('startSlide');
        if (startSlideSelect) {
            startSlideSelect.innerHTML = '';
            this.slides.forEach((slide, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `Slide ${index + 1}`;
                startSlideSelect.appendChild(option);
            });
            startSlideSelect.value = Math.min(this.settings.startSlide, this.slides.length - 1);
        }
    }
    
    saveCustomImages() {
        try {
            localStorage.setItem('slideshowCustomImages', JSON.stringify(this.customImages));
        } catch (e) {
            console.error('Fehler beim Speichern der Bilder:', e);
            this.showErrorMessage('Speicherplatz für Bilder voll. Bitte löschen Sie einige Bilder.');
        }
    }
    
    loadCustomImages() {
        try {
            const saved = localStorage.getItem('slideshowCustomImages');
            if (saved) {
                this.customImages = JSON.parse(saved);
                this.imageCounter = Math.max(...this.customImages.map(img => img.id || 0), 0);
                this.updateSlideshow();
            }
        } catch (e) {
            console.error('Fehler beim Laden der Bilder:', e);
            this.customImages = [];
        }
    }
    
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    // Konfigurationsmethoden
    setSlideDuration(duration) {
        this.slideDuration = duration;
        this.resetProgress();
        this.stopSlideshow();
        this.startSlideshow();
    }
    
    addSlide(imageSrc, caption) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide fade';
        slideDiv.innerHTML = `
            <img src="${imageSrc}" alt="${caption}">
            <div class="slide-caption">${caption}</div>
        `;
        
        document.querySelector('.slideshow-container').appendChild(slideDiv);
        this.slides = document.querySelectorAll('.slide');
    }
    
    removeSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.slides[index].remove();
            this.slides = document.querySelectorAll('.slide');
            
            if (this.currentSlide >= this.slides.length) {
                this.currentSlide = 0;
            }
            
            this.showSlide(this.currentSlide);
        }
    }
}

// Slideshow initialisieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    window.slideshow = new Slideshow();
    
    // Fehlerbehandlung für nicht gefundene Bilder
    const images = document.querySelectorAll('.slide img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjQ4IiBmb250LWZhbWlseT0iQXJpYWwiPkJpbGQgbmljaHQgZ2VmdW5kZW48L3RleHQ+Cjwvc3ZnPgo=';
        });
    });
});

// Globale Fehlerbehandlung
window.addEventListener('error', (e) => {
    console.error('JavaScript Fehler:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unerfüllte Promise:', e.reason);
});

//# Created by Sparkles 