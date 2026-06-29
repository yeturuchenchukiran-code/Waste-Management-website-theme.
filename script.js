/* ===================================================
   script.js — Stackly Zero Waste Interactive JS
   =================================================== */

(function () {
  'use strict';

  /* ---- Navbar scroll effect ---- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');

  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    if (scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load

  /* ---- Back to top ---- */
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Mobile Hamburger ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Mobile dropdowns: toggle on click
    navLinks.querySelectorAll('.nav-dropdown > .nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth < 1024) {
          e.preventDefault();
          const parent = link.closest('.nav-dropdown');
          parent.classList.toggle('open');
        }
      });
    });
  }

  /* ---- Scroll-triggered animations ---- */
  const animatables = document.querySelectorAll(
    '.impact-card, .benefit-card, .reg-card, .solution-card, ' +
    '.waste-type-card, .sdg-card, .faq-item, .comparison-item, ' +
    '.hero-stats, .hero-actions, .contact-form-wrap'
  );

  // Add data-animate attribute
  animatables.forEach(function (el, i) {
    el.setAttribute('data-animate', '');
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  animatables.forEach(function (el) {
    observer.observe(el);
  });

  /* ---- FAQ Accordion ---- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn = item.querySelector('.faq-question');

    btn.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- Contact Form ---- */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      const required = contactForm.querySelectorAll('[required]');
      let valid = true;

      required.forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#dc2626';
          field.focus();
          valid = false;
        }
      });

      // Email validation
      const emailField = document.getElementById('email');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          emailField.style.borderColor = '#dc2626';
          emailField.focus();
          valid = false;
        }
      }

      if (!valid) return;

      // Simulate submission
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="submit-text">Sending...</span><span class="submit-icon">⏳</span>';

      setTimeout(function () {
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="submit-text">Send Message</span><span class="submit-icon">→</span>';
      }, 1500);
    });

    // Clear error on input
    contactForm.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.style.borderColor = '';
      });
    });
  }

  /* ---- Smooth anchor scrolling with offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href === '#' || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---- Number counter animation for hero stats ---- */
  function animateCounter(el, target, suffix, duration) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(function () {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      el.textContent = (Number.isInteger(target) ? Math.round(start) : start.toFixed(1)) + suffix;
    }, 16);
  }

  const heroSection = document.getElementById('hero');
  let countersStarted = false;

  const heroObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      const stats = [
        { selector: '.stat-item:nth-child(1) .stat-num', target: 70, suffix: 'M+', duration: 1200 },
        { selector: '.stat-item:nth-child(3) .stat-num', target: 45, suffix: '%', duration: 1200 },
      ];
      setTimeout(function () {
        stats.forEach(function (s) {
          const el = document.querySelector(s.selector);
          if (el) animateCounter(el, s.target, s.suffix, s.duration);
        });
      }, 800);
    }
  }, { threshold: 0.5 });

  if (heroSection) heroObserver.observe(heroSection);

  /* ---- Add nav indicator stripe ---- */
  (function initNavStyle() {
    const style = document.createElement('style');
    style.textContent = `
      .navbar:not(.scrolled) {
        background: linear-gradient(180deg, rgba(6,12,8,0.75) 0%, transparent 100%);
      }
    `;
    document.head.appendChild(style);
  })();

  /* ---- Lazy load polyfill for older browsers ---- */
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
  } else {
    // Simple intersection observer fallback for lazy images
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const lazyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          lazyObserver.unobserve(img);
        }
      });
    });
    lazyImgs.forEach(function (img) { lazyObserver.observe(img); });
  }

})();








window.addEventListener("load", () => {

    setTimeout(() => {

        const loader = document.getElementById("loader");

        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        loader.style.transition = "all .8s ease";

    },2500);

});
