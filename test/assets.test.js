"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

test("all local assets referenced by index.html exist", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const refs = [];
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) refs.push(m[1]);
  for (const ref of refs) {
    if (/^(https?:|#|tel:|data:|mailto:)/.test(ref)) continue;
    if (ref === "config.js") continue;
    assert.ok(fs.existsSync(path.join(root, ref)), "missing asset referenced in index.html: " + ref);
  }
});

test("manifest icons exist", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
  for (const icon of manifest.icons) {
    assert.ok(fs.existsSync(path.join(root, icon.src)), "missing icon: " + icon.src);
  }
});

test("service worker asset list exists on disk", () => {
  const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  const block = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
  assert.ok(block, "ASSETS list not found in sw.js");
  for (const m of block[1].matchAll(/"([^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, m[1])), "missing sw asset: " + m[1]);
  }
});

test("config.js is gitignored but config.example.js exists", () => {
  const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.match(gitignore, /^config\.js$/m);
  assert.ok(fs.existsSync(path.join(root, "config.example.js")));
});
