import path from "path";
import fs from "fs";
import {Settings} from "../src/shared";
import {CompanionConnector} from "../src";

(async () => {
    // get version from package.json
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const version = packageJson.version;

    // Check if file ".token" exists
    const tokenPath = path.join(__dirname, "../.token");

    if (!fs.existsSync(tokenPath)) {
        // create it
        fs.writeFileSync(tokenPath, "");
    }

    // Read token
    let token = fs.readFileSync(tokenPath, "utf-8");

    // Define settings
    const settings: Settings = {
        host: "127.0.0.1",
        port: 9863,
        appId: "some-random_test-app",
        appName: "Companion Test",
        appVersion: version
    }

    // Check if token is set
    if (token) {
        settings.token = token;
    }

    // define companion connector
    let connector: CompanionConnector;
    try {
        connector = new CompanionConnector(settings);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }

    // define clients for easier access
    const restClient = connector.restClient;
    const socketClient = connector.socketClient;

    // Register event listeners
    socketClient.addErrorListener(error => console.error("Got new error:", error));
    socketClient.addConnectionStateListener(state => console.log("Socket connection state changed: ", state));
    socketClient.addStateListener(state => console.log("YTMDesktop State changed: ", state));
    socketClient.addPlaylistCreatedListener(playlist => console.log("Playlist created: ", playlist));
    socketClient.addPlaylistDeletedListener(playlist => console.log("Playlist deleted: ", playlist));

    // REST API
    // Check if token is set
    if (!token) {
        try {
            // if not, try to request one and show it to user.
            const codeResponse = await restClient.requestCode();
            console.log("Got new code, please compare it with the code from YTMDesktop: " + codeResponse.code);

            // Request access top YTMDesktop, so it shows the popup to the user.
            const tokenResponse = await restClient.request(codeResponse.code);
            token = tokenResponse.token;
        } catch (error) {
            console.error(error);
            process.exit(1);
        }

        // Write token to file
        console.log("Got new token, saving it to " + tokenPath);
        fs.writeFileSync(tokenPath, token);
    }

    // Get state and print it
    console.log(await restClient.getState().catch((error) => {
        console.error(error);
        process.exit(1);
    }));

    // Connect to socket server so it can send us events
    socketClient.connect();


    // keep the process running until it gets killed / ctrl-c / etc
    await new Promise(() => {
    });
})();