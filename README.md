# senior-tech-helper

Voice-and-camera web app for elderly tech support. One big screen, huge buttons, plain language: a senior can talk to it, show it a photo of the TV/remote/error message, and get walked through the fix step by step — Smart TV navigation (Netflix / Prime Video), "which button on the remote", Alexa/Echo setup, Wi-Fi, forgotten email passwords, and scam checks.

## Features

- **Stupid-easy UI** — one screen, three big actions (🎤 Talk, 📷 Show a photo, topic buttons), giant high-contrast text, huge tap targets, spoken replies.
- **Ears** — voice input via the browser Speech Recognition API (with a big typed-input fallback), answers spoken aloud via speech synthesis. Sound can be toggled off.
- **Eyes** — camera via `getUserMedia`. Photos are processed in-session only and are **never stored**. If you configure your own vision endpoint (see below), the photo is sent only to that endpoint over HTTPS and the model's reading of the screen is shown and spoken back.
- **Guided troubleshooting** — decision-tree flows in `js/content.js` with plain-language steps, cross-links between flows, and "It worked!" / "Next step" buttons. Flows: TV power, Netflix, Prime Video, "No signal"/HDMI, remote buttons, Alexa setup, email password reset, Wi-Fi, scam check, TV volume.
- **Password safety** — the app never asks for, receives, or stores passwords. The email-reset flow walks the user through the provider's *official* site and explicitly warns against typing passwords anywhere else. (Covered by automated tests.)
- **Scam guardrails** — a dedicated "Is this a scam?" flow with red-flag answers (fake "virus" calls/popups, gift cards, remote access) and what to do if they already clicked.
- **📞 Call my family** — persistent button wired to a `tel:` number you configure.
- **Installable** — PWA manifest + service worker: add to home screen on Android/iPhone, works offline after first load.
- **No tracking, no accounts, no cookies.** The only `localStorage` use is the sound on/off preference.

## Run it

It's a fully static site — no build step, no dependencies.

```bash
cd senior-tech-helper
python3 -m http.server 8000
# open http://localhost:8000 on the phone (or your computer)
```

Camera and microphone require HTTPS or `localhost`. To use it on a phone, deploy to any static host with HTTPS, e.g. GitHub Pages: enable **Settings → Pages → Deploy from branch → main → / (root)**, then open the Pages URL on the phone and choose **Share → Add to Home Screen**.

## Configuration (optional)

Copy `config.example.js` to `config.js` (it is gitignored) and fill in:

```js
window.STH_CONFIG = {
  assistantName: "Tech Helper",
  familyPhone: "+15551234567",   // makes the 📞 Call my family button dial this number
  visionUrl: "https://your-server.example.com/analyze"  // enables AI photo analysis
};
```

`visionUrl` must be an **HTTPS** endpoint accepting `POST {"image": "data:image/jpeg;base64,...", "context": "..."}` and replying `{"reply": "..."}`. The photo is sent only there, only when the user taps "What is this?", and is never saved. `examples/vision-server.example.js` is a minimal loopback-only example server (bring your own model; the API key comes from the `VISION_API_KEY` environment variable and is never logged or stored):

```bash
VISION_API_KEY=... VISION_MODEL=... PORT=8787 node examples/vision-server.example.js
```

Without `visionUrl`, the app still works fully: it asks the user to describe what they see and routes them to the right guided flow by voice or tap.

## Project layout

```
index.html                  app shell (one screen, big buttons)
css/styles.css              high-contrast senior-friendly styling
js/content.js               all guided troubleshooting flows (data)
js/engine.js                intent matcher + flow session (UMD, unit-tested in node)
js/voice.js                 speech recognition + speech synthesis wrapper
js/camera.js                camera capture + optional vision call
js/app.js                   UI wiring
manifest.webmanifest, sw.js  installable PWA + offline cache
icons/                      app icons (SVG + PNGs; regenerate PNGs with `node scripts/make-icons.js`)
config.example.js           optional local config template (config.js is gitignored)
examples/vision-server.example.js  optional example vision endpoint (loopback only)
test/                       node --test suites
```

## Tests

```bash
node --check js/app.js && node --check js/content.js && node --check js/engine.js \
  && node --check js/voice.js && node --check js/camera.js && node --check sw.js
node --test test/*.test.js
```

(The glob matters: bare `node --test` also discovers the TanStack app's bun-based tests under `app/`, which node cannot run.)

The tests verify the content graph is valid, voice phrases route to the right flow, and — as a safety invariant — that no step ever asks the user to enter a password into the app.

## Privacy & safety

- No accounts, no analytics, no cookies, no stored photos, no stored passwords.
- Photos go only to the `visionUrl` you configure, over HTTPS, only on demand.
- The password-reset flow only ever directs users to their email provider's official website, typed by hand.
- Scam flow teaches: hang up, don't click, never share passwords/codes/gift cards or grant remote access.
