const cp = require('child_process');
const debug = require('debug')('wok:run-rule');

/**
 * Process a `run` stanza from a rule.
 *
 * Returns a promise; before its resolution the response shouldn't be sent.
 *
 * @param rule Rule object
 * @param req Request object
 * @param res Response object
 * @returns {Promise}
 */
function processRun(rule, req, res) {
  const env = {
    WOK_URL: req.url,
    WOK_RULE: rule.name,
  };
  let body = '';
  if (rule.input && req.body) {
    if (typeof req.body === 'string') {
      env.WOK_BODY = 'string';
      body = req.body;
    } else {
      env.WOK_BODY = 'json';
      body = JSON.stringify(req.body);
    }
    debug(`${rule.name}: sending ${body.length} chars of data to input`);
  }

  const options = {
    env: Object.assign({}, process.env, env),
    cwd: rule.cwd || null,
  };
  if (rule.uid) {
    options.uid = rule.uid;
  }
  if (rule.gid) {
    options.gid = rule.gid;
  }

  return new Promise((resolve) => {
    debug(`${rule.name}: running ${rule.run}, output: ${rule.output}`);
    const p = cp.exec(
      rule.run,
      options,
      (err, stdout, stderr) => {
        if (err || stderr) {
          console.warn(`${rule.name}: error ${err}; ${stderr}`);
        }
        debug(`${rule.name}: ${rule.run} finished`);
        if (rule.output) {
          res.write(stdout);
          resolve();
        }
      }
    );
    p.stdin.write(body);
    p.stdin.end();
    if (!rule.output) {
      resolve();
    }
  });
}

module.exports = function runRule(rule, req, res) {
  const promises = [];
  if (rule.run) {
    promises.push(processRun(rule, req, res));
  }
  // "If an empty array is passed, then this method resolves immediately."
  return Promise.all(promises);
};
