/**
 * AK4 DIGITAL — main.js
 * Funcionalidades: Swiper, Header scroll, Reveal animations,
 * Dark Mode, Mobile menu, Back to top, Counter, Lazy loading
 */

'use strict';

/* ─── SWIPER HERO ────────────────────────────────────────── */
let heroSwiper = null;

function initSwiper() {
  if (typeof Swiper === 'undefined') return;

  heroSwiper = new Swiper('.hero__swiper', {
    loop: true,
    speed: 800,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
      waitForTransition: false,
    },
    effect: 'creative',
    creativeEffect: {
      prev: { opacity: 0, translate: [0, 0, -1] },
      next: { opacity: 0, translate: [0, 0, -1] },
    },
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
    on: {
      autoplayStop: function (swiper) {
        // Pequeno delay para deixar qualquer transição pendente terminar
        setTimeout(() => swiper.autoplay.start(), 50);
      },
    },
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
  const nav = document.getElementById('mainNav');
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
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link[data-section]');
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
  const btn = document.getElementById('themeToggle');
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
  const saved = localStorage.getItem(STORAGE_KEY);
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

      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
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
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

/* ─── LOCATION SELECTOR ──────────────────────────────────── */

const LOC_CITIES = [
  { id: 'cujubizinho', name: 'Cujubizinho', popular: true },
  { id: 'ramal-estudante', name: 'Ramal do Estudante', popular: true },
  { id: 'ramal-da-amizade', name: 'Ramal da Amizade', popular: true },
  { id: 'ramal-brasil', name: 'Ramal Brasil', popular: false },
  { id: 'linha-28', name: 'Linha 28', popular: false },
  { id: 'ramal-santo-antonio-mucuim', name: 'Ramal Santo Antônio Mucuim', popular: false },
  { id: 'riacho-azul', name: 'Riacho Azul', popular: false },
  { id: 'sao-domingo', name: 'São Domingo', popular: false },
  { id: 'sao-damiao', name: 'São Damião', popular: false },
  { id: 'vila-dnit', name: 'Vila Dnit', popular: false },
  { id: 'sao-joao', name: 'São João', popular: false },
  { id: 'novo-engenho-velho', name: 'Novo Engenho Velho', popular: false },
  { id: 'vila-renascer', name: 'Vila Renascer', popular: false },
  { id: 'riacho-azul', name: 'Riacho Azul', popular: false },
  { id: 'vila-franciscana', name: 'Vila Franciscana', popular: false },
  { id: 'vila-bom-jesus', name: 'Vila Bom Jesus', popular: false },
  { id: 'vila-veneza', name: 'Vila Veneza', popular: false },
  { id: 'santa-rita', name: 'Santa Rita', popular: false },
  { id: 'ramal-jatuarana', name: 'Ramal Jatuarana', popular: false },
  { id: 'primeiro-de-maio', name: 'Primeiro de Maio', popular: false },
  { id: 'joana-darc', name: 'Joana D’arc', popular: false },
  { id: 'linha-9-joana-darc', name: 'Linha 9 Joana D’arc', popular: false },
  { id: 'linha-7-joana-darc', name: 'Linha 7 Joana D’arc', popular: false },
  { id: 'linha-5-joana-darc', name: 'Linha 5 Joana D’arc', popular: false },
  { id: 'linha-3-joana-darc', name: 'Linha 3 Joana D’arc', popular: false },
  
];

const LOC_STORAGE_KEY = 'ak4-selected-city';

function initLocationSelector() {
  const screen = document.getElementById('locScreen');
  if (!screen) return;

  // Skip screen only if the user already confirmed the city in THIS session
  const savedId = localStorage.getItem(LOC_STORAGE_KEY);
  const sessionDone = sessionStorage.getItem(LOC_STORAGE_KEY + '-ok');
  if (savedId && sessionDone) {
    const saved = LOC_CITIES.find(c => c.id === savedId);
    if (saved) {
      screen.style.display = 'none';
      locShowPlansNotice(saved);
      return;
    }
    // Stored id is invalid — clear both
    localStorage.removeItem(LOC_STORAGE_KEY);
    sessionStorage.removeItem(LOC_STORAGE_KEY + '-ok');
  }

  // Pre-populate search with previously saved city (for convenience)
  if (savedId) {
    const preCity = LOC_CITIES.find(c => c.id === savedId);
    if (preCity) {
      // Defer until after DOM wiring
      setTimeout(() => locSelectCity(preCity), 0);
    }
  }

  // Lock scroll while selector is visible
  document.body.style.overflow = 'hidden';

  // Wire up search
  locInitSearch(screen);

  // Wire up continue button
  const continueBtn = document.getElementById('locContinueBtn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const cityId = continueBtn.dataset.selectedId;
      if (!cityId) return;
      const city = LOC_CITIES.find(c => c.id === cityId);
      if (!city) return;
      localStorage.setItem(LOC_STORAGE_KEY, city.id);
      locExitScreen(screen, city);
    });
  }
}

/* Wire up city select */
function locInitSearch(screen) {
  const input = document.getElementById('locSearchInput');
  const changeBtn = document.getElementById('locChangeCity');
  if (!input) return;

  LOC_CITIES.forEach(city => {
    const option = document.createElement('option');
    option.value = city.id;
    option.textContent = locCityLabel(city);
    input.appendChild(option);
  });

  input.addEventListener('change', () => {
    const city = LOC_CITIES.find(c => c.id === input.value);
    if (city) {
      locSelectCity(city);
    } else {
      locClearSelection();
    }
  });

  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      locClearSelection();
      input.focus();
    });
  }
}

/* Fuzzy city search with accent normalization */
function locSearchCities(query) {
  const q = locNormalize(query);
  return LOC_CITIES.filter(c => locNormalize(c.name).includes(q));
}

function locNormalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* Render dropdown list */
function locRenderDropdown(results, dropdown, input) {
  dropdown.innerHTML = '';

  if (!results.length) {
    const li = document.createElement('li');
    li.className = 'loc-dropdown__empty';
    li.setAttribute('role', 'option');
    li.innerHTML = `<i class="fas fa-magnifying-glass" aria-hidden="true"></i> Nenhuma cidade encontrada`;
    dropdown.appendChild(li);
  } else {
    results.forEach(city => {
      const li = document.createElement('li');
      li.className = 'loc-dropdown__item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.setAttribute('tabindex', '-1');
      li.innerHTML = `
        <span class="loc-dropdown__item-icon"><i class="fas fa-map-pin" aria-hidden="true"></i></span>
        <span class="loc-dropdown__item-text">
          <span class="loc-dropdown__item-name">${locEscapeHtml(city.name)}</span>
        </span>
        ${city.popular ? '<span class="loc-chip loc-chip--mini">Popular</span>' : ''}
      `;
      li.addEventListener('click', () => locSelectCity(city));
      dropdown.appendChild(li);
    });
  }

  dropdown.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}

function locDropdownSetActive(items, idx) {
  items.forEach((item, i) => {
    item.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    if (i === idx) item.scrollIntoView({ block: 'nearest' });
  });
}

function locCloseDropdown(input, dropdown) {
  dropdown.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  dropdown.querySelectorAll('[aria-selected="true"]').forEach(i =>
    i.setAttribute('aria-selected', 'false')
  );
}

/* Select a city and update UI */
function locSelectCity(city) {
  const input = document.getElementById('locSearchInput');

  if (input) input.value = city.id;

  // Show selected display
  const selectedDiv = document.getElementById('locCitySelected');
  const selectedName = document.getElementById('locCityName');
  if (selectedDiv) selectedDiv.hidden = false;
  if (selectedName) selectedName.textContent = locCityLabel(city);

  // Highlight matching chip
  document.querySelectorAll('.loc-chip:not(.loc-chip--mini)').forEach(chip => {
    chip.classList.toggle('loc-chip--active', chip.textContent.trim() === city.name);
  });

  // Enable continue button
  const btn = document.getElementById('locContinueBtn');
  if (btn) {
    btn.disabled = false;
    btn.dataset.selectedId = city.id;
  }
}

/* Clear current selection */
function locClearSelection() {
  const selectedDiv = document.getElementById('locCitySelected');
  if (selectedDiv) selectedDiv.hidden = true;
  const input = document.getElementById('locSearchInput');
  if (input) input.value = '';
  document.querySelectorAll('.loc-chip:not(.loc-chip--mini)').forEach(c =>
    c.classList.remove('loc-chip--active')
  );
  const btn = document.getElementById('locContinueBtn');
  if (btn) {
    btn.disabled = true;
    delete btn.dataset.selectedId;
  }
}

/* Animate screen out, then reveal main site */
function locExitScreen(screen, city) {
  sessionStorage.setItem(LOC_STORAGE_KEY + '-ok', '1');
  screen.classList.add('loc-screen--exiting');
  screen.addEventListener('animationend', () => {
    screen.style.display = 'none';
    document.body.style.overflow = '';
    locShowPlansNotice(city);
    // Reiniciar autoplay — Swiper pode ter pausado enquanto coberto pelo overlay
    if (heroSwiper && heroSwiper.autoplay) {
      heroSwiper.autoplay.start();
    }
  }, { once: true });
}

/* Inject city notice above plans grid */
function locShowPlansNotice(city) {
  const plansSection = document.getElementById('planos');
  if (!plansSection) return;

  // Remove existing notice
  document.getElementById('locPlansNotice')?.remove();

  const header = plansSection.querySelector('.section-header');
  if (!header) return;

  const notice = document.createElement('div');
  notice.id = 'locPlansNotice';
  notice.className = 'loc-plans-notice reveal';
  notice.innerHTML = `
    <i class="fas fa-location-dot" aria-hidden="true"></i>
    Exibindo planos disponíveis para <strong>${locEscapeHtml(locCityLabel(city))}</strong>
    <button class="loc-plans-notice__change" type="button" aria-label="Trocar cidade">
      <i class="fas fa-pen-to-square" aria-hidden="true"></i> Trocar cidade
    </button>
  `;
  header.after(notice);

  notice.querySelector('.loc-plans-notice__change')?.addEventListener('click', () => {
    localStorage.removeItem(LOC_STORAGE_KEY);
    sessionStorage.removeItem(LOC_STORAGE_KEY + '-ok');
    window.location.reload();
  });

  // Trigger reveal
  requestAnimationFrame(() =>
    requestAnimationFrame(() => notice.classList.add('visible'))
  );
}

/* Safe HTML escape */
function locEscapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function locCityLabel(city) {
  return city.name;
}

/* ─── INIT ALL ───────────────────────────────────────────── */
function init() {
  initLocationSelector();
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
