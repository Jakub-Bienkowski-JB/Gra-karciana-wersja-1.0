# Gra karciana wersja 1.0

Prototyp przeglądarkowej gry karcianej 1v1.

Aktualna wersja działa jako lokalne 1v1 na jednym ekranie:

- budowanie talii 12 kart podstawowych + 3 dodatkowe,
- szybki start z gotowymi taliami testowymi,
- opcjonalny bot grający jako Gracz B,
- wyszukiwarka, filtrowanie i sortowanie kart w builderze,
- podgląd aktualnej talii gracza,
- maksymalnie 4 partie w meczu,
- 3 lokacje po 4 miejsca,
- wybór jednej karty dodatkowej do talii podstawowej między partiami,
- podgląd zagrania i podświetlanie legalnych celów,
- tury, dobieranie, cmentarz i efekty kart,
- zapis aktywnego meczu i talii w `localStorage`,
- zoptymalizowane grafiki kart z folderu `ikony-opt`.

## Uruchomienie lokalne

Projekt używa modułów ES, więc uruchamiaj go przez prosty serwer HTTP:

```powershell
python -m http.server 8765
```

Potem wejdź na:

```text
http://127.0.0.1:8765
```

## Skrypty developerskie

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run assets:optimize
```

- `test` uruchamia testy logiki gry przez wbudowany `node:test`.
- `check` sprawdza składnię głównego modułu aplikacji.
- `assets:optimize` odtwarza lekkie kopie grafik w `ikony-opt` na podstawie plików PNG z `ikony`.

## Struktura

- `app.js` - warstwa aplikacji, renderowanie i przepływ rozgrywki.
- `src/cards.js` - definicje kart, tokenów, grafik i etykiet.
- `src/rules.js` - czyste reguły możliwe do testowania bez DOM.
- `src/effects.js` - słowa kluczowe i rejestr mechanik kart.
- `test/` - testy reguł i rejestru efektów.
- `ikony/` - oryginalne grafiki PNG.
- `ikony-opt/` - skompresowane grafiki używane przez aplikację.

## Wersja online

Projekt jest statyczny, więc może działać na GitHub Pages, Netlify albo Cloudflare Pages.

Obecna wersja nie ma jeszcze prawdziwego multiplayera online przez internet. Dwóch graczy gra lokalnie na jednym ekranie.
