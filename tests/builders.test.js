// Savoir-faire des bâtisseurs.
import { beforeEach, describe, expect, it } from 'vitest';
import { TECHS, bp, techLv } from '../src/core/builders.js';
import { newGame } from '../src/core/people.js';
import { costOf, houseTime, recomputeCB, slotsFor, step, timeOf } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); });

describe('savoir-faire des bâtisseurs', () => {
  it('un chantier terminé rapporte des points, et les travaux aussi', () => {
    S.jobs.push({ b: 'champs', start: S.gt, end: S.gt + 1, lvl: 2 });
    step(.5, null); const during = bp(); expect(during).toBeGreaterThan(0);
    step(.6, null); expect(bp()).toBeGreaterThan(during + 15);
    expect(S.b.champs).toBe(2);
  });
  it('chaque savoir-faire change vraiment les chantiers', () => {
    const slots = slotsFor(S.b.artisans), t = timeOf('champs'), c = costOf('carriere'), ht = houseTime(0);
    S.tech = { chantiers: 1, echafaudages: 2, taille: 1, architecture: 1 };
    expect(slotsFor(S.b.artisans)).toBe(slots + 1);
    expect(timeOf('champs')).toBeCloseTo(t * .84);
    expect(houseTime(0)).toBeLessThan(ht * .84);
    expect(techLv('taille')).toBe(1);
    expect(TECHS.chantiers.cost(2).bp).toBeGreaterThan(TECHS.chantiers.cost(1).bp);
    expect(costOf('carriere').vivres).toBe(c.vivres);
  });
});
