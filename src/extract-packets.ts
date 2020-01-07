import { extract_mappings } from '../lib/extractor';
import { NAME_MAP } from './name-map';

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
