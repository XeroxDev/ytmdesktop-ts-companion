export class Endpoints {
    /**
     * The supported version. Will be used to build the API path.
     */
    public static readonly SUPPORTED_VERSION = 'v1';
    /**
     * The API path.
     */
    public static readonly API = '/api/' + Endpoints.SUPPORTED_VERSION;
    /**
     * The API path for the realtime endpoint.
     */
    public static readonly REALTIME = Endpoints.API + '/realtime';
    /**
     * The API path for the metadata endpoint.
     */
    public static readonly METADATA = '/metadata';
    /**
     * The API path for the auth request endpoint.
     */
    public static readonly AUTH_REQUEST = Endpoints.API + '/auth/request';
    /**
     * The API path for the auth request code endpoint.
     */
    public static readonly AUTH_REQUEST_CODE = Endpoints.API + '/auth/requestcode';
    /**
     * The API path for the state endpoint.
     */
    public static readonly STATE = Endpoints.API + '/state';
    /**
     * The API path for the playlists' endpoint.
     */
    public static readonly PLAYLISTS = Endpoints.API + '/playlists';
    /**
     * The API path for the command endpoint.
     */
    public static readonly COMMAND = Endpoints.API + '/command';
}