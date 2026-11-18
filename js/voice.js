(function (root) {
  "use strict";

  const SR = root.SpeechRecognition || root.webkitSpeechRecognition;

  let recognition = null;
  let listening = false;

  function supported() {
    return !!SR;
  }

  function start(handlers) {
    if (!SR || listening) return false;
    recognition = new SR();
    recognition.lang = root.navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = function (event) {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      if (handlers.onTranscript) handlers.onTranscript(final || interim, !!final);
    };
    recognition.onerror = function (event) {
      listening = false;
      if (handlers.onError) handlers.onError(event.error || "error");
    };
    recognition.onend = function () {
      const wasListening = listening;
      listening = false;
      if (handlers.onEnd) handlers.onEnd(wasListening);
    };
    try {
      recognition.start();
      listening = true;
      return true;
    } catch (e) {
      listening = false;
      if (handlers.onError) handlers.onError(String(e));
      return false;
    }
  }

  function stop() {
    if (recognition && listening) {
      try {
        recognition.stop();
      } catch (e) {
        listening = false;
      }
    }
  }

  function isListening() {
    return listening;
  }

  function pickVoice() {
    if (!("speechSynthesis" in root)) return null;
    const voices = root.speechSynthesis.getVoices() || [];
    const lang = (root.navigator.language || "en-US").toLowerCase();
    let v = voices.find((x) => x.lang && x.lang.toLowerCase() === lang && /female|samantha|zira|hazel|google us/i.test(x.name));
    if (!v) v = voices.find((x) => x.lang && x.lang.toLowerCase().indexOf(lang.slice(0, 2)) === 0);
    if (!v) v = voices.find((x) => x.default);
    return v || null;
  }

  function speak(text, opts) {
    if (!("speechSynthesis" in root)) return false;
    const options = opts || {};
    root.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = root.navigator.language || "en-US";
    utterance.rate = options.rate || 0.95;
    utterance.pitch = 1;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    root.speechSynthesis.speak(utterance);
    return true;
  }

  function stopSpeaking() {
    if ("speechSynthesis" in root) root.speechSynthesis.cancel();
  }

  root.STHVoice = {
    supported: supported,
    start: start,
    stop: stop,
    isListening: isListening,
    speak: speak,
    stopSpeaking: stopSpeaking,
    onVoicesReady: function () {
      if ("speechSynthesis" in root && root.speechSynthesis.onvoiceschanged !== undefined) {
        root.speechSynthesis.onvoiceschanged = function () {};
      }
    }
  };
})(typeof self !== "undefined" ? self : this);
