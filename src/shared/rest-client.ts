import {Settings} from "./settings";
import {Endpoints} from "./endpoints";
import {
    CommandInput,
    ErrorOutput, GenericClient,
    MetadataOutput,
    PlaylistOutput,
    RequestCodeInput,
    RequestCodeOutput,
    RequestInput,
    RequestOutput,
    StateOutput
} from "../interfaces";
import {RepeatMode} from "../enums";

/**
 * A REST client to communicate with the companion servers REST API
 */
export class RestClient implements GenericClient {
    constructor(settings: Settings) {
        this.settings = settings;
    }

    private _settings: Settings;

    /**
     * Get the settings
     * @return {Settings}
     */
    public get settings(): Settings {
        return this._settings;
    }

    /**
     * Set the settings
     * @param {Settings} value
     */
    public set settings(value: Settings) {
        if (value === undefined) {
            throw new Error("Settings cannot be undefined");
        }

        this._settings = value;
    }

    /**
     * Get the metadata from the API
     * @throws {ErrorOutput} If something went wrong
     */
    public async getMetadata(): Promise<MetadataOutput> {
        return await this.get<MetadataOutput>(Endpoints.METADATA);
    }

    /**
     * Get the state from the API
     */
    public async getState(): Promise<StateOutput> {
        return await this.get<StateOutput>(Endpoints.STATE, this.settings.token);
    }

    /**
     * Get the playlists from the API
     */
    public async getPlaylists(): Promise<PlaylistOutput[]> {
        return await this.get<PlaylistOutput[]>(Endpoints.PLAYLISTS, this.settings.token);
    }

    /**
     * Requests a code to exchange for a valid token.
     */
    public async requestCode(): Promise<RequestCodeOutput> {
        return await this.post<RequestCodeOutput, RequestCodeInput>(Endpoints.AUTH_REQUEST_CODE, {
            appId: this.settings.appId,
            appName: this.settings.appName,
            appVersion: this.settings.appVersion
        });
    }

    /**
     * The code you will use when requesting a token
     * @param code The code you got from the requestCode method
     */
    public async request(code: string) {
        return await this.post<RequestOutput, RequestInput>(Endpoints.AUTH_REQUEST, {appId: this.settings.appId, code})
            .then((response) => {
                this.settings.token = response.token;
                return response;
            });
    }

    /**
     * Play or pause the current song
     */
    public async playPause() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "playPause"}, this.settings.token);
    }

    /**
     * Play the current song
     */
    public async play() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "play"}, this.settings.token);
    }

    /**
     * Pause the current song
     */
    public async pause() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "pause"}, this.settings.token);
    }

    /**
     * Increase the volume
     */
    public async volumeUp() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "volumeUp"}, this.settings.token);
    }

    /**
     * Decrease the volume
     */
    public async volumeDown() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "volumeDown"}, this.settings.token);
    }

    /**
     * Set the volume
     * @param data
     */
    public async setVolume(data: number) {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {
            command: "setVolume",
            data
        }, this.settings.token);
    }

    /**
     * Mute the volume
     */
    public async mute() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "mute"}, this.settings.token);
    }

    /**
     * Unmute the volume
     */
    public async unmute() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "unmute"}, this.settings.token);
    }

    /**
     * Seek to a specific time
     * @param data
     */
    public async seekTo(data: number) {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "seekTo", data}, this.settings.token);
    }

    /**
     * Play the next song
     */
    public async next() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "next"}, this.settings.token);
    }

    /**
     * Play the previous song
     */
    public async previous() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "previous"}, this.settings.token);
    }

    /**
     * Set the repeat mode
     * @param data
     */
    public async repeatMode(data: RepeatMode) {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {
            command: "repeatMode",
            data
        }, this.settings.token);
    }

    /**
     * Shuffle the queue
     */
    public async shuffle() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "shuffle"}, this.settings.token);
    }

    /**
     * Play a song from the queue
     * @param data
     */
    public async playQueueIndex(data: number) {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {
            command: "playQueueIndex",
            data
        }, this.settings.token);
    }

    /**
     * Toggle like
     */
    public async toggleLike() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "toggleLike"}, this.settings.token);
    }

    /**
     * Toggle dislike
     */
    public async toggleDislike() {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "toggleDislike"}, this.settings.token);
    }

    /**
     * Get a value from the API
     * @param {string} path The path to the endpoint
     * @param token {string} The token to authenticate
     * @throws {ErrorOutput} If something went wrong
     */
    private async get<T>(path: string, token?: string): Promise<T> {
        let headers = new Headers();

        if (token) {
            headers.append('Authorization', token);
        }

        let response;
        try {
            response = await fetch(`http://${this.settings.host}:${this.settings.port}${path}`, {
                headers: headers,
            });
        } catch (error) {
            throw {
                statusCode: 500,
                error: "Internal Server Error",
                message: (error as Error).message
            } as ErrorOutput;
        }

        const data: T | ErrorOutput = await response.json() as T | ErrorOutput;

        if (this.isErrorResponse(data)) {
            throw data;
        }

        return data;
    }

    private async post<T, B>(path: string, body: B, token?: string): Promise<T> {
        let headers = {};

        if (token) {
            headers = {"Authorization": token};
        }

        if (body) {
            headers = {
                ...headers,
                "Content-Type": "application/json"
            }
        }

        let response: Response;
        try {
            response = await fetch(`http://${this.settings.host}:${this.settings.port}${path}`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify(body) ?? undefined
            });
        } catch (error) {
            throw {
                statusCode: 500,
                error: "Internal Server Error",
                message: (error as Error).message
            } as ErrorOutput;
        }

        const data: T | ErrorOutput = await response.json() as T | ErrorOutput;

        if (this.isErrorResponse(data)) {
            throw data;
        }

        return data;
    }

    private isErrorResponse(data: any): data is ErrorOutput {
        return (data as ErrorOutput)?.statusCode !== undefined;
    }
}