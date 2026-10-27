// Feuilletons : épisodes espacés, affection cachée, mémoire des choix, indices, dénouements.
import { beforeEach, describe, expect, it } from 'vitest';
import { newGame, makeApprentice } from '../src/core/people.js';
import { recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';
import { ensureLife } from '../src/core/character.js';
import { ensureLove, isCouple } from '../src/core/romance.js';
import { ARCS } from '../src/core/data/arcs.js';
import { SCENES } from '../src/core/data/scenes.js';
import { arcCast, ensureArcs, newArc, readyArcs } from '../src/core/arcs.js';
import { choose, currentNode, doRoll, ensureWorld, finishScene, goTo, startArcEpisode } from '../src/core/expeditions.js';
import { isArcReq, reqOk } from '../src/core/dialogue.js';

beforeEach(() => { setS(null); newGame('facile'); recomputeCB(); ensureLife(); ensureLove(); ensureWorld(); ensureArcs(); });

// Joue un épisode jusqu'au bout ; pick(choices visibles) choisit l'indice.
function playEpisode(pick) {
  for (let g = 0; g < 60; g++) {
    const n = currentNode();
    if (n.end) return finishScene();
    if (n.choices) { const k = S.knights.find(p => p.id === S.world.active.kid); const vis = n.choices.map((c, i) => [c, i]).filter(([c]) => reqOk(c.req, k, S)); choose(pick(vis)[1]); continue; }
    if (n.roll) { doRoll(.5); continue; }
    goTo(n.next);
  }
  throw new Error('épisode sans fin');
}
function playArc(A, pick) {
  for (let e = 0; e < 10 && !A.done; e++) { S.gt = Math.max(S.gt, A.at); expect(startArcEpisode(A.id)).toBeTruthy(); playEpisode(pick); expect(S.world.active).toBe(null); }
  return A;
}

describe('distribution', () => {
  it('romance : un homme et une femme adultes, jamais un apprenti', () => {
    S.aps.push(makeApprentice());
    arcCast('etoiles').forEach(([a, b]) => { expect(a.sex).not.toBe(b.sex); expect(S.aps.includes(a) || S.aps.includes(b)).toBe(false); });
    expect(arcCast('archives').length).toBeGreaterThan(0);
  });
  it('un épisode à la fois, le suivant quelques heures plus tard', () => {
    const [a, b] = arcCast('etoiles')[0], A = newArc('etoiles', [a, b]);
    expect(readyArcs()).toContain(A);
    startArcEpisode(A.id); playEpisode(v => v[0]);
    expect(A.ep).toBe(1);
    expect(A.at).toBeGreaterThan(S.gt + 17);
    expect(startArcEpisode(A.id)).toBe(null);
  });
});

describe('chaque feuilleton se joue jusqu’au bout', () => {
  for (const key of Object.keys(ARCS)) it(key, () => {
    for (let run = 0; run < 6; run++) {
      setS(null); newGame('facile'); recomputeCB(); ensureLife(); ensureLove(); ensureWorld(); ensureArcs();
      const cast = arcCast(key); expect(cast.length).toBeGreaterThan(0);
      const A = playArc(newArc(key, cast[run % cast.length]), v => v[Math.floor(Math.random() * v.length)]);
      expect(A.done).toBe(true);
      expect(A.ep).toBe(ARCS[key].eps.length);
    }
  });
});

describe('affection cachée et mémoire', () => {
  it('une romance soignée finit en couple, une romance négligée non', () => {
    const [a, b] = arcCast('etoiles')[0];
    const good = playArc(newArc('etoiles', [a, b]), v => v[0]);
    expect(good.flags).toContain('promesse');
    expect(isCouple(a, b)).toBe(true);
    setS(null); newGame('facile'); recomputeCB(); ensureLife(); ensureLove(); ensureWorld(); ensureArcs();
    const [c, d] = arcCast('etoiles')[0];
    const bad = playArc(newArc('etoiles', [c, d]), v => v[v.length - 1]);
    expect(bad.aff).toBeLessThan(14);
    expect(isCouple(c, d)).toBe(false);
  });
  it('les choix liés à l’affection restent cachés tant qu’elle manque', () => {
    const c = SCENES.etoiles3.nodes.c.choices.find(x => x.req && x.req.aff);
    expect(isArcReq(c.req)).toBe(true);
    const [a, b] = arcCast('etoiles')[0], A = newArc('etoiles', [a, b]);
    A.ep = 2; startArcEpisode(A.id);
    expect(reqOk(c.req, a, S)).toBe(false);
    A.aff = 9; expect(reqOk(c.req, a, S)).toBe(true);
  });
  it('l’enquête réunit des indices, et la vérité dépend d’eux', () => {
    const [a, b] = arcCast('archives')[0], A = newArc('archives', [a, b]);
    playArc(A, v => v[0]);
    expect(A.clues.length).toBeGreaterThanOrEqual(2);
    expect(S.arcsDone).toContain('archives');
    expect(arcCast('archives').length).toBe(0);
  });
});
