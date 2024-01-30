import {Endpoints, RestClient, Settings, SocketClient} from "./shared";
import {ErrorOutput, MetadataOutput} from "./interfaces";

/**
 * Companion Connector. This class is the main class of the library. It contains the rest and socket client.
 * You can also use the {@link RestClient} and {@link SocketClient} directly if you want to. But you have to manage the settings update for both clients yourself.
 */
export class CompanionConnector {
    private readonly _restClient: RestClient;
    private readonly _socketClient: SocketClient;

    public constructor(settings: Settings) {
        this._restClient = new RestClient(settings);
        this._restClient.getMetadata().then((metadata: MetadataOutput) => {
            if (!metadata.apiVersions.includes(Endpoints.SUPPORTED_VERSION)) {
                throw new Error(`Unsupported API version: This library supports only version ${Endpoints.SUPPORTED_VERSION} but the server supports ${metadata.apiVersions.join(', ')}`);
            }
        }).catch((error: ErrorOutput) => {
            throw error;
        });

        this._socketClient = new SocketClient(settings);
    }

    /**
     * Get the rest client
     * @return {RestClient}
     */
    public get restClient(): RestClient {
        return this._restClient;
    }

    /**
     * Get the socket client
     * @return {SocketClient}
     */
    public get socketClient(): SocketClient {
        return this._socketClient;
    }

    /**
     * Get the settings
     * @return {Settings}
     */
    public get settings(): Settings {
        return this._restClient.settings;
    }

    /**
     * Set the settings
     * @param {Settings} value
     */
    public set settings(value: Settings) {
        this._restClient.settings = value;
        this._socketClient.settings = value;
    }
}