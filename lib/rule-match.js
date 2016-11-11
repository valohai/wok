const debug = require('debug')('wok:rule-match');
const _ = require('lodash');

function arrayfy(val) {
  if (_.isUndefined(val)) {
    return [];
  }
  if (!_.isArray(val)) {
    return [val];
  }
  return val;
}

function matchKeyVal(haystack, needles) {
  return arrayfy(needles).map((needle) => {
    if (_.isString(needle)) {
      const [key, equals] = needle.split('=', 2);
      return {key, equals};
    }
    return needle;
  }).every(
    ({key, equals, regexp, contains = false, negate = false}) => {
      const flag = !negate;
      const haystackValue = `${_.get(haystack || {}, key)}`;
      if (regexp) {
        return !!(new RegExp(regexp).exec(haystackValue)) === flag;
      }
      if (contains) {
        return (haystackValue.indexOf(contains) > -1) === flag;
      }
      return (`${equals}` === haystackValue) === flag;
    }
  );
}

function match(rule, req) {
  let matches = 0;
  if (rule['match-method']) {
    const ok = (`${req.method}`.toLowerCase() === `${rule['match-method']}`.toLowerCase());
    debug(`method ${rule['match-method']} matches ${req.method} ? ${ok}`);
    matches += +ok;
  }
  if (rule['match-url']) {
    const ok = (new RegExp(rule['match-url']).test(req.url));
    debug(`match-url ${rule['match-url']} against ${req.url} ? ${ok}`);
    matches += +ok;
  }
  if (rule['match-body']) {
    const ok = matchKeyVal(req.body, rule['match-body']);
    debug(`match-body? ${ok}`);
    matches += +ok;
  }
  if (rule['match-query']) {
    const ok = matchKeyVal(req.query, rule['match-query']);
    debug(`match-query? ${ok}`);
    matches += +ok;
  }
  return (matches > 0);
}

/**
 *
 * @param rules {Map} Map or array of rules
 * @param req Express request
 * @returns {Array.<*>}
 */
module.exports = function matchRules(rules, req) {
  if (rules.values) {
    rules = Array.from(rules.values());
  }
  return rules.filter(rule => match(rule, req));
};

module.exports.single = match;
