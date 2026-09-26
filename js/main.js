/* ============================================================
   STACKSOL TECHNOLOGIES — JavaScript Engine
   Dynamic interactions, scroll reveals, counters, particles
   ============================================================ */

(function () {
  'use strict';

  // ---------- Preloader ----------
  function initPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('loaded'), 600);
    });
    // Fallback: remove after 3s even if load fires late
    setTimeout(() => preloader.classList.add('loaded'), 3000);
  }

  // ---------- Sticky Header ----------
  function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    }, { passive: true });
  }

  // ---------- Mobile Menu ----------
  function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');
    const overlay = document.querySelector('.mobile-overlay');
    if (!toggle || !nav) return;

    function closeMenu() {
      toggle.classList.remove('active');
      nav.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        toggle.classList.add('active');
        nav.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    if (overlay) overlay.addEventListener('click', closeMenu);

    // Close on nav link click
    nav.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Mobile dropdown toggles
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
      const toggleBtn = dropdown.querySelector('.nav-dropdown-toggle');
      if (!toggleBtn) return;
      toggleBtn.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('mobile-open');
        }
      });
    });
  }

  // ---------- Scroll Reveal (IntersectionObserver) ----------
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children, .image-reveal');
    if (!revealElements.length) return;

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ---------- Counter Animation ----------
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ---------- Typing Effect ----------
  function initTypingEffect() {
    const typingEls = document.querySelectorAll('[data-typing]');
    typingEls.forEach(el => {
      const words = el.getAttribute('data-typing').split('|');
      if (!words.length) return;
      typeWords(el, words);
    });
  }

  function typeWords(el, words) {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 80;
    const deletingSpeed = 40;
    const pauseAfterWord = 2000;
    const pauseBeforeDelete = 1500;

    function tick() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        charIndex--;
        el.textContent = currentWord.substring(0, charIndex);
      } else {
        charIndex++;
        el.textContent = currentWord.substring(0, charIndex);
      }

      let delay = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentWord.length) {
        delay = pauseBeforeDelete;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = typingSpeed + 200;
      }

      setTimeout(tick, delay);
    }

    // Start after a short delay
    setTimeout(tick, 500);
  }

  // ---------- Parallax Scroll ----------
  function initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const offset = (elCenter - viewCenter) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    }, { passive: true });
  }

  // ---------- 3D Tilt Effect ----------
  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  // ---------- Magnetic Button ----------
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-wrap');
    buttons.forEach(wrap => {
      const btn = wrap.querySelector('.btn');
      if (!btn) return;

      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      wrap.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ---------- Particle Background ----------
  function initParticles() {
    const canvas = document.querySelector('.hero-particles canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor(canvas.width * canvas.height / 15000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.4 + 0.1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(78, 224, 194, ${p.alpha})`;
        ctx.fill();

        // Draw lines between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(78, 224, 194, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }

  // ---------- Marquee Duplication ----------
  function initMarquee() {
    const tracks = document.querySelectorAll('.marquee-track');
    tracks.forEach(track => {
      // Clone children to create infinite illusion
      const children = Array.from(track.children);
      children.forEach(child => {
        const clone = child.cloneNode(true);
        track.appendChild(clone);
      });
    });
  }

  // ---------- Back to Top ----------
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Smooth Anchor Scroll ----------
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#' || targetId.length <= 1) return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        const offset = 80; // header height
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }

  // ---------- Form Validation ----------
  function initFormValidation() {
    const forms = document.querySelectorAll('[data-validate]');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Clear previous errors
        form.querySelectorAll('.form-error').forEach(err => err.remove());
        form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(input => {
          input.style.borderColor = '';
        });

        // Validate required fields
        form.querySelectorAll('[required]').forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            showFieldError(field, 'This field is required');
          }
        });

        // Validate email
        form.querySelectorAll('[type="email"]').forEach(field => {
          if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            isValid = false;
            showFieldError(field, 'Please enter a valid email');
          }
        });

        // Validate phone
        form.querySelectorAll('[data-validate-phone]').forEach(field => {
          if (field.value && !/^\d{10}$/.test(field.value.replace(/[\s\-\+]/g, '').replace(/^91/, ''))) {
            isValid = false;
            showFieldError(field, 'Please enter a valid 10-digit phone number');
          }
        });

        if (isValid) {
          // Show success
          const successMsg = document.createElement('div');
          successMsg.className = 'form-success';
          successMsg.style.cssText = 'text-align:center; padding:1.5rem; background:rgba(78,224,194,0.1); border:1px solid rgba(78,224,194,0.3); border-radius:12px; color:#4ee0c2; margin-top:1rem; font-weight:500;';
          successMsg.textContent = '✓ Your message has been sent successfully! We\'ll get back to you soon.';

          // Check if success message already exists
          const existingSuccess = form.parentElement.querySelector('.form-success');
          if (existingSuccess) existingSuccess.remove();

          form.parentElement.appendChild(successMsg);
          form.reset();

          // Remove success after 5 seconds
          setTimeout(() => successMsg.remove(), 5000);
        }
      });
    });
  }

  function showFieldError(field, message) {
    field.style.borderColor = '#f87171';
    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;
    field.parentElement.appendChild(error);
  }

  // ---------- Ripple Button Effect ----------
  function initRippleButtons() {
    document.querySelectorAll('.btn-ripple').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ---------- Portfolio Filter ----------
  function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-card');
    if (!filterBtns.length || !items.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        items.forEach(item => {
          const cats = (item.getAttribute('data-category') || '').split(/\s+/);
          if (category === 'all' || cats.includes(category)) {
            item.style.display = '';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => { item.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  // ---------- Active Nav Highlight ----------
  function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ---------- Order Page Category Selection ----------
  function initOrderCategories() {
    const cards = document.querySelectorAll('.order-category-card');
    const hiddenInput = document.querySelector('#order-category-input');
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        if (hiddenInput) {
          hiddenInput.value = card.getAttribute('data-category');
        }
      });
    });
  }

  // ---------- Initialize Everything ----------
  function init() {
    initPreloader();
    initStickyHeader();
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initTypingEffect();
    initParallax();
    initTiltCards();
    initMagneticButtons();
    initParticles();
    initMarquee();
    initBackToTop();
    initSmoothScroll();
    initFormValidation();
    initRippleButtons();
    initPortfolioFilter();
    initActiveNav();
    initOrderCategories();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
