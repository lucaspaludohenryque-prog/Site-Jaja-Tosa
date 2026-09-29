/**
 * Ja Ja Banho e Tosa — script.js
 * Covers: nav scroll state, mobile menu, pricing tabs,
 *         scroll reveal (IntersectionObserver), form validation + WhatsApp redirect
 */

(function () {
  'use strict';

  /* ── utility ────────────────────────────────────── */
  /**
   * Select one element, throw if missing.
   * @param {string} selector
   * @param {ParentNode} [root=document]
   * @returns {Element}
   */
  function qs(selector, root) {
    var el = (root || document).querySelector(selector);
    if (!el) throw new Error('Element not found: ' + selector);
    return el;
  }

  /**
   * Select multiple elements as an array.
   * @param {string} selector
   * @param {ParentNode} [root=document]
   * @returns {Element[]}
   */
  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  /* ── nav scroll ─────────────────────────────────── */
  var nav = qs('#nav');

  function updateNavState() {
    nav.classList.toggle('is-scrolled', window.scrollY > 48);
  }

  var scrollListener = (function () {
    var ticking = false;
    return function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateNavState();
          ticking = false;
        });
        ticking = true;
      }
    };
  })();

  window.addEventListener('scroll', scrollListener, { passive: true });
  updateNavState();

  /* ── mobile menu ─────────────────────────────────── */
  var hamburger = qs('#hamburger');
  var navLinks  = qs('#nav-links');

  hamburger.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  qsa('.nav__link', navLinks).forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ── pricing tabs ────────────────────────────────── */
  var tabButtons = qsa('.pricing__tab');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.dataset.tab;

      tabButtons.forEach(function (b) {
        b.classList.remove('pricing__tab--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('pricing__tab--active');
      btn.setAttribute('aria-selected', 'true');

      qsa('.pricing__panel').forEach(function (panel) {
        panel.classList.add('pricing__panel--hidden');
      });
      var targetPanel = document.getElementById('panel-' + target);
      if (targetPanel) targetPanel.classList.remove('pricing__panel--hidden');
    });
  });

  /* ── scroll reveal ───────────────────────────────── */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var revealTargets = qsa(
      '.service-card, .testi-card, .price-card, .about__pillar, .hero__stats, .contact__detail'
    );

    revealTargets.forEach(function (el) { el.classList.add('js-reveal'); });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ── active nav link on scroll ───────────────────── */
  var sections = qsa('section[id]');
  var navLinkEls = qsa('.nav__link');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        navLinkEls.forEach(function (link) {
          var href = link.getAttribute('href');
          link.style.color = href === '#' + id ? 'var(--rose)' : '';
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(function (s) { sectionObserver.observe(s); });

  /* ── contact form ────────────────────────────────── */
  var form = document.getElementById('contact-form');
  if (!form) return;

  /**
   * Show or hide an error message.
   * @param {string} fieldId
   * @param {boolean} show
   */
  function setError(fieldId, show) {
    var errorEl = document.getElementById('error-' + fieldId);
    var inputEl = document.getElementById('field-' + fieldId);
    if (!errorEl || !inputEl) return;
    errorEl.hidden = !show;
    inputEl.setAttribute('aria-invalid', show ? 'true' : 'false');
  }

  /**
   * Validate form fields. Returns true if all valid.
   * @returns {boolean}
   */
  function validateForm() {
    var name    = document.getElementById('field-name').value.trim();
    var phone   = document.getElementById('field-phone').value.trim();
    var pet     = document.getElementById('field-pet').value.trim();
    var service = document.getElementById('field-service').value;

    var nameOk    = name.length >= 2;
    var phoneOk   = phone.length >= 8;
    var petOk     = pet.length >= 2;
    var serviceOk = service !== '';

    setError('name',    !nameOk);
    setError('phone',   !phoneOk);
    setError('pet',     !petOk);
    setError('service', !serviceOk);

    return nameOk && phoneOk && petOk && serviceOk;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    var name    = document.getElementById('field-name').value.trim();
    var phone   = document.getElementById('field-phone').value.trim();
    var pet     = document.getElementById('field-pet').value.trim();
    var service = document.getElementById('field-service').value;
    var msg     = document.getElementById('field-msg').value.trim();

    var serviceLabels = {
      'banho':      'Banho completo',
      'tosa':       'Tosa artistica',
      'banho-tosa': 'Banho e Tosa',
      'hidratacao': 'Hidratacao',
      'spa':        'Spa Day',
      'avulso':     'Servico avulso'
    };

    var text = 'Ola! Gostaria de agendar um servico.\n\n'
      + 'Nome: ' + name + '\n'
      + 'WhatsApp: ' + phone + '\n'
      + 'Pet: ' + pet + '\n'
      + 'Servico: ' + (serviceLabels[service] || service);

    if (msg) text += '\nObservacoes: ' + msg;

    window.open(
      'https://wa.me/5511999999999?text=' + encodeURIComponent(text),
      '_blank',
      'noopener,noreferrer'
    );
  });

  /* ── inline field validation ─────────────────────── */
  ['name', 'phone', 'pet', 'service'].forEach(function (id) {
    var el = document.getElementById('field-' + id);
    if (!el) return;
    el.addEventListener('blur', function () {
      var value = el.value.trim();
      var invalid = id === 'service' ? value === '' : value.length < 2;
      setError(id, invalid && el.value.length > 0);
    });
  });

})();
