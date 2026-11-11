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

  // --- 2. LENIS SMOOTH SCROLL ---
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // --- 3. HERO POUCH PARALLAX & TILT (EXACT MICHA 3D INTERACTION) ---
  function setupHeroSlider() {
    const banner = document.querySelector('.banner-home');
    const pouchImg = document.querySelector('.banner-home .pouch-hero-img');
    const backdrop = document.querySelector('.banner-home .can-backdrop');
    const group = document.querySelector('.banner-home .packaging-group');
    const items = document.querySelectorAll('.banner-home .packaging-item');

    // Interactive 3D mouse parallax tilt on Hero Pouch
    if (banner && pouchImg) {
      banner.addEventListener('mousemove', (e) => {
        const rect = banner.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        if (typeof gsap !== 'undefined') {
          gsap.to(pouchImg, {
            rotationY: x * 16,
            rotationX: -y * 14,
            x: x * 22,
            y: y * 16,
            duration: 0.6,
            ease: 'power1.out',
            overwrite: 'auto'
          });
          if (backdrop) {
            gsap.to(backdrop, {
              x: -x * 32,
              y: -y * 22,
              duration: 0.8,
              ease: 'power1.out',
              overwrite: 'auto'
            });
          }
        }
      });

      banner.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(pouchImg, {
            rotationY: 0,
            rotationX: 0,
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.4)'
          });
          if (backdrop) {
            gsap.to(backdrop, {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: 'power2.out'
            });
          }
        }
      });
    }

    if (!group || items.length === 0) return;

    let currentIndex = 0;

    function showHeroSlide(index) {
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
      currentIndex = index;

      playCrunchSound();

      // Translate packaging items
      const targetPercent = -(currentIndex * 100);
      group.style.transform = `translateX(${targetPercent}%)`;

      const currentItem = items[currentIndex];
      const newBg = currentItem.getAttribute('data-bg');
      const sparkColor = currentItem.getAttribute('data-spark');
      const targetTab = currentItem.getAttribute('data-tab');

      // Morph background color smoothly
      if (banner && newBg && typeof gsap !== 'undefined') {
        gsap.to(banner, { backgroundColor: newBg, duration: 0.5, ease: 'power2.inOut' });
      }

      if (sparkSvg && sparkColor && typeof gsap !== 'undefined') {
        gsap.to(sparkSvg, { fill: sparkColor, duration: 0.5 });
      }

      // Animate backdrops with elastic bounce
      backdrops.forEach((bd, i) => {
        bd.classList.remove('active');
        if (typeof gsap !== 'undefined') {
          gsap.killTweensOf(bd);
          gsap.to(bd, { scale: 0.3, duration: 0.35, ease: 'power2.inOut' });
        }
      });

      const activeBd = backdrops[currentIndex];
      if (activeBd) {
        activeBd.classList.add('active');
        if (typeof gsap !== 'undefined') {
          gsap.to(activeBd, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.2 });
        }
      }

      // Update CTA
      if (ctaButton && targetTab) {
        ctaButton.setAttribute('href', targetTab);
      }
    }

    if (btnRight) {
      btnRight.addEventListener('click', (e) => {
        e.preventDefault();
        showHeroSlide(currentIndex + 1);
      });
    }

    if (btnLeft) {
      btnLeft.addEventListener('click', (e) => {
        e.preventDefault();
        showHeroSlide(currentIndex - 1);
      });
    }

    // Touch swipe support for mobile
    let touchStartX = 0;
    group.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    group.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (diff > 40) {
        showHeroSlide(currentIndex + 1);
      } else if (diff < -40) {
        showHeroSlide(currentIndex - 1);
      }
    }, { passive: true });

    // Initial show
    showHeroSlide(0);
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
              scrub: true,
              invalidateOnRefresh: true
            }
          });
        });
      },

      // Mobile: Rotate -2deg / +2deg
      '(max-width: 749px)': function () {
        aboutCards.forEach((card, i) => {
          const direction = (i === 1) ? -2 : (i === 2) ? 2 : 0;
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
              scrub: true,
              invalidateOnRefresh: true
            }
          });
        });
      }
    });

    // Parallax floating bubbles (exact MiCha formula)
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
          scrub: true
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
          scrub: true
        }
      });
    });
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
          toggleActions: 'play none none reverse'
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

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', function (e) {
        if (e.target.closest('a') && !e.target.closest('.flavour-tab-nav-inner')) return;
        activateFlavour(index);
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
        if (e.target.closest('.btn-open-modal')) return;
        activateFlavour(index);
      });
    });
  }

  // --- 7. HOVER-TRIGGERED MICRO-INTERACTIONS (CARDS, 3D TILT, SOUND FX) ---
  function setupHoverMicroInteractions() {
    let lastCrunchTime = 0;
    function triggerHoverCrunch() {
      const now = Date.now();
      if (now - lastCrunchTime > 180) {
        lastCrunchTime = now;
        playCrunchSound();
      }
    }

    // 3D Tilt & Crunch Audio for Product Catalog Cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card) => {
      card.addEventListener('mouseenter', triggerHoverCrunch);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6; // max 6deg tilt
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-10px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // Interactive Floating Hero & Ticker Spice Elements on Hover
    const bannerShapes = document.querySelectorAll('.banner-shape-item img, .ticker-spice-icon');
    bannerShapes.forEach((img) => {
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

    // Sound effect on button hover
    const interactiveBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-open-modal, .cat-tab-btn, .chip-btn');
    interactiveBtns.forEach((btn) => {
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
        onEnter: () => gsap.to('body', { backgroundColor: sec.color, duration: 0.5, ease: 'power2.out' }),
        onEnterBack: () => gsap.to('body', { backgroundColor: sec.color, duration: 0.5, ease: 'power2.out' })
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
  });
})();
