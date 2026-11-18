(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.STH_CONTENT = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const flows = [
    {
      id: "tv-power",
      title: "📺 TV won't turn on",
      emoji: "📺",
      keywords: ["tv won't turn on", "won't turn on", "turn on the tv", "no power", "tv not working", "television", "tv", "power", "dead"],
      start: "s1",
      nodes: {
        s1: {
          say: "Let's check the power. Look at the back of the TV. Is the power cord firmly plugged into the TV?",
          bullets: ["Wiggle it gently to make sure it is snug."],
          options: [
            { label: "✅ Yes, it's plugged in", next: "s2" },
            { label: "It was loose — I pushed it in", next: "s2" },
            { label: "I can't reach the back", next: "s5" }
          ]
        },
        s2: {
          say: "Now check the other end. Is the plug firmly in the wall outlet?",
          options: [
            { label: "✅ Yes, plugged into the wall", next: "s3" },
            { label: "It was loose — I pushed it in", next: "s3" },
            { label: "I can't reach the outlet", next: "s5" }
          ]
        },
        s3: {
          say: "Let's test the outlet. Plug a lamp into the same outlet. Does the lamp turn on?",
          options: [
            { label: "✅ Lamp works — outlet is fine", next: "s4" },
            { label: "Lamp does not work", next: "s6" }
          ]
        },
        s4: {
          say: "Good, the outlet works. Now find the POWER button on the TV itself — a small button on the bottom or side edge, not on the remote. Press it once.",
          bullets: ["Do not hold it down. One press."],
          options: [
            { label: "✅ The TV turned on!", next: "end-ok" },
            { label: "Nothing happened", next: "s7" }
          ]
        },
        s5: {
          say: "No problem. Try the red POWER button on the remote first. If nothing happens, ask someone nearby to help check the back of the TV.",
          options: [
            { label: "✅ Remote power worked — TV is on!", next: "end-ok" },
            { label: "Still nothing", next: "s7" }
          ]
        },
        s6: {
          say: "That outlet may be dead. Move the TV's plug to a different wall outlet — test the new outlet with the lamp first.",
          options: [
            { label: "✅ TV turned on in the other outlet!", next: "end-ok" },
            { label: "Still nothing", next: "s7" }
          ]
        },
        s7: {
          say: "Last try: the remote batteries. Open the battery cover on the back of the remote, take out the old batteries, and put in fresh ones. Match the + and − signs. Then press the red power button.",
          options: [
            { label: "✅ It worked! TV is on!", next: "end-ok" },
            { label: "Still nothing", next: "end-call" }
          ]
        },
        "end-ok": {
          end: true,
          say: "Great! Your TV is on. 🎉 If it ever won't turn on again, try a different outlet first.",
          options: [
            { label: "📺 Get to Netflix on the TV", flow: "tv-netflix" },
            { label: "🏠 Done — back to home", home: true }
          ]
        },
        "end-call": {
          end: true,
          tone: "warn",
          say: "I think it's time to call for help — your family, or a TV repair shop. This is not your fault!",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        }
      }
    },
    {
      id: "tv-netflix",
      title: "📺 Netflix on the TV",
      emoji: "🍿",
      keywords: ["netflix", "red n", "streaming", "movies on tv", "watch netflix"],
      start: "s1",
      nodes: {
        s1: {
          say: "We'll get Netflix on your TV. Press the HOME button on your remote — it usually looks like a little house.",
          emoji: "🏠",
          options: [
            { label: "✅ I'm on the home screen", next: "s2" },
            { label: "Nothing happened", flow: "tv-power" },
            { label: "I don't see a home button", next: "s5" }
          ]
        },
        s2: {
          say: "Use the arrow buttons (up, down, left, right) to move the highlight box around the screen. Move it onto the Netflix icon — a red N.",
          emoji: "🟥",
          options: [
            { label: "✅ Netflix is highlighted", next: "s3" },
            { label: "I don't see Netflix", next: "s4" }
          ]
        },
        s3: {
          say: "Press the OK button in the middle of the arrows. Netflix should start opening.",
          options: [
            { label: "✅ Netflix opened", next: "s6" },
            { label: "It's loading / spinning", next: "s7" },
            { label: "It asks me to sign in", next: "s6" }
          ]
        },
        s4: {
          say: "Netflix may not be installed yet. Press the 🔍 Search button on the remote, or look for 'Apps' or 'App store'. Type 'Netflix' and install it. Installing is free.",
          options: [
            { label: "✅ Found it and installed it", next: "s2" },
            { label: "I can't find search", next: "s8" }
          ]
        },
        s5: {
          say: "Look for a house 🏠, a menu ☰, or a button labeled HOME on the remote. Try that one.",
          options: [
            { label: "✅ Home screen is up", next: "s2" },
            { label: "Still can't find it", next: "s4" }
          ]
        },
        s6: {
          say: "Sign in with your Netflix email and password using the remote. Type slowly. Only do this on the real Netflix sign-in screen.",
          tone: "warn",
          bullets: ["This app will never ask for your Netflix password."],
          options: [
            { label: "✅ Signed in — I'm watching!", next: "end-ok" },
            { label: "Wrong password / can't sign in", next: "s9" }
          ]
        },
        s7: {
          say: "Wait 30 seconds — it can be slow. If it's still spinning, press the BACK button ⬅ and open Netflix again.",
          options: [
            { label: "✅ It opened", next: "s6" },
            { label: "Still stuck", next: "s9" }
          ]
        },
        s8: {
          say: "If your remote has a red N button, press it. Otherwise open your TV's Apps page and look for Netflix there.",
          options: [
            { label: "✅ Found Netflix", next: "s3" },
            { label: "No luck", next: "end-call" }
          ]
        },
        s9: {
          say: "To reset your Netflix password, go to netflix.com on a phone or computer and choose 'Forgot password?'. I can also help you with your email password.",
          options: [
            { label: "Help with my email password", flow: "email-reset" },
            { label: "Try Netflix again", next: "s6" },
            { label: "📞 Call my family", call: true }
          ]
        },
        "end-ok": {
          end: true,
          say: "Enjoy your show! 🍿 Use the arrows to pick something and OK to play it. BACK ⬅ takes you out.",
          options: [
            { label: "📺 Amazon Prime Video instead", flow: "tv-prime" },
            { label: "🏠 Done — back to home", home: true }
          ]
        },
        "end-call": {
          end: true,
          tone: "warn",
          say: "Let's get your family on the phone — they can help from there.",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        }
      }
    },
    {
      id: "tv-prime",
      title: "📺 Amazon Prime Video on the TV",
      emoji: "📦",
      keywords: ["prime video", "amazon prime", "amazon video", "prime"],
      start: "s1",
      nodes: {
        s1: {
          say: "We'll open Prime Video. Press HOME 🏠 on the remote, then use the arrows to highlight the Prime Video icon — it's blue with a white smile. Press OK.",
          options: [
            { label: "✅ Prime Video opened", next: "s2" },
            { label: "I don't see Prime Video", next: "s3" },
            { label: "Nothing happened", flow: "tv-power" }
          ]
        },
        s2: {
          say: "Sign in with your Amazon account (email and password) if it asks. Type slowly with the remote.",
          tone: "warn",
          bullets: ["Only on the real Amazon sign-in screen. This app never asks for passwords."],
          options: [
            { label: "✅ Signed in — ready to watch!", next: "end-ok" },
            { label: "Forgot my Amazon password", flow: "email-reset" }
          ]
        },
        s3: {
          say: "Prime Video might not be installed. Press 🔍 Search on the remote, type 'Prime Video', and install it. It's free with your Amazon account.",
          options: [
            { label: "✅ Installed it", next: "s1" },
            { label: "Can't find it", next: "end-call" }
          ]
        },
        "end-ok": {
          end: true,
          say: "You're all set! 🍿 Pick a movie or show with the arrows and OK.",
          options: [
            { label: "📺 Netflix instead", flow: "tv-netflix" },
            { label: "🏠 Done — back to home", home: true }
          ]
        },
        "end-call": {
          end: true,
          tone: "warn",
          say: "Let's call your family for a hand.",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        }
      }
    },
    {
      id: "tv-nosignal",
      title: "🖤 'No signal' / black screen",
      emoji: "📡",
      keywords: ["no signal", "hdmi", "input", "source", "no picture", "black screen", "no input"],
      start: "s1",
      nodes: {
        s1: {
          say: "The TV is probably on the wrong input. Press the INPUT or SOURCE button on the remote — it often has a small rectangle icon. Press it once and wait 3 seconds. Do you see a picture now?",
          options: [
            { label: "✅ Yes! Picture is back", next: "end-ok" },
            { label: "It says 'No signal'", next: "s2" }
          ]
        },
        s2: {
          say: "Keep pressing INPUT / SOURCE slowly, one press at a time. Watch for 'HDMI 1', 'HDMI 2', or the name of your device (cable box, DVD player). The right one shows your picture.",
          options: [
            { label: "✅ Found the right input!", next: "end-ok" },
            { label: "None of them work", next: "s3" }
          ]
        },
        s3: {
          say: "Check that your device (cable box, streaming stick) is powered on, and push the HDMI cable in firmly at both ends — TV and device. Then press INPUT to that HDMI again.",
          options: [
            { label: "✅ Works now!", next: "end-ok" },
            { label: "Still nothing", next: "end-call" }
          ]
        },
        "end-ok": {
          end: true,
          say: "All fixed! 🎉 Tip: remember which HDMI number your device uses — e.g. 'cable box is HDMI 1'.",
          options: [{ label: "🏠 Done — back to home", home: true }]
        },
        "end-call": {
          end: true,
          tone: "warn",
          say: "Time to call your family or the cable company.",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        }
      }
    },
    {
      id: "remote",
      title: "🎮 Which button on the remote?",
      emoji: "🎮",
      keywords: ["remote", "remote control", "which button", "button", "buttons", "what does this button"],
      start: "s1",
      nodes: {
        s1: {
          say: "Here's what the buttons usually do. Tap the button you want to know about.",
          options: [
            { label: "🔴 Power", next: "b-power" },
            { label: "🏠 Home", next: "b-home" },
            { label: "⬅ Back", next: "b-back" },
            { label: "⭕ OK / arrows", next: "b-ok" },
            { label: "🔊 Volume", next: "b-vol" },
            { label: "📺 Channel (CH)", next: "b-ch" },
            { label: "🔇 Mute", next: "b-mute" },
            { label: "🔌 Input / Source", next: "b-input" },
            { label: "🎤 Mic (Alexa)", next: "b-mic" },
            { label: "🔢 Numbers 0–9", next: "b-num" },
            { label: "🏠 Done — back to home", home: true }
          ]
        },
        "b-power": {
          say: "🔴 POWER turns the TV on and off. It's usually red and near the top of the remote. Press it once — don't hold it.",
          options: [{ label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-home": {
          say: "🏠 HOME takes you to the TV's main screen where all the apps are (Netflix, Prime Video, settings).",
          options: [{ label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-back": {
          say: "⬅ BACK goes back one screen — like an 'undo'. Safe to press; it won't break anything.",
          options: [{ label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-ok": {
          say: "The ARROW buttons move the highlight box on screen. The OK button (usually in the middle of the arrows) selects what's highlighted.",
          options: [{ label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-vol": {
          say: "🔊 VOLUME: + makes it louder, − makes it quieter. Often a long rocker on the side of the remote.",
          options: [{ label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-ch": {
          say: "CH or ▲▼ changes the TV channel. If you watch Netflix or Prime, you may not need this.",
          options: [{ label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-mute": {
          say: "🔇 MUTE silences the sound. Press it again to bring the sound back. Look for a speaker icon with a line through it.",
          options: [{ label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-input": {
          say: "🔌 INPUT / SOURCE switches between HDMI 1, HDMI 2, and so on. Use it when the screen says 'No signal'.",
          options: [{ label: "🖤 Fix 'No signal'", flow: "tv-nosignal" }, { label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-mic": {
          say: "🎤 MIC is on Alexa remotes. Hold it down and say 'Alexa, what's the weather?' Then let go.",
          options: [{ label: "Set up Alexa", flow: "alexa" }, { label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        },
        "b-num": {
          say: "🔢 Numbers 0–9: type a channel number directly. On some remotes, pressing a number repeatedly cycles through letters (for typing search terms).",
          options: [{ label: "⬅ More buttons", next: "s1" }, { label: "🏠 Home", home: true }]
        }
      }
    },
    {
      id: "alexa",
      title: "🔊 Set up Alexa (Echo)",
      emoji: "🔊",
      keywords: ["alexa", "echo", "amazon echo", "smart speaker", "set up echo"],
      start: "s1",
      nodes: {
        s1: {
          say: "Let's set up your Alexa speaker. First, plug the Echo into the wall. Wait until the light ring turns orange or blue.",
          options: [
            { label: "✅ The ring is orange or blue", next: "s2" },
            { label: "No light at all", next: "s5" }
          ]
        },
        s2: {
          say: "On your phone, open the Alexa app. Tap 'Devices' at the bottom, then the + sign, then 'Add Device'.",
          options: [
            { label: "✅ I'm in the Alexa app", next: "s3" },
            { label: "I don't have the Alexa app", next: "s4" }
          ]
        },
        s3: {
          say: "Choose your Echo model, then 'Set up device'. The app will ask for your Wi-Fi network — pick it and type the Wi-Fi password in the APP. I will never ask for any password.",
          tone: "warn",
          options: [
            { label: "✅ Connected to Wi-Fi", next: "s6" },
            { label: "It won't connect", next: "s7" }
          ]
        },
        s4: {
          say: "Install the free 'Alexa' app from your phone's app store — App Store on iPhone, Play Store on Android. Search for 'Amazon Alexa'.",
          options: [
            { label: "✅ App is installed", next: "s2" },
            { label: "Can't install it", next: "end-call" }
          ]
        },
        s5: {
          say: "Check the power cable is snug at both ends. Try a different wall outlet — test it with a lamp first.",
          options: [
            { label: "✅ The light is on now", next: "s2" },
            { label: "Still no light", next: "end-call" }
          ]
        },
        s6: {
          say: "Now say out loud: 'Alexa, what time is it?'",
          emoji: "🗣",
          options: [
            { label: "✅ She answered!", next: "end-ok" },
            { label: "No answer", next: "s7" }
          ]
        },
        s7: {
          say: "Let's troubleshoot. 1) Check the mic button on top of the Echo — if it's red, press it to turn the mic back on. 2) Say 'Alexa, volume up'. 3) Unplug the Echo for 15 seconds, then plug it back in. 4) Make sure your phone is on the same Wi-Fi.",
          options: [
            { label: "✅ She answered now!", next: "end-ok" },
            { label: "Still silent", next: "end-call" }
          ]
        },
        "end-ok": {
          end: true,
          say: "Alexa is ready! 🎉 Try: 'Alexa, play music', 'Alexa, set a timer for 10 minutes', 'Alexa, what's the weather?'",
          options: [{ label: "🏠 Done — back to home", home: true }]
        },
        "end-call": {
          end: true,
          tone: "warn",
          say: "Let's call your family — they can walk through it with you.",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        }
      }
    },
    {
      id: "email-reset",
      title: "📧 Forgotten email password",
      emoji: "📧",
      keywords: ["password", "forgot password", "forgot my password", "can't log in", "cant log in", "login", "log in", "sign in", "email", "gmail", "outlook", "yahoo", "icloud", "account", "reset", "locked out"],
      start: "s1",
      nodes: {
        s1: {
          tone: "warn",
          say: "Important first: I will NEVER ask for your password, and you should never type your password into this app. We'll only use the official website of your email provider.",
          options: [{ label: "✅ I understand", next: "s2" }]
        },
        s2: {
          say: "Open your internet browser (Chrome, Safari, or Edge). In the address bar at the top, type the official address yourself: gmail.com, outlook.com, or yahoo.com. Then press Go.",
          bullets: ["Typing the address yourself protects you from fake look-alike sites."],
          options: [
            { label: "✅ I'm on my email website", next: "s3" },
            { label: "I can't open a browser", next: "s8" }
          ]
        },
        s3: {
          say: "Below the sign-in box, look for a link that says 'Forgot password?', 'Need help?', or 'Can't access your account?'. Tap it.",
          options: [
            { label: "✅ I found it", next: "s4" },
            { label: "I don't see it", next: "s9" }
          ]
        },
        s4: {
          say: "It will ask for your email address — type it and continue. Then choose how to prove it's you: a code sent by text, or a link sent to a backup email.",
          options: [
            { label: "✅ I got a code or link", next: "s5" },
            { label: "Nothing arrived", next: "s6" }
          ]
        },
        s5: {
          say: "Enter the code, or tap the link in the email. Then create a NEW password. Tips: use at least 12 characters, mix words, numbers, and a symbol — for example 'BlueSky!River7Duck'. Write it down on paper and keep it somewhere safe. Never store it in this app.",
          bullets: ["Avoid birthdays and pet names — those are easy to guess."],
          options: [
            { label: "✅ I'm back into my email!", next: "end-ok" },
            { label: "It says the code is wrong", next: "s7" }
          ]
        },
        s6: {
          say: "Wait 5 minutes, then check your Spam or Junk folder for the email. If there's a 'Resend code' button, press it. Double-check you typed your email address correctly.",
          options: [
            { label: "✅ Found it!", next: "s5" },
            { label: "Still nothing", next: "s10" }
          ]
        },
        s7: {
          say: "Codes expire quickly. Ask for a NEW code and type it carefully. Watch out: 0 looks like O, and 1 looks like l.",
          options: [
            { label: "✅ New code worked", next: "s5" },
            { label: "Still not working", next: "s10" }
          ]
        },
        s8: {
          say: "Look for a browser icon on your phone or computer: Chrome (a colorful circle), Safari (a blue compass), or Edge (a blue wave). Tap it, then come back to these steps.",
          options: [
            { label: "✅ Browser is open", next: "s2" },
            { label: "There's no browser at all", next: "end-call" }
          ]
        },
        s9: {
          say: "On gmail.com it's 'Forgot password?' under the password box. On outlook.com it's 'Forgot my password' or 'Trouble signing in?'. Use whichever you see.",
          options: [
            { label: "✅ Found it", next: "s4" },
            { label: "Still can't find it", next: "s10" }
          ]
        },
        s10: {
          say: "For tough cases, use the provider's official account recovery page — search your browser for 'Gmail account recovery' or 'Microsoft account recovery'. Or call your family. That's what family is for!",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        },
        "end-ok": {
          end: true,
          say: "You're back in! 🎉 Now use your new password anywhere you sign in with that email. And remember — real companies will never ask for your password by phone or email.",
          options: [
            { label: "🚨 Was that a scam? Let me check", flow: "scam" },
            { label: "🏠 Done — back to home", home: true }
          ]
        },
        "end-call": {
          end: true,
          tone: "warn",
          say: "Let's call your family for a hand with the account.",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        }
      }
    },
    {
      id: "wifi",
      title: "📶 Wi-Fi / internet not working",
      emoji: "📶",
      keywords: ["wifi", "wi-fi", "wi fi", "internet", "wireless", "offline", "no internet", "internet down", "won't connect", "can't connect", "cant connect"],
      start: "s1",
      nodes: {
        s1: {
          say: "Let's fix the internet. First, check your phone: is the Wi-Fi symbol showing, and can you open a website?",
          options: [
            { label: "✅ Phone internet works", next: "s2" },
            { label: "Phone has no internet either", next: "s3" }
          ]
        },
        s2: {
          say: "So only one device is affected. On that device: turn Wi-Fi off, wait 10 seconds, then turn it back on. Then restart the device — power it off and on.",
          options: [
            { label: "✅ It works now!", next: "end-ok" },
            { label: "Still not working", next: "s4" }
          ]
        },
        s3: {
          say: "The router needs a restart. Unplug the router — the box with lights and maybe antennas — from the wall. Wait 30 seconds. Plug it back in, and wait 2 minutes for the lights to settle.",
          options: [
            { label: "✅ Internet is back!", next: "end-ok" },
            { label: "Still down", next: "s4" }
          ]
        },
        s4: {
          say: "Let's reconnect to Wi-Fi by hand. Open Wi-Fi settings, tap your network name, choose 'Forget', then tap it again and type the Wi-Fi password carefully — it is case-sensitive. The password is usually on a sticker on the router.",
          options: [
            { label: "✅ Connected!", next: "end-ok" },
            { label: "Wrong password / won't connect", next: "s5" }
          ]
        },
        s5: {
          say: "If the sticker password doesn't work, the Wi-Fi password may have been changed. Ask your family or your internet provider for it. You can also restart the device once more.",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        },
        "end-ok": {
          end: true,
          say: "Internet is working again! 🎉 If it drops often, ask your internet provider to check the router.",
          options: [{ label: "🏠 Done — back to home", home: true }]
        }
      }
    },
    {
      id: "scam",
      title: "🚨 Is this a scam?",
      emoji: "🛡",
      keywords: ["scam", "fraud", "virus", "hacked", "microsoft", "irs", "popup", "suspicious", "strange call", "phone call", "gift card", "remote access", "text message", "suspicious call", "scary message"],
      start: "s1",
      nodes: {
        s1: {
          say: "Let's check if it's a scam. What happened?",
          options: [
            { label: "📞 Phone call about a 'virus', from 'Microsoft', the IRS, or my bank", next: "s2" },
            { label: "🖥 Popup on screen: 'VIRUS DETECTED — call this number'", next: "s3" },
            { label: "📧 Email or text asking for my password, gift cards, or a code", next: "s4" },
            { label: "💻 Someone asked to take control of my computer remotely", next: "s5" },
            { label: "🔗 A text message with a link I'm not sure about", next: "s6" },
            { label: "Something else", home: true }
          ]
        },
        s2: {
          tone: "danger",
          say: "YES — this is a scam. Real companies never call you out of the blue about viruses or money.",
          bullets: ["HANG UP immediately.", "Never give money, gift cards, passwords, or codes.", "Never let anyone remote into your computer."],
          options: [
            { label: "✅ I hung up", next: "s7" },
            { label: "I already gave information", next: "s8" }
          ]
        },
        s3: {
          tone: "danger",
          say: "YES — this is a scam popup. Do NOT call the number on it.",
          bullets: ["Real virus warnings never ask you to call a phone number.", "Close the browser window. If it won't close, hold the power button to shut the device down, then restart."],
          options: [
            { label: "✅ I closed it", next: "s7" },
            { label: "I called the number", next: "s8" }
          ]
        },
        s4: {
          tone: "danger",
          say: "YES — this is a scam. No real company ever asks for passwords, gift cards, or security codes by email or text.",
          bullets: ["Delete the message. Do not tap links or reply.", "If it's about your bank or email, call the official number on the back of your card."],
          options: [
            { label: "✅ I deleted it", next: "s7" },
            { label: "I already replied or tapped a link", next: "s8" }
          ]
        },
        s5: {
          tone: "danger",
          say: "YES — this is a scam. Legitimate tech support never asks for remote access out of the blue.",
          bullets: ["Hang up or end the session.", "If they are connected, shut the computer down.", "From a different, safe device, change any passwords they may have seen."],
          options: [
            { label: "✅ I ended it", next: "s7" },
            { label: "They may still be connected", next: "s8" }
          ]
        },
        s6: {
          tone: "warn",
          say: "Be careful with links in texts. Only tap links from people you know and were expecting a message from.",
          bullets: ["When unsure, call the person directly to ask if they sent it.", "Look closely at the sender's number — scammers can fake it."],
          options: [
            { label: "✅ I didn't tap it", next: "s7" },
            { label: "I tapped it", next: "s8" }
          ]
        },
        s7: {
          say: "You're safe. 🎉 Remember the rule: hang up, don't click, and never share passwords, codes, or gift cards.",
          options: [
            { label: "📋 How to report it", next: "s9" },
            { label: "🏠 Back to home", home: true }
          ]
        },
        s8: {
          tone: "danger",
          say: "Act fast: 1) Hang up and disconnect. 2) Turn off Wi-Fi or unplug the computer. 3) From another device, change the passwords they may have seen. 4) Call your bank using the number on the back of your card. 5) Call your family.",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "I've done these steps", next: "s7" }
          ]
        },
        s9: {
          say: "You can report scams to the FTC at reportfraud.ftc.gov (in the US), or to your country's fraud office. Reporting helps stop them.",
          options: [{ label: "🏠 Back to home", home: true }]
        }
      }
    },
    {
      id: "volume",
      title: "🔊 Can't hear the TV",
      emoji: "🔊",
      keywords: ["volume", "too quiet", "can't hear", "cant hear", "mute", "sound", "loud", "quiet", "hear"],
      start: "s1",
      nodes: {
        s1: {
          say: "Let's turn the sound up. Press the VOLUME + button on the remote — often a rocker marked with a speaker 🔊 and +. Press it several times.",
          options: [
            { label: "✅ I can hear it now", next: "end-ok" },
            { label: "Still no sound", next: "s2" }
          ]
        },
        s2: {
          say: "Press the MUTE button 🔇 once — if the TV was muted, sound comes back. Also open Menu → Sound on the TV and check the volume there.",
          options: [
            { label: "✅ Sound is back!", next: "end-ok" },
            { label: "Still silent", next: "s3" }
          ]
        },
        s3: {
          say: "If you have a soundbar or external speakers, their volume is controlled separately — try their remote or the buttons on the soundbar. Also try the volume on the device itself (cable box or streaming stick).",
          options: [
            { label: "✅ Found the right volume!", next: "end-ok" },
            { label: "Nothing works", next: "end-call" }
          ]
        },
        "end-ok": {
          end: true,
          say: "Sound is on! 🔊 Volume + and − control it from now on.",
          options: [{ label: "🏠 Done — back to home", home: true }]
        },
        "end-call": {
          end: true,
          tone: "warn",
          say: "Let's call your family — they can check the speakers with you.",
          options: [
            { label: "📞 Call my family", call: true },
            { label: "🏠 Back to home", home: true }
          ]
        }
      }
    }
  ];

  return { flows: flows };
});
