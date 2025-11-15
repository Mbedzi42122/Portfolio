// Animate skill bars when they appear in the viewport

const skillBars = document.querySelectorAll(".skill-bar");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      const bar = entry.target;
      const fill = bar.querySelector(".skill-fill");
      const knob = bar.querySelector(".skill-knob");

      const finalValue = bar.getAttribute("data-value");

      // Start animation from 0
      fill.style.width = "0%";
      knob.style.left = "0%";

      // Run animation after short delay
      setTimeout(() => {
        fill.style.transition = "width 1.8s ease";
        knob.style.transition = "left 1.8s ease";

        fill.style.width = finalValue + "%";
        knob.style.left = finalValue + "%";
      }, 150);

      // Stop observing after animation runs once
      observer.unobserve(bar);
    }
  });
}, { threshold: 0.4 }); // triggers when 40% is visible


skillBars.forEach(bar => observer.observe(bar));
