import React, { useEffect, useState } from 'react';
import { CloseIcon, ShieldCheckIcon, CheckCircleIcon } from './common/Icons';
import { validateCheckoutForm, sanitizeInput } from '../utils/security';

/**
 * CheckoutModal Component
 * Loaded lazily via dynamic import (React.lazy).
 * Implements Indian Rupee (₹), UPI / Cash on Delivery payment options,
 * and input validation security.
 */
export function CheckoutModal({
  isOpen,
  onClose,
  cartItems = [],
  total = 0,
  onOrderSuccess
}) {
  const [formData, setFormData] = useState({
    fullName: 'Naveen Kumar',
    phone: '9876543210',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bangalore',
    notes: 'Please ring the doorbell and leave with security if unavailable',
    paymentMethod: 'upi',
    cardNumber: '4242 4242 4242 4242',
    cardExpiry: '12/28',
    cardCvv: '123',
    upiId: 'naveen@okaxis'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateCheckoutForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(`checkout-${firstErrorField}`);
      if (element) element.focus();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedOrderId = 'GB-' + Math.floor(100000 + Math.random() * 900000);
      const confirmation = {
        orderId: generatedOrderId,
        customerName: sanitizeInput(formData.fullName),
        address: sanitizeInput(formData.address),
        total,
        itemsCount: cartItems.reduce((acc, it) => acc + it.quantity, 0),
        estimatedMinutes: 20 + Math.floor(Math.random() * 15)
      };
      setOrderConfirmation(confirmation);
      if (onOrderSuccess) onOrderSuccess(confirmation);
    }, 1200);
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="modal-card checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close checkout modal"
        >
          <CloseIcon />
        </button>

        {orderConfirmation ? (
          /* Order Confirmation Screen */
          <div className="order-success-screen" role="status" aria-live="assertive">
            <div className="success-icon-badge">
              <CheckCircleIcon />
            </div>
            <h2 className="success-title">Order Placed Successfully!</h2>
            <p className="success-subtitle">
              Thank you, <strong>{orderConfirmation.customerName}</strong>! Our kitchen is preparing your authentic Indian meal.
            </p>

            <div className="order-details-box">
              <div className="detail-row">
                <span>Order Reference:</span>
                <strong className="order-id">{orderConfirmation.orderId}</strong>
              </div>
              <div className="detail-row">
                <span>Estimated Delivery:</span>
                <strong className="eta-highlight">{orderConfirmation.estimatedMinutes} minutes</strong>
              </div>
              <div className="detail-row">
                <span>Delivery Address:</span>
                <span>{orderConfirmation.address}</span>
              </div>
              <div className="detail-row">
                <span>Amount Paid:</span>
                <strong className="total-highlight">₹{orderConfirmation.total}</strong>
              </div>
            </div>

            <div className="success-tracker-pill">
              <span className="pulsing-dot" />
              <span>Live Kitchen: Dum cooking &amp; packing in progress</span>
            </div>

            <button
              type="button"
              className="btn-primary full-width"
              onClick={onClose}
              aria-label="Return to Food Menu"
            >
              Order More Dishes
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <>
            <div className="checkout-modal-header">
              <h2 id="checkout-modal-title" className="checkout-title">
                Complete Your Order
              </h2>
              <div className="checkout-badge">
                <ShieldCheckIcon />
                <span>100% Safe &amp; Encrypted</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="checkout-form" noValidate>
              <div className="form-section">
                <h3 className="form-section-title">1. Delivery Address</h3>

                <div className="form-group">
                  <label htmlFor="checkout-fullName">Full Name</label>
                  <input
                    id="checkout-fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="e.g. Madhan Kumar"
                    value={formData.fullName}
                    onChange={handleChange}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'err-fullName' : undefined}
                    className={errors.fullName ? 'input-error' : ''}
                  />
                  {errors.fullName && (
                    <span id="err-fullName" className="error-message" role="alert">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-phone">Mobile Number</label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'err-phone' : undefined}
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && (
                    <span id="err-phone" className="error-message" role="alert">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-address">Delivery Address (House/Flat, Street, Landmark, PIN)</label>
                  <textarea
                    id="checkout-address"
                    name="address"
                    rows="2"
                    required
                    placeholder="Flat 101, Prestige Apartments, Indiranagar, Bangalore - 560038"
                    value={formData.address}
                    onChange={handleChange}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? 'err-address' : undefined}
                    className={errors.address ? 'input-error' : ''}
                  />
                  {errors.address && (
                    <span id="err-address" className="error-message" role="alert">
                      {errors.address}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">2. Payment Method</h3>

                <div
                  className="payment-method-toggle"
                  role="radiogroup"
                  aria-label="Payment Method"
                >
                  <label
                    className={`payment-option ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleChange}
                    />
                    <span>UPI (GPay / PhonePe / Paytm)</span>
                  </label>

                  <label
                    className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <span>Cash on Delivery</span>
                  </label>

                  <label
                    className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                    />
                    <span>Debit / Credit Card</span>
                  </label>
                </div>

                {formData.paymentMethod === 'upi' && (
                  <div className="form-group">
                    <label htmlFor="checkout-upiId">UPI ID / VPA</label>
                    <input
                      id="checkout-upiId"
                      name="upiId"
                      type="text"
                      placeholder="e.g. mobile@upi or name@okaxis"
                      value={formData.upiId}
                      onChange={handleChange}
                      className={errors.upiId ? 'input-error' : ''}
                    />
                    {errors.upiId && (
                      <span className="error-message" role="alert">
                        {errors.upiId}
                      </span>
                    )}
                  </div>
                )}

                {formData.paymentMethod === 'card' && (
                  <div className="card-fields-grid">
                    <div className="form-group col-span-2">
                      <label htmlFor="checkout-cardNumber">Card Number</label>
                      <input
                        id="checkout-cardNumber"
                        name="cardNumber"
                        type="text"
                        maxLength="19"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className={errors.cardNumber ? 'input-error' : ''}
                      />
                      {errors.cardNumber && (
                        <span className="error-message" role="alert">
                          {errors.cardNumber}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="checkout-cardExpiry">Expiry (MM/YY)</label>
                      <input
                        id="checkout-cardExpiry"
                        name="cardExpiry"
                        type="text"
                        maxLength="5"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        className={errors.cardExpiry ? 'input-error' : ''}
                      />
                      {errors.cardExpiry && (
                        <span className="error-message" role="alert">
                          {errors.cardExpiry}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="checkout-cardCvv">CVV</label>
                      <input
                        id="checkout-cardCvv"
                        name="cardCvv"
                        type="password"
                        maxLength="4"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        className={errors.cardCvv ? 'input-error' : ''}
                      />
                      {errors.cardCvv && (
                        <span className="error-message" role="alert">
                          {errors.cardCvv}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="checkout-summary-bar">
                <div>
                  <span className="summary-label">Total to Pay</span>
                  <div className="summary-amount">₹{total}</div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-pay-now"
                  aria-label={`Confirm and Pay ₹${total}`}
                >
                  {isSubmitting ? (
                    <span className="spinner-label">
                      <span className="btn-spinner" /> Processing...
                    </span>
                  ) : (
                    `Place Order • ₹${total}`
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
