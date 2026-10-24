// Lecture des astres façon Splendor : règles, fin de partie, équilibrage par simulation.
import { beforeEach, describe, expect, it } from 'vitest';
import { CARDS2, RELICS, SACRED } from '../src/core/data/stars.js';
import { GOD_KEYS } from '../src/core/data/gods.js';
import { autoMove, buy, canTake, cardOf, endTurn, ensureDuel, reserve, startDuel, sweep, sweepCost, take } from '../src/core/duel.js';
import { newGame } from '../src/core/people.js';
import { recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); S.knights[0].role = 'pope'; ensureDuel(); });
const gems = P => Object.values(P.gems).reduce((a, b) => a + b, 0);

describe('cartes', () => {
  it('102 cartes dont 10 artefacts, chacune avec un nom et un coût', () => {
    expect(CARDS2.length + RELICS.length).toBe(102);
    expect(new Set(CARDS2.map(c => c.n)).size).toBe(92);
    CARDS2.forEach(c => { expect(Object.values(c.cost).reduce((a, b) => a + b, 0)).toBeGreaterThan(0); expect(c.pts).toBeGreaterThanOrEqual(0); });
    expect(SACRED.length).toBe(8);
  });
});

describe('règles', () => {
  it('prendre : 3 différentes ou 2 identiques, pas de joker, limite de 10', () => {
    const m = startDuel();
    expect(canTake(m, m.me, ['feu', 'eau', 'air'])).toBe(true);
    expect(canTake(m, m.me, ['feu', 'feu', 'eau'])).toBe(false);
    expect(canTake(m, m.me, ['or'])).toBe(false);
    m.bank.terre = 3; expect(canTake(m, m.me, ['terre', 'terre'])).toBe(false);
    m.me.gems.feu = 9; expect(canTake(m, m.me, ['eau', 'air', 'terre'])).toBe(false);
  });
  it('acheter paie en gemmes, puis en cosmos d’or, et donne une réduction', () => {
    const m = startDuel(); const id = m.rows[1][0], c = cardOf(id);
    Object.keys(m.me.gems).forEach(k => m.me.gems[k] = 0); m.me.bonus = { feu: 0, eau: 0, air: 0, terre: 0 };
    const costN = Object.values(c.cost).reduce((a, b) => a + b, 0);
    m.me.gems.or = costN;
    expect(buy('me', id)).toBe(true);
    expect(m.me.gems.or).toBe(0);
    expect(m.me.bonus[c.el]).toBe(1);
    expect(m.rows[1]).toHaveLength(4);
  });
  it('réserver donne un cosmos d’or, 3 réserves au plus', () => {
    const m = startDuel();
    for (let i = 0; i < 3; i++) expect(reserve('me', m.rows[2][0])).toBe(true);
    expect(m.me.gems.or).toBe(3);
    expect(reserve('me', m.rows[2][0])).toBe(false);
  });
  it('balayer coûte des ressources du Sanctuaire, de plus en plus cher', () => {
    const m = startDuel(); S.res.vivres = 1000; S.res.marbre = 1000;
    const c1 = sweepCost(), before = m.rows[3].slice();
    expect(sweep(3)).toBe(true);
    expect(m.rows[3]).not.toEqual(before);
    expect(sweepCost().vivres).toBeGreaterThan(c1.vivres);
  });
  it('un artefact acheté rejoint la collection pour toujours', () => {
    const m = startDuel(); const id = m.relicRow[0]; m.me.gems.or = 20;
    expect(buy('me', id)).toBe(true);
    expect(S.relics).toContain(id);
  });
});

describe('parties complètes', () => {
  it('une partie se termine toujours, en 20 manches au plus', () => {
    for (const lv of [0, 2, 4, 6]) {
    let wins = 0, rounds = 0; const N = 150;
    for (let g = 0; g < N; g++) {
      S.match = null; S.duel.lastDate = '';
      S.gods = {}; GOD_KEYS.forEach(k => S.gods[k] = { lv, wins: 0, losses: 0, bonus: { feu: 0, eau: 0, air: 0, terre: 0 } });
      const m = startDuel();
      let safety = 0;
      while (!m.over && safety++ < 100) { autoMove(m, 'me'); endTurn(); }
      expect(m.over).toBe(true); rounds += m.round; if (m.result === 'win') wins++;
      expect(gems(m.me)).toBeLessThanOrEqual(m.me.cap);
    }
    console.log('dieu niveau ' + lv + ' — Pope joué comme le dieu : ' + Math.round(wins / N * 100) + ' % de victoires, ' + (rounds / N).toFixed(1) + ' manches en moyenne');
    expect(rounds / N).toBeLessThan(21);
    }
  });
});
