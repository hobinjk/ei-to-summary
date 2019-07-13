function mechanicCount(log, player, skillName) {
  if (!log.mechanics) {
    return 0;
  }
  const mechanic = log.mechanics.filter(m => m.name === skillName);
  if (mechanic.length === 0) {
    return 0;
  }
  return mechanic[0].mechanicsData.filter(d => d.actor === player.name).length;
}

function simpleMechanics(mechanics) {
  mechanics = Object.assign({dead: 'Dead', downed: 'Downed'}, mechanics);
  return function(log, player) {
    const countById = {};
    for (const id in mechanics) {
      countById[id] = mechanicCount(log, player, mechanics[id]);
    }
    return countById;
  };
}

const kcBaseline = simpleMechanics({
  badRedOrb: 'Bad Red Orb',
  badWhiteOrb: 'Bad White Orb',
});

function keepConstruct(log, player) {
  const base = kcBaseline(log, player);
  return {
    badOrb: base.badRedOrb + base.badWhiteOrb,
  };
}

const xeraBaseline = simpleMechanics({
  teleport: 'Teleport Out',
});

function xera(log, player) {
  let playerI = 0;
  const countById = Object.assign({
    orb: 0,
    orbField: 0,
  }, xeraBaseline(log, player));

  const orbs = log.mechanics.filter(m => m.name === 'Temporal Shred');
  if (orbs.length === 0) {
    return countById;
  }

  let checkingOrbHits = true;
  for (let i = 0; i < orbs.length; i++) {
    if (checkingOrbHits) {
      let playerName = log.players[playerI].name;
      if (playerName === orbs[i].actor) {
        if (playerName === player.name) {
          countById.orb += 1;
        }
        continue;
      }
      playerI += 1;
      if (playerI >= log.players.length) {
        // We've checked all players for orb hits, anything left is fields
        checkingOrbHits = false;
      }
    } else if (player.name === orbs[i].actor) {
      countById.orbField += 1;
    }
  }
  return countById;
}

const samarogBaseline = simpleMechanics({
  shockwave: 'Shockwave',
  sweep: 'Prisoner Sweep',
  trample: 'Trampling Rush',
  slam: 'Bludgeon',
  greenFail: 'Inevitable Betrayal',
});

function samarog(log, player) {
  const base = samarogBaseline(log, player);
  return {
    hit: base.shockwave + base.sweep + base.trample + base.slam,
    greenFail: base.greenFail,
  };
}

module.exports = {
  'Vale Guardian': simpleMechanics({
    teleport: 'Unstable Magic Spike',
  }),
  'Gorseval the Multifarious': simpleMechanics({
    slammed: 'Specral Impact',
    egged: 'Ghastly Prison',
    tainted: 'Spectral Darkness',
  }),
  'Sabetha the Saboteur': simpleMechanics({
    flak: 'Flak Shot',
    kardeFlame: 'Flame Blast',
    launched: 'Shell-Shocked',
  }),
  Slothasor: simpleMechanics({
    tantrum: 'Tantrum',
    slubbed: 'Magic Transformation',
  }),
  'Matthias Gabrel': simpleMechanics({
    shootShard: 'Blood Shards',
    jumpShard: 'Shards of Rage',
    tornado: 'Fiery Vortex',
    storm: 'Thunder',
    spirit: 'Surrender',
  }),
  'Keep Construct': keepConstruct,
  Xera: xera,
  Cairn: simpleMechanics({
    teleport: 'Displacement',
    leap: 'Energy Surge',
    sweep: 'Orbital Sweep',
    donut: 'Gravity Wave',
  }),
  'Mursaat Overseer': simpleMechanics({
    jadeExplosion: 'Jade Explosion',
  }),
  Samarog: samarog,
  Deimos: simpleMechanics({
    slammed: 'Annihilate',
    oil: 'Rapid Decay',
  }),
};
