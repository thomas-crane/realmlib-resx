/* tslint:disable */
/* eslint-disable */

/**
 * Network related mappings including a packet ID map and
 * the RC4 cipher keys.
 */
export interface Mappings {
    /**
     * A map of packet IDs to packet types.
     */
    mappings: Record<number, string>;
    /**
     * A byte array containing both RC4 cipher keys. The outgoing key takes
     * up the first 13 bytes of the array and the incoming key takes up
     * the last 13 bytes of the array.
     */
    binary_rc4: number[];
}

/**
 * Various constants used throughout the game.
 */
export interface Parameters {
    /**
     * The current build version of the game.
     */
    version: string;
    /**
     * The port on which connections will be established.
     */
    port: number;
    /**
     * The game ID used to connect to the Tutorial.
     */
    tutorial_gameid: number;
    /**
     * The game ID used to connect to the Nexus.
     */
    nexus_gameid: number;
    /**
     * The game ID used to connect to a random realm.
     */
    random_gameid: number;
}

export interface Extractor {
    /**
     * Extracts the `Mappings` from the client.
     */
    mappings(): Mappings;
    /**
     * Extracts the `Parameters` from the client.
     */
    parameters(): Parameters;
}


/**
* A struct which can be used to parse a game client and then extract various bits of information
* from that client.
*/
export class Extractor {
  free(): void;
/**
* Creates a new `Extractor` over the given `client`.
* @param {Uint8Array} client 
*/
  constructor(client: Uint8Array);
}
