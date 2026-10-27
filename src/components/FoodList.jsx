import React, { useMemo } from 'react';
import FoodCard from './FoodCard';
import { SearchIcon, CloseIcon } from './common/Icons';

/**
 * FoodList Component
 * Displays GoodBite search input, category filters, and authentic Indian dish cards.
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
  // Filtered dishes
  const filteredFoods = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return foods.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.cuisine && item.cuisine.toLowerCase().includes(query)) ||
        (item.tag && item.tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [foods, selectedCategory, searchQuery]);

  return (
    <section id="explore-menu" className="food-list-section" aria-label="GoodBite Menu">
      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar">
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

        {/* Category Pills */}
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
              : 'There are no dishes currently available in this category.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                if (onSearchChange) onSearchChange('');
                if (onSelectCategory) onSelectCategory('all');
              }}
            >
              Reset Filters
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
    </section>
  );
}

export default FoodList;
