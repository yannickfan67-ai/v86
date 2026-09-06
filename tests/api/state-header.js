#!/usr/bin/env node

import assert from "node:assert/strict";
import { restore_state } from "../../src/state.js";

const STATE_MAGIC = 0x86768676|0;
const STATE_VERSION = 6;

function make_state(actual_length, total_length, info_length)
{
    const buffer = new ArrayBuffer(actual_length);
    const header = new Int32Array(buffer, 0, 4);
    header[0] = STATE_MAGIC;
    header[1] = STATE_VERSION;
    header[2] = total_length;
    header[3] = info_length;
    return buffer;
}

function get_error(buffer)
{
    try
    {
        restore_state({}, buffer);
    }
    catch(error)
    {
        return error;
    }
    return undefined;
}

let error = get_error(make_state(16, 16, 1));
assert.equal(error?.message, "Invalid info block length: 1");

error = get_error(make_state(16, 16, 0));
assert.equal(error?.message, "Invalid info block length: 0");

error = get_error(make_state(16, 12, 1));
assert.equal(error?.message, "Invalid total length: 12");

error = get_error(make_state(16, 20, 1));
assert.equal(error?.message, "Length doesn't match header: real=16 header=20");

console.log("State header validation test passed");
