const DamageType = {
  POWER: 0,
  CONDI: 1,
  SPLIT: 2,
  MIRAGE: 3,
  ANY: 4,
};

const wing1 = {
  'Vale Guardian': {
    tank: 1,
    heal: 1,
    damageType: DamageType.SPLIT,
  },
  'Spirit Run': {
    tank: 0,
    heal: 0,
    damageType: DamageType.POWER,
  },
  'Gorseval the Multifarious': {
    tank: 1,
    heal: 1,
    damageType: DamageType.POWER,
  },
  'Clear out the bandits': {
    event: true,
    tank: 0,
    heal: 0,
    damageType: DamageType.ANY,
  },
  'Sabetha the Saboteur': {
    heal: 1,
    damageType: DamageType.ANY,
  },
};

const wing2 = {
  Slothasor: {
    heal: 2,
    damageType: DamageType.POWER,
  },
  'Bandit Trio': {
    heal: 1,
    damageType: DamageType.ANY,
  },
  'Clear out the ruins': {
    event: true,
    tank: 0,
    heal: 0,
    damageType: DamageType.ANY,
  },
  'Matthias Gabrel': {
    boonThief: true,
    heal: 1,
    damageType: DamageType.CONDI,
  },
};

const wing3 = {
  Escort: {
    portal: 2,
    heal: 0,
    damageType: DamageType.ANY,
  },
  'Keep Construct': {
    tank: 1,
    heal: 1,
    damageType: DamageType.POWER,
  },
  'Twisted Castle': {
    portal: 1,
    heal: 1,
    damageType: DamageType.ANY,
  },
  Xera: {
    tank: 1,
    heal: 1,
    damageType: DamageType.POWER,
  },
};

const wing4 = {
  Cairn: {
    heal: 1,
    damageType: DamageType.CONDI,
  },
  'Break into the recreation room': {
    event: true,
  },
  'Mursaat Overseer': {
    heal: 1,
    damageType: DamageType.ANY,
  },
  Samarog: {
    // tank: 2, not reaaallly
    heal: 1,
    damageType: DamageType.POWER,
  },
  Deimos: {
    tank: 1,
    heal: 1,
    damageType: DamageType.POWER,
  },
};

const wing5 = {
  'Soulless Horror': {
    tank: 2,
    heal: 2,
    damageType: DamageType.MIRAGE,
  },
  River: {
    heal: 2,
    damageType: DamageType.ANY,
  },
  Statues: {
    tank: 1,
    heal: 1,
    damageType: DamageType.ANY,
  },
  Dhuum: {
    tank: 1,
    heal: 2,
    damageType: DamageType.CONDI,
  },
};

const wing6 = {
  'Conjured Amalgamate': {
    heal: 1,
    damageType: DamageType.POWER,
  },
  'Sorting and Appraisal': {
    event: true,
    heal: 1,
    damageType: DamageType.ANY,
  },
  'Twin Largos': {
    tank: 2,
    heal: 2,
    damageType: DamageType.MIRAGE,
  },
  Pyres: {
    event: true,
    heal: 1,
    damageType: DamageType.ANY,
  },
  Qadim: {
    tank: 1,
    heal: 1,
    kite: 1,
    damageType: DamageType.POWER,
  },
};

const wing7 = {
  Gate: {
    event: true,
    heal: 2,
    damageType: DamageType.ANY,
  },
  Roleplay: {
    event: true,
  },
  'Cardinal Adina': {
    boonThief: true,
    tank: 1,
    heal: 1,
    damageType: DamageType.POWER,
  },
  'Cardinal Sabir': {
    tank: 1,
    heal: 1,
    damageType: DamageType.MIRAGE,
  },
  'Roleplay Round Two': {
    event: true,
  },
  'Qadim the Peerless': {
    tank: 1,
    heal: 2,
    damageType: DamageType.CONDI,
    kite: 3,
  },
};

function specBoonCapabilities(bossName, spec) {
  if (/(Boon|Tank|Heal) Chronomancer/.test(spec)) {
    return {
      quickness: 5,
      alacrity: 5,
    };
  }
  if (/(Heal|Boon) Firebrand/.test(spec)) {
    return {
      quickness: 5,
    };
  }
  if (/(Heal|Boon) Renegade/.test(spec)) {
    return {
      alacrity: 10,
    };
  }
  if (allBosses[bossName].boonThief) {
    if (/(Tank|Boon|Heal) (Thief|Daredevil)/.test(spec)) {
      return {
        quickness: 10,
      };
    }
  }
  if (spec.includes('Renegade')) {
    return {
      alacrity: 5,
    };
  }
}

function specCapabilities(bossName, spec) {
  const boons = specBoonCapabilities(bossName, spec);
  const heal = +spec.includes('Heal');
  const tank = +spec.includes('Tank');
  let kite = +(spec === 'Power Deadeye');
  if (bossName === 'Qadim the Peerless') {
    if (/(Heal|Condition) Scourge/.test(spec)) {
      kite += 1;
    }
    if (spec === 'Heal Tempest') {
      kite += 1;
    }
  }
  const power = +spec.includes('Power');
  const condi = +spec.includes('Condition');

  return Object.assign({
    kite,
    heal,
    tank,
    power,
    condi,
  }, boons);
}

let allBosses = Object.assign(
  {},
  wing1,
  wing2,
  wing3,
  wing4,
  wing5,
  wing6,
  wing7,
);

function isValidCompForBoss(bossName, specs) {
  let boss = allBosses[bossName];
  if (!boss) {
    return {
      valid: true,
    };
  }

  let requirements = Object.assign({
    quickness: 10,
    alacrity: 10,
  }, boss);

  let capabilities = {};
  for (let spec of specs) {
    let capas = specCapabilities(bossName, spec);
    for (let capaKey in capas) {
      if (capabilities.hasOwnProperty(capaKey)) {
        capabilities[capaKey] += capas[capaKey];
      } else {
        capabilities[capaKey] = capas[capaKey];
      }
    }
  }

  if (requirements.hasOwnProperty('damageType')) {
    switch (requirements.damageType) {
      case DamageType.POWER:
        if (capabilities.power < 4) {
          return {
            valid: false,
            reason: 'missing power damage',
          };
        }
        break;
      case DamageType.CONDI:
      case DamageType.MIRAGE:
        if (capabilities.condi < 4) {
          return {
            valid: false,
            reason: 'missing condi damage',
          };
        }
        break;
      case DamageType.SPLIT:
        if (capabilities.condi < 2 || capabilities.power < 2) {
          return {
            valid: false,
            reason: 'missing split damage types',
          };
        }
        break;
      case DamageType.ANY:
      default:
        break;
    }
    delete requirements.damageType;
  }

  for (let req in requirements) {
    if (!capabilities.hasOwnProperty(req)) {
      return {
        valid: false,
        reason: `missing ${req}`,
      };
    }
    if (capabilities[req] < requirements[req]) {
      return {
        valid: false,
        reason: `insufficient ${req}`,
      };
    }
  }
  return {
    valid: true,
  };
}

module.exports = {
  isValidCompForBoss,
};

