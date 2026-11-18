(function () {
  "use strict";

  const cfg = window.STH_CONFIG || {};
  const engine = window.STHEngine.create(window.STH_CONTENT);
  const voice = window.STHVoice;
  const camera = window.STHCamera;

  const validationErrors = engine.validate();
  if (validationErrors.length) console.error("Content errors:", validationErrors);

  const $ = function (id) {
    return document.getElementById(id);
  };

  const screens = ["screen-home", "screen-flow", "screen-camera"];
  let session = null;
  let soundOn = (localStorage.getItem("sth_sound") || "on") === "on";
  let lastPhoto = null;

  function speak(text) {
    if (soundOn) voice.speak(text);
  }

  function show(name) {
    for (const id of screens) $(id).classList.toggle("hidden", id !== name);
    window.scrollTo(0, 0);
  }

  function setStatus(text) {
    $("home-status").textContent = text;
  }

  function updateSoundButton() {
    const btn = $("sound-toggle");
    btn.textContent = soundOn ? "🔊 Sound on" : "🔇 Sound off";
    btn.setAttribute("aria-pressed", String(soundOn));
  }

  function buildTopics() {
    const grid = $("topic-grid");
    grid.innerHTML = "";
    for (const flow of engine.flows) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn topic-btn";
      const emoji = document.createElement("span");
      emoji.className = "btn-emoji";
      emoji.setAttribute("aria-hidden", "true");
      emoji.textContent = flow.emoji || "🛠";
      const label = document.createElement("span");
      label.textContent = flow.title.replace(/^[^\s]*\s/, "");
      btn.appendChild(emoji);
      btn.appendChild(label);
      btn.addEventListener("click", function () {
        startFlow(flow.id);
      });
      grid.appendChild(btn);
    }
  }

  function renderNode(node) {
    const flow = session.flow();
    $("flow-title").textContent = flow.title;
    $("flow-emoji").textContent = node.emoji || flow.emoji || "🛠";
    $("flow-text").textContent = node.say;
    const ul = $("flow-bullets");
    ul.innerHTML = "";
    for (const b of node.bullets || []) {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    }
    ul.classList.toggle("hidden", !node.bullets || node.bullets.length === 0);
    const wrap = $("flow-options");
    wrap.innerHTML = "";
    const screen = $("screen-flow");
    screen.classList.toggle("node-warn", node.tone === "warn");
    screen.classList.toggle("node-danger", node.tone === "danger");
    (node.options || []).forEach(function (opt, i) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", function () {
        answerOption(i);
      });
      wrap.appendChild(btn);
    });
    speak(node.say);
  }

  function startFlow(flowId) {
    session = engine.start(flowId);
    show("screen-flow");
    renderNode(session.node());
  }

  function answerOption(i) {
    if (!session) return;
    const result = session.answer(i);
    if (result.type === "node" || result.type === "done") {
      renderNode(result.node);
    } else if (result.type === "jump") {
      startFlow(result.flowId);
    } else if (result.type === "home") {
      goHome();
    } else if (result.type === "call") {
      triggerCall();
    }
  }

  function goHome() {
    session = null;
    camera.close();
    show("screen-home");
    setStatus("👋 Hi! What can I help you with today?");
  }

  function handleText(text) {
    const intent = engine.matchIntent(text);
    if (!intent) {
      setStatus("🤔 I'm not sure about that one. Try saying it another way, or tap a topic below. You said: “" + text + "”");
      speak("I'm not sure about that. Try saying it another way, or tap a topic below.");
      show("screen-home");
      return;
    }
    if (intent.kind === "call") {
      triggerCall();
      return;
    }
    startFlow(intent.id);
  }

  function triggerCall() {
    const phone = cfg.familyPhone || "";
    if (phone) {
      window.location.href = "tel:" + phone.replace(/[^0-9+]/g, "");
    } else {
      setStatus("📞 To make this button call your family, they need to add their number in the config.js file (familyPhone).");
      speak("To make the call button work, your family needs to add their phone number in the config file.");
      show("screen-home");
    }
  }

  function openListen() {
    $("listen-overlay").classList.remove("hidden");
    $("listen-text").textContent = "Listening…";
    const ok = voice.start({
      onTranscript: function (text, isFinal) {
        $("listen-text").textContent = isFinal ? text : text + " …";
        if (isFinal) {
          $("listen-overlay").classList.add("hidden");
          handleText(text);
        }
      },
      onError: function (err) {
        $("listen-overlay").classList.add("hidden");
        if (err === "not-allowed" || err === "service-not-allowed") {
          setStatus("🎤 Please allow microphone access in your browser settings, or type below instead.");
          speak("Please allow microphone access, or use the typing option.");
          openType();
        } else if (err === "no-speech") {
          $("listen-text").textContent = "I didn't hear anything — tap Stop and try again.";
        } else {
          openType();
        }
      },
      onEnd: function () {}
    });
    if (!ok) openType();
  }

  function openType() {
    $("type-overlay").classList.remove("hidden");
    $("type-input").value = "";
    $("type-input").focus();
  }

  function closeOverlays() {
    $("listen-overlay").classList.add("hidden");
    $("type-overlay").classList.add("hidden");
    voice.stop();
  }

  async function openCamera() {
    show("screen-camera");
    $("camera-live").classList.remove("hidden");
    $("camera-preview").classList.add("hidden");
    $("camera-result").textContent = "";
    if (!camera.supported()) {
      $("camera-live").classList.add("hidden");
      $("camera-result").textContent = "📷 This device or browser doesn't allow camera access. Try opening this page in your phone's normal browser (Chrome or Safari) over HTTPS.";
      return;
    }
    try {
      await camera.open($("camera-video"));
    } catch (e) {
      $("camera-live").classList.add("hidden");
      $("camera-result").textContent = "📷 I couldn't start the camera. Check that no other app is using it, and allow camera permission in your browser settings.";
    }
  }

  function takePhoto() {
    lastPhoto = camera.snap($("camera-video"));
    $("camera-img").src = lastPhoto;
    $("camera-live").classList.add("hidden");
    $("camera-preview").classList.remove("hidden");
    $("camera-result").textContent = camera.visionConfigured()
      ? "Tap 'What is this?' and I'll look at it. The photo is only sent to your own AI service — it is not stored anywhere."
      : "AI vision is not turned on, so I can't see the photo myself. Tap 'What is this?' and then tell me what you see in your own words.";
    speak($("camera-result").textContent);
  }

  async function analyzePhoto() {
    if (!lastPhoto) return;
    const result = $("camera-result");
    result.textContent = "🔍 Looking at your photo…";
    try {
      if (camera.visionConfigured()) {
        const reply = await camera.analyze(lastPhoto, "An elderly user took this photo for tech support. Describe what you see and give the next simple step.");
        result.textContent = reply;
        speak(reply);
      } else {
        result.textContent = "I can't see photos unless the AI vision option is set up. Instead, tell me what you see — for example, what words are on the screen?";
        speak(result.textContent);
        openListen();
      }
    } catch (e) {
      result.textContent = "⚠️ I couldn't reach the AI vision service. No problem — just tell me what you see, or pick a topic on the home screen.";
      speak(result.textContent);
    }
  }

  function init() {
    buildTopics();
    updateSoundButton();

    const callBtn = $("btn-call");
    if (cfg.familyPhone) callBtn.setAttribute("href", "tel:" + cfg.familyPhone.replace(/[^0-9+]/g, ""));
    callBtn.addEventListener("click", function (e) {
      if (!cfg.familyPhone) {
        e.preventDefault();
        triggerCall();
      }
    });

    $("btn-talk").addEventListener("click", function () {
      if (voice.supported()) openListen();
      else openType();
    });

    $("btn-listen-stop").addEventListener("click", function () {
      voice.stop();
      closeOverlays();
    });

    $("btn-type-send").addEventListener("click", function () {
      const text = $("type-input").value.trim();
      closeOverlays();
      if (text) handleText(text);
    });
    $("type-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") $("btn-type-send").click();
    });
    $("btn-type-cancel").addEventListener("click", closeOverlays);

    $("btn-camera").addEventListener("click", openCamera);
    $("btn-snap").addEventListener("click", takePhoto);
    $("btn-retake").addEventListener("click", function () {
      $("camera-preview").classList.add("hidden");
      $("camera-live").classList.remove("hidden");
      $("camera-result").textContent = "";
    });
    $("btn-analyze").addEventListener("click", analyzePhoto);
    $("btn-camera-back").addEventListener("click", function () {
      camera.close();
      goHome();
    });

    $("btn-repeat").addEventListener("click", function () {
      if (session) voice.speak(session.node().say);
    });
    $("btn-flow-home").addEventListener("click", goHome);

    $("sound-toggle").addEventListener("click", function () {
      soundOn = !soundOn;
      localStorage.setItem("sth_sound", soundOn ? "on" : "off");
      if (!soundOn) voice.stopSpeaking();
      updateSoundButton();
    });

    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
