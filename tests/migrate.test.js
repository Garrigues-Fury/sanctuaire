// Reprise des sauvegardes du prototype : une partie de chaque ancienne version doit se charger et continuer à tourner.
import { beforeEach, describe, expect, it } from 'vitest';
import { CONS } from '../src/core/data/world.js';
import { migrate } from '../src/core/migrate.js';
import { newGame } from '../src/core/people.js';
import { advance, newSum, recomputeCB, rates } from '../src/core/rules.js';
import { exportCode, importCode } from '../src/core/save.js';
import { S, VERSION, setS } from '../src/core/state.js';

const clone = o => JSON.parse(JSON.stringify(o));
function freshSave() { newGame(); const o = clone(S); setS(null); return o; }

// Fabrique une sauvegarde au format de la version 1 : pas de caractères, pas de villageois, pas de maisons…
function asV1(o) {
  o.v = 1;
  const strip = p => { delete p.qual; delete p.flaw; delete p.bio; delete p.sp; delete p.nrg; p.trait = 'fougueux'; p.nat = 'grece'; };
  o.knights.forEach(strip); o.aps.forEach(p => { strip(p); delete p.job; delete p.wacc; }); o.pending.forEach(strip);
  ['workers', 'houses', 'items', 'tools', 'craft', 'friend', 'fp', 'fpAcc', 'guards', 'perm', 'artefacts', 'faveur', 'gods', 'duel', 'match'].forEach(k => delete o[k]);
  delete o.b.jardin; delete o.b.herbo; delete o.b.atelier;
  delete o.armors[CONS[0].k];
  o.forgeJob = { cons: 'pegase', start: 2, end: 12 }; o.gt = 7;
  return o;
}

describe('migrate()', () => {
  beforeEach(() => setS(null));

  it('laisse intacte une sauvegarde déjà en version 6', () => {
    const o = freshSave();
    const m = migrate(clone(o));
    expect(m).toEqual(o);
  });

  it('met à niveau une sauvegarde de la version 1', () => {
    const m = migrate(asV1(freshSave()));
    expect(m.v).toBe(VERSION);
    expect(m.workers).toHaveLength(5);
    expect(m.houses).toHaveLength(12);
    expect(m.houses.reduce((a, b) => a + b, 0)).toBe(1); // la maison du chevalier d'or survivant
    m.knights.concat(m.pending).forEach(p => {
      expect(p.nat).toBe('Grèce');
      expect(p.qual[0]).toEqual({ k: 'fougueux', lv: 1 });
      expect(p.flaw.length).toBe(1);
      expect(p.bio).toHaveLength(3);
      expect(p.nrg).toBeGreaterThan(0);
    });
    expect(Object.keys(m.armors)).toHaveLength(88);
    expect(m.forgeJob).toEqual({ cons: 'pegase', work: 6, prog: 3 }); // moitié du chantier faite
    expect(m.duel).toEqual({ lastDate: '', lastGt: -999 });
    expect(S).toBe(null); // migrate ne laisse pas traîner la partie en cours
  });

  it('convertit les cartes achetées de la version 4 en bonus permanents', () => {
    const o = freshSave(); o.v = 4; delete o.perm; o.cards = ['c01', 'c13']; o.market = {}; o.decks = {};
    const m = migrate(o);
    expect(m.perm.map(c => c.n)).toEqual(['Source sacrée', 'Galet d’Éleusis']);
    expect(m.faveur).toBe(1);
    expect(m.cards).toBeUndefined();
  });

  it('une partie migrée continue de tourner (30 jours de jeu)', () => {
    setS(migrate(asV1(freshSave())));
    recomputeCB();
    const sum = newSum();
    advance(30 * 24, sum);
    expect(S.gt).toBeCloseTo(7 + 30 * 24);
    Object.values(S.res).forEach(v => expect(Number.isFinite(v)).toBe(true));
    expect(Number.isFinite(rates().vivres)).toBe(true);
  });
});

describe('code de sauvegarde', () => {
  it('relit un code au format du prototype (accents compris)', () => {
    const o = freshSave();
    // encodage exact du prototype v0.6
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(o))));
    expect(importCode(code)).toEqual(o);
    expect(exportCode(o)).toBe(code);
  });
  it('accepte un code coupé par des retours à la ligne', () => {
    const o = freshSave();
    const code = exportCode(o).replace(/(.{76})/g, '$1\n');
    expect(importCode(code)).toEqual(o);
  });
  it('refuse un code abîmé', () => {
    expect(importCode('pas un code')).toBe(null);
    expect(importCode(exportCode({ v: 99 }))).toBe(null);
  });
});
