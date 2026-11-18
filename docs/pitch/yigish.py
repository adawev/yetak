"""Pitch dekni manba/ dan bitta HTML ga yig'adi, keyin Chrome PDF qiladi.

    python3 docs/pitch/yigish.py
    google-chrome --headless=new --no-pdf-header-footer \
      --print-to-pdf=docs/Yetak-pitch-dek.pdf docs/pitch/dek.html
"""
import json
import os

D = os.path.dirname(os.path.abspath(__file__))
deck = json.load(open(f"{D}/manba/deck.json"))
css = open(f"{D}/manba/deck.css").read()
slides = []
for sid in deck["order"]:
    h = open(f"{D}/manba/slides/{sid}.html").read()
    h = h.replace("/_blob/80395cf95e7ae79524f393b67e908560", "ilova.png")
    i = h.find("<aside>")  # spiker izohlari PDF ga kirmaydi
    if i >= 0:
        h = h[:i] + h[h.find("</aside>", i) + 8:]
    slides.append(h)

html = f"""<!doctype html><html><head><meta charset="utf-8"><title>{deck['title']}</title>
<link rel="stylesheet" href="{deck['faces']['golos-text']['href']}">
<style>
@page {{ size: 1920px 1080px; margin: 0; }}
html,body {{ margin:0; padding:0; }}
body {{ counter-reset: page; }}
section {{ width:1920px; height:1080px; box-sizing:border-box; position:relative; overflow:hidden; break-after:page; }}
h1,h2,h3,p {{ margin:0; }}
{css}
</style></head><body>
{''.join(slides)}
</body></html>"""
open(f"{D}/dek.html", "w").write(html)
print("dek.html:", len(slides), "slayd")
