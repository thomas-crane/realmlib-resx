/**
 * @module updater
 */
import { exec } from 'child_process';
import { WriteStream } from 'fs';
import * as path from 'path';
import { Endpoints } from './endpoints';
import * as HttpClient from './http-client';

/**
 * The path to the `lib/` folder.
 */
const LIB_DIR = path.resolve(__dirname, '..', 'lib');
/**
 * The regex to extract packet information from a `GameServerConnection.as` file.
 */
const PACKET_REGEX = /static const ([A-Z_]+):int = (\d+);/g;
/**
 * The path from a the root of a decompiled client
 * source to the `GameServerConnection.as` file.
 */
const GSC_PATH = path.join(
  'scripts', 'kabam', 'rotmg', 'messaging',
  'impl', 'GameServerConnection.as'
);

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
 * Creates a path from the `base` path to the GameServerConnection.as file.
 * @param base The parent dir which contains the decompiled client source.
 */
export function makeGSCPath(base: string): string {
  if (typeof base !== 'string' || !base) {
    return null;
  }
  return path.join(base, GSC_PATH);
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
export function unpackSwf(swfPath: string): Promise<string> {
  return new Promise((resolve: (str: string) => void, reject: (err: Error) => void) => {
    const pathInfo = path.parse(swfPath);
    const args = [
      '-jar',
      `"${path.join(LIB_DIR, 'jpexs', 'ffdec.jar')}"`,
      '-selectclass kabam.rotmg.messaging.impl.GameServerConnection',
      '-export script',
      `"${path.join(pathInfo.dir, 'decompiled')}"`,
      `"${path.join(pathInfo.dir, pathInfo.base)}"`
    ];
    exec(`java ${args.join(' ')}`, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(path.join(pathInfo.dir, 'decompiled'));
    });
  });
}

/**
 * Extracts the packet information from the given source.
 * @param source The text containing the packet ids to extract.
 */
export function extractPacketInfo(source: string): PacketMap {
  if (typeof source !== 'string' || !source) {
    return null;
  }
  const packets: any = {};
  let match = PACKET_REGEX.exec(source);
  while (match != null) {
    const packetId = +match[2];
    const packetType = match[1];
    packets[packets[packetType] = packetId] = packetType;
    match = PACKET_REGEX.exec(source);
  }
  return packets;
}
