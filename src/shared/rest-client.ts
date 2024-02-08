import {Settings} from "./settings";
import {Endpoints} from "./endpoints";
import {
    CommandInput,
    ErrorOutput,
    GenericClient,
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
    /**
     * Create a new RestClient
     * @param {Settings} settings - The settings to use
     */
    constructor(settings: Settings) {
        this.settings = settings;
    }

    /**
     * The settings to use
     */
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
     * @param {Settings} value - The settings to set
     */
    public set settings(value: Settings) {
        if (value === undefined) {
            throw new Error("Settings cannot be undefined");
        }

        this._settings = value;
    }

    /**
     * @inheritDoc
     */
    public setAuthToken(token: string): void {
        this.settings = {
            ...this.settings,
            token
        }
    }

    /**
     * Get the metadata from the API
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<MetadataOutput>}
     */
    public async getMetadata(): Promise<MetadataOutput> {
        return await this.get<MetadataOutput>(Endpoints.METADATA);
    }

    /**
     * Get the state from the API
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<StateOutput>}
     */
    public async getState(): Promise<StateOutput> {
        return await this.get<StateOutput>(Endpoints.STATE, this.settings.token);
    }

    /**
     * Get the playlists from the API
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<PlaylistOutput[]>}
     */
    public async getPlaylists(): Promise<PlaylistOutput[]> {
        return await this.get<PlaylistOutput[]>(Endpoints.PLAYLISTS, this.settings.token);
    }

    /**
     * Requests a code to exchange for a valid token.
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<RequestCodeOutput>}
     * @deprecated This is now an alias for {@link getAuthCode}. Use that instead because it's more descriptive. This method will be removed in the next major version.
     */
    public requestCode(): Promise<RequestCodeOutput> {
        return this.getAuthCode();
    }

    /**
     * Requests a code to exchange for a valid token.
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<RequestCodeOutput>}
     */
    public async getAuthCode(): Promise<RequestCodeOutput> {
        return await this.post<RequestCodeOutput, RequestCodeInput>(Endpoints.AUTH_REQUEST_CODE, {
            appId: this.settings.appId,
            appName: this.settings.appName,
            appVersion: this.settings.appVersion
        });
    }

    /**
     * The authentication token that is required to access the API. You should save this token safely. This method will also set the token in the settings itself.
     * @param {string} code - The code you got from the requestCode method
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<RequestOutput>}
     * @deprecated Please use {@link getAuthToken} instead. This method will be removed in the next major version due to the confusing name and the side effect of automatically setting the token in the settings.
     */
    public async request(code: string): Promise<RequestOutput> {
        return await this.getAuthToken(code)
            .then((response) => {
                this.setAuthToken(response.token);
                return response;
            });
    }

    /**
     * Get the authentication token that is required to access the API.
     *
     * You should save this token safely and set it either:
     * 1. in the settings
     * 2. use the {@link setAuthToken} method in this class
     * 3. use the {@link CompanionConnector.setAuthToken setAuthToken} method in the {@link CompanionConnector} class **(recommended)**
     *
     * to set the token for further requests.
     * @param {string} code - The code you got from the {@link getAuthCode} method
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<RequestOutput>}
     */
    public async getAuthToken(code: string): Promise<RequestOutput> {
        return await this.post<RequestOutput, RequestInput>(Endpoints.AUTH_REQUEST, {appId: this.settings.appId, code});
    }

    /**
     * Play or pause the current song
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async playPause(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "playPause"}, this.settings.token);
    }

    /**
     * Play the current song
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async play(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "play"}, this.settings.token);
    }

    /**
     * Pause the current song
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async pause(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "pause"}, this.settings.token);
    }

    /**
     * Increase the volume
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async volumeUp(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "volumeUp"}, this.settings.token);
    }

    /**
     * Decrease the volume
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async volumeDown(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "volumeDown"}, this.settings.token);
    }

    /**
     * Set the volume
     * @param {number} data The volume to set the player to
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async setVolume(data: number): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {
            command: "setVolume",
            data
        }, this.settings.token);
    }

    /**
     * Mute the volume
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async mute(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "mute"}, this.settings.token);
    }

    /**
     * Unmute the volume
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async unmute(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "unmute"}, this.settings.token);
    }

    /**
     * Seek to a specific time
     * @param {number} data - The time to seek to
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async seekTo(data: number): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "seekTo", data}, this.settings.token);
    }

    /**
     * Play the next song
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async next(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "next"}, this.settings.token);
    }

    /**
     * Play the previous song
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async previous(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "previous"}, this.settings.token);
    }

    /**
     * Set the repeat mode
     * @param {RepeatMode} data - The repeat mode to set
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async repeatMode(data: RepeatMode): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {
            command: "repeatMode",
            data
        }, this.settings.token);
    }

    /**
     * Shuffle the queue
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async shuffle(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "shuffle"}, this.settings.token);
    }

    /**
     * Play a song from the queue
     * @param {number} data - The index of the song to play
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async playQueueIndex(data: number): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {
            command: "playQueueIndex",
            data
        }, this.settings.token);
    }

    /**
     * Toggle like
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async toggleLike(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "toggleLike"}, this.settings.token);
    }

    /**
     * Toggle dislike
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<void>}
     */
    public async toggleDislike(): Promise<void> {
        return await this.post<void, CommandInput>(Endpoints.COMMAND, {command: "toggleDislike"}, this.settings.token);
    }

    /**
     * Get a value from the API
     * @typeParam T - The type of the response
     * @param {string} path - The path to the endpoint
     * @param {string} token - The token to authenticate
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<T>}
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

    /**
     * Post a value to the API
     * @typeParam T - The type of the response
     * @typeParam B - The type of the body
     * @param {string} path - The path to the endpoint
     * @param {B} body - The body to send
     * @param {string?} token - The token to authenticate
     * @throws {@link ErrorOutput} If something went wrong
     * @return {Promise<T>}
     */
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

        let data: T | ErrorOutput;
        try {
            data = await response.json() as T | ErrorOutput;
        } catch (error) {
            // This is probably a 204 No Content response
            return undefined as T;
        }
        1
        if (this.isErrorResponse(data)) {
            throw data;
        }

        return data;
    }

    /**
     * Check if the data is an error response
     * @param {any} data - The data to check
     */
    private isErrorResponse(data: any): data is ErrorOutput {
        return (data as ErrorOutput)?.statusCode !== undefined;
    }
}