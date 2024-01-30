import {GenericClient, PlaylistOutput, StateOutput} from "../interfaces";
import {Settings} from "./settings";
import {io, Socket} from "socket.io-client";
import {SocketState} from "../enums";
import {Endpoints} from "./endpoints";

/**
 * A socket client to communicate with the companion servers socket API
 */
export class SocketClient implements GenericClient {
    private _errorListeners: ((error: any) => void)[] = [];
    private _connectionStateListeners: ((state: SocketState) => void)[] = [];
    private _stateListeners: ((state: StateOutput) => void)[] = [];
    private _playlistCreatedListeners: ((playlist: PlaylistOutput) => void)[] = [];
    private _playlistDeletedListeners: ((playlist: string) => void)[] = [];

    constructor(settings: Settings) {
        this._settings = settings;
    }

    private _socket?: Socket;

    /**
     * Get the whole socket object. Use with caution!
     * Useful for custom things that are not implemented in this class
     * @return {Socket}
     */
    public get socket(): Socket | undefined {
        return this._socket;
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
     * Register a listener for errors
     * @param listener
     */
    public addErrorListener(listener: (error: any) => void) {
        this._errorListeners.push(listener);
    }

    /**
     * Remove a listener for errors
     * @param listener
     */
    public removeErrorListener(listener: (error: any) => void) {
        const index = this._errorListeners.indexOf(listener);
        if (index !== -1) {
            this._errorListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for errors
     */
    public removeAllErrorListeners() {
        this._errorListeners = [];
    }

    /**
     * Register a listener for connection state changes
     * @param listener
     */
    public addConnectionStateListener(listener: (state: any) => void) {
        this._connectionStateListeners.push(listener);
    }

    /**
     * Remove a listener for connection state changes
     * @param listener
     */
    public removeConnectionStateListener(listener: (state: any) => void) {
        const index = this._connectionStateListeners.indexOf(listener);
        if (index !== -1) {
            this._connectionStateListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for connection state changes
     */
    public removeAllConnectionStateListeners() {
        this._connectionStateListeners = [];
    }

    /**
     * Register a listener for state changes
     * @param listener
     */
    public addStateListener(listener: (state: StateOutput) => void) {
        this._stateListeners.push(listener);
    }

    /**
     * Remove a listener for state changes
     * @param listener
     */
    public removeStateListener(listener: (state: StateOutput) => void) {
        const index = this._stateListeners.indexOf(listener);
        if (index !== -1) {
            this._stateListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for state changes
     */
    public removeAllStateListeners() {
        this._stateListeners = [];
    }

    /**
     * Register a listener for playlist created events
     * @param listener
     */
    public addPlaylistCreatedListener(listener: (playlist: PlaylistOutput) => void) {
        this._playlistCreatedListeners.push(listener);
    }

    /**
     * Remove a listener for playlist created events
     * @param listener
     */
    public removePlaylistCreatedListener(listener: (playlist: PlaylistOutput) => void) {
        const index = this._playlistCreatedListeners.indexOf(listener);
        if (index !== -1) {
            this._playlistCreatedListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for playlist created events
     */
    public removeAllPlaylistCreatedListeners() {
        this._playlistCreatedListeners = [];
    }

    /**
     * Register a listener for playlist deleted events
     * @param listener
     */
    public addPlaylistDeletedListener(listener: (playlist: string) => void) {
        this._playlistDeletedListeners.push(listener);
    }

    /**
     * Remove a listener for playlist deleted events
     * @param listener
     */
    public removePlaylistDeletedListener(listener: (playlist: string) => void) {
        const index = this._playlistDeletedListeners.indexOf(listener);
        if (index !== -1) {
            this._playlistDeletedListeners.splice(index, 1);
        }
    }

    /**
     * Remove all listeners for playlist deleted events
     */
    public removeAllPlaylistDeletedListeners() {
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