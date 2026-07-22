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

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Scroll progress bar ---------- */
  const scrollBar = document.getElementById('scrollBar');
  const updateScrollBar = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (scrollBar) scrollBar.style.width = scrolled + '%';
  };
  window.addEventListener('scroll', updateScrollBar, { passive: true });

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

  /* ---------- Cursor glow (desktop only) ---------- */
  const cursorGlow = document.querySelector('.cursor-glow');
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (cursorGlow && !isTouch) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch) {
    document.querySelectorAll('.btn--magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------- Tilt cards ---------- */
  if (!isTouch) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
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
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const count = window.innerWidth < 700 ? 30 : 60;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createParticles() {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        vy: Math.random() * 0.3 + 0.08,
        alpha: Math.random() * 0.5 + 0.15
      }));
    }
    createParticles();

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,197,255,${p.alpha})`;
        ctx.fill();
        p.y -= p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
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