// Select all nav links (we keep the href^="#" selector so anchors like "#" are included)
const navLinks = document.querySelectorAll('nav ul li a[href^="#"]');

navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault(); // prevent default jump

    // get href (may be "#" which becomes empty after substring)
    const href = this.getAttribute('href') || '';
    let targetId = href.startsWith('#') ? href.substring(1) : href;

    // If href is just "#" (empty id), try to infer from link text or data-target
    if (!targetId) {
      // prefer an explicit data-target attribute if present
      if (this.dataset && this.dataset.target) {
        targetId = this.dataset.target;
      } else {
        // fallback: use link text, trimmed and lowercased
        const txt = this.textContent.trim().toLowerCase();

        // map common nav labels to section IDs (add more mappings if needed)
        const map = {
          'skills': 'skills',
          'about': 'about',
          'home': 'home',
          'project': 'project',
          'projects': 'project',
          'contact': 'contact'
        };

        if (map[txt]) targetId = map[txt];
      }
    }

    // final attempt: find the section and scroll
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // optional: if nothing found, do nothing (or you could scroll to top)
      // window.scrollTo({ top: 0, behavior: 'smooth' });
      console.warn('No target section found for:', targetId);
    }
  });
});
