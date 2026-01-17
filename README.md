# Firmen Slideshow für Ladenanzeige

Eine moderne Webseiten-Slideshow zur Anzeige von Werbebildern und Firmenbildern im Vollbildmodus für Bildschirme im Laden.

## Features

- ✅ **Vollbildmodus** - Optimiert für Ladenbildschirme
- ✅ **Automatische Rotation** - Bilder wechseln alle 5 Sekunden
- ✅ **Touch-Steuerung** - Wischen für mobile Geräte
- ✅ **Maus-Steuerung** - Klicken links/rechts zum Navigieren
- ✅ **Tastatur-Steuerung** - Pfeiltasten, Leertaste, P (Pause), F (Vollbild)
- ✅ **Fortschrittsbalken** - Visuelle Anzeige der Slide-Dauer
- ✅ **Responsive Design** - Passt sich allen Bildschirmgrößen an
- ✅ **Fehlerbehandlung** - Zeigt Fehlermeldungen bei Bildproblemen
- ✅ **Pause-Funktion** - Slideshow anhalten/wiedergeben
- ✅ **Auto-Hide Controls** - Steuerelemente blenden sich automatisch aus

## Installation

1. Alle Dateien in einem Ordner ablegen
2. Bilder im `images/` Ordner speichern:
   - `slide1.jpg`
   - `slide2.jpg`
   - `slide3.jpg`
   - `slide4.jpg`
   - `slide5.jpg`

3. `index.html` im Browser öffnen

## Bedienung

### Steuerungselemente
- **🖥️ Vollbild** - Wechselt in den Vollbildmodus
- **⏸️ Pause** - Hält die Slideshow an/setzt fort
- **⏭️ Nächstes** - Springt zum nächsten Bild
- **⏮️ Vorheriges** - Springt zum vorherigen Bild

### Tastaturkürzel
- **Pfeiltaste rechts/Leertaste** - Nächstes Bild
- **Pfeiltaste links** - Vorheriges Bild
- **P** - Pause/Wiedergabe
- **F** - Vollbild ein/aus
- **ESC** - Vollbild verlassen

### Touch/Maus
- **Links klicken/wischen** - Vorheriges Bild
- **Rechts klicken/wischen** - Nächstes Bild

## Konfiguration

### Slide-Dauer anpassen
In `script.js` die Variable `slideDuration` ändern (Millisekunden):
```javascript
this.slideDuration = 5000; // 5 Sekunden
```

### Bilder hinzufügen/entfernen
In `index.html` neue Slide-Elemente hinzufügen:
```html
<div class="slide fade">
    <img src="images/dein-bild.jpg" alt="Deine Beschreibung">
    <div class="slide-caption">Dein Text</div>
</div>
```

### Dynamisch Bilder hinzufügen (JavaScript)
```javascript
slideshow.addSlide('images/neues-bild.jpg', 'Neue Beschreibung');
```

## Technische Details

- **HTML5** - Moderne Web-Standards
- **CSS3** - Responsive Design mit Flexbox
- **Vanilla JavaScript** - Keine externen Abhängigkeiten
- **Cross-Browser** - Funktioniert in allen modernen Browsern
- **Mobile-First** - Optimiert für Touch-Geräte

## Browser-Kompatibilität

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile Browser

## Fehlerbehebung

### Bilder werden nicht angezeigt
- Prüfen ob die Bilddateien im `images/` Ordner existieren
- Dateinamen in `index.html` überprüfen
- Bilddateiformate unterstützen: JPG, PNG, GIF, WebP

### Vollbild funktioniert nicht
- Browser muss Vollbild-API unterstützen
- HTTPS-Verbindung für manche Browser erforderlich
- Tastenkombination `F11` als Alternative

### Performance-Optimierung
- Bilder vor der Verwendung komprimieren
- WebP-Format für bessere Kompression
- Bildgrößen an Zielauflösung anpassen

## Lizenz

Freie Nutzung für kommerzielle und private Zwecke.

# Created by Sparkles 