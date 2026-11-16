"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const content = require(path.join(__dirname, "..", "js", "content.js"));
const engineModule = require(path.join(__dirname, "..", "js", "engine.js"));

const engine = engineModule.create(content);

test("content validates with no errors", () => {
  assert.deepEqual(engine.validate(), []);
});

test("all expected flows exist", () => {
  const ids = engine.flows.map((f) => f.id).sort();
  for (const expected of ["tv-power", "tv-netflix", "tv-prime", "tv-nosignal", "remote", "alexa", "email-reset", "wifi", "scam", "volume"]) {
    assert.ok(ids.includes(expected), "missing flow " + expected);
  }
});

test("intent matching routes common phrases", () => {
  const cases = [
    ["my TV won't turn on", "tv-power"],
    ["the tv is dead", "tv-power"],
    ["how do I get to Netflix", "tv-netflix"],
    ["prime video please", "tv-prime"],
    ["no signal on the tv", "tv-nosignal"],
    ["which button is the home button", "remote"],
    ["set up my Alexa", "alexa"],
    ["I forgot my password", "email-reset"],
    ["gmail login not working", "email-reset"],
    ["the wifi is down", "wifi"],
    ["internet not working", "wifi"],
    ["is this a scam", "scam"],
    ["someone says my computer has a virus", "scam"],
    ["I can't hear the TV", "volume"],
    ["the remote access request", "scam"]
  ];
  for (const [text, expected] of cases) {
    const intent = engine.matchIntent(text);
    assert.ok(intent && intent.kind === "flow", "no intent for: " + text);
    assert.equal(intent.id, expected, "wrong flow for: " + text + " got " + intent.id);
  }
});

test("call intent is detected", () => {
  assert.deepEqual(engine.matchIntent("call my daughter"), { kind: "call" });
  assert.deepEqual(engine.matchIntent("please phone my son"), { kind: "call" });
});

test("unrelated text returns null", () => {
  assert.equal(engine.matchIntent("the weather is nice today"), null);
});

test("flow session walks to completion", () => {
  const s = engine.start("tv-power");
  assert.equal(s.node().options.length > 0, true);
  let result = s.answer(0);
  assert.equal(result.type, "node");
  result = s.answer(0);
  assert.equal(result.type, "node");
  result = s.answer(0);
  assert.equal(result.type, "node");
  result = s.answer(0);
  assert.ok(result.type === "node" || result.type === "done");
});

test("jump options switch flows", () => {
  const s = engine.start("tv-netflix");
  const result = s.answer(1);
  assert.equal(result.type, "jump");
  assert.equal(result.flowId, "tv-power");
});

test("call and home options are signalled", () => {
  const s = engine.start("scam");
  const r = s.answer(0);
  assert.equal(r.type, "node");
  const scamNode = s.node();
  const callIdx = scamNode.options.findIndex((o) => o.next === "s8");
  assert.ok(callIdx >= 0);
  const s8 = engine.start("scam");
  s8.answer(0);
  s8.answer(1);
  const res = s8.answer(0);
  assert.equal(res.type, "call");
});

test("no content ever asks for a password to be entered into the app", () => {
  const forbidden = /(enter|type|say|tell me)\s+(your|the|my)\s+(password|passcode|pin)\s+(here|in this app|into this app|to me)/i;
  for (const flow of engine.flows) {
    for (const [nodeId, node] of Object.entries(flow.nodes)) {
      for (const text of [node.say].concat(node.bullets || [])) {
        const withoutWarnings = text.replace(/never[^.]*\./gi, " ");
        assert.ok(!forbidden.test(withoutWarnings), flow.id + "/" + nodeId + " asks for a password: " + text);
      }
    }
  }
});

test("password reset flow includes explicit never-store-password warning", () => {
  const flow = engine.flows.find((f) => f.id === "email-reset");
  const allText = Object.values(flow.nodes)
    .flatMap((n) => [n.say].concat(n.bullets || []))
    .join(" ");
  assert.match(allText, /NEVER ask for your password/i);
  assert.match(allText, /never type your password into this app/i);
});

test("scam flow marks danger steps and covers remote-access scam", () => {
  const flow = engine.flows.find((f) => f.id === "scam");
  const dangerNodes = Object.values(flow.nodes).filter((n) => n.tone === "danger");
  assert.ok(dangerNodes.length >= 4);
  const allText = Object.values(flow.nodes).map((n) => n.say).join(" ");
  assert.match(allText, /remote/i);
  assert.match(allText, /gift cards/i);
});

test("every flow is reachable from at least one keyword or link", () => {
  for (const flow of engine.flows) {
    assert.ok(flow.keywords.length > 0, flow.id + " has no keywords");
  }
});
