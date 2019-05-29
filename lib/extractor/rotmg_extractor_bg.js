
const path = require('path').join(__dirname, 'rotmg_extractor_bg.wasm');
const bytes = require('fs').readFileSync(path);
let imports = {};
imports['./rotmg_extractor'] = require('./rotmg_extractor');

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
module.exports = wasmInstance.exports;
