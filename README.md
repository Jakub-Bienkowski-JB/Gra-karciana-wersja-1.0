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
- grafiki kart z folderu `ikony`.

## Uruchomienie lokalne

Otwórz `index.html` w przeglądarce albo uruchom prosty serwer:

```powershell
python -m http.server 8765
```

Potem wejdź na:

```text
http://127.0.0.1:8765
```

## Wersja online

Projekt jest statyczny, więc może działać na GitHub Pages, Netlify albo Cloudflare Pages.

Uwaga: obecna wersja nie ma jeszcze prawdziwego multiplayera online przez internet. Dwóch graczy gra lokalnie na jednym ekranie.
