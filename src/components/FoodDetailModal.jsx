import React, { useEffect, useState } from 'react';
import { CloseIcon, StarIcon, ClockIcon, FireIcon, PlusIcon, MinusIcon } from './common/Icons';

const AVAILABLE_EXTRAS = [
  { id: 'raita', name: 'Extra Mint Raita & Onion Salad', price: 25 },
  { id: 'salan', name: 'Extra Mirchi Ka Salan', price: 30 },
  { id: 'egg', name: 'Boiled Egg (1 pc)', price: 15 },
  { id: 'ghee', name: 'Extra Desi Ghee Drizzle', price: 20 },
  { id: 'gulab', name: 'Hot Gulab Jamun (1 pc)', price: 40 }
];

/**
 * FoodDetailModal Component
 * Loaded lazily via dynamic import (React.lazy).
 * Includes meal customizations and "Add Extra Accompaniments" (extra dishes add-ons).
 */
export function FoodDetailModal({
  food,
  isOpen,
  onClose,
  onAddToCart,
  quantityInCart = 0
}) {
  const [selectedPortion, setSelectedPortion] = useState('Standard (1-2 persons)');
  const [spiceLevel, setSpiceLevel] = useState('Medium Spicy');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [detailQuantity, setDetailQuantity] = useState(1);

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

  if (!isOpen || !food) return null;

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const extrasTotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const unitPrice = food.price + extrasTotal;
  const grandTotal = unitPrice * detailQuantity;

  const handleAdd = () => {
    if (onAddToCart) {
      const customizedItem = {
        ...food,
        price: unitPrice,
        name:
          selectedExtras.length > 0
            ? `${food.name} (with ${selectedExtras.map((e) => e.name.split('(')[0].trim()).join(', ')})`
            : food.name
      };
      onAddToCart(customizedItem, detailQuantity);
    }
    onClose && onClose();
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
        className="modal-card detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-food-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dish details"
        >
          <CloseIcon />
        </button>

        <div className="detail-media">
          <img
            src={food.image}
            alt={food.name}
            className="detail-image"
            loading="lazy"
          />
          {food.tag && <span className="detail-tag">{food.tag}</span>}
        </div>

        <div className="detail-content">
          <div className="detail-header">
            <div>
              <span className="card-cuisine">{food.cuisine || 'INDIAN'}</span>
              <h2 id="modal-food-title" className="detail-title">
                {food.name}
              </h2>
              <div className="detail-rating">
                <StarIcon />
                <span>{food.rating}</span>
                <span className="reviews">({food.reviewsCount} reviews)</span>
              </div>
            </div>
            <div className="detail-price">₹{unitPrice}</div>
          </div>

          <p className="detail-description">{food.description}</p>

          <div className="detail-metrics">
            <div className="metric-pill">
              <ClockIcon />
              <span>Prep: {food.prepTime}</span>
            </div>
            <div className="metric-pill">
              <FireIcon />
              <span>Calories: {food.calories}</span>
            </div>
            <div className="metric-pill">
              <span>Food ID: {food.foodIdNumber || food.id}</span>
            </div>
          </div>

          {/* Spice Preference */}
          <div className="detail-section">
            <h4 className="detail-section-title">Spice Preference</h4>
            <div className="portion-selector" role="radiogroup" aria-label="Spice level">
              {['Mild', 'Medium Spicy', 'Extra Spicy'].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  role="radio"
                  aria-checked={spiceLevel === lvl}
                  className={`portion-btn ${spiceLevel === lvl ? 'active' : ''}`}
                  onClick={() => setSpiceLevel(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Add Extra Accompaniments / Extra Dishes */}
          <div className="detail-section">
            <h4 className="detail-section-title">
              Add Extra Accompaniments (Optional)
            </h4>
            <div className="extras-selector-list">
              {AVAILABLE_EXTRAS.map((extra) => {
                const isChecked = Boolean(selectedExtras.find((e) => e.id === extra.id));
                return (
                  <label
                    key={extra.id}
                    className={`extra-option-row ${isChecked ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleExtra(extra)}
                    />
                    <span className="extra-name">{extra.name}</span>
                    <span className="extra-price">+₹{extra.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="detail-section">
            <label htmlFor="special-instructions" className="detail-section-title">
              Cooking Instructions / Notes
            </label>
            <input
              id="special-instructions"
              type="text"
              maxLength={100}
              className="instructions-input"
              placeholder="e.g. Less oil, extra onions and lemon..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <div className="quantity-controller" role="group" aria-label="Portion quantity">
              <button
                type="button"
                className="qty-btn minus"
                onClick={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <MinusIcon />
              </button>
              <span className="qty-count">{detailQuantity}</span>
              <button
                type="button"
                className="qty-btn plus"
                onClick={() => setDetailQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <PlusIcon />
              </button>
            </div>

            <button
              type="button"
              className="btn-add-modal"
              onClick={handleAdd}
              aria-label={`Add ${detailQuantity} of ${food.name} to cart`}
            >
              Add {detailQuantity} to cart • ₹{grandTotal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodDetailModal;
