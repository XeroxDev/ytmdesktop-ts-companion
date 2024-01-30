/**
 * This is the output of endpoints if an error occurs.
 */
export interface ErrorOutput {
    /**
     * The status code of the error. (e.g. 403)
     */
    statusCode: number;
    /**
     * An error code with specific information about the error (e.g. AUTHORIZATION_DISABLED)
     * It is not always available.
     */
    code?: string;
    /**
     * The error message title. (e.g. Forbidden)
     */
    error: string;
    /**
     * The error message. (e.g. Authorization requests are disabled)
     */
    message: string;
}