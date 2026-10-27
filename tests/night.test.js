import { describe, expect, it } from 'vitest';
import { autoOf, runNight, tickAuto } from '../src/core/autotrain.js';
import { makeApprentice, newGame, renameDuplicates } from '../src/core/people.js';
import { recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

describe('noms', () => {
  it('jamais deux fois le même prénom au Sanctuaire', () => {
    setS(null); newGame('facile'); recomputeCB();
    for (let i = 0; i < 150; i++) S.pending.push(makeApprentice('Grèce'));
    const all = [].concat(S.knights, S.aps, S.pending, S.workers).map(p => p.name);
    expect(new Set(all).size).toBe(all.length);
  });
  it('les doublons des anciennes parties sont renommés', () => {
    setS(null); newGame('moyen'); recomputeCB();
    S.pending[1].name = S.pending[0].name;
    const out = renameDuplicates();
    expect(out.length).toBe(1);
    expect(S.pending[1].name).not.toBe(S.pending[0].name);
  });
});

describe('entraînement de la nuit', () => {
  it('l’énergie restante est dépensée, sauf la réserve', () => {
    setS(null); newGame('moyen'); recomputeCB();
    const [a, b] = S.knights; a.nrg = 100; b.nrg = 100;
    autoOf(a).partners = [b.id]; autoOf(b).keep = 30;
    runNight(null);
    expect(a.nrg).toBeLessThan(25);
    expect(b.nrg).toBeGreaterThanOrEqual(30);
  });
  it('désactivé : rien ne bouge', () => {
    setS(null); newGame('moyen'); recomputeCB();
    S.knights.forEach(k => { k.nrg = 100; autoOf(k).on = false; });
    runNight(null);
    S.knights.forEach(k => expect(k.nrg).toBe(100));
  });
  it('une fois par nuit, même après plusieurs jours d’absence', () => {
    setS(null); newGame('moyen'); recomputeCB(); S.speed = 60;
    tickAuto(null); const first = S.autoAt;
    S.gt = first + 24 * 3 + 1; tickAuto(null);
    expect(S.autoAt).toBe(first + 24 * 4);
  });
});
