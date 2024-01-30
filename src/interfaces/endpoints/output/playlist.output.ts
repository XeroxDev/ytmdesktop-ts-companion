/**
 * This is the output of the playlist endpoint (as a single item, the endpoint will return an array of this)
 */
export interface PlaylistOutput {
    /**
     * The id of the playlist
     */
    id: string;
/**
     * The title of the playlist
     */
    title: string;
}