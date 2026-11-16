(function (root) {
  "use strict";

  let stream = null;

  function supported() {
    return !!(root.navigator.mediaDevices && root.navigator.mediaDevices.getUserMedia);
  }

  async function open(videoEl) {
    if (!supported()) throw new Error("Camera is not supported on this device/browser.");
    stream = await root.navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    videoEl.srcObject = stream;
    await videoEl.play();
    return true;
  }

  function snap(videoEl) {
    const video = videoEl;
    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / (video.videoWidth || maxWidth));
    const w = Math.round((video.videoWidth || maxWidth) * scale);
    const h = Math.round((video.videoHeight || 720) * scale);
    const canvas = root.document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  function close() {
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      stream = null;
    }
  }

  function visionConfigured() {
    const cfg = root.STH_CONFIG || {};
    return typeof cfg.visionUrl === "string" && /^https:\/\//.test(cfg.visionUrl);
  }

  async function analyze(dataUrl, context) {
    const cfg = root.STH_CONFIG || {};
    if (!visionConfigured()) return null;
    const res = await fetch(cfg.visionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl, context: context || "" })
    });
    if (!res.ok) throw new Error("Vision service returned " + res.status);
    const data = await res.json();
    if (typeof data.reply !== "string" || !data.reply) throw new Error("Vision service returned no reply");
    return data.reply;
  }

  root.STHCamera = {
    supported: supported,
    open: open,
    snap: snap,
    close: close,
    visionConfigured: visionConfigured,
    analyze: analyze
  };
})(typeof self !== "undefined" ? self : this);
