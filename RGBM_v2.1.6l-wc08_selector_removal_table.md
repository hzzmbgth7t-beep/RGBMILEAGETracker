# RGBM WC-08 Selector Removal Table

| Selector | Baseline blocks removed | Replacement |
|---|---:|---|
| `#app` | 9 | single deterministic app/safe-area contract |
| `.screen.home` | 5 | single integrated Home grid |
| `.home-head` | 1 | replaced by `.home-header` |
| `.vehicle-area` | 2 | replaced by `.home-vehicles` |
| `.circleBtn` | 4 | Home-scoped `.vehicle-unit .circleBtn` |
| `.vehicle-label` | 2 | Home-scoped chrome label rule |
| `.bottom-nav` | 6 | replaced by `.bottom-dock` |
| `.bottom-nav button` | 4 | replaced by `.bottom-dock .nav-control` |
| `.bottom-nav button span` | 3 | replaced by `.nav-icon` / `.nav-text` |
| `.bottom-nav::after` | 2 | prohibited; no replacement |
