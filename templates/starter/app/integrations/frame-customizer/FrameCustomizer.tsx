/**
 * FrameCustomizer Component
 * Overlays transparent PNG frames on artwork images
 *
 * Usage:
 * <FrameCustomizer
 *   artworkUrl="/art/wave.jpg"
 *   frames={[
 *     { id: 'black', name: 'Black', overlayUrl: '/frames/black.png' },
 *     { id: 'oak', name: 'Oak', overlayUrl: '/frames/oak.png' },
 *   ]}
 *   onSelect={(frame) => console.log(frame)}
 * />
 */

import {useState, useCallback} from 'react';
import type {FrameCustomizerProps, FrameOption} from './types';

export function FrameCustomizer({
  artworkUrl,
  artworkAlt = 'Product artwork',
  frames,
  defaultFrameId = null,
  showNoFrame = true,
  onSelect,
  className = '',
}: FrameCustomizerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(defaultFrameId);

  const selectedFrame = frames.find((f) => f.id === selectedId) ?? null;

  const handleSelect = useCallback(
    (frame: FrameOption | null) => {
      setSelectedId(frame?.id ?? null);
      onSelect?.(frame);
    },
    [onSelect],
  );

  return (
    <div className={`frame-customizer ${className}`}>
      {/* Preview */}
      <div className="frame-customizer__preview">
        <img
          src={artworkUrl}
          alt={artworkAlt}
          className="frame-customizer__artwork"
        />
        {selectedFrame && (
          <img
            src={selectedFrame.overlayUrl}
            alt=""
            className="frame-customizer__overlay"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Frame Selection */}
      <div
        className="frame-customizer__options"
        role="radiogroup"
        aria-label="Frame options"
      >
        {showNoFrame && (
          <button
            type="button"
            role="radio"
            aria-checked={selectedId === null}
            className={`frame-customizer__option ${
              selectedId === null ? 'frame-customizer__option--selected' : ''
            }`}
            onClick={() => handleSelect(null)}
          >
            <span className="frame-customizer__swatch frame-customizer__swatch--none">
              ✕
            </span>
            <span className="frame-customizer__option-name">No Frame</span>
          </button>
        )}

        {frames.map((frame) => (
          <button
            key={frame.id}
            type="button"
            role="radio"
            aria-checked={selectedId === frame.id}
            className={`frame-customizer__option ${
              selectedId === frame.id
                ? 'frame-customizer__option--selected'
                : ''
            }`}
            onClick={() => handleSelect(frame)}
          >
            <span
              className="frame-customizer__swatch"
              style={{backgroundColor: frame.swatchColor ?? '#333'}}
            />
            <span className="frame-customizer__option-name">{frame.name}</span>
            {frame.priceModifier != null && frame.priceModifier > 0 && (
              <span className="frame-customizer__price">
                +${(frame.priceModifier / 100).toFixed(0)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
