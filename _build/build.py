#!/usr/bin/env python3
"""
Static page assembler for the Stacksol website.

Each file in _build/pages/*.html starts with a small front-matter block:

    title: Page title
    description: Meta description
    page: home            (used to highlight the active nav item)
    ---
    <main> ... </main>

The script wraps it with the shared <head>, header, menu and footer and writes
the finished page to the repository root. Inline icons can be referenced with
{{icon:name}} anywhere in page content.

Run:  python3 _build/build.py
"""
import os
import re

from icons import ICONS

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PAGES = os.path.join(HERE, "pages")

PHONE = "+91-9319596653"
PHONE_TEL = "+919319596653"
EMAIL = "dhruv.sandilya2005@gmail.com"
ADDRESS = "First Floor, H. No. G-275, Gali No. 13, Block-G, Molarband Extn., Badarpur, New Delhi – 110044"
GSTIN = "07ABNCS9084P1Z6"


def icon(name, cls=""):
    body = ICONS[name]
    c = f' class="{cls}"' if cls else ""
    return (f'<svg{c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{body}</svg>')


LOGO_SVG = """<svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <rect x="6" y="6" width="28" height="7" rx="3.5" fill="#4ee0c2"/>
  <rect x="6" y="16.5" width="28" height="7" rx="3.5" fill="#4ee0c2" fill-opacity=".55"/>
  <rect x="6" y="27" width="18" height="7" rx="3.5" fill="#4f7cff"/>
  <circle cx="30.5" cy="30.5" r="3.5" fill="#eef1f6"/>
</svg>"""

SOLUTIONS = [
    ("endpoint", "Endpoint Solutions", "Laptops, desktops, workstations & servers"),
    ("printing", "Managed Printing", "Fleet, supplies & proactive maintenance"),
    ("cybersecurity", "Cybersecurity", "Threat defence, VAPT & data protection"),
    ("cloud", "Cloud Solutions", "Migration, Azure / AWS & hybrid"),
    ("network", "Network Solutions", "LAN / WAN, wireless, VPN & SD-WAN"),
    ("enterprise", "Enterprise Solutions", "ERP, collaboration & storage"),
    ("consulting", "IT Consulting", "Strategy, roadmaps & audits"),
    ("services", "Specialised Services", "Installation, data centre, AMC & more"),
]

NAV = [
    ("index.html", "home", "Home"),
    ("about.html", "about", "About"),
    ("services.html", "services", "Solutions"),
    ("portfolio.html", "portfolio", "Work"),
    ("team.html", "team", "Team"),
    ("order.html", "order", "Order Online"),
]


def head(title, desc):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#06070b">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:site_name" content="Stacksol Technologies">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%2306070b'/%3E%3Crect x='8' y='8' width='24' height='6' rx='3' fill='%234ee0c2'/%3E%3Crect x='8' y='17' width='24' height='6' rx='3' fill='%234ee0c2' fill-opacity='.55'/%3E%3Crect x='8' y='26' width='15' height='6' rx='3' fill='%234f7cff'/%3E%3C/svg%3E">
  <link rel="preload" href="fonts/Syne-normal-500-800.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="fonts/Manrope-normal-300-700.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/styles.css">
  <script>
    (function (d) {{
      var r = d.documentElement; r.classList.add('js');
      try {{ if (!sessionStorage.getItem('ss-visited')) r.classList.add('first'); }} catch (e) {{}}
      setTimeout(function () {{ if (!r.classList.contains('ready')) r.classList.add('ready', 'no-anim'); }}, 6000);
    }})(document);
  </script>
</head>"""


def chrome_top():
    dd = "\n".join(
        f'            <a href="services.html#{sid}"><strong>{name}</strong><span>{sub}</span></a>'
        for sid, name, sub in SOLUTIONS)
    nav_items = []
    for href, key, label in NAV:
        if key == "services":
            nav_items.append(f"""        <div class="nav__dd">
          <a href="{href}" data-nav="{key}">{label} {icon('chevron')}</a>
          <div class="nav__menu">
{dd}
          </div>
        </div>""")
        else:
            nav_items.append(f'        <a href="{href}" data-nav="{key}">{label}</a>')
    nav_html = "\n".join(nav_items)
    menu_links = "\n".join(
        f'      <a href="{h}" data-nav="{k}"><span>{l}</span></a>' for h, k, l in NAV + [("contact.html", "contact", "Contact")])
    return f"""
  <div class="loader" aria-hidden="true">
    <div class="loader__top"><span>Stacksol Technologies</span><span>New Delhi · India</span></div>
    <div class="loader__word">{''.join(f'<span style="--i:{i}"{" class=a" if i >= 5 else ""}>{ch}</span>' for i, ch in enumerate("STACKSOL"))}</div>
    <div class="loader__bottom"><div class="loader__bar"><i></i></div><div class="loader__count">0</div></div>
  </div>
  <div class="pt" aria-hidden="true"><div class="pt__col"></div><div class="pt__col"></div><div class="pt__col"></div><div class="pt__col"></div><div class="pt__col"></div><div class="pt__logo">STACK<span>SOL</span></div></div>
  <div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>
  <div class="cursor-dot" aria-hidden="true"></div>
  <div class="progress" aria-hidden="true"><i></i></div>

  <header class="hdr">
    <div class="container hdr__in">
      <a href="index.html" class="logo" aria-label="Stacksol Technologies — home">{LOGO_SVG}<span>STACK<b>SOL</b></span></a>
      <nav class="nav" aria-label="Primary">
{nav_html}
      </nav>
      <div class="hdr__cta">
        <a href="contact.html" class="btn btn--primary" data-magnetic="0.25"><span class="btn-label">Let's talk</span>{icon('arrow-ur')}</a>
        <button class="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
      </div>
    </div>
  </header>

  <div class="menu" aria-label="Mobile menu">
    <nav class="menu__links">
{menu_links}
    </nav>
    <div class="menu__foot">
      <a href="tel:{PHONE_TEL}">{PHONE}</a>
      <a href="mailto:{EMAIL}">{EMAIL}</a>
      <span>New Delhi, India</span>
    </div>
  </div>
"""


def chrome_bottom():
    sol_links = "\n".join(f'            <li><a href="services.html#{sid}">{name}</a></li>' for sid, name, _ in SOLUTIONS[:7])
    return f"""
  <footer class="ftr">
    <div class="container">
      <div class="ftr__top">
        <div class="ftr__about">
          <a href="index.html" class="logo">{LOGO_SVG}<span>STACK<b>SOL</b></span></a>
          <p>End-to-end IT solutions, enterprise hardware and professional services — engineered for businesses and government organisations across India.</p>
          <div class="socials">
            <a href="https://wa.me/919319596653" target="_blank" rel="noopener" aria-label="WhatsApp">{icon('whatsapp')}</a>
            <a href="mailto:{EMAIL}" aria-label="Email">{icon('mail')}</a>
            <a href="tel:{PHONE_TEL}" aria-label="Call">{icon('phone')}</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn">{icon('linkedin')}</a>
          </div>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="about.html">About us</a></li>
            <li><a href="portfolio.html">Our work</a></li>
            <li><a href="team.html">Leadership</a></li>
            <li><a href="order.html">Order online</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Solutions</h4>
          <ul>
{sol_links}
          </ul>
        </div>
        <div>
          <h4>Reach us</h4>
          <ul class="ftr__contact">
            <li>{icon('pin')}<span>{ADDRESS}</span></li>
            <li>{icon('phone')}<a href="tel:{PHONE_TEL}">{PHONE}</a></li>
            <li>{icon('mail')}<a href="mailto:{EMAIL}">{EMAIL}</a></li>
            <li>{icon('file')}<span>GSTIN: {GSTIN}</span></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="ftr__word" data-split="chars" aria-hidden="true">STACKSOL</div>
    <div class="container">
      <div class="ftr__bottom">
        <span>© <span data-year>2026</span> Stacksol Technologies Pvt. Ltd. All rights reserved.</span>
        <span>New Delhi · <span data-clock>--:--</span> IST</span>
        <a href="#" class="to-top link-u" data-top>Back to top ↑</a>
      </div>
    </div>
  </footer>

  <a href="https://wa.me/919319596653?text=Hi!%20I%20visited%20your%20website%20and%20would%20like%20to%20know%20more." class="fab" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">{icon('whatsapp')}</a>

  <script src="js/vendor/gsap.min.js" defer></script>
  <script src="js/vendor/ScrollTrigger.min.js" defer></script>
  <script src="js/vendor/lenis.min.js" defer></script>
  <script src="js/main.js" defer></script>
</body>
</html>
"""


def render(src):
    raw = open(src, encoding="utf-8").read()
    meta_txt, body = raw.split("\n---\n", 1)
    meta = {}
    for line in meta_txt.strip().splitlines():
        k, v = line.split(":", 1)
        meta[k.strip()] = v.strip()
    body = re.sub(r"\{\{icon:([a-z0-9-]+)(?:\|([a-z0-9_ -]+))?\}\}",
                  lambda m: icon(m.group(1), m.group(2) or ""), body)
    for k, v in {"PHONE": PHONE, "PHONE_TEL": PHONE_TEL, "EMAIL": EMAIL, "ADDRESS": ADDRESS, "GSTIN": GSTIN}.items():
        body = body.replace("{{" + k + "}}", v)
    return (head(meta["title"], meta["description"])
            + f'\n<body data-page="{meta["page"]}">'
            + chrome_top() + "\n" + body.strip("\n") + "\n" + chrome_bottom())


def main():
    for name in sorted(os.listdir(PAGES)):
        if not name.endswith(".html"):
            continue
        out = render(os.path.join(PAGES, name))
        leftover = re.findall(r"\{\{[^}]+\}\}", out)
        if leftover:
            raise SystemExit(f"{name}: unresolved placeholders {leftover}")
        with open(os.path.join(ROOT, name), "w", encoding="utf-8") as f:
            f.write(out)
        print("built", name)


if __name__ == "__main__":
    main()
