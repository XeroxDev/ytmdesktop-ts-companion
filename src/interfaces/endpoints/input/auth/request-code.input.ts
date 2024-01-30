/**
 * The input of the requestCode endpoint.
 */
export interface RequestCodeInput {
    /**
     * The id of your app. Must be all lowercase with only alphanumeric characters, no spaces and between 2 and 32 characters.
     * Regex: ^[a-z0-9_\\-]{2,32}$
     */
    appId: string;
    /**
     * The name of your app. Must be between 2 and 48 characters
     */
    appName: string;
    /**
     * The version of your app. Must be semantic versioning compatible.
     */
    appVersion: string;
}