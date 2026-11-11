# Laxmi Confectionery & Foods (LCAF) | Royal Indian Namkeens & Artisanal Snacks 🌶️
> **A high-impact, single-page static product line showcase designed for QR-code packaging scans, built with aesthetics inspired by [micha.asia](https://micha.asia/).**

---

## 🌟 Overview & Key Features

This web page is designed for an Indian snacks, mixtures, and namkeens business. When customers scan the QR code printed on the physical snack pouch, they land on a mobile-first, interactive digital catalog with lab-accurate nutritional profiles, transparent ingredients, and brand storytelling.

### 🎨 Design & Aesthetic Elements (Inspired by [micha.asia](https://micha.asia/))
1. **Bold Retro-Pop Typography & Die-Cut Stickers**:
   - Signature `Passion One` display font with die-cut white outline stroke (`-webkit-text-stroke: 0.16em #FFF`), drop shadows, and playful rotational tilt (`rotate(-3.5deg)`, `rotate(3.5deg)`).
   - Clean, geometric modern body font (`Be Vietnam Pro`).
2. **Dynamic Background Color Morphing on Scroll**:
   - Background smoothly transitions across warm Indian spice tones: Vibrant Saffron Turmeric (`#FBEF43`), Royal Purple (`#7F4E9F`), Chai Cream (`#FAF3E3`), and Artisanal Ochre (`#FFE0B2`) using GSAP ScrollTrigger.
3. **Interactive Flavour Bar & Rising Spice Bubbles**:
   - Interactive flavour selector matching MiCha’s signature UI with animated rising spice bubbles (`@keyframes bubbleUp`), rotating SVG arrow indicators, and desktop pop-in backdrop shapes (`elastic.out(1, 0.5)`).
   - On mobile/touch devices, smoothly switches into accordion drawers (`.flavour-can-mobile`).
4. **3D Interactive Tilt Snack Showcase**:
   - Cursor-reactive and gyroscope-reactive 3D perspective tilt (`.tilt-wrapper`), giving the hero snack pack a tactile, physical feel.
5. **Continuous Infinite Marquee Ticker**:
   - High-speed marquee with custom iconography (`100% STONE-GROUND MASALAS`, `0% PALM OIL`, `COLD-PRESSED GROUNDNUT OIL`, `100% VEGETARIAN`).
6. **Synthesized Crispy Audio FX (Zero External Dependencies)**:
   - Uses the HTML5 Web Audio API to synthesize a satisfying, realistic crunchy snack sound on clicks and card inspection, with a toggle button (`Crunch: ON / OFF`) in the navbar.
7. **Complete FSSAI & FDA-Compliant Nutritional Ledger**:
   - Clicking any snack pack opens an inspection modal with:
     - Serving size toggle: **Per 100g** vs **Per 30g Serving**
     - Full breakdown: Calories, Total Fat, Saturated Fat, Trans Fat (0g), Cholesterol (0mg), Sodium, Carbohydrates, Dietary Fiber, Sugars, Added Sugars, Protein, Calcium, Iron, and % Daily Values (% DV).
     - Full ingredients list with bold allergen warnings.
     - Spice heat meter (Mild 🌶️ to Fiery 🌶️🌶️🌶️🌶️).
     - Direct WhatsApp sharing with pre-filled product details.
     - Instant printable nutritional factsheet.

---

## 🚀 How to Host on GitHub Pages

This project is 100% static (HTML, CSS, JavaScript) and requires zero build steps, bundlers, or servers.

### Step 1: Initialize Git Repository
In your project directory, run:
```bash
git init
git add .
git commit -m "Initial commit of Laxmi Confectionery & Foods QR Page"
```

### Step 2: Push to Your GitHub Repository
Create a new public repository on GitHub (e.g., `chatpata-qr-page`) and run:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Click on **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Within 1-2 minutes, your site will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 📂 Project Architecture

```
LCAF QR Page/
├── index.html              # Main single-page application structure
├── .nojekyll               # Disables Jekyll processing for fast GitHub Pages delivery
├── README.md               # Documentation & hosting guide
├── css/
│   ├── style.css           # Core styling, MiCha sticker typography, cards, and modal
│   └── responsive.css      # Mobile, tablet, and touch device optimizations
├── js/
│   ├── products-data.js    # Comprehensive database of 12 Indian namkeens & nutrition
│   ├── animations.js       # GSAP ScrollTrigger, Lenis smooth scroll, 3D tilt & Web Audio
│   └── app.js              # Catalog rendering, live search, multi-filter & modal logic
└── assets/
    ├── icons/              # Custom SVG vectors & badges
    └── images/             # Open-source royalty-free imagery
```

---

## 🏷️ Catalog & Product Customization

All products are defined in [`js/products-data.js`](js/products-data.js). You can edit, add, or remove products by modifying the JSON structure:

```javascript
{
  id: "royal-bikaneri-bhujia",
  name: "Royal Bikaneri Bhujia",
  hindiName: "शाही बीकानेरी भुजिया",
  category: "sev-bhujia",
  tagline: "The Legendary Desert Recipe with Moth Dal & Tellicherry Pepper",
  spiceLevel: 3,
  isBestseller: true,
  isGlutenFree: true,
  isRoasted: false,
  isHighProtein: true,
  nutrition: {
    servingSize: "30g",
    per100g: { energyKcal: 562, protein: 14.8, carbs: 42.6, totalFat: 37.4, ... },
    perServing: { energyKcal: 169, protein: 4.4, carbs: 12.8, totalFat: 11.2, ... }
  }
}
```

---

## 📱 Mobile & Touch Experience
- **Touch-Friendly Buttons**: All touch targets meet accessibility guidelines (minimum 44x44px).
- **Sticky Mobile Bottom Bar**: Provides quick thumb access to "Catalog", "Search", "Flavours", and "Top".
- **Responsive Accordion**: Flavour selector smoothly transforms into tap-to-expand accordions on smartphones.
