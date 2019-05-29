var wasm;

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 1);
    getUint8Memory().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}
/**
* @param {Uint8Array} client
* @returns {any}
*/
module.exports.extract_mappings = function(client) {
    const ptr0 = passArray8ToWasm(client);
    const len0 = WASM_VECTOR_LEN;
    try {
        return takeObject(wasm.extract_mappings(ptr0, len0));

    } finally {
        wasm.__wbindgen_free(ptr0, len0 * 1);

    }

};

const TextDecoder = require('util').TextDecoder;

let cachedTextDecoder = new TextDecoder('utf-8');

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

module.exports.__wbindgen_string_new = function(p, l) { return addHeapObject(getStringFromWasm(p, l)); };

module.exports.__wbindgen_json_parse = function(ptr, len) { return addHeapObject(JSON.parse(getStringFromWasm(ptr, len))); };

module.exports.__wbindgen_rethrow = function(idx) { throw takeObject(idx); };

wasm = require('./rotmg_extractor_bg');

