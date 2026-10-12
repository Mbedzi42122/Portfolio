/* =========================================================
   main.js: all the behaviour for the portfolio in one file
   1. Mobile menu
   2. Smooth anchor scrolling
   3. Scroll progress bar, sticky header and active nav link
   4. Reveal-on-scroll
   5. Count-up stats
   6. Typing greeting in the hero ("Hello.")
   7. Project demo videos (play only while visible)
   8. Contact form (Formspree, no page reload)
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasObserver = 'IntersectionObserver' in window;

  const header = document.querySelector('header');
  const navLinks = [...document.querySelectorAll('nav ul li a[href^="#"]')];
  const sections = [...document.querySelectorAll('section[id]')];

  /* ---------- 1. Mobile menu ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const navList = document.querySelector('nav ul');

  if (menuBtn && navList) {
    const icon = menuBtn.querySelector('i');

    menuBtn.setAttribute('role', 'button');
    menuBtn.setAttribute('tabindex', '0');
    menuBtn.setAttribute('aria-label', 'Toggle menu');
    menuBtn.setAttribute('aria-expanded', 'false');

    const setMenu = (open) => {
      navList.classList.toggle('show', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-xmark', open);
      }
    };

    menuBtn.addEventListener('click', () => setMenu(!navList.classList.contains('show')));

    menuBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menuBtn.click();
      }
    });

    // close when a link is chosen, when clicking elsewhere, or on Escape
    navList.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', (e) => {
      if (!navList.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- 2. Smooth anchor scrolling ---------- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');

    // placeholder links (href="#") do nothing until you add a real URL
    if (hash === '#') {
      e.preventDefault();
      return;
    }

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
  });

  /* ---------- 3. Progress bar, sticky header, active nav link ---------- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let ticking = false;

  const onScroll = () => {
    ticking = false;

    const y = window.scrollY;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;

    // progress bar
    bar.style.transform = `scaleX(${maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0})`;

    // header gets a background once the page moves
    if (header) header.classList.toggle('scrolled', y > 20);

    // which section are we in?
    let current = sections[0];
    const line = y + window.innerHeight * 0.35;
    sections.forEach((s) => {
      if (s.offsetTop <= line) current = s;
    });
    if (window.innerHeight + y >= doc.scrollHeight - 4) {
      current = sections[sections.length - 1];   // very bottom = last section
    }

    if (current) {
      navLinks.forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
      });
    }
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- 4. Reveal on scroll ---------- */
  if (hasObserver && !reduceMotion) {
    // Adds the .reveal class; delay follows the element's position among its siblings
    const reveal = (selector, step = 0.1) => {
      document.querySelectorAll(selector).forEach((el) => {
        const index = [...el.parentElement.children].indexOf(el);
        el.style.setProperty('--delay', `${Math.min(index * step, 0.6)}s`);
        el.classList.add('reveal');
      });
    };

    reveal('.about-services li', 0.12);
    reveal('.about-main > *', 0.12);
    reveal('.stack-title');
    reveal('.stack-item', 0.06);
    reveal('.projects-title');
    reveal('.project-text, .project-media', 0.15);
    reveal('.contact-label');
    reveal('.contact-head > *', 0.1);
    reveal('.contact-form .field', 0.1);
    reveal('.contact-submit', 0.1);
    reveal('.footer > *', 0.1);

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  }

  /* ---------- 5. Count-up stats ---------- */
  document.querySelectorAll('.stat strong').forEach((el) => {
    const textNode = el.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

    const end = parseInt(textNode.nodeValue, 10);
    if (Number.isNaN(end) || !hasObserver || reduceMotion) return;   // e.g. "Hons" stays as is

    textNode.nodeValue = '0';

    const counter = new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();

      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);          // ease-out
        textNode.nodeValue = String(Math.round(end * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });

    counter.observe(el);
  });

  /* ---------- 6. Typing greeting in the hero ---------- */
  // Only the word changes; the orange dot and "Software Developer" stay put.
  const hello = document.querySelector('.hero-hello');
  const dot = hello ? hello.querySelector('.dot') : null;
  const wordNode = hello ? hello.firstChild : null;

  if (hello && dot && wordNode && wordNode.nodeType === Node.TEXT_NODE && !reduceMotion) {
    const first = wordNode.nodeValue.trim();
    const greetings = [first, 'Dumela', 'Sawubona', 'Ndaa'];   // edit freely

    const typed = document.createElement('span');
    typed.className = 'typed';
    typed.setAttribute('aria-hidden', 'true');
    typed.textContent = first;

    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');

    hello.setAttribute('aria-label', first + '.');
    hello.replaceChild(typed, wordNode);
    hello.insertBefore(caret, dot);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    (async () => {
      let i = 0;
      await sleep(2800);

      while (true) {
        i = (i + 1) % greetings.length;

        while (typed.textContent.length > 0) {          // delete
          typed.textContent = typed.textContent.slice(0, -1);
          await sleep(45);
        }
        await sleep(250);

        for (const ch of greetings[i]) {                 // type
          typed.textContent += ch;
          await sleep(90);
        }
        await sleep(2400);
      }
    })();
  }

  /* ---------- 7. Project demo videos ---------- */
  // Videos play only while on screen, which saves data and battery.
  const demoVideos = [...document.querySelectorAll('.project-media video')];

  if (demoVideos.length) {
    if (reduceMotion || !hasObserver) {
      // No autoplay: pause the video and let the visitor press play
      demoVideos.forEach((v) => {
        v.pause();
        v.removeAttribute('autoplay');
        v.setAttribute('controls', '');
      });
    } else {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            const playing = video.play();
            // some browsers reject play(); ignore it quietly
            if (playing && typeof playing.catch === 'function') playing.catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.4 });

      demoVideos.forEach((v) => videoObserver.observe(v));
    }
  }

  /* ---------- 8. Contact form (Formspree) ---------- */
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status');
  const submitBtn = document.querySelector('.contact-submit');

  if (form && statusMsg) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // reminder if you forgot to paste your Formspree ID
      if (form.action.includes('YOUR_FORM_ID')) {
        statusMsg.textContent = 'The form is not connected yet. Please email me directly.';
        return;
      }

      statusMsg.textContent = 'Sending...';
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          statusMsg.textContent = 'Thanks! Your message has been sent.';
          form.reset();
        } else {
          statusMsg.textContent = 'Something went wrong. Please try again or email me directly.';
        }
      } catch (err) {
        statusMsg.textContent = 'Network error. Please try again or email me directly.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();