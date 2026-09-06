#!/usr/bin/env node

import assert from "node:assert/strict";
import { PIT, OSCILLATOR_FREQ } from "../../src/pit.js";

const irq_events = [];
const cpu = {
    io: {
        register_read() {},
        register_write() {},
    },
    device_lower_irq(irq) {
        irq_events.push(["lower", irq]);
    },
    device_raise_irq(irq) {
        irq_events.push(["raise", irq]);
    },
};
const bus = { send() {} };

const pit = new PIT(cpu, bus);
pit.counter_enabled[0] = 1;
pit.counter_mode[0] = 2;
pit.counter_reload[0] = 100;
pit.counter_start_value[0] = 100;
pit.counter_start_time[0] = 0;

// 251 elapsed ticks means the initial 100 ticks plus 151 overdue ticks:
// two periodic rollovers should have happened.
const now = 251 / OSCILLATOR_FREQ;
const first_delay = pit.timer(now, false);

assert.equal(first_delay, 0);
assert.equal(pit.pending_irq0, 1);
assert.equal(irq_events.filter(event => event[0] === "raise").length, 1);

// The second rollover is replayed on the next timer iteration instead of
// being raised back-to-back and collapsing in the PIC.
pit.timer(now, false);
assert.equal(pit.pending_irq0, 0);
assert.equal(irq_events.filter(event => event[0] === "raise").length, 2);

// With no additional elapsed time there must not be a third interrupt.
pit.timer(now, false);
assert.equal(irq_events.filter(event => event[0] === "raise").length, 2);

// Old state images do not have the pending_irq0 slot.
const old_state = pit.get_state().slice(0, 9);
pit.pending_irq0 = 3;
pit.set_state(old_state);
assert.equal(pit.pending_irq0, 0);

console.log("PIT rollover catch-up test passed");
