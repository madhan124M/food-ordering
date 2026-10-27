import React, { useEffect, useState } from 'react';
import { CloseIcon, StarIcon, ClockIcon, FireIcon, PlusIcon, MinusIcon } from './common/Icons';

/**
 * FoodDetailModal Component
 * Loaded lazily via dynamic import (React.lazy).
 * Styled with Rupee (₹) pricing and Indian meal customizer.
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

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(food, detailQuantity);
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
            <div className="detail-price">₹{food.price}</div>
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

          {/* Ingredients list */}
          {food.ingredients && food.ingredients.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title">Ingredients</h4>
              <div className="tags-cloud">
                {food.ingredients.map((ing, i) => (
                  <span key={i} className="ingredient-tag">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens warning */}
          {food.allergens && food.allergens.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title allergen-warning">
                Allergen Information
              </h4>
              <p className="allergen-text">
                Contains: {food.allergens.join(', ')}
              </p>
            </div>
          )}

          {/* Spice Level selection */}
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
              Add {detailQuantity} to cart • ₹{food.price * detailQuantity}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodDetailModal;
