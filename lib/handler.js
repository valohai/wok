const RuleManager = require('./rule-manager');
const matchRule = require('./rule-match');
const debug = require('debug')('wok:handler');
const runRule = require('./run-rule');

class Handler {
  constructor(dirs) {
    this.ruleManager = new RuleManager(dirs);
    this.lastRuns = new Map();
  }

  processRequest(req, res) {
    const matchedRules = matchRule(this.ruleManager.rules, req);
    if (!matchedRules.length) {
      res.status(404).end('wok says 404: no rules matched');
      return;
    }
    res.status(200);
    const triggeredRules = [];
    const perRulePromises = matchedRules.map((rule) => {
      const timeSinceLastRun = (+new Date() - (this.lastRuns.get(rule.name) || 0)) / 1000;
      if (rule.throttle && timeSinceLastRun < rule.throttle) {
        debug(`not (re)triggering ${rule.name}; time since last run = ${timeSinceLastRun} and throttle = ${rule.throttle}`);
        return Promise.resolve(null);
      }
      this.lastRuns.set(rule.name, +new Date());
      triggeredRules.push(rule);
      return runRule(rule, req, res);
    });
    Promise.all(perRulePromises).then(() => {
      if (!matchedRules.some(rule => !!rule.output)) {
        // send something if nothing was output otherwise
        res.type('text/plain');
        res.send(`rules matched: ${matchedRules.map(rule => rule.name).sort().join(', ')}
rules triggered: ${triggeredRules.map(rule => rule.name).sort().join(', ')}
`);
      }
      res.end();
    });
  }
}

module.exports = Handler;
