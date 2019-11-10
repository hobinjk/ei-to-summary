const argv = require('yargs').argv;

const raLogStandards = require('./raLogStandards');
const mechanics = require('./mechanics');
const playerStats = require('./playerStats');
const LogManager = require('./LogManager');

const showBenchStats = argv.showBenchStats;
const showMechanicsStats = argv.showMechanicsStats;
const showCapabilities = argv.showCapabilities;
const accountName = argv.accountName;
const firstNumber = argv.firstNumber;
const logsDir = argv.path;

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

  let passStats = {
    all: {
      account: 'all',
      total: 0,
      passes: 0,
    },
  };

  let capabilities = {};

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
      if (accountName && player.account !== accountName) {
        continue;
      }

      if (player.raReport) {
        passStats.all.total += 1;
        if (!passStats[player.account]) {
          passStats[player.account] = {
            account: player.account,
            passes: 0,
            total: 0,
          };
        }

        passStats[player.account].total += 1;
        if (player.raReport.overall === 'pass') {
          passStats[player.account].passes += 1;
          passStats.all.passes += 1;
        }
      }

      benches.push(Object.assign({path: logPath}, player));

      if (!log.fightName.includes('Golem')) {
        if (!capabilities[player.account]) {
          capabilities[player.account] = {};
        }
        if (!capabilities[player.account][player.spec]) {
          capabilities[player.account][player.spec] = 0;
        }
        capabilities[player.account][player.spec] += 1;
      }
    }
  }
  if (showBenchStats) {
    benches.sort((a, b) => {
      if (firstNumber) {
        return a.firstNumber - b.firstNumber;
      }
      return a.targetDps - b.targetDps;
    });
    for (let bench of benches) {
      console.log(bench);
    }
  }
  if (showMechanicsStats) {
    passStats = Object.values(passStats);
    passStats.sort((b, a) => {
      return a.passes / a.total - b.passes / b.total;
    });
    console.log(passStats);
  }
  if (showCapabilities) {
    console.log(capabilities);
    const sortedAccounts = Object.keys(capabilities).sort();
    for (const account of sortedAccounts) {
      let specs = capabilities[account];
      let sortedSpecs = Object.keys(specs).sort((a, b) => {
        let aParts = a.split(' ');
        let bParts = b.split(' ');
        let aProf = aParts[aParts.length - 1];
        let bProf = bParts[bParts.length - 1];
        if (aProf === bProf) {
          return a.localeCompare(b);
        }
        return aProf.localeCompare(bProf);
      });
      let specStrs = [];
      for (let spec of sortedSpecs) {
        specStrs.push(`${spec} ${specs[spec]}`);
      }
      console.log(`${account}: ${specStrs.join(', ')}`);
    }
  }
}

processDir(logsDir);
