/* eslint-env jest */
const ruleMatch = require('../lib/rule-match');

it('should match urls by unanchored regexp', () => {
  const rule = {'match-url': '/foo.+'};
  expect(ruleMatch.single(rule, {url: '/foobar/'})).toBeTruthy();
  expect(ruleMatch.single(rule, {url: '/foonetics/'})).toBeTruthy();
  expect(ruleMatch.single(rule, {url: '/far/foonetics/'})).toBeTruthy();
  expect(ruleMatch.single(rule, {url: '/farts/'})).toBeFalsy();
});

it('should match methods', () => {
  const rule = {'match-method': 'get'};
  expect(ruleMatch.single(rule, {method: 'GET'})).toBeTruthy();
  expect(ruleMatch.single(rule, {method: 'POST'})).toBeFalsy();
});

it('multi-match should work', () => {
  const rules = [
    {'match-method': 'get'},
    {'match-method': 'post'},
  ];
  const matchResult = ruleMatch(rules, {method: 'GET'});
  expect(matchResult).toContain(rules[0]);
  expect(matchResult).not.toContain(rules[1]);
});

it('body match should work', () => {
  expect(
    ruleMatch.single({'match-body': 'foo=bar'}, {body: {foo: 'bar'}})
  ).toBeTruthy();
});

it('query match should work', () => {
  expect(
    ruleMatch.single(
      {
        'match-query': [
          'foo=bar',
          {key: 'bar', regexp: '^quux.+'},
          {key: 'bar', contains: 'rreps', negate: true},
        ],
      },
      {query: {foo: 'bar', bar: 'quuxnep'}}
    )
  ).toBeTruthy();
});
