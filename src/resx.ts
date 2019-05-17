/**
 * @module updater
 */
import { exec } from 'child_process';
import { WriteStream } from 'fs';
import * as path from 'path';
import { Endpoints } from './endpoints';
import * as HttpClient from './http-client';
import * as os from 'os';
import { NAME_MAP } from './name-map';

/**
 * The path to the `lib/` folder.
 */
const LIB_DIR = path.resolve(__dirname, '..', 'lib');

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
 * Downloads the specified version of the game client. If a `stream` is passed
 * to the method, then the file will be piped into the stream.
 * @param version The version of the client to download.
 * @param stream A `WriteStream` to pipe the file into.
 */
export function getClient(version: string, stream?: WriteStream): Promise<Buffer> {
  const downloadUrl = Endpoints.GAME_CLIENT.replace('{{version}}', version);
  return HttpClient.get(downloadUrl, stream);
}

/**
 * Downloads the latest GroundTypes.json. If a `stream` is passed
 * to the method, then the file will be piped into the stream.
 * @param stream A `WriteStream` to pipe the file into.
 */
export function getGroundTypes(stream?: WriteStream): Promise<Buffer> {
  return HttpClient.get(Endpoints.STATIC_DRIPS + '/current/json/GroundTypes.json', stream);
}

/**
 * Downloads the latest Objects.json. If a `stream` is passed
 * to the method, then the file will be piped into the stream.
 * @param stream A `WriteStream` to pipe the file into.
 */
export function getObjects(stream?: WriteStream): Promise<Buffer> {
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
 * Unpacks the client. Returns the path
 * which the client was unpacked into.
 * @param swfPath The path to the swf file to unpack. E.g. `C:\\clients\\latest-client.swf`.
 */
export function extractPackets(swfPath: string): Promise<PacketMap> {
  return new Promise((resolve: (str: PacketMap) => void, reject: (err: Error) => void) => {
    const exePath = path.join(LIB_DIR, `extractor_${getPlatform()}`);
    exec(`"${exePath}" "${swfPath}"`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      if (stderr) {
        const error = new Error(stderr);
        reject(error);
        return;
      }

      // parse the result
      const result = JSON.parse(stdout);

      const map: PacketMap = {};
      // iterate over each key in the maps
      // tslint:disable-next-line: forin
      for (const id in result.mappings) {
        const realName = NAME_MAP[result.mappings[id]];
        if (realName === undefined) {
          const error = new Error(`Cannot map ${result.mappings[id]} to a packet type.`);
          reject(error);
          return;
        } else {
          // add the property to the map.
          map[realName] = parseInt(id, 10);
          // add the reverse property
          map[id] = realName;
        }
      }
      resolve(map);
    });
  });
}

/**
 * Gets the name of the extractor executable
 * which corresponds to the current platform.
 */
function getPlatform(): string {
  switch (os.platform()) {
    case 'darwin':
      return 'osx';
    case 'win32':
      return 'windows';
    default:
      return 'linux';
  }
}
