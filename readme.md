# realmlib/resx

[![CodeFactor](https://www.codefactor.io/repository/github/thomas-crane/realmlib-resx/badge)](https://www.codefactor.io/repository/github/thomas-crane/realmlib-resx)

A library for downloading Realm of the Mad God resources and assets.

## Contents

+ [Install](#install)
+ [Use](#use)
  + [Methods](#methods)
  + [Putting it all together](#putting-it-all-together)
+ [Acknowledgements](#acknowledgements)

## Install

```bash
npm install @realmlib/resx
```

## Use

This package exports several functions for downloading the latest game resources as well as extracting packet IDs from the RotMG flash clients.

To use these functions, import it into your project.

```typescript
import * as resx from '@realmlib/resx';
```

or import just the functions you need.

```typescript
import { getClientVersion } from '@realmlib/resx';
```

### Methods

#### `getClientVersion`

Fetches the latest client version. Returns a promise that resolves to a string.

```typescript
resx.getClientVersion().then((version) => {
  console.log(`The current version of the game is ${version}`);
});
```

#### `getClient`

Downloads the provided version of the game client. Returns a promise that resolves to a `Buffer` which contains the client.

```typescript
resx.getClientVersion().then((version) => {
  return resx.getClient(version);
}).then((clientBuffer) => {
  console.log(`Client file size: ${clientBuffer.byteLength} bytes.`);
});
```

Optionally, you can pass a `WriteStream` instance to this method. If a `WriteStream` is passed, the buffer will be piped into the stream, and the promise will resolve with `void`.

```typescript
const clientFile = fs.createWriteStream('./client.swf');

resx.getClient(currentVersion, clientFile).then(() => {
  console.log('Client finished downloading.');
});
```

Note that the option of passing a `WriteStream` into which the downloaded buffer will be piped is available on several other methods. The methods which take a `WriteStream` as an optional parameter are

+ `getClient`
+ `getGroundTypes`
+ `getObjects`

#### `getAssetVersion`

Fetches the latest asset version. Returns a promise that resolves to a string. Note that this version is usually the same as the client version, but can be behind for a few hours after the game updates.

```typescript
resx.getAssetVersion().then((version) => {
  console.log(`The current version of the assets are ${version}`);
});
```

#### `getGroundTypes`

Downloads the latest `GroundTypes.json` file. Returns a promise which resolves to a `Buffer`, or `void` if a `WriteStream` is passed to the method.

```typescript
const groundTypesFile = fs.createWriteStream('./ground-types.json');

resx.getGroundTypes(groundTypesFile).then(() => {
  console.log('GroundTypes.json finished downloading.');
});
```

#### `getObjects`

Downloads the latest `Objects.json` file. Returns a promise which resovles to a `Buffer`, or `void` if a `WriteStream` is passed to the method.

```typescript
resx.getObjects().then((objects) => {
  console.log(`Objects.json file size: ${objects.byteLength} bytes.`);
});
```

#### `getVersions`

Simply combines `getClientVersion` and `getAssetVersion` in a `Promise.all` and returns a promise which resolves to an object containing both versions.

```typescript
resx.getVersions().then((info) => {
  console.log(`The current client version is ${info.clientVersion}`);
  console.log(`The current asset version is ${info.assetVersion}`);
});
```

#### `extractPackets`

Extracts packet types and their IDs from the given client at the provided path and returns a bidirectional map object.

If the path provided to the method does not point to a RotMG swf client, the promise returned by this method will reject. The promise will also be rejected if the extraction process fails.

```typescript
const clientPath = path.join(__dirname, 'client.swf');

resx.extractPackets(clientPath).then((packetMap) => {
  console.log(packetMap[0]); // 'FAILURE'
  console.log(packetMap['FAILURE']); // 0
});
```

### Putting it all together

The following is an example of a program which uses several of the methods from the `resx` class in order to download the latest client and extract the packet IDs from it.

```typescript
import * as resx from '@realmlib/resx';
import * as fs from 'fs';
import * as path from 'path';

const clientPath = path.join(__dirname, 'client.swf'); // download to the current directory.
const clientFile = fs.createWriteStream(clientPath);

// fetch the latest version first.
resx.getClientVersion().then((version) => {
  console.log('Fetched version.');
  // then download the client.
  return resx.getClient(version, clientFile);
}).then(() => {
  console.log('Downloaded client.');
  // extract the packets.
  return resx.extractPackets(clientPath);
}).then((packets) => {
  console.log('Extracted packets.');

  // length is divided by 2 because the map is bidirectional.
  console.log(`Extracted ${Object.keys(packets).length / 2} packets.`);

  const packetPath = path.join(__dirname, 'packets.json'); // save to the current directory.
  fs.writeFileSync(packetPath, JSON.stringify(packets));
  console.log('Done!');
});

```

## Acknowledgements

This project uses the following open source software

+ [rusted_realm](https://github.com/dmarcuse/rusted_realm)
