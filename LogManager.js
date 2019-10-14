const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

function generateJson(logPath) {
  return new Promise((res, rej) => {
    exec(`wineconsole --backend=curses /Users/jhobin/Downloads/GW2EI/GuildWars2EliteInsights.exe -c /Users/jhobin/orange/gw2/gw2-ei-cool.conf "${logPath}"`, (err, stdout, _stderr) => {
      if (err) {
        rej(err);
        return;
      }
      let output = /ete_([a-zA-Z]+)_(fail|kill)/.exec(stdout);
      if (output) {
        res(output[1]);
      } else {
        res();
      }
    });
  });
}

let boss = 'StdGolem';

function jsonPath(rawLogPath, slug, result) {
  return path.join(path.dirname(rawLogPath), `${slug}_${boss}_${result}.json`);
}

module.exports.processLog = async function(rawLogPath) {
  let slug = path.basename(rawLogPath).split('.')[0];
  let killJsonPath = jsonPath(rawLogPath, slug, 'kill');
  let failJsonPath = jsonPath(rawLogPath, slug, 'fail');

  let logFound = fs.existsSync(killJsonPath) || fs.existsSync(failJsonPath);
  if (!logFound) {
    let dir = path.dirname(rawLogPath);
    let logNames = fs.readdirSync(dir);
    for (const logName of logNames) {
      if (!logName.endsWith('_kill.json') &&
          !logName.endsWith('_fail.json')) {
        continue;
      }
      if (logName.includes(slug)) {
        logFound = true;
        if (logName.endsWith('_kill.json')) {
          killJsonPath = path.join(dir, logName);
          const genBoss = logName.match(/_([^_]+)_kill.json/)[1];
          if (genBoss) {
            boss = genBoss;
          }
        }
        break;
      }
    }
  }

  if (!logFound) {
    let genBoss = await generateJson(rawLogPath);
    if (genBoss) {
      boss = genBoss;
    }
    killJsonPath = jsonPath(rawLogPath, slug, 'kill');
  }
  if (fs.existsSync(killJsonPath)) {
    try {
      let log = JSON.parse(fs.readFileSync(killJsonPath));
      return log;
    } catch (e) {
      console.log('weell that was not very nice my little sapling', e);
    }
  }
};

module.exports.gatherLogPaths = function gatherLogPaths(dir) {
  const logDirents = fs.readdirSync(dir, {withFileTypes: true});
  const logPaths = [];
  for (let logDirent of logDirents) {
    const logPath = path.join(dir, logDirent.name);
    if (logDirent.name.startsWith('.')) {
      continue;
    }
    if (logDirent.isDirectory()) {
      logPaths.push(...gatherLogPaths(logPath));
      continue;
    }
    if (!logDirent.isFile()) {
      continue;
    }
    if (!logPath.endsWith('.zevtc') && !logPath.endsWith('.evtc') &&
        !logPath.endsWith('.evtc.zip')) {
      continue;
    }
    logPaths.push(logPath);
  }
  return logPaths;
};

