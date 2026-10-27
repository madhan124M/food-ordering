import React, { memo } from 'react';
import { StarIcon, PlusIcon, MinusIcon } from './common/Icons';

/**
 * Fallback image in case the remote image fails to load
 */
const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20260%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23f3f4f6%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23e5e7eb%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22400%22%20height%3D%22260%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%236b7280%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%3EAuthentic%20Indian%20Dish%3C%2Ftext%3E%3C%2Fsvg%3E';

/**
 * FoodCard Component
 * Styled after GoodBite aesthetic with Rupee (₹) pricing, Indian cuisine tags,
 * veg/non-veg badge, Food ID badge, and "+ Add to cart" / "View your cart ->" controls.
 */
export const FoodCard = memo(function FoodCard({
  food,
  quantityInCart = 0,
  onAddToCart,
  onUpdateQuantity,
  onViewDetails,
  onOpenCart
}) {
  const {
    id,
    foodIdNumber = id,
    name,
    cuisine = 'INDIAN',
    isVeg,
    price,
    rating,
    reviewsCount,
    tag,
    description,
    image
  } = food;

  const handleImageError = (e) => {
    e.target.src = FALLBACK_IMAGE;
  };

  return (
    <article
      className="food-card"
      data-testid={`food-card-${id}`}
      aria-label={`${name}, ₹${price}`}
    >
      {/* Media container */}
      <div className="card-media">
        <img
          src={image || FALLBACK_IMAGE}
          alt={name}
          className="food-image"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        {tag && (
          <span className="card-badge" aria-label={`Badge: ${tag}`}>
            {tag}
          </span>
        )}
        <div className="card-rating-overlay" aria-label={`Rating ${rating} out of 5 stars`}>
          <StarIcon />
          <span>{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        <div className="card-meta-header">
          <span className="card-cuisine">{cuisine}</span>
          {isVeg !== undefined && (
            <span className={`dietary-badge ${isVeg ? 'veg' : 'non-veg'}`}>
              <span className="dietary-dot" />
              <span>{isVeg ? 'Veg' : 'Non-Veg'}</span>
            </span>
          )}
        </div>

        <h3 className="food-title" onClick={() => onViewDetails && onViewDetails(food)}>
          {name}
        </h3>

        <p className="food-description">{description}</p>

        {/* Badges: Rating and Food ID */}
        <div className="card-pill-row">
          <span className="pill-stat">
            <span className="star-icon">★</span> {rating} / 5
          </span>
          <span className="pill-id">Food ID: {foodIdNumber}</span>
        </div>

        {/* Price & Action Row */}
        <div className="card-footer">
          <div className="price-tag">
            <span className="currency">₹</span>
            <span className="amount">{price}</span>
          </div>

          <div className="card-actions">
            {quantityInCart > 0 ? (
              <div
                className="quantity-controller"
                role="group"
                aria-label={`Quantity in cart for ${name}`}
              >
                <button
                  type="button"
                  className="qty-btn minus"
                  onClick={() => onUpdateQuantity && onUpdateQuantity(id, quantityInCart - 1)}
                  aria-label={`Decrease quantity of ${name}`}
                >
                  <MinusIcon />
                </button>
                <span className="qty-count" aria-live="polite" data-testid={`qty-${id}`}>
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  className="qty-btn plus"
                  onClick={() => onUpdateQuantity && onUpdateQuantity(id, quantityInCart + 1)}
                  aria-label={`Increase quantity of ${name}`}
                >
                  <PlusIcon />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-add-cart"
                onClick={() => onAddToCart && onAddToCart(food)}
                aria-label={`Add ${name} to cart`}
              >
                + Add to cart
              </button>
            )}

            <button
              type="button"
              className="link-view-cart"
              onClick={() => (onOpenCart ? onOpenCart() : onViewDetails && onViewDetails(food))}
              aria-label={`View your cart for ${name}`}
            >
              View your cart →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

export default FoodCard;
