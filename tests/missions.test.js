import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../src/core/data/missions.js';
import { SKILLS } from '../src/core/data/skills.js';
import { ensureDefense, raid } from '../src/core/defense.js';
import { ensureMissions, launchMission, missionChance, spawnMission, tickMissions } from '../src/core/missions.js';
import { newGame } from '../src/core/people.js';
import { advance, recomputeCB } from '../src/core/rules.js';
import { isAway, isKO, wound } from '../src/core/wounds.js';
import { S, setS } from '../src/core/state.js';

describe('missions', () => {
  it('chaque mission ne demande que des compétences qui existent', () => {
    MISSIONS.forEach(m => m.skills.forEach(id => expect(SKILLS[id], m.k + ' : ' + id).toBeTruthy()));
    expect(MISSIONS.length).toBeGreaterThanOrEqual(15);
  });
  it('une équipe part, revient, progresse et se rapproche', () => {
    setS(null); newGame('facile'); recomputeCB();
    const ev = spawnMission('seisme'); const team = S.knights.filter(k => k.rank === 'or').slice(0, 2);
    team.forEach(k => k.nrg = 100);
    expect(missionChance(ev, team).ch).toBeGreaterThan(.6);
    expect(launchMission(ev.id, team.map(k => k.id))).toBe(true);
    expect(isAway(team[0])).toBe(true);
    const lv = team.map(k => k.xp + k.lv * 1e6);
    S.gt += ev.h + .1; tickMissions(null);
    expect(isAway(team[0])).toBe(false);
    expect(ensureMissions().done).toBe(1);
    team.forEach((k, i) => expect(k.xp + k.lv * 1e6).toBeGreaterThan(lv[i]));
  });
  it('un blessé ne peut pas partir', () => {
    setS(null); newGame('moyen'); recomputeCB();
    const ev = spawnMission('incendie'), k = S.knights[0]; k.nrg = 100; wound(k);
    expect(isKO(k)).toBe(true);
    expect(launchMission(ev.id, [k.id])).toBeNull();
  });
});

describe('attaques du Sanctuaire', () => {
  it('un combat loyal en chaîne, avec un rapport, des blessés soignés et un tableau d’honneur', () => {
    setS(null); newGame('moyen'); recomputeCB();
    for (let i = 0; i < 20; i++) { S.gt += 24; const { rep } = raid(); expect(rep.log.length).toBeGreaterThan(0); S.knights.concat(S.guards).forEach(p => { p.ko = 0; }); }
    const D = ensureDefense();
    expect(D.w + D.l).toBe(20);
    // au début, les ennemis sont plus faibles que le bronze : le Sanctuaire repousse la plupart des attaques
    expect(D.w).toBeGreaterThan(12);
    expect(S.knights.some(k => k.rec && k.rec.w > 0)).toBe(true);
  });
  it('une partie avance des semaines sans erreur, attaques et missions comprises', () => {
    setS(null); newGame('dur'); recomputeCB();
    advance(24 * 20, null);
    expect(S.gt).toBeGreaterThan(24 * 19);
  });
});
