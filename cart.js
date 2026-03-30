const Carticon= document.querySelector(".cart-icon");
const Cart=document.querySelector(".cartTab");
const Cartclose=document.querySelector(".x-btn");
const overlay=document.querySelector(".overlay");
const emptyMessage = document.querySelector(".empty-message");
const listCart = document.querySelector(".listCart");

function updateEmptyMessage() {
  if (listCart.children.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }
}

Carticon.addEventListener("click", () => {
    Cart.classList.add("active");
    overlay.classList.add("active");
});
Cartclose.addEventListener("click", () => {
    Cart.classList.remove("active");
    overlay.classList.remove("active");
});



