const _ = require('lodash');
const chokidar = require('chokidar');
const debug = require('debug')('wok:rule-manager');
const EventEmitter = require('events');
const fs = require('fs');
const parseRules = require('./rule-parser');
const path = require('path');

class RuleManager extends EventEmitter {
  constructor(dirs) {
    super();
    const watcher = this.watcher = chokidar.watch(dirs, {
      ignored: /[/\\]\./,
      persistent: true,
    });
    this.rules = new Map();
    const rescanRules = _.debounce(this.rescan.bind(this), 500);
    watcher.on('ready', rescanRules);
    watcher.on('add', rescanRules);
    watcher.on('change', rescanRules);
    watcher.on('unlink', rescanRules);
  }

  rescan() {
    const files = this.getTomlFiles();
    const newRules = new Map();
    const oldRules = this.rules;
    const fileReadingPromises = Array.from(files).map(filename =>
      new Promise((resolve, reject) => {
        fs.readFile(filename, 'UTF-8', (err, data) => {
          if (err) return reject(err);
          parseRules(data, filename).forEach((rule) => {
            newRules.set(rule.name, rule);
          });
          return resolve({filename, data});
        });
      })
    );
    return Promise.all(fileReadingPromises).then(() => {
      const newRuleNames = Array.from(newRules.keys()).sort();
      const oldRuleNames = Array.from(oldRules.keys()).sort();
      if (!_.isEqual(oldRuleNames, newRuleNames)) {
        console.log(`${newRuleNames.length} rules loaded: ${newRuleNames}`);
      }
      debug(`reloaded rules; ${newRules.size} extant rules`);
      this.rules = newRules;
      this.emit('rulesReloaded');
    });
  }

  getTomlFiles() {
    const files = new Set();
    const watched = this.watcher.getWatched();
    Object.keys(watched).forEach((dir) => {
      watched[dir].forEach((filename) => {
        if (/.toml$/.test(filename)) {
          files.add(path.join(dir, filename));
        }
      });
    });
    return files;
  }

  stop() {
    this.watcher.end();
  }
}

module.exports = RuleManager;
