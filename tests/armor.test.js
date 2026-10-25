// Affinités avec les armures, épreuves et promotions.
import { beforeEach, describe, expect, it } from 'vitest';
import { AFF_MIN, armorAffinity, bestArmors, profileOf } from '../src/core/armor.js';
import { CONS_BY } from '../src/core/data/world.js';
import { makeApprentice, newGame } from '../src/core/people.js';
import { recomputeCB, trialEval } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';
import { ensureSkills, grantSkill, hasSkill, skillLevel, tickSkills } from '../src/core/skills.js';
import { specReq } from '../src/core/data/skills.js';

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
    ensureSkills(k, 'k'); grantSkill(k, 'V2'); specReq(sil).forEach(id => grantSkill(k, id));
    const e = trialEval(k, sil);
    if (armorAffinity(k, sil).v >= AFF_MIN.argent) expect(e.ok).toBe(true);
    const gold = CONS_BY['or-' + k.sign]; S.armors[gold.k] = 'restauree';
    expect(trialEval(k, gold).ok).toBe(false);
    k.pot = 50;
    expect(trialEval(k, sil).ok).toBe(false);
  });
});

describe('cartes de compétences', () => {
  it('les chevaliers déjà en place connaissent les compétences de leur rang et de leur armure', () => {
    const k = S.knights.find(x => x.rank === 'or'); ensureSkills(k, 'k');
    ['F1', 'F8', 'V1', 'V2', 'V3'].forEach(id => expect(hasSkill(k, id)).toBe(true));
    specReq(CONS_BY[k.cons]).forEach(id => expect(hasSkill(k, id)).toBe(true));
    expect(skillLevel(k, 'F1')).toBeGreaterThan(1);
  });
  it('un apprenti découvre les fondamentales plus vite avec un maître, et Mach 5 seulement avec un maître d’argent ou d’or', () => {
    const mk = () => { const a = makeApprentice(); S.aps.push(a); ensureSkills(a, 'a'); grantSkill(a, 'F1'); return a; };
    const a1 = mk(), a2 = mk();
    const gold = S.knights.find(x => x.rank === 'or'), bronze = S.knights.find(x => x.rank === 'bronze');
    for (let i = 0; i < 40; i++) { tickSkills(a1, 1, 10, gold); tickSkills(a2, 1, 10, null); }
    const n = p => Object.keys(p.sk).length + Object.values(p.skp).reduce((t, v) => t + v, 0) / 100;
    expect(n(a1)).toBeGreaterThan(n(a2));
    const a3 = mk(); for (let i = 0; i < 2000; i++) tickSkills(a3, 1, 10, bronze);
    expect(hasSkill(a3, 'V2')).toBe(false);
    for (let i = 0; i < 2000; i++) tickSkills(a1, 1, 10, gold);
    expect(hasSkill(a1, 'V2')).toBe(true);
  });
  it('sans fondamentales, pas d’épreuve ; avec une forte affinité, l’armure transmet ce qui manque', () => {
    const a = ap({ sign: 0, lv: 12, st: { fo: 3, vi: 30, de: 3, en: 3, ps: 3, co: 30 } });
    S.aps.push(a); ensureSkills(a, 'a'); S.armors.pegase = 'restauree';
    expect(trialEval(a, CONS_BY.pegase).why).toMatch(/fondamentales/);
    ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'V1'].forEach(id => grantSkill(a, id));
    const e = trialEval(a, CONS_BY.pegase);
    if (armorAffinity(a, CONS_BY.pegase).v >= 85) { expect(e.ok).toBe(true); expect(e.resonance.length).toBe(2); }
    else expect(e.why).toMatch(/spécifiques/);
  });
});
