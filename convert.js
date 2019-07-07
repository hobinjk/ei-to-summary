const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

function durationS(log) {
  return (log.phases[0].end - log.phases[0].start) / 1000;
}

function downCount(player) {
  return player.defenses
    .map(defense => defense.downCount)
    .reduce((a, b) => a + b, 0);
}

function mechanic(log, player, skillName) {
  const mechanic = log.mechanics.filter(m => m.name === skillName);
  if (mechanic.length === 0) {
    return 0;
  }
  return mechanic[0].mechanicsData.filter(d => d.actor === player.name).length;
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

// let spec = player.profession;
// let name = player.name;
// let targetDps = player.targetDamage1S[0][0].last() / length;
// let allDps = player.allDamage1S[0][0].last() / length;
// let quickness = player.squadBuffs where id==1187.buffData[0].generation;
// let alacrity = player.squadBuffs where id==30328.buffData[0].generation;

function generateJson(logPath) {
  return new Promise((res, rej) => {
    exec(`wine /Users/jhobin/Downloads/GW2EI/GuildWars2EliteInsights.exe -c /Users/jhobin/orange/gw2/gw2-ei-cool.conf "${logPath}"`, (err, stdout, _stderr) => {
      if (err) {
        rej(err);
        return;
      }
      console.log('stdo', stdout);
      res();
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
  return {
    name: player.name,
    spec: player.profession,
    downs: downCount(player),
    targetDps: targetDps(log, player),
    allDps: allDps(log, player),
    quickness: quickness(player),
    alacrity: alacrity(player),
    slammed: mechanic(log, player, 'Specral Impact'),
    egged: mechanic(log, player, 'Ghastly Prison'),
  };
}

async function processLog(rawLogPath) {
  let slug = path.basename(rawLogPath).split('.')[0];
  console.log('slug', slug);
  let killJsonPath = path.join(path.dirname(rawLogPath), `${slug}_vg_kill.json`);
  if (!fs.existsSync(killJsonPath)) {
    await generateJson(rawLogPath);
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
  } else {
    console.log('you are bad lol', killJsonPath);
  }
}

async function processDir(dir) {
  const paths = fs.readdirSync(dir);
  const benches = [];
  for (let path of paths) {
    if (!path.endsWith('.zevtc') && !path.endsWith('.evtc') &&
        !path.endsWith('.evtc.zip')) {
      continue;
    }
    console.log(path);
    let allPlayerStats = await processLog(path);
    if (allPlayerStats.length === 1) {
      benches.push(Object.assign({path}, allPlayerStats[0]));
    }
  }
  benches.sort((a, b) => {
    return a.targetDps - b.targetDps;
  });
  console.log(benches);
}

// processLog(`/Users/jhobin/orange/gw2/arcdps.cbtlogs/Vale Guardian/20190625-221317.zevtc`);
processDir(`/Users/jhobin/orange/gw2/arcdps.cbtlogs/Standard Kitty Golem`);
