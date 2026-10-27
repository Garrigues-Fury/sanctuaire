// Caractère (cœur, ton, complexes), vétérans, compétences jusqu'au niveau 30.
import { beforeEach, describe, expect, it } from 'vitest';
import { newGame } from '../src/core/people.js';
import { recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';
import { SKILL_MAX, levelOfX, skillLevel, xpForLevel } from '../src/core/skills.js';
import { ensureCharacter, ensureLife, strongSkills, tickConfidence } from '../src/core/character.js';
import { armorAffinity, heartBlock } from '../src/core/armor.js';
import { CONS } from '../src/core/data/world.js';
import { compat } from '../src/core/social.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); ensureLife(); });

describe('compétences jusqu’au niveau 30', () => {
  it('la courbe est continue et plafonne à 30', () => {
    for (let L = 1; L <= SKILL_MAX; L++) expect(levelOfX(xpForLevel(L) + 1)).toBe(L);
    expect(levelOfX(1e12)).toBe(30);
    expect(levelOfX(xpForLevel(10) - 1)).toBe(9);
  });
});

describe('vétérans', () => {
  it('les survivants de départ sont vétérans, avec des points forts au-delà du niveau 20', () => {
    S.knights.forEach(k => {
      expect(k.vet).toBe(true);
      const strong = strongSkills(k);
      expect(strong.length).toBeGreaterThan(3);
      strong.forEach(id => expect(skillLevel(k, id)).toBeGreaterThanOrEqual(20));
      for (const id in k.sk) if (id !== 'vie') expect(skillLevel(k, id)).toBeGreaterThanOrEqual(10);
    });
  });
  it('un chevalier formé au Sanctuaire n’est pas vétéran', () => {
    const k = S.knights[0]; k.vet = false; k.origin = 'forme'; ensureLife();
    expect(k.vet).toBe(false);
  });
});

describe('cœur, ton et complexes', () => {
  it('chacun reçoit un caractère, toujours le même pour une même graine', () => {
    const a = { seed: 42, id: 1, qual: [], flaw: [] }, b = { seed: 42, id: 1, qual: [], flaw: [] };
    ensureCharacter(a); ensureCharacter(b);
    expect(a.bon).toBe(b.bon); expect(a.ton).toBe(b.ton);
    expect(a.bon).toBeGreaterThanOrEqual(-100); expect(a.bon).toBeLessThanOrEqual(100);
    S.aps.concat(S.pending).forEach(p => expect(typeof p.bon).toBe('number'));
  });
  it('une armure d’or refuse un cœur haineux ; les Gémeaux et le Cancer tolèrent davantage', () => {
    const lion = CONS.find(c => c.rank === 'or' && c.sign === 4), gem = CONS.find(c => c.rank === 'or' && c.sign === 2);
    const p = { st: { fo: 20, vi: 20, de: 20, en: 20, ps: 20, co: 20 }, sign: 4, bon: -50 };
    expect(heartBlock(p, lion)).toMatch(/refuse/);
    expect(armorAffinity(p, lion).v).toBe(0);
    expect(heartBlock({ ...p, sign: 2 }, gem)).toBeNull();
    expect(heartBlock({ ...p, sign: 2, bon: -80 }, gem)).toMatch(/refuse/);
    const bronze = CONS.find(c => c.rank === 'bronze');
    expect(heartBlock(p, bronze)).toBeNull();
    expect(armorAffinity({ ...p, bon: 100 }, bronze).v).toBeGreaterThan(armorAffinity({ ...p, bon: -100 }, bronze).v);
  });
  it('deux grands cœurs s’entendent, la douceur rassure un complexé', () => {
    const a = { id: 1, bon: 80, ton: 'tendre', qual: [], flaw: [], sign: 0 }, b = { id: 2, bon: 70, ton: 'franc', cx: { k: 'taille', lv: 1, conf: 20 }, qual: [], flaw: [], sign: 5 };
    const c = compat(a, b);
    expect(c.why.join(' ')).toMatch(/grands cœurs/);
    expect(c.why.join(' ')).toMatch(/rassure/);
  });
  it('le soutien des amis bienveillants rend confiance, jusqu’à effacer le complexe', () => {
    const [p, f] = S.knights; p.cx = { k: 'force', lv: 1, conf: 90 }; f.bon = 80;
    S.friend[p.id < f.id ? p.id + '-' + f.id : f.id + '-' + p.id] = 6;
    for (let d = 0; d < 10 && p.cx; d++) tickConfidence(24, null);
    expect(p.cx).toBeNull();
    expect(S.log[0].m).toMatch(/cessé de douter/);
  });
});
