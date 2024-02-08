import {GenericClient, PlaylistOutput, StateOutput} from "../interfaces";
import {Settings} from "./settings";
import {io, Socket} from "socket.io-client";
import {SocketState} from "../enums";
import {Endpoints} from "./endpoints";

/**
 * A socket client to communicate with the companion servers socket API
 */
export class SocketClient implements GenericClient {
    /**
     * The listeners for errors
     */
    private _errorListeners: ((error: any) => void)[] = [];
    /**
     * The listeners for connection state changes
     */
    private _connectionStateListeners: ((state: SocketState) => void)[] = [];
    /**
     * The listeners for state changes
     */
    private _stateListeners: ((state: StateOutput) => void)[] = [];
    /**
     * The listeners for playlist created events
     */
    private _playlistCreatedListeners: ((playlist: PlaylistOutput) => void)[] = [];
    /**
     * The listeners for playlist deleted events
     */
    private _playlistDeletedListeners: ((playlist: string) => void)[] = [];

    /**
     * Create a new socket client
     * @param {settings} settings - The settings to use
     */
    constructor(settings: Settings) {
        this._settings = settings;
    }

    /**
     * The socket object.
     */
    private _socket?: Socket;

    /**
     * Get the whole socket object. Use with caution!
     * Useful for custom things that are not implemented in this class
     * @return {Socket} The socket object
     */
    public get socket(): Socket | undefined {
        return this._socket;
    }

    /**
     * The settings to use
     */
    private _settings: Settings;

    /**
     * Get the settings
     * @return {Settings} The settings
     */
    public get settings(): Settings {
        return this._settings;
    }

    /**
     * Set the settings. Also reconnects automatically if host, port or token changed
     * @param {Settings} value - The settings to set
     */
    public set settings(value: Settings) {
        if (value === undefined) {
            throw new Error("Settings cannot be undefined");
        }

        let reconnect = false;
        if (this._settings.host !== value.host || this._settings.port !== value.port || this._settings.token !== value.token) {
            reconnect = true;
        }

        this._settings = value;

        if (reconnect && this._socket) {
            this.connect();
        }
    }

    /**
     * Set the authentication token, so it can be used for further requests and reconnects automatically if token changed.
     *
     * We **recommend** to use the {@link CompanionConnector.setAuthToken setAuthToken} method in the
     * {@link CompanionConnector} class instead of this method because it sets the token for both clients and also
     * reconnects the socket client if the token changed.
     * @param {string} token - The token to set
     */
    public setAuthToken(token: string): void {
        this.settings = {
            ...this.settings,
            token
        }
    }

    /**
     * Register a listener for errors
     * @param {(error: any)} listener - The listener to register
     */
    public addErrorListener(listener: (error: any) => void): void {
        this._errorListeners.push(listener);
    }

    /**
     * Remove a listener for errors
     * @param {(error: any)} listener - The listener to remove
     */
    public removeErrorListener(listener: (error: any) => void): void {
        const index = this._errorListeners.indexOf(listener);
        if (index !== -1) {
            this._errorListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for errors
     */
    public removeAllErrorListeners(): void {
        this._errorListeners = [];
    }

    /**
     * Register a listener for connection state changes
     * @param {(state: any) => void} listener - The listener to register
     */
    public addConnectionStateListener(listener: (state: any) => void): void {
        this._connectionStateListeners.push(listener);
    }

    /**
     * Remove a listener for connection state changes
     * @param {(state: any) => void} listener - The listener to remove
     */
    public removeConnectionStateListener(listener: (state: any) => void): void {
        const index = this._connectionStateListeners.indexOf(listener);
        if (index !== -1) {
            this._connectionStateListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for connection state changes
     */
    public removeAllConnectionStateListeners(): void {
        this._connectionStateListeners = [];
    }

    /**
     * Register a listener for state changes
     * @param {(state: StateOutput) => void} listener - The listener to register
     */
    public addStateListener(listener: (state: StateOutput) => void): void {
        this._stateListeners.push(listener);
    }

    /**
     * Remove a listener for state changes
     * @param {(state: StateOutput) => void} listener - The listener to remove
     */
    public removeStateListener(listener: (state: StateOutput) => void): void {
        const index = this._stateListeners.indexOf(listener);
        if (index !== -1) {
            this._stateListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for state changes
     */
    public removeAllStateListeners(): void {
        this._stateListeners = [];
    }

    /**
     * Register a listener for playlist created events
     * @param {(playlist: PlaylistOutput) => void} listener - The listener to register
     */
    public addPlaylistCreatedListener(listener: (playlist: PlaylistOutput) => void): void {
        this._playlistCreatedListeners.push(listener);
    }

    /**
     * Remove a listener for playlist created events
     * @param {(playlist: PlaylistOutput) => void} listener - The listener to remove
     */
    public removePlaylistCreatedListener(listener: (playlist: PlaylistOutput) => void): void {
        const index = this._playlistCreatedListeners.indexOf(listener);
        if (index !== -1) {
            this._playlistCreatedListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for playlist created events
     */
    public removeAllPlaylistCreatedListeners(): void {
        this._playlistCreatedListeners = [];
    }

    /**
     * Register a listener for playlist deleted events
     * @param {(playlist: string) => void} listener - The listener to register
     */
    public addPlaylistDeletedListener(listener: (playlist: string) => void): void {
        this._playlistDeletedListeners.push(listener);
    }

    /**
     * Remove a listener for playlist deleted events
     * @param {(playlist: string) => void} listener - The listener to remove
     */
    public removePlaylistDeletedListener(listener: (playlist: string) => void): void {
        const index = this._playlistDeletedListeners.indexOf(listener);
        if (index !== -1) {
            this._playlistDeletedListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for playlist deleted events
     */
    public removeAllPlaylistDeletedListeners(): void {
        this._playlistDeletedListeners = [];
    }

    /**
     * Connect to the socket server
     */
    public connect() {
        try {
            if (this._socket) {
                this._socket.removeAllListeners();
                this._socket.disconnect();
                this._socket = undefined;

                this._connectionStateListeners.forEach(listener => listener(SocketState.DISCONNECTED));
            }

            this._connectionStateListeners.forEach(listener => listener(SocketState.CONNECTING));

            this._socket = io(`http://${this.settings.host}:${this.settings.port}${Endpoints.REALTIME}`, {
                transports: ['websocket'],
                auth: {
                    token: this.settings.token
                }
            });

            this._socket.on("connect", () => {
                this._connectionStateListeners.forEach(listener => listener(SocketState.CONNECTED));
            });

            this._socket.on("disconnect", () => {
                this._connectionStateListeners.forEach(listener => listener(SocketState.DISCONNECTED));
            });

            this._socket.on("error", (error) => {
                this._errorListeners.forEach(listener => listener(error));
            });

            this._socket.on("connect_error", (error) => {
                this._errorListeners.forEach(listener => listener(error));
                this._connectionStateListeners.forEach(listener => listener(SocketState.ERROR));
            });

            this._socket.on("state-update", (state: StateOutput) => {
                this._stateListeners.forEach(listener => listener(state));
            });

            this._socket.on("playlist-created", (playlist: PlaylistOutput) => {
                this._playlistCreatedListeners.forEach(listener => listener(playlist));
            });

            this._socket.on("playlist-delete", (playlist: string) => {
                this._playlistDeletedListeners.forEach(listener => listener(playlist));
            });
        } catch (error) {
            this._errorListeners.forEach(listener => listener(error));
        }
    }
}