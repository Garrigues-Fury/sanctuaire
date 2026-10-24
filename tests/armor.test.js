// Affinités avec les armures, épreuves et promotions.
import { beforeEach, describe, expect, it } from 'vitest';
import { AFF_MIN, armorAffinity, bestArmors, profileOf } from '../src/core/armor.js';
import { CONS_BY } from '../src/core/data/world.js';
import { newGame } from '../src/core/people.js';
import { recomputeCB, trialEval } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); });
const ap = (o) => Object.assign({ id: 9001, name: 'Test', sex: 'F', sign: 0, lv: 10, pot: 50, awk: true, qual: [], flaw: [], st: { fo: 10, vi: 10, de: 10, en: 10, ps: 10, co: 10 } }, o);

describe('affinité avec une armure', () => {
  it('chaque armure a deux qualités maîtresses', () => {
    expect(profileOf(CONS_BY.pegase)).toEqual(['vi', 'co']);
    expect(profileOf(CONS_BY['or-1'])).toHaveLength(2);
  });
  it('l’élément, les compétences travaillées et le maître comptent', () => {
    const a = ap({ sign: 1 }); // Taureau : terre
    const girafe = CONS_BY.girafe, pegase = CONS_BY.pegase; // terre (en, vi) / air (vi, co)
    const base = armorAffinity(a, girafe).v;
    expect(base).toBeGreaterThan(armorAffinity(a, pegase).v);
    a.st.en = 25; a.st.vi = 25;
    expect(armorAffinity(a, girafe).v).toBeGreaterThan(base);
    const k = S.knights.find(x => CONS_BY[x.cons].el === 'terre') || S.knights[0];
    const before = armorAffinity(a, girafe).v;
    a.master = k.id;
    expect(armorAffinity(a, girafe).v).toBeGreaterThanOrEqual(before);
  });
  it('sans affinité, l’armure reste muette', () => {
    const a = ap({ sign: 3, st: { fo: 20, vi: 3, de: 3, en: 3, ps: 20, co: 20 } }); // Cancer : eau
    S.armors.compas = 'restauree'; // terre, dextérité et psychokinésie
    const e = trialEval(a, CONS_BY.compas);
    expect(armorAffinity(a, CONS_BY.compas).v).toBeLessThan(AFF_MIN.bronze);
    expect(e.ok).toBe(false);
    expect(e.why).toMatch(/muette/);
  });
  it('les armures pressenties suivent le profil du personnage', () => {
    const a = ap({ sign: 0, st: { fo: 3, vi: 30, de: 30, en: 3, ps: 3, co: 3 } });
    const best = bestArmors(a, 3, 'bronze');
    best.forEach(({ c }) => expect(profileOf(c).some(k => k === 'vi' || k === 'de')).toBe(true));
  });
});

describe('promotion', () => {
  it('un chevalier de bronze très doué peut tenter une armure d’argent, pas d’or', () => {
    const k = S.knights.find(x => x.rank === 'bronze');
    k.lv = 20; k.pot = 80;
    const sil = Object.values(CONS_BY).find(c => c.rank === 'argent' && armorAffinity(k, c).v >= AFF_MIN.argent) || CONS_BY.lyre;
    S.armors[sil.k] = 'restauree';
    const e = trialEval(k, sil);
    if (armorAffinity(k, sil).v >= AFF_MIN.argent) expect(e.ok).toBe(true);
    const gold = CONS_BY['or-' + k.sign]; S.armors[gold.k] = 'restauree';
    expect(trialEval(k, gold).ok).toBe(false);
    k.pot = 50;
    expect(trialEval(k, sil).ok).toBe(false);
  });
});
