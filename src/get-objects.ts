import { WriteStream } from 'fs';
import { Endpoints } from './endpoints';
import { get } from './http-client';

/**
 * Downloads the latest Objects.json. If a `stream` is passed
 * to the method, then the file will be piped into the stream.
 * @param stream A `WriteStream` to pipe the file into.
 */
export function getObjects(): Promise<Buffer>;
export function getObjects(stream: WriteStream): Promise<void>;
export function getObjects(stream?: WriteStream): Promise<Buffer | void> {
  return get(Endpoints.StaticDrips + '/current/json/Objects.json', stream!);
}
