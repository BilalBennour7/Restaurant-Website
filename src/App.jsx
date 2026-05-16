import React, { useEffect, useMemo, useState } from "react";
import { clearSavedCart, createOrder, getCart, getMenuItems, saveCart } from "./api";
import { features, galleryItems, menuCategories, navLinks } from "./data";

const CART_SESSION_KEY = "bella-napoli-cart-session";

function getCartSessionId() {
  const storedSessionId = localStorage.getItem(CART_SESSION_KEY);

  if (storedSessionId) {
    return storedSessionId;
  }

  const sessionId = crypto.randomUUID();
  localStorage.setItem(CART_SESSION_KEY, sessionId);
  return sessionId;
}

function App() {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cartSessionId] = useState(getCartSessionId);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getMenuItems()
      .then((items) => {
        if (isMounted) {
          setMenuItems(items);
          setApiError("");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setApiError(`Menu could not be loaded: ${error.message}`);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsMenuLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    getCart(cartSessionId)
      .then((cart) => {
        if (isMounted) {
          setCartItems(cart.items || []);
          setApiError("");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setApiError(`Cart could not be loaded: ${error.message}`);
        }
      })
      .finally(() => {
        if (isMounted) {
          setHasLoadedCart(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cartSessionId]);

  useEffect(() => {
    if (!hasLoadedCart) {
      return;
    }

    saveCart(cartSessionId, cartItems).catch((error) => {
      setApiError(`Cart update could not be saved: ${error.message}`);
    });
  }, [cartItems, cartSessionId, hasLoadedCart]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const visibleMenuItems = menuItems.filter((item) => item.category === activeCategory);

  const activeGalleryItem = galleryItems[activeSlide];

  const addToCart = (item) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const increaseQuantity = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (itemId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const checkout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
    }

    try {
      setIsCheckingOut(true);
      await createOrder(cartItems);
      await clearSavedCart(cartSessionId);
      setCartItems([]);
      setIsCartOpen(false);
      setApiError("");
      alert("Thank you for your purchase! Your order was saved.");
    } catch (error) {
      setApiError(`Order could not be placed: ${error.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const nextSlide = () => {
    setActiveSlide((currentSlide) => (currentSlide + 1) % galleryItems.length);
  };

  const previousSlide = () => {
    setActiveSlide((currentSlide) =>
      currentSlide === 0 ? galleryItems.length - 1 : currentSlide - 1
    );
  };

  const activeCategoryLabel = useMemo(
    () => menuCategories.find((category) => category.id === activeCategory)?.label,
    [activeCategory]
  );

  return (
    <>
      <Navbar cartCount={cartCount} onCartOpen={() => setIsCartOpen(true)} />
      <main>
        <Hero />
        <Features />
        <Gallery
          activeGalleryItem={activeGalleryItem}
          activeSlide={activeSlide}
          onPrevious={previousSlide}
          onNext={nextSlide}
          onSelectSlide={setActiveSlide}
        />
        <Menu
          activeCategory={activeCategory}
          activeCategoryLabel={activeCategoryLabel}
          apiError={apiError}
          isMenuLoading={isMenuLoading}
          visibleMenuItems={visibleMenuItems}
          onCategoryChange={setActiveCategory}
          onAddToCart={addToCart}
        />
        <About />
        <Contact />
      </main>
      <Footer />
      <CartDrawer
        cartItems={cartItems}
        cartTotal={cartTotal}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onClearCart={clearCart}
        onCheckout={checkout}
        onDecreaseQuantity={decreaseQuantity}
        onIncreaseQuantity={increaseQuantity}
        isCheckingOut={isCheckingOut}
        onRemoveItem={removeItem}
      />
    </>
  );
}

function Navbar({ cartCount, onCartOpen }) {
  return (
    <nav className="navbar navbar-expand-lg fixed-top site-navbar">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-3" href="#home">
          <span className="brand-mark">
            <i className="bi bi-fire"></i>
          </span>
          <span>
            <span className="brand-title d-block">Bella Napoli</span>
            <span className="brand-subtitle d-block">Pizzeria & Trattoria</span>
          </span>
        </a>

        <div className="d-flex align-items-center gap-2 order-lg-2">
          <button
            className="btn cart-trigger position-relative"
            type="button"
            onClick={onCartOpen}
            aria-label="Open cart"
          >
            <i className="bi bi-cart3"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse order-lg-1" id="mainNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.href}>
                <a className="nav-link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container position-relative text-center text-white">
        <p className="section-kicker text-white-50">Authentic Neapolitan Pizza Since 1987</p>
        <h1 className="hero-title">Bella Napoli</h1>
        <p className="hero-copy mx-auto">
          Where every pizza tells a story. Handcrafted with the finest ingredients, baked in our
          traditional wood-fired oven.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <a className="btn btn-brand btn-lg" href="#menu">
            <i className="bi bi-menu-button-wide me-2"></i>
            View Our Menu
          </a>
          <a className="btn btn-outline-light btn-lg" href="#contact">
            <i className="bi bi-calendar2-check me-2"></i>
            Reserve a Table
          </a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section-pad bg-warm">
      <div className="container">
        <div className="row g-4">
          {features.map((feature) => (
            <div className="col-md-4" key={feature.title}>
              <article className="feature-card h-100 text-center">
                <span className="feature-icon">
                  <i className={`bi ${feature.icon}`}></i>
                </span>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({ activeGalleryItem, activeSlide, onPrevious, onNext, onSelectSlide }) {
  return (
    <section id="gallery" className="section-pad gallery-section">
      <div className="container">
        <SectionHeading kicker="Our Gallery" title="A Feast for the Eyes" />

        <div className="gallery-stage position-relative overflow-hidden">
          <img src={activeGalleryItem.src} alt={activeGalleryItem.alt} />
          <div className="gallery-caption">
            <h2>{activeGalleryItem.title}</h2>
            <p>
              {activeSlide + 1} / {galleryItems.length}
            </p>
          </div>
          <button className="gallery-arrow gallery-arrow-left" type="button" onClick={onPrevious}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <button className="gallery-arrow gallery-arrow-right" type="button" onClick={onNext}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        <div className="d-flex justify-content-center gap-2 mt-4">
          {galleryItems.map((item, index) => (
            <button
              className={`gallery-dot ${activeSlide === index ? "active" : ""}`}
              type="button"
              key={item.title}
              onClick={() => onSelectSlide(index)}
              aria-label={`Show ${item.title}`}
            ></button>
          ))}
        </div>

        <div className="row g-2 mt-3 gallery-thumbs">
          {galleryItems.map((item, index) => (
            <div className="col-4 col-md-2" key={item.thumb}>
              <button
                className={`thumb-button ${activeSlide === index ? "active" : ""}`}
                type="button"
                onClick={() => onSelectSlide(index)}
              >
                <img src={item.thumb} alt={item.alt} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Menu({
  activeCategory,
  activeCategoryLabel,
  apiError,
  isMenuLoading,
  visibleMenuItems,
  onCategoryChange,
  onAddToCart,
}) {
  return (
    <section id="menu" className="section-pad bg-warm">
      <div className="container">
        <SectionHeading
          kicker="What We Offer"
          title="Our Menu"
          subtitle="Every dish is crafted with passion using authentic Italian recipes and the finest seasonal ingredients."
        />

        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4" role="tablist">
          {menuCategories.map((category) => (
            <button
              className={`btn rounded-pill ${
                activeCategory === category.id ? "btn-brand" : "btn-outline-brand"
              }`}
              type="button"
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="menu-list mx-auto" aria-label={activeCategoryLabel}>
          {apiError && <div className="alert alert-danger">{apiError}</div>}
          {isMenuLoading && <div className="alert alert-light">Loading menu from database...</div>}
          {!isMenuLoading && visibleMenuItems.length === 0 && !apiError && (
            <div className="alert alert-light">No menu items found for this category.</div>
          )}
          {visibleMenuItems.map((item) => (
            <article className="menu-item" key={item.id}>
              <div>
                <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                  <h3 className="mb-0">{item.name}</h3>
                  {(item.badges || []).map((badge) => (
                    <span
                      className={`badge rounded-pill ${
                        badge === "Vegetarian" ? "text-bg-success" : "text-bg-warning"
                      }`}
                      key={badge}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <p>{item.description}</p>
              </div>
              <div className="menu-actions">
                <span className="menu-price">${item.price}</span>
                <button className="btn btn-brand btn-sm" type="button" onClick={() => onAddToCart(item)}>
                  <i className="bi bi-cart-plus me-1"></i>
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section-pad">
      <div className="container">
        <SectionHeading
          kicker="Our Story"
          title="About Bella Napoli"
          subtitle="Three generations of passion, tradition, and the finest pizza."
        />

        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <img
              className="about-image"
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80"
              alt="Bella Napoli dining room"
            />
          </div>
          <div className="col-lg-6 about-copy">
            <h2>From Naples to New York</h2>
            <p>
              In 1987, Nonna Maria Rossi brought her family's treasured pizza recipes from the
              heart of Naples to the streets of New York City. What began as a tiny storefront with
              a single wood-fired oven quickly became a beloved neighborhood gem.
            </p>
            <p>
              Today, her grandson Marco carries on the tradition, hand-stretching every dough,
              sourcing the finest San Marzano tomatoes and fresh mozzarella, and firing each pizza
              in our original brick oven at 900 degrees.
            </p>
            <p>
              At Bella Napoli, great pizza is more than food; it's a gathering place, a celebration
              of community, and a taste of la dolce vita right here in the city.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {["Authentic Recipes", "Finest Ingredients", "Community First"].map((title, index) => (
            <div className="col-md-4" key={title}>
              <article className="value-card h-100">
                <span>{index + 1}</span>
                <h3>{title}</h3>
                <p>
                  {index === 0 &&
                    "Our recipes have been passed down through three generations, unchanged and perfected over time."}
                  {index === 1 &&
                    "We import flour from Italy, use San Marzano tomatoes, and make our mozzarella fresh daily."}
                  {index === 2 &&
                    "From charity events to sponsoring local teams, giving back is part of who we are."}
                </p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const contactCards = [
    ["bi-geo-alt", "Visit Us", "123 Via Roma, Little Italy, NY 10013"],
    ["bi-telephone", "Call Us", "(212) 555-0199"],
    ["bi-envelope", "Email Us", "info@bellanapoli.com"],
    ["bi-clock", "Hours", "Mon-Sat: 11AM-11PM / Sun: 12PM-9PM"],
  ];

  return (
    <section id="contact" className="section-pad bg-warm">
      <div className="container">
        <SectionHeading
          kicker="Get In Touch"
          title="Contact Us"
          subtitle="We'd love to hear from you. Drop us a message or come visit us in Little Italy."
        />

        <div className="row g-5">
          <div className="col-lg-6">
            <div className="row g-3 mb-4">
              {contactCards.map(([icon, label, value]) => (
                <div className="col-sm-6" key={label}>
                  <article className="contact-card h-100">
                    <i className={`bi ${icon}`}></i>
                    <h3>{label}</h3>
                    <p>{value}</p>
                  </article>
                </div>
              ))}
            </div>

            <form className="message-form" onSubmit={(event) => event.preventDefault()}>
              <h2>Send Us a Message</h2>
              <label className="form-label" htmlFor="name">
                Name
              </label>
              <input className="form-control mb-3" id="name" type="text" placeholder="Your full name" />

              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input className="form-control mb-3" id="email" type="email" placeholder="you@example.com" />

              <label className="form-label" htmlFor="message">
                Message
              </label>
              <textarea
                className="form-control mb-3"
                id="message"
                rows="4"
                placeholder="Tell us what's on your mind..."
              ></textarea>
              <button className="btn btn-brand" type="submit">
                <i className="bi bi-send me-2"></i>
                Send Message
              </button>
            </form>
          </div>

          <div className="col-lg-6">
            <div className="map-wrap">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-73.9995%2C40.7178%2C-73.9955%2C40.7215&layer=mapnik&marker=40.7195%2C-73.9973"
                title="Map showing Bella Napoli location"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const socialLinks = [
    { icon: "facebook", url: "https://facebook.com", label: "Facebook" },
    { icon: "instagram", url: "https://instagram.com", label: "Instagram" },
    { icon: "twitter-x", url: "https://x.com", label: "X" },
    { icon: "tiktok", url: "https://tiktok.com", label: "TikTok" },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="brand-mark">
                <i className="bi bi-fire"></i>
              </span>
              <h2>Bella Napoli</h2>
            </div>
            <p>
              Authentic Neapolitan pizza made with love, using traditional recipes passed down
              through three generations.
            </p>
            <div className="d-flex gap-2">
              {socialLinks.map((link) => (
                <a className="social-link" href={link.url} key={link.label} aria-label={link.label}>
                  <i className={`bi bi-${link.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <h3>Business Hours</h3>
            <ul className="footer-list">
              <li>Monday - Thursday: 11AM - 10PM</li>
              <li>Friday - Saturday: 11AM - 11PM</li>
              <li>Sunday: 12PM - 9PM</li>
            </ul>
          </div>
          <div className="col-md-6 col-lg-4">
            <h3>Get in Touch</h3>
            <ul className="footer-list">
              <li>123 Via Roma, Little Italy, NY 10013</li>
              <li>(212) 555-0199</li>
              <li>info@bellanapoli.com</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Bella Napoli Pizzeria & Trattoria. All rights reserved.</div>
    </footer>
  );
}

function CartDrawer({
  cartItems,
  cartTotal,
  isOpen,
  onClose,
  onClearCart,
  onCheckout,
  onDecreaseQuantity,
  onIncreaseQuantity,
  isCheckingOut,
  onRemoveItem,
}) {
  return (
    <>
      <div className={`cart-overlay ${isOpen ? "active" : ""}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${isOpen ? "active" : ""}`} aria-label="Shopping cart">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2>Your Items</h2>
          <button className="btn btn-light icon-button" type="button" onClick={onClose} aria-label="Close cart">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="empty-cart">You currently have no items in cart.</p>
        ) : (
          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>${item.price}</p>
                  <div className="quantity-control">
                    <button type="button" onClick={() => onDecreaseQuantity(item.id)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => onIncreaseQuantity(item.id)}>
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-link text-danger remove-button"
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </article>
            ))}
          </div>
        )}

        <div className="cart-summary">
          <p>
            Total: <span>${cartTotal.toFixed(2)}</span>
          </p>
          <div className="row g-2">
            <div className="col-6">
              <button className="btn btn-outline-danger w-100" type="button" onClick={onClearCart}>
                Clear
              </button>
            </div>
            <div className="col-6">
              <button className="btn btn-brand w-100" type="button" onClick={onCheckout}>
                {isCheckingOut ? "Saving..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function SectionHeading({ kicker, title, subtitle }) {
  return (
    <div className="section-heading text-center mx-auto">
      <p className="section-kicker">{kicker}</p>
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

export default App;
