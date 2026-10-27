import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cart from '../Cart';

describe('Experiment 1: Cart Component Testing (Rupee Currency & Indian Pricing)', () => {
  const mockItems = [
    {
      id: 'f-1',
      name: 'Special Chicken Biryani',
      price: 240,
      quantity: 2,
      image: 'https://example.com/biryani.jpg'
    },
    {
      id: 'f-2',
      name: 'Paneer Butter Masala',
      price: 190,
      quantity: 1,
      image: 'https://example.com/paneer.jpg'
    }
  ];

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <Cart isOpen={false} items={mockItems} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders empty cart state when items array is empty', () => {
    render(<Cart isOpen={true} items={[]} />);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse food menu/i })).toBeInTheDocument();
  });

  test('b & d) renders cart items with correct Rupee prices, quantities, and totals', () => {
    render(<Cart isOpen={true} items={mockItems} />);

    // Item names
    expect(screen.getByText('Special Chicken Biryani')).toBeInTheDocument();
    expect(screen.getByText('Paneer Butter Masala')).toBeInTheDocument();

    // Quantities
    expect(screen.getByTestId('cart-qty-f-1')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-qty-f-2')).toHaveTextContent('1');

    // Individual item totals (240 * 2 = 480, 190 * 1 = 190)
    expect(screen.getByText('₹480')).toBeInTheDocument();
    expect(screen.getByText('₹190')).toBeInTheDocument();

    // Subtotal: 480 + 190 = 670
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('₹670');

    // Delivery fee is FREE because 670 >= 399
    expect(screen.getByText('FREE')).toBeInTheDocument();

    // GST (5% of 670 = 34)
    expect(screen.getByText('₹34')).toBeInTheDocument();

    // Total: 670 + 0 + 34 = 704
    expect(screen.getByTestId('cart-total')).toHaveTextContent('₹704');
  });

  test('d) tests quantity increment and decrement actions in cart', () => {
    const handleUpdateQuantity = jest.fn();
    render(
      <Cart
        isOpen={true}
        items={mockItems}
        onUpdateQuantity={handleUpdateQuantity}
      />
    );

    // Increase quantity of Special Chicken Biryani
    const plusButtons = screen.getAllByRole('button', {
      name: /Increase Special Chicken Biryani quantity/i
    });
    fireEvent.click(plusButtons[0]);
    expect(handleUpdateQuantity).toHaveBeenCalledWith('f-1', 3);

    // Decrease quantity of Special Chicken Biryani
    const minusButtons = screen.getAllByRole('button', {
      name: /Decrease Special Chicken Biryani quantity/i
    });
    fireEvent.click(minusButtons[0]);
    expect(handleUpdateQuantity).toHaveBeenCalledWith('f-1', 1);
  });

  test('d) tests remove-from-cart action', () => {
    const handleRemoveItem = jest.fn();
    render(
      <Cart
        isOpen={true}
        items={mockItems}
        onRemoveItem={handleRemoveItem}
      />
    );

    const removeBtn = screen.getByRole('button', {
      name: /Remove Paneer Butter Masala from cart/i
    });
    fireEvent.click(removeBtn);
    expect(handleRemoveItem).toHaveBeenCalledWith('f-2');
  });

  test('tests coupon code application and discount recalculation', () => {
    render(<Cart isOpen={true} items={mockItems} />);

    const promoInput = screen.getByPlaceholderText(/Coupon code/i);
    const applyBtn = screen.getByRole('button', { name: /Apply/i });

    // Enter coupon code GOODBITE50 (₹50 discount)
    fireEvent.change(promoInput, { target: { value: 'GOODBITE50' } });
    fireEvent.click(applyBtn);

    // Check discount message
    expect(screen.getByText('₹50 discount applied!')).toBeInTheDocument();

    // Discount amount: -₹50
    expect(screen.getByText('-₹50')).toBeInTheDocument();

    // Recalculated total: (670 - 50) + 0 + (620 * 0.05 = 31) = ₹651
    expect(screen.getByTestId('cart-total')).toHaveTextContent('₹651');
  });

  test('tests checkout and clear cart buttons', () => {
    const handleProceedToCheckout = jest.fn();
    const handleClearCart = jest.fn();

    render(
      <Cart
        isOpen={true}
        items={mockItems}
        onProceedToCheckout={handleProceedToCheckout}
        onClearCart={handleClearCart}
      />
    );

    // Clear cart
    const clearBtn = screen.getByRole('button', { name: /Clear all items from cart/i });
    fireEvent.click(clearBtn);
    expect(handleClearCart).toHaveBeenCalledTimes(1);

    // Proceed to checkout
    const checkoutBtn = screen.getByRole('button', { name: /Proceed to checkout/i });
    fireEvent.click(checkoutBtn);
    expect(handleProceedToCheckout).toHaveBeenCalledTimes(1);
  });
});
