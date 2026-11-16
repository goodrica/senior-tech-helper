"use strict";

const http = require("node:http");

const PORT = Number(process.env.PORT || 8787);
const API_URL = process.env.VISION_API_URL || "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.VISION_API_KEY || "";
const MODEL = process.env.VISION_MODEL || "";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

if (!API_KEY || !MODEL) {
  console.error("Set VISION_API_KEY and VISION_MODEL in the environment first. The key is never written to disk or logged.");
  process.exit(1);
}

function send(res, status, obj, origin) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin || ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || ALLOWED_ORIGIN;
  if (req.method === "OPTIONS") {
    send(res, 204, {}, origin);
    return;
  }
  if (req.method !== "POST" || req.url !== "/analyze") {
    send(res, 404, { error: "not found" }, origin);
    return;
  }
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 8 * 1024 * 1024) req.destroy();
  });
  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      if (typeof payload.image !== "string" || !payload.image.startsWith("data:image/")) {
        send(res, 400, { error: "image must be a data URL" }, origin);
        return;
      }
      const upstream = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + API_KEY
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content:
                "You are a patient tech-support assistant for an elderly user. Look at the photo (TV screen, remote, error message, device). " +
                "Reply in 2-4 short, plain sentences: what you see, the single next step, and which remote button to press if relevant. " +
                "Never ask for passwords, codes, or payment. If you cannot tell, say so and suggest the on-screen guided topics."
            },
            {
              role: "user",
              content: [
                { type: "text", text: payload.context || "What is in this photo and what should I do next?" },
                { type: "image_url", image_url: { url: payload.image } }
              ]
            }
          ]
        })
      });
      if (!upstream.ok) {
        send(res, 502, { error: "vision provider error " + upstream.status }, origin);
        return;
      }
      const data = await upstream.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!reply) {
        send(res, 502, { error: "empty reply from vision provider" }, origin);
        return;
      }
      send(res, 200, { reply: reply.trim() }, origin);
    } catch (e) {
      send(res, 500, { error: "server error" }, origin);
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("vision example server listening on http://127.0.0.1:" + PORT + " (loopback only)");
});
