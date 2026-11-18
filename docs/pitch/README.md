# Pitch dek manbasi

- `manba/` — slaydlar (har biri bitta HTML), `deck.css` va tartib (`deck.json`).
- `slaydlar/` — har slaydning rasmi (README uchun).
- `dek.html` — hamma slayd bitta sahifada; brauzerda ochiladi.
- `yigish.py` — `manba/` dan `dek.html` ni yig'adi.

PDF ni yangilash:

```
python3 docs/pitch/yigish.py
google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=docs/Yetak-pitch-dek.pdf docs/pitch/dek.html
```

Raqamlar va farazlar: [../PITCH-RAQAMLAR.md](../PITCH-RAQAMLAR.md).
