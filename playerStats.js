function durationS(log) {
  return (log.phases[0].end - log.phases[0].start) / 1000;
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

const tankBosses = [
  'Vale Guardian',
  'Gorseval the Multifarious',
  'Keep Construct',
  'Xera',
  // 'Mursaat Overseer' ...it's different
  // Samarog ...it's also different
  'Deimos',
  'Soulless Horror', // it's technically different but no
  'Dhuum',
  'Twin Largos',
  'Qadim', // very different but no
  'Cardinal Adina',
  'Cardinal Sabir',
  'Qadim the Peerless', // different but no
];

function guessSpec(log, player) {
  let isHeal = player.healing > 4;
  let isTank = false;

  if (tankBosses.includes(log.fightName)) {
    let isMax = true;
    let allowedOtherTanks = log.fightName === 'Soulless Horror' ? 1 : 0;
	  for (let otherPlayer of log.players) {
	    if (otherPlayer === player) {
		    continue;
	    }
      if (otherPlayer.toughness > player.toughness) {
        allowedOtherTanks -= 1;
        if (allowedOtherTanks < 0) {
          isMax = false;
          break;
        }
      }
    }
    if (isMax) {
      isTank =  true;
    }
  }

  let isBoon = quickness(player) > 10 || alacrity(player) > 10;
  let dpsAll = player.dpsAll[0];
  let isPower = dpsAll.condiDps <= dpsAll.powerDps;
  let spec = player.profession;
  let dType = isPower ? 'Power' : 'Condition';

  if (isTank) {
    return `Tank ${spec}`;
  }
  if (isHeal) {
    return `Heal ${spec}`;
  }
  if (isBoon) {
    return `${dType} Boon ${spec}`;
  }
  return `${dType} ${spec}`;
}

function targetDps(log, player) {
  let dps = player.targetDamage1S[0][0];
  return dps[dps.length - 1] / durationS(log);
}

function allDps(log, player) {
  let dps = player.damage1S[0];
  return dps[dps.length - 1] / durationS(log);
}

function targetConditionStacks(log, player, conditionId) {
  let targetBuffs = log.targets[0].buffs;
  let condData = targetBuffs.filter(buffData => {
    return buffData.id === conditionId;
  })[0];

  if (!condData) {
    return 0;
  }
  return condData.buffData[0].generated[player.name];
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

module.exports = function playerStats(log, player) {
  let base = {
    account: player.account,
    name: player.name,
    prof: player.profession,
    spec: guessSpec(log, player),
    boss: log.fightName,
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
  const condis = {
    bleeding: 736,
    burning: 737,
    confusion: 861,
    poison: 723,
    torment: 19426,
  };
  for (const condi in condis) {
    const id = condis[condi];
    const stacks = targetConditionStacks(log, player, id);
    if (stacks > 1) {
      base[condi] = stacks;
    }
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
};
