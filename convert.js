const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const mechanics = require('./mechanics');

function durationS(log) {
  return (log.phases[0].end - log.phases[0].start) / 1000;
}

function downCount(player) {
  return player.defenses
    .map(defense => defense.downCount)
    .reduce((a, b) => a + b, 0);
}

function target800kStats(player) {
  let goal = 800000;
  let dps = player.targetDamage1S[0][0];
  for (let i = 0; i < dps.length; i++) {
    if (dps[i] > goal) {
      if (i === 0) {
        return {
          dps: dps[0],
          time: 0,
        };
      }
      let m = dps[i] - dps[i - 1];
      let x0 = i - 1;
      let y0 = dps[i - 1];
      let extrapolatedTime = x0 + (goal - y0) / m;
      return {
        dps: goal / extrapolatedTime,
        time: extrapolatedTime,
      };
    }
  }
}

function targetDps(log, player) {
  let dps = player.targetDamage1S[0][0];
  return dps[dps.length - 1] / durationS(log);
}

function allDps(log, player) {
  let dps = player.damage1S[0];
  return dps[dps.length - 1] / durationS(log);
}

function squadBuffGeneration(player, buffId) {
  if (!player.squadBuffs) {
    return 0;
  }
  let data = player.squadBuffs.filter(d => d.id === buffId);
  if (data.length === 0) {
    return 0;
  }
  return data[0].buffData[0].generation;
}

function quickness(player) {
  return squadBuffGeneration(player, 1187);
}

function alacrity(player) {
  return squadBuffGeneration(player, 30328);
}

function generateJson(logPath) {
  return new Promise((res, rej) => {
    exec(`wine /Users/jhobin/Downloads/GW2EI/GuildWars2EliteInsights.exe -c /Users/jhobin/orange/gw2/gw2-ei-cool.conf "${logPath}"`, (err, stdout, _stderr) => {
      if (err) {
        rej(err);
        return;
      }
      let output = /Complete_([a-zA-Z]+)_/.exec(stdout);
      if (output) {
        res(output[1]);
      } else {
        res();
      }
    });
  });
}

const _keyToTitle = {
  name: 'Name',
  spec: 'Spec',
  downs: 'Downs',
  targetDps: 'Target DPS',
  allDps: 'All DPS',
  quickness: 'Quickness Generation (Squad)',
  alacrity: 'Alacrity Generation (Squad)',
  slammed: 'Slammed',
  egged: 'Egged',
};

function playerStats(log, player) {
  let base = {
    account: player.account,
    name: player.name,
    spec: player.profession,
    downs: downCount(player),
    targetDps: targetDps(log, player),
    allDps: allDps(log, player),
  };

  let quickAlacSupport = {
    quickness: quickness(player),
    alacrity: alacrity(player),
  };
  if (quickAlacSupport.quickness > 0 || quickAlacSupport.alacrity > 0) {
    Object.assign(base, quickAlacSupport);
  }

  if (mechanics.hasOwnProperty(log.fightName)) {
    base.mechanics = mechanics[log.fightName](log, player);
  }

  if (log.fightName.includes('Golem')) {
    let golemNonsense = {};
    let t800kStats = target800kStats(player);
    if (t800kStats) {
      golemNonsense.firstNumber = t800kStats.dps;
      golemNonsense.firstNumberTime = t800kStats.time;
    }
    Object.assign(base, golemNonsense);
  }
  return base;
}

async function processLog(rawLogPath) {
  let boss = 'StdGolem';
  let slug = path.basename(rawLogPath).split('.')[0];
  let killJsonPath = path.join(path.dirname(rawLogPath), `${slug}_${boss}_kill.json`);
  let failJsonPath = path.join(path.dirname(rawLogPath), `${slug}_${boss}_fail.json`);
  if (!fs.existsSync(killJsonPath) && !fs.existsSync(failJsonPath)) {
    let genBoss = await generateJson(rawLogPath);
    console.log('genBoss', genBoss);
  }
  if (fs.existsSync(killJsonPath)) {
    try {
      let log = JSON.parse(fs.readFileSync(killJsonPath));
      return log.players.map((player) => {
        return playerStats(log, player);
      });
    } catch (e) {
      console.log('weell that was not very nice my little sapling', e);
    }
  }
}

async function processDir(dir) {
  const logPaths = fs.readdirSync(dir);
  const benches = [];
  for (let logPath of logPaths) {
    if (!logPath.endsWith('.zevtc') && !logPath.endsWith('.evtc') &&
        !logPath.endsWith('.evtc.zip')) {
      continue;
    }
    console.log(logPath);
    let allPlayerStats = await processLog(path.join(dir, logPath));
    allPlayerStats = allPlayerStats || [];
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
    console.log(bench);
  }
}

processDir(`/Users/jhobin/orange/gw2/arcdps.cbtlogs/Standard Kitty Golem`);
