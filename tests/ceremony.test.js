// Cérémonie d'investiture : file d'attente, distribution des rôles, scène jouée jusqu'au bout, photo dans l'album.
import { beforeEach, describe, expect, it } from 'vitest';
import { newGame, makeApprentice } from '../src/core/people.js';
import { recomputeCB } from '../src/core/rules.js';
import { S, setS } from '../src/core/state.js';
import { ensureLife } from '../src/core/character.js';
import { ceremonyCast, closeCeremony, pendingCeremonies, photosOf } from '../src/core/ceremony.js';
import { promoteApprentice } from '../src/core/trial.js';
import { CONS } from '../src/core/data/world.js';
import { choose, currentNode, ensureWorld, finishScene, goTo, startCeremony } from '../src/core/expeditions.js';
import { reqOk } from '../src/core/dialogue.js';

beforeEach(() => { setS(null); newGame(); recomputeCB(); ensureLife(); ensureWorld(); });

function win(withMaster) {
  const ap = makeApprentice(); S.aps.push(ap);
  const master = S.knights[0]; if (withMaster) ap.master = master.id;
  const fr = S.knights[1]; S.friend[ap.id < fr.id ? ap.id + '-' + fr.id : fr.id + '-' + ap.id] = 5;
  S.knights[2].role = 'pope';
  const c = CONS.find(x => x.rank === 'bronze' && !S.knights.some(k => k.cons === x.k));
  return { kn: promoteApprentice(ap, c, []), master, fr, c };
}
function play() {
  for (let g = 0; g < 40; g++) {
    const n = currentNode(); if (n.end) return;
    if (n.choices) { const k = S.knights.find(p => p.id === S.world.active.kid); const i = n.choices.findIndex(c => reqOk(c.req, k, S)); choose(i); continue; }
    goTo(n.next);
  }
  throw new Error('scène sans fin');
}

describe('investiture', () => {
  it('gagner une armure prépare une cérémonie avec le Pope, le maître et un ami', () => {
    const { kn, master, fr } = win(true);
    const c = pendingCeremonies().find(x => x.kid === kn.id); expect(c).toBeTruthy();
    const cast = ceremonyCast(c);
    expect(cast.master).toBe(master); expect(cast.pope.role).toBe('pope'); expect(cast.friends[0]).toBe(fr);
    expect(startCeremony(c)).toBeTruthy();
    play();
    expect(S.world.active.vars.hasMaster).toBe(true);
    finishScene();
    const ph = closeCeremony(c, cast);
    expect(photosOf(kn.id)).toContain(ph);
    expect(ph.names).toContain(master.name);
    expect(pendingCeremonies().some(x => x.kid === kn.id)).toBe(false);
  });
  it('sans maître, la scène passe sans lui, et ses répliques restent cachées', () => {
    const { kn } = win(false);
    const c = pendingCeremonies().find(x => x.kid === kn.id);
    startCeremony(c);
    let sawMaster = false;
    for (let g = 0; g < 40; g++) { const n = currentNode(); if (n.who === 'k2') sawMaster = true; if (n.end) break;
      if (n.choices) { const k = S.knights.find(p => p.id === kn.id); expect(reqOk(n.choices[0].req, k, S)).toBe(false); choose(n.choices.findIndex(x => reqOk(x.req, k, S))); continue; } goTo(n.next); }
    expect(sawMaster).toBe(false);
  });
});
