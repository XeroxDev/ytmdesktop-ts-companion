/**
 * The input of the request endpoint.
 */
export interface RequestInput {
    /**
     * The id of your app. Must be all lowercase with only alphanumeric characters, no spaces and between 2 and 32 characters.
     * Regex: ^[a-z0-9_\\-]{2,32}$
     */
    appId: string;
    /**
     * The code you've received from the server via {@link RequestOutput}
     */
    code: string;
}