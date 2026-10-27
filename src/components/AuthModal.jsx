import React, { useState, useEffect } from 'react';
import { CloseIcon } from './common/Icons';

/**
 * AuthModal Component
 * Implements exact "Create your account" and "Sign in" screens from GoodBite design.
 */
export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin', // 'signin' | 'signup'
  onSuccess
}) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    fullName: 'Madhan',
    email: 'madhan219@gmail.com',
    password: 'password123',
    confirmPassword: 'password123'
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (!formData.fullName.trim()) {
        setErrorMessage('Full name is required.');
        return;
      }
      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      onSuccess && onSuccess({ name: formData.fullName, email: formData.email });
      onClose();
    } else {
      if (formData.email.toLowerCase().includes('rejected')) {
        setErrorMessage('Account access rejected. Try using a valid email.');
        return;
      }
      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      const displayName = formData.email.split('@')[0] || 'Foodie';
      onSuccess && onSuccess({ name: displayName, email: formData.email });
      onClose();
    }
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
        className="modal-card auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'signup' ? 'Create your account' : 'Sign in to GoodBite'}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          <CloseIcon />
        </button>

        <div className="auth-container">
          {/* Green G Circle Logo */}
          <div className="auth-brand-badge">
            <span className="auth-logo-letter">g</span>
          </div>

          {mode === 'signup' ? (
            /* CREATE ACCOUNT SCREEN */
            <>
              <div className="auth-header">
                <span className="auth-eyebrow">JOIN GOODBITE</span>
                <h2 className="auth-heading">
                  Create your <em>account.</em>
                </h2>
                <p className="auth-subheading">
                  Sign up to manage your cart, complete checkout, and keep track of your orders.
                </p>
              </div>

              {errorMessage && <div className="auth-error-banner">{errorMessage}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field-group">
                  <label htmlFor="auth-fullName">Full name</label>
                  <input
                    id="auth-fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field-group">
                  <label htmlFor="auth-email">Email address</label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field-group">
                  <label htmlFor="auth-password">Create password</label>
                  <input
                    id="auth-password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field-group">
                  <label htmlFor="auth-confirmPassword">Confirm password</label>
                  <input
                    id="auth-confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="auth-submit-btn">
                  Create account →
                </button>

                <p className="auth-disclaimer">
                  College demo only: this form creates a local profile and signs you in. It does not store your password or connect to a real account server.
                </p>

                <div className="auth-footer-links">
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={() => {
                        setErrorMessage('');
                        setMode('signin');
                      }}
                    >
                      Sign in
                    </button>
                  </span>
                  <button type="button" className="auth-back-link" onClick={onClose}>
                    ← Back to home
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* SIGN IN SCREEN */
            <>
              <div className="auth-header">
                <span className="auth-eyebrow">WELCOME TO GOODBITE</span>
                <h2 className="auth-heading">
                  Good food starts <em>here.</em>
                </h2>
                <p className="auth-subheading">
                  Sign in to manage your cart, checkout, and see your orders.
                </p>
              </div>

              {errorMessage && <div className="auth-error-banner">{errorMessage}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field-group">
                  <label htmlFor="signin-email">Username or email</label>
                  <input
                    id="signin-email"
                    name="email"
                    type="text"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field-group">
                  <label htmlFor="signin-password">Password</label>
                  <input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="auth-submit-btn">
                  Sign in →
                </button>

                <p className="auth-disclaimer">
                  Student demo: most valid username/email entries and passwords of 6 or more characters work. Use username "rejected" to test the rejected page. No real account or payment is created.
                </p>

                <div className="auth-footer-links">
                  <span>
                    New to GoodBite?{' '}
                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={() => {
                        setErrorMessage('');
                        setMode('signup');
                      }}
                    >
                      Create an account
                    </button>
                  </span>
                  <button type="button" className="auth-back-link" onClick={onClose}>
                    ← Back to home
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
