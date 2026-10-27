import React, { useState, useEffect } from 'react';
import { CloseIcon, PlusIcon } from './common/Icons';
import { sanitizeInput } from '../utils/security';

const PRESET_IMAGES = [
  { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Curry / Gravy', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dosa / South Indian', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tandoori / Starter', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dessert / Sweet', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' }
];

/**
 * AddDishModal Component
 * Allows adding new / extra dishes directly to the live GoodBite menu.
 */
export function AddDishModal({
  isOpen,
  onClose,
  onAddDish,
  categories = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'biryani',
    cuisine: 'INDIAN',
    price: '',
    isVeg: true,
    tag: 'New',
    description: '',
    image: PRESET_IMAGES[0].url,
    prepTime: '20 min',
    calories: '450 kcal'
  });

  const [errors, setErrors] = useState({});

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    const newErrors = {};

    const cleanName = sanitizeInput(formData.name);
    if (!cleanName || cleanName.length < 3) {
      newErrors.name = 'Please enter a valid dish name (min 3 characters)';
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Please enter a valid price in ₹ (e.g. 180)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newDish = {
      id: 'custom-' + Date.now(),
      foodIdNumber: Math.floor(100 + Math.random() * 900),
      name: cleanName,
      category: formData.category,
      cuisine: formData.cuisine,
      price: Math.round(priceNum),
      isVeg: Boolean(formData.isVeg),
      rating: 4.8,
      reviewsCount: 1,
      tag: formData.tag || 'Special',
      description:
        sanitizeInput(formData.description) ||
        'Freshly prepared artisan dish with authentic spices and ingredients.',
      image: formData.image || PRESET_IMAGES[0].url,
      prepTime: formData.prepTime || '20 min',
      calories: formData.calories || '450 kcal',
      ingredients: ['Fresh Ingredients', 'Traditional Spices'],
      allergens: []
    };

    onAddDish && onAddDish(newDish);
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
        className="modal-card add-dish-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-dish-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close add dish modal"
        >
          <CloseIcon />
        </button>

        <div className="add-dish-header">
          <div className="brand-badge-circle small">g</div>
          <div>
            <span className="section-eyebrow">MENU MANAGEMENT</span>
            <h2 id="add-dish-title" className="add-dish-title">
              Add Extra Dish to Menu
            </h2>
          </div>
        </div>

        <p className="add-dish-subtitle">
          Add any new dish to the live food menu with Rupee (₹) pricing, category, and dietary options.
        </p>

        <form onSubmit={handleSubmit} className="add-dish-form" noValidate>
          {/* Dish Name */}
          <div className="form-group">
            <label htmlFor="dish-name">Dish Name *</label>
            <input
              id="dish-name"
              name="name"
              type="text"
              required
              placeholder="e.g. Malabar Fish Curry, Paneer Tikka Masala"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row-2col">
            {/* Category Select */}
            <div className="form-group">
              <label htmlFor="dish-category">Category *</label>
              <select
                id="dish-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
              </select>
            </div>

            {/* Price in Rupees */}
            <div className="form-group">
              <label htmlFor="dish-price">Price in ₹ *</label>
              <input
                id="dish-price"
                name="price"
                type="number"
                min="10"
                step="5"
                required
                placeholder="e.g. 220"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'input-error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
          </div>

          <div className="form-row-2col">
            {/* Dietary Type: Veg / Non-Veg */}
            <div className="form-group">
              <label>Dietary Type</label>
              <div className="veg-toggle-row">
                <button
                  type="button"
                  className={`veg-toggle-btn ${formData.isVeg ? 'active-veg' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, isVeg: true }))}
                >
                  🟢 Pure Veg
                </button>
                <button
                  type="button"
                  className={`veg-toggle-btn ${!formData.isVeg ? 'active-nonveg' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, isVeg: false }))}
                >
                  🔴 Non-Veg
                </button>
              </div>
            </div>

            {/* Tag Badge */}
            <div className="form-group">
              <label htmlFor="dish-tag">Tag / Badge</label>
              <input
                id="dish-tag"
                name="tag"
                type="text"
                placeholder="e.g. Chef's Choice, Bestseller, Spicy"
                value={formData.tag}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="dish-desc">Description</label>
            <textarea
              id="dish-desc"
              name="description"
              rows="2"
              placeholder="e.g. Slow-simmered in rich spices and aromatic gravy, served hot."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Preset Photo Selection */}
          <div className="form-group">
            <label>Select Dish Photo</label>
            <div className="preset-images-row">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`preset-thumb-btn ${formData.image === preset.url ? 'selected' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, image: preset.url }))}
                >
                  <img src={preset.url} alt={preset.label} />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="add-dish-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit-dish"
            >
              <PlusIcon />
              <span>Add Dish to Menu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDishModal;
