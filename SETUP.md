# Setup – Scrum Poker App

In dieser Anleitung ist beschrieben, was installiert werden muss und wie die Scrum Poker App lokal gestartet werden kann.

Die Anleitung ist so aufgebaut, dass das Projekt auch auf einem neuen Computer ohne bereits eingerichtete Entwicklungsumgebung gestartet werden kann.

---

## 1. Voraussetzungen

Für das Projekt werden folgende Programme benötigt:

- Git
- Node.js
- pnpm
- Visual Studio Code
- ein Webbrowser, zum Beispiel Chrome, Edge oder Firefox

Optional kann zusätzlich die VS-Code-Erweiterung `REST Client` installiert werden. Damit können die API-Routen des Backends direkt aus einer `.http`-Datei getestet werden.

---

## 2. Git installieren

Git wird benötigt, um das Projekt von GitHub herunterzuladen.

Zuerst kann geprüft werden, ob Git bereits installiert ist.

Dazu ein Terminal oder PowerShell öffnen und folgenden Befehl eingeben:

```bash
git --version
```

Wenn eine Versionsnummer angezeigt wird, ist Git bereits installiert.

Beispiel:

```text
git version 2.50.0
```

Falls der Befehl nicht erkannt wird, kann Git hier heruntergeladen werden:

https://git-scm.com/

Nach der Installation sollte das Terminal neu geöffnet werden.

Danach kann nochmals geprüft werden:

```bash
git --version
```

---

## 3. Node.js installieren

Node.js wird für das Frontend und Backend benötigt.

Es kann geprüft werden, ob Node.js bereits installiert ist:

```bash
node --version
```

Wenn eine Versionsnummer angezeigt wird, ist Node.js installiert.

Beispiel:

```text
v24.0.0
```

Falls Node.js noch nicht installiert ist, kann es hier heruntergeladen werden:

https://nodejs.org/

Für das Projekt sollte eine aktuelle LTS-Version verwendet werden.

Nach der Installation sollte das Terminal neu geöffnet werden.

Danach erneut prüfen:

```bash
node --version
```

Zusätzlich kann geprüft werden, ob `npm` vorhanden ist:

```bash
npm --version
```

`npm` wird zusammen mit Node.js installiert.

---

## 4. pnpm installieren

Das Projekt verwendet `pnpm` als Package Manager.

Zuerst prüfen:

```bash
pnpm --version
```

Wenn eine Versionsnummer angezeigt wird, ist pnpm bereits installiert.

Falls pnpm noch nicht installiert ist:

```bash
npm install -g pnpm
```

Danach prüfen:

```bash
pnpm --version
```

---

## 5. Visual Studio Code installieren

Für die Entwicklung kann Visual Studio Code verwendet werden.

Download:

https://code.visualstudio.com/

Nach der Installation kann der Projektordner später direkt in Visual Studio Code geöffnet werden.

Optional kann zusätzlich die Erweiterung `REST Client` installiert werden.

Diese Erweiterung ist hilfreich, um die Backend-API direkt aus einer Datei wie `test.http` zu testen.

---

## 6. Projekt von GitHub herunterladen

Das Projekt befindet sich in einem GitHub-Repository.

Auf der GitHub-Seite des Projekts auf den Button `Code` klicken und die HTTPS-Adresse kopieren.

Die Adresse sieht ungefähr so aus:

```text
https://github.com/USERNAME/scrum-poker-app.git
```

Danach ein Terminal öffnen und in den Ordner wechseln, in dem das Projekt gespeichert werden soll.

Beispiel unter Windows:

```powershell
cd C:\Users\DEIN-NAME\Documents
```

Danach das Repository klonen:

```bash
git clone https://github.com/USERNAME/scrum-poker-app.git
```

Anschliessend in den Projektordner wechseln:

```bash
cd scrum-poker-app
```

---

## 7. Projektstruktur

Das Projekt besteht aus einem Frontend und einem Backend.

Die wichtigsten Ordner sind:

```text
scrum-poker-app/
├── client/
├── server/
├── README.md
├── SETUP.md
└── .gitignore
```

Der Ordner `client` enthält das Frontend.

Der Ordner `server` enthält das Backend.

---

## 8. Backend installieren

Zuerst in den Server-Ordner wechseln:

```bash
cd server
```

Danach die benötigten Pakete installieren:

```bash
pnpm install
```

Dabei werden alle Abhängigkeiten aus der Datei `package.json` installiert.

Nach der Installation wird ein Ordner `node_modules` erstellt.

Dieser Ordner wird lokal verwendet und nicht auf GitHub gespeichert.

---

## 9. Backend starten

Im Ordner `server` folgenden Befehl ausführen:

```bash
pnpm dev
```

Wenn alles korrekt funktioniert, sollte im Terminal ungefähr folgende Meldung erscheinen:

```text
Server läuft auf http://localhost:3000
```

Das Backend ist dann erreichbar unter:

```text
http://localhost:3000
```

Zum Testen kann diese Adresse im Browser geöffnet werden.

Die Antwort sollte ungefähr so aussehen:

```json
{
  "message": "Scrum Poker Server läuft"
}
```

Das Terminal mit dem Backend muss geöffnet bleiben.

---

## 10. Frontend installieren

Für das Frontend muss ein zweites Terminal geöffnet werden.

Das Terminal mit dem Backend bleibt weiterhin geöffnet.

Im zweiten Terminal in den Projektordner wechseln und danach in den Client-Ordner:

```bash
cd scrum-poker-app
cd client
```

Danach die Abhängigkeiten installieren:

```bash
pnpm install
```

Auch hier werden die benötigten Pakete aus der `package.json` installiert.

---

## 11. Frontend starten

Im Ordner `client` folgenden Befehl ausführen:

```bash
pnpm dev
```

Vite zeigt danach eine lokale Adresse an.

Normalerweise ist das:

```text
http://localhost:5173
```

Diese Adresse im Browser öffnen.

Die Scrum Poker App sollte nun sichtbar sein.

---

## 12. Frontend und Backend gleichzeitig starten

Für die App müssen Frontend und Backend gleichzeitig laufen.

### Terminal 1

Im Ordner:

```text
server
```

starten:

```bash
pnpm dev
```

Das Backend läuft normalerweise unter:

```text
http://localhost:3000
```

### Terminal 2

Im Ordner:

```text
client
```

starten:

```bash
pnpm dev
```

Das Frontend läuft normalerweise unter:

```text
http://localhost:5173
```

Danach im Browser öffnen:

```text
http://localhost:5173
```

---

## 13. Anwendung testen

Auf der Startseite kann ein Benutzername eingegeben werden.

Danach kann eine neue Session erstellt oder einer bestehenden Session beigetreten werden.

Zum Testen mit mehreren Benutzern können zum Beispiel zwei Browserfenster verwendet werden.

Eine einfache Möglichkeit ist:

```text
Fenster 1:
normales Browserfenster

Fenster 2:
Inkognito-Fenster
```

Alternativ können auch zwei verschiedene Browser verwendet werden.

Zum Beispiel:

```text
Chrome
Firefox
```

---

## 14. Beispiel für einen Test

Benutzer 1 gibt zum Beispiel folgenden Namen ein:

```text
Vincent
```

Danach wird eine neue Session erstellt.

Die URL sieht danach ungefähr so aus:

```text
http://localhost:5173/sessions/ABC123
```

Diese URL kann in einem zweiten Browserfenster geöffnet werden.

Benutzer 2 kann danach ebenfalls mit einem Namen beitreten.

Zum Beispiel:

```text
Anna
```

Danach sollten beide Teilnehmer in der gleichen Session sichtbar sein.

---

## 15. Voting testen

Ein Teilnehmer kann eine Karte auswählen.

Zum Beispiel:

```text
5
```

Solange die Karten noch nicht aufgedeckt wurden, sehen die anderen Teilnehmer nur, dass bereits abgestimmt wurde.

Der genaue Wert bleibt verdeckt.

Nach dem Reveal werden die Stimmen sichtbar.

---

## 16. Reset testen

Nach dem Aufdecken kann die Runde zurückgesetzt werden.

Beim Reset werden die abgegebenen Stimmen gelöscht und die Karten wieder verdeckt.

Danach kann eine neue Schätzrunde gestartet werden.

---

## 17. Deck wechseln

Die App unterstützt verschiedene Schätzskalen.

Zum Beispiel:

### Fibonacci

```text
1
2
3
5
8
13
21
```

### T-Shirt-Sizes

```text
XS
S
M
L
XL
```

Das aktive Deck wird auf dem Server gespeichert und gilt dadurch für alle Teilnehmer der Session.

---

## 18. Projekt stoppen

Frontend und Backend können jeweils mit folgender Tastenkombination gestoppt werden:

```text
Ctrl + C
```

Falls im Terminal eine Bestätigung verlangt wird, kann diese mit `Y` bestätigt werden.

---

## 19. Projekt später erneut starten

Die Pakete müssen normalerweise nicht jedes Mal neu installiert werden.

Beim nächsten Start reicht es, Backend und Frontend wieder zu starten.

### Backend

```bash
cd scrum-poker-app/server
pnpm dev
```

### Frontend

In einem zweiten Terminal:

```bash
cd scrum-poker-app/client
pnpm dev
```

Danach wieder im Browser öffnen:

```text
http://localhost:5173
```

---

## 20. Änderungen von GitHub herunterladen

Falls Änderungen von anderen Gruppenmitgliedern auf GitHub hochgeladen wurden, kann das lokale Projekt aktualisiert werden.

Dazu im Hauptordner des Projekts:

```bash
git pull
```

Falls sich eine `package.json` geändert hat, sollte im entsprechenden Ordner zusätzlich nochmals ausgeführt werden:

```bash
pnpm install
```

---

## 21. Eigene Änderungen auf GitHub hochladen

Zuerst in den Hauptordner des Projekts wechseln.

Danach prüfen:

```bash
git status
```

Änderungen hinzufügen:

```bash
git add .
```

Commit erstellen:

```bash
git commit -m "Beschreibung der Änderung"
```

Beispiel:

```bash
git commit -m "Add voting functionality"
```

Danach die Änderungen auf GitHub hochladen:

```bash
git push
```

---

## 22. Git-Status prüfen

Mit folgendem Befehl kann jederzeit geprüft werden, welche Dateien verändert wurden:

```bash
git status
```

Wenn keine offenen Änderungen vorhanden sind, erscheint ungefähr:

```text
nothing to commit, working tree clean
```

---

## 23. node_modules nicht auf GitHub speichern

Die Ordner `node_modules` sollen nicht auf GitHub hochgeladen werden.

Sie können jederzeit mit:

```bash
pnpm install
```

neu erstellt werden.

In der `.gitignore` sollte deshalb mindestens Folgendes stehen:

```gitignore
node_modules/
dist/
.env
```

---

## 24. Häufige Fehler

### pnpm wird nicht erkannt

Falls folgende Meldung erscheint:

```text
pnpm is not recognized
```

kann pnpm installiert werden mit:

```bash
npm install -g pnpm
```

Danach das Terminal neu öffnen.

---

### Git wird nicht erkannt

Falls Git nicht erkannt wird, muss Git installiert werden.

Download:

https://git-scm.com/

Danach das Terminal neu öffnen.

---

### Backend ist nicht erreichbar

Prüfen, ob im Server-Ordner folgender Befehl läuft:

```bash
pnpm dev
```

Das Backend sollte unter folgender Adresse erreichbar sein:

```text
http://localhost:3000
```

---

### Frontend ist nicht erreichbar

Prüfen, ob im Client-Ordner folgender Befehl läuft:

```bash
pnpm dev
```

Die genaue Adresse wird von Vite im Terminal angezeigt.

Normalerweise:

```text
http://localhost:5173
```

---

### Port 5173 ist bereits belegt

Falls Port 5173 bereits verwendet wird, kann Vite automatisch einen anderen Port wählen.

Zum Beispiel:

```text
http://localhost:5174
```

In diesem Fall immer die Adresse verwenden, die im Terminal angezeigt wird.

---

### Port 3000 ist bereits belegt

Falls das Backend nicht startet, läuft möglicherweise bereits ein anderer Prozess auf Port 3000.

In diesem Fall zuerst andere Server-Prozesse oder alte Terminals beenden und danach nochmals starten:

```bash
pnpm dev
```

---

### Leere Seite im Browser

Falls nur eine leere Seite angezeigt wird, kann die Browser-Konsole geöffnet werden.

Unter Windows zum Beispiel mit:

```text
F12
```

Danach den Tab:

```text
Console
```

öffnen.

Dort werden mögliche JavaScript-Fehler angezeigt.

---

### Session nicht gefunden

Die Sessions werden nur im Arbeitsspeicher des Servers gespeichert.

Wenn das Backend neu gestartet wird, werden alle bestehenden Sessions gelöscht.

Danach muss eine neue Session erstellt werden.

Das ist in diesem Projekt so vorgesehen.

---

## 25. API manuell testen

Optional kann die API mit der VS-Code-Erweiterung `REST Client` getestet werden.

Dafür kann die Datei:

```text
server/test.http
```

verwendet werden.

Beispiel zum Erstellen einer Session:

```http
POST http://localhost:3000/sessions
```

Beispiel zum Abrufen aller Sessions:

```http
GET http://localhost:3000/sessions
```

Beispiel zum Abrufen einer bestimmten Session:

```http
GET http://localhost:3000/sessions/ABC123
```

Die Session-ID `ABC123` muss dabei durch eine tatsächlich existierende Session-ID ersetzt werden.

---

## 26. Kurzfassung für die Installation

Repository herunterladen:

```bash
git clone https://github.com/USERNAME/scrum-poker-app.git
cd scrum-poker-app
```

Backend installieren:

```bash
cd server
pnpm install
pnpm dev
```

Danach ein zweites Terminal öffnen.

Frontend installieren:

```bash
cd scrum-poker-app/client
pnpm install
pnpm dev
```

Danach im Browser öffnen:

```text
http://localhost:5173
```

---

## 27. Kurzfassung für spätere Starts

Backend:

```bash
cd scrum-poker-app/server
pnpm dev
```

Frontend:

```bash
cd scrum-poker-app/client
pnpm dev
```

Danach:

```text
http://localhost:5173
```

---

## 28. Kurzfassung für GitHub

Neue Änderungen herunterladen:

```bash
git pull
```

Eigene Änderungen hochladen:

```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
```

---

## 29. Fertig

Wenn das Backend unter:

```text
http://localhost:3000
```

läuft und das Frontend unter:

```text
http://localhost:5173
```

erreichbar ist, ist das Projekt erfolgreich eingerichtet und kann verwendet werden.
