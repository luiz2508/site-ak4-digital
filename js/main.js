/**
 * AK4 DIGITAL — main.js
 * Funcionalidades: Swiper, Header scroll, Reveal animations,
 * Dark Mode, Mobile menu, Back to top, Counter, Lazy loading
 */

'use strict';

/* ─── SWIPER HERO ────────────────────────────────────────── */
function initSwiper() {
  if (typeof Swiper === 'undefined') return;

  new Swiper('.hero__swiper', {
    loop: true,
    speed: 500,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    effect: 'fade',
    fadeEffect: { crossFade: true },
    pagination: {
      el: '.hero__pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.hero__btn-next',
      prevEl: '.hero__btn-prev',
    },
    a11y: {
      prevSlideMessage: 'Slide anterior',
      nextSlideMessage: 'Próximo slide',
    },
    keyboard: { enabled: true },
  });
}

/* ─── HEADER SCROLL EFFECT ───────────────────────────────── */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  let ticking = false;

  function onScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Run once on load
  onScroll();
}

/* ─── MOBILE MENU ────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav    = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'header__nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  function openMenu() {
    nav.classList.add('open');
    overlay.classList.add('visible');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu de navegação');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('open');
    overlay.classList.remove('visible');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu de navegação');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // Close on nav link click
  nav.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });
}

/* ─── SMOOTH SCROLL ──────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── REVEAL ON SCROLL (Intersection Observer) ───────────── */
function initRevealAnimations() {
  const elements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right'
  );
  if (!elements.length) return;

  const options = {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  elements.forEach(el => observer.observe(el));
}

/* ─── ACTIVE NAV LINK ON SCROLL ──────────────────────────── */
function initActiveNavOnScroll() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.header__nav-link[data-section]');
  if (!sections.length || !navLinks.length) return;

  const headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height')
  ) || 72;

  function setActive() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - headerHeight - 10;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
}

/* ─── DARK MODE ──────────────────────────────────────────── */
function initDarkMode() {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const html = document.documentElement;
  if (!btn) return;

  const STORAGE_KEY = 'ak4-theme';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    btn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'
    );
  }

  // Load saved preference or system preference
  const saved  = localStorage.getItem(STORAGE_KEY);
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || system);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Sync with system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ─── BACK TO TOP ────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;

  function toggle() {
    if (window.scrollY > 500) {
      btn.hidden = false;
    } else {
      btn.hidden = true;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(toggle);
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── COUNTER ANIMATION ──────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('.about__stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el     = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1800;
      const start  = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        el.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ─── LAZY LOADING (native + polyfill) ──────────────────── */
function initLazyLoading() {
  // Native lazy loading is set via loading="lazy" in HTML.
  // Polyfill for browsers that don't support it:
  if ('loading' in HTMLImageElement.prototype) return;

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if (!lazyImages.length) return;

  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '300px' });

  lazyImages.forEach(img => imgObserver.observe(img));
}

/* ─── COVERAGE ITEM STAGGER ──────────────────────────────── */
function initCoverageStagger() {
  const grid = document.querySelector('.coverage__grid');
  if (!grid) return;

  const items = grid.querySelectorAll('.coverage__item');
  items.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.035}s`;
  });
}

/* ─── PLAN CARD HOVER GLOW EFFECT ───────────────────────── */
function initCardGlowEffect() {
  const cards = document.querySelectorAll('.plan-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = ((e.clientX - rect.left) / rect.width  * 100).toFixed(2);
      const y     = ((e.clientY - rect.top)  / rect.height * 100).toFixed(2);
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

/* ─── INIT ALL ───────────────────────────────────────────── */
function init() {
  initSwiper();
  initHeaderScroll();
  initMobileMenu();
  initSmoothScroll();
  initRevealAnimations();
  initActiveNavOnScroll();
  initDarkMode();
  initBackToTop();
  initCounters();
  initLazyLoading();
  initCoverageStagger();
  initCardGlowEffect();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
