/* Les scènes écrites. Variables : {k} le chevalier, {e} accord féminin du chevalier (« prêt{e} »), {il} il/elle,
   {v} le village, {pays}, {chef} le chef ennemi, {foes} la faction, {dieu}, {line} une réplique de la faction,
   {enfant} l'enfant, {e2} et {il2} ses accords, {age}, {ap} un apprenti, {k2} un second chevalier, {pope}, {lieu}.
   Orateurs : narr (récit), k (le chevalier), ancien, parent, enfant, chef, rival, ap, k2, pope, villageois.
   Les textes en objet varient selon le caractère : clé = qualité ou défaut (arrogant, loyal, fougueux…). */

export const SCENES={

/* ---------------- attaques de villages ---------------- */
defi:{kind:'attack',start:'a',nodes:{
 a:{who:'narr',text:'Des fumées montent au-dessus de {v}. Les cris des villageois résonnent jusque dans la vallée.',next:'b'},
 b:{who:'ancien',text:'Un chevalier d’Athéna… ? Les vieilles légendes disaient vrai ! Ils sont près des greniers, je vous en supplie !',next:'c'},
 c:{who:'chef',text:'{line}',next:'d'},
 d:{who:'k',text:{default:'Laissez ces gens tranquilles. C’est à moi que vous aurez affaire.',arrogant:'Vous êtes combien ? Dix ? Ça me fera à peine un échauffement.',loyal:'Au nom d’Athéna, je vous ordonne de quitter ce village.',fougueux:'Enfin un peu d’action ! J’attendais ça depuis des semaines !',peureux:'(Mes mains tremblent… mais ils comptent sur moi.) Reculez !',sociable:'On peut régler ça sans casser de vaisselle, non ?',patient:'Il est encore temps de partir. Après, il sera trop tard.',colerique:'Vous avez cinq secondes pour disparaître. Quatre.'},choices:[
  {t:'« Je te défie en combat singulier. »',go:'duel'},
  {t:'Protéger d’abord les villageois.',go:'mass',fx:['bonus']},
  {t:'« Partez, et personne ne sera blessé. »',req:{qual:'sociable|loyal|patient'},go:'talk'},
  {t:'Foncer dans le tas !',req:{qual:'fougueux|courageux'},go:'charge'}]},
 duel:{who:'chef',text:'Un duel ? Tu as du cran. On verra si tu as aussi du talent.',fight:{mods:{duel:true},win:'w',lose:'l'}},
 mass:{who:'narr',text:'{k} se place entre les pillards et les maisons. Personne ne passera.',fight:{mods:{},win:'w',lose:'l'}},
 charge:{who:'narr',text:'Avant même que le chef ait fini sa phrase, {k} est déjà au milieu d’eux, le cosmos en feu.',fight:{mods:{first:true},win:'w',lose:'l'}},
 talk:{who:'narr',text:'Un long silence. Le chef dévisage {k}… et ses hommes reculent d’un pas.',roll:{stat:'co',scale:110,ok:'peace',ko:'talkko'}},
 peace:{who:'chef',text:'Ton regard… On ne se bat pas contre ça. On s’en va. Mais on se reverra.',end:'peace'},
 talkko:{who:'chef',text:'Ha ! De belles paroles. Les miennes sont en acier.',fight:{mods:{easy:true},win:'w',lose:'l'}},
 w:{who:'ancien',text:'Ils fuient ! Ils fuient ! Que les dieux vous bénissent, {k} !',roll:{p:.35,ok:'child',ko:'wend'}},
 child:{who:'enfant',text:'Attendez ! Je vous ai vu{e} vous battre ! Apprenez-moi ! Je veux devenir comme vous !',choices:[
  {t:'« Viens. Le Sanctuaire t’attend. »',go:'wrecruit'},{t:'« Grandis encore un peu. Je reviendrai. »',go:'wend'}]},
 wrecruit:{who:'narr',text:'{enfant} serre son baluchon contre {lui2} et emboîte le pas de {k}, les yeux brillants.',end:'win',fx:['recruit']},
 wend:{who:'narr',text:'Le soir, tout {v} chante autour d’un grand feu. On parlera longtemps du passage de {k}.',end:'win'},
 l:{who:'narr',text:'Blessé{e}, {k} doit battre en retraite. Les pillards emportent le grain… mais les villageois sont saufs.',end:'lose'}
}},

deserteurs:{kind:'attack',start:'a',nodes:{
 a:{who:'narr',text:'À l’entrée de {v}, une bande d’hommes et de femmes amaigris menace les paysans… avec des fourches rouillées.',next:'b'},
 b:{who:'chef',text:'On ne veut tuer personne. On a faim, c’est tout. Trois jours qu’on n’a rien mangé.',next:'c'},
 c:{who:'k',text:{default:'Je vois. Mais ce village n’a pas plus que vous.',arrogant:'Et vous pensiez que menacer des paysans allait vous remplir l’estomac ?',sociable:'Posez ces fourches, on va trouver une solution.',gourmand:'Trois jours sans manger ? Rien que d’y penser, j’ai mal pour vous.'},choices:[
  {t:'« Faim ou pas, vous partez. »',go:'fight'},
  {t:'Partager les vivres du Sanctuaire (60 vivres).',req:{res:['vivres',60]},go:'share',fx:['pay:vivres:60']},
  {t:'« Des mendiants. Pathétique. »',req:{flaw:'arrogant|colerique'},go:'insult'}]},
 fight:{who:'narr',text:'Les déserteurs serrent leurs fourches. La faim rend courageux.',fight:{mods:{easy:true},win:'w',lose:'l'}},
 insult:{who:'chef',text:'Pathétique ? PATHÉTIQUE ? Les gars… on va lui montrer ce que valent des mendiants.',fight:{mods:{hard:true},win:'w',lose:'l'}},
 share:{who:'chef',text:'… Personne ne nous avait jamais tendu la main. Dis, ton Sanctuaire, il a besoin de bras ?',choices:[
  {t:'« Il y a toujours des pierres à porter. Venez. »',go:'join'},{t:'« Rentrez chez vous. Et ne volez plus. »',go:'go'}]},
 join:{who:'narr',text:'Le lendemain, trois nouveaux visages montent l’escalier du Sanctuaire, une pioche sur l’épaule.',end:'peace',fx:['worker','faveur:1']},
 go:{who:'narr',text:'Ils repartent, le ventre plein. L’un d’eux se retourne et lève la main pour saluer.',end:'peace',fx:['faveur:1']},
 w:{who:'ancien',text:'Merci… même si, au fond, ils me faisaient un peu pitié.',end:'win'},
 l:{who:'narr',text:'Incroyable : {k} a été mis{e} en déroute par des fourches. On en rira longtemps au Sanctuaire.',end:'lose'}
}},

champion:{kind:'attack',god:true,start:'a',nodes:{
 a:{who:'narr',text:'L’air se fige. Les oiseaux se taisent. Au-dessus de {v}, le ciel prend une teinte de cuivre.',next:'b'},
 b:{who:'chef',text:'Ainsi, Athéna envoie ses chiens. {dieu} te salue, {k}. {Ild} m’a demandé de lui rapporter ton casque.',next:'c'},
 c:{who:'k',text:{default:'Dis à {dieu} qu’{ild} devra venir le chercher {luid}-même.',arrogant:'Mon casque ? Prends plutôt un autographe, ça voyage mieux.',loyal:'Tant qu’il me restera un souffle, aucun dieu ne touchera à ces gens.',peureux:'(Un champion divin… pourquoi moi ?) … Approche, si tu l’oses.',reveur:'Les étoiles m’avaient prévenu{e} de ta venue.'},choices:[
  {t:'Faire face.',go:'fight'},
  {t:'Faire brûler son cosmos dès le premier instant.',req:{stat:['co',35]},go:'burn'}]},
 fight:{who:'narr',text:'Le sol tremble sous les pas du champion de {dieu}.',fight:{mods:{},win:'w',lose:'l'}},
 burn:{who:'narr',text:'Une colonne de lumière dorée s’élève de {k}. Le champion recule, surpris.',fight:{mods:{first:true},win:'w',lose:'l'}},
 w:{who:'chef',text:'Ce n’est… que partie remise. {dieu} se souviendra de ton nom.',end:'win',fx:['weaken','faveur:2']},
 l:{who:'chef',text:'Rentre à ton Sanctuaire, petit chevalier. Et dis-leur que {dieu} arrive.',end:'lose'}
}},

banquet:{kind:'attack',start:'a',nodes:{
 a:{who:'narr',text:'{k} arrive à {v} prêt{e} au combat… et tombe nez à nez avec un banquet.',next:'b'},
 b:{who:'ancien',text:'Les pillards ? Là-bas, sous l’olivier. Ils ont trouvé nos amphores de vin. Ils ronflent depuis ce matin.',next:'c'},
 c:{who:'k',text:{default:'… Bon. Ça simplifie les choses.',fougueux:'Quoi ? Mais je m’étais préparé{e} toute la route !',gourmand:'Ça sent drôlement bon, ici…'},choices:[
  {t:'Les réveiller poliment avant de les combattre.',go:'wake'},
  {t:'Les ligoter pendant qu’ils dorment.',go:'tie'},
  {t:'Goûter d’abord au banquet.',req:{flaw:'gourmand'},go:'eat'}]},
 wake:{who:'chef',text:'Hein ? Quoi ? Qui ose… Aïe, ma tête…',fight:{mods:{easy:true},win:'w',lose:'l'}},
 tie:{who:'narr',text:'{k} s’approche sur la pointe des pieds, une corde à la main…',roll:{stat:'vi',scale:90,ok:'tied',ko:'oops'}},
 tied:{who:'narr',text:'Quand ils se réveillent, ils sont ficelés comme des saucissons. Le village entier éclate de rire.',end:'win',fx:['bonus']},
 oops:{who:'chef',text:'Tiens… On essaie de m’attacher ? Debout, les gars !',fight:{mods:{},win:'w',lose:'l'}},
 eat:{who:'narr',text:'Trois galettes, deux poulets et une jarre de miel plus tard, {k} se sent capable de soulever une montagne.',fx:['nrg:+30'],fight:{mods:{first:true},win:'w',lose:'l'}},
 w:{who:'ancien',text:'Restez donc pour la fête ! Il reste plein de vin… enfin, il en restait.',end:'win'},
 l:{who:'narr',text:'Même ivres, ils étaient trop nombreux. {k} rentre au Sanctuaire, vexé{e}.',end:'lose'}
}},

/* ---------------- recrutements ---------------- */
charrette:{kind:'recruit',start:'a',nodes:{
 a:{who:'narr',text:'À {v}, on ne parle que de {enfant} : à {age} ans, {il2} a sorti une charrette de la boue à mains nues.',next:'b'},
 b:{who:'parent',text:'Vous venez pour {enfant}, c’est ça ? Pas question qu’on me l’emmène pour en faire un soldat.',next:'c'},
 c:{who:'k',text:{default:'Je ne viens pas faire un soldat. Je viens chercher un chevalier.',arrogant:'Votre enfant a un don. Le gâcher ici serait un crime.',sociable:'Je comprends. Et si on en parlait autour d’un repas ?',timide:'Je… je voulais juste le rencontrer.'},choices:[
  {t:'Raconter le Sanctuaire : ses jardins, ses bibliothèques, les amis qu’on s’y fait.',req:{qual:'sociable|loyal'},go:'yes'},
  {t:'Montrer un peu de son cosmos.',req:{stat:['co',25]},go:'cosmos'},
  {t:'« Je vous écrirai chaque mois. Promis. »',go:'promise'},
  {t:'« C’est votre choix. Je le respecte. »',go:'respect'}]},
 cosmos:{who:'narr',text:'Une douce lumière dorée envahit la maison. Les bols tintent sur la table.',next:'cosmos2'},
 cosmos2:{who:'enfant',text:'Moi aussi ! Moi aussi je sens ça, quand je me mets en colère ! Ça fait chaud, là !',next:'yes'},
 promise:{who:'parent',text:'Chaque mois ? Vraiment ?',roll:{p:.55,ok:'yes',ko:'no'}},
 respect:{who:'narr',text:'{k} salue et s’éloigne. Au bout du chemin, des pas pressés résonnent derrière.',roll:{p:.35,ok:'runaway',ko:'no'}},
 runaway:{who:'enfant',text:'Attendez ! J’ai laissé un mot. Je viens. Et ne me ramenez pas, je reviendrai quand même !',end:'recruit',fx:['recruit+']},
 yes:{who:'parent',text:'… Prenez soin de {lui2}. Et toi, mange bien là-bas, tu m’entends ?',end:'recruit',fx:['recruit+']},
 no:{who:'parent',text:'Non. Désolé. Ma place est ici, et la sienne aussi.',end:'leave'}
}},

voleur:{kind:'recruit',start:'a',nodes:{
 a:{who:'narr',text:'Sur le marché de {v}, une petite main file dans la besace de {k}. Une silhouette détale entre les étals.',choices:[
  {t:'Le rattraper !',go:'chase'},
  {t:'Le laisser filer… et l’attendre à la sortie de la ville avec un repas chaud.',go:'wait'}]},
 chase:{who:'narr',text:'{k} s’élance entre les paniers et les poules affolées.',roll:{stat:'vi',scale:70,ok:'caught',ko:'lost'}},
 caught:{who:'enfant',text:'Lâche-moi ! … T’es rapide. Trop rapide pour un humain normal.',next:'offer'},
 lost:{who:'narr',text:'Disparu. {k} reste planté{e} au milieu du marché, avec une poule sur l’épaule.',end:'leave'},
 wait:{who:'enfant',text:'… Pourquoi tu fais ça ? J’ai volé ta bourse.',next:'offer'},
 offer:{who:'k',text:{default:'Tu as des jambes et du cran. Tu veux apprendre à t’en servir pour quelque chose de grand ?',arrogant:'Tu voles mal, mais tu cours bien. Je peux corriger le premier défaut.',sociable:'Garde la bourse. Mais viens dîner tous les soirs au Sanctuaire.'},choices:[
  {t:'« Viens au Sanctuaire. »',go:'yes'},{t:'« Rends la bourse, et file. »',go:'no'}]},
 yes:{who:'enfant',text:'Un vrai toit ? Et à manger tous les jours ? … D’accord. Mais je garde la bourse.',end:'recruit',fx:['recruit']},
 no:{who:'narr',text:'{enfant} jette la bourse et disparaît. {k} se demande longtemps s’il a fait le bon choix.',end:'leave'}
}},

rival:{kind:'recruit',god:true,start:'a',nodes:{
 a:{who:'narr',text:'{enfant} brille déjà d’un cosmos que tout {v} remarque. Mais un autre est venu le chercher avant {k}.',next:'b'},
 b:{who:'rival',text:'Cet enfant servira {dieu}. Passe ton chemin, chevalier.',next:'c'},
 c:{who:'enfant',text:'Personne ne m’a demandé ce que JE voulais !',choices:[
  {t:'« Alors je te le demande : qui veux-tu suivre ? »',req:{qual:'sociable|patient|loyal'},go:'ask'},
  {t:'Défier le serviteur de {dieu}.',go:'duel'}]},
 ask:{who:'enfant',text:'…',roll:{p:.6,ok:'chose',ko:'duelforced'}},
 chose:{who:'enfant',text:'Toi. Parce que tu m’as demandé.',end:'recruit',fx:['recruit+']},
 duelforced:{who:'rival',text:'Assez de bavardages. L’enfant ira avec le plus fort.',fight:{mods:{duel:true},win:'won',lose:'lost'}},
 duel:{who:'rival',text:'Soit. Que {dieu} juge.',fight:{mods:{duel:true},win:'won',lose:'lost'}},
 won:{who:'enfant',text:'Tu l’as battu ! Emmène-moi, vite, avant qu’il se relève !',end:'recruit',fx:['recruit+','weaken']},
 lost:{who:'narr',text:'Le serviteur de {dieu} emmène {enfant}. L’enfant se retourne une dernière fois vers {k}.',end:'lose'}
}},

/* ---------------- scènes au Sanctuaire ---------------- */
doute:{kind:'home',need:'ap',start:'a',nodes:{
 a:{who:'ap',text:'Je n’y arriverai jamais. Les autres progressent plus vite que moi. Peut-être que je devrais rentrer chez moi.',next:'b'},
 b:{who:'k',text:{default:'Tu crois vraiment ça ?',arrogant:'Rentrer ? Et me priver d’un adversaire à humilier ?',loyal:'Le Sanctuaire ne laisse personne derrière.',patient:'Assieds-toi. Parlons-en.'},choices:[
  {t:'« Chacun son rythme. Regarde comme tu as changé depuis ton arrivée. »',go:'calm',fx:['ap_xp']},
  {t:'« Alors entraîne-toi deux fois plus ! Maintenant ! »',go:'hard',fx:['ap_fo']},
  {t:'Lui raconter la guerre sainte.',req:{survivor:true},go:'war',fx:['ap_co']}]},
 calm:{who:'ap',text:'… C’est vrai. Au début, je n’arrivais même pas à monter l’escalier sans m’arrêter.',end:'home'},
 hard:{who:'narr',text:'Deux cents pompes plus tard, {ap} ne pense plus à rentrer. {ap} ne pense plus à rien, d’ailleurs.',end:'home'},
 war:{who:'narr',text:'{k} parle longtemps. Des amis tombés, des maisons en flammes, de la lumière qui revient toujours. {ap} écoute sans rien dire.',end:'home'}
}},
dispute:{kind:'home',need:'k2',start:'a',nodes:{
 a:{who:'k2',text:'Je suis plus fort{e2} que toi, {k}, et tout le Sanctuaire le sait.',next:'b'},
 b:{who:'k',text:{default:'Ah oui ? On en reparle quand tu veux.',arrogant:'Tout le Sanctuaire sait surtout que tu parles beaucoup.',sociable:'Peut-être. Mais moi, on m’invite aux fêtes.',colerique:'Répète ça, pour voir.',patient:'Si ça te fait plaisir de le croire.'},choices:[
  {t:'« Réglons ça dans l’arène ! »',go:'arena',fx:['kk_xp']},
  {t:'« Serrons-nous la main. On a mieux à faire. »',go:'shake',fx:['kk_friend:2']},
  {t:'« Le perdant paie un banquet aux villageois. »',go:'bet',fx:['vivres:-30','kk_friend:1','faveur:1']}]},
 arena:{who:'narr',text:'Le duel dure jusqu’au coucher du soleil. Personne ne gagne vraiment, mais tous les apprentis ont appris quelque chose.',end:'home'},
 shake:{who:'k2',text:'… Tu as raison. Mais la prochaine fois, je te bats.',end:'home'},
 bet:{who:'narr',text:'Le soir, les villageois mangent comme des rois. Les deux chevaliers aussi, d’ailleurs. Qui a perdu ? Personne ne s’en souvient.',end:'home'}
}},
astres:{kind:'home',need:'pope',start:'a',nodes:{
 a:{who:'pope',text:'Cette nuit, les étoiles ont dessiné un visage d’enfant au-dessus de {pays}. Un cosmos rare s’y éveille.',choices:[
  {t:'« Envoyons quelqu’un dès l’aube. »',go:'send',fx:['spawn_recruit']},
  {t:'« Ce n’est peut-être qu’un rêve. »',go:'dream',fx:['faveur:1']}]},
 send:{who:'pope',text:'Alors regarde la mappemonde. L’étoile y brille déjà.',end:'home'},
 dream:{who:'pope',text:'Peut-être. Athéna apprécie la prudence… même quand elle a tort.',end:'home'}
}},
trouvaille:{kind:'home',start:'a',nodes:{
 a:{who:'villageois',text:'En déblayant {lieu}, on a trouvé ça. Ça brille bizarrement, et c’est chaud au toucher.',choices:[
  {t:'L’apporter à la forge.',go:'forge',fx:['res:metal:80']},
  {t:'L’apporter à la bibliothèque.',go:'lib',fx:['res:savoir:40']},
  {t:'« Garde-le. C’est toi qui l’as trouvé. »',go:'keep',fx:['faveur:1']}]},
 forge:{who:'narr',text:'Fondu, l’objet donne un métal d’une pureté que les forgerons n’avaient jamais vue.',end:'home'},
 lib:{who:'narr',text:'C’était un fragment de tablette. Les érudits y passent la nuit, et en ressortent les yeux brillants.',end:'home'},
 keep:{who:'villageois',text:'Vraiment ? … Merci. Je le donnerai à ma fille. Elle dit qu’elle veut devenir chevalier, vous savez.',end:'home'}
}}
};
export const SCENE_KEYS=Object.keys(SCENES);
