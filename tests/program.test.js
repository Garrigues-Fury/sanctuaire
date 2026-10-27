// Dextérité, psychokinésie et programme d'entraînement.
import { beforeEach, describe, expect, it } from 'vitest';
import { PROG_DEF, ensureStats, medMult, prog, setProg, studyMult, trainStats } from '../src/core/program.js';
import { heroStats, newBattle, autoResolve } from '../src/core/combat.js';
import { eregen, knightRate, recomputeCB } from '../src/core/rules.js';
import { newGame } from '../src/core/people.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); });
const P = (o) => Object.assign({ id: 1, name: 'X', nat: 'Grèce', sign: 0, qual: [], flaw: [], bio: [], st: { fo: 20, vi: 20, en: 20, co: 20, de: 20, ps: 20 }, lv: 10, rank: 'bronze', scale: 1, tech: ['Éclat'], origin: 'forme' }, o); // scale 1 : statistiques lues telles quelles (échelle d'un apprenti)

describe('six statistiques', () => {
  it('les nouveaux personnages ont dextérité et psychokinésie', () => {
    S.knights.concat(S.pending).forEach(p => { expect(p.st.de).toBeGreaterThan(0); expect(p.st.ps).toBeGreaterThan(0); });
  });
  it('les anciens personnages les reçoivent à partir de leurs autres statistiques', () => {
    const p = { st: { fo: 10, vi: 20, en: 30, co: 40 } };
    ensureStats(p);
    expect(p.st.de).toBe(15);
    expect(p.st.ps).toBe(35);
    expect(p.tr).toEqual(PROG_DEF);
  });
});

describe('combat', () => {
  it('la dextérité donne des coups précis', () => {
    expect(heroStats(P({ st: { fo: 20, vi: 20, en: 20, co: 20, de: 80, ps: 20 } })).crit).toBeGreaterThan(heroStats(P({})).crit);
    let crits = 0;
    for (let s = 1; s < 30; s++) crits += autoResolve(newBattle(P({ st: { fo: 20, vi: 20, en: 20, co: 20, de: 100, ps: 20 } }), { foe: 'bandits', L: 2, n: 2 }, {}, s)).log.filter(l => l.crit).length;
    expect(crits).toBeGreaterThan(0);
  });
  it('la psychokinésie dresse une barrière et éveille le cosmos plus tôt', () => {
    const h = heroStats(P({ st: { fo: 20, vi: 20, en: 20, co: 20, de: 20, ps: 70 } }));
    expect(h.shield).toBeGreaterThan(heroStats(P({})).shield);
    const b = newBattle(P({ st: { fo: 20, vi: 20, en: 20, co: 20, de: 20, ps: 70 } }), { foe: 'bandits', L: 1, n: 1 }, {}, 3);
    expect(b.hero.cos).toBe(4);
  });
});

describe('programme d’entraînement', () => {
  it('le total fait toujours 100 %', () => {
    const k = S.knights[0];
    setProg(k, 'med', 50);
    const t = prog(k);
    expect(Object.values(t).reduce((a, b) => a + b, 0)).toBe(100);
    expect(t.med).toBe(50);
  });
  it('la statistique travaillée monte, les autres non', () => {
    const k = S.knights[0]; k.role = null; k.tm = null; k.qual = []; k.flaw = [];
    setProg(k, 'dex', 100);
    const de = k.st.de, fo = k.st.fo;
    trainStats(k, 24 * 5, 1);
    expect(k.st.de).toBeGreaterThan(de + 5);
    expect(k.st.fo).toBe(fo);
  });
  it('la méditation recharge l’énergie, les études accélèrent l’XP', () => {
    const k = S.knights[0]; k.qual = []; k.flaw = [];
    setProg(k, 'med', 0); setProg(k, 'etu', 0);
    const e0 = eregen(k), x0 = knightRate(k);
    expect(medMult(k)).toBe(1);
    setProg(k, 'med', 50);
    expect(eregen(k)).toBeGreaterThan(e0);
    setProg(k, 'etu', 50);
    expect(studyMult(k)).toBeCloseTo(1.3);
    expect(knightRate(k)).toBeGreaterThan(x0);
  });
});

describe('programme en 6 parts', () => {
  it('les anciens programmes en 8 parts sont convertis', () => {
    const p = { tr: { fo: 15, vi: 15, de: 10, en: 15, ps: 10, co: 15, med: 10, etu: 10 } };
    expect(prog(p)).toEqual({ phy: 15, rap: 15, dex: 10, end: 15, med: 35, etu: 10 });
  });
  it('chaque part fait découvrir ses compétences plus vite', async () => {
    const { discoverMult } = await import('../src/core/program.js');
    const { SKILLS } = await import('../src/core/data/skills.js');
    const k = S.knights[0];
    setProg(k, 'med', 100);
    expect(discoverMult(k, SKILLS.telekinesie)).toBeCloseTo(4);
    expect(discoverMult(k, SKILLS.grappling)).toBeCloseTo(.4);
    expect(discoverMult(k, SKILLS.F1)).toBeCloseTo(4);
  });
});
