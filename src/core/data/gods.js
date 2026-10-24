/* Les dieux et les tables du duel des astres. */

export const GODS={
 ares:{n:'Arès',aff:['feu','terre'],d:'Le dieu de la guerre brutale. Ses berserkers rêvent de piller le Sanctuaire.'},
 eris:{n:'Éris',aff:['air','feu'],d:'La déesse de la discorde sème la zizanie entre les chevaliers.'},
 apollon:{n:'Apollon',aff:['feu','air'],d:'Le dieu solaire juge les hommes indignes et veut les purifier.'},
 artemis:{n:'Artémis',aff:['air','eau'],d:'La chasseresse et ses satellites obéissent à son frère.'},
 hephaistos:{n:'Héphaïstos',aff:['feu','terre'],d:'Le forgeron des dieux convoite le secret des armures.'},
 hermes:{n:'Hermès',aff:['air','eau'],d:'Le messager rusé espionne le Sanctuaire pour l’Olympe.'},
 dionysos:{n:'Dionysos',aff:['eau','terre'],d:'Le dieu de l’ivresse attire les hommes loin de leur devoir.'},
 demeter:{n:'Déméter',aff:['terre','eau'],d:'La moissonneuse peut affamer le Sanctuaire d’un geste.'}
};
export const GOD_KEYS=Object.keys(GODS);
export const DUEL_WIN=15,DUEL_TURNS=12,AI_MAX=3;
export const NAMES_EL={
 feu:['Braise sacrée','Forge céleste','Flamme d’Hestia','Brasier du Lion','Torche d’Éleusis','Étincelle d’or','Volcan de Lemnos','Fournaise','Comète ardente','Autel de feu','Soleil couchant','Lame rougeoyante'],
 eau:['Source sacrée','Marée d’argent','Pluie d’étoiles','Rosée de l’aube','Fleuve Alphée','Perle d’Égée','Brume du cap','Coquillage nacré','Lac gelé','Vague de fond','Fontaine bénie','Larme d’Écho'],
 air:['Vent du Parnasse','Souffle d’Éole','Nuée d’orage','Chant des cigales','Aile de faucon','Rouleau ancien','Étoile du berger','Murmure des oracles','Brise de Délos','Plume blanche','Éclair lointain','Ciel d’Attique'],
 terre:['Pierre de serment','Colonne du temple','Racine d’olivier','Marbre blanc','Bouclier de chêne','Montagne sacrée','Fondations cyclopéennes','Statue votive','Grenier de Rodorio','Rempart d’airain','Grotte des ermites','Seuil de granit']
};
export const EFFPOOL={feu:[['P_metal',1],['FORGE',1.5],['TRIAL',.4],['XP',.5]],eau:[['P_vivres',1],['NRG',1],['P_herbes',2],['FP',3]],air:[['P_savoir',1],['RECRUIT',2],['XP',.5],['CRAFT',1.5]],terre:[['P_marbre',1],['BUILD',.8],['CAP',1.5],['DEF',2]]};
export const EFFBASE={1:3,2:5,3:9};
export const BOOST={feu:{res:'metal',q:60},terre:{res:'marbre',q:90},eau:{res:'vivres',q:120},air:{res:'savoir',q:25}};
