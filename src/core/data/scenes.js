/* Les scènes écrites. Variables : {k} le personnage principal, {e} accord féminin (« prêt{e} »), {il} il/elle, {lui},
   {v} le village, {pays}, {chef} le chef ennemi, {foes} la faction, {dieu}, {ild}/{Ild}/{luid} accords du dieu,
   {line} une réplique de la faction, {enfant}, {e2}/{il2}/{lui2} ses accords, {age}, {ap}, {k2} un second personnage,
   {pope}, {lieu}, {region} la région commune, {why} la raison d'une affinité.
   Orateurs : narr, k, k2, ap, pope, ancien, parent, enfant, chef, rival, villageois.
   Un texte en objet varie selon le caractère de l'orateur : clé = qualité ou défaut (arrogant, loyal, drole…). */

export const SCENES={

/* ---------------- attaques de villages ---------------- */
defi:{kind:'attack',start:'a',nodes:{
 a:{who:'narr',text:'La fumée de {v} se voit depuis la route. Pas celle des cheminées : celle des greniers.',next:'b'},
 b:{who:'ancien',text:'Vous portez une armure… Alors c’est vrai, le Sanctuaire existe encore. Ils ont pris le grain et ils veulent les jeunes. Pour porter leurs sacs, disent-ils.',next:'c'},
 c:{who:'chef',text:'{line}',next:'d'},
 d:{who:'k',text:{default:'Lâchez ce que vous avez pris. Personne n’a besoin de mourir aujourd’hui.',arrogant:'Vous vous en prenez à des paysans. C’est donc le mieux que vous sachiez faire.',loyal:'Ces gens sont sous la protection d’Athéna. Partez.',fougueux:'J’espérais que vous refuseriez. Ça m’évite de discuter.',peureux:'(Respire. Ils sont nombreux, mais ils ne savent pas ce que tu as traversé.) Reculez.',sociable:'Vous avez faim, vous aussi, je suppose. Mais pas comme ça.',patient:'Je vais compter jusqu’à trois. Profitez-en pour réfléchir.',colerique:'Vous avez touché à des enfants. Il n’y aura pas de deuxième avertissement.',drole:'Belle journée pour piller des greniers vides. Vous avez vérifié qu’il restait du grain, au moins ?'},choices:[
  {t:'« Toi et moi. Laisse tes hommes en dehors de ça. »',go:'duel'},
  {t:'Se placer entre les pillards et les maisons.',go:'mass',fx:['bonus']},
  {t:'« Partez maintenant, et je ne vous poursuivrai pas. »',req:{qual:'sociable|loyal|patient|drole'},go:'talk'},
  {t:'Frapper le premier.',req:{qual:'fougueux|courageux'},go:'charge'},
  {t:'Désarmer le premier pillard d’un geste si précis que les autres comprennent.',req:{stat:['de',28]},go:'disarm'},
  {t:'Soulever leur chariot de grain par la seule force de l’esprit.',req:{stat:['ps',28]},go:'lift'}]},
 disarm:{who:'narr',text:'Personne n’a vu le geste. L’épée du pillard est plantée dans la poutre d’une grange, trois mètres plus haut. Il regarde sa main vide, puis {k}. Les autres hésitent.',fight:{mods:{easy:true},win:'w',lose:'l'}},
 lift:{who:'narr',text:'Le chariot quitte le sol, grince, tourne lentement sur lui-même au-dessus des têtes. Pas un muscle de {k} n’a bougé.',roll:{stat:'ps',scale:90,ok:'peace',ko:'talkko'}},
 duel:{who:'chef',text:'Un duel. Tu as du courage, ou tu ne sais pas compter. Voyons lequel.',fight:{mods:{duel:true},win:'w',lose:'l'}},
 mass:{who:'narr',text:'{k} recule jusqu’au seuil de la première maison. Derrière, une porte se ferme doucement. Devant, les pillards se déploient.',fight:{mods:{},win:'w',lose:'l'}},
 charge:{who:'narr',text:'Le chef n’a pas fini sa phrase que {k} a déjà franchi la distance. Le cosmos brûle avant même le premier coup.',fight:{mods:{first:true},win:'w',lose:'l'}},
 talk:{who:'narr',text:'Le chef jauge {k} longuement. Ses hommes, eux, regardent leur chef. C’est souvent là que tout se joue.',roll:{stat:'co',scale:110,ok:'peace',ko:'talkko'}},
 peace:{who:'chef',text:'Rendez le grain. … On n’est pas venus mourir pour trois sacs d’orge. Mais retiens bien ceci : l’hiver sera long, et on aura encore faim.',end:'peace'},
 talkko:{who:'chef',text:'De belles paroles. Il en faut plus pour nourrir mes hommes.',fight:{mods:{easy:true},win:'w',lose:'l'}},
 w:{who:'ancien',text:'Ils sont partis. Je n’arrive pas à le croire. … Vous resterez manger ? Ce n’est pas grand-chose, mais c’est tout ce qu’on a.',roll:{p:.35,ok:'child',ko:'wend'}},
 child:{who:'enfant',text:'Je vous ai regardé{e} vous battre. Je n’ai pas eu peur. Enfin… un peu. Je veux apprendre. S’il vous plaît.',choices:[
  {t:'« Le chemin est dur, et il ne s’arrête jamais. Si tu le veux encore demain matin, viens. »',go:'wrecruit'},{t:'« Ta place est ici, pour l’instant. Ils auront besoin de toi. »',go:'wend'}]},
 wrecruit:{who:'narr',text:'À l’aube, {enfant} attend au bout du chemin, un baluchon trop lourd sur l’épaule. Personne ne l’a forcé{e2}.',end:'win',fx:['recruit']},
 wend:{who:'narr',text:'Ce soir, à {v}, on rallume les foyers. On parlera longtemps de {k}, et un peu plus fort que nécessaire.',end:'win'},
 l:{who:'narr',text:'{k} doit céder du terrain, blessé{e}. Les pillards repartent avec le grain, mais sans personne. C’était peut-être l’essentiel.',end:'lose'}
}},

deserteurs:{kind:'attack',start:'a',nodes:{
 a:{who:'narr',text:'À l’entrée de {v}, une poignée d’hommes et de femmes amaigris tiennent les paysans en respect avec des fourches rouillées. Leurs mains tremblent plus que celles de leurs victimes.',next:'b'},
 b:{who:'chef',text:'On ne veut tuer personne. On a déserté une armée qui ne nous payait plus. Trois jours sans manger. Vous auriez fait quoi, vous ?',next:'c'},
 c:{who:'k',text:{default:'Je ne sais pas. Mais je sais ce que je ne ferais pas.',arrogant:'Moi ? Je ne me serais pas mis dans cette situation.',sociable:'Posez ces fourches. On va trouver autre chose.',gourmand:'Trois jours… Je comprends mieux que vous ne le pensez.',loyal:'J’aurais tenu ma parole. Mais je n’ai jamais eu faim comme vous.',drole:'Probablement la même bêtise, avec une fourche mieux entretenue.'},choices:[
  {t:'« Faim ou pas, vous partez. »',go:'fight'},
  {t:'Partager les vivres du Sanctuaire (60 vivres).',req:{res:['vivres',60]},go:'share',fx:['pay:vivres:60']},
  {t:'« Des voleurs de poules qui se prennent pour des soldats. »',req:{flaw:'arrogant|colerique'},go:'insult'}]},
 fight:{who:'narr',text:'Ils serrent leurs fourches. La faim donne un courage qui ressemble beaucoup au désespoir.',fight:{mods:{easy:true},win:'w',lose:'l'}},
 insult:{who:'chef',text:'… Voleurs de poules. Très bien. On va te montrer ce que valent des voleurs de poules.',fight:{mods:{hard:true},win:'w',lose:'l'}},
 share:{who:'chef',text:'… On ne nous avait jamais rien donné sans rien demander. Dites-moi : votre Sanctuaire, il a besoin de bras ?',choices:[
  {t:'« Il y a toujours des pierres à relever. Venez. »',go:'join'},{t:'« Rentrez chez vous, et n’y revenez pas les armes à la main. »',go:'go'}]},
 join:{who:'narr',text:'Le lendemain, des visages nouveaux montent l’escalier du Sanctuaire, une pioche sur l’épaule. Ils travaillent sans parler, comme des gens qui ont une dette.',end:'peace',fx:['worker','faveur:1']},
 go:{who:'narr',text:'Ils repartent le ventre plein. Le plus jeune se retourne une fois. Il ne dit rien, mais il incline la tête.',end:'peace',fx:['faveur:1']},
 w:{who:'ancien',text:'Merci. … Même si je n’arrive pas à leur en vouloir tout à fait.',end:'win'},
 l:{who:'narr',text:'Mis{e} en déroute par des affamés armés de fourches. {k} rentre sans un mot. Certaines défaites apprennent plus que des victoires.',end:'lose'}
}},

champion:{kind:'attack',god:true,start:'a',nodes:{
 a:{who:'narr',text:'Les oiseaux se sont tus. Au-dessus de {v}, le ciel a pris une teinte de cuivre que personne, ici, n’a jamais vue.',next:'b'},
 b:{who:'chef',text:'Ainsi, Athéna envoie encore ses chevaliers. {dieu} te salue, {k}. {Ild} m’a chargé de lui rapporter ton casque, et ton nom.',next:'c'},
 c:{who:'k',text:{default:'Dis à {dieu} qu’{ild} devra venir le chercher {luid}-même.',arrogant:'Mon nom, il le connaîtra bien assez tôt.',loyal:'Tant qu’il me restera un souffle, aucun dieu ne touchera à ces gens.',peureux:'(Un champion divin… Pourquoi moi ? Parce que personne d’autre n’est là.) Approche.',reveur:'Les étoiles m’avaient prévenu{e}. Je pensais que tu serais plus grand.',drole:'Mon casque ? Il est un peu cabossé, je te préviens. Comme son propriétaire.'},choices:[
  {t:'Faire face.',go:'fight'},
  {t:'Faire brûler son cosmos dès le premier instant.',req:{stat:['co',35]},go:'burn'},
  {t:'Dresser une barrière de l’esprit autour des maisons avant le premier coup.',req:{stat:['ps',35]},go:'shield'}]},
 shield:{who:'narr',text:'Un voile à peine visible se referme sur {v}. Les villageois sont à l’abri : {k} peut enfin se battre sans retenue.',fight:{mods:{first:true},win:'w',lose:'l'}},
 fight:{who:'narr',text:'Le sol tremble sous les pas du champion de {dieu}. Les villageois, derrière les volets, retiennent leur souffle.',fight:{mods:{},win:'w',lose:'l'}},
 burn:{who:'narr',text:'Une colonne de lumière dorée s’élève de {k}. Pour la première fois, le champion recule d’un pas.',fight:{mods:{first:true},win:'w',lose:'l'}},
 w:{who:'chef',text:'Ce n’est… que partie remise. {dieu} saura ton nom, maintenant. Ce n’est pas forcément une bonne nouvelle pour toi.',end:'win',fx:['weaken','faveur:2']},
 l:{who:'chef',text:'Rentre à ton Sanctuaire. Dis-leur ce que tu as vu ici. Et dis-leur que {dieu} n’a pas oublié.',end:'lose'}
}},

banquet:{kind:'attack',start:'a',nodes:{
 a:{who:'narr',text:'{k} arrive à {v} prêt{e} au combat et trouve des tables dressées dans la rue principale.',next:'b'},
 b:{who:'ancien',text:'Les pillards ? Sous l’olivier, là-bas. Ils ont trouvé nos amphores. On a décidé de les laisser finir le vin… et de vous attendre.',next:'c'},
 c:{who:'k',text:{default:'Vous avez fait preuve de sang-froid. C’est rare.',fougueux:'J’ai couru toute la nuit pour ça ?',gourmand:'… Il reste quelque chose sur ces tables ?',drole:'Je vois. Vous avez vaincu l’ennemi par l’hospitalité. Je vais en parler au Grand Pope.',arrogant:'Vous auriez pu vous en charger vous-mêmes.'},choices:[
  {t:'Les réveiller et les affronter loyalement.',go:'wake'},
  {t:'Les ligoter pendant qu’ils dorment.',go:'tie'},
  {t:'Partager d’abord le repas des villageois.',req:{flaw:'gourmand'},go:'eat'}]},
 wake:{who:'chef',text:'Hein… ? Un chevalier ? Laisse-moi au moins trouver mes bottes…',fight:{mods:{easy:true},win:'w',lose:'l'}},
 tie:{who:'narr',text:'{k} s’approche à pas lents, une corde à la main. Un ronflement, un grognement, un silence.',roll:{stat:'de',scale:90,ok:'tied',ko:'oops'}},
 tied:{who:'narr',text:'Au réveil, ils sont ficelés comme des jambons. Les enfants du village décident de les garder « en prison » jusqu’au soir. Personne ne les contredit.',end:'win',fx:['bonus']},
 oops:{who:'chef',text:'On m’attache ? Debout, tout le monde !',fight:{mods:{},win:'w',lose:'l'}},
 eat:{who:'narr',text:'Du pain chaud, des olives, une soupe épaisse. Quand {k} se lève de table, la fatigue de la route a disparu.',fx:['nrg:+30'],fight:{mods:{first:true},win:'w',lose:'l'}},
 w:{who:'ancien',text:'Restez pour la fête. On n’en a pas eu depuis la guerre. Pour une fois qu’on a une bonne raison.',end:'win'},
 l:{who:'narr',text:'Même ivres, ils étaient trop nombreux. {k} rentre au Sanctuaire, l’orgueil plus meurtri que le corps.',end:'lose'}
}},

/* ---------------- recrutements ---------------- */
charrette:{kind:'recruit',start:'a',nodes:{
 a:{who:'narr',text:'À {v}, on ne parle que de {enfant} : à {age} ans, {il2} a sorti seul{e2} une charrette embourbée, devant tout le marché.',next:'b'},
 b:{who:'parent',text:'Vous êtes venu pour {enfant}. Je le sais. On m’avait dit qu’un jour quelqu’un viendrait. J’espérais que ce serait plus tard.',next:'c'},
 c:{who:'k',text:{default:'Je ne viens pas prendre votre enfant. Je viens lui proposer un chemin. Le choix restera le sien.',arrogant:'Ce don est rare. Le laisser s’éteindre ici serait un gâchis.',sociable:'On pourrait en parler autour de votre table, si vous voulez bien.',loyal:'Je vous promets de veiller sur {lui2} comme on a veillé sur moi.',drole:'Rassurez-vous, on n’attelle personne aux charrettes, au Sanctuaire. Enfin, pas tous les jours.'},choices:[
  {t:'Parler du Sanctuaire tel qu’il est : dur, mais juste. Et des amis qu’on s’y fait.',req:{qual:'sociable|loyal|drole'},go:'yes'},
  {t:'Montrer un peu de son cosmos.',req:{stat:['co',25]},go:'cosmos'},
  {t:'« Je vous écrirai. Chaque mois. »',go:'promise'},
  {t:'« C’est à vous deux de décider. Je respecterai votre choix. »',go:'respect'}]},
 cosmos:{who:'narr',text:'Une lumière douce emplit la pièce. Les bols tintent sur la table. Le parent recule d’un pas ; l’enfant, lui, s’avance.',next:'cosmos2'},
 cosmos2:{who:'enfant',text:'C’est ça que je sens, quand je suis en colère. Ou quand j’ai peur. Je croyais que j’étais malade.',next:'yes'},
 promise:{who:'parent',text:'Chaque mois. Vous dites ça maintenant.',roll:{p:.55,ok:'yes',ko:'no'}},
 respect:{who:'narr',text:'{k} salue et reprend la route. Au bout du chemin, des pas pressés se rapprochent.',roll:{p:.35,ok:'runaway',ko:'no'}},
 runaway:{who:'enfant',text:'J’ai laissé un mot. Ne me ramenez pas : je reviendrais quand même.',end:'recruit',fx:['recruit+']},
 yes:{who:'parent',text:'… Prenez soin de {lui2}. Et toi, mange correctement. Et écris, toi aussi.',end:'recruit',fx:['recruit+']},
 no:{who:'parent',text:'Non. Pas cette année. Revenez quand {il2} sera en âge de choisir seul{e2}.',end:'leave'}
}},

voleur:{kind:'recruit',start:'a',nodes:{
 a:{who:'narr',text:'Au marché de {v}, une main légère se glisse dans la besace de {k}. Une silhouette maigre file entre les étals.',choices:[
  {t:'Le rattraper.',go:'chase'},
  {t:'Le laisser filer… et l’attendre à la sortie de la ville avec un repas chaud.',go:'wait'}]},
 chase:{who:'narr',text:'{k} s’élance entre les paniers et les poules affolées.',roll:{stat:'vi',scale:70,ok:'caught',ko:'lost'}},
 caught:{who:'enfant',text:'Lâche-moi ! … Tu cours vite. Personne ne m’avait jamais rattrapé.',next:'offer'},
 lost:{who:'narr',text:'Disparu. {k} reste au milieu du marché, essoufflé{e}, sous le regard amusé des marchands.',end:'leave'},
 wait:{who:'enfant',text:'… Pourquoi tu fais ça ? J’ai pris ta bourse. Les gens comme toi ne donnent rien.',next:'offer'},
 offer:{who:'k',text:{default:'Tu as des jambes, du cran et nulle part où aller. Je connais un endroit où ça suffit pour commencer.',arrogant:'Tu voles mal, mais tu cours bien. Le premier défaut se corrige.',sociable:'Garde la bourse. Mais viens dîner chez nous ce soir, et les suivants.',drole:'Garde la bourse, elle était presque vide. Moi, je t’offre mieux : un toit et un maître qui crie beaucoup.'},choices:[
  {t:'« Viens au Sanctuaire. »',go:'yes'},{t:'« Rends la bourse, et va-t’en. »',go:'no'}]},
 yes:{who:'enfant',text:'Un vrai toit ? Et à manger tous les jours ? … D’accord. Mais si on me frappe, je m’en vais.',end:'recruit',fx:['recruit']},
 no:{who:'narr',text:'{enfant} jette la bourse aux pieds de {k} et disparaît. {k} se demandera longtemps s’il fallait dire autre chose.',end:'leave'}
}},

rival:{kind:'recruit',god:true,start:'a',nodes:{
 a:{who:'narr',text:'{enfant} brûle déjà d’un cosmos que tout {v} remarque. Mais quelqu’un est venu avant {k}.',next:'b'},
 b:{who:'rival',text:'Cet enfant servira {dieu}. On lui a promis la gloire, une maison pour sa mère et la fin de la faim. Toi, que promets-tu ?',next:'c'},
 c:{who:'enfant',text:'Personne ne m’a demandé ce que JE voulais.',choices:[
  {t:'« Alors je te le demande. Et je respecterai ta réponse. »',req:{qual:'sociable|patient|loyal'},go:'ask'},
  {t:'Défier le serviteur de {dieu}.',go:'duel'}]},
 ask:{who:'enfant',text:'…',roll:{p:.6,ok:'chose',ko:'duelforced'}},
 chose:{who:'enfant',text:'Toi. Parce que tu es la seule personne à m’avoir posé la question.',end:'recruit',fx:['recruit+']},
 duelforced:{who:'rival',text:'Assez. L’enfant suivra le plus fort, comme le veut l’ordre du monde.',fight:{mods:{duel:true},win:'won',lose:'lost'}},
 duel:{who:'rival',text:'Soit. Que {dieu} juge.',fight:{mods:{duel:true},win:'won',lose:'lost'}},
 won:{who:'enfant',text:'Tu l’as battu… Emmène-moi. Vite, avant que je change d’avis.',end:'recruit',fx:['recruit+','weaken']},
 lost:{who:'narr',text:'Le serviteur de {dieu} emmène {enfant}. Au moment de passer la colline, l’enfant se retourne vers {k}. Juste une fois.',end:'lose'}
}},

/* ---------------- scènes au Sanctuaire ---------------- */
doute:{kind:'home',need:'ap',start:'a',nodes:{
 a:{who:'ap',text:'Je n’y arriverai jamais. Les autres progressent plus vite que moi. Peut-être que je ne suis pas fait pour ça.',next:'b'},
 b:{who:'k',text:{default:'Pourquoi dis-tu ça maintenant ?',arrogant:'Tu comptes abandonner avant même d’avoir commencé ?',loyal:'Personne ne reste en arrière, ici. Personne.',patient:'Assieds-toi. On a le temps.',drole:'Tu veux savoir un secret ? Moi non plus, je ne suis pas fait pour ça. Ça fait quinze ans que je fais semblant.'},choices:[
  {t:'« Regarde le chemin parcouru depuis ton arrivée. Chacun son rythme. »',go:'calm',fx:['ap_xp']},
  {t:'« Alors entraîne-toi. Maintenant. Avec moi. »',go:'hard',fx:['ap_fo']},
  {t:'Lui raconter la guerre sainte.',req:{survivor:true},go:'war',fx:['ap_co']}]},
 calm:{who:'ap',text:'… C’est vrai. Le premier jour, je ne montais même pas l’escalier sans m’arrêter trois fois.',end:'home'},
 hard:{who:'narr',text:'Ils s’entraînent jusqu’à la nuit. {ap} ne parle plus de partir. {ap} n’a plus la force de parler, d’ailleurs.',end:'home'},
 war:{who:'narr',text:'{k} parle longtemps. Des amis tombés, des maisons en flammes, et de la raison pour laquelle on se relève quand même. {ap} écoute sans rien dire.',end:'home'}
}},
dispute:{kind:'home',need:'k2',start:'a',nodes:{
 a:{who:'k2',text:'Tu as pris la meilleure place à l’arène ce matin. Encore. Tu crois que ça passe inaperçu ?',next:'b'},
 b:{who:'k',text:{default:'Je ne savais pas que tu la voulais.',arrogant:'Elle revient à celui qui s’en sert le mieux.',sociable:'On peut la partager, tu sais.',colerique:'Répète ça, pour voir.',patient:'Si c’est si important pour toi, prends-la demain.',drole:'La meilleure place ? Celle sous le soleil de midi ? Je te la laisse avec plaisir.'},choices:[
  {t:'« Réglons ça dans l’arène, à la loyale. »',go:'arena',fx:['kk_xp']},
  {t:'« On a mieux à faire que se disputer pour un carré de sable. »',go:'shake',fx:['kk_friend:2']},
  {t:'« Le perdant offre un repas aux villageois. »',go:'bet',fx:['vivres:-30','kk_friend:1','faveur:1']}]},
 arena:{who:'narr',text:'Le duel dure jusqu’au coucher du soleil. Personne ne gagne vraiment, mais les apprentis qui regardaient ont appris davantage qu’en une semaine.',end:'home'},
 shake:{who:'k2',text:'… Tu as raison. Ça ne m’empêchera pas de te battre la semaine prochaine.',end:'home'},
 bet:{who:'narr',text:'Le soir, les villageois mangent comme des rois. Qui avait perdu ? Plus personne ne s’en souvient, et c’est très bien ainsi.',end:'home'}
}},
astres:{kind:'home',need:'pope',start:'a',nodes:{
 a:{who:'pope',text:'Cette nuit, les étoiles ont dessiné un visage d’enfant au-dessus de {pays}. Un cosmos rare s’y éveille, et il n’est pas le seul à l’avoir remarqué.',choices:[
  {t:'« Envoyons quelqu’un dès l’aube. »',go:'send',fx:['spawn_recruit']},
  {t:'« Les étoiles se trompent parfois. »',go:'dream',fx:['faveur:1']}]},
 send:{who:'pope',text:'Alors regarde la mappemonde. L’étoile y brille déjà.',end:'home'},
 dream:{who:'pope',text:'Parfois. Et parfois, c’est nous qui refusons de les lire. Athéna apprécie la prudence. Même quand elle a tort.',end:'home'}
}},
trouvaille:{kind:'home',start:'a',nodes:{
 a:{who:'villageois',text:'En déblayant {lieu}, on a trouvé ça. Ça brille bizarrement, et c’est tiède au toucher. On n’a pas osé le garder.',choices:[
  {t:'L’apporter à la forge.',go:'forge',fx:['res:metal:80']},
  {t:'L’apporter à la bibliothèque.',go:'lib',fx:['res:savoir:40']},
  {t:'« Garde-le. C’est toi qui l’as trouvé. »',go:'keep',fx:['faveur:1']}]},
 forge:{who:'narr',text:'Fondu, l’objet donne un métal d’une pureté que les forgerons n’avaient jamais vue. Le plus vieux d’entre eux en a les larmes aux yeux.',end:'home'},
 lib:{who:'narr',text:'C’était le fragment d’une tablette. Les érudits y passent la nuit, et en ressortent avec plus de questions que de réponses. C’est bon signe.',end:'home'},
 keep:{who:'villageois',text:'Vraiment ? … Ma fille dit qu’elle veut devenir chevalier. Je crois que je vais le lui donner.',end:'home'}
}},
// Scènes nées des affinités entre deux personnages.
complicite:{kind:'home',need:'pairPos',start:'a',nodes:{
 a:{who:'narr',text:'Tard dans la soirée, des éclats de rire montent des dortoirs. {k} et {k2}, encore.',next:'b'},
 b:{who:'k2',text:{default:'Avoue que tu n’as jamais vu le maître aussi rouge.',drole:'Je te jure, quand il a glissé sur la marche, il a fait semblant de vouloir s’asseoir.',sociable:'Tu sais ce qui me plaît, ici ? C’est qu’on n’est plus seuls.'},next:'c'},
 c:{who:'k',text:{default:'Plus bas, tu vas réveiller tout l’étage.',drole:'Et la tête qu’il a faite ensuite… Il va nous faire monter l’escalier vingt fois demain.',loyal:'Si quelqu’un demande, on dormait. Tous les deux.',reveur:'Tu crois qu’on se souviendra de ces soirées, plus tard ?'},choices:[
  {t:'« Demain, on s’entraîne ensemble. »',go:'train',fx:['kk_xp']},
  {t:'Laisser la soirée durer.',go:'night',fx:['kk_friend:1']}]},
 train:{who:'narr',text:'À l’aube, ils sont les premiers à l’arène. Personne ne le leur a demandé.',end:'home'},
 night:{who:'narr',text:'Ils parlent jusqu’à ce que les étoiles pâlissent. De leurs familles, de leurs peurs, de ce qu’ils feront quand tout sera reconstruit.',end:'home'}
}},
tension:{kind:'home',need:'pairNeg',start:'a',nodes:{
 a:{who:'narr',text:'Au réfectoire, le ton monte entre {k} et {k2}. Les autres se taisent et fixent leur bol.',next:'b'},
 b:{who:'k2',text:{default:'Toujours à donner des leçons. Tu te crois au-dessus des autres ?',arrogant:'Je m’étonne qu’on te laisse encore t’entraîner avec les grands.',colerique:'Encore un mot et je te jure que…',tetu:'Je ne changerai pas d’avis. Pas pour toi.'},next:'c'},
 c:{who:'k',text:{default:'Je n’ai rien dit de tel.',arrogant:'Au-dessus de toi, au moins, ce n’est pas difficile.',patient:'On en reparlera quand tu seras calmé.',drole:'Au-dessus des autres ? Non. Au-dessus de toi, sur l’escalier, oui. C’est un fait géographique.',loyal:'On est du même côté. Tu l’oublies trop souvent.'},choices:[
  {t:'« Sortons régler ça à l’arène, loin des apprentis. »',go:'arena',fx:['kk_xp']},
  {t:'Faire le premier pas : tendre la main.',req:{qual:'patient|sociable|loyal|drole'},go:'peace',fx:['kk_friend:2']},
  {t:'Quitter la table sans un mot.',go:'leave'}]},
 arena:{who:'narr',text:'Le combat est rude, presque injuste. À la fin, assis dans le sable, ils reprennent leur souffle côte à côte. Ce n’est pas la paix. Mais ce n’est plus la guerre.',end:'home'},
 peace:{who:'k2',text:'… D’accord. Je retire ce que j’ai dit. Une partie, en tout cas.',end:'home'},
 leave:{who:'narr',text:'La porte se referme. Le silence dure jusqu’au soir. Il faudra du temps.',end:'home'}
}},
racines:{kind:'home',need:'pairRoots',start:'a',nodes:{
 a:{who:'k2',text:'Tu as entendu ? Le vent ce soir. Il a la même odeur que chez nous, avant l’orage.',next:'b'},
 b:{who:'k',text:{default:'Je pensais être le seul à l’avoir remarqué.',reveur:'Je l’ai senti aussi. Pendant une seconde, j’étais de retour là-bas.',solitaire:'… Oui. Je n’en parle jamais.',drole:'Chez nous, l’orage sentait surtout la chèvre mouillée. Mais je vois ce que tu veux dire.'},choices:[
  {t:'Parler du pays ({region}).',go:'talk',fx:['kk_friend:1']},
  {t:'Chanter une chanson de là-bas.',go:'song',fx:['kk_friend:1','faveur:1']}]},
 talk:{who:'narr',text:'Ils évoquent les marchés, les fêtes, les plats que personne ici ne sait cuisiner. Pour un soir, le Sanctuaire leur paraît moins loin de chez eux.',end:'home'},
 song:{who:'narr',text:'La chanson est maladroite, à deux voix qui ne s’accordent pas tout à fait. Les villageois sortent sur le pas de leur porte pour écouter.',end:'home'}
}}
};
export const SCENE_KEYS=Object.keys(SCENES);
