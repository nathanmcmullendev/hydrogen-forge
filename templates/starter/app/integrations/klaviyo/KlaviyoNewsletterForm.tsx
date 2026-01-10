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
        // Klaviyo Client API v3 subscription endpoint
        const response = await fetch(
          `https://a.klaviyo.com/client/subscriptions/?company_id=${klaviyo.publicKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              revision: '2024-02-15',
            },
            body: JSON.stringify({
              data: {
                type: 'subscription',
                attributes: {
                  custom_source: source,
                  profile: {
                    data: {
                      type: 'profile',
                      attributes: {
                        email,
                      },
                    },
                  },
                },
                relationships: {
                  list: {
                    data: {
                      type: 'list',
                      id: listId,
                    },
                  },
                },
              },
            }),
          },
        );

        if (response.ok || response.status === 202) {
          setStatus('success');
          setEmail('');
          onSuccess?.();

          // Also identify the user in Klaviyo
          klaviyo.identify({$email: email});
        } else {
          const errorData = await response.json().catch(() => ({}));
          const message =
            errorData?.errors?.[0]?.detail || 'Subscription failed';
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
      onSubmit={handleSubmit}
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
