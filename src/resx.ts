/**
 * @module updater
 */
import { WriteStream } from 'fs';
import { extract_mappings } from '../lib/extractor';
import { Endpoints } from './endpoints';
import * as HttpClient from './http-client';
import { NAME_MAP } from './name-map';

/**
 * Information about the local version of the assets.
 */
interface VersionInfo {
  clientVersion: string;
  assetVersion: string;
}

/**
 * A bidirectional map containing packet types and IDs.
 */
interface PacketMap {
  [key: string]: any;
  [key: number]: any;
}

/**
 * The structure which is returned by the `extract_mappings` function.
 */
interface ExtractedMap {
  mappings: {
    [key: number]: string;
  };
  binary_rc4: number[];
}

/**
 * Downloads the specified version of the game client. If a `stream` is passed
 * to the method, then the file will be piped into the stream and the promise will
 * resolve with void.
 * @param version The version of the client to download.
 * @param stream A `WriteStream` to pipe the file into.
 */
export function getClient(version: string): Promise<Buffer>;
export function getClient(version: string, stream: WriteStream): Promise<void>;
export function getClient(version: string, stream?: WriteStream): Promise<Buffer | void> {
  const downloadUrl = Endpoints.GAME_CLIENT.replace('{{version}}', version);
  return HttpClient.get(downloadUrl, stream);
}

/**
 * Downloads the latest GroundTypes.json. If a `stream` is passed
 * to the method, then the file will be piped into the stream.
 * @param stream A `WriteStream` to pipe the file into.
 */
export function getGroundTypes(): Promise<Buffer>;
export function getGroundTypes(stream: WriteStream): Promise<void>;
export function getGroundTypes(stream?: WriteStream): Promise<Buffer | void> {
  return HttpClient.get(Endpoints.STATIC_DRIPS + '/current/json/GroundTypes.json', stream);
}

/**
 * Downloads the latest Objects.json. If a `stream` is passed
 * to the method, then the file will be piped into the stream.
 * @param stream A `WriteStream` to pipe the file into.
 */
export function getObjects(): Promise<Buffer>;
export function getObjects(stream: WriteStream): Promise<void>;
export function getObjects(stream?: WriteStream): Promise<Buffer | void> {
  return HttpClient.get(Endpoints.STATIC_DRIPS + '/current/json/Objects.json', stream);
}

/**
 * Gets the latest client version.
 */
export function getClientVersion(): Promise<string> {
  return HttpClient.get(Endpoints.VERSION).then((result) => {
    return result.toString();
  });
}

/**
 * Gets the latest asset version.
 */
export function getAssetVersion(): Promise<string> {
  return HttpClient.get(Endpoints.STATIC_DRIPS + '/current/version.txt').then((result) => {
    return result.toString();
  });
}

/**
 * Gets the latest version of both the client and the assets.
 */
export function getVersions(): Promise<VersionInfo> {
  return Promise.all([
    getClientVersion(),
    getAssetVersion()
  ]).then(([clientVersion, assetVersion]) => {
    return { clientVersion, assetVersion };
  });
}

/**
 * Extracts the packet ids from a RotMG game client.
 * @param swf The contents of the swf file to extract packet ids from.
 */
export function extractPackets(swf: Uint8Array): PacketMap {
  const extractedMap: ExtractedMap = extract_mappings(swf);
  const map: PacketMap = {};
  // iterate over each key in the maps
  // tslint:disable-next-line: forin
  for (const id in extractedMap.mappings) {
    const realName = NAME_MAP[extractedMap.mappings[id]];
    if (realName === undefined) {
      throw new Error(`Cannot map ${extractedMap.mappings[id]} to a packet type.`);
    } else {
      // add the property to the map.
      map[realName] = parseInt(id, 10);
      // add the reverse property
      map[id] = realName;
    }
  }
  return map;
}
