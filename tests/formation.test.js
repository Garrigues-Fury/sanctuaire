// Suivi des formations : maîtres capables de guider, candidats, maître d'apprentissage.
import { beforeEach, describe, expect, it } from 'vitest';
import { candidatesFor, guidesFor, orientF, revealed } from '../src/core/formation.js';
import { CONS_BY } from '../src/core/data/world.js';
import { makeApprentice, newGame } from '../src/core/people.js';
import { recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); });

describe('formation des apprentis', () => {
  it('pour le Cygne, le Verseau maîtrise le froid ; en gris tant que personne ne porte son armure', () => {
    const g = guidesFor(CONS_BY.cygne);
    const v = g.find(x => x.c.k === 'or-10');
    expect(v).toBeTruthy();
    expect(v.skills).toContain('glace');
    expect(v.wearer).toBe(S.knights.find(k => k.cons === 'or-10') || null);
    S.knights[0].cons = 'or-10';
    expect(guidesFor(CONS_BY.cygne).find(x => x.c.k === 'or-10').wearer).toBe(S.knights[0]);
  });
  it('une armure déjà portée n’a plus de candidats', () => {
    for (let i = 0; i < 6; i++) S.aps.push(makeApprentice());
    const worn = CONS_BY[S.knights.find(k => k.rank === 'bronze').cons];
    expect(candidatesFor(worn)).toEqual([]);
  });
  it('le maître d’apprentissage révèle le potentiel', () => {
    expect(revealed()).toBe(false);
    const k = S.knights[1]; k.role = 'apprentissage'; k.tm = { job: 100, dis: 0, self: 0 }; k.qual = []; k.flaw = [];
    expect(revealed()).toBe(true);
    expect(orientF()).toBeCloseTo(1);
  });
});
