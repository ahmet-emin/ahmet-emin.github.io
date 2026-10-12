const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = siteNav ? [...siteNav.querySelectorAll('a')] : [];
const mobileMenu = window.matchMedia('(max-width: 520px)');

function setMenu(open, restoreFocus = false) {
    if (!navToggle || !siteNav) return;

    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    siteNav.classList.toggle('is-open', open);
    if (restoreFocus) navToggle.focus();
}

if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
        setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navLinks.forEach((link) => link.addEventListener('click', () => {
        setMenu(false);
        // Move focus out of the collapsed navigation to the selected section.
        if (mobileMenu.matches && link.hash) {
            const section = document.getElementById(link.hash.slice(1));
            if (section) {
                section.setAttribute('tabindex', '-1');
                section.focus({ preventScroll: true });
                section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
            }
        }
    }));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
            setMenu(false, true);
        }
    });

    document.addEventListener('click', (event) => {
        if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) {
            setMenu(false);
        }
    });

    document.addEventListener('focusin', (event) => {
        if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) setMenu(false);
    });

    window.addEventListener('resize', () => {
        if (!mobileMenu.matches) setMenu(false);
    }, { passive: true });
    // Enable the collapsible menu only after its handlers are ready.
    document.documentElement.classList.add('js');
}

const currentYear = document.querySelector('#year');
if (currentYear) currentYear.textContent = new Date().getFullYear();

// Sticky header and current-section indicator share a single scheduled update.
const header = document.querySelector('.site-header');
const navSections = navLinks.map((link) => ({
    link,
    section: document.getElementById(link.hash.slice(1)),
})).filter(({ section }) => section);
let navigationFrame = 0;

function updateNavigation() {
    navigationFrame = 0;
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
    const readingLine = headerHeight + window.innerHeight * 0.22;
    let current = null;
    navSections.forEach((entry) => {
        if (entry.section.getBoundingClientRect().top <= readingLine) current = entry;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = navSections[navSections.length - 1] || null;
    }
    navSections.forEach((entry) => {
        if (entry === current) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
    });
}

function scheduleNavigation() {
    if (!navigationFrame) navigationFrame = window.requestAnimationFrame(updateNavigation);
}

window.addEventListener('scroll', scheduleNavigation, { passive: true });
window.addEventListener('resize', scheduleNavigation, { passive: true });
window.addEventListener('hashchange', scheduleNavigation);
window.addEventListener('load', scheduleNavigation);
if (header && typeof window.ResizeObserver === 'function') new ResizeObserver(scheduleNavigation).observe(header);
updateNavigation();

// Animate each item once, without CSS that can leave content permanently hidden.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningReveals = new Set();
const revealItems = document.querySelectorAll('.section-heading, .game-card, .work-card, .skill, .about-layout, .contact-section > .wrap');
const revealDelays = new WeakMap();
document.querySelectorAll('.games-grid, .work-grid, .skills-grid').forEach((grid) => {
    [...grid.children].forEach((item, index) => revealDelays.set(item, index * 70));
});

if (typeof window.IntersectionObserver === 'function' && typeof Element.prototype.animate === 'function') {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return;
            observer.unobserve(target);
            // Keep linked and keyboard-focused destinations immediately readable.
            if (reducedMotion.matches || target.id === window.location.hash.slice(1) || target.contains(document.activeElement)) return;
            const animation = target.animate([
                { opacity: 0, transform: 'translateY(18px)' },
                { opacity: 1, transform: 'translateY(0)' },
            ], { duration: 460, delay: revealDelays.get(target) || 0, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'backwards' });
            runningReveals.add(animation);
            const forget = () => runningReveals.delete(animation);
            animation.addEventListener('finish', forget, { once: true });
            animation.addEventListener('cancel', forget, { once: true });
        });
    }, { threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
}

reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) runningReveals.forEach((animation) => animation.cancel());
});
// Fast anchor navigation or keyboard focus must never land on fading content.
function revealDestination() {
    runningReveals.forEach((animation) => {
        const target = animation.effect.target;
        if (target.id === window.location.hash.slice(1) || target.contains(document.activeElement)) animation.cancel();
    });
}
window.addEventListener('hashchange', revealDestination);
document.addEventListener('focusin', revealDestination);

// Optional gallery: activated only for authored screenshot/video links.
const gallery = document.querySelector('#project-gallery');
if (gallery && typeof gallery.showModal === 'function') {
    const image = gallery.querySelector('#gallery-image');
    const video = gallery.querySelector('#gallery-video');
    const caption = gallery.querySelector('#gallery-caption');
    const counter = gallery.querySelector('#gallery-counter');
    const title = gallery.querySelector('#gallery-title');
    const previous = gallery.querySelector('[data-gallery-previous]');
    const next = gallery.querySelector('[data-gallery-next]');
    let slides = [];
    let slideIndex = 0;
    let opener = null;

    function clearMedia() {
        video.pause();
        video.removeAttribute('src');
        video.removeAttribute('poster');
        video.load();
        video.hidden = true;
        image.removeAttribute('src');
        image.hidden = true;
    }

    function showSlide(index) {
        slideIndex = (index + slides.length) % slides.length;
        const link = slides[slideIndex];
        const figure = link.closest('figure');
        const thumbnail = link.querySelector('img');
        const description = (figure && figure.querySelector('figcaption')?.textContent.trim()) || thumbnail?.alt || link.getAttribute('aria-label') || 'Oynanış görseli';
        clearMedia();
        if (link.dataset.mediaType === 'video') {
            video.src = link.href;
            if (link.dataset.poster) video.poster = link.dataset.poster;
            video.setAttribute('aria-label', description);
            video.hidden = false;
        } else {
            image.alt = thumbnail?.alt || description;
            image.src = link.href;
            image.hidden = false;
        }
        caption.textContent = description;
        counter.textContent = `${slideIndex + 1} / ${slides.length}`;
        previous.disabled = next.disabled = slides.length < 2;
    }

    document.querySelectorAll('.game-card').forEach((card) => {
        const links = [...card.querySelectorAll('.project-media a[data-gallery][href]')];
        links.forEach((link, index) => link.addEventListener('click', (event) => {
            // Preserve normal link behavior for opening in another tab.
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            opener = link;
            slides = links;
            title.textContent = `${card.querySelector('h3').textContent} — Oynanış`;
            showSlide(index);
            gallery.showModal();
            document.body.classList.add('gallery-open');
        }));
    });
    previous.addEventListener('click', () => showSlide(slideIndex - 1));
    next.addEventListener('click', () => showSlide(slideIndex + 1));
    gallery.querySelector('[data-gallery-close]').addEventListener('click', () => gallery.close());
    gallery.addEventListener('keydown', (event) => {
        if (event.target === video || slides.length < 2) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            showSlide(slideIndex + (event.key === 'ArrowLeft' ? -1 : 1));
        }
    });
    gallery.addEventListener('click', (event) => {
        const bounds = gallery.getBoundingClientRect();
        if (event.target === gallery && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) gallery.close();
    });
    gallery.addEventListener('close', () => {
        clearMedia();
        document.body.classList.remove('gallery-open');
        if (opener) opener.focus({ preventScroll: true });
        slides = [];
    });
}
