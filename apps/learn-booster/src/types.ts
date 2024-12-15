/**
 * Video Controller Interface
 * Manages video playback operations
 */
export interface VideoController {
  play: () => void;
  pause: () => void;
}

/**
 * Props for the VideoDialog component
 */
export interface VideoDialogProps {
  visible: boolean;
  videoUrl: string;
  videoController?: VideoController;
}

/**
 * Controls returned from the main API
 */
export interface PlayerControls {
  show: () => void;
  hide: () => void;
  video?: VideoController;
}

/**
 * Configuration interface for the video player
 */
export interface Config {
  videoDisplayTimeInMS: number;
  videoUrl: string;
}