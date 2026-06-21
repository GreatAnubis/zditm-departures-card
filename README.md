# ZDiTM Departures Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz)
[![Release](https://img.shields.io/github/v/release/GreatAnubis/zditm-departures-card)](https://github.com/GreatAnubis/zditm-departures-card/releases)

Karta Lovelace dla Home Assistant pokazująca **odjazdy autobusów i tramwajów ZDiTM Szczecin na żywo** —
za ile minut następny i kilka kolejnych, z kolorami wg typu linii.
Dane: [ZDiTM Szczecin API](https://www.zditm.szczecin.pl) (CC0).

![Podgląd karty](images/screenshot.jpg)

## Funkcje

- ⏱️ Odjazdy na żywo (GPS): „za X min" / „teraz", z fallbackiem na rozkład
- 🔄 Czas przełącza się automatycznie między godziną a „za ile minut"
- 🟢 Kolory plakietek wg typu linii (tramwaj / autobus / pośpieszny / nocny / zastępczy)
- 🔎 Wyszukiwarka przystanku w edytorze z podglądem kierunku na żywo
- 🎛️ Filtr linii i kierunku, tryby `list` / `compact`, konfigurowalne odświeżanie
- 🎨 Dopasowuje się do motywu Home Assistant

## Instalacja (HACS)

1. HACS → Frontend → menu (⋮) → **Custom repositories** → dodaj URL repo, typ **Dashboard/Plugin**.
2. Zainstaluj „ZDiTM Departures Card".
3. (Jeśli nie doda się samo) Ustawienia → Dashboardy → Zasoby → dodaj
   `/hacsfiles/zditm-departures-card/zditm-departures-card.js` jako **JavaScript Module**.

## Konfiguracja

Dodaj kartę przez UI („Dodaj kartę" → ZDiTM Departures) lub w YAML:

```yaml
type: custom:zditm-departures-card
stop: "10111"        # numer słupka (wyszukasz w edytorze po nazwie)
lines: [75, 521]     # opcjonalnie: filtr linii (puste = wszystkie)
mode: list           # list | compact
count: 3             # ile odjazdów (tryb list)
```

| Pole | Domyślnie | Opis |
|------|-----------|------|
| `stop` | — (wymagane) | Numer słupka |
| `title` | nazwa z API | Nagłówek karty |
| `lines` | wszystkie | Filtr linii |
| `directions` | wszystkie | Filtr kierunku (fragment nazwy) |
| `mode` | `list` | `list` lub `compact` |
| `count` | `3` | Liczba odjazdów (tryb list) |
| `refresh` | `30` | Sekundy między odświeżeniami (min 20) |
| `show_header` | `true` | Pokaż nagłówek |
| `tram_lines` | 1–11 | Nadpisanie klasyfikacji tramwaj/autobus |
| `flip_clock_secs` | `10` | Ile sekund pokazywać godzinę przy przełączaniu |
| `flip_rel_secs` | `5` | Ile sekund pokazywać „za X min" przy przełączaniu |

## Kolory linii

Kolor plakietki wynika z typu linii pobranego z API ZDiTM (`/lines`):

- 🟢 tramwaj (1–11)
- 🔵 autobus zwykły
- 🔴 pośpieszny (A, B, C)
- ⬛ nocny (5xx)
- 🟠 zastępczy (8xx)

Czas każdego odjazdu przełącza się automatycznie między godziną a „za ile minut".
