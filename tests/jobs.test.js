// Métiers de chercheur et de médecin ; limite d'achats de la lecture des astres.
import { beforeEach, describe, expect, it } from 'vitest';
import { LORE, loreLevel, loreMult } from '../src/core/research.js';
import { careF, restHours, survivalChance, vieLevel } from '../src/core/medicine.js';
import { skillLevel } from '../src/core/skills.js';
import { newGame } from '../src/core/people.js';
import { recomputeCB, step } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); });
const job = (k, role) => { k.role = role; k.tm = { job: 100, dis: 0, self: 0 }; k.qual = []; k.flaw = []; };

describe('chercheur', () => {
  it('retrouve des savoirs perdus qui améliorent l’apprentissage', () => {
    S.b.biblio = 1; job(S.knights[1], 'biblio');
    expect(loreLevel()).toBe(0);
    for (let i = 0; i < 80; i++) step(1, null);
    expect(loreLevel()).toBeGreaterThanOrEqual(1);
    expect(loreMult()).toBeGreaterThan(1);
    expect(S.log.some(l => l.m.includes(LORE[0]))).toBe(true);
  });
  it('sans bibliothèque, pas de recherche', () => {
    S.b.biblio = 0; job(S.knights[1], 'biblio');
    for (let i = 0; i < 80; i++) step(1, null);
    expect(loreLevel()).toBe(0);
  });
});

describe('médecin', () => {
  it('raccourcit le repos et apprend lentement le Maintien en vie', () => {
    const k = S.knights[2], a = S.knights[3]; a.qual = []; a.flaw = [];
    const r0 = restHours(a);
    job(k, 'medecin');
    expect(careF()).toBeCloseTo(1);
    expect(restHours(a)).toBeLessThan(r0);
    expect(survivalChance()).toBe(10);
    for (let i = 0; i < 80; i++) step(1, null);
    expect(vieLevel(k)).toBe(1);
    expect(skillLevel(k, 'vie')).toBe(1);
    expect(survivalChance()).toBe(27);
    for (let i = 0; i < 24 * 10; i++) step(1, null);
    expect(vieLevel(k)).toBeGreaterThan(1);
    expect(vieLevel(k)).toBeLessThan(5);
  });
});

describe('lecture des astres', () => {
  it('pas plus de 2 cartes achetées par tour', async () => {
    const D = await import('../src/core/duel.js');
    S.knights[0].role = 'pope'; D.ensureDuel(); D.startDuel([]);
    const m = S.match; Object.keys(m.me.gems).forEach(g => { m.me.gems[g] = 10; });
    let ok = 0; for (const id of [1, 2, 3].flatMap(t => m.rows[t]).slice(0, 6)) if (D.buy('me', id)) ok++;
    expect(ok).toBe(2);
  });
});
