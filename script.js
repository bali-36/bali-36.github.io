

class Spring {
  constructor({ stiffness = 300, damping = 28, mass = 1 } = {}) {
    this.k = stiffness;
    this.b = damping;
    this.m = mass;
    this.position = 0;
    this.velocity = 0;
    this.target = 0;
    this._raf = null;
    this._cb = null;
  }
  to(target, opts = {}) {
    if (opts.k) this.k = opts.k;
    if (opts.b) this.b = opts.b;
    this.target = target;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._step();
  }
  _step() {
    const dt = 1 / 60;
    const force = -this.k * (this.position - this.target) - this.b * this.velocity;
    this.velocity += (force / this.m) * dt;
    this.position += this.velocity * dt;
    if (this._cb) this._cb(this.position, this.velocity);
    const settled = Math.abs(this.position - this.target) < 0.001 && Math.abs(this.velocity) < 0.001;
    if (!settled) this._raf = requestAnimationFrame(() => this._step());
    else { this.position = this.target; if (this._cb) this._cb(this.position, 0); }
  }
  onUpdate(cb) { this._cb = cb; return this; }
  interrupt(currentValue, currentVelocity = 0) {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.position = currentValue;
    this.velocity = currentVelocity;
  }
}

function initVisitorCounter() {
  try {
    const key = 'mbilal_visits';
    const sessionKey = 'mbilal_session';
    let count = parseInt(localStorage.getItem(key) || '0', 10);
    if (!sessionStorage.getItem(sessionKey)) {
      count += 1;
      localStorage.setItem(key, String(count));
      sessionStorage.setItem(sessionKey, '1');
    }
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.visitor-count, .visitor-count-val').forEach(el => {
      if (isReduced) {
        el.textContent = count.toLocaleString();
        return;
      }
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        // Apple ease-out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (count - start) * easeOut);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  } catch (_) { }
}

function initNavActive() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}

function initPageTransitions() {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isReduced) {
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.36s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      document.body.style.opacity = '1';
    });
  }

  window.addEventListener('pageshow', e => {
    document.body.style.opacity = '1';
    if (e.persisted) {
      document.body.style.transition = 'none';
      requestAnimationFrame(() => {
        document.body.style.transition = '';
      });
    }
  });

  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', e => {
      
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;

      const current = window.location.pathname.split('/').pop() || 'index.html';
      if (href === current) {
        e.preventDefault();
        return;
      }

      if (isReduced) return;

      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 240);
    });
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  let scrim = document.querySelector('.nav-scrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.appendChild(scrim);
  }

  let open = false;

  function setOpen(state) {
    open = state;
    nav.classList.toggle('active', open);
    scrim.classList.toggle('active', open);
    document.body.classList.toggle('nav-open', open);

    const spans = toggle.querySelectorAll('span');
    if (spans.length === 3) {
      spans[0].style.transform = open ? 'rotate(45deg) translate(4.5px, 4.5px)' : '';
      spans[1].style.opacity = open ? '0' : '1';
      spans[2].style.transform = open ? 'rotate(-45deg) translate(6px, -6px)' : '';
    }
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setOpen(!open));

  scrim.addEventListener('click', () => setOpen(false));

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    setOpen(false);
  }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) setOpen(false);
  });
}

function initScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.section').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.04, 0.25)}s`;
    io.observe(el);
  });
  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.08, 0.4)}s`;
    io.observe(el);
  });
}

function initAppleCardHover() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cardSelectors = [
    '.card',
    '.timeline-card',
    '.contact-card',
    '.skill-card',
    '.interest-card',
    '.stat-block'
  ].join(', ');

  const cards = document.querySelectorAll(cardSelectors);

  cards.forEach(card => {
    let ticking = false;
    let mouseX = 0, mouseY = 0;
    let tiltX = 0, tiltY = 0;

    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Apple physical 3D card tilt
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const normX = (mouseX - cx) / cx;
      const normY = (mouseY - cy) / cy;
      tiltX = -normY * 3.5;
      tiltY = normX * 3.5;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          card.style.setProperty('--mouse-x', `${mouseX}px`);
          card.style.setProperty('--mouse-y', `${mouseY}px`);
          card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
          card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
          ticking = false;
        });
      }
    });

    card.addEventListener('pointerenter', () => {
      card.classList.add('is-hovered');
    });

    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-hovered');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

function initTyping() {
  const el = document.querySelector('.typing-text');
  if (!el) return;

  const phrases = [
    "Driven to grow as an ethical hacker.",
    "Passionate about cybersecurity & defense.",
    "CTF enthusiast and problem solver.",
    "Building secure systems, one line at a time.",
    "Turning vulnerabilities into lessons learned."
  ];

  let phraseIndex = 0, charIndex = 0, deleting = false, delay = 110;

  (function tick() {
    const cur = phrases[phraseIndex];
    el.textContent = deleting ? cur.slice(0, charIndex - 1) : cur.slice(0, charIndex + 1);

    if (deleting) { charIndex--; delay = 50; }
    else { charIndex++; delay = 110; }

    if (!deleting && charIndex === cur.length) { delay = 2400; deleting = true; }
    if (deleting && charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 380; }

    setTimeout(tick, delay);
  })();
}

function initHeroParallax() {
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  if (!orb1 || !orb2) return;
  
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let tx1 = 0, ty1 = 0, tx2 = 0, ty2 = 0;
  let cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0;

  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth - 0.5);
    const ny = (e.clientY / window.innerHeight - 0.5);
    tx1 = nx * 40; ty1 = ny * 30;
    tx2 = -nx * 25; ty2 = -ny * 20;
  });

  (function frame() {
    cx1 += (tx1 - cx1) * 0.04;
    cy1 += (ty1 - cy1) * 0.04;
    cx2 += (tx2 - cx2) * 0.04;
    cy2 += (ty2 - cy2) * 0.04;
    orb1.style.transform = `translate(${cx1}px, ${cy1}px)`;
    orb2.style.transform = `translate(${cx2}px, ${cy2}px)`;
    requestAnimationFrame(frame);
  })();
}

function initCertModal() {
  const btns = document.querySelectorAll('.show-cert, .show-certificate');
  if (!btns.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'cert-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Certificate viewer');
  overlay.innerHTML = `
    <div class="cert-sheet">
      <div class="sheet-grab-bar" aria-hidden="true"><span class="sheet-grab-handle"></span></div>
      <button class="cert-close" aria-label="Close">&times;</button>
      <iframe id="certFrame" title="Certificate" src=""></iframe>
    </div>`;
  document.body.appendChild(overlay);

  const sheet = overlay.querySelector('.cert-sheet');
  const frame = overlay.querySelector('#certFrame');
  const closeBtn = overlay.querySelector('.cert-close');
  const grabBar = overlay.querySelector('.sheet-grab-bar');

  function openModal(cert) {
    if (!cert) return;
    let url = cert;
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('assets/')) {
      url = 'assets/certificates/' + cert;
    }
    frame.src = url;
    sheet.style.transform = '';
    sheet.style.transition = '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    sheet.style.transform = '';
    document.body.style.overflow = '';
    setTimeout(() => { frame.src = ''; }, 400);
  }

  // Apple WWDC 2018 Fluid Interface: Gesture tracking, rubberbanding & momentum projection
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let lastY = 0;
  let lastTime = 0;
  let releaseVelocity = 0;

  function rubberband(overshoot, dimension, constant = 0.55) {
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  }

  function project(velocity, decelerationRate = 0.998) {
    return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
  }

  function onPointerDown(e) {
    if (window.innerWidth > 768) return;
    isDragging = true;
    startY = e.clientY;
    lastY = e.clientY;
    lastTime = performance.now();
    releaseVelocity = 0;
    sheet.style.transition = 'none';
    try { grabBar.setPointerCapture(e.pointerId); } catch (_) {}
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) {
      releaseVelocity = ((e.clientY - lastY) / dt) * 1000; // px/s
    }
    lastY = e.clientY;
    lastTime = now;

    const deltaY = e.clientY - startY;
    if (deltaY < 0) {
      // Soft rubberband resistance when dragging up
      currentY = rubberband(deltaY, window.innerHeight, 0.4);
    } else {
      currentY = deltaY;
    }
    sheet.style.transform = `translateY(${currentY}px)`;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    try { grabBar.releasePointerCapture(e.pointerId); } catch (_) {}

    const projected = currentY + project(releaseVelocity, 0.99);
    sheet.style.transition = 'transform 0.36s cubic-bezier(0.25, 1, 0.5, 1)';

    if (projected > 160 || currentY > 160 || releaseVelocity > 450) {
      sheet.style.transform = 'translateY(100%)';
      setTimeout(closeModal, 280);
    } else {
      sheet.style.transform = '';
    }
  }

  grabBar.addEventListener('pointerdown', onPointerDown);
  grabBar.addEventListener('pointermove', onPointerMove);
  grabBar.addEventListener('pointerup', onPointerUp);
  grabBar.addEventListener('pointercancel', onPointerUp);

  btns.forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.cert)));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');

  function validateField(name, value) {
    const group = form.querySelector(`[name="${name}"]`)?.closest('.form-field');
    if (!group) return true;
    let ok = true;
    if (name === 'name' && !value.trim()) ok = false;
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ok = false;
    if (name === 'message' && !value.trim()) ok = false;
    group.classList.toggle('has-error', !ok);
    return ok;
  }

  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('blur', () => validateField(el.name, el.value));
    el.addEventListener('input', () => {
      if (el.closest('.form-field').classList.contains('has-error')) {
        validateField(el.name, el.value);
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = new FormData(form);

    const allOk = ['name', 'email', 'message'].every(n => validateField(n, d.get(n) || ''));
    if (!allOk) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.className = 'form-status';
    status.style.display = 'none';

    try {
      
      const res = await fetch('https://formspree.io/f/mvznvqll', {
        method: 'POST',
        body: d,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        status.textContent = '✓ Message sent! I\'ll reply within 24–48 hours.';
        status.className = 'form-status success';
        form.reset();
      } else { throw new Error(); }
    } catch {
      status.textContent = '✗ Could not send. Email me directly at muhammadbilalbadar36@gmail.com';
      status.className = 'form-status error';
    }
    btn.disabled = false;
    btn.textContent = 'Send Message';
  });
}

function initConsole() {
  const s = [
    'color:#A3E635;font-size:18px;font-weight:700;letter-spacing:-0.02em',
    'color:#A1A1AA;font-size:13px;font-weight:400',
    'color:#A3E635;font-size:12px',
  ];
  console.log('%c⌘ Muhammad Bilal Badar', s[0]);
  console.log('%cCybersecurity Portfolio · bali-36.github.io', s[1]);
  console.log('%cgithub.com/bali-36', s[2]);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavActive();
  initPageTransitions();
  initMobileMenu();
  initScrollReveal();
  initTyping();
  initAppleCardHover();
  initHeroParallax();
  initCertModal();
  initContactForm();
  initVisitorCounter();
  initConsole();
});
