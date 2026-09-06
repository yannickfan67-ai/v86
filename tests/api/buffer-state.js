#!/usr/bin/env node

import assert from "node:assert/strict";
import { SyncBuffer, AsyncXHRPartfileBuffer } from "../../src/buffer.js";

const size = 1024;
const original = new Uint8Array(size);
for(let i = 0; i < original.length; i++)
{
    original[i] = i & 0xFF;
}

// sync -> async: the complete saved image becomes the authoritative in-memory
// backing instead of being misread as an async block-cache list.
const sync = new SyncBuffer(original.slice().buffer);
const async_buffer = new AsyncXHRPartfileBuffer("disk.img", size, undefined, false, undefined);
async_buffer.set_state(sync.get_state());

let first_block;
async_buffer.get(0, 256, block => first_block = block.slice());
assert.deepEqual(Array.from(first_block), Array.from(original.subarray(0, 256)));

const replacement = new Uint8Array(256).fill(0xA5);
async_buffer.set(256, replacement, () => {});
const resaved = async_buffer.get_state();
assert.equal(resaved[0], size);
assert(resaved[1] instanceof Uint8Array);
assert.deepEqual(Array.from(resaved[1].subarray(256, 512)), Array.from(replacement));

// async -> sync: apply the async dirty blocks on top of the currently
// configured complete backing image.
const sync_restored = new SyncBuffer(original.slice().buffer);
const dirty_block = new Uint8Array(256).fill(0x5A);
const async_state = [[ [2, dirty_block] ]];
sync_restored.set_state(async_state);

let restored_block;
sync_restored.get(512, 256, block => restored_block = block.slice());
assert.deepEqual(Array.from(restored_block), Array.from(dirty_block));

// A state saved with no media must not crash a differently configured buffer.
assert.doesNotThrow(() => async_buffer.set_state(null));
assert.doesNotThrow(() => sync_restored.set_state(null));

console.log("Buffer state compatibility test passed");
