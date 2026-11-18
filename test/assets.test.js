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

test("Mistral app public copy matches the Pages root files", () => {
  const pub = path.join(root, "app", "apps", "web", "public");
  const pairs = [
    ["index.html", "tech-helper.html"],
    ["manifest.webmanifest", "manifest.webmanifest"],
    ["sw.js", "sw.js"],
    ["css/styles.css", "css/styles.css"],
    ["js/content.js", "js/content.js"],
    ["js/engine.js", "js/engine.js"],
    ["js/voice.js", "js/voice.js"],
    ["js/camera.js", "js/camera.js"],
    ["js/app.js", "js/app.js"]
  ];
  for (const [a, b] of pairs) {
    const src = path.join(root, a);
    const dst = path.join(pub, b);
    assert.ok(fs.existsSync(dst), "missing Mistral app copy: " + b);
    assert.equal(fs.readFileSync(dst, "utf8"), fs.readFileSync(src, "utf8"), a + " and its app copy differ — keep them in sync");
  }
  for (const icon of fs.readdirSync(path.join(root, "icons"))) {
    assert.ok(fs.existsSync(path.join(pub, "icons", icon)), "missing icon copy: " + icon);
    assert.ok(
      fs.readFileSync(path.join(pub, "icons", icon)).equals(fs.readFileSync(path.join(root, "icons", icon))),
      "icon copy differs: " + icon
    );
  }
});
