# Chehak Khera — Personal Site

Futuristic dark-glassmorphism personal promotion site. Pure HTML/CSS/JS — no build step, no framework, free to host anywhere static files are served.

## Pages

| Page | What's on it |
|---|---|
| `index.html` | Hero, animated stat bento, highlight ticker, section teasers |
| `experience.html` | Glowing career timeline, education, certifications, skills |
| `projects.html` | Live demos: India VIX forecast chart, Dabur valuation football field, working retirement calculator |
| `achievements.html` | Filterable bento gallery + full-screen lightbox (keyboard & swipe) |
| `contact.html` | Contact card, QR code to the site, resume download |

## Replacing the placeholder images with real photos

Drop photos into `images/` named `achievement-01.jpg` … `achievement-09.jpg` (any aspect ratio; they're cropped with `object-fit: cover`). **No code changes needed** — each tile tries the `.jpg` first and falls back to the shipped `.svg` placeholder only if the photo is missing.

Tile → subject mapping lives at the top of `js/gallery.js` (`ACHIEVEMENTS` array). Edit titles/captions/categories there; the grid, filters and lightbox rebuild themselves.

## Deploying (free)

1. Create a GitHub repo (ideally under Chehak's account) and push this folder's contents to the root.
2. Repo Settings → Pages → deploy from branch `main`, folder `/`.
3. Site goes live at `https://<account>.github.io/<repo>/`.

After deploying, update two things:

- `SITE_URL` in the inline script at the bottom of `contact.html` (regenerates the QR code).
- `og:image` meta tags — replace the relative `images/og-image.png` with the absolute deployed URL so LinkedIn/WhatsApp previews work. If `og-image.png` is missing, export it from `images/og-image.svg` at 1200×630.

Cloudflare Pages / Netlify also work: drag-and-drop this folder in their dashboard.

## Notes

- Resume download points at `assets/Chehak_Khera_Resume.pdf` — keep that file updated with the latest resume.
- Chart data on `projects.html` is illustrative (labelled as such on the page); real study outputs can be swapped into `js/charts.js`.
- All motion respects `prefers-reduced-motion`.
