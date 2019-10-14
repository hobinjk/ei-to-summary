const raLogStandards = require('./raLogStandards');
const mechanics = require('./mechanics');
const playerStats = require('./playerStats');
const LogManager = require('./LogManager');

function getPlayerStats(log) {
  const allPlayerStats = log.players.map(player => {
    const base = playerStats(log, player);
    if (!mechanics.hasOwnProperty(log.fightName)) {
      return base;
    }

    base.mechanics = mechanics[log.fightName](log, player);
    const standards = raLogStandards[log.fightName];
    if (!standards) {
      return base;
    }
    let report = {};
    let bad = 0;
    let questionable = 0;
    report.overall = ''; // Make summary show up first
    for (const mechKey in standards) {
      if (!base.mechanics.hasOwnProperty(mechKey)) {
        report[mechKey] = 'good';
        continue;
      }
      if (standards[mechKey] === 'low') {
        if (base.mechanics[mechKey] === 0) {
          report[mechKey] = 'good';
          continue;
        }
        report[mechKey] = base.mechanics[mechKey] + ' should be low';
        questionable += 1;
        continue;
      }
      if (standards[mechKey] === 'cool') {
        report[mechKey] = 'cool';
        continue;
      }
      if (base.mechanics[mechKey] <= standards[mechKey]) {
        report[mechKey] = 'good';
      } else {
        report[mechKey] = 'bad';
        bad += 1;
      }
    }
    if (bad === 0) {
      if (questionable === 0) {
        report.overall = 'pass';
      } else {
        report.overall = 'maybe, check that "low" mechanics are actually low';
      }
    } else {
      report.overall = `failed ${bad} mechanic`;
      if (bad > 1) {
        report.overall += 's';
      }
    }

    base.raReport = report;
    return base;
  });
  return allPlayerStats;
}

async function processDir(dir) {
  const benches = [];
  const logPaths = LogManager.gatherLogPaths(dir);

  for (let i = 0; i < logPaths.length; i++) {
    const logPath = logPaths[i];
    console.log(Math.floor(i / logPaths.length * 1000) / 10, logPath);
    const log = await LogManager.processLog(logPath);
    if (!log) {
      continue;
    }

    const allPlayerStats = getPlayerStats(log);
    console.log(allPlayerStats);
    for (let player of allPlayerStats) {
      if (player.account === 'zaraktheblighter.7023') {
        benches.push(Object.assign({path: logPath}, player));
      }
    }
  }
  benches.sort((a, b) => {
    return a.targetDps - b.targetDps;
  });
  for (let bench of benches) {
    if (bench.boss.includes('Golem')) {
      continue;
    }
    console.log(bench);
  }
}

processDir(`/Users/jhobin/orange/gw2/arcdps.cbtlogs`);
