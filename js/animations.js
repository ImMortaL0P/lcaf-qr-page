/**
 * Laxmi Confectionery & Foods (LCAF) - Animations & Interactive System
 * Replicating and matching MiCha.asia's ScrollTrigger & GSAP animations:
 * 1. Sticky Stacking Cards with scrubbed rotation (-5deg, +5deg)
 * 2. Parallax Floating Polka-Dot Bubbles (-50vh / -20vh)
 * 3. Hero Pack Slider with Elastic Backdrops & Color Shifts
 * 4. Pop-In Elastic Shapes
 * 5. Dynamic Background Color Transitions on Scroll
 * 6. Synthesized Web Audio Crispy Crunch Sound FX
 */

(function () {
  'use strict';

  // --- 1. WEB AUDIO CRUNCH FX ---
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playCrunchSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const bufferSize = audioCtx.sampleRate * 0.12;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (audioCtx.sampleRate * 0.025));
        data[i] = (Math.random() * 2 - 1) * decay * (Math.sin(i * 0.08) > 0 ? 1 : 0.4);
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.Q.setValueAtTime(1.8, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start(now);
      noise.stop(now + 0.12);
    } catch (e) {}
  }

  window.playCrunchSound = playCrunchSound;

  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      soundEnabled = !soundEnabled;
      this.classList.toggle('muted', !soundEnabled);
      const label = this.querySelector('.sound-label');
      if (label) label.textContent = soundEnabled ? 'Crunch: ON' : 'Crunch: OFF';
      if (soundEnabled) playCrunchSound();
    });
  }

  // --- 2. LENIS SMOOTH SCROLL (MICHA PARITY ARCHITECTURE) ---
  // On mobile / touch screens (iPhone 14, Android), native hardware-accelerated momentum
  // scrolling provides instantaneous 60/120fps touch tracking without virtual-scroll drag lag.
  // Lenis virtual-scroll is enabled strictly on desktop wheel/trackpad.
  const isTouchOrMobile = window.innerWidth <= 860 || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
  let lenis = null;

  if (typeof Lenis !== 'undefined' && !isTouchOrMobile) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false,
      infinite: false
    });
    window.lenis = lenis;

    // Connect Lenis scroll to GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    // Sync Lenis RAF exclusively with GSAP ticker (Single unified render loop)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
  }

  // Restore GSAP lagSmoothing so CPU hiccups never cause stutter or hard jumps
  if (typeof gsap !== 'undefined') {
    gsap.ticker.lagSmoothing(500, 33);
  }

  // --- 3. HERO POUCH CAROUSEL & VISUAL TRANSITIONS (EXACT MICHA BEHAVIOR) ---
  function setupHeroSlider() {
    const banner = document.querySelector('.banner-home');
    const group = document.querySelector('.banner-home .packaging-group');
    const items = document.querySelectorAll('.banner-home .packaging-item');
    const backdrops = document.querySelectorAll('.banner-home .can-backdrop-wrapper');
    const btnRight = document.querySelector('.banner-home .arrows button.right');
    const btnLeft = document.querySelector('.banner-home .arrows button.left');
    const arrowCircles = document.querySelectorAll('.banner-home .arrows button circle');
    const arrowPaths = document.querySelectorAll('.banner-home .arrows button path');
    const sparkContainer = document.querySelector('.banner-heading .spark-container');
    const sparkSvgPaths = document.querySelectorAll('.banner-heading .spark-container svg path');
    const ctaButton = document.querySelector('#heroCtaBtn');
    const stickerSpan = document.querySelector('.banner-heading .sticker');
    const backdropContainer = document.querySelector('.banner-home .can-backdrop');

    if (!group || items.length === 0) return;

    // These are carousel frames, so preload them to avoid a blank or late-arriving turn.
    items.forEach((item) => {
      const heroImage = item.querySelector('.pouch-hero-img');
      if (heroImage) heroImage.loading = 'eager';
    });

    let currentIndex = 0;
    let hasInitialized = false;

    // Interactive 3D mouse parallax tilt on currently active Hero Pouch (MiCha smooth feel)
    if (banner) {
      let bannerRect = null;
      banner.addEventListener('mouseenter', () => {
        bannerRect = banner.getBoundingClientRect();
      });
      window.addEventListener('resize', () => {
        if (banner) bannerRect = banner.getBoundingClientRect();
      });

      banner.addEventListener('mousemove', (e) => {
        const activePouch = items[currentIndex]?.querySelector('.pouch-hero-img');
        if (!activePouch) return;

        if (!bannerRect) bannerRect = banner.getBoundingClientRect();
        const x = (e.clientX - bannerRect.left) / bannerRect.width - 0.5;
        const y = (e.clientY - bannerRect.top) / bannerRect.height - 0.5;

        if (typeof gsap !== 'undefined') {
          gsap.to(activePouch, {
            rotationY: x * 14,
            rotationX: -y * 12,
            x: x * 18,
            y: y * 12,
            duration: 0.45,
            ease: 'power1.out',
            overwrite: 'auto'
          });
          if (backdropContainer) {
            gsap.to(backdropContainer, {
              x: -x * 24,
              y: -y * 16,
              xPercent: -50,
              yPercent: -50,
              duration: 0.65,
              ease: 'power1.out',
              overwrite: 'auto'
            });
          }
        }
      });

      banner.addEventListener('mouseleave', () => {
        bannerRect = null;
        const activePouch = items[currentIndex]?.querySelector('.pouch-hero-img');
        if (activePouch && typeof gsap !== 'undefined') {
          gsap.to(activePouch, {
            rotationY: 0,
            rotationX: 0,
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
            overwrite: 'auto'
          });
        }
        if (backdropContainer && typeof gsap !== 'undefined') {
          gsap.to(backdropContainer, {
            x: 0,
            y: 0,
            xPercent: -50,
            yPercent: -50,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
    }

    function showHeroSlide(index, dir = 1) {
      let nextIndex = index;
      if (nextIndex < 0) nextIndex = items.length - 1;
      if (nextIndex >= items.length) nextIndex = 0;

      const direction = dir !== undefined ? dir : (nextIndex >= currentIndex ? 1 : -1);
      const isInitialRender = !hasInitialized;
      hasInitialized = true;
      currentIndex = nextIndex;

      playCrunchSound();

      const currentItem = items[currentIndex];
      const newBg = currentItem.getAttribute('data-bg');
      const sparkColor = currentItem.getAttribute('data-spark');
      const btnBg = currentItem.getAttribute('data-btn-bg');
      const btnText = currentItem.getAttribute('data-btn-text');
      const btnHoverBg = currentItem.getAttribute('data-btn-hover-bg');
      const btnHoverText = currentItem.getAttribute('data-btn-hover-text');
      const newTitle = currentItem.getAttribute('data-title');
      const targetTab = currentItem.getAttribute('data-tab');

      const currentPouch = currentItem.querySelector('.pouch-hero-img');
      const currentShadow = currentItem.querySelector('.pouch-ground-shadow');

      if (typeof gsap !== 'undefined') {
        // Keep the product's existing horizontal carousel; animate only its spices.
        gsap.to(group, {
          xPercent: -currentIndex * 100,
          duration: 0.8,
          ease: 'power3.inOut',
          overwrite: 'auto'
        });

        // Small settle, without a 3D flip.
        if (currentPouch && !isInitialRender) {
          gsap.fromTo(currentPouch,
            { scale: 0.94, rotation: direction * 4, opacity: 0.9 },
            { scale: 1, rotation: 0, opacity: 1, duration: 0.65, ease: 'power2.out', delay: 0.04 }
          );
        }

        // Ground shadow pulse
        if (currentShadow) {
          gsap.fromTo(currentShadow,
            { scale: 0.7, opacity: 0.35 },
            { scale: 1, opacity: 0.85, duration: 0.75, ease: 'power2.out', delay: 0.1 }
          );
        }

        // 2. Give the selected spices Micha's playful, staggered pop-in and drift.
        backdrops.forEach((bd, i) => {
          const shapes = bd.querySelectorAll('.backdrop-shape');
          gsap.killTweensOf(shapes);
          gsap.killTweensOf(bd);

          if (i !== currentIndex) {
            // Let the old spice arrangement gather and disappear behind the pouch.
            gsap.to(shapes, {
              scale: 0.35,
              opacity: 0,
              rotation: direction * 24,
              duration: 0.42,
              stagger: 0.035,
              ease: 'power2.in',
              onComplete: () => {
                bd.classList.remove('active');
                bd.style.visibility = 'hidden';
              }
            });
          }
        });

        const activeBd = backdrops[currentIndex];
        if (activeBd) {
          activeBd.classList.add('active');
          activeBd.style.visibility = 'visible';

          const activeShapes = activeBd.querySelectorAll('.backdrop-shape');
          gsap.killTweensOf(activeShapes);

          // New spice elements spring outward into their floating positions.
          gsap.fromTo(activeShapes,
            {
              scale: 0.28,
              opacity: 0,
              rotation: -direction * 24
            },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.7,
              stagger: {
                each: 0.055,
                from: direction > 0 ? 'start' : 'end'
              },
              ease: 'back.out(1.5)',
              delay: 0.08,
              overwrite: 'auto'
            }
          );
        }

        // 3. SMOOTH BACKGROUND COLOR MORPH (0.5s power2.inOut)
        if (banner && newBg) {
          gsap.to(banner, { backgroundColor: newBg, duration: 0.55, ease: 'power2.inOut' });
        }

        // 4. SPARK ACCELERATION ROTATION & COLOR MORPH
        if (sparkContainer) {
          gsap.to(sparkContainer, {
            rotation: `+=${direction * 180}`,
            duration: 0.7,
            ease: 'power2.out'
          });
        }
        if (sparkSvgPaths.length && sparkColor) {
          sparkSvgPaths.forEach((path) => {
            gsap.to(path, { fill: sparkColor, duration: 0.5, ease: 'power2.inOut' });
          });
        }

        // 5. MICHA DYNAMIC ARROW & CTA COLOR SYNCHRONIZATION
        if (btnBg) {
          arrowCircles.forEach((circle) => {
            gsap.to(circle, { fill: btnBg, duration: 0.45 });
          });
          if (ctaButton) {
            gsap.to(ctaButton, { backgroundColor: btnBg, duration: 0.45 });
          }
        }
        if (btnText) {
          arrowPaths.forEach((path) => {
            gsap.to(path, { stroke: btnText, duration: 0.45 });
          });
          if (ctaButton) {
            gsap.to(ctaButton, { color: btnText, duration: 0.45 });
          }
        }

        // 6. TACTILE STICKER PUNCH
        if (stickerSpan && newTitle) {
          gsap.fromTo(stickerSpan,
            { scale: 0.82 },
            {
              scale: 1,
              duration: 0.45,
              ease: 'back.out(2)',
              onStart: () => {
                stickerSpan.textContent = newTitle;
                stickerSpan.setAttribute('data-sticker-text', newTitle);
              }
            }
          );
        }

      } else {
        // Fallback without GSAP
        items.forEach((item, i) => item.classList.toggle('active', i === currentIndex));
        if (banner && newBg) banner.style.backgroundColor = newBg;
        if (stickerSpan && newTitle) {
          stickerSpan.textContent = newTitle;
          stickerSpan.setAttribute('data-sticker-text', newTitle);
        }
        backdrops.forEach((bd, i) => {
          bd.classList.toggle('active', i === currentIndex);
        });
      }

      // Update CTA Link
      if (ctaButton && targetTab) {
        ctaButton.setAttribute('href', targetTab);
      }
    }

    // Auto-advance: packs transition one by one smoothly, pausing when hovered or interacted with
    let autoSlideTimer = null;
    function resetAutoSlide() {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
      autoSlideTimer = setInterval(() => {
        showHeroSlide(currentIndex + 1, 1);
      }, 5500);
    }
    resetAutoSlide();

    if (banner) {
      banner.addEventListener('mouseenter', () => {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
      });
      banner.addEventListener('mouseleave', resetAutoSlide);
      banner.addEventListener('touchstart', () => {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
      }, { passive: true });
    }

    if (btnRight) {
      btnRight.addEventListener('click', (e) => {
        e.preventDefault();
        resetAutoSlide();
        gsap?.fromTo(btnRight, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'elastic.out(1.5, 0.3)' });
        showHeroSlide(currentIndex + 1, 1);
      });
    }

    if (btnLeft) {
      btnLeft.addEventListener('click', (e) => {
        e.preventDefault();
        resetAutoSlide();
        gsap?.fromTo(btnLeft, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'elastic.out(1.5, 0.3)' });
        showHeroSlide(currentIndex - 1, -1);
      });
    }

    // Touch swipe support for mobile devices
    let touchStartX = 0;
    group.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    group.addEventListener('touchend', (e) => {
      resetAutoSlide();
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (diff > 45) {
        showHeroSlide(currentIndex + 1, 1);
      } else if (diff < -45) {
        showHeroSlide(currentIndex - 1, -1);
      }
    }, { passive: true });

    // Initial setup: activate first slide shapes cleanly, set inactive to hidden & scale 0
    if (typeof gsap !== 'undefined') {
      backdrops.forEach((bd, i) => {
        const shapes = bd.querySelectorAll('.backdrop-shape');
        if (i === 0) {
          bd.classList.add('active');
          bd.style.visibility = 'visible';
          gsap.set(shapes, { scale: 1, opacity: 1, rotation: 0 });
        } else {
          bd.classList.remove('active');
          bd.style.visibility = 'hidden';
          gsap.set(shapes, { scale: 0, opacity: 0, rotation: 0 });
        }
      });
    }
    showHeroSlide(0, 1);
  }

  // --- 4. STICKY STACKING CARDS WITH SCROLLTRIGGER (MICHA SIGNATURE) ---
  function setupStickyCards() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const aboutCards = document.querySelectorAll('.about .about-cards .card');

    ScrollTrigger.matchMedia({
      // Desktop: Rotate -5deg / +5deg on scrub
      '(min-width: 750px)': function () {
        aboutCards.forEach((card, i) => {
          const direction = (i === 1) ? -5 : (i === 2) ? 5 : 0;
          if (direction === 0) return;

          gsap.set(card, { rotation: 0 });

          gsap.to(card, {
            rotation: direction,
            transformOrigin: '50% 60%',
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top center+=20%',
              end: 'center center',
              scrub: 0.6,
              invalidateOnRefresh: true
            }
          });
        });
      },

      // Mobile: Clean natural card alignment
      '(max-width: 749px)': function () {
        aboutCards.forEach((card) => {
          gsap.set(card, { rotation: 0 });
        });
      }
    });

    // Parallax floating bubbles (Desktop only - hidden on mobile to avoid scroll jank)
    if (window.innerWidth >= 750) {
      document.querySelectorAll('.about .bubbles-group').forEach((group, index) => {
        const bubbles = group.querySelectorAll('img.bubbles');
        if (bubbles.length < 2) return;

        const leftBubble = bubbles[0];
        const rightBubble = bubbles[1];
        const leftIsFast = index % 2 === 0;

        const fastY = '-50vh';
        const slowY = '-20vh';
        const fastRot = 12;
        const slowRot = 4;

        gsap.to(leftBubble, {
          y: leftIsFast ? fastY : slowY,
          rotate: leftIsFast ? fastRot : slowRot,
          ease: 'none',
          scrollTrigger: {
            trigger: group,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        });

        gsap.to(rightBubble, {
          y: leftIsFast ? slowY : fastY,
          rotate: leftIsFast ? slowRot : fastRot,
          ease: 'none',
          scrollTrigger: {
            trigger: group,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        });
      });
    }
  }

  // --- 5. POP-IN ELASTIC SHAPES ON SCROLL ---
  function setupPopInShapes() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const containers = document.querySelectorAll('.pop-in-shape-container');
    containers.forEach((container) => {
      const shapes = container.querySelectorAll('.shape');
      if (!shapes.length) return;

      gsap.set(shapes, { scale: 0, opacity: 0 });

      gsap.to(shapes, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        stagger: 0.15,
        scrollTrigger: {
          trigger: container,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // --- 6. FLAVOURS SECTION INTERACTIVE TABS & BACKDROPS ---
  function setupFlavoursTabs() {
    const tabs = document.querySelectorAll('.flavour-tab-nav');
    const desktopCans = document.querySelectorAll('.flavours-cans .flavour-can-wrapper');
    const flavoursSection = document.querySelector('.flavours-section');

    function activateFlavour(index) {
      if (index < 0 || index >= tabs.length) return;
      playCrunchSound();

      tabs.forEach((t) => t.classList.remove('active'));
      desktopCans.forEach((c) => c.classList.remove('active'));

      const activeTab = tabs[index];
      const activeCan = desktopCans[index];

      if (activeTab) {
        activeTab.classList.add('active');
        const activeBg = activeTab.style.getPropertyValue('--background-color');
        if (flavoursSection && activeBg && typeof gsap !== 'undefined') {
          gsap.to(flavoursSection, { backgroundColor: activeBg, duration: 0.5, ease: 'power2.inOut' });
        }
      }

      if (activeCan) {
        activeCan.classList.add('active');
        if (typeof gsap !== 'undefined') {
          const bd = activeCan.querySelector('.can-backdrop-wrapper');
          if (bd) {
            gsap.killTweensOf(bd);
            gsap.fromTo(bd, { scale: 0.3, rotate: 0 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
          }
        }
      }
    }

    function deactivateFlavour(index) {
      if (index < 0 || index >= tabs.length) return;
      playCrunchSound();

      const activeTab = tabs[index];
      const activeCan = desktopCans[index];

      if (activeTab) {
        activeTab.classList.remove('active');
      }

      if (activeCan) {
        activeCan.classList.remove('active');
        if (typeof gsap !== 'undefined') {
          const bd = activeCan.querySelector('.can-backdrop-wrapper');
          if (bd) {
            gsap.killTweensOf(bd);
            gsap.to(bd, { scale: 0.3, rotate: 0, duration: 0.35, ease: 'power2.out' });
          }
        }
      }

      // If all tabs are collapsed, restore default section background
      const anyActive = Array.from(tabs).some((t) => t.classList.contains('active'));
      if (!anyActive && flavoursSection && typeof gsap !== 'undefined') {
        gsap.to(flavoursSection, { backgroundColor: '#880E4F', duration: 0.5, ease: 'power2.inOut' });
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', function (e) {
        if (e.target.closest('.btn-open-modal')) return;
        if (e.target.closest('.flavour-can-mobile-inner')) return;
        if (e.target.closest('a') && !e.target.closest('.flavour-tab-nav-inner')) return;

        // Toggle / Collapse behavior: if already active, collapse it!
        if (tab.classList.contains('active')) {
          deactivateFlavour(index);
        } else {
          activateFlavour(index);
        }
      });
    });

    // Desktop Cans Hover & Click (matching MiCha custom.js)
    desktopCans.forEach((can, index) => {
      can.addEventListener('mouseenter', () => {
        if (!can.classList.contains('active')) {
          const bd = can.querySelector('.can-backdrop-wrapper');
          const img = can.querySelector('.can-image-inner');
          if (bd && typeof gsap !== 'undefined') {
            gsap.killTweensOf(bd);
            gsap.to(bd, { scale: 0.65, rotate: 8, duration: 0.4, ease: 'back.out(1.7)' });
          }
          if (img && typeof gsap !== 'undefined') {
            gsap.killTweensOf(img);
            gsap.to(img, { scale: 1.05, duration: 0.35, ease: 'power2.out' });
          }
        }
      });

      can.addEventListener('mouseleave', () => {
        if (!can.classList.contains('active')) {
          const bd = can.querySelector('.can-backdrop-wrapper');
          const img = can.querySelector('.can-image-inner');
          if (bd && typeof gsap !== 'undefined') {
            gsap.killTweensOf(bd);
            gsap.to(bd, { scale: 0.3, rotate: 0, duration: 0.35, ease: 'power2.out' });
          }
          if (img && typeof gsap !== 'undefined') {
            gsap.killTweensOf(img);
            gsap.to(img, { scale: 1, duration: 0.35, ease: 'power2.out' });
          }
        }
      });

      can.addEventListener('click', (e) => {
        activateFlavour(index);
        const prodId = can.getAttribute('data-product-id');
        if (prodId && window.openProductModal) {
          window.openProductModal(prodId);
        }
      });
    });
  }

  // --- 7. HOVER-TRIGGERED MICRO-INTERACTIONS (CARDS, 3D TILT, SOUND FX) ---
  function setupHoverMicroInteractions() {
    let lastCrunchTime = 0;
    function triggerHoverCrunch() {
      const now = Date.now();
      if (now - lastCrunchTime > 160) {
        lastCrunchTime = now;
        playCrunchSound();
      }
    }

    // High-performance GSAP 3D Tilt & Crunch Audio for Product Catalog Cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card) => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = 'true';

      let rect = null;
      let tiltRaf = null;

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        triggerHoverCrunch();
      });

      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(() => {
          tiltRaf = null;
          const x = (clientX - rect.left) / rect.width - 0.5;
          const y = (clientY - rect.top) / rect.height - 0.5;

          if (typeof gsap !== 'undefined') {
            gsap.to(card, {
              rotationY: x * 8,
              rotationX: -y * 8,
              y: -8,
              scale: 1.02,
              duration: 0.25,
              ease: 'power1.out',
              transformPerspective: 1000,
              overwrite: 'auto'
            });
          }
        });
      });

      card.addEventListener('mouseleave', () => {
        if (tiltRaf) {
          cancelAnimationFrame(tiltRaf);
          tiltRaf = null;
        }
        rect = null;
        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: 'elastic.out(1, 0.5)',
            overwrite: 'auto'
          });
        }
      });
    });

    // Interactive Floating Ticker Spice Elements on Hover
    const tickerSpices = document.querySelectorAll('.ticker-spice-icon');
    tickerSpices.forEach((img) => {
      if (img.dataset.hoverBound) return;
      img.dataset.hoverBound = 'true';
      img.addEventListener('mouseenter', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(img, { scale: 1.35, rotate: 'random(-25, 25)', duration: 0.4, ease: 'elastic.out(1, 0.4)' });
        }
        triggerHoverCrunch();
      });
      img.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(img, { scale: 1, rotate: 0, duration: 0.3, ease: 'power2.out' });
        }
      });
    });

    // Interactive Floating Hero Spices on Hover
    const heroSpices = document.querySelectorAll('.banner-home .shape-inner');
    heroSpices.forEach((spice) => {
      if (spice.dataset.soundBound) return;
      spice.dataset.soundBound = 'true';
      spice.addEventListener('mouseenter', () => {
        triggerHoverCrunch();
      });
    });

    // Sound effect on button hover (bound only once per button)
    const interactiveBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-open-modal, .cat-tab-btn, .chip-btn, .btn-qr-direct, .btn-crunch-sound, #heroCtaBtn, .faq-question');
    interactiveBtns.forEach((btn) => {
      if (btn.dataset.soundBound) return;
      btn.dataset.soundBound = 'true';
      btn.addEventListener('mouseenter', triggerHoverCrunch);
    });
  }

  // --- 7. DYNAMIC BG MORPHING ON SCROLL ---
  function setupBgColorMorph() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const sections = [
      { id: 'about', color: '#D32F2F' },
      { id: 'flavours', color: '#FAF6EE' },
      { id: 'catalog', color: '#FAF3E3' },
      { id: 'bring-together', color: '#FFF9EF' },
      { id: 'testimonial', color: '#FAF6EE' },
      { id: 'faq', color: '#FAF0E6' }
    ];

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => gsap.to('body', { backgroundColor: sec.color, duration: 0.5, ease: 'power2.out', overwrite: 'auto' }),
        onEnterBack: () => gsap.to('body', { backgroundColor: sec.color, duration: 0.5, ease: 'power2.out', overwrite: 'auto' })
      });
    });
  }

  // --- 8. SECTION HEADINGS ELASTIC STICKER POP ---
  function setupHeadingStickerPop() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const headingGroups = document.querySelectorAll('.section-title, .bring-together h2, .testimonials h2, .faq-header, .about .heading-wrapper');
    headingGroups.forEach((group) => {
      const stickers = group.querySelectorAll('.sticker');
      if (!stickers.length) return;

      gsap.fromTo(stickers,
        { scale: 0.82, opacity: 0.85, rotate: (i) => (i % 2 === 0 ? -4 : 4) },
        {
          scale: 1,
          opacity: 1,
          rotate: (i) => (i % 2 === 0 ? -1 : 1),
          duration: 0.65,
          ease: 'back.out(2)',
          stagger: 0.1,
          scrollTrigger: {
            trigger: group,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  // --- 9. ARTISANAL VIDEO SECTION & FLOATING SPICE ORBITS ---
  function setupArtisanalVideoParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const wrap = document.querySelector('.video-container-outer');
    if (!wrap) return;

    const spices = wrap.querySelectorAll('.video-floating-spice');
    spices.forEach((sp, i) => {
      const speed = i % 2 === 0 ? -40 : 40;
      const rot = i % 2 === 0 ? 25 : -25;
      gsap.to(sp, {
        y: speed,
        rotate: rot,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    });

    const player = wrap.querySelector('.video-player-wrap');
    if (player) {
      gsap.fromTo(player,
        { scale: 0.94, opacity: 0.85 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: player,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Interactive 3D mouse parallax tilt on Video Frame with cached rect & rAF throttle
      let playerRect = null;
      let playerRaf = null;

      player.addEventListener('mouseenter', () => {
        playerRect = player.getBoundingClientRect();
      });
      player.addEventListener('mousemove', (e) => {
        if (!playerRect) playerRect = player.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (playerRaf) return;
        playerRaf = requestAnimationFrame(() => {
          playerRaf = null;
          const x = (clientX - playerRect.left) / playerRect.width - 0.5;
          const y = (clientY - playerRect.top) / playerRect.height - 0.5;
          gsap.to(player, {
            rotationY: x * 8,
            rotationX: -y * 8,
            duration: 0.4,
            ease: 'power1.out',
            transformPerspective: 900,
            overwrite: 'auto'
          });
        });
      });

      player.addEventListener('mouseleave', () => {
        if (playerRaf) {
          cancelAnimationFrame(playerRaf);
          playerRaf = null;
        }
        playerRect = null;
        gsap.to(player, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto'
        });
      });
    }
  }

  // --- 10. PRODUCT CATALOG CASCADE & SCROLLTRIGGER ---
  function animateProductCards() {
    if (typeof gsap === 'undefined') return;
    const cards = document.querySelectorAll('.product-card');
    if (!cards.length) return;

    gsap.killTweensOf(cards);
    gsap.fromTo(cards,
      { opacity: 0, y: 35, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.045,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      }
    );
  }
  window.animateProductCards = animateProductCards;

  function setupProductCatalogScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    ScrollTrigger.create({
      trigger: grid,
      start: 'top 82%',
      once: true,
      onEnter: () => animateProductCards()
    });
  }

  // --- 11. TESTIMONIALS STAGGER CASCADE ---
  function setupTestimonialsStagger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const cards = document.querySelectorAll('.testimonials-wrapper .testimony-card');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 40, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.12,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.testimonials-wrapper',
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // --- 12. TICKER SPICE SCROLL VELOCITY MICRO-SPIN (DESKTOP ONLY) ---
  function setupTickerVelocity() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || isTouchOrMobile) return;
    const tickerIcons = document.querySelectorAll('.ticker-spice-icon');
    if (!tickerIcons.length) return;

    let isSpinning = false;
    ScrollTrigger.create({
      onUpdate: (self) => {
        if (isSpinning) return;
        const vel = Math.abs(self.getVelocity());
        if (vel > 800) {
          isSpinning = true;
          const spin = Math.min(vel / 40, 50) * (self.direction || 1);
          gsap.to(tickerIcons, {
            rotation: `+=${spin.toFixed(0)}`,
            duration: 0.65,
            ease: 'power2.out',
            overwrite: 'auto',
            onComplete: () => { isSpinning = false; }
          });
        }
      }
    });
  }

  // --- 13. SMOOTH SCROLLING FOR ALL ANCHOR BUTTONS (EXPLORE, CATALOG, NAV) ---
  function setupSmoothScrollLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (window.playCrunchSound) window.playCrunchSound();

          // Close mobile menu if open
          const menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
          const siteNav = document.getElementById('siteNavigation') || document.querySelector('.main-navigation');
          if (menuToggle && siteNav) {
            menuToggle.classList.remove('active');
            siteNav.classList.remove('open');
          }

          if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(target, {
              offset: -10,
              duration: 1.3,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }

          if (window.history && window.history.pushState) {
            window.history.pushState(null, null, href);
          }
        }
      });
    });
  }

  window.setupHoverMicroInteractions = setupHoverMicroInteractions;

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupHeroSlider();
    setupStickyCards();
    setupPopInShapes();
    setupFlavoursTabs();
    setupBgColorMorph();
    setupHoverMicroInteractions();
    setupHeadingStickerPop();
    setupArtisanalVideoParallax();
    setupProductCatalogScroll();
    setupTestimonialsStagger();
    setupTickerVelocity();
    setupSmoothScrollLinks();
  });
})();
