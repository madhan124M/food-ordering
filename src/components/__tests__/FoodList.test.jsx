import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FoodList from '../FoodList';

describe('Experiment 1: FoodList Component Testing (GoodBite Search & Categories)', () => {
  const mockCategories = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'biryani', label: 'Biryani & Rice', icon: '🍚' },
    { id: 'curries', label: 'Curries & Breads', icon: '🥘' }
  ];

  const mockFoods = [
    {
      id: 'f-1',
      foodIdNumber: 1,
      name: 'Special Chicken Biryani',
      category: 'biryani',
      cuisine: 'INDIAN',
      price: 240,
      rating: 4.8,
      tag: 'Popular',
      description: 'Fragrant basmati rice with warm spices and tender chicken.',
      image: 'https://example.com/biryani.jpg'
    },
    {
      id: 'f-2',
      foodIdNumber: 2,
      name: 'Paneer Butter Masala',
      category: 'curries',
      cuisine: 'INDIAN',
      price: 190,
      rating: 4.9,
      tag: "Chef's Special",
      description: 'Cottage cheese cubes in rich buttery cashew tomato gravy.',
      image: 'https://example.com/paneer.jpg'
    },
    {
      id: 'f-3',
      foodIdNumber: 3,
      name: 'Mutton Dum Biryani',
      category: 'biryani',
      cuisine: 'INDIAN',
      price: 320,
      rating: 4.9,
      tag: 'Bestseller',
      description: 'Slow-cooked spiced mutton layered with saffron basmati rice.',
      image: 'https://example.com/mutton.jpg'
    }
  ];

  test('b) renders all food cards and category filter pills', () => {
    render(
      <FoodList
        foods={mockFoods}
        categories={mockCategories}
        selectedCategory="all"
        searchQuery=""
      />
    );

    // Verify dishes are rendered
    expect(screen.getByText('Special Chicken Biryani')).toBeInTheDocument();
    expect(screen.getByText('Paneer Butter Masala')).toBeInTheDocument();
    expect(screen.getByText('Mutton Dum Biryani')).toBeInTheDocument();

    // Verify category navigation buttons
    expect(screen.getByRole('tab', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Biryani & Rice/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Curries & Breads/i })).toBeInTheDocument();

    // Verify item count badge
    expect(screen.getByText('Showing 3 items')).toBeInTheDocument();
  });

  test('c) tests category filtering functionality', () => {
    const handleSelectCategory = jest.fn();
    const { rerender } = render(
      <FoodList
        foods={mockFoods}
        categories={mockCategories}
        selectedCategory="all"
        onSelectCategory={handleSelectCategory}
        searchQuery=""
      />
    );

    // Click Biryani & Rice category pill
    const biryaniTab = screen.getByRole('tab', { name: /Biryani & Rice/i });
    fireEvent.click(biryaniTab);
    expect(handleSelectCategory).toHaveBeenCalledWith('biryani');

    // Rerender with selectedCategory='biryani'
    rerender(
      <FoodList
        foods={mockFoods}
        categories={mockCategories}
        selectedCategory="biryani"
        onSelectCategory={handleSelectCategory}
        searchQuery=""
      />
    );

    // Only biryani items should be visible
    expect(screen.getByText('Special Chicken Biryani')).toBeInTheDocument();
    expect(screen.getByText('Mutton Dum Biryani')).toBeInTheDocument();
    expect(screen.queryByText('Paneer Butter Masala')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 2 items')).toBeInTheDocument();
  });

  test('c) tests search input filtering functionality', () => {
    const handleSearchChange = jest.fn();
    const { rerender } = render(
      <FoodList
        foods={mockFoods}
        categories={mockCategories}
        selectedCategory="all"
        searchQuery=""
        onSearchChange={handleSearchChange}
      />
    );

    const searchInput = screen.getByLabelText('Search dishes');
    expect(searchInput).toBeInTheDocument();

    // Type 'Paneer'
    fireEvent.change(searchInput, { target: { value: 'Paneer' } });
    expect(handleSearchChange).toHaveBeenCalledWith('Paneer');

    // Rerender with searchQuery='Paneer'
    rerender(
      <FoodList
        foods={mockFoods}
        categories={mockCategories}
        selectedCategory="all"
        searchQuery="Paneer"
        onSearchChange={handleSearchChange}
      />
    );

    // Paneer should be visible, others filtered out
    expect(screen.getByText('Paneer Butter Masala')).toBeInTheDocument();
    expect(screen.queryByText('Special Chicken Biryani')).not.toBeInTheDocument();
    expect(screen.queryByText('Mutton Dum Biryani')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 item')).toBeInTheDocument();
  });

  test('c) tests empty state when no dish matches the query', () => {
    render(
      <FoodList
        foods={mockFoods}
        categories={mockCategories}
        selectedCategory="all"
        searchQuery="Sushi Roll"
      />
    );

    expect(screen.getByText('No dishes found')).toBeInTheDocument();
    expect(
      screen.getByText(/We couldn't find any dishes matching "Sushi Roll"/i)
    ).toBeInTheDocument();
  });
});
