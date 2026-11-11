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

    let currentIndex = 0;

    // Interactive 3D mouse parallax tilt on currently active Hero Pouch (MiCha smooth feel)
    if (banner) {
      banner.addEventListener('mousemove', (e) => {
        const activePouch = items[currentIndex]?.querySelector('.pouch-hero-img');
        if (!activePouch) return;

        const rect = banner.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        if (typeof gsap !== 'undefined') {
          gsap.to(activePouch, {
            rotationY: x * 16,
            rotationX: -y * 14,
            x: x * 22,
            y: y * 14,
            duration: 0.6,
            ease: 'power1.out',
            overwrite: 'auto'
          });
          if (backdropContainer) {
            gsap.to(backdropContainer, {
              x: -x * 30,
              y: -y * 20,
              duration: 0.8,
              ease: 'power1.out',
              overwrite: 'auto'
            });
          }
        }
      });

      banner.addEventListener('mouseleave', () => {
        const activePouch = items[currentIndex]?.querySelector('.pouch-hero-img');
        if (activePouch && typeof gsap !== 'undefined') {
          gsap.to(activePouch, {
            rotationY: 0,
            rotationX: 0,
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.4)'
          });
        }
        if (backdropContainer && typeof gsap !== 'undefined') {
          gsap.to(backdropContainer, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          });
        }
      });
    }

    function showHeroSlide(index, dir = 1) {
      let nextIndex = index;
      if (nextIndex < 0) nextIndex = items.length - 1;
      if (nextIndex >= items.length) nextIndex = 0;

      const direction = dir !== undefined ? dir : (nextIndex >= currentIndex ? 1 : -1);
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
        // 1. EXACT MICHA HORIZONTAL PACKAGING GLIDE (Smooth Power3 InOut)
        gsap.to(group, {
          xPercent: -currentIndex * 100,
          duration: 0.8,
          ease: 'power3.inOut'
        });

        // Subtle elastic punch on current pouch settling into center
        if (currentPouch) {
          gsap.fromTo(currentPouch,
            { scale: 0.94 },
            { scale: 1, duration: 0.8, ease: 'elastic.out(1.1, 0.5)', delay: 0.1 }
          );
        }

        // Ground shadow pulse
        if (currentShadow) {
          gsap.fromTo(currentShadow,
            { scale: 0.7, opacity: 0.35 },
            { scale: 1, opacity: 0.85, duration: 0.75, ease: 'power2.out', delay: 0.1 }
          );
        }

        // 2. EXACT MICHA BACKDROP TRANSITION (Scale 0.3 InOut -> Target 1.0 Elastic Delay 0.35s)
        gsap.killTweensOf(backdrops);
        gsap.to(backdrops, {
          scale: 0.3,
          duration: 0.45,
          ease: 'power2.inOut'
        });

        backdrops.forEach((bd, i) => bd.classList.remove('active'));

        const activeBd = backdrops[currentIndex];
        if (activeBd) {
          activeBd.classList.add('active');
          gsap.to(activeBd, {
            scale: 1,
            duration: 0.85,
            ease: 'elastic.out(1, 0.5)',
            delay: 0.35
          });
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
        group.style.transform = `translateX(-${currentIndex * 100}%)`;
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

    if (btnRight) {
      btnRight.addEventListener('click', (e) => {
        e.preventDefault();
        gsap?.fromTo(btnRight, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'elastic.out(1.5, 0.3)' });
        showHeroSlide(currentIndex + 1, 1);
      });
    }

    if (btnLeft) {
      btnLeft.addEventListener('click', (e) => {
        e.preventDefault();
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
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (diff > 45) {
        showHeroSlide(currentIndex + 1, 1);
      } else if (diff < -45) {
        showHeroSlide(currentIndex - 1, -1);
      }
    }, { passive: true });

    // Initial setup with scale 0.3 on backdrops and activate first slide
    if (typeof gsap !== 'undefined') {
      gsap.set(backdrops, { scale: 0.3 });
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
