# YTMDesktop TypeScript Companion

This is a library for the YTMDesktop Companion Server which lets you easier communicate with the server and handle
authorization and so on.

## Installation

- Install via [`npm`](https://www.npmjs.com/):

```bash
npm install --save ytmdesktop-ts-companion
```

## Usage

Can be easier seen in the [example file](https://github.com/XeroxDev/ytmdesktop-ts-companion/blob/main/example/index.ts)
Also you can look through the [documentation](https://xeroxdev.github.io/ytmdesktop-ts-companion/)
but here's a quick rundown:

```typescript
// import the library
import {CompanionConnector} from "ytmdesktop-ts-companion";

// Define settings (add token if you have one, see bigger example for how this could be done)
const settings: Settings = {
    host: "127.0.0.1",
    port: 9863,
    appId: "ytmdesktop-ts-companion-example",
    appName: "YTMDesktop TS Companion Example",
    appVersion: version
}

// Create a new connector
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

// register state listener and log it
socketClient.addStateListener(state => console.log("YTMDesktop State changed: ", state));

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

// toggle current track
await socketClient.playPause();

// connect to the server to receive events
socketClient.connect();
```

## How to contribute?

Just fork the repository and create PR's.

> [!NOTE]
> We're using [release-please](https://github.com/googleapis/release-please) to optimal release the library.
> release-please is following the [conventionalcommits](https://www.conventionalcommits.org) specification.