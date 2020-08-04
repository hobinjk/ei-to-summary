const targetDps = {};
const allDps = {};


function addLog(logPath, fightName, allPlayerStats) {
  if (!targetDps[fightName]) {
    targetDps[fightName] = {};
  }
  if (!allDps[fightName]) {
    allDps[fightName] = {};
  }

  for (let player of allPlayerStats) {
    if (!targetDps[fightName][player.spec]) {
      targetDps[fightName][player.spec] = [];
    }
    if (!allDps[fightName][player.spec]) {
      allDps[fightName][player.spec] = [];
    }
    targetDps[fightName][player.spec].push({
      dps: player.targetDps,
      account: player.account,
      logPath,
    });
    allDps[fightName][player.spec].push({
      dps: player.allDps,
      account: player.account,
      logPath,
    });
  }
}

let finalized = false;
function finalize() {
  finalized = true;
  let summary = {};
  for (let fightName in targetDps) {
    summary[fightName] = {all: {min: {dps: 99999}, max: {dps: 0}}};
    for (let spec in targetDps[fightName]) {
      targetDps[fightName][spec].sort((a, b) => a.dps - b.dps);
      allDps[fightName][spec].sort((a, b) => a.dps - b.dps);
      let ds = targetDps[fightName][spec];
      summary[fightName][spec] = {
        min: ds[0],
        max: ds[ds.length - 1],
      };
      if (ds[0].dps < summary[fightName].all.min.dps) {
        summary[fightName].all.min = ds[0];
      }
      if (ds[ds.length - 1].dps > summary[fightName].all.max.dps) {
        summary[fightName].all.max = ds[ds.length - 1];
      }
    }
  }
  console.log('fun info', JSON.stringify(summary, null, 2));
  // console.log('funner info',
  //             summary['Mursaat Overseer']);
}

function binarySearch(list, val) {
  // Thanks Wikipedia
  let l = 0;
  let r = list.length - 1;
  while (l <= r) {
    let m = Math.floor((l + r) / 2);
    if (list[m].dps < val) {
      l = m + 1;
    } else if (list[m].dps > val) {
      r = m - 1;
    } else {
      return m;
    }
  }
  return Math.floor((l + r) / 2);
}

function percentile(list, val) {
  let i = binarySearch(list, val);
  return i / list.length * 100;
}

function getPercentiles(log, player) {
  if (!finalized) {
    finalize();
  }

  const tds = targetDps[log.fightName][player.spec];
  const ads = targetDps[log.fightName][player.spec];
  return {
    targetDps: percentile(tds, player.targetDps),
    allDps: percentile(ads, player.targetDps),
  };
}

module.exports = {
  addLog,
  getPercentiles,
  finalize,
};
