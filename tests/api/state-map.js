#!/usr/bin/env node

import assert from "node:assert/strict";
import { save_state, restore_state } from "../../src/state.js";

class FakeCPU
{
    constructor(value)
    {
        this.value = value;
        this.restored = undefined;
    }

    get_state()
    {
        return [this.value];
    }

    set_state(state)
    {
        this.restored = state[0];
    }
}

const typed_key = new Uint8Array([1, 2, 3]);
const typed_value = new Uint16Array([0x1234, 0x5678]);
const nested_map = new Map([["typed", typed_value]]);
const original = new Map([[typed_key, nested_map]]);
const cpu = new FakeCPU(original);

const state = save_state(cpu);
restore_state(cpu, state);

assert(cpu.restored instanceof Map);
assert.equal(cpu.restored.size, 1);

const [[restored_key, restored_nested_map]] = cpu.restored;
assert(restored_key instanceof Uint8Array);
assert.deepEqual(Array.from(restored_key), [1, 2, 3]);
assert(restored_nested_map instanceof Map);

const restored_value = restored_nested_map.get("typed");
assert(restored_value instanceof Uint16Array);
assert.deepEqual(Array.from(restored_value), [0x1234, 0x5678]);

console.log("Nested Map state restore test passed");
