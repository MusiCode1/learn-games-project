/**
 * Video Controller Interface
 * Manages video playback operations
 */
export interface VideoController {
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

/**
 * Props for the VideoDialog component
 */
export interface VideoDialogProps {
  visible: boolean;
  videoUrl: string;
  type: string;
  videoController?: VideoController;
  time?: string;
  onVideoEnded?: () => void;
}

/**
 * Controls returned from the main API
 */
export interface PlayerControls {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  video?: VideoController;
}

export interface Config {
  videoDisplayTimeInMS: number;
  videoUrls: string[];
  type: string;
  mode: string;
}

export type ConfigUpdate = Partial<Config>;

export interface FullyKiosk {
  getFileList: (folder: string) => string;
  readFile: (path: string) => string;
}