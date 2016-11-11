const _ = require('lodash');
const path = require('path');
const toml = require('toml');


/**
 * Parse rules from TOML data
 * @param data
 * @param filename
 * @returns {Array}
 */
module.exports = function parseRules(data, filename = 'unknown') {
  const rules = [];
  try {
    data = toml.parse(data);
  } catch (err) {
    console.warn(`${filename}: unable to parse: ${err}`);
    return [];
  }
  if (Array.from(Object.values(data)).some(_.isString)) {
    console.warn(`${filename}: looks like sections are missing -- always use a '[section]`);
    return [];
  }
  Object.keys(data).forEach((key) => {
    const name = `${filename.replace(/([^/])[^/]+\//g, '$1/')}:${key}`;
    const rule = Object.assign(
      {
        enabled: true,
        name,
        cwd: path.dirname(filename),
      },
      data[key]
    );
    rules.push(rule);
  });
  return rules;
};
