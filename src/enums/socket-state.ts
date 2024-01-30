/**
 * The socket state
 */
export enum SocketState {
    /**
     * The socket is connecting
     */
    CONNECTING = "CONNECTING",
    /**
     * The socket is connected
     */
    CONNECTED = "CONNECTED",
    /**
     * The socket is disconnecting
     */
    DISCONNECTED = "DISCONNECTED",
    /**
     * The socket seems to be disconnected due to an error
     */
    ERROR = "ERROR"
}