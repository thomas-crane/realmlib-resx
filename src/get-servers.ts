import { stringify } from 'querystring';
import { Endpoints } from './endpoints';
import { get } from './http-client';

const SERVER_REGEX = /<Server><Name>(\w+)<\/Name><DNS>(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})<\/DNS>/g;

/**
 * A server which can be connected to.
 */
interface Server {
  /**
   * The name of the server.
   */
  name: string;
  /**
   * The address of the server. Hostnames are **not** supported.
   */
  address: string;
}

interface ServerList {
  [name: string]: Server;
}

/**
 * Downloads the latest server list and returns the
 * result as a dictionary of servers keyed by server name.
 */
export async function getServers(): Promise<ServerList> {
  const guid = (Math.random() * 100000 + 10000).toFixed(0);
  const query = stringify({ guid });
  const httpResult = await get(Endpoints.CHAR_LIST + `?${query}`);
  const result = httpResult.toString();
  const servers: ServerList = {};
  let match = SERVER_REGEX.exec(result);
  while (match !== null) {
    const name = match[1];
    const address = match[2];
    servers[name] = {
      name, address,
    };
    match = SERVER_REGEX.exec(result);
  }
  return servers;
}
