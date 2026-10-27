// Mini-jeux (niveaux toujours jouables, difficulté croissante, gains limités), épreuves et bonus à 100 %.
import { beforeEach, describe, expect, it } from 'vitest';
import { newGame } from '../src/core/people.js';
import { cb, recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';
import { GAMES, MG_LEVELS, epBonus } from '../src/core/data/minigames.js';
import { DAY_FULL, ensureMG, genBurin, genFleche, genHorloge, genLyre, givePool, levelOf, mgOf, mgUnlocked, mgWin, slide } from '../src/core/minigames.js';
import { checkEpreuves, epreuveOf, objectivesOf, progressOf } from '../src/core/epreuves.js';
import { CONS, CONS_BY } from '../src/core/data/world.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); ensureMG(); });
const bear = k => { const kn = S.knights[0]; kn.cons = k; return kn; };

describe('niveaux', () => {
  it('chaque niveau de chaque jeu se génère, toujours pareil', () => {
    GAMES.forEach(g => { for (let L = 1; L <= MG_LEVELS; L++) expect(levelOf(g.k, L)).toBeTruthy(); });
    expect(JSON.stringify(genFleche(9))).toBe(JSON.stringify(genFleche(9)));
  });
  it('la Flèche est toujours faisable dans la limite, et plus longue au fil des niveaux', () => {
    let first = 0, last = 0;
    for (let L = 1; L <= MG_LEVELS; L++) {
      const lv = genFleche(L);
      expect(lv.opt).toBeGreaterThan(0);
      expect(lv.limit).toBeGreaterThanOrEqual(lv.opt);
      if (L <= 3) first += lv.opt; if (L >= 18) last += lv.opt;
    }
    expect(last).toBeGreaterThan(first);
    // le glissement s'arrête bien sur un rocher ou au bord
    const lv = genFleche(5), rock = new Set(lv.rock);
    for (let d = 0; d < 4; d++) { const { end, path } = slide({ ...lv, rock }, lv.start, d); path.forEach(c => expect(rock.has(c)).toBe(false)); expect(path.length ? path[path.length - 1] : lv.start).toBe(end); }
  });
  it('les autres jeux se durcissent', () => {
    expect(genLyre(20).seq.length).toBeGreaterThan(genLyre(1).seq.length);
    expect(genLyre(20).ms).toBeLessThan(genLyre(1).ms);
    expect(genHorloge(20).zones.length).toBeGreaterThan(genHorloge(1).zones.length);
    expect(genBurin(20).cells.length).toBeGreaterThan(genBurin(1).cells.length);
  });
});

describe('gains', () => {
  it('un jeu s’ouvre avec le porteur de son armure', () => {
    S.knights.forEach(k => { if (k.cons === 'fleche') k.cons = 'pegase'; });
    expect(mgUnlocked('fleche')).toBeNull();
    bear('fleche');
    expect(mgUnlocked('fleche')).toBeTruthy();
  });
  it('un niveau réussi rapporte une fois ; les gains baissent au-delà de 4 par jour', () => {
    const kn = bear('fleche'), vi = kn.st.vi;
    const out = mgWin('fleche', 1);
    expect(out.length).toBeGreaterThan(1);
    expect(kn.st.vi).toBeGreaterThan(vi);
    const pool = S.xpPool;
    expect(mgWin('fleche', 1)).toEqual([]);
    expect(mgWin('fleche', 3)).toEqual([]);
    expect(S.xpPool).toBe(pool);
    for (let L = 2; L <= DAY_FULL; L++) mgWin('fleche', L);
    const before = S.xpPool; mgWin('fleche', DAY_FULL + 1);
    expect(S.xpPool - before).toBeLessThan(2);
    expect(mgOf('fleche').done).toBe(DAY_FULL + 1);
  });
  it('la réserve se répartit sur un personnage', () => {
    S.xpPool = 10; const k = S.knights[1], xp = k.xp, lv = k.lv;
    expect(givePool(k, 4)).toBe(4);
    expect(S.xpPool).toBe(6);
    expect(k.xp !== xp || k.lv > lv).toBe(true);
  });
});

describe('épreuves et collection', () => {
  it('chaque constellation a une épreuve : jeu ou objectifs', () => {
    CONS.forEach(c => { const e = epreuveOf(c); expect(['jeu', 'obj']).toContain(e.type); if (e.type === 'obj') expect(e.objs.length).toBe(3); });
    expect(epreuveOf(CONS_BY.fleche).type).toBe('jeu');
    expect(objectivesOf(CONS.find(c => c.rank === 'or')).some(o => o.k === 'house')).toBe(true);
  });
  it('un mini-jeu fini à 100 % donne son bonus pour toujours', () => {
    bear('fleche');
    mgOf('fleche').done = MG_LEVELS;
    expect(progressOf(CONS_BY.fleche)).toBe(1);
    const b = epBonus('fleche'), before = cb(b.key);
    checkEpreuves(null); recomputeCB();
    expect(S.epDone).toContain('fleche');
    expect(cb(b.key)).toBe(before + b.v);
  });
  it('les objectifs avancent avec le porteur', () => {
    const c = CONS.find(x => x.rank === 'bronze' && epreuveOf(x).type === 'obj'), kn = bear(c.k);
    kn.lv = 1; const p0 = progressOf(c);
    kn.lv = 30; expect(progressOf(c)).toBeGreaterThan(p0);
  });
});
