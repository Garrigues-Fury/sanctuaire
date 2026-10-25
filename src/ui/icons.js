/* Icônes vectorielles du jeu (dessinées pour le projet, trait de 1,8 sur une grille de 24).
   Une seule famille d'icônes, au trait, qui prend la couleur du texte. */
const P={
 temple:'M3 9 12 4l9 5M4 9h16M6 9v9M10 9v9M14 9v9M18 9v9M3 20h18',
 users:'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16.5 11a3 3 0 1 0 0-6M21 20c0-2.6-1.7-4.8-4-5.6',
 shield:'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6Z',
 armor:'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6ZM9 10h6M12 7v9',
 globe:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
 star:'m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4l-5.3 3 1.2-6-4.5-4.1 6-.7Z',
 gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1',
 sound:'M4 9h4l5-4v14l-5-4H4ZM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
 mute:'M4 9h4l5-4v14l-5-4H4ZM17 9l5 5M22 9l-5 5',
 hammer:'M14 4l6 6-3 3-6-6ZM11 7 3 15l3 3 8-8',
 scroll:'M7 4h11a2 2 0 0 1 2 2v1h-4M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M9 9h6M9 13h6M9 17h4',
 heart:'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
 cap:'M2 9l10-5 10 5-10 5ZM6 11v5c3 2 9 2 12 0v-5M22 9v6',
 sword:'M14 4h6v6L9 21l-3-3ZM5 14l5 5M3 21l3-3',
 wheat:'M12 21V8M12 8c-3 0-4-2-4-4 3 0 4 2 4 4ZM12 8c3 0 4-2 4-4-3 0-4 2-4 4ZM12 13c-3 0-4-2-4-4 3 0 4 2 4 4ZM12 13c3 0 4-2 4-4-3 0-4 2-4 4ZM12 18c-3 0-4-2-4-4 3 0 4 2 4 4ZM12 18c3 0 4-2 4-4-3 0-4 2-4 4Z',
 block:'M4 8l8-4 8 4v8l-8 4-8-4ZM4 8l8 4 8-4M12 12v8',
 ingot:'M3 17l3-8h12l3 8ZM6 9l2-3h8l2 3',
 book:'M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2ZM4 20a2 2 0 0 0 2 2h13v-4',
 bolt:'M13 2 4 14h7l-1 8 9-12h-7Z',
 check:'M5 12l5 5L20 7',
 alert:'M12 3 2 20h20ZM12 10v4M12 17v.5',
 clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 3',
 chevron:'M9 6l6 6-6 6',
 crown:'M3 8l4 4 5-7 5 7 4-4-2 11H5ZM5 19h14',
 flame:'M12 21c-4 0-7-3-7-7 0-4 4-6 4-10 3 2 4 4 4 6 1-1 2-2 2-4 2 2 4 5 4 8 0 4-3 7-7 7Z',
 eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
 leaf:'M5 19C5 10 10 5 20 4c-1 10-6 15-15 15ZM5 19l7-7',
 coin:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v10M9 9.5c0-1.4 1.3-2 3-2s3 .8 3 2-1.3 1.8-3 2-3 .8-3 2 1.3 2 3 2 3-.6 3-2',
 plus:'M12 5v14M5 12h14',
 map:'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2ZM9 4v14M15 6v14'
};
export function icon(name,size=20,cls=''){
 return '<svg class="ico '+cls+'" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(P[name]||P.star)+'"/></svg>';
}
// Icône de chaque ressource.
export const RES_ICON={vivres:'wheat',marbre:'block',metal:'ingot',savoir:'book'};
