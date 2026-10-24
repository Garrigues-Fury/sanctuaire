// Caractères, affinités, vie entre personnages, entraînements.
import { beforeEach, describe, expect, it } from 'vitest';
import { FLAW, QUAL, traitText } from '../src/core/data/traits.js';
import { autoResolve, heroStats, newBattle } from '../src/core/combat.js';
import { compat, compatLabel, tickSocial } from '../src/core/social.js';
import { TRAININGS, canTrain, train } from '../src/core/training.js';
import { newGame } from '../src/core/people.js';
import { recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); });
const P = (o) => Object.assign({ id: Math.random(), name: 'X', nat: 'Grèce', sign: 0, qual: [], flaw: [], bio: [], st: { fo: 20, vi: 20, en: 20, co: 20 }, lv: 10, rank: 'bronze', tech: ['Éclat'], origin: 'forme' }, o);

describe('qualités et défauts', () => {
  it('chaque trait décrit ses effets au Sanctuaire, en combat et avec les autres', () => {
    [...Object.keys(QUAL).map(k => [k, false]), ...Object.keys(FLAW).map(k => [k, true])].forEach(([k, f]) => {
      const t = traitText(k, 2, f);
      expect(t).toMatch(/Au Sanctuaire : .+\nEn combat : .+\nAvec les autres : .+/);
    });
    expect(QUAL.drole).toBeTruthy();
  });
  it('les effets de combat changent vraiment les caractéristiques', () => {
    const base = heroStats(P({}));
    expect(heroStats(P({ flaw: [{ k: 'fragile', lv: 2 }] })).max).toBeLessThan(base.max);
    expect(heroStats(P({ qual: [{ k: 'loyal', lv: 2 }] })).def).toBeGreaterThan(base.def);
    const b = newBattle(P({ qual: [{ k: 'patient', lv: 2 }] }), { foe: 'bandits', L: 1, n: 1 }, {}, 3);
    expect(b.hero.cos).toBe(4);
  });
  it('un drôle déstabilise parfois l’ennemi', () => {
    let taunts = 0;
    for (let s = 1; s < 40; s++) { const b = autoResolve(newBattle(P({ qual: [{ k: 'drole', lv: 3 }] }), { foe: 'bandits', L: 2, n: 2 }, {}, s)); taunts += b.log.filter(l => /remarque/.test(l.m)).length; }
    expect(taunts).toBeGreaterThan(0);
  });
});

describe('affinités', () => {
  it('humour partagé, même pays, même histoire rapprochent', () => {
    const a = P({ qual: [{ k: 'drole', lv: 1 }], bio: ['A grandi seule dans les rues'] }), b = P({ qual: [{ k: 'drole', lv: 1 }], bio: ['de parents inconnus'] });
    const c = compat(a, b);
    expect(c.v).toBeGreaterThanOrEqual(3);
    expect(c.why.join(' ')).toMatch(/humour/);
    expect(c.why.join(' ')).toMatch(/originaires/);
    expect(c.why.join(' ')).toMatch(/sans famille/);
    expect(compatLabel(c.v)).toBe('Complicité');
  });
  it('deux arrogants se heurtent', () => {
    const a = P({ nat: 'Japon', flaw: [{ k: 'arrogant', lv: 1 }], sign: 1 }), b = P({ nat: 'Brésil', flaw: [{ k: 'arrogant', lv: 1 }], sign: 5 });
    expect(compat(a, b).v).toBeLessThan(0);
  });
  it('la vie suit son cours : des amitiés évoluent seules avec les jours', () => {
    S.knights.forEach((k, i) => { k.nat = 'Grèce'; k.qual = [{ k: 'drole', lv: 2 }]; k.sign = 0; });
    const before = JSON.stringify(S.friend), logs = S.log.length;
    for (let d = 0; d < 20; d++) tickSocial(24, null);
    expect(JSON.stringify(S.friend)).not.toBe(before);
    expect(S.log.length).toBeGreaterThan(logs);
  });
});

describe('entraînements', () => {
  it('tout le monde peut s’entraîner, surtout à l’énergie', () => {
    const k = S.knights[0]; k.nrg = 100; const fo = k.st.fo;
    expect(train(k, 'fo')).toMatch(/force/);
    expect(k.st.fo).toBe(fo + (k.flaw.some(f => f.k === 'distrait') ? k.st.fo - fo : 1));
    expect(k.nrg).toBe(75);
    const energyOnly = TRAININGS.filter(t => !t.item && !t.savoir).length;
    expect(energyOnly).toBeGreaterThanOrEqual(5);
  });
  it('les séances avec objet demandent l’objet fabriqué', () => {
    const k = S.knights[1]; k.nrg = 100; S.items.materiel = 0;
    expect(canTrain(k, TRAININGS.find(t => t.k === 'leste'))).toBe(false);
    S.items.materiel = 1;
    expect(canTrain(k, TRAININGS.find(t => t.k === 'leste'))).toBe(true);
  });
});
