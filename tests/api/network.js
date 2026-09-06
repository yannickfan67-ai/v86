#!/usr/bin/env node

import assert from "node:assert/strict";
import { NetworkAdapter } from "../../src/browser/network.js";

const original_websocket = globalThis.WebSocket;
const sockets = [];

class FakeWebSocket
{
    constructor(url)
    {
        this.url = url;
        this.readyState = 0;
        this.binaryType = "";
        this.onopen = undefined;
        this.onmessage = undefined;
        this.onclose = undefined;
        this.onerror = undefined;
        sockets.push(this);
    }

    close()
    {
        this.readyState = 3;
        this.onclose && this.onclose({});
    }

    send() {}
}

globalThis.WebSocket = FakeWebSocket;

try
{
    const bus = {
        register() {},
        send() {},
    };

    const adapter = new NetworkAdapter("ws://old.example", bus);
    const packet = new Uint8Array([1, 2, 3]);

    // Queue traffic and start a connection to the old proxy.
    adapter.send(packet);
    assert.equal(sockets.length, 1);
    assert.equal(sockets[0].url, "ws://old.example");
    assert.equal(adapter.send_queue.length, 1);

    // Changing proxy must bypass the old reconnect throttle and immediately
    // reconnect because traffic is already queued.
    adapter.change_proxy("wss://new.example");
    assert.equal(sockets.length, 2);
    assert.equal(sockets[1].url, "wss://new.example");
    assert.equal(adapter.socket, sockets[1]);

    // Opening the replacement socket flushes the queued traffic.
    sockets[1].readyState = 1;
    sockets[1].onopen({});
    assert.equal(adapter.send_queue.length, 0);
}
finally
{
    globalThis.WebSocket = original_websocket;
}

console.log("Network proxy reconnect test passed");
