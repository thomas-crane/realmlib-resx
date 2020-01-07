import { WriteStream } from 'fs';
import { Endpoints } from './endpoints';
import { get } from './http-client';

/**
 * Downloads the latest GroundTypes.json. If a `stream` is passed
 * to the method, then the file will be piped into the stream.
 * @param stream A `WriteStream` to pipe the file into.
 */
export function getGroundTypes(): Promise<Buffer>;
export function getGroundTypes(stream: WriteStream): Promise<void>;
export function getGroundTypes(stream?: WriteStream): Promise<Buffer | void> {
  return get(Endpoints.STATIC_DRIPS + '/current/json/GroundTypes.json', stream!);
}
