// Générateur de personnages : il dessine tout le monde sans erreur, et toujours pareil pour un même personnage.
import { describe, expect, it } from 'vitest';
import { layersOf, specOf, svgBust, svgFull } from '../src/art/character.js';
import { svgBeast } from '../src/art/beast.js';
import { NATS } from '../src/core/data/countries.js';
import { CONS } from '../src/core/data/world.js';

const nats = Object.keys(NATS);
const FACTIONS = ['bandits', 'ares', 'eris', 'artemis', 'hermes', 'dionysos'];

describe('générateur de personnages', () => {
  it('dessine 300 personnages variés sans valeur cassée', () => {
    for (let i = 0; i < 300; i++) {
      const c = CONS[i % CONS.length], kind = i % 5;
      const p = { seed: 1000 + i * 7919, sex: i % 2 ? 'F' : 'M', nat: nats[i % nats.length], sign: c.sign ?? i % 12, cons: c.k, age: kind === 1 ? 8 + (i % 9) : null };
      const opt = kind === 0 ? { rank: c.rank } : kind === 1 ? { child: true } : kind === 2 ? { faction: FACTIONS[i % 6], boss: i % 7 === 0 } : kind === 3 ? { elder: true } : {};
      const s = specOf(p, opt);
      const full = svgFull(s), bust = svgBust(s);
      expect(full).not.toMatch(/NaN|undefined/);
      expect(bust).not.toMatch(/NaN|undefined/);
      expect(full.startsWith('<svg')).toBe(true);
    }
  });
  it('un même personnage est toujours dessiné à l’identique', () => {
    const p = { seed: 42, sex: 'F', nat: 'Grèce', sign: 4, cons: 'or-4' };
    expect(svgFull(specOf(p, { rank: 'or' }))).toBe(svgFull(specOf(p, { rank: 'or' })));
  });
  it('les apprentis ont une silhouette d’enfant et une tenue sobre', () => {
    const s = specOf({ seed: 7, sex: 'F', nat: 'France', sign: 1, age: 12 }, { child: true });
    expect(s.outfit).toBe('apprentice');
    expect(layersOf(s).body).toMatch(/scale\(\.82 \.7\)/);
  });
  it('les bêtes se dessinent aussi', () => {
    for (const k of ['loup', 'sanglier', 'chimere']) expect(svgBeast(k, 3, { boss: true })).not.toMatch(/NaN|undefined/);
  });
});
