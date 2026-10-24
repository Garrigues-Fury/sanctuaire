// Expéditions : alertes, scènes jouables de bout en bout, récompenses.
import { beforeEach, describe, expect, it } from 'vitest';
import { SCENES } from '../src/core/data/scenes.js';
import { autoResolve } from '../src/core/combat.js';
import { pickText } from '../src/core/dialogue.js';
import { EXP_E, beginFight, choose, currentNode, doRoll, endFight, ensureWorld, finishScene, spawn, startExpedition, startHomeScene } from '../src/core/expeditions.js';
import { newGame } from '../src/core/people.js';
import { advance, recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); });

// Joue une scène jusqu'au bout en prenant toujours le premier choix possible.
function playThrough() {
  let g = 0;
  while (g++ < 60) {
    const n = currentNode();
    if (n.end) return finishScene();
    if (n.fight) { const b = beginFight(); autoResolve(b); endFight(); continue; }
    if (n.roll) { doRoll(.5); continue; }
    if (n.choices) { choose(0); continue; }
    const a = S.world.active; a.node = n.next; continue;
  }
  throw new Error('scène sans fin');
}

describe('expéditions', () => {
  it('le monde commence avec deux alertes', () => {
    const W = ensureWorld();
    expect(W.events.map(e => e.type).sort()).toEqual(['attack', 'recruit']);
  });
  it('les alertes apparaissent avec le temps, 4 au plus, et expirent', () => {
    ensureWorld(); advance(60, null);
    expect(S.world.events.length).toBeGreaterThan(2);
    expect(S.world.events.length).toBeLessThanOrEqual(4);
    S.world.events.forEach(e => expect(e.until).toBeGreaterThan(S.gt));
  });
  it('partir coûte de l’énergie, et chaque scène se joue jusqu’au bout', () => {
    ensureWorld();
    for (const key of Object.keys(SCENES).filter(k => SCENES[k].kind !== 'home')) {
      S.world.events = []; S.world.active = null;
      const ev = spawn(SCENES[key].kind === 'attack' ? 'attack' : 'recruit'); ev.scene = key;
      const k = S.knights[0]; k.nrg = 100;
      expect(startExpedition(ev.id, k.id)).not.toBe(null);
      expect(k.nrg).toBe(100 - EXP_E);
      const out = playThrough();
      expect(Array.isArray(out)).toBe(true);
      expect(S.world.active).toBe(null);
    }
  });
  it('refuse un chevalier épuisé', () => {
    const ev = ensureWorld().events[0]; const k = S.knights[0]; k.nrg = 10;
    expect(startExpedition(ev.id, k.id)).toBe(null);
  });
  it('les scènes au Sanctuaire se jouent aussi', () => {
    ensureWorld();
    for (const key of Object.keys(SCENES).filter(k => SCENES[k].kind === 'home')) {
      S.world.active = null; S.world.home = key;
      if (key === 'astres') S.knights[0].role = 'pope';
      if (key === 'doute') S.aps.push(S.pending.shift());
      expect(startHomeScene()).not.toBe(null);
      playThrough();
    }
  });
  it('chaque nœud mène quelque part', () => {
    for (const [key, sc] of Object.entries(SCENES)) for (const [id, n] of Object.entries(sc.nodes)) {
      const targets = [n.next, n.roll && n.roll.ok, n.roll && n.roll.ko, n.fight && n.fight.win, n.fight && n.fight.lose, ...(n.choices || []).map(c => c.go)].filter(Boolean);
      targets.forEach(t => expect(sc.nodes[t], key + '.' + id + ' → ' + t).toBeTruthy());
      expect(!!(n.end || targets.length), key + '.' + id).toBe(true);
    }
  });
  it('le texte suit le caractère du chevalier', () => {
    const t = { default: 'A', arrogant: 'B', loyal: 'C' };
    expect(pickText(t, { qual: [{ k: 'loyal' }], flaw: [] })).toBe('C');
    expect(pickText(t, { qual: [], flaw: [{ k: 'arrogant' }] })).toBe('B');
    expect(pickText(t, { qual: [], flaw: [] })).toBe('A');
  });
});
