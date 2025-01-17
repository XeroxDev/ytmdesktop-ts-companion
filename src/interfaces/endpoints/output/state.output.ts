import {LikeStatus, RepeatMode, TrackState} from "../../../enums"

/**
 * The output of the state endpoint.
 */
export interface StateOutput {
    player: Player
    video: Video | null
    playlistId: string | null
}

export interface Player {
    adPlaying: boolean;
    queue: Queue | null;
    trackState: TrackState;
    videoProgress: number;
    volume: number;
}

export interface Queue {
    autoplay: boolean;
    items: QueueItem[];
    automixItems: QueueItem[];
    isGenerating: boolean;
    isInfinite: boolean;
    repeatMode: RepeatMode;
    selectedItemIndex: number;
}

export interface QueueItem {
    thumbnails: Thumbnail[];
    title: string;
    author: string;
    duration: string;
    selected: boolean;
    videoId: string;
    counterparts: QueueItem[] | null;
}

export interface Video {
    author: string;
    channelId: string;
    title: string;
    album: string;
    albumId: string;
    likeStatus: LikeStatus;
    thumbnails: Thumbnail[];
    durationSeconds: number;
    id: string;
}

export interface Thumbnail {
    url: string;
    width: number;
    height: number;
}