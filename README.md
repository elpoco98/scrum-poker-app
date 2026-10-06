# Scrum Poker App

Eine bewusst einfach aufgebaute Full-Stack-Webanwendung für Planning Poker. Das Projekt besteht aus einem React-/TypeScript-Frontend und einem Node.js-/Express-Backend.

Der Fokus dieses Projekts liegt auf verständlichem Code. Deshalb werden keine zusätzlichen State-Management-Bibliotheken, keine Datenbank und keine WebSockets verwendet. Gemeinsame Session-Daten liegen im Express-Server und werden vom Frontend regelmässig per Polling abgefragt.

## 1. Projektstruktur

```text
scrum-poker-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ParticipantCard.tsx
│   │   │   └── PokerCard.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── SessionPage.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── sessions.ts
│   │   └── types.ts
│   ├── package.json
│   ├── test.http
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## 2. Frontend

### `client/src/main.tsx`

Dies ist der Einstiegspunkt des React-Frontends. Die Datei sucht das HTML-Element mit der ID `root` und rendert dort die `App`-Komponente.

### `client/src/App.tsx`

Hier befindet sich das Routing mit React Router.

Es gibt drei Routen:

- `/` zeigt die Home-Seite.
- `/sessions/:sessionId` zeigt eine bestimmte Poker-Session.
- `*` fängt alle unbekannten URLs ab und zeigt die 404-Seite.

Die Session-ID ist deshalb Bestandteil der URL und kann geteilt oder als Bookmark gespeichert werden.

### `client/src/pages/HomePage.tsx`

Die Home-Seite ist der Einstieg in die App.

Sie übernimmt folgende Aufgaben:

1. Benutzername eingeben.
2. Benutzername direkt in `localStorage` speichern.
3. Offene Sessions vom Server laden.
4. Die Session-Liste alle drei Sekunden aktualisieren.
5. Eine neue Session erstellen.
6. Einer bestehenden Session beitreten.
7. Eine Session löschen.
8. Lade- und Fehlerzustände anzeigen.

Der Benutzername wird unter dem Schlüssel `username` gespeichert. Dadurch bleibt er nach einem Browser-Reload vorhanden.

Beim Erstellen einer Session sendet die Home-Seite einen `POST /sessions` Request. Danach navigiert sie mit `useNavigate()` zu `/sessions/<id>`.

### `client/src/pages/SessionPage.tsx`

Diese Seite enthält den grössten Teil der Spiellogik.

Beim Öffnen passiert Folgendes:

1. `useParams()` liest die `sessionId` aus der URL.
2. Der Benutzername wird aus `localStorage` gelesen.
3. Falls noch kein Name gespeichert ist, kann er direkt auf der Session-Seite eingegeben werden. Dadurch funktioniert auch ein erstmals geöffneter geteilter Link.
4. Das Frontend sendet `POST /sessions/:id/join`.
5. Die Teilnehmer-ID wird unter `participantId:<sessionId>` in `localStorage` gespeichert.
6. Die Session wird vom Server geladen.

Danach läuft alle drei Sekunden ein Polling:

1. Ein Heartbeat wird gesendet.
2. Die aktuelle Session wird neu geladen.
3. Änderungen anderer Teilnehmer erscheinen dadurch im eigenen Browser.

Die Seite kann ausserdem:

- Karten auswählen,
- das Deck wechseln,
- Karten aufdecken,
- eine Runde zurücksetzen,
- die Session verlassen.

Beim Verlassen der Komponente wird ebenfalls versucht, den Teilnehmer serverseitig aus der Session zu entfernen.

### `client/src/components/PokerCard.tsx`

Diese Komponente stellt genau eine auswählbare Pokerkarte dar.

Sie bekommt nur einfache Props:

- `value`: angezeigter Kartenwert,
- `selected`: ob diese Karte aktuell gewählt ist,
- `disabled`: ob sie anklickbar ist,
- `onClick`: Funktion für einen Klick.

Die Komponente kennt weder die Session noch die API. Dadurch bleibt sie klein und leicht verständlich.

### `client/src/components/ParticipantCard.tsx`

Diese Komponente zeigt einen Teilnehmer am Pokertisch.

Vor dem Reveal wird nur angezeigt, ob bereits eine Karte gewählt wurde. Der eigentliche Wert bleibt verdeckt.

Nach dem Reveal wird der gewählte Wert angezeigt.

### `client/src/api.ts`

In dieser Datei befinden sich alle HTTP-Aufrufe zum Backend.

Dadurch muss nicht jede React-Komponente selbst lange `fetch()`-Aufrufe enthalten.

Die kleine Hilfsfunktion `request<T>()` prüft, ob der Server mit einem erfolgreichen HTTP-Status antwortet. Bei einem Fehler wird eine verständliche Fehlermeldung geworfen.

### `client/src/types/index.ts`

Hier liegen die TypeScript-Typen des Frontends:

- `DeckType`
- `Participant`
- `Session`
- `SessionSummary`

Dadurch ist klar definiert, welche Daten das Backend liefert.

### `client/src/index.css`

Diese Datei enthält das gesamte Styling.

Das Layout verwendet Flexbox und CSS Grid. Durch `auto-fit`, `minmax()` und einen Media Query funktioniert die Oberfläche auch auf kleineren Bildschirmen.

## 3. Backend

### `server/src/types.ts`

Hier werden die wichtigsten Datenstrukturen definiert.

`Participant` enthält:

- `id`
- `name`
- `vote`
- `lastSeen`

`Session` enthält:

- `id`
- `participants`
- `deck`
- `revealed`

`DeckType` kann nur `fibonacci` oder `tshirt` sein.

### `server/src/sessions.ts`

Hier befindet sich der zentrale In-Memory-Speicher:

```ts
export const sessions = new Map<string, Session>();
```

Der Schlüssel ist die Session-ID. Der Wert ist die vollständige Session.

Eine Datenbank wird bewusst nicht verwendet. Wird der Server neu gestartet, gehen deshalb alle Sessions verloren.

Die Datei enthält ausserdem die Funktion `removeInactiveParticipants()`.

Teilnehmer, deren letzter Heartbeat länger als 15 Sekunden zurückliegt, werden entfernt. Damit werden sogenannte Karteileichen verhindert, wenn jemand zum Beispiel den Browser schliesst oder die Internetverbindung verliert.

### `server/src/index.ts`

Diese Datei startet Express und enthält die API-Routen.

## 4. API-Übersicht

| Methode | Route | Aufgabe |
| --- | --- | --- |
| GET | `/` | Prüft, ob der Server läuft |
| GET | `/sessions` | Gibt alle offenen Sessions und Teilnehmerzahlen zurück |
| GET | `/sessions/:id` | Lädt eine einzelne Session |
| POST | `/sessions` | Erstellt eine neue Session |
| DELETE | `/sessions/:id` | Löscht eine Session |
| POST | `/sessions/:id/join` | Fügt einen Teilnehmer hinzu |
| POST | `/sessions/:id/leave` | Entfernt einen Teilnehmer |
| POST | `/sessions/:id/heartbeat` | Aktualisiert `lastSeen` |
| POST | `/sessions/:id/vote` | Speichert eine Schätzung |
| POST | `/sessions/:id/reveal` | Deckt alle Karten auf |
| POST | `/sessions/:id/reset` | Setzt die Runde zurück |
| PUT | `/sessions/:id/deck` | Wechselt das aktive Deck |

## 5. Session erstellen

Bei `POST /sessions` erzeugt der Server eine kurze zufällige ID.

Eine neue Session startet mit:

```text
participants = []
deck = fibonacci
revealed = false
```

Danach wird die Session in der `Map` gespeichert.

## 6. Beitreten

`POST /sessions/:id/join` erwartet einen Namen.

Optional kann der Client eine bereits gespeicherte Teilnehmer-ID mitsenden. Existiert dieser Teilnehmer noch, wird er wiederverwendet. Das macht Reloads robuster.

Falls noch kein Teilnehmer mit dieser ID existiert, wird ein neuer Teilnehmer angelegt.

## 7. Voting

Bei `POST /sessions/:id/vote` sendet das Frontend:

```json
{
  "participantId": "...",
  "vote": "5"
}
```

Der Server sucht den Teilnehmer und speichert die Stimme in `participant.vote`.

Der Server prüft ausserdem, ob der Vote zum momentan aktiven Deck gehört.

Für Fibonacci sind erlaubt:

```text
1, 2, 3, 5, 8, 13, 21
```

Für T-Shirt-Grössen:

```text
XS, S, M, L, XL
```

## 8. Verdeckte Karten

Die Stimme liegt bereits auf dem Server, wird aber vor dem Reveal im Frontend nicht als Zahl dargestellt.

Ein Teilnehmer mit Vote wird vor dem Reveal nur als `Karte gewählt` dargestellt.

Erst wenn `session.revealed === true` ist, zeigt `ParticipantCard` den tatsächlichen Wert.

## 9. Reveal und Auswertung

Mit `POST /sessions/:id/reveal` setzt der Server:

```text
revealed = true
```

Die Auswertung wird danach im Frontend berechnet.

### Fibonacci

Bei numerischen Fibonacci-Werten wird der Durchschnitt berechnet.

Beispiel:

```text
3, 5, 8
Durchschnitt = 5.3
```

### T-Shirt-Sizes

Für T-Shirt-Grössen wird kein mathematischer Durchschnitt verwendet. Stattdessen zeigt die Anwendung die häufigste Schätzung an.

Beispiel:

```text
S, M, M, L
Häufigste Schätzung = M
```

Diese Variante ist leicht nachvollziehbar und ergibt für nicht-numerische Werte mehr Sinn.

### Einstimmigkeit

Haben alle aktuell verbundenen Teilnehmer abgestimmt und sind alle Stimmen gleich, zeigt die App statt des normalen Ergebnisses:

```text
Alle sind sich einig: <Wert>
```

## 10. Reset

`POST /sessions/:id/reset` setzt:

```text
revealed = false
```

und jede Stimme auf:

```text
vote = null
```

Danach kann die nächste Runde beginnen.

## 11. Deck-Wechsel

Jeder Teilnehmer kann zwischen Fibonacci und T-Shirt wechseln.

Das aktive Deck liegt im Session-State auf dem Server und ist deshalb für alle Teilnehmer gleich.

Beim Deck-Wechsel werden vorhandene Votes gelöscht und `revealed` auf `false` gesetzt. Dadurch bleiben keine Stimmen aus einer anderen Schätzskala bestehen.

## 12. Polling

Das Frontend verwendet bewusst keine WebSockets.

Stattdessen fragt die Session-Seite alle drei Sekunden den aktuellen Session-Zustand ab.

Das Prinzip ist:

```text
Browser A ---> Server
Browser B ---> Server
Browser C ---> Server
```

Jeder Browser erhält dadurch regelmässig den gleichen Session-State.

Beim Unmount wird das Intervall mit `clearInterval()` entfernt.

## 13. Strategie gegen Karteileichen

Ein normaler Leave-Button reicht nicht aus. Wenn ein Browser-Tab geschlossen wird oder das Netzwerk ausfällt, wird die Leave-Anfrage eventuell nie gesendet.

Deshalb verwendet die Anwendung einen Heartbeat.

Alle drei Sekunden sendet der Client:

```text
POST /sessions/:id/heartbeat
```

Der Server speichert dabei:

```text
participant.lastSeen = Date.now()
```

Wenn ein Teilnehmer länger als 15 Sekunden keinen Heartbeat mehr sendet, entfernt der Server ihn automatisch.

Dadurch verschwinden getrennte oder geschlossene Clients nach kurzer Zeit aus der Teilnehmerliste.

## 14. Lade- und Fehlerzustände

Die Home-Seite unterscheidet zwischen:

- initialem Laden,
- Aktualisieren der Session-Liste,
- laufenden Aktionen,
- Fehlern.

Die Session-Seite unterscheidet zwischen:

- Session laden,
- Synchronisieren,
- Benutzeraktion ausführen,
- Fehler.

Wenn der Server nicht erreichbar ist, wirft `api.ts` einen Fehler. Dieser wird in der Oberfläche als Text angezeigt. Die Anwendung soll deshalb nicht mit einem weissen Bildschirm abbrechen.

Auch eine unbekannte Session-ID führt zu einem sichtbaren Fehlerzustand und einem Link zurück zur Startseite.

## 15. Single Source of Truth

Gemeinsame Session-Daten werden nur auf dem Server gespeichert.

Dazu gehören:

- Teilnehmer,
- Votes,
- aktives Deck,
- Reveal-Zustand.

Im Frontend wird die Session als ein Objekt gehalten:

```ts
const [session, setSession] = useState<Session | null>(null);
```

Teilnehmer, Deck und Reveal werden daraus gelesen. Dadurch werden diese Werte nicht mehrfach in verschiedenen States gespeichert.

## 16. Lokale Installation

Voraussetzungen:

- Node.js
- pnpm

### Backend starten

Neues Terminal öffnen:

```bash
cd server
pnpm install
pnpm dev
```

Der Server läuft danach auf:

```text
http://localhost:3000
```

### Frontend starten

Zweites Terminal öffnen:

```bash
cd client
pnpm install
pnpm dev
```

Vite zeigt danach die Frontend-Adresse an. Normalerweise ist das:

```text
http://localhost:5173
```

## 17. Manuelles Testen

### Test 1: Session erstellen

1. Startseite öffnen.
2. Namen eingeben.
3. `Neue Session erstellen` anklicken.
4. Die URL muss danach `/sessions/<id>` enthalten.

### Test 2: Zwei Teilnehmer

1. Session mit Browser A öffnen.
2. Den Session-Link kopieren.
3. In einem zweiten Browser oder Inkognito-Fenster öffnen.
4. Dort einen anderen Benutzernamen verwenden.
5. Beide Teilnehmer müssen nach spätestens einigen Sekunden sichtbar sein.

### Test 3: Verdecktes Voting

1. Browser A wählt `5`.
2. Browser B darf vor dem Reveal nur sehen, dass Browser A gewählt hat.
3. Der Wert `5` darf noch nicht sichtbar sein.

### Test 4: Reveal

1. Mehrere Teilnehmer stimmen ab.
2. `Karten aufdecken` anklicken.
3. Alle tatsächlichen Werte müssen sichtbar werden.
4. Durchschnitt beziehungsweise häufigste T-Shirt-Grösse muss erscheinen.

### Test 5: Einstimmigkeit

1. Alle Teilnehmer wählen denselben Wert.
2. Karten aufdecken.
3. Es muss `Alle sind sich einig` erscheinen.

### Test 6: Reset

1. Runde aufdecken.
2. `Runde zurücksetzen` anklicken.
3. Alle Votes müssen wieder leer sein.
4. Karten können erneut gewählt werden.

### Test 7: Deck-Wechsel

1. Von Fibonacci zu T-Shirt wechseln.
2. Zweiter Browser muss den Wechsel nach spätestens einigen Sekunden ebenfalls sehen.
3. Vorherige Votes müssen gelöscht sein.

### Test 8: Ungültige Session

Eine erfundene URL öffnen:

```text
/sessions/DOESNOTEXIST
```

Die Anwendung muss eine Fehlermeldung und einen Link zur Startseite anzeigen.

### Test 9: Server-Ausfall

1. Anwendung öffnen.
2. Backend stoppen.
3. Die Seite darf nicht weiss werden.
4. Es muss eine sichtbare Fehlermeldung erscheinen.

### Test 10: Karteileiche

1. Mit zwei Browsern einer Session beitreten.
2. Einen Browser komplett schliessen.
3. Nach ungefähr 15 bis 20 Sekunden muss der Teilnehmer beim anderen Browser verschwinden.

## 18. `server/test.http`

Die Datei `server/test.http` enthält Requests, mit denen die API direkt getestet werden kann.

Dafür kann in VS Code zum Beispiel die Erweiterung `REST Client` verwendet werden.

Bei Requests mit Platzhaltern müssen `SESSION_ID` und `PARTICIPANT_ID` durch echte IDs aus vorherigen Antworten ersetzt werden.

## 19. Wichtige Punkte für das Fachgespräch

Jedes Gruppenmitglied sollte erklären können:

- warum der gemeinsame Session-State auf dem Server liegt,
- wie `useState` verwendet wird,
- wie `useEffect` und das Cleanup funktionieren,
- wie `useParams` die Session-ID liest,
- wie `useNavigate` die Seite wechselt,
- wie ein Kartenklick vom React-Event bis zum Express-Server läuft,
- warum Votes vor dem Reveal verdeckt bleiben,
- wie Polling funktioniert,
- wie der Heartbeat Karteileichen entfernt,
- warum TypeScript-Interfaces verwendet werden,
- warum kein `any` nötig ist.

## 20. KI-Einsatz

Dieser Abschnitt muss vor der Abgabe an die tatsächliche Nutzung angepasst werden.

Beispiel:

```text
## KI-Einsatz

Für das Projekt wurde ChatGPT verwendet.

Einsatzgebiete:
- Erklärung von React-, TypeScript- und Express-Konzepten
- Unterstützung beim Aufbau der Projektstruktur
- Unterstützung bei einzelnen API-Routen
- Fehlersuche und Debugging
- Unterstützung bei CSS und Dokumentation

Der generierte oder vorgeschlagene Code wurde von den Gruppenmitgliedern geprüft, angepasst und getestet. Die Gruppenmitglieder können die abgegebenen Programmteile erklären.
```

Es sollte nur angegeben werden, was tatsächlich so gemacht wurde.
