// Emploi du temps des personnages.
import { beforeEach, describe, expect, it } from 'vitest';
import { isMaster, jobF, plan, selfF, setShare, teachF, timeMult } from '../src/core/schedule.js';
import { knightRate, masterOf, prodMult, recomputeCB, xpRate } from '../src/core/rules.js';
import { newGame } from '../src/core/people.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); });

describe('emploi du temps', () => {
  it('le total fait toujours 100 %', () => {
    const k = S.knights[0]; k.role = 'intendant'; k.tm = null;
    setShare(k, 'dis', 30); setShare(k, 'self', 45);
    const t = plan(k);
    expect(t.job + t.dis + t.self).toBe(100);
    expect(t.self).toBe(45);
  });
  it('un ancien « Maître » devient un chevalier qui consacre la moitié de son temps à ses disciples', () => {
    const k = S.knights[0]; k.role = 'maitre'; k.tm = undefined;
    expect(isMaster(k)).toBe(true);
    expect(k.role).toBe(null);
    expect(plan(k)).toEqual({ job: 0, dis: 50, self: 50 });
  });
  it('le métier rend selon le temps qu’on lui donne', () => {
    const k = S.knights[1]; k.role = 'intendant'; k.tm = null; k.qual = []; k.flaw = [];
    const full = prodMult();
    setShare(k, 'job', 50);
    expect(jobF(k)).toBeCloseTo(.5);
    expect(prodMult()).toBeLessThan(full);
  });
  it('plus de temps pour soi, plus d’XP', () => {
    const k = S.knights[1]; k.role = 'oeuvre'; k.tm = null; k.qual = []; k.flaw = [];
    const r0 = knightRate(k);
    setShare(k, 'self', 60);
    expect(knightRate(k)).toBeGreaterThan(r0);
    expect(selfF(k)).toBeCloseTo(.3 + .7 * .6);
  });
  it('le disciple apprend mieux quand son maître lui donne du temps', () => {
    const k = S.knights[0]; k.role = null; k.tm = null; const ap = S.pending[0]; S.aps.push(ap); ap.master = k.id;
    expect(masterOf(ap)).toBe(null);
    const alone = xpRate(ap);
    setShare(k, 'dis', 50, ['job']);
    expect(masterOf(ap)).toBe(k);
    const half = xpRate(ap); expect(half).toBeGreaterThan(alone);
    setShare(k, 'dis', 100, ['job']);
    expect(teachF(k)).toBeGreaterThan(1);
    expect(xpRate(ap)).toBeGreaterThan(half);
  });
  it('le goût de l’effort et la paresse changent le rendement du temps', () => {
    const k = S.knights[0];
    k.qual = [{ k: 'travailleur', lv: 2 }]; k.flaw = [];
    expect(timeMult(k)).toBeCloseTo(1.12);
    k.qual = []; k.flaw = [{ k: 'paresseux', lv: 3 }];
    expect(timeMult(k)).toBeCloseTo(.82);
  });
  it('un apprenti en renfort partage entre formation et travail', () => {
    const ap = S.pending[0]; S.aps.push(ap); ap.job = 'champs'; ap.tm = null; ap.qual = []; ap.flaw = [];
    const x50 = xpRate(ap);
    setShare(ap, 'train', 80);
    expect(xpRate(ap)).toBeGreaterThan(x50);
    expect(plan(ap).help).toBe(20);
  });
});
