import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import FoodList from './components/FoodList';
import Cart from './components/Cart';
import ErrorBoundary from './components/common/ErrorBoundary';
import { CATEGORIES, FOOD_ITEMS } from './data/foodItems';
import { CartIcon } from './components/common/Icons';
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  generateJwtToken
} from './utils/storage';

// Experiment 2 a & b: Implement lazy loading and code splitting using dynamic imports
const FoodDetailModal = lazy(() => import('./components/FoodDetailModal'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));

export function App() {
  // 1. LocalStorage key 'goodbite_custom_foods' for persisting extra dishes
  const [foods, setFoods] = useState(() => {
    const saved = getStorageItem(STORAGE_KEYS.FOODS, null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return FOOD_ITEMS;
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 2. LocalStorage key 'goodbite_cart' for persisting cart across reloads
  const [cart, setCart] = useState(() => {
    return getStorageItem(STORAGE_KEYS.CART, {});
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeFoodDetail, setActiveFoodDetail] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  // 3. LocalStorage key 'goodbite_user' for persisting logged in profile
  const [userProfile, setUserProfile] = useState(() => {
    return getStorageItem(STORAGE_KEYS.USER, { name: 'Madhan Kumar', email: 'madhan219@gmail.com' });
  });

  // 4. LocalStorage key 'token' for JWT auth token
  const [authToken, setAuthTokenState] = useState(() => {
    let token = getAuthToken();
    if (!token) {
      token = generateJwtToken({ name: 'Madhan Kumar', email: 'madhan219@gmail.com' });
      setAuthToken(token);
    }
    return token;
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.CART, cart);
  }, [cart]);

  // Sync foods to localStorage whenever new dishes are added
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.FOODS, foods);
  }, [foods]);

  // Sync user profile to localStorage
  useEffect(() => {
    if (userProfile) {
      setStorageItem(STORAGE_KEYS.USER, userProfile);
    } else {
      removeStorageItem(STORAGE_KEYS.USER);
    }
  }, [userProfile]);

  // Seed and verify 'token' key in localStorage so it's always available in console
  useEffect(() => {
    let token = getAuthToken();
    if (!token) {
      token = generateJwtToken(userProfile || { name: 'Madhan Kumar', email: 'madhan219@gmail.com' });
      setAuthToken(token);
      setAuthTokenState(token);
    }

    // Expose convenient test function in browser window
    if (typeof window !== 'undefined') {
      window.getToken = () => localStorage.getItem('token');
      console.log(
        '%c[GoodBite] Auth token active in localStorage! Try running: localStorage.getItem("token")',
        'background: #1f4e38; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        localStorage.getItem('token')
      );
    }
  }, [userProfile]);

  // Monitor network status for PWA offline detection (Experiment 2d)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleSearchChange = useCallback((query) => {
    const sanitized = validateSearchQuery(query);
    setSearchQuery(sanitized);
  }, []);

  const handleAddNewDish = useCallback((newDish) => {
    setFoods((prev) => [newDish, ...prev]);
    showToast(`Added "${newDish.name}" to menu!`);
  }, []);

  const handleAddToCart = useCallback((food, addQty = 1) => {
    setCart((prev) => {
      const existing = prev[food.id];
      const currentQty = existing ? existing.quantity : 0;
      return {
        ...prev,
        [food.id]: {
          ...food,
          quantity: currentQty + addQty
        }
      };
    });
    showToast(`Added ${addQty}x "${food.name}" to cart`);
  }, []);

  const handleUpdateQuantity = useCallback((foodId, newQty) => {
    setCart((prev) => {
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[foodId];
        return copy;
      }
      return {
        ...prev,
        [foodId]: {
          ...prev[foodId],
          quantity: newQty
        }
      };
    });
  }, []);

  const handleRemoveFromCart = useCallback((foodId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[foodId];
      return copy;
    });
    showToast('Item removed from cart');
  }, []);

  const handleClearCart = useCallback(() => {
    setCart({});
    showToast('Cart cleared');
  }, []);

  const cartItemsList = Object.values(cart);
  const totalCartCount = cartItemsList.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotal = cartItemsList.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const cartDeliveryFee = cartSubtotal === 0 || cartSubtotal >= 399 ? 0 : 40;
  const cartGst = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + cartDeliveryFee + cartGst : 0;

  const cartQuantities = Object.fromEntries(
    Object.entries(cart).map(([k, v]) => [k, v.quantity])
  );

  const featuredDish = foods.find((f) => f.id === '1') || foods[0];

  return (
    <ErrorBoundary>
      <div className="app-shell goodbite-theme">
        {/* Offline PWA Alert Banner */}
        {!isOnline && (
          <div className="offline-banner" role="status" aria-live="polite">
            <span>📡 You are currently offline. GoodBite is running in cached PWA mode.</span>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="toast-notification" role="status" aria-live="polite">
            <span>✓ {toastMessage}</span>
          </div>
        )}

        {/* GoodBite Top Navigation Header */}
        <header className="app-header">
          <div className="header-container">
            {/* Brand Logo & Name */}
            <a href="#" className="brand-group" aria-label="GoodBite Home">
              <span className="brand-badge-circle" aria-hidden="true">g</span>
              <span className="brand-title">goodbite</span>
            </a>

            {/* Navigation Links */}
            <nav className="header-nav-links" aria-label="Primary Navigation">
              <a href="#" className="nav-link active">Home</a>
              <a href="#explore-menu" className="nav-link">Explore menu</a>
              <a href="#explore-menu" className="nav-link">Browse categories</a>
              <a href="#about" className="nav-link">About</a>
            </nav>

            {/* Header Right Actions: Profile, Token Logout & Your Cart */}
            <div className="header-actions">
              {userProfile ? (
                <div className="user-profile-group">
                  <div className="user-profile-badge" title={`Signed in as ${userProfile.email}`}>
                    <span className="user-avatar-initial">{userProfile.name.charAt(0).toUpperCase()}</span>
                    <span className="user-name">{userProfile.name}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-auth-header signout"
                    onClick={() => {
                      setUserProfile(null);
                      setAuthTokenState(null);
                      removeAuthToken();
                      showToast('Logged out. Token cleared from localStorage.');
                    }}
                    title="Logout & remove token from localStorage"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-auth-header"
                  onClick={() => {
                    setAuthMode('signin');
                    setIsAuthOpen(true);
                  }}
                  aria-label="Sign in to your account"
                >
                  Sign in
                </button>
              )}

              <button
                type="button"
                className="cart-pill-btn"
                onClick={() => setIsCartOpen(true)}
                aria-label={`View your cart, ${totalCartCount} items`}
              >
                <CartIcon />
                <span>Your cart</span>
                <span className="cart-pill-count" data-testid="cart-badge-count">
                  {totalCartCount}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          {/* Hero Section matching screenshot */}
          <section className="hero-banner" aria-label="Hero Section">
            <div className="hero-layout">
              <div className="hero-left">
                <div className="hero-eyebrow">
                  <span className="eyebrow-dot" />
                  <span>GOOD FOOD, GOOD MOOD</span>
                </div>

                <h1 className="hero-heading">
                  Your next favourite meal is <em>right here.</em>
                </h1>

                <p className="hero-desc">
                  Freshly picked favourites, made with care and delivered to your happy place.
                </p>

                <div className="hero-cta-row">
                  <a href="#explore-menu" className="btn-explore-menu">
                    Explore the menu →
                  </a>
                </div>

                <div className="hero-social-proof">
                  <div className="avatar-group">
                    <span className="avatar av-1">👨</span>
                    <span className="avatar av-2">👩</span>
                    <span className="avatar av-3">🧑</span>
                  </div>
                  <div className="social-text">
                    <span className="star-rating">★ 4.8/5</span>
                    <span className="loved-by">Loved by hungry people</span>
                  </div>
                </div>
              </div>

              {/* Decorative Dish Plate Illustration */}
              <div className="hero-right" aria-hidden="true">
                <div className="plate-illustration-wrapper">
                  <div className="orbit-ring-outer" />
                  <div className="orbit-ring-middle" />
                  <div className="plate-center">
                    <div className="plate-soup-bowl">
                      <span className="bowl-dish-emoji">🍜</span>
                    </div>
                  </div>
                  {/* Floating ingredients */}
                  <span className="floating-item item-strawberry">🍓</span>
                  <span className="floating-item item-avocado">🥑</span>
                  <span className="floating-item item-chili">🌶️</span>
                  <span className="floating-item item-badge">Fresh food ✓</span>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Highlight Dish Card (Matching Screenshot) */}
          {featuredDish && (
            <section className="featured-showcase-section" aria-label="Featured Highlight Dish">
              <div className="featured-card">
                <div className="featured-media">
                  <img
                    src={featuredDish.image}
                    alt={featuredDish.name}
                    className="featured-image"
                    loading="lazy"
                  />
                  <span className="featured-tag">Popular</span>
                  <div className="featured-rating-overlay">★ {featuredDish.rating}</div>
                </div>

                <div className="featured-content">
                  <span className="featured-cuisine">{featuredDish.cuisine || 'INDIAN'}</span>
                  <h2 className="featured-title">{featuredDish.name}</h2>
                  <p className="featured-desc">{featuredDish.description}</p>

                  <div className="featured-pills-row">
                    <span className="stat-pill">★ {featuredDish.rating} / 5</span>
                    <span className="id-pill">Food ID: {featuredDish.foodIdNumber || 1}</span>
                  </div>

                  <div className="featured-price">
                    ₹{featuredDish.price}
                  </div>

                  <div className="featured-actions">
                    <button
                      type="button"
                      className="btn-featured-add"
                      onClick={() => handleAddToCart(featuredDish)}
                      aria-label={`Add ${featuredDish.name} to cart`}
                    >
                      + Add to cart
                    </button>
                    <button
                      type="button"
                      className="link-featured-cart"
                      onClick={() => setIsCartOpen(true)}
                    >
                      View your cart →
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Interactive Food Menu & Filters */}
          <FoodList
            foods={foods}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            cartItems={cartQuantities}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onViewDetails={(food) => setActiveFoodDetail(food)}
            onOpenCart={() => setIsCartOpen(true)}
            onAddNewDish={handleAddNewDish}
          />
        </main>

        {/* Cart Drawer */}
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItemsList}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        {/* Lazy Loaded Food Detail Modal with Suspense fallback (Experiment 2a) */}
        {activeFoodDetail && (
          <Suspense
            fallback={
              <div className="modal-overlay" role="status" aria-live="polite">
                <div className="loading-card">
                  <div className="btn-spinner" />
                  <p>Loading dish details...</p>
                </div>
              </div>
            }
          >
            <FoodDetailModal
              food={activeFoodDetail}
              isOpen={Boolean(activeFoodDetail)}
              onClose={() => setActiveFoodDetail(null)}
              onAddToCart={handleAddToCart}
              quantityInCart={cartQuantities[activeFoodDetail.id] || 0}
            />
          </Suspense>
        )}

        {/* Lazy Loaded Checkout Modal with Suspense fallback (Experiment 2a) */}
        {isCheckoutOpen && (
          <Suspense
            fallback={
              <div className="modal-overlay" role="status" aria-live="polite">
                <div className="loading-card">
                  <div className="btn-spinner" />
                  <p>Loading secure checkout...</p>
                </div>
              </div>
            }
          >
            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              cartItems={cartItemsList}
              total={cartTotal}
              onOrderSuccess={() => {
                setCart({});
              }}
            />
          </Suspense>
        )}

        {/* Lazy Loaded Auth Modal (Sign in / Create Account) */}
        {isAuthOpen && (
          <Suspense fallback={null}>
            <AuthModal
              isOpen={isAuthOpen}
              initialMode={authMode}
              onClose={() => setIsAuthOpen(false)}
              onSuccess={(profile) => {
                setUserProfile(profile);
                if (profile.token) {
                  setAuthTokenState(profile.token);
                }
                showToast(`Welcome, ${profile.name}! Token saved.`);
                console.log('%c[GoodBite] Token saved to localStorage["token"]:', 'color: #16a34a; font-weight: bold;', localStorage.getItem('token'));
              }}
            />
          </Suspense>
        )}

        {/* Floating Quick Browse Menu Button */}
        <a href="#explore-menu" className="floating-browse-menu-btn" aria-label="Quick Browse Menu">
          <span>🍽️</span>
          <span>Browse Menu</span>
        </a>

        {/* Accessible GoodBite Footer */}
        <footer id="about" className="app-footer" role="contentinfo">
          <div className="footer-inner">
            <div className="footer-brand-row">
              <span className="brand-badge-circle small">g</span>
              <span className="footer-brand-text">goodbite</span>
            </div>
            <p className="footer-tagline">
              Freshly picked authentic Indian flavours, crafted with love and delivered hot to your doorstep.
            </p>
            <div className="footer-links">
              <span>Home</span>
              <span>•</span>
              <span>Explore menu</span>
              <span>•</span>
              <span>PWA Offline Ready</span>
              <span>•</span>
              <span>Currency: INR (₹)</span>
            </div>
            <p className="footer-copyright">
              © {new Date().getFullYear()} GoodBite Food App. Component Testing (Jest/RTL) &amp; PWA Enabled.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
