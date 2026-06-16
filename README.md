# ZDiTM Departures Card

Karta Lovelace dla Home Assistant pokazująca odjazdy autobusów i tramwajów
ZDiTM Szczecin na żywo. Dane: [ZDiTM Szczecin API](https://www.zditm.szczecin.pl) (CC0).

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
| `tram_lines` | 1–12 | Nadpisanie klasyfikacji tramwaj/autobus |
| `flip_clock_secs` | `10` | Ile sekund pokazywać godzinę przy przełączaniu |
| `flip_rel_secs` | `5` | Ile sekund pokazywać „za X min" przy przełączaniu |

Czas każdego odjazdu przełącza się automatycznie między godziną a „za ile minut".
