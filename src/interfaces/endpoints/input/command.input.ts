/**
 * The input for the command endpoint.
 */
export interface CommandInput {
    /**
     * The command to execute.
     */
    command: string | 'playPause' | 'play' | 'pause' | 'volumeUp' | 'volumeDown' | 'setVolume' | 'mute' | 'unmute' | 'seekTo' | 'next' | 'previous' | 'repeatMode' | 'shuffle' | 'playQueueIndex' | 'toggleLike' | 'toggleDislike';
    /**
     * The data to send to the command (if any).
     */
    data?: any;
}