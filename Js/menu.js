const menuBtn = document.querySelector(".menu-btn");
const navList = document.querySelector("nav ul");

menuBtn.addEventListener("click", () => {
    navList.classList.toggle("show");
});
