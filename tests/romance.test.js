// Scènes de vie : amours (adultes, homme et femme), jalousie, rivalités, soutien, et cohérence des scènes écrites.
import { beforeEach, describe, expect, it } from 'vitest';
import { newGame, makeApprentice } from '../src/core/people.js';
import { recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';
import { ensureLife } from '../src/core/character.js';
import { adult, applyLifeFx, canRomance, castFor, ensureLove, isCouple, loveOf } from '../src/core/romance.js';
import { LIFE_SCENES } from '../src/core/data/lifescenes.js';
import { SCENES } from '../src/core/data/scenes.js';
import { choose, currentNode, doRoll, ensureWorld, finishScene, goTo, startHomeScene } from '../src/core/expeditions.js';
import { pickText } from '../src/core/dialogue.js';

const key = (a, b) => a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id;
beforeEach(() => { setS(null); newGame('facile'); recomputeCB(); ensureLife(); ensureLove(); ensureWorld(); });

describe('qui peut vivre une romance', () => {
  it('jamais un apprenti, toujours un homme et une femme', () => {
    const ap = makeApprentice(); S.aps.push(ap);
    const [k] = S.knights;
    expect(adult(ap)).toBe(false);
    expect(canRomance(k, ap)).toBe(false);
    const same = S.knights.find(o => o !== k && o.sex === k.sex);
    expect(canRomance(k, same)).toBe(false);
    ['attract', 'date', 'confess', 'couple', 'jealous'].forEach(n => castFor(n).forEach(c => {
      c.forEach(p => expect(S.aps.includes(p)).toBe(false));
      expect(c[0].sex).not.toBe(c[1].sex);
    }));
  });
});

describe('un aveu, puis un couple', () => {
  it('la scène d’aveu acceptée forme un couple', () => {
    const k = S.knights.find(p => p.sex === 'M'), k2 = S.knights.find(p => p.sex === 'F');
    S.love[key(k, k2)] = 7;
    S.world.home = 'aveu';
    // on force la distribution sur ces deux-là
    const all = castFor('confess'); expect(all.some(([a, b]) => a === k && b === k2)).toBe(true);
    let a = null;
    for (let i = 0; i < 200; i++) { S.world.home = 'aveu'; a = startHomeScene(); if (a.kid === k.id && a.k2 === k2.id) break; S.world.active = null; }
    expect(a.kid).toBe(k.id);
    goTo('b'); choose(0); goTo(currentNode().next);
    expect(currentNode().roll).toBeTruthy();
    // tirage réussi
    const r = Math.random; Math.random = () => 0; doRoll(a.vars.acc); Math.random = r;
    goTo(currentNode().next);
    finishScene();
    expect(isCouple(k, k2)).toBe(true);
    expect(S.log.some(l => /en couple/.test(l.m))).toBe(true);
    expect(castFor('couple').length).toBe(1);
    // en couple, plus d'attirance proposée avec d'autres
    expect(castFor('attract').some(c => c.includes(k) || c.includes(k2))).toBe(false);
  });
  it('un couple et un tiers proche : la jalousie peut naître', () => {
    const k = S.knights.find(p => p.sex === 'M'), k2 = S.knights.find(p => p.sex === 'F');
    S.couple[key(k, k2)] = 0;
    const third = S.knights.find(p => p.sex === 'M' && p !== k);
    S.friend[key(k2, third)] = 4;
    const js = castFor('jealous');
    expect(js.some(([a, b, c]) => a === k && b === k2 && c === third)).toBe(true);
  });
});

describe('effets', () => {
  it('le soutien rend confiance, le cœur bouge avec les choix', () => {
    const [k, k2] = S.knights; k2.cx = { k: 'force', lv: 1, conf: 85 }; k.bon = 10;
    const out = [];
    applyLifeFx('conf:k2:20', { k, k2 }, out);
    expect(k2.cx).toBeNull();
    applyLifeFx('bon:k:5', { k, k2 }, out);
    expect(k.bon).toBe(15);
    applyLifeFx('love:3', { k, k2 }, out);
    if (k.sex === k2.sex) expect(loveOf(k, k2)).toBe(0); else expect(loveOf(k, k2)).toBe(3);
  });
  it('le ton de l’orateur choisit sa réplique', () => {
    expect(pickText({ default: 'a', t_deconneur: 'b', drole: 'c' }, { ton: 'deconneur', qual: [{ k: 'drole', lv: 1 }] })).toBe('b');
    expect(pickText({ default: 'a', drole: 'c' }, { ton: 'deconneur', qual: [{ k: 'drole', lv: 1 }] })).toBe('c');
  });
});

describe('les scènes écrites tiennent debout', () => {
  it('chaque branche mène à une réplique existante, et chaque scène à une fin', () => {
    for (const [name, sc] of Object.entries(LIFE_SCENES)) {
      expect(SCENES[name]).toBe(sc);
      const N = sc.nodes;
      expect(N[sc.start], name).toBeTruthy();
      for (const [id, n] of Object.entries(N)) {
        const nexts = [n.next, n.roll && n.roll.ok, n.roll && n.roll.ko, ...(n.choices || []).map(c => c.go)].filter(Boolean);
        nexts.forEach(t => expect(N[t], name + '.' + id + ' → ' + t).toBeTruthy());
        expect(nexts.length > 0 || !!n.end, name + '.' + id + ' sans suite').toBe(true);
        expect(typeof n.text === 'string' || typeof n.text.default === 'string', name + '.' + id).toBe(true);
      }
      expect(sc.log).toBeTruthy();
    }
  });
});
