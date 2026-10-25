// Sauvegardes nommées et protection de la partie.
import { beforeEach, describe, expect, it } from 'vitest';
const mem = {};
globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
const { deleteSlot, keepUnreadable, listSlots, saveSlot, slotGame, snapshotOnUpdate } = await import('../src/core/slots.js');
const { newGame } = await import('../src/core/people.js');
const { recomputeCB } = await import('../src/core/rules.js');
const st = await import('../src/core/state.js');
const { KEY, setS } = st;

beforeEach(() => { for (const k in mem) delete mem[k]; setS(null); newGame(); recomputeCB(); });

describe('sauvegardes nommées', () => {
  it('on sauvegarde sous un nom, on recharge la partie telle qu’elle était', () => {
    st.S.res.vivres = 1234;
    const e = saveSlot('Avant Pégase');
    expect(e.name).toBe('Avant Pégase');
    st.S.res.vivres = 1;
    const o = slotGame(e.id);
    expect(o.res.vivres).toBe(1234);
    deleteSlot(e.id);
    expect(listSlots()).toHaveLength(0);
  });
  it('une sauvegarde automatique avant chaque mise à jour, les 3 dernières gardées', () => {
    snapshotOnUpdate('v1');
    expect(listSlots()).toHaveLength(0);
    ['v2', 'v3', 'v4', 'v5'].forEach(v => snapshotOnUpdate(v));
    const autos = listSlots().filter(x => x.auto);
    expect(autos).toHaveLength(3);
    expect(autos[0].name).toMatch(/v5/);
  });
  it('une partie illisible est mise de côté, pas écrasée', () => {
    mem[KEY] = '{abîmé';
    expect(keepUnreadable()).toBe(true);
    expect(Object.keys(mem).some(k => k.startsWith(KEY + '-illisible-'))).toBe(true);
  });
});
