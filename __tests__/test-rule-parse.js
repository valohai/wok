/* eslint-env jest */
const parseRules = require('../lib/rule-parser');

const example = `
[flerb]
match-url = "^/foo"
run = 'shutdown -r now'
input = true
`;

it('should be able to parse toml', () => {
  const rules = parseRules(example, '/dir/example.toml');
  expect(rules[0].name).toBe('/d/example.toml:flerb');
  expect(rules[0].input).toBe(true);
  expect(rules[0].run).toBe('shutdown -r now');
});

it('should refuse to parse sectionless toml', () => {
  const rules = parseRules('run = \'/bin/true\'', '/dir/example.toml');
  expect(rules).toEqual([]);
});
