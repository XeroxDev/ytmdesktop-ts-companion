import path from "path";
import fs from "fs";
import {CompanionConnector, Settings} from "../src"; // This will be `import {CompanionConnector, Settings} from "ytmdesktop-ts-companion";` in your code

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
        appId: "ytmdesktop-ts-companion-example",
        appName: "YTMDesktop TS Companion Example",
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
            const codeResponse = await restClient.getAuthCode();
            console.log("Got new code, please compare it with the code from YTMDesktop: " + codeResponse.code);

            // Request access top YTMDesktop, so it shows the popup to the user.
            const tokenResponse = await restClient.getAuthToken(codeResponse.code);
            token = tokenResponse.token;

            // set token via connector, so it automatically sets it in both clients.
            connector.setAuthToken(token);
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

    // Toggle play/pause (also works with playPause())
    await restClient.pause().catch((error) => {
        console.error(error);
        process.exit(1);
    });

    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    await restClient.play().catch((error) => {
        console.error(error);
        process.exit(1);
    });

    // Connect to socket server so it can send us events
    socketClient.connect();


    // keep the process running until it gets killed / ctrl-c / etc
    await new Promise(() => {
    });
})();