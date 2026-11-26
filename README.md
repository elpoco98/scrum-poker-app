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
├── server/                (bereitgestellte Server-Vorlage der HWZ)
│   ├── src/
│   │   ├── routes/
│   │   │   └── sessions.ts
│   │   ├── decks.ts
│   │   ├── server.ts
│   │   ├── store.ts
│   │   ├── types.ts
│   │   └── views.ts
│   ├── package.json
│   ├── README.md
│   ├── requests.http
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
4. Das Frontend sendet `POST /api/sessions/:id/participants` mit dem Namen.
5. Die Teilnehmer-ID aus der Antwort wird im State gehalten.
6. Die Session wird vom Server geladen.

Danach läuft alle drei Sekunden ein Polling:

1. Die aktuelle Session wird mit `GET /api/sessions/:id` neu geladen.
2. Änderungen anderer Teilnehmer erscheinen dadurch im eigenen Browser.

Weil der Server die Stimmen bis zum Aufdecken verdeckt (auch die eigene), merkt sich die Seite die eigene gewählte Karte im State `myVote`. Ein zweiter Klick auf die gewählte Karte nimmt sie zurück (`vote: null`).

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

Alle Requests gehen an den relativen Pfad `/api`. Der Vite-Proxy leitet sie an den Express-Server auf Port 3000 weiter.

Die kleine Hilfsfunktion `request<T>()` prüft, ob der Server mit einem erfolgreichen HTTP-Status antwortet. Bei einem Fehler wird die Meldung aus `{ "error": "..." }` als Fehler geworfen. Antworten mit Status 204 haben keinen Body und werden deshalb nicht als JSON gelesen.

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

Das Backend ist die von der HWZ bereitgestellte Server-Vorlage (Express 5 + TypeScript). Node 24 führt die `.ts`-Dateien direkt aus, einen Build-Schritt gibt es nicht. Details stehen zusätzlich in `server/README.md`.

### `server/src/server.ts`

Startet Express auf Port 3000, hängt alle Routen unter `/api` ein und enthält einen 404- und einen Fehler-Handler. Fehler kommen immer als JSON `{ "error": "..." }` zurück.

CORS wird nicht benötigt: Im Entwicklungsmodus leitet der Vite-Proxy (`client/vite.config.ts`) alle Requests auf `/api` an `http://localhost:3000` weiter. Für den Browser liegen Frontend und Backend dadurch auf demselben Origin.

### `server/src/types.ts`

Trennt zwei Arten von Types:

- **Domain-Types** (`Participant`, `Session`): So speichert der Server die Daten.
- **Antwort-Types / DTOs** (`ParticipantView`, `SessionView`, `SessionSummary`, `ErrorResponse`): So sieht der Client die Daten.

`ParticipantView` enthält zusätzlich `hasVoted`. Die Frontend-Types in `client/src/types/index.ts` entsprechen diesen Antwort-Types.

### `server/src/store.ts`

Hier befindet sich der zentrale In-Memory-Speicher:

```ts
const sessions = new Map<string, Session>()
```

Der Schlüssel ist die Session-ID (eine UUID). Dazu kommen kleine Helfer wie `createSession()`, `addParticipant()`, `findParticipantByName()` oder `clearVotes()`.

Eine Datenbank wird bewusst nicht verwendet. Wird der Server neu gestartet, gehen alle Sessions verloren.

### `server/src/decks.ts`

Enthält die Karten der beiden Decks und die Funktion `isDeckId()`, die prüft, ob ein Wert aus dem Request-Body ein gültiges Deck ist.

### `server/src/views.ts`

Wandelt gespeicherte Daten in Antworten um. Hier werden die Stimmen verdeckt, solange die Runde nicht aufgedeckt ist.

### `server/src/routes/sessions.ts`

Enthält alle API-Routen.

## 4. API-Übersicht

Alle Pfade beginnen mit `/api`.

| Methode | Route | Body | Antwort | Fehler |
| --- | --- | --- | --- | --- |
| GET | `/sessions` | – | 200 `SessionSummary[]` | – |
| POST | `/sessions` | – | 201 `SessionView` | – |
| GET | `/sessions/:sessionId` | – | 200 `SessionView` | 404 |
| DELETE | `/sessions/:sessionId` | – | 204 | 404 |
| POST | `/sessions/:sessionId/participants` | `{ "name": "…" }` | 201 neu / 200 bekannt | 400, 404 |
| DELETE | `/sessions/:sessionId/participants/:participantId` | – | 204 | 404 |
| PUT | `/sessions/:sessionId/participants/:participantId/vote` | `{ "vote": "5" }` oder `{ "vote": null }` | 200 `ParticipantView` | 400, 404, 409 |
| PUT | `/sessions/:sessionId/revealed` | `{ "revealed": true }` / `false` | 200 `SessionView` | 400, 404 |
| PUT | `/sessions/:sessionId/deck` | `{ "deck": "tshirt" }` | 200 `SessionView` | 400, 404 |

Welche Funktion in `client/src/api.ts` welche Route aufruft:

| Funktion | Route |
| --- | --- |
| `getSessions()` | `GET /api/sessions` |
| `createSession()` | `POST /api/sessions` |
| `getSession()` | `GET /api/sessions/:sessionId` |
| `deleteSession()` | `DELETE /api/sessions/:sessionId` |
| `joinSession()` | `POST /api/sessions/:sessionId/participants` |
| `leaveSession()` | `DELETE /api/sessions/:sessionId/participants/:participantId` |
| `vote()` | `PUT /api/sessions/:sessionId/participants/:participantId/vote` |
| `reveal()` / `reset()` | `PUT /api/sessions/:sessionId/revealed` mit `true` / `false` |
| `changeDeck()` | `PUT /api/sessions/:sessionId/deck` |

## 5. Session erstellen

Bei `POST /api/sessions` erzeugt der Server mit `crypto.randomUUID()` eine eindeutige ID. Die ID wird vom Server erzeugt, nicht vom Client.

Eine neue Session startet mit:

```text
participants = []
deck = fibonacci
revealed = false
```

Danach wird die Session in der `Map` gespeichert.

## 6. Beitreten

`POST /api/sessions/:sessionId/participants` erwartet einen Namen.

Beitreten ist **idempotent**: Der Name ist der Schlüssel. Tritt jemand mit einem Namen bei, der schon am Tisch sitzt, liefert der Server denselben Teilnehmer zurück (200 statt 201). Dadurch entstehen bei einem Reload keine doppelten Teilnehmer. Verglichen wird exakt (`Anna` und `anna` sind zwei Personen), Leerzeichen am Anfang und Ende werden entfernt.

## 7. Voting

Bei `PUT /api/sessions/:sessionId/participants/:participantId/vote` sendet das Frontend:

```json
{
  "vote": "5"
}
```

Mit `{ "vote": null }` wird die Karte zurückgenommen. PUT, weil der Client den ganzen Wert der Ressource «vote» ersetzt.

Der Server prüft, ob die Karte zum aktiven Deck gehört (sonst 400). Nach dem Aufdecken ist Abstimmen gesperrt (409), bis eine neue Runde startet.

Fibonacci:

```text
0, 1, 2, 3, 5, 8, 13, 21, ?
```

T-Shirt-Grössen:

```text
XS, S, M, L, XL
```

## 8. Verdeckte Karten

Solange eine Runde nicht aufgedeckt ist, schickt der Server die Stimmen **nicht** mit. Sonst könnte jeder die Karten der anderen im DevTools-Tab «Network» lesen. Das Feld `hasVoted` verrät nur, ob jemand abgestimmt hat.

Ein Teilnehmer mit `hasVoted === true` wird vor dem Reveal nur als `Karte gewählt` dargestellt. Erst wenn `session.revealed === true` ist, liefert der Server `vote` mit und `ParticipantCard` zeigt den tatsächlichen Wert.

Auch die eigene Karte kommt erst nach dem Aufdecken vom Server. Welche Karte man gewählt hat, merkt sich deshalb das Frontend (`myVote` in `SessionPage.tsx`).

## 9. Reveal und Auswertung

Mit `PUT /api/sessions/:sessionId/revealed` und `{ "revealed": true }` deckt der Server auf.

Die Auswertung wird danach im Frontend berechnet.

### Fibonacci

Bei numerischen Fibonacci-Werten wird der Durchschnitt berechnet. Die Karte `?` fliesst nicht in den Durchschnitt ein.

Beispiel:

```text
3, 5, 8, ?
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

Haben alle Teilnehmer abgestimmt und sind alle Stimmen gleich, zeigt die App statt des normalen Ergebnisses:

```text
Alle sind sich einig: <Wert>
```

## 10. Neue Runde (Reset)

`PUT /api/sessions/:sessionId/revealed` mit `{ "revealed": false }` startet eine neue Runde. Der Server setzt dabei:

```text
revealed = false
```

und jede Stimme auf:

```text
vote = null
```

Danach kann die nächste Runde beginnen.

## 11. Deck-Wechsel

Jeder Teilnehmer kann zwischen Fibonacci und T-Shirt wechseln (`PUT /api/sessions/:sessionId/deck`).

Das aktive Deck liegt im Session-State auf dem Server und ist deshalb für alle Teilnehmer gleich.

Ein Wechsel startet immer eine neue, verdeckte Runde, weil die alten Karten nicht zum neuen Deck passen (`8` gibt es bei T-Shirts nicht).

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

Der bereitgestellte Server kennt keinen Heartbeat. Teilnehmer werden nur entfernt, wenn der Client `DELETE /api/sessions/:sessionId/participants/:participantId` sendet. Das Frontend sendet diesen Request deshalb in drei Situationen:

1. Klick auf `Session verlassen`.
2. Wechsel auf eine andere Seite innerhalb der App (Cleanup-Funktion von `useEffect`).
3. Schliessen oder Neuladen des Tabs (Event `pagehide`).

Damit der Request beim Schliessen des Tabs noch beim Server ankommt, wird `fetch` mit der Option `keepalive: true` aufgerufen.

Nach einem Reload tritt der Browser automatisch wieder mit demselben Namen bei. Fällt das Netzwerk komplett aus, kann der Leave-Request nicht gesendet werden. Dieser Fall wird vom Server nicht behandelt.

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
3. Spätestens nach dem nächsten Polling (ca. 3 Sekunden) muss der Teilnehmer beim anderen Browser verschwinden.

## 18. `server/requests.http`

Die Datei `server/requests.http` enthält Beispiel-Requests für alle Routen, mit denen die API direkt getestet werden kann.

Dafür kann in VS Code zum Beispiel die Erweiterung `REST Client` verwendet werden.

IDs müssen nicht kopiert werden: Zuerst «Create session» und «Join session» ausführen, die übrigen Requests verwenden die IDs danach automatisch.

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
- wie Karteileichen ohne Heartbeat vermieden werden (Leave bei Unmount und `pagehide`),
- warum Votes per `PUT` und Teilnehmer per `POST` / `DELETE` angesprochen werden und welche Status-Codes zurückkommen,
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
