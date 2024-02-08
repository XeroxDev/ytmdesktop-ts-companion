import {Settings} from "../shared";

export interface GenericClient {
    settings: Settings;

    /**
     * Set the authentication token, so it can be used for further requests.
     *
     * We **recommend** to use the {@link CompanionConnector.setAuthToken setAuthToken} method in the
     * {@link CompanionConnector} class instead of this method because it sets the token for both clients and reconnects
     * the socket client if the token changed.
     * @param {string} token - The token to set
     */
    setAuthToken(token: string): void;
}