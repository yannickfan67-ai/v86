#!/usr/bin/env node

import assert from "node:assert/strict";
import { dbg_assert } from "../../src/log.js";

const original_trace = console.trace;
console.trace = () => {};

try
{
    assert.doesNotThrow(() => dbg_assert(true));
    assert.doesNotThrow(() => dbg_assert("507a759c70.bin"));

    let normal_error;
    try
    {
        dbg_assert(false, "normal failure");
    }
    catch(error)
    {
        normal_error = error;
    }
    assert.equal(normal_error, "Assert failed: normal failure");
}
finally
{
    console.trace = original_trace;
}

console.log("dbg_assert condition test passed");
