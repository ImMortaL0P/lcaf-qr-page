/**
 * Laxmi Confectionery & Foods (LCAF) - Main Application Logic
 * Manages Catalog Rendering, Live Search, Multi-Filter Engine,
 * Detailed FDA/FSSAI Nutrition Facts Modal, and QR Code generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- STATE ---
  let activeCategory = 'all';
  let activeSearchTerm = '';
  let activeFilterChip = null; // 'gluten-free', 'roasted', 'high-protein', 'bestseller'
  let currentModalProduct = null;
  let currentServingMode = 'per100g'; // 'per100g' or 'perServing'

  // --- DOM ELEMENTS ---
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('catalogSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryTabs = document.querySelectorAll('.cat-tab-btn');
  const filterChips = document.querySelectorAll('.chip-btn');
  const productCountDisplay = document.getElementById('productCountDisplay');

  // Modal elements
  const productModal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const toggle100gBtn = document.getElementById('toggle100gBtn');
  const toggleServingBtn = document.getElementById('toggleServingBtn');

  // --- 1. RENDER PRODUCTS GRID ---
  function getFilteredProducts() {
    return PRODUCTS_DATA.filter((product) => {
      // 1. Category filter
      if (activeCategory !== 'all' && product.category !== activeCategory) {
        return false;
      }

      // 2. Chip filters
      if (activeFilterChip === 'five-rupee' && !product.isFiveRupee) return false;
      if (activeFilterChip === 'free-gift' && !product.isFreeGift) return false;
      if (activeFilterChip === 'traditional' && product.category !== 'traditional-namkeens') return false;
      if (activeFilterChip === 'bestseller' && !product.isBestseller) return false;
      if (activeFilterChip === 'gluten-free' && !product.isGlutenFree) return false;
      if (activeFilterChip === 'high-protein' && !product.isHighProtein) return false;

      // 3. Search query
      if (activeSearchTerm.trim() !== '') {
        const query = activeSearchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesHindi = product.hindiName.toLowerCase().includes(query);
        const matchesIng = product.ingredients.toLowerCase().includes(query);
        const matchesNotes = product.tastingNotes.some((n) => n.toLowerCase().includes(query));
        const matchesTagline = product.tagline.toLowerCase().includes(query);

        if (!matchesName && !matchesHindi && !matchesIng && !matchesNotes && !matchesTagline) {
          return false;
        }
      }

      return true;
    });
  }

  function renderSpiceChilies(level) {
    if (level === 0) {
      return `<span class="spice-meter" title="Sweet & Fruity">🍓 Sweet</span>`;
    }
    const chilies = '🌶️'.repeat(level);
    const label = level === 1 ? 'Mild' : level === 2 ? 'Medium' : level === 3 ? 'Spicy' : 'Fiery';
    return `<span class="spice-meter" title="Spice Heat: ${label}">${chilies} ${label}</span>`;
  }

  function renderProducts() {
    if (!productsGrid) return;

    const filtered = getFilteredProducts();

    if (productCountDisplay) {
      productCountDisplay.textContent = `Showing ${filtered.length} of ${PRODUCTS_DATA.length} LCAF Packs`;
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: #FFF; border: var(--border-thick); border-radius: var(--radius-lg); box-shadow: var(--shadow-retro);">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-family: var(--font-display); font-size: 2rem; text-transform: uppercase;">No Snacks Found</h3>
          <p style="color: var(--color-text-muted); margin: 0.5rem 0 1.5rem;">We couldn't find any snack matching your filter or search criteria.</p>
          <button id="resetFiltersBtn" class="btn-primary" style="display: inline-flex;">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetAllFilters);
      }
      return;
    }

    productsGrid.innerHTML = filtered
      .map((p) => {
        return `
        <article class="product-card" data-product-id="${p.id}">
          <div class="card-top-badges">
            <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
              <span class="veg-badge" title="100% Pure Vegetarian"></span>
              <span class="badge-pill" style="background:#FFF9C4; color:#E65100; font-weight:800;">₹5 Pack</span>
              ${p.isFreeGift ? `<span class="badge-pill" style="background:#FCE4EC; color:#C2185B; font-weight:800;">🎁 Free Toy</span>` : ''}
              ${p.isGlutenFree ? `<span class="badge-pill" style="background:#E8F5E9; color:#2E7D32;">Gluten-Free</span>` : ''}
            </div>
            ${p.isBestseller ? `<span class="badge-bestseller">⭐ Bestseller</span>` : ''}
          </div>

          <div class="card-image-wrap">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            ${renderSpiceChilies(p.spiceLevel)}
          </div>

          <div class="product-card-body">
            <span class="card-category-tag">${p.categoryLabel}</span>
            <h3 class="card-title">${p.name}</h3>
            <p class="card-hindi-title">${p.hindiName}</p>
            <p class="card-desc">${p.tagline}</p>

            <div class="card-quick-nutrition">
              <div>
                <span class="nutri-col-label">Energy</span>
                <span class="nutri-col-val">${p.nutrition.per100g.energyKcal} <small>kcal</small></span>
              </div>
              <div>
                <span class="nutri-col-label">Protein</span>
                <span class="nutri-col-val">${p.nutrition.per100g.protein}g</span>
              </div>
              <div>
                <span class="nutri-col-label">Trans Fat</span>
                <span class="nutri-col-val" style="color:#2E7D32;">0g (Zero)</span>
              </div>
            </div>

            <div class="card-footer-action">
              <button class="btn-open-modal" data-product-id="${p.id}" aria-label="View Nutrition Facts for ${p.name}">
                <span>Inspect Product & Nutrition Facts</span>
                <span style="font-size:1.1rem;">👉</span>
              </button>
            </div>
          </div>
        </article>
      `;
      })
      .join('');

    // Attach click events
    document.querySelectorAll('.btn-open-modal, .product-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const prodId = card.getAttribute('data-product-id');
        if (prodId) {
          openProductModal(prodId);
          if (window.playCrunchSound) window.playCrunchSound();
        }
      });
    });

    // Rebind hover micro-interactions & 3D tilt
    if (window.setupHoverMicroInteractions) {
      window.setupHoverMicroInteractions();
    }
    // Stagger animate cards
    if (window.animateProductCards) {
      window.animateProductCards();
    }
  }

  // --- 2. SEARCH & FILTER HANDLERS ---
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchTerm = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = activeSearchTerm.length > 0 ? 'block' : 'none';
      }
      renderProducts();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      activeSearchTerm = '';
      if (searchInput) searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderProducts();
    });
  }

  categoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      if (window.playCrunchSound) window.playCrunchSound();
      renderProducts();
    });
  });

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const chipVal = chip.getAttribute('data-filter');
      if (activeFilterChip === chipVal) {
        activeFilterChip = null;
        chip.classList.remove('active');
      } else {
        filterChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilterChip = chipVal;
      }
      if (window.playCrunchSound) window.playCrunchSound();
      renderProducts();
    });
  });

  function resetAllFilters() {
    activeCategory = 'all';
    activeSearchTerm = '';
    activeFilterChip = null;
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    categoryTabs.forEach((t) => {
      t.classList.toggle('active', t.getAttribute('data-category') === 'all');
    });
    filterChips.forEach((c) => c.classList.remove('active'));
    renderProducts();
  }

  // --- 3. DETAILED NUTRITION FACTS MODAL ---
  function openProductModal(productId) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    currentModalProduct = product;
    currentServingMode = 'per100g';

    renderModalContent();

    if (productModal) {
      productModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      // Stop Lenis smooth scroll while modal is active so trackpad / wheel scroll the modal content smoothly
      if (window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }
      const container = productModal.querySelector('.modal-container');
      if (container) {
        container.scrollTop = 0;
        container.setAttribute('tabindex', '-1');
        container.focus({ preventScroll: true });
      }
    }
  }

  // Expose to window so other scripts and flagship cards can call directly
  window.openProductModal = openProductModal;
  window.closeModal = closeModal;

  function closeModal() {
    if (productModal) {
      productModal.classList.remove('open');
      document.body.style.overflow = '';
      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
      }
    }
  }

  const modalContainer = document.querySelector('.modal-container');
  if (productModal && modalContainer) {
    // 1. Direct wheel inside modalContainer: stop bubbling to parent, native overflow handles smooth scroll
    modalContainer.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });

    // 2. Wheel over dark backdrop overlay: scroll modalContainer directly
    productModal.addEventListener('wheel', (e) => {
      e.stopPropagation();
      if (e.target === productModal) {
        e.preventDefault();
        modalContainer.scrollTop += e.deltaY;
      }
    }, { passive: false });

    // 3. Touch scroll propagation stop
    modalContainer.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal && productModal.classList.contains('open')) {
      closeModal();
    }
  });

  if (toggle100gBtn) {
    toggle100gBtn.addEventListener('click', () => {
      currentServingMode = 'per100g';
      toggle100gBtn.classList.add('active');
      if (toggleServingBtn) toggleServingBtn.classList.remove('active');
      updateNutritionalValues();
    });
  }

  if (toggleServingBtn) {
    toggleServingBtn.addEventListener('click', () => {
      currentServingMode = 'perServing';
      toggleServingBtn.classList.add('active');
      if (toggle100gBtn) toggle100gBtn.classList.remove('active');
      updateNutritionalValues();
    });
  }

  function updateNutritionalValues() {
    if (!currentModalProduct) return;
    const p = currentModalProduct;
    const is100g = currentServingMode === 'per100g';
    const nutri = is100g ? p.nutrition.per100g : p.nutrition.perServing;

    const calEl = document.getElementById('modalNutriCal');
    const fatEl = document.getElementById('modalNutriFat');
    const satFatEl = document.getElementById('modalNutriSatFat');
    const transFatEl = document.getElementById('modalNutriTransFat');
    const cholEl = document.getElementById('modalNutriChol');
    const sodiumEl = document.getElementById('modalNutriSodium');
    const carbsEl = document.getElementById('modalNutriCarbs');
    const fiberEl = document.getElementById('modalNutriFiber');
    const sugarEl = document.getElementById('modalNutriSugar');
    const addedSugarEl = document.getElementById('modalNutriAddedSugar');
    const proteinEl = document.getElementById('modalNutriProtein');
    const calciumEl = document.getElementById('modalNutriCalcium');
    const ironEl = document.getElementById('modalNutriIron');

    if (calEl) calEl.textContent = nutri.energyKcal;
    if (fatEl) fatEl.textContent = `${nutri.totalFat}g`;
    if (satFatEl) satFatEl.textContent = `${nutri.saturatedFat}g`;
    if (transFatEl) transFatEl.textContent = `${nutri.transFat}g`;
    if (cholEl) cholEl.textContent = `${nutri.cholesterol}mg`;
    if (sodiumEl) sodiumEl.textContent = `${nutri.sodium}mg`;
    if (carbsEl) carbsEl.textContent = `${nutri.carbs}g`;
    if (fiberEl) fiberEl.textContent = `${nutri.fiber}g`;
    if (sugarEl) sugarEl.textContent = `${nutri.sugar}g`;
    if (addedSugarEl) addedSugarEl.textContent = `${nutri.addedSugar}g`;
    if (proteinEl) proteinEl.textContent = `${nutri.protein}g`;
    if (calciumEl) calciumEl.textContent = `${nutri.calcium}mg`;
    if (ironEl) ironEl.textContent = `${nutri.iron}mg`;
  }

  function renderModalContent() {
    const p = currentModalProduct;
    if (!p) return;

    // Header info
    const titleEl = document.getElementById('modalProductTitle');
    const hindiEl = document.getElementById('modalProductHindi');
    const taglineEl = document.getElementById('modalProductTagline');
    const imgEl = document.getElementById('modalProductImage');
    const descEl = document.getElementById('modalProductDesc');
    const ingEl = document.getElementById('modalProductIngredients');
    const allergenEl = document.getElementById('modalProductAllergens');
    const shelfLifeEl = document.getElementById('modalShelfLife');
    const servingSizeEl = document.getElementById('modalServingSize');
    const fssaiEl = document.getElementById('modalFssai');
    const tastingPillsEl = document.getElementById('modalTastingPills');
    const packSizesEl = document.getElementById('modalPackSizes');
    const pairingEl = document.getElementById('modalPairing');

    if (titleEl) titleEl.textContent = p.name;
    if (hindiEl) hindiEl.textContent = p.hindiName;
    if (taglineEl) taglineEl.textContent = p.tagline;
    if (imgEl) {
      imgEl.src = p.image;
      imgEl.alt = p.name;
    }
    if (descEl) descEl.textContent = p.description;
    if (ingEl) ingEl.textContent = p.ingredients;
    if (allergenEl) allergenEl.textContent = p.allergens;
    if (shelfLifeEl) shelfLifeEl.textContent = p.shelfLife;
    if (servingSizeEl) servingSizeEl.textContent = p.nutrition.servingSize;
    if (fssaiEl) fssaiEl.textContent = `FSSAI Lic. No: ${p.fssaiLicense}`;
    if (pairingEl) pairingEl.textContent = p.bestPairedWith;

    if (tastingPillsEl) {
      tastingPillsEl.innerHTML = p.tastingNotes
        .map((note) => `<span class="badge-pill" style="font-size:0.75rem;">🌶️ ${note}</span>`)
        .join('');
    }

    if (packSizesEl) {
      packSizesEl.innerHTML = p.packSizes
        .map((size) => `<span class="badge-pill" style="background:#FFF3E0; border-color:#E65100; font-size:0.75rem;">📦 ${size}</span>`)
        .join('');
    }

    // WhatsApp share link
    const whatsappBtn = document.getElementById('modalWhatsappBtn');
    if (whatsappBtn) {
      const shareUrl = encodeURIComponent(window.location.href);
      const shareText = encodeURIComponent(
        `Check out *${p.name}* (${p.hindiName}) by Laxmi Confectionery & Foods (LCAF)!\n\n${p.tagline}\n⚡ Energy: ${p.nutrition.per100g.energyKcal} kcal | Protein: ${p.nutrition.per100g.protein}g | 0g Trans Fat\n\nExplore full nutrition: `
      );
      whatsappBtn.href = `https://api.whatsapp.com/send?text=${shareText}${shareUrl}`;
    }

    // Reset serving toggle buttons
    if (toggle100gBtn) toggle100gBtn.classList.add('active');
    if (toggleServingBtn) toggleServingBtn.classList.remove('active');

    updateNutritionalValues();
  }

  // --- 4. FAQ ACCORDION ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question, .faq-question-btn');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Toggle behavior: collapse others and toggle current
        faqItems.forEach((f) => {
          f.classList.remove('active');
          const btn = f.querySelector('.faq-question, .faq-question-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }

        if (window.playCrunchSound) {
          window.playCrunchSound();
        }
      });
    }
  });

  // --- 5. MOBILE MENU & BOTTOM BAR ---
  const menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
  const siteNav = document.getElementById('siteNavigation') || document.querySelector('.main-navigation');

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      menuToggle.classList.toggle('active');
      siteNav.classList.toggle('open');
      if (window.playCrunchSound) window.playCrunchSound();
    });

    // Close when clicking nav link
    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        siteNav.classList.remove('open');
      });
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (siteNav.classList.contains('open') && !siteNav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        siteNav.classList.remove('open');
      }
    });
  }

  // Mobile Bottom Bar Quick Jump Buttons
  const mobileBtnCatalog = document.getElementById('mobileBtnCatalog');
  const mobileBtnSearch = document.getElementById('mobileBtnSearch');
  const mobileBtnTop = document.getElementById('mobileBtnTop');

  if (mobileBtnCatalog) {
    mobileBtnCatalog.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (mobileBtnSearch) {
    mobileBtnSearch.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      if (searchInput) searchInput.focus();
    });
  }

  if (mobileBtnTop) {
    mobileBtnTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Flagship packs card click triggers (Desktop cards & Mobile drawers)
  document.querySelectorAll('.flavour-can-wrapper, .flavour-can-mobile-inner').forEach((card) => {
    card.addEventListener('click', (e) => {
      const prodId = card.getAttribute('data-product-id');
      if (prodId) {
        openProductModal(prodId);
        if (window.playCrunchSound) window.playCrunchSound();
      }
    });
  });

  // --- 6. INITIAL RENDER ---
  renderProducts();

  // If URL has hash or parameter for specific product e.g. #royal-bikaneri-bhujia
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const matchingProduct = PRODUCTS_DATA.find((p) => p.id === hash);
    if (matchingProduct) {
      setTimeout(() => openProductModal(hash), 500);
    }
  }
});
