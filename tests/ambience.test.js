// Cycle du jour et de la nuit : bonnes heures, transitions sans saut.
import { describe, expect, it } from 'vitest';
import { hourOf, phaseName, skyAt } from '../src/map/ambience.js';

describe('jour et nuit', () => {
  it('plein jour sans voile, pleine nuit sombre', () => {
    expect(skyAt(12).alpha).toBe(0);
    expect(skyAt(12).lights).toBe(0);
    expect(skyAt(2).alpha).toBeCloseTo(.53, 1);
    expect(skyAt(2).lights).toBe(1);
  });
  it('aucun saut brutal sur 24 h', () => {
    for (let h = 0; h < 24; h += .1) expect(Math.abs(skyAt(h + .1).alpha - skyAt(h).alpha)).toBeLessThan(.05);
  });
  it('suit l’heure réelle en temps normal et l’heure du jeu en mode ×60', () => {
    const midi = new Date(2026, 9, 24, 12, 30).getTime();
    expect(hourOf({ speed: 1 }, midi)).toBeCloseTo(12.5);
    expect(hourOf({ speed: 60, created: new Date(2026, 9, 24, 8, 0).getTime(), gt: 30 })).toBeCloseTo(14);
    expect(phaseName(14)).toBe('jour');
    expect(phaseName(23)).toBe('nuit');
  });
});
