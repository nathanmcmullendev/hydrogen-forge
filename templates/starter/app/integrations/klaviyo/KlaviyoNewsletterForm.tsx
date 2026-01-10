/**
 * KlaviyoNewsletterForm
 * Newsletter signup form using Klaviyo Client API
 * For Hydrogen 2025.x / React Router 7
 */

import {useState, useCallback} from 'react';
import {useKlaviyoSafe} from './KlaviyoProvider';
import type {KlaviyoNewsletterFormProps} from './types';

/**
 * Newsletter signup form that subscribes to a Klaviyo list
 *
 * @example
 * ```tsx
 * <KlaviyoNewsletterForm
 *   listId="ABC123"
 *   placeholder="Enter your email"
 *   buttonText="Subscribe"
 *   successMessage="Thanks for subscribing!"
 * />
 * ```
 */
export function KlaviyoNewsletterForm({
  listId,
  source = 'Hydrogen Store',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Thanks for subscribing!',
  className = '',
  onSuccess,
  onError,
}: KlaviyoNewsletterFormProps) {
  const klaviyo = useKlaviyoSafe();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email || !listId) {
        setStatus('error');
        setErrorMessage('Email and list ID are required');
        return;
      }

      if (!klaviyo?.publicKey) {
        setStatus('error');
        setErrorMessage('Klaviyo is not configured');
        onError?.('Klaviyo is not configured');
        return;
      }

      setStatus('loading');
      setErrorMessage('');

      try {
        // Use Klaviyo's _learnq for subscription (avoids CORS issues)
        const _learnq = window._learnq || [];

        // Identify the subscriber
        _learnq.push([
          'identify',
          {
            $email: email,
            $source: source,
          },
        ]);

        // Subscribe to the list using Klaviyo's form submission method
        // This uses their backend proxy which handles CORS
        const formData = new FormData();
        formData.append('email', email);
        formData.append('g', listId); // 'g' is the list ID parameter
        formData.append('$fields', '$source');
        formData.append('$source', source);

        const response = await fetch(
          `https://manage.kmail-lists.com/ajax/subscriptions/subscribe`,
          {
            method: 'POST',
            body: formData,
          },
        );

        const result = (await response.json()) as {
          success?: boolean;
          errors?: string[];
        };

        if (result.success || response.ok) {
          setStatus('success');
          setEmail('');
          onSuccess?.();
        } else {
          const message = result.errors?.[0] ?? 'Subscription failed';
          setStatus('error');
          setErrorMessage(message);
          onError?.(message);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error';
        setStatus('error');
        setErrorMessage(message);
        onError?.(message);
      }
    },
    [email, listId, klaviyo, source, onSuccess, onError],
  );

  // If Klaviyo not configured, render fallback
  if (!klaviyo?.publicKey) {
    return (
      <div className={`klaviyo-newsletter-form ${className}`}>
        <p className="klaviyo-newsletter-disabled">
          Newsletter signup is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`klaviyo-newsletter-form ${className}`}
    >
      {status === 'success' ? (
        <p className="klaviyo-newsletter-success">{successMessage}</p>
      ) : (
        <>
          <div className="klaviyo-newsletter-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              disabled={status === 'loading'}
              className="klaviyo-newsletter-input"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="klaviyo-newsletter-button"
            >
              {status === 'loading' ? 'Subscribing...' : buttonText}
            </button>
          </div>
          {status === 'error' && errorMessage && (
            <p className="klaviyo-newsletter-error">{errorMessage}</p>
          )}
        </>
      )}
    </form>
  );
}
