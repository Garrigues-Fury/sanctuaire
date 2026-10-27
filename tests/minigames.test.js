// Mini-jeux (un par constellation, niveaux toujours jouables, difficulté croissante, gains limités), défis réels, bonus à 100 %.
import { beforeEach, describe, expect, it } from 'vitest';
import { newGame } from '../src/core/people.js';
import { cb, recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';
import { MECHS, MG_LEVELS, epBonus, gameOf, mechOf } from '../src/core/data/minigames.js';
import { DEFI_OF_CONS, DEFI_TYPES, stepText } from '../src/core/data/defis.js';
import { DAY_FULL, ensureMG, flows, genBurin, genCanal, genFleche, genHorloge, genLabyrinthe, genLyre, genMots, genQuiz, givePool, levelOf, mgOf, mgUnlocked, mgWin, slide } from '../src/core/minigames.js';
import { gpxSummary, nextStep, validateGpx, validateHonor } from '../src/core/defis.js';
import { checkEpreuves, epreuveOf, progressOf } from '../src/core/epreuves.js';
import { CONS, CONS_BY } from '../src/core/data/world.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); ensureMG(); });
const bear = k => { const kn = S.knights[0]; kn.cons = k; return kn; };

describe('les jeux', () => {
  it('chaque constellation a un jeu ou un défi, et 15 sortes de jeux sont utilisées', () => {
    const used = new Set();
    CONS.forEach(c => { const e = epreuveOf(c); expect(['jeu', 'defi']).toContain(e.type); if (e.type === 'jeu') used.add(e.game.mech); });
    expect(used.size).toBe(Object.keys(MECHS).length);
    expect(epreuveOf(CONS_BY.fleche).game.mech).toBe('fleche');
    expect(mechOf('or-10')).toBe('canal');expect(mechOf('or-8')).toBe('fleche');
  });
  it('chaque niveau de chaque constellation se génère', () => {
    CONS.forEach(c => { if (!gameOf(c.k)) return; for (const L of [1, 10, MG_LEVELS]) expect(levelOf(c.k, L)).toBeTruthy(); });
  });
  it('la Flèche est toujours faisable dans la limite, et plus longue au fil des niveaux', () => {
    let first = 0, last = 0;
    for (let L = 1; L <= MG_LEVELS; L++) { const lv = genFleche(L); expect(lv.opt).toBeGreaterThan(0); expect(lv.limit).toBeGreaterThanOrEqual(lv.opt); if (L <= 3) first += lv.opt; if (L >= 18) last += lv.opt; }
    expect(last).toBeGreaterThan(first);
    const lv = genFleche(5), rock = new Set(lv.rock);
    for (let d = 0; d < 4; d++) { const { path } = slide({ ...lv, rock }, lv.start, d); path.forEach(c => expect(rock.has(c)).toBe(false)); }
  });
  it('les canaux ont toujours une solution, mélangée au départ', () => {
    for (let L = 1; L <= 24; L += 3) {
      const lv = genCanal(L, 'eridan' + L);
      expect(flows(lv, lv.rots).ok).toBe(false);
      // il existe des rotations qui relient la source à la fontaine (recherche sur le chemin d'origine : rotation 0 de la base)
      expect(flows(lv, lv.tiles.map(() => 0)).ok).toBe(true);
    }
  });
  it('le labyrinthe relie l’entrée à la sortie', () => {
    const lv = genLabyrinthe(12), n = lv.n, seen = new Set([0]), q = [0];
    while (q.length) { const c = q.shift(); [[1, -n], [2, 1], [4, n], [8, -1]].forEach(([b, d]) => { if (lv.open[c] & b && !seen.has(c + d)) { seen.add(c + d); q.push(c + d); } }); }
    expect(seen.has(n * n - 1)).toBe(true);
  });
  it('les autres jeux se durcissent, et les contenus sont justes', () => {
    expect(genLyre(20).seq.length).toBeGreaterThan(genLyre(1).seq.length);
    expect(genHorloge(20).zones.length).toBeGreaterThan(genHorloge(1).zones.length);
    expect(genBurin(20).cells.length).toBeGreaterThan(genBurin(1).cells.length);
    expect(genMots(18).words[0].w.length).toBeGreaterThan(genMots(1).words[0].w.length);
    const qz = genQuiz(15); expect(qz.qs.length).toBe(5); qz.qs.forEach(q => expect(q.a).toContain(q.good));
    genMots(7).words.forEach(w => { expect(w.s).not.toBe(w.w); expect(w.s.split('').sort().join('')).toBe(w.w.split('').sort().join('')); });
  });
  it('l’argent et l’or partent de plus haut', () => {
    expect(levelOf('lyre', 1).seq.length).toBeGreaterThan(genLyre(1).seq.length);
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
    expect(mgWin('fleche', 1).length).toBeGreaterThan(1);
    expect(kn.st.vi).toBeGreaterThan(vi);
    const pool = S.xpPool;
    expect(mgWin('fleche', 1)).toEqual([]);
    expect(S.xpPool).toBe(pool);
    for (let L = 2; L <= DAY_FULL; L++) mgWin('fleche', L);
    const before = S.xpPool; mgWin('fleche', DAY_FULL + 1);
    expect(S.xpPool - before).toBeLessThan(2);
  });
  it('la réserve se répartit sur un personnage', () => {
    S.xpPool = 10; const k = S.knights[1], xp = k.xp, lv = k.lv;
    expect(givePool(k, 4)).toBe(4);
    expect(S.xpPool).toBe(6);
    expect(k.xp !== xp || k.lv > lv).toBe(true);
  });
  it('un mini-jeu fini à 100 % donne son bonus pour toujours', () => {
    bear('fleche'); mgOf('fleche').done = MG_LEVELS;
    expect(progressOf(CONS_BY.fleche)).toBe(1);
    const b = epBonus('fleche'), before = cb(b.key);
    checkEpreuves(null); recomputeCB();
    expect(S.epDone).toContain('fleche');
    expect(cb(b.key)).toBe(before + b.v);
  });
});

describe('défis réels', () => {
  const gpx = (km, start = '2026-10-20T08:00:00Z') => { // une ligne droite vers le nord : 1° de latitude ≈ 111 km
    const n = 50, pts = []; for (let i = 0; i <= n; i++) pts.push('<trkpt lat="' + (43 + km / 111.2 * i / n).toFixed(6) + '" lon="3.5"><ele>' + (200 + i) + '</ele><time>' + start + '</time></trkpt>');
    return '<gpx><trk><trkseg>' + pts.join('') + '</trkseg></trk></gpx>';
  };
  it('le VTT commence à 25 km, les pompes à une série de 10 et finissent à 100', () => {
    expect(DEFI_TYPES.velo.steps[0]).toBe(25);
    expect(DEFI_TYPES.velo.steps.at(-1)).toBe(35);
    expect(DEFI_TYPES.pompes.steps[0]).toEqual([1, 10]);
    const [n, x] = DEFI_TYPES.pompes.steps.at(-1); expect(n * x).toBe(100);
    expect(stepText('pompes', 2)).toMatch(/3 séries de 10/);
  });
  it('un fichier GPX donne la distance, et une sortie trop courte ne compte pas', () => {
    const g = gpxSummary(gpx(30));
    expect(g.km).toBeGreaterThan(29.5); expect(g.km).toBeLessThan(30.5);
    expect(g.dplus).toBe(50);
    const k = Object.keys(DEFI_OF_CONS).find(c => DEFI_OF_CONS[c] === 'velo');
    expect(validateGpx(k, gpxSummary(gpx(20))).ok).toBe(false);
    expect(validateGpx(k, g).ok).toBe(true);
    // la même sortie ne compte pas deux fois, et il faut se reposer
    expect(validateGpx(k, g, Date.now() + 30 * 3600e3).ok).toBe(false);
    expect(nextStep(k).ready).toBe(false);
    expect(nextStep(k, Date.now() + 21 * 3600e3).ready).toBe(true);
  });
  it('les pompes se valident sur l’honneur, un palier par jour', () => {
    const k = Object.keys(DEFI_OF_CONS).find(c => DEFI_OF_CONS[c] === 'pompes'), now = Date.now(), pool = S.xpPool || 0;
    expect(validateHonor(k, now)).toBeTruthy();
    expect(S.xpPool).toBeGreaterThan(pool);
    expect(validateHonor(k, now + 3600e3)).toBe(null);
    expect(validateHonor(k, now + 21 * 3600e3)).toBeTruthy();
    expect(progressOf(CONS_BY[k])).toBeCloseTo(.2);
  });
  it('un défi réel rapporte un bonus double à 100 %', () => {
    const k = Object.keys(DEFI_OF_CONS)[0], c = CONS_BY[k];
    const plain = CONS.find(x => x.rank === c.rank && !DEFI_OF_CONS[x.k]);
    expect(epBonus(k).v).toBe(2 * epBonus(plain.k).v);
  });
});
