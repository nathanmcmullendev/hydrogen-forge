/**
 * Frame Customizer Types
 * Simple PNG overlay approach for framed product previews
 */

/** Single frame option */
export interface FrameOption {
  id: string;
  name: string;
  /** Transparent PNG with frame + shadow */
  overlayUrl: string;
  /** Price modifier in cents (e.g., 2500 = +$25) */
  priceModifier?: number;
  /** Swatch color for selection UI */
  swatchColor?: string;
}

/** FrameCustomizer component props */
export interface FrameCustomizerProps {
  /** Base artwork image URL */
  artworkUrl: string;
  artworkAlt?: string;
  /** Available frame options */
  frames: FrameOption[];
  /** Default selected frame ID (null = no frame) */
  defaultFrameId?: string | null;
  /** Show "No Frame" option */
  showNoFrame?: boolean;
  /** Callback when selection changes */
  onSelect?: (frame: FrameOption | null) => void;
  /** Container class */
  className?: string;
}
