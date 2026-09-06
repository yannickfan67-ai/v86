#!/usr/bin/env node

import assert from "node:assert/strict";
import { dbg_assert } from "../../src/log.js";

const original_trace = console.trace;
console.trace = () => {};

try
{
    assert.doesNotThrow(() => dbg_assert(true));

    let message_only_error;
    try
    {
        dbg_assert("broken state");
    }
    catch(error)
    {
        message_only_error = error;
    }
    assert.equal(message_only_error, "Assert failed: broken state");

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

console.log("dbg_assert compatibility test passed");
