const Carticon= document.querySelector(".cart-icon");
const Cart=document.querySelector(".cartTab");
const Cartclose=document.querySelector(".x-btn");
const overlay=document.querySelector(".overlay");
const Addcartbuttons=document.querySelectorAll(".add-to-cart");

Carticon.addEventListener("click", () => {
    Cart.classList.add("active");
    overlay.classList.add("active");
});

Cartclose.addEventListener("click", () => {
    Cart.classList.remove("active");
    overlay.classList.remove("active");
});

Addcartbuttons.forEach(button => {
    button.addEventListener("click", event=>{
        const Menuitem=event.target.closest(".menu-item");
        Addtocart(Menuitem);
    });
});

const cartContent= document.querySelector(".listCart")
const Addtocart = Menuitem => {
    const Itemname=Menuitem.querySelector(".item-name").textContent;
    const ProductPrice=Menuitem.querySelector(".item-price").textContent;

    const Cartbox=document.createElement("div");

    Cartbox.classList.add("cart-box");
    Cartbox.innerHTML=`
    <div class="cart-detail">
    <h2 class="cart-product-title">${Itemname}</h2>
              <span class="cart-price">${ProductPrice}</span>
              <div class="cart-quanity">
                <button id="decerment">-</button>
                <span class="number">1</span>
                <button id="increment">+</button>
              </div>
            </div>
            <i class="fa-regular fa-trash-can cart-remove"></i>
    `;
    cartContent.appendChild(Cartbox);
};
