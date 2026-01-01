// ============================
// GLOBAL VARIABLES
// ============================

let currentPage = window.location.pathname.split('/').pop() || 'index.html';

// ============================
// PAGE INITIALIZATION
// ============================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initPageTransitions();
    init3DTiltEffect();
    initTypingEffect();
    initScrollAnimations();
    initMobileMenu();
    initCertificateModal();
});

// ============================
// NAVIGATION HIGHLIGHT
// ============================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ============================
// PAGE TRANSITIONS (Fade In)
// ============================

function initPageTransitions() {
    // Fade in animation on page load
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);

    // Smooth transition between pages
    const internalLinks = document.querySelectorAll('a[href$=".html"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Only apply to internal navigation
            if (!href.startsWith('http')) {
                e.preventDefault();
                
                document.body.style.transition = 'opacity 0.4s ease-in-out';
                document.body.style.opacity = '0';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });
    });
}

// ============================
// 3D TILT EFFECT (Mouse Movement)
// ============================

function init3DTiltEffect() {
    const cards = document.querySelectorAll('.card, .timeline-content, .contact-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', handleTilt);
        card.addEventListener('mouseleave', resetTilt);
    });
}

function handleTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation angles (max 15 degrees)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    // Apply 3D transform
    card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateZ(10px)
        scale3d(1.02, 1.02, 1.02)
    `;
    
    // Add shine effect
    const shine = card.querySelector('.card-shine') || createShineElement(card);
    shine.style.background = `
        radial-gradient(
            circle at ${x}px ${y}px,
            rgba(100, 255, 218, 0.2),
            transparent 50%
        )
    `;
}

function resetTilt(e) {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
    
    const shine = card.querySelector('.card-shine');
    if (shine) {
        shine.style.opacity = '0';
    }
}

function createShineElement(card) {
    const shine = document.createElement('div');
    shine.className = 'card-shine';
    shine.style.position = 'absolute';
    shine.style.top = '0';
    shine.style.left = '0';
    shine.style.width = '100%';
    shine.style.height = '100%';
    shine.style.pointerEvents = 'none';
    shine.style.transition = 'opacity 0.3s ease';
    shine.style.borderRadius = 'inherit';
    card.style.position = 'relative';
    card.appendChild(shine);
    return shine;
}

// ============================
// TYPING EFFECT (Hero Section)
// ============================

function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    
    if (!typingElement) return;
    
    const texts = [
        "Driven to grow as an ethical hacker.",
        "Passionate about cybersecurity & defense.",
        "CTF enthusiast and problem solver.",
        "Building secure systems, one line at a time."
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            // Pause at end
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    type();
}

// ============================
// SCROLL ANIMATIONS
// ============================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections and cards
    const animatedElements = document.querySelectorAll('.section, .card, .timeline-item');
    
    animatedElements.forEach((element, index) => {
        // Check if element is already in viewport
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport) {
            // Element is already visible, show immediately
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.transition = `all 0.35s ease ${index * 0.05}s`;
        } else {
            // Element is not visible yet, prepare for animation
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = `all 0.35s ease ${index * 0.05}s`;
        }
        
        observer.observe(element);
    });
}

// ============================
// MOBILE MENU TOGGLE
// ============================

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links a');
    
    if (menuToggle && navLinks) {
        // Toggle menu on hamburger click
        menuToggle.addEventListener('click', () => {
            toggleMobileMenu();
        });
        
        // Close menu when clicking on a link
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                if (navLinks.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    }
    
    function toggleMobileMenu() {
        navLinks.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = menuToggle.querySelectorAll('span');
        const isActive = navLinks.classList.contains('active');
        
        spans[0].style.transform = isActive 
            ? 'rotate(45deg) translate(5px, 5px)' 
            : 'rotate(0) translate(0, 0)';
        spans[1].style.opacity = isActive ? '0' : '1';
        spans[2].style.transform = isActive 
            ? 'rotate(-45deg) translate(7px, -6px)' 
            : 'rotate(0) translate(0, 0)';
    }
}

// ============================
// PARALLAX EFFECT
// ============================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero, .section');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed * 0.1}px)`;
    });
});

// ============================
// CARD HOVER GLOW EFFECT
// ============================

document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Only apply if mouse is near the card
        const distance = Math.sqrt(
            Math.pow(x - rect.width / 2, 2) + 
            Math.pow(y - rect.height / 2, 2)
        );
        
        if (distance < 300) {
            card.style.boxShadow = `
                0 0 ${40 - distance / 10}px rgba(100, 255, 218, ${0.3 - distance / 1000})
            `;
        }
    });
});

// ============================
// SMOOTH SCROLL
// ============================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================
// MATRIX RAIN EFFECT (Optional)
// ============================

function createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.1';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(2, 12, 27, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#64ffda';
        ctx.font = fontSize + 'px monospace';
        
        drops.forEach((y, i) => {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            ctx.fillText(text, x, y * fontSize);
            
            if (y * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        });
    }
    
    setInterval(draw, 33);
}

// Uncomment to enable matrix rain effect
// createMatrixRain();

// ============================
// CERTIFICATE MODAL
// ============================

function initCertificateModal() {
    const modal = document.getElementById('certificateModal');
    const showCertBtns = document.querySelectorAll('.show-certificate');

    // Check if certificate buttons exist (only on certifications page)
    if (showCertBtns.length === 0) {
        return;
    }

    // Show certificate when button is clicked
    showCertBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const certName = this.getAttribute('data-cert');
            const certPath = 'Assets/Certificates/' + certName;
            
            // Open certificate in new tab (works for both PDFs and images)
            const newWindow = window.open(certPath, '_blank');
            
            if (!newWindow) {
                alert('Please allow popups for this website to view certificates.');
            }
        });
    });
}

console.log('%c⚡ SYSTEM ACCESS GRANTED ⚡', 'color: #64ffda; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to Muhammad Bilal Badar\'s Portfolio', 'color: #8892b0; font-size: 14px;');
console.log('%cInterested in the code? Check out my GitHub: github.com/bali-36', 'color: #64ffda; font-size: 12px;');
