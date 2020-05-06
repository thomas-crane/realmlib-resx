import { Extractor as WasmExtractor, Parameters } from '../lib/extractor';
import { NAME_MAP } from './name-map';

/**
 * A small wrapper over the rusted_realm `Extractor` class which maps the
 * results into a different format.
 *
 * NB: The rusted_realm `Extractor` is an unmanaged resource, and it is the
 * caller's responsibility to free the resources after it is done with them.
 */
export class Extractor {
  private extractor: WasmExtractor;

  constructor(swf: Uint8Array) {
    this.extractor = new WasmExtractor(swf);
  }

  /**
   * Releases the resources held by this extractor.
   */
  free(): void {
    this.extractor.free();
  }

  /**
   * Extracts the packets from the client and transforms
   * the result into a bi-directional map.
   */
  packets(): Record<string | number, string | number> {
    const mapping = this.extractor.mappings();
    const packets: Record<string | number, string | number> = {};

    // tslint:disable-next-line: forin
    for (const id in mapping.mappings) {
      const realName = NAME_MAP[mapping.mappings[id]];
      if (realName === undefined) {
        throw new Error(`Cannot map ${mapping.mappings[id]} to a packet type.`);
      } else {
        // add the property to the map.
        packets[realName] = parseInt(id, 10);
        // add the reverse property
        packets[id] = realName;
      }
    }
    return packets;
  }

  /**
   * Extracts the parameters from the client.
   */
  parameters(): Parameters {
    return this.extractor.parameters();
  }
}
