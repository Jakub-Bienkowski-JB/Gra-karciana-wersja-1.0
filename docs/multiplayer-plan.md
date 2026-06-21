# Plan multiplayera online

Cel: umożliwić grę dwóch osób z różnych komputerów bez przepisywania całej gry od zera.

## Główna decyzja

Multiplayer powinien być oparty o akcje, nie o synchronizowanie HTML-a ani kliknięć UI.

Przykład akcji:

```json
{
  "type": "play_card",
  "player": 0,
  "cardUid": 12,
  "targetPlayer": 0,
  "loc": 1
}
```

Klient wysyła zamiar gracza do serwera. Serwer sprawdza, czy akcja jest legalna, aktualizuje stan gry i odsyła nowy stan albo zaakceptowaną akcję do obu graczy.

## Architektura docelowa

- `src/game-engine.js` - czysty silnik reguł, używany przez klienta i serwer.
- Klient przeglądarkowy - renderuje stan gry i wysyła akcje.
- Serwer Node.js - przechowuje autorytatywny stan pokoju.
- WebSocket - komunikacja na żywo między klientami i serwerem.
- Replay `game.actions` - historia zaakceptowanych akcji, przydatna do debugowania, reconnectu i powtórek.

## Dlaczego serwer musi być autorytatywny

Nie można ufać klientowi. Gracz mógłby zmienić kod w przeglądarce i wysłać nielegalną akcję. Serwer musi sprawdzać między innymi:

- czy to tura danego gracza,
- czy karta jest faktycznie w ręce,
- czy karta może być zagrana przy aktualnym progu,
- czy lokacja ma miejsce,
- czy wybór celu jest legalny,
- czy gracz ma jeszcze dostępne zagrania.

## Proponowane komunikaty WebSocket

Klient do serwera:

```json
{ "type": "create_room" }
{ "type": "join_room", "roomId": "ABCD" }
{ "type": "submit_action", "roomId": "ABCD", "action": { "type": "end_turn" } }
```

Serwer do klienta:

```json
{ "type": "room_created", "roomId": "ABCD", "player": 0 }
{ "type": "state", "state": {} }
{ "type": "action_accepted", "action": {} }
{ "type": "action_rejected", "reason": "not_your_turn" }
```

## Etapy wdrożenia

1. Wyciągnąć więcej reguł z `app.js` do `src/game-engine.js`.
2. Zamienić lokalne kliknięcia na tworzenie akcji: `play_card`, `end_turn`, `choose_option`.
3. Dodać walidator akcji w silniku.
4. Dodać prosty serwer Node.js z pokojami w pamięci.
5. Dodać WebSocket i synchronizację stanu.
6. Dodać reconnect przez odtworzenie `game.actions`.
7. Dopiero potem dodać konta, ranking, matchmaking albo trwały zapis.

## Minimalny pierwszy multiplayer

Najprostsza działająca wersja:

- jeden serwer Node.js,
- pokoje z kodem 4-6 znaków,
- dwóch graczy,
- brak kont,
- stan trzymany w pamięci serwera,
- po odświeżeniu gracz może wrócić przez `roomId` i `playerToken`,
- obserwatorzy opcjonalnie później.

## Obecny MVP

Aktualnie dodany MVP używa lokalnego serwera HTTP/WebSocket i pokojów w pamięci procesu. Serwer synchronizuje zaakceptowany stan gry między dwoma klientami, sprawdza gracza w pokoju, turę, stan początkowy oraz podstawową legalność akcji `play_card`, `end_turn`, `finish_round` i `finish_match`. Frontend dodatkowo blokuje sterowanie graczowi, którego tura aktualnie nie trwa.

To wystarcza do gry ze znajomym przez Cloudflare Quick Tunnel, ale nie jest jeszcze pełnym serwerem autorytatywnym dla wszystkich efektów kart. Kolejny krok to przeniesienie modalnych wyborów kart (`choose_option`) i rozpatrywania efektów na serwer, tak aby serwer sam wyliczał cały nowy stan po każdej akcji.

## Hosting

Dobre opcje na start:

- Render albo Fly.io dla serwera WebSocket,
- Netlify / GitHub Pages / Cloudflare Pages dla statycznego frontendu,
- później jedna aplikacja full-stack, jeśli projekt urośnie.

GitHub Pages sam nie wystarczy do multiplayera, bo hostuje tylko statyczne pliki. Do gry online potrzebny będzie osobny backend WebSocket.
