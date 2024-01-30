/**
 * Settings needed to connect to the server
 */
export class Settings {
    /**
     * The host name of the server (has to be **without** a protocol like `http://` or `https://` and **can't** have a trailing slash)
     * Hint: Some operating systems, such as Windows, may use an IPv6 address for localhost. This would result in a connection failure as the server is not listening on the IPv6 address.
     */
    public host: string;
    /**
     * The port of the server
     */
    public port: number;
    /**
     * The token to connect to the server (if available)
     */
    public token?: string;
    /**
     * The id of your app. Must be all lowercase with only alphanumeric characters, no spaces and between 2 and 32 characters.
     * Regex: ^[a-z0-9_\\-]{2,32}$
     */
    public appId: string;
    /**
     * The name of your app. Must be between 2 and 48 characters
     */
    public appName: string;
    /**
     * The version of your app. Must be semantic versioning compatible.
     */
    public appVersion: string;
}