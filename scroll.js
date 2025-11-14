// Select all nav links with a hash
const navLinks = document.querySelectorAll('nav ul li a[href^="#"]');

navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault(); // prevent default jump
    const targetId = this.getAttribute('href').substring(1); // remove '#'
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
