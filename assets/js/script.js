document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = siteNav ? [...siteNav.querySelectorAll('a')] : [];

function setMenu(open) {
    if (!navToggle || !siteNav) return;

    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    siteNav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
}

if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
        setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenu(false);
    });

    document.addEventListener('click', (event) => {
        if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) {
            setMenu(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 820) setMenu(false);
    }, { passive: true });
}

function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
    });

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

const currentYear = document.querySelector('#year');
if (currentYear) currentYear.textContent = new Date().getFullYear();
