import { describe, expect, it } from 'vitest';
import { CONS_BY } from '../src/core/data/world.js';
import { DIFFS, newGame } from '../src/core/people.js';
import { rates, recomputeCB, villageCap, siteSlots, workersAt } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

describe('difficulté de départ', () => {
  for (const d of Object.keys(DIFFS)) {
    it(d + ' : bons survivants, armures portées, pas de famine', () => {
      setS(null); newGame(d); recomputeCB();
      const D = DIFFS[d], n = r => S.knights.filter(k => k.rank === r).length;
      expect(S.diff).toBe(d);
      expect([n('or'), n('argent'), n('bronze')]).toEqual([D.or, D.argent, D.bronze]);
      // une armure par chevalier, jamais deux fois la même
      expect(new Set(S.knights.map(k => k.cons)).size).toBe(S.knights.length);
      S.knights.forEach(k => expect(S.armors[k.cons]).toBe('portee'));
      // chaque chevalier d'or relève sa maison
      S.knights.filter(k => k.rank === 'or').forEach(k => expect(S.houses[CONS_BY[k.cons].sign]).toBe(1));
      expect(S.workers.length).toBeLessThanOrEqual(villageCap(S.b.artisans));
      expect(workersAt('champs').length).toBeLessThanOrEqual(siteSlots('champs'));
      expect(rates().vivres).toBeGreaterThan(5);
    });
  }
  it('une difficulté inconnue donne Moyen', () => {
    setS(null); newGame('???');
    expect(S.diff).toBe('moyen');
    expect(S.knights.length).toBe(15);
  });
});

describe('duel avec un grand Sanctuaire', () => {
  it('les gemmes de départ ne dépassent jamais la main (10)', async () => {
    const { myStart } = await import('../src/core/duel.js');
    for (let i = 0; i < 30; i++) {
      setS(null); newGame('facile'); recomputeCB();
      expect(Object.values(myStart()).reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(10);
    }
  });
});
