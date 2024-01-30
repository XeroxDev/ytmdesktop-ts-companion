/**
 * This is the output of the request endpoint.
 */
export interface RequestOutput {
    /**
     * The authorization token that has to be used for all the privileged endpoints.
     */
    token: string;
}