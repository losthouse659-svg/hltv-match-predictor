# 🎯 HLTV Match Predictor

Webová aplikace pro predikci CS2 zápasů na základě statistik z HLTV.

## 🚀 Funkce

- **Automatické načítání budoucích zápasů** - zobrazení nadcházejících CS2 zápasů
- **Predikce výsledků** - algoritmus predikce založený na:
  - Světovém rankingu týmů (30%)
  - Nedávné formě - win rate (25%)
  - Head-to-head bilanci (20%)
  - Síle map poolu (15%)
  - Aktuální sérii výher/proher (10%)
- **Vizuální znázornění** - pravděpodobnost výhry v procentech
- **Filtrování** - podle eventu (turnaje)
- **Řazení** - podle spolehlivosti predikce nebo času zápasu
- **Důvěryhodnost** - značení predikce jako vysoká/střední/nízká spolehlivost
- **Detailní statistiky** - forma týmů, map pool, H2H, série

## 📋 Jak použít

### Online verze

Otevři stránku přímo na GitHub Pages:
```
https://losthouse659-svg.github.io/hltv-match-predictor/
```

### Lokálně

1. Naklonuj repozitář:
```bash
git clone https://github.com/losthouse659-svg/hltv-match-predictor.git
cd hltv-match-predictor
```

2. Otevři `index.html` v prohlížeči

## 🛠️ Technologie

- **HTML5** - struktura stránky
- **CSS3** - moderní dark theme design s gradientem
- **JavaScript (ES6+)** - predikční algoritmus a logika
- **Responsive design** - funguje na mobilu i desktopu

## 📊 Predikční algoritmus

Algoritmus používá vážený průměr těchto faktorů:

```javascript
const weights = {
  ranking: 0.30,      // Ranking týmů na HLTV
  recentForm: 0.25,   // Win rate v posledních zápasech
  headToHead: 0.20,   // Vzájemná bilance
  mapPool: 0.15,      // Síla na mapách
  currentStreak: 0.10 // Aktuální série výher
};
```

Výsledek je normalizován na procenta a predikce je označena stupněm spolehlivosti:
- **Vysoká** - rozdíl > 30%
- **Střední** - rozdíl 15-30%
- **Nízká** - rozdíl < 15%

## 🔧 Další vývoj

- [ ] Integrace s reálným HLTV API (přes proxy)
- [ ] Historie predikovaných zápasů
- [ ] Statistiky přesnosti predikce
- [ ] Podpora live zápasů
- [ ] Export predikci do CSV
- [ ] Detailní analýza map poolu

## 📝 Poznámky

- **Mock data** - aktuálně aplikace používá mock data pro demonstraci
- **HLTV API** - HLTV nemá oficiální API, pro produkci je potřeba použít proxy jako [hltv-api](https://github.com/dajk/hltv-api) nebo scraper
- **Přesnost** - predikce jsou pouze orientační a slouží pro zábavu

## 📄 Licence

MIT License - volně použitelné pro osobní i komerční účely.

## 🤝 Příspěvky

Pull requesty jsou vítány! Pro větší změny prosím nejprve otevři issue.

---

**Vytvořeno s ❤️ pro CS2 komunitu**
