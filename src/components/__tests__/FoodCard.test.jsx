import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FoodCard from '../FoodCard';

describe('Experiment 1: FoodCard Component Testing (Indian Cuisine & Rupee Currency)', () => {
  const mockFood = {
    id: 'f-test-1',
    foodIdNumber: 2,
    name: 'Special Chicken Biryani',
    category: 'biryani',
    cuisine: 'INDIAN',
    price: 240,
    rating: 4.8,
    reviewsCount: 350,
    prepTime: '25 min',
    calories: '650 kcal',
    tag: 'Popular',
    description: 'Fragrant basmati rice cooked on dum with succulent spiced chicken.',
    image: 'https://example.com/biryani.jpg'
  };

  test('b) renders food information correctly (title, description, price in ₹, cuisine, rating, Food ID)', () => {
    render(<FoodCard food={mockFood} quantityInCart={0} />);

    // Title
    expect(screen.getByText('Special Chicken Biryani')).toBeInTheDocument();

    // Cuisine
    expect(screen.getByText('INDIAN')).toBeInTheDocument();

    // Description
    expect(
      screen.getByText('Fragrant basmati rice cooked on dum with succulent spiced chicken.')
    ).toBeInTheDocument();

    // Price in Rupees (₹240)
    expect(screen.getByText('240')).toBeInTheDocument();
    expect(screen.getByText('₹')).toBeInTheDocument();

    // Rating & Food ID badge
    expect(screen.getByText(/4.8 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByText('Food ID: 2')).toBeInTheDocument();

    // Tag
    expect(screen.getByText('Popular')).toBeInTheDocument();

    // Image alt
    const img = screen.getByAltText('Special Chicken Biryani');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('d) tests add-to-cart action button when item is not in cart', () => {
    const handleAddToCart = jest.fn();
    render(
      <FoodCard
        food={mockFood}
        quantityInCart={0}
        onAddToCart={handleAddToCart}
      />
    );

    const addButton = screen.getByRole('button', {
      name: /Add Special Chicken Biryani to cart/i
    });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(handleAddToCart).toHaveBeenCalledTimes(1);
    expect(handleAddToCart).toHaveBeenCalledWith(mockFood);
  });

  test('d) tests quantity controller actions (+ and -) when item is in cart', () => {
    const handleUpdateQuantity = jest.fn();
    render(
      <FoodCard
        food={mockFood}
        quantityInCart={2}
        onUpdateQuantity={handleUpdateQuantity}
      />
    );

    const qtyElement = screen.getByTestId('qty-f-test-1');
    expect(qtyElement).toHaveTextContent('2');

    // Increase quantity (+)
    const plusButton = screen.getByRole('button', {
      name: /Increase quantity of Special Chicken Biryani/i
    });
    fireEvent.click(plusButton);
    expect(handleUpdateQuantity).toHaveBeenCalledWith('f-test-1', 3);

    // Decrease quantity (-)
    const minusButton = screen.getByRole('button', {
      name: /Decrease quantity of Special Chicken Biryani/i
    });
    fireEvent.click(minusButton);
    expect(handleUpdateQuantity).toHaveBeenCalledWith('f-test-1', 1);
  });

  test('tests view your cart link action', () => {
    const handleOpenCart = jest.fn();
    render(
      <FoodCard
        food={mockFood}
        quantityInCart={0}
        onOpenCart={handleOpenCart}
      />
    );

    const viewCartLink = screen.getByRole('button', {
      name: /View your cart for Special Chicken Biryani/i
    });
    fireEvent.click(viewCartLink);
    expect(handleOpenCart).toHaveBeenCalledTimes(1);
  });
});
