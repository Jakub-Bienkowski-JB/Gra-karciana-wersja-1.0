# Tratatata

Prototyp przeglądarkowej gry karcianej 1v1.

Aktualna wersja działa jako lokalne 1v1 na jednym ekranie:

- budowanie talii 12 kart podstawowych + 3 dodatkowe,
- maksymalnie 4 partie w meczu,
- 3 lokacje po 4 miejsca,
- tury, dobieranie, cmentarz i efekty kart,
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
