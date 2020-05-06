import { WriteStream } from 'fs';
import { Endpoints } from './endpoints';
import { get } from './http-client';

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
  const downloadUrl = Endpoints.GameClientTemplate.replace('{{version}}', version);
  return get(downloadUrl, stream!);
}
