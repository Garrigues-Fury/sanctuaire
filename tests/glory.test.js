// Moments de gloire : une carte par personnage qui regroupe ses exploits, une carte par bâtiment terminé.
import { beforeEach, describe, expect, it } from 'vitest';
import { newGame } from '../src/core/people.js';
import { levelUpKnight, recomputeCB, step } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';
import { ensureLife } from '../src/core/character.js';
import { clearGlory, gloryNote, gloryQueue } from '../src/core/glory.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); ensureLife(); clearGlory(); });

describe('exploits', () => {
  it('plusieurs niveaux et une découverte font une seule carte', () => {
    const k = S.knights[0], lv = k.lv;
    k.xp = 1e9; levelUpKnight(k); levelUpKnight(k);
    gloryNote(k, 'skill', 'Télékinésie'); gloryNote(k, 'skill', 'Télékinésie');
    const G = gloryQueue();
    expect(G.length).toBe(1);
    expect(G[0].lv0).toBe(lv); expect(G[0].lv).toBe(lv + 2);
    expect(G[0].ev).toEqual([{ t: 'skill', v: 'Télékinésie' }]);
  });
  it('un bâtiment terminé a sa carte, avec son niveau d’avant', () => {
    S.jobs.push({ b: 'dortoirs', start: S.gt, end: S.gt + .01, lvl: (S.b.dortoirs || 0) + 1 });
    step(.02, null);
    const c = gloryQueue().find(x => x.k === 'b');
    expect(c.b).toBe('dortoirs'); expect(c.lvl).toBe(c.lvl0 + 1);
  });
  it('la file ne grossit pas sans fin', () => {
    for (let i = 0; i < 80; i++) gloryNote({ id: 1000 + i, lv: 3 }, 'lv');
    expect(gloryQueue().length).toBeLessThanOrEqual(40);
  });
});
