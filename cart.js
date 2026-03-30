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

const cartContent= document.querySelector(".listCart");

const Addtocart = Menuitem => {
    const Itemname=Menuitem.querySelector(".item-name").textContent;
    const ProductPrice=Menuitem.querySelector(".item-price").textContent;

    const CartItems=cartContent.querySelectorAll(".cart-product-title")

    for(let item of CartItems){
        if(item.textContent===Itemname){
            alert("This item has already been selcted!");
            return;
        }
    }
    
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

    Cartbox.querySelector(".cart-remove").addEventListener("click", () => { 
        Cartbox.remove();
        UpdateTotalPrice();
        updateCartCount(-1);
    });

    Cartbox.querySelector(".cart-quanity").addEventListener("click", event => { 
        const numberElement=Cartbox.querySelector(".number");
        const Minusbutton=Cartbox.querySelector("#decerment");
        let quantity=numberElement.textContent;

        if(event.target.id==="decerment"&& quantity>1){
            quantity--;

            if(quantity===1){
                Minusbutton.style.color="#999";
            }
        }
        else if(event.target.id==="increment"){
                quantity++;
                Minusbutton.style.color="#333";
            }

        numberElement.textContent=quantity;
        UpdateTotalPrice();
    });
    UpdateTotalPrice();

    updateCartCount(1);
};

const UpdateTotalPrice= ()=>{
    const TotalPrice=document.querySelector(".total span");
    const CartBoxes=cartContent.querySelectorAll(".cart-box");

    let total=0;
    CartBoxes.forEach(Cartbox=> {
        const priceElement=Cartbox.querySelector(".cart-price");
        const quantiyElement=Cartbox.querySelector(".number");
        const price= priceElement.textContent.replace("$", "");
        const quantity=quantiyElement.textContent;
        total+=price*quantity;

    });
    TotalPrice.textContent=`$${total}`;
};

let CartItemCount=0;
const updateCartCount=change=>{
    const  cartItemCountBadge=document.querySelector(".dot");
    CartItemCount+=change;
    if(CartItemCount>0){
        cartItemCountBadge.style.visibility="visible";
        cartItemCountBadge.textContent=CartItemCount;
    }
    else{
        cartItemCountBadge.style.visibility="hidden";
        cartItemCountBadge.textContent="";
    }
};

const Checkoutbutton=document.querySelector(".Checkout");
Checkoutbutton.addEventListener("click", () =>{
    const cartboxes= cartContent.querySelectorAll(".cart-box");
    if(cartboxes.length===0){
        alert("Your cart is empty. Please add items before checking out");
        return;
    }

    cartboxes.forEach(CartBox=> CartBox.remove());

    CartItemCount=0;
    updateCartCount(0);

    UpdateTotalPrice();

    alert("Thank you for your purchase");
});

const Clearallitems=document.querySelector(".clear");
Clearallitems.addEventListener("click", () =>{
  cartContent.innerHTML = "";
  CartItemCount = 0;
  updateCartCount(0);
  UpdateTotalPrice();
});