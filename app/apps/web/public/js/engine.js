(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.STHEngine = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const MIN_SCORE = 4;

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalize(text) {
    return " " + String(text || "").toLowerCase().replace(/['’]/g, "'") + " ";
  }

  function isCallIntent(text) {
    const t = normalize(text);
    return (
      /\b(call|phone|ring|telephone)\b/.test(t) &&
      /\b(family|son|daughter|kid|kids|child|children|wife|husband|grandson|granddaughter|brother|sister|mom|dad|mother|father)\b/.test(t)
    );
  }

  function scoreFlow(flow, t) {
    let score = 0;
    for (const kw of flow.keywords) {
      const k = normalize(kw).trim();
      if (!k) continue;
      if (k.indexOf(" ") !== -1) {
        if (t.indexOf(k) !== -1) score += k.length + 2;
      } else if (new RegExp("\\b" + escapeRegExp(k) + "\\b").test(t)) {
        score += 4;
      }
    }
    return score;
  }

  function validate(content) {
    const errors = [];
    const flowIds = new Set();
    for (const flow of content.flows) {
      if (!flow.id) errors.push("flow without id");
      if (flowIds.has(flow.id)) errors.push("duplicate flow id: " + flow.id);
      flowIds.add(flow.id);
      if (!flow.title) errors.push(flow.id + ": missing title");
      if (!flow.nodes || !flow.nodes[flow.start]) errors.push(flow.id + ": start node '" + flow.start + "' missing");
      for (const [nodeId, node] of Object.entries(flow.nodes || {})) {
        if (!node.say) errors.push(flow.id + "/" + nodeId + ": missing say");
        if (!node.end && (!node.options || node.options.length === 0)) {
          errors.push(flow.id + "/" + nodeId + ": non-end node needs options");
        }
        for (const opt of node.options || []) {
          if (opt.next && !(flow.nodes && flow.nodes[opt.next])) {
            errors.push(flow.id + "/" + nodeId + ": option points to missing node '" + opt.next + "'");
          }
          if (opt.flow && !flowIds.has(opt.flow) && !content.flows.some((f) => f.id === opt.flow)) {
            errors.push(flow.id + "/" + nodeId + ": option points to missing flow '" + opt.flow + "'");
          }
          if (!opt.next && !opt.flow && !opt.home && !opt.call) {
            errors.push(flow.id + "/" + nodeId + ": option has no action");
          }
        }
      }
    }
    return errors;
  }

  function create(content) {
    const byId = {};
    for (const f of content.flows) byId[f.id] = f;

    function matchIntent(text) {
      if (isCallIntent(text)) return { kind: "call" };
      const t = normalize(text);
      let best = null;
      let bestScore = 0;
      for (const f of content.flows) {
        const s = scoreFlow(f, t);
        if (s > bestScore) {
          bestScore = s;
          best = f.id;
        }
      }
      if (best && bestScore >= MIN_SCORE) return { kind: "flow", id: best, score: bestScore };
      return null;
    }

    function Session(flowId) {
      if (!byId[flowId]) throw new Error("unknown flow: " + flowId);
      this.flowId = flowId;
      this.nodeId = byId[flowId].start;
    }
    Session.prototype.flow = function () {
      return byId[this.flowId];
    };
    Session.prototype.node = function () {
      return this.flow().nodes[this.nodeId];
    };
    Session.prototype.answer = function (i) {
      const node = this.node();
      const opt = (node.options || [])[i];
      if (!opt) return { type: "error" };
      if (opt.call) return { type: "call" };
      if (opt.home) return { type: "home" };
      if (opt.flow) return { type: "jump", flowId: opt.flow };
      this.nodeId = opt.next;
      const next = this.node();
      return next.end ? { type: "done", node: next } : { type: "node", node: next };
    };

    return {
      flows: content.flows,
      matchIntent: matchIntent,
      start: function (flowId) {
        return new Session(flowId);
      },
      validate: function () {
        return validate(content);
      }
    };
  }

  return { create: create, validate: validate, matchIntentText: isCallIntent };
});
