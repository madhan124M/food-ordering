import React, { useEffect, useState } from 'react';
import { CloseIcon, PlusIcon, MinusIcon, TrashIcon, ShieldCheckIcon } from './common/Icons';

/**
 * Cart Component (Drawer)
 * Uses Indian Rupee (₹), delivery threshold (Free above ₹399 or ₹40),
 * GST calculation, and promo code discounts.
 */
export function Cart({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout
}) {
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState(null);

  // Keyboard navigation: ESC closes cart drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose && onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Calculations in Indian Rupees (₹)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 399 ? 0 : 40;
  const effectiveDiscount = Math.min(subtotal, discountAmount);
  const gst = Math.round((subtotal - effectiveDiscount) * 0.05);
  const total = Math.max(0, subtotal - effectiveDiscount + deliveryFee + gst);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'GOODBITE50') {
      setDiscountAmount(50);
      setPromoMessage({ type: 'success', text: '₹50 discount applied!' });
    } else if (cleanCode === 'FIRSTORDER') {
      const discount = Math.round(subtotal * 0.2);
      setDiscountAmount(discount);
      setPromoMessage({ type: 'success', text: `20% (₹${discount}) discount applied!` });
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid code. Try "GOODBITE50"' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="cart-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Cart Header */}
        <div className="cart-header">
          <div className="cart-title-wrapper">
            <h2 className="cart-title">Your cart</h2>
            <span className="cart-badge" aria-label={`${items.length} items in cart`}>
              {items.reduce((acc, it) => acc + it.quantity, 0)}
            </span>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Cart Body */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty" role="status" aria-label="Your cart is empty">
              <div className="empty-cart-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Explore our menu and add authentic Indian dishes to get started.</p>
              <button
                type="button"
                className="btn-primary"
                onClick={onClose}
                aria-label="Browse food menu"
              >
                Explore menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <ul className="cart-items-list" aria-label="List of cart items">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="cart-item"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                      loading="lazy"
                    />
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-price">
                        ₹{item.price} each
                      </div>
                      <div className="cart-item-controls">
                        <div
                          className="quantity-controller small"
                          role="group"
                          aria-label={`Quantity controls for ${item.name}`}
                        >
                          <button
                            type="button"
                            className="qty-btn minus"
                            onClick={() =>
                              onUpdateQuantity &&
                              onUpdateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <MinusIcon />
                          </button>
                          <span
                            className="qty-count"
                            data-testid={`cart-qty-${item.id}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="qty-btn plus"
                            onClick={() =>
                              onUpdateQuantity &&
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <PlusIcon />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => onRemoveItem && onRemoveItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      ₹{item.price * item.quantity}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Promo Code Section */}
              <form className="promo-section" onSubmit={handleApplyPromo}>
                <div className="promo-input-group">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. GOODBITE50)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    aria-label="Enter promotional discount code"
                  />
                  <button type="submit" className="btn-apply-promo">
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`promo-message ${promoMessage.type}`} role="alert">
                    {promoMessage.text}
                  </p>
                )}
              </form>

              {/* Summary Calculations in Rupees */}
              <div className="cart-summary" aria-label="Order Cost Breakdown">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">₹{subtotal}</span>
                </div>
                {effectiveDiscount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-₹{effectiveDiscount}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Delivery Partner Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="free-tag">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Govt. Taxes &amp; GST (5%)</span>
                  <span>₹{gst}</span>
                </div>
                <div className="summary-row total">
                  <span>To Pay</span>
                  <span data-testid="cart-total">₹{total}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-footer-security">
              <ShieldCheckIcon />
              <span>100% Secure &amp; Hygienic Delivery</span>
            </div>
            <div className="cart-footer-actions">
              <button
                type="button"
                className="btn-clear-cart"
                onClick={onClearCart}
                aria-label="Clear all items from cart"
              >
                Clear Cart
              </button>
              <button
                type="button"
                className="btn-checkout"
                onClick={onProceedToCheckout}
                aria-label="Proceed to checkout"
              >
                Checkout • ₹{total}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
