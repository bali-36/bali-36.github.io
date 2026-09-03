/* ============================================================
   Muhammad Bilal Badar | bali-36.github.io
   ============================================================ */

// ============================================================
// VISITOR COUNTER (localStorage-based, GitHub Pages compatible)
// ============================================================
function initVisitorCounter() {
  try {
    const key = 'mbilal_visits';
    let count = parseInt(localStorage.getItem(key) || '0', 10);
    // Increment only on new session
    const sessionKey = 'mbilal_session';
    if (!sessionStorage.getItem(sessionKey)) {
      count += 1;
      localStorage.setItem(key, String(count));
      sessionStorage.setItem(sessionKey, '1');
    }
    document.querySelectorAll('.visitor-count-val').forEach(el => {
      el.textContent = count.toLocaleString();
    });
  } catch (e) {
    // localStorage not available
  }
}

// ============================================================
// NAVIGATION ACTIVE STATE
// ============================================================
function initNavigation() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page) link.classList.add('active');
    else link.classList.remove('active');
  });
}

// ============================================================
// PAGE TRANSITIONS — fade in/out
// ============================================================
function initPageTransitions() {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });

  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href.startsWith('http') && !href.startsWith('//')) {
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = href; }, 350);
      }
    });
  });
}

// ============================================================
// 3D CARD TILT EFFECT
// ============================================================
function init3DTilt() {
  // Skip on touch devices for performance
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.card, .timeline-content, .contact-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -8;
      const ry = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px) scale3d(1.015,1.015,1.015)`;

      // Shine overlay
      let shine = card.querySelector('.card-shine');
      if (!shine) {
        shine = document.createElement('div');
        shine.className = 'card-shine';
        Object.assign(shine.style, {
          position: 'absolute', inset: '0', pointerEvents: 'none',
          borderRadius: 'inherit', transition: 'opacity 0.3s'
        });
        card.style.position = 'relative';
        card.appendChild(shine);
      }
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(163,230,53,0.15), transparent 55%)`;
      shine.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s, border-color 0.35s';
      const shine = card.querySelector('.card-shine');
      if (shine) shine.style.opacity = '0';
    });
  });
}

// ============================================================
// TYPING EFFECT
// ============================================================
function initTypingEffect() {
  const el = document.querySelector('.typing-text');
  if (!el) return;

  const texts = [
    "Driven to grow as an ethical hacker.",
    "Passionate about cybersecurity & defense.",
    "CTF enthusiast and problem solver.",
    "Building secure systems, one line at a time."
  ];
  let ti = 0, ci = 0, deleting = false, speed = 100;

  (function tick() {
    const cur = texts[ti];
    el.textContent = cur.substring(0, deleting ? ci - 1 : ci + 1);
    if (deleting) { ci--; speed = 45; }
    else { ci++; speed = 100; }

    if (!deleting && ci === cur.length) { speed = 2200; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; ti = (ti + 1) % texts.length; speed = 400; }

    setTimeout(tick, speed);
  })();
}

// ============================================================
// SCROLL ANIMATIONS — IntersectionObserver
// ============================================================
function initScrollAnimations() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.section, .timeline-item').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.05, 0.3)}s`;
    io.observe(el);
  });
}

// ============================================================
// MOBILE MENU
// ============================================================
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  function close() {
    nav.classList.remove('active');
    toggle.classList.remove('active');
  }

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('active');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
  });

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
  });
}

// ============================================================
// CERTIFICATE MODAL
// ============================================================
function initCertificateModal() {
  const btns = document.querySelectorAll('.show-certificate');
  if (!btns.length) return;

  // Create modal DOM
  const overlay = document.createElement('div');
  overlay.className = 'cert-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="cert-modal-inner">
      <a class="cert-modal-external" href="" target="_blank" rel="noopener" title="Open certificate in new tab" aria-label="Open certificate in new tab">↗</a>
      <button class="cert-modal-close" aria-label="Close certificate">&times;</button>
      <iframe id="certFrame" title="Certificate" src=""></iframe>
    </div>`;
  document.body.appendChild(overlay);

  const frame = overlay.querySelector('#certFrame');
  const closeBtn = overlay.querySelector('.cert-modal-close');
  const extLink = overlay.querySelector('.cert-modal-external');

  function resolvePath(certFile) {
    if (!certFile) return '';
    if (certFile.startsWith('assets/') || certFile.includes('/')) {
      return certFile;
    }
    return 'assets/certificates/' + certFile;
  }

  function open(certFile) {
    const path = resolvePath(certFile);
    frame.src = encodeURI(path);
    if (extLink) extLink.href = encodeURI(path);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { 
      frame.src = ''; 
      if (extLink) extLink.href = '';
    }, 400);
  }

  btns.forEach(btn => btn.addEventListener('click', () => open(btn.dataset.cert)));
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// ============================================================
// CONTACT FORM — Formspree integration
// ============================================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');

  function validate(name, email, message) {
    let ok = true;
    // Name
    const ng = form.querySelector('[name="name"]').closest('.form-group');
    if (!name.trim()) { ng.classList.add('has-error'); ok = false; }
    else ng.classList.remove('has-error');
    // Email
    const eg = form.querySelector('[name="email"]').closest('.form-group');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { eg.classList.add('has-error'); ok = false; }
    else eg.classList.remove('has-error');
    // Message
    const mg = form.querySelector('[name="message"]').closest('.form-group');
    if (!message.trim()) { mg.classList.add('has-error'); ok = false; }
    else mg.classList.remove('has-error');
    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const message = data.get('message') || '';

    if (!validate(name, email, message)) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.className = 'form-status'; status.style.display = 'none';

    try {
      // Formspree endpoint — replace YOUR_FORM_ID with actual ID from formspree.io
      const res = await fetch('https://formspree.io/f/mvznvqll', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        status.textContent = '✓ Message sent! I\'ll get back to you within 24-48 hours.';
        status.className = 'form-status success';
        status.style.display = 'block';
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      status.textContent = '✗ Failed to send. Please email me directly at muhammadbilalbadar36@gmail.com';
      status.className = 'form-status error';
      status.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });
}

// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const el = document.querySelector(a.getAttribute('href'));
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

// ============================================================
// CONSOLE BRANDING
// ============================================================
function initConsole() {
  console.log('%c⚡ SYSTEM ACCESS GRANTED ⚡', 'color:#A3E635;font-size:20px;font-weight:bold;');
  console.log('%cMuhammad Bilal Badar — Cybersecurity Portfolio', 'color:#A1A1AA;font-size:14px;');
  console.log('%cgithub.com/bali-36', 'color:#A3E635;font-size:12px;');
}

// ============================================================
// INIT ALL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initPageTransitions();
  initMobileMenu();
  initScrollAnimations();
  init3DTilt();
  initTypingEffect();
  initCertificateModal();
  initContactForm();
  initSmoothScroll();
  initVisitorCounter();
  initConsole();
});
