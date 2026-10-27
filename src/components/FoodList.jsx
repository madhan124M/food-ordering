import React, { useMemo, useState } from 'react';
import FoodCard from './FoodCard';
import { SearchIcon, CloseIcon } from './common/Icons';

/**
 * FoodList Component
 * Displays GoodBite search input, category filters, dietary browser pills,
 * sorting selector, and an interactive Menu Category Browser modal.
 */
export function FoodList({
  foods = [],
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
  cartItems = {},
  onAddToCart,
  onUpdateQuantity,
  onViewDetails,
  onOpenCart
}) {
  // Browser state options
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'veg' | 'non-veg' | 'top-rated' | 'budget'
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc'
  const [isMenuBrowserOpen, setIsMenuBrowserOpen] = useState(false);

  // Filtered and sorted dishes
  const filteredFoods = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let list = foods.filter((item) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      // Search query match
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.cuisine && item.cuisine.toLowerCase().includes(query)) ||
        (item.tag && item.tag.toLowerCase().includes(query));

      // Dietary browser filter match
      let matchesDietary = true;
      if (dietaryFilter === 'veg') {
        matchesDietary = item.isVeg === true;
      } else if (dietaryFilter === 'non-veg') {
        matchesDietary = item.isVeg === false;
      } else if (dietaryFilter === 'top-rated') {
        matchesDietary = item.rating >= 4.8;
      } else if (dietaryFilter === 'budget') {
        matchesDietary = item.price <= 200;
      }

      return matchesCategory && matchesSearch && matchesDietary;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [foods, selectedCategory, searchQuery, dietaryFilter, sortBy]);

  return (
    <section id="explore-menu" className="food-list-section" aria-label="GoodBite Menu">
      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-row-layout">
          <div className="search-box-wrapper" role="search">
            <label htmlFor="food-search-input" className="sr-only">
              Search your favourite food
            </label>
            <SearchIcon className="search-icon" />
            <input
              id="food-search-input"
              type="search"
              className="search-input"
              placeholder="Search your favourite food..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              aria-label="Search dishes"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange && onSearchChange('')}
                aria-label="Clear search input"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Interactive Menu Browser Button */}
          <button
            type="button"
            className="btn-browse-menu"
            onClick={() => setIsMenuBrowserOpen(true)}
            aria-label="Open menu browser"
          >
            <span>📖</span>
            <span>Browse Menu</span>
          </button>
        </div>

        {/* Primary Category Pills */}
        {categories.length > 0 && (
          <nav className="category-nav" role="tablist" aria-label="Food Categories">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-tab-${cat.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  className={`category-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                >
                  <span className="cat-icon" aria-hidden="true">{cat.icon}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Browser Options Row: Dietary Filters & Sort Selector */}
        <div className="browser-options-bar" aria-label="Menu browser filters and sort options">
          <div className="dietary-filter-pills" role="radiogroup" aria-label="Dietary preferences">
            <button
              type="button"
              className={`dietary-pill ${dietaryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDietaryFilter('all')}
            >
              All Items
            </button>
            <button
              type="button"
              className={`dietary-pill veg ${dietaryFilter === 'veg' ? 'active' : ''}`}
              onClick={() => setDietaryFilter((prev) => (prev === 'veg' ? 'all' : 'veg'))}
              aria-pressed={dietaryFilter === 'veg'}
            >
              <span className="dot veg" /> Pure Veg
            </button>
            <button
              type="button"
              className={`dietary-pill non-veg ${dietaryFilter === 'non-veg' ? 'active' : ''}`}
              onClick={() => setDietaryFilter((prev) => (prev === 'non-veg' ? 'all' : 'non-veg'))}
              aria-pressed={dietaryFilter === 'non-veg'}
            >
              <span className="dot non-veg" /> Non-Veg
            </button>
            <button
              type="button"
              className={`dietary-pill ${dietaryFilter === 'top-rated' ? 'active' : ''}`}
              onClick={() => setDietaryFilter((prev) => (prev === 'top-rated' ? 'all' : 'top-rated'))}
            >
              ⭐ Top Rated (4.8+)
            </button>
            <button
              type="button"
              className={`dietary-pill ${dietaryFilter === 'budget' ? 'active' : ''}`}
              onClick={() => setDietaryFilter((prev) => (prev === 'budget' ? 'all' : 'budget'))}
            >
              💰 Under ₹200
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="sort-selector-wrapper">
            <label htmlFor="sort-by-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-by-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort dishes"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Customer Rating (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Header / Section Title */}
      <div className="menu-summary" aria-live="polite">
        <div>
          <span className="section-eyebrow">FRESH &amp; DELICIOUS</span>
          <h2 className="section-title">
            {selectedCategory === 'all'
              ? 'Made to make you smile.'
              : categories.find((c) => c.id === selectedCategory)?.label || 'Dishes'}
          </h2>
        </div>
        <span className="results-count">
          Showing {filteredFoods.length} {filteredFoods.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Dishes Grid or Empty State */}
      {filteredFoods.length === 0 ? (
        <div className="empty-state" role="status" aria-label="No dishes found">
          <div className="empty-icon" aria-hidden="true">🍲</div>
          <h3 className="empty-title">No dishes found</h3>
          <p className="empty-text">
            {searchQuery
              ? `We couldn't find any dishes matching "${searchQuery}". Try searching for 'Biryani', 'Paneer', or 'Dosa'.`
              : 'There are no dishes matching the selected browser filters.'}
          </p>
          {(searchQuery || selectedCategory !== 'all' || dietaryFilter !== 'all') && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                if (onSearchChange) onSearchChange('');
                if (onSelectCategory) onSelectCategory('all');
                setDietaryFilter('all');
                setSortBy('recommended');
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="food-grid" role="region" aria-label="Indian Dishes Grid">
          {filteredFoods.map((food) => {
            const qty = cartItems[food.id] || 0;
            return (
              <FoodCard
                key={food.id}
                food={food}
                quantityInCart={qty}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
                onViewDetails={onViewDetails}
                onOpenCart={onOpenCart}
              />
            );
          })}
        </div>
      )}

      {/* Interactive Menu Category Browser Modal */}
      {isMenuBrowserOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMenuBrowserOpen(false);
          }}
        >
          <div
            className="modal-card menu-browser-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Browse Menu Categories"
          >
            <div className="menu-browser-header">
              <div>
                <span className="section-eyebrow">GOODBITE DIRECTORY</span>
                <h3 className="menu-browser-title">Browse Menu by Category</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsMenuBrowserOpen(false)}
                aria-label="Close menu browser"
              >
                <CloseIcon />
              </button>
            </div>

            <p className="menu-browser-desc">
              Select any category to instantly explore dishes, pricing in ₹, and chef specials.
            </p>

            <div className="menu-browser-grid">
              {categories.map((cat) => {
                const count =
                  cat.id === 'all'
                    ? foods.length
                    : foods.filter((f) => f.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`browser-cat-card ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat.id);
                      setIsMenuBrowserOpen(false);
                    }}
                  >
                    <span className="browser-cat-icon">{cat.icon}</span>
                    <div className="browser-cat-info">
                      <h4 className="browser-cat-name">{cat.label}</h4>
                      <span className="browser-cat-count">{count} dishes</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="menu-browser-footer">
              <button
                type="button"
                className="btn-primary full-width"
                onClick={() => setIsMenuBrowserOpen(false)}
              >
                Done Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default FoodList;
