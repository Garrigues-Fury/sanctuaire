// Combat : règles de base et équilibrage par simulation.
import { describe, expect, it } from 'vitest';
import { autoResolve, heroAction, newBattle, refHero, winChance } from '../src/core/combat.js';

// Survivants typiques du début de partie (moyennes de makeKnight).
const knight = (rank, lv, base, sign = 0) => ({ id: 1, name: 'Test', rank, lv, sign, origin: 'survivant', tech: ['Éclat test'], st: { fo: base + 7, vi: base + 7, en: base + 7, co: base + 7 } });
const OR = knight('or', 38, 48), ARGENT = knight('argent', 21, 26), BRONZE = knight('bronze', 11, 14);
const ev = (L, boss = false) => ({ foe: 'bandits', L, n: boss ? 3 : 2, boss });

describe('combat', () => {
  it('un combat se termine toujours', () => {
    for (let s = 1; s < 30; s++) expect(autoResolve(newBattle(BRONZE, ev(3, true), {}, s)).over).toBe(true);
  });
  it('la garde réduit le coup terrible du chef', () => {
    const b = newBattle(OR, ev(5, true), {}, 3);
    heroAction(b, 'strike'); // tour 1
    heroAction(b, 'strike'); // tour 2 : le chef prépare son coup
    expect(b.foes[0].charge).toBe(1);
    const hp = b.hero.hp; heroAction(b, 'guard');
    expect(hp - b.hero.hp).toBeLessThan(b.foes[0].atk * 1.5);
  });
  it('équilibrage : les étoiles correspondent aux rangs', () => {
    const table = {};
    for (const [n, k] of [['bronze', BRONZE], ['argent', ARGENT], ['or', OR]])
      table[n] = [1, 2, 3, 4, 5].map(L => Math.round(winChance(k, ev(L)) * 100) + '/' + Math.round(winChance(k, ev(L, true)) * 100));
    console.log('victoires % (normal/avec chef) pour 1 à 5 étoiles', table);
    expect(winChance(BRONZE, ev(1))).toBeGreaterThan(.8);   // un bronze gagne les alertes faciles
    expect(winChance(BRONZE, ev(4))).toBeLessThan(.3);      // mais pas les très dures
    expect(winChance(ARGENT, ev(3))).toBeGreaterThan(.6);
    expect(winChance(OR, ev(5, true))).toBeGreaterThan(.6); // l'or tient les plus dures
    expect(refHero(1).max).toBeLessThan(refHero(5).max);
  });
});
