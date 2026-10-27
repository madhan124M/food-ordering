/**
 * Front-end Security Utilities
 * Implements input validation, XSS mitigation/sanitization, and safe parsing.
 */

/**
 * Sanitizes generic user input string to prevent cross-site scripting (XSS)
 * and strip hazardous characters.
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // strip opening/closing tags
    .replace(/javascript:/gi, '') // prevent pseudo-protocol injection
    .replace(/on\w+=/gi, '') // prevent inline event handler injection
    .trim();
}

/**
 * Validates and sanitizes search queries.
 * Limits query length to prevent ReDoS / excessive filter lag.
 */
export function validateSearchQuery(query) {
  if (!query) return '';
  const sanitized = sanitizeInput(query);
  return sanitized.slice(0, 60); // Cap length
}

/**
 * Validates checkout form data
 * @param {Object} data - Form values
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateCheckoutForm(data) {
  const errors = {};

  // Full Name validation
  const name = sanitizeInput(data.fullName || '');
  if (!name) {
    errors.fullName = 'Full name is required';
  } else if (name.length < 3) {
    errors.fullName = 'Name must be at least 3 characters';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    errors.fullName = 'Name contains invalid characters';
  }

  // Phone validation (standard 10-digit or valid international format)
  const phone = sanitizeInput(data.phone || '').replace(/[\s()-]/g, '');
  if (!phone) {
    errors.phone = 'Phone number is required';
  } else if (!/^\+?[0-9]{10,15}$/.test(phone)) {
    errors.phone = 'Please enter a valid phone number (10-15 digits)';
  }

  // Delivery Address validation
  const address = sanitizeInput(data.address || '');
  if (!address) {
    errors.address = 'Delivery address is required';
  } else if (address.length < 8) {
    errors.address = 'Please provide a more detailed address (min 8 chars)';
  }

  // Payment Method validation
  const validPaymentMethods = ['card', 'upi', 'cod'];
  if (!validPaymentMethods.includes(data.paymentMethod)) {
    errors.paymentMethod = 'Please select a valid payment method';
  }

  // Card validation (if card chosen)
  if (data.paymentMethod === 'card') {
    const cardNumber = (data.cardNumber || '').replace(/\s+/g, '');
    if (!cardNumber || !/^[0-9]{16}$/.test(cardNumber)) {
      errors.cardNumber = 'Card number must be 16 digits';
    }
    const expiry = (data.cardExpiry || '').trim();
    if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      errors.cardExpiry = 'Expiry must be in MM/YY format';
    }
    const cvv = (data.cardCvv || '').trim();
    if (!cvv || !/^[0-9]{3,4}$/.test(cvv)) {
      errors.cardCvv = 'CVV must be 3 or 4 digits';
    }
  }

  // UPI validation (if upi chosen)
  if (data.paymentMethod === 'upi') {
    const upiId = sanitizeInput(data.upiId || '');
    if (!upiId || !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      errors.upiId = 'Enter a valid UPI ID (e.g. name@okhdfcbank)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Safe JSON parser with fallback to avoid app crashes
 */
export function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.warn('Failed to parse JSON safely:', err);
    return fallback;
  }
}
