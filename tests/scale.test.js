import { describe, expect, it } from 'vitest';
import { CONS_BY } from '../src/core/data/world.js';
import { heroStats } from '../src/core/combat.js';
import { makeApprentice, newGame } from '../src/core/people.js';
import { power, recomputeCB } from '../src/core/rules.js';
import { RANK_COEF, coefOf, gainStat, migrateScale, norm } from '../src/core/scale.js';
import { promoteApprentice } from '../src/core/trial.js';
import { S, setS } from '../src/core/state.js';

const avg = p => ['fo', 'vi', 'de', 'en', 'ps', 'co'].reduce((t, k) => t + p.st[k], 0) / 6;

describe('échelle des statistiques par rang', () => {
  it('chaque rang écrase le précédent', () => {
    setS(null); newGame('facile'); recomputeCB();
    const m = r => S.knights.filter(k => k.rank === r).reduce((t, k) => t + avg(k), 0) / S.knights.filter(k => k.rank === r).length;
    const ap = S.pending.reduce((t, a) => t + avg(a), 0) / S.pending.length;
    expect(m('bronze') / ap).toBeGreaterThan(2);
    expect(m('argent') / m('bronze')).toBeGreaterThan(4);
    expect(m('or') / m('argent')).toBeGreaterThan(4);
    expect(m('or')).toBeGreaterThan(5000);
  });
  it('un point gagné vaut le coefficient du rang', () => {
    setS(null); newGame('moyen');
    const g = S.knights.find(k => k.rank === 'or'), before = g.st.fo;
    gainStat(g, 'fo', 1);
    expect(g.st.fo - before).toBe(RANK_COEF.or);
  });
  it('un apprenti qui devient bronze voit ses statistiques multipliées par 3 à 10', () => {
    setS(null); newGame('moyen');
    const a = makeApprentice(); S.aps.push(a); const before = { ...a.st };
    promoteApprentice(a, CONS_BY.pegase, []);
    const k = S.knights.find(x => x.id === a.id);
    for (const s in before) { const m = k.st[s] / before[s]; expect(m).toBeGreaterThanOrEqual(2.5); expect(m).toBeLessThanOrEqual(10.5); }
    expect(coefOf(k)).toBe(RANK_COEF.bronze);
  });
  it('à rang égal, le combat ne change pas d’échelle ; d’un rang à l’autre, l’écart est immense', () => {
    setS(null); newGame('facile');
    const b = S.knights.find(k => k.rank === 'bronze'), g = S.knights.find(k => k.rank === 'or');
    expect(heroStats(g).atk / heroStats(b).atk).toBeGreaterThan(50);
    expect(power(g, 'or') / power(b, 'bronze')).toBeGreaterThan(50);
    expect(norm(g, 'co')).toBeLessThan(200);
  });
  it('les anciennes parties sont converties une seule fois', () => {
    setS(null); newGame('moyen');
    S.scaleV = 0; const g = S.knights.find(k => k.rank === 'or'); g.st = { fo: 60, vi: 60, de: 60, en: 60, ps: 60, co: 60 };
    migrateScale(); const once = g.st.fo; migrateScale();
    expect(once).toBeGreaterThan(2000);
    expect(g.st.fo).toBe(once);
  });
});
