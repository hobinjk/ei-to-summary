const standards = {
  'Vale Guardian': {
    teleport: 1,
  },
  'Gorseval the Multifarious': {
    slammed: 2,
    egged: 0,
    tainted: 0,
  },
  'Sabetha the Saboteur': {
    flak: 'low',
    kardeFlame: 'low',
    launched: 'cool',
  },
  Slothasor: {
    tantrum: 2,
    halitosis: 'low',
    slubbed: 'cool',
  },
  'Matthias Gabrel': {
    shootShard: 1,
    jumpShard: 'low',
    tornado: 'low',
    storm: 'low',
    spirit: 'low',
  },
  'Keep Construct': {
    badOrb: 2,
  },
  Xera: {
    orb: 2,
    orbField: 'low',
  },
  Cairn: {
    teleport: 2,
    leap: 1,
    sweep: 1,
    donut: 1,
  },
  'Mursaat Overseer': {
    jadeExplosion: 'low',
  },
  Samarog: {
    hit: 4,
    green: 1,
  },
  Deimos: {
    slammed: 2,
    oil: 1,
  },
  'Soulless Horror': {
    donut: 2,
    golemField: 'low',
    scythe: 'low',
    slices: 'low',
  },
  Dhuum: {
    messenger: 1,
    fissured: 1,
    sucked: 0,
    deathMarked: 0,
  },
  'Conjured Amalgamate': {
    pulverize: 1,
  },
  'Twin Largos': {
    waterlogged: 'low',
    vaporRush: 6, // 3,
    geyser: 1,
    bubble: 3, // 1,
    shockwave: 4, // 2,
  },
  Qadim: {
    fieryDance: 'low',
    shockwave: 2,
    hitbox: 1,
  },
  'Cardinal Adina': {
    blindness: 1,
    triangle: 0,
    boulder: 1,
    mines: 0,
  },
  'Cardinal Sabir': {
    shockwave: 1,
    pushed: 1,
    arena: 1,
  },
  'Qadim the Peerless': {
    pushed: 2,
    purpleBar: 'low',
    shark: 3,
    magma: 1,
    rush: 0,
    arrow: 1,
    lightning: 'low',
    smallLightning: 3,
  },
  'Qadim the Peerless CM': {
    pushed: 2,
    purpleBar: 'low',
    shark: 3,
    magma: 1,
    rush: 0,
    arrow: 1,
    lightning: 'low',
    smallLightning: 3,
  },

};

for (let key in standards) {
  standards[key].dead = 0;
  standards[key].downed = 2;
}

module.exports = standards;
