# realmlib/resx

[![Build Status](https://travis-ci.org/thomas-crane/realmlib-resx.svg?branch=master)](https://travis-ci.org/thomas-crane/realmlib-resx)
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

This package exports a single class: `ResX`, which provides methods for downloading the latest game resources as well as extracting packet IDs from the RotMG flash clients.

To use the `ResX` class, import it into your project.

```typescript
import * as ResX from '@realmlib/resx';
```

### Methods

#### `getClientVersion`

Fetches the latest client version. Returns a promise that resolves to a string.

```typescript
ResX.getClientVersion().then((version) => {
  console.log(`The current version of the game is ${version}`);
});
```

#### `getClient`

Downloads the provided version of the game client. Returns a promise that resolves to a `Buffer` which contains the client.

```typescript
ResX.getClientVersion().then((version) => {
  return ResX.getClient(version);
}).then((clientBuffer) => {
  console.log(`Client file size: ${clientBuffer.byteLength} bytes.`);
});
```

Optionally, you can pass a `WriteStream` instance to this method. If a `WriteStream` is passed, the buffer will be piped into the stream, and the promise will resolve with `void`.

```typescript
const clientFile = fs.createWriteStream('./client.swf');

ResX.getClient(currentVersion, clientFile).then(() => {
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
ResX.getAssetVersion().then((version) => {
  console.log(`The current version of the assets are ${version}`);
});
```

#### `getGroundTypes`

Downloads the latest `GroundTypes.json` file. Returns a promise which resolves to a `Buffer`, or `void` if a `WriteStream` is passed to the method.

```typescript
const groundTypesFile = fs.createWriteStream('./ground-types.json');

ResX.getGroundTypes(groundTypesFile).then(() => {
  console.log('GroundTypes.json finished downloading.');
});
```

#### `getObjects`

Downloads the latest `Objects.json` file. Returns a promise which resovles to a `Buffer`, or `void` if a `WriteStream` is passed to the method.

```typescript
ResX.getObjects().then((objects) => {
  console.log(`Objects.json file size: ${objects.byteLength} bytes.`);
});
```

#### `getVersions`

Simply combines `getClientVersion` and `getAssetVersion` in a `Promise.all` and returns a promise which resolves to an object containing both versions.

```typescript
ResX.getVersions().then((info) => {
  console.log(`The current client version is ${info.clientVersion}`);
  console.log(`The current asset version is ${info.assetVersion}`);
});
```

#### `unpackSwf`

Decompiles the swf client at the provided path and extracts the `GameServerConnection.as` file into a `decompiled/` folder in the same directory as the client. Returns a promise which resolves to the path into which the client was decompiled.

This method executes a Java child process, so Java must be installed and available in your PATH for this method to be successful.

```typescript

ResX.unpackSwf('./clients/latest.swf').then((decompiledSwfPath) => {
  console.log(`Client decompiled into ${decompiledSwfPath}`);
});
```

#### `makeGSCPath`

Creates a path from the decompiled swf folder to the file which contains the packet IDs.

The path to the file is `scripts/kabam/rotmg/messaging/impl/GameServerConnection.as`.

```typescript
ResX.unpackSwf('./clients/latest.swf').then((decompiledSwfPath) => {
  const pathToGSCFile = ResX.makeGSCPath(decompiledSwfPath);
  // pathToGSCFile is ./clients/decompiled/scripts/kabam/.../GameServerConnection.as
});
```

#### `extractPacketInfo`

Extracts packet types and their IDs from the given source and returns a bidirectional map object.

Note that if the value passed to this method is not a string or is the empty string, `null` will be returned. However if a non-empty string is passed that does not contain any valid packets, then an empty object (`{}`) will be returned.

```typescript
const contents = fs.readFileSync(pathToGSCFile, { encoding: 'utf8' });

const packetMap = ResX.extractPacketInfo(contents);
console.log(packetMap[0]) // 'FAILURE'
console.log(packetMap['FAILURE']); // 0
```

### Putting it all together

The following is an example of a program which uses several of the methods from the `ResX` class in order to download the latest client and extract the packet IDs from it.

```typescript
import * as ResX from '@realmlib/resx';
import * as fs from 'fs';
import * as path from 'path';

const clientPath = path.join(__dirname, 'client.swf'); // download to the current directory.
const clientFile = fs.createWriteStream(clientPath);

// fetch the latest version first.
ResX.getClientVersion().then((version) => {
  console.log('Fetched version.');
  // then download the client.
  return ResX.getClient(version, clientFile);
}).then(() => {
  console.log('Downloaded client.');
  // unpack the client.
  return ResX.unpackSwf(clientPath);
}).then((decompiled) => {
  console.log('Unpacked client.');
  // create a path to the GameServerConnection.as file and extract the packets.
  const gscPath = ResX.makeGSCPath(decompiled);
  const contents = fs.readFileSync(gscPath, { encoding: 'utf8' });
  const packets = ResX.extractPacketInfo(contents);

  // length is divided by 2 because the map is bidirectional.
  console.log(`Extracted ${Object.keys(packets).length / 2} packets.`);

  const packetPath = path.join(__dirname, 'packets.json'); // save to the current directory.
  fs.writeFileSync(packetPath, JSON.stringify(packets));
  console.log('Done!');
});

```

## Acknowledgements

This project uses the following open source software

+ [JPEXS Free Flash Decompiler](https://github.com/jindrapetrik/jpexs-decompiler)
