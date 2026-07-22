/* ==========================================================================
   ZOHO DESK — INTERACTIONS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderText = document.getElementById('loaderText');
  const loaderMessages = ['Initializing Workspace...', 'Loading Support Experience...', 'Almost there...'];
  let msgIndex = 0;
  let progress = 0;

  const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % loaderMessages.length;
    if (loaderText) loaderText.textContent = loaderMessages[msgIndex];
  }, 700);

  const progressInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.classList.add('loaded');
        initPageAnimations();
      }, 350);
    }
    if (loaderFill) loaderFill.style.width = progress + '%';
  }, 220);

  /* ---------- Lenis smooth scroll ---------- */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (window.gsap && window.gsap.ticker) {
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    }
  }

  /* ---------- AOS ---------- */
  if (window.AOS) {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 });
  }

  /* ---------- Header scroll state + progress bar (single rAF-throttled listener) ---------- */
  const header = document.getElementById('header');
  const scrollBar = document.getElementById('scrollBar');
  let scrollTicking = false;

  const updateOnScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const scrolled = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (scrollBar) scrollBar.style.width = scrolled + '%';

    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateOnScroll);
      scrollTicking = true;
    }
  }, { passive: true });
  updateOnScroll();

  /* ---------- Mobile nav ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    const expanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', expanded);
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
  }));

  /* ---------- Pointer-driven effects: cursor glow, magnetic buttons, tilt cards ----------
     All three read from a single mousemove listener and write on a single shared
     requestAnimationFrame loop, so fast mouse movement never queues more than
     one DOM write per frame. */
  const cursorGlow = document.querySelector('.cursor-glow');
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const magneticBtns = document.querySelectorAll('.btn--magnetic');
  const tiltCards = document.querySelectorAll('.tilt-card');

  if (isTouch) {
    if (cursorGlow) cursorGlow.style.display = 'none';
  } else {
    let mouseX = 0, mouseY = 0;
    let pointerTicking = false;
    let hoveredBtn = null;
    let hoveredCard = null;

    const applyPointerEffects = () => {
      if (cursorGlow) {
        cursorGlow.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
      }
      if (hoveredBtn) {
        const rect = hoveredBtn.getBoundingClientRect();
        const x = mouseX - rect.left - rect.width / 2;
        const y = mouseY - rect.top - rect.height / 2;
        hoveredBtn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      }
      if (hoveredCard) {
        const rect = hoveredCard.getBoundingClientRect();
        const px = (mouseX - rect.left) / rect.width - 0.5;
        const py = (mouseY - rect.top) / rect.height - 0.5;
        hoveredCard.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
      }
      pointerTicking = false;
    };

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!pointerTicking) {
        requestAnimationFrame(applyPointerEffects);
        pointerTicking = true;
      }
    }, { passive: true });

    magneticBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => { hoveredBtn = btn; btn.style.willChange = 'transform'; });
      btn.addEventListener('mouseleave', () => {
        hoveredBtn = null;
        btn.style.transform = 'translate(0,0)';
        btn.style.willChange = 'auto';
      });
    });

    tiltCards.forEach(card => {
      card.addEventListener('mouseenter', () => { hoveredCard = card; card.style.willChange = 'transform'; });
      card.addEventListener('mouseleave', () => {
        hoveredCard = null;
        card.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
        card.style.willChange = 'auto';
      });
    });
  }

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('.stat-card__num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      el.textContent = (decimals ? value.toFixed(decimals) : Math.floor(value).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (decimals ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Why ring progress ---------- */
  const ring = document.getElementById('whyRing');
  const ringObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && ring) {
        ring.style.strokeDashoffset = 326 - (326 * 0.92);
        ringObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  if (ring) ringObserver.observe(ring);

  /* ---------- Screenshot tabs ---------- */
  const tabs = document.querySelectorAll('.screen-tab');
  const panels = document.querySelectorAll('.screen-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.screen-panel[data-panel="${tab.dataset.target}"]`).classList.add('active');
    });
  });

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const cards = track ? Array.from(track.children) : [];
  let activeIndex = 0;

  if (cards.length) {
    cards.forEach((card, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      if (i === 0) { dot.classList.add('active'); card.classList.add('active'); }
      dot.addEventListener('click', () => setActiveTestimonial(i));
      dotsWrap.appendChild(dot);
    });

    function setActiveTestimonial(i) {
      cards[activeIndex].classList.remove('active');
      dotsWrap.children[activeIndex].classList.remove('active');
      activeIndex = i;
      cards[activeIndex].classList.add('active');
      dotsWrap.children[activeIndex].classList.add('active');
    }

    setInterval(() => {
      setActiveTestimonial((activeIndex + 1) % cards.length);
    }, 5000);
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const wasActive = item.classList.contains('active');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  /* ---------- Demo modal ---------- */
  const demoModal = document.getElementById('demoModal');
  const watchDemo = document.getElementById('watchDemo');
  const demoClose = document.getElementById('demoClose');
  const demoBackdrop = document.getElementById('demoBackdrop');
  const openModal = () => { demoModal.classList.add('active'); demoModal.setAttribute('aria-hidden', 'false'); };
  const closeModal = () => { demoModal.classList.remove('active'); demoModal.setAttribute('aria-hidden', 'true'); };
  if (watchDemo) watchDemo.addEventListener('click', openModal);
  if (demoClose) demoClose.addEventListener('click', closeModal);
  if (demoBackdrop) demoBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------- Smooth anchor scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          if (lenis) lenis.scrollTo(target, { offset: -70 });
          else target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- Particle background ---------- */
  const canvas = document.getElementById('particles');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let rafId = null;
    let running = false;
    const count = window.innerWidth < 700 ? 24 : 45;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        vy: Math.random() * 0.3 + 0.08,
        alpha: Math.random() * 0.5 + 0.15
      }));
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,197,255,${p.alpha})`;
        ctx.fill();
        p.y -= p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      }
      rafId = requestAnimationFrame(drawParticles);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(drawParticles);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    resize();
    createParticles();
    start();

    // Debounced resize — avoids rebuilding the particle field on every pixel of a drag-resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        createParticles();
      }, 200);
    });

    // Pause the canvas loop entirely when the tab is in the background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
  }

  /* ---------- GSAP text reveal + scroll animations ---------- */
  function initPageAnimations() {
    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.reveal-line', {
      yPercent: 110,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.12,
      delay: 0.1
    });

    gsap.from('.hero__visual', {
      opacity: 0,
      x: 40,
      duration: 1.1,
      ease: 'power3.out',
      delay: 0.4
    });

    ScrollTrigger.refresh();
  }

  // in case GSAP finishes loading after loader animation logic runs
  if (loader.classList.contains('hide')) initPageAnimations();
});