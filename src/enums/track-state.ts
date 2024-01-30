/**
 * The track state.
 */
export enum TrackState {
    /**
     * The track state is unknown.
     */
    UNKNOWN = -1,
    /**
     * The track is paused.
     */
    PAUSED = 0,
    /**
     * The track is playing.
     */
    PLAYING = 1,
    /**
     * The track is buffering.
     */
    BUFFERING = 2,
}