/* Scènes de vie entre personnages (demandées par Seba le 2026-10-27) : attirance, rendez-vous, aveu, tendresse,
   jalousie, dispute, réconciliation, rivalité, soutien d'un ami qui doute, farce.
   Même format que data/scenes.js. Le joueur décide pour {k}. Variables en plus : {k3} (le tiers d'une jalousie),
   {e3}, {il2}, {lui2}, {Il2}, {cxline} (la plainte de celui qui doute), {acc} (chance qu'un aveu soit accepté).
   Un texte peut varier selon le ton de l'orateur (clé « t_deconneur », « t_reserve »…) ou son caractère (qualité, défaut).
   Conditions de choix en plus : ton, cœur minimal (bon).
   Effets (fx) : love, couple, breakup, rival, rival3, friend, friend3, friend23, bon:<qui>:n, conf:<qui>:n, kk_xp
   (voir core/romance.js). Les romances ne concernent que des adultes, un homme et une femme. */

export const LIFE_SCENES={

regard:{kind:'home',need:'attract',start:'a',log:'{k} n’a pas pu détacher son regard de {k2} à l’arène.',nodes:{
 a:{who:'narr',text:'Fin d’après-midi à l’arène. {k2} enchaîne les mouvements, seul{e2}, dans la lumière dorée. {k} devait juste traverser. {k} ne traverse pas.',next:'b'},
 b:{who:'k',text:{default:'(Depuis quand {il2} s’entraîne aussi tard ?)',t_deconneur:'(Respire. Tu es un chevalier d’Athéna, pas un poisson hors de l’eau. Ferme la bouche, déjà.)',t_reserve:'(Ne pas rester planté{e} là. Surtout, ne pas rester planté{e} là.)',t_subtil:'(Intéressant. Très intéressant.)',t_solennel:'(Les anciens disaient que deux cosmos se reconnaissent au premier regard. Les anciens exagéraient. Sans doute.)',t_franc:'(Bon. {Il2} est magnifique. Ça, c’est fait.)'},next:'c'},
 c:{who:'k2',text:{default:'Tu comptes rester là longtemps, ou tu viens m’aider à finir cette série ?',t_taquin:'Si tu continues à me fixer comme ça, je vais finir par te faire payer l’entrée.',t_reserve:'Oh… pardon, je ne t’avais pas vu{e}. Tu… tu voulais l’arène ?',t_franc:'Tu me regardes depuis cinq minutes. Dis ce que tu as à dire.',t_tendre:'Tu as l’air épuisé{e}. Viens t’asseoir un moment, j’ai de l’eau fraîche.',t_deconneur:'Ah ! Un spectateur ! Attends, je refais mon entrée, elle était ratée.'},choices:[
  {t:'Proposer de s’entraîner ensemble.',go:'train',fx:['love:1','friend:1']},
  {t:'« Je regardais ta garde. Elle est parfaite. Enfin… presque. »',req:{ton:'taquin|deconneur|franc'},go:'tease',fx:['love:2']},
  {t:'Sourire, sans un mot.',req:{ton:'subtil|reserve|tendre'},go:'smile',fx:['love:2']},
  {t:'Bafouiller une excuse et partir.',go:'flee',fx:['love:1']}]},
 train:{who:'narr',text:'Ils s’entraînent jusqu’à ce que le soleil disparaisse derrière les ruines. À chaque parade, leurs regards se croisent un peu plus longtemps que nécessaire.',end:'home'},
 tease:{who:'k2',text:{default:'« Presque » ? Viens donc me montrer, alors.',t_deconneur:'Presque ! Je te signale que ma garde a fait pleurer trois apprentis cette semaine. … Bon, un seul. Mais il pleurait fort.',t_reserve:'(rougit jusqu’aux oreilles) … Tu… tu trouves ?',t_solennel:'Presque. Voilà un mot que mon maître n’aurait jamais osé prononcer devant moi.'},next:'tease2'},
 tease2:{who:'narr',text:'Le sable vole, les rires aussi. Quand {k} repart enfin, {il} se surprend à sourire tout{e} seul{e} dans l’escalier.',end:'home'},
 smile:{who:'narr',text:'Un sourire, rien de plus. {k2} le lui rend. Parfois, c’est tout ce qu’il faut pour que quelque chose commence.',end:'home'},
 flee:{who:'narr',text:'{k} marmonne quelque chose à propos d’une corvée urgente et s’éclipse. Dans son dos, {k2} sourit. Ce n’était pas très discret. C’était plutôt touchant.',end:'home'}
}},

promenade:{kind:'home',need:'date',start:'a',log:'{k} et {k2} se sont promenés sous les oliviers, à la tombée du jour.',nodes:{
 a:{who:'narr',text:'Le soir tombe sur Rodorio. {k} et {k2} se retrouvent, comme par hasard, sur le chemin des oliviers. Le hasard fait bien les choses, ces temps-ci.',next:'b'},
 b:{who:'k2',text:{default:'Je ne savais pas que tu venais te promener ici.',t_taquin:'Encore toi ? Je commence à croire que tu me suis.',t_solennel:'Ces oliviers ont vu passer mille chevaliers. Ce soir, ils n’en voient que deux.',t_deconneur:'Je préviens : si tu me demandes de porter un panier d’olives, je simule une blessure grave.',t_reserve:'… Bonsoir. Il fait doux, hein ?',t_tendre:'J’espérais un peu te croiser, je l’avoue.'},choices:[
  {t:'Lui parler de ton pays et de ton enfance.',go:'past',fx:['love:1','friend:1']},
  {t:'Lui raconter la pire chute de ta vie d’apprenti.',go:'laugh',fx:['love:1']},
  {t:'Lui prendre la main.',go:'hand'},
  {t:'Parler uniquement d’entraînement.',go:'shop'}]},
 past:{who:'k',text:{default:'Chez moi, le soir, on s’asseyait sur le seuil et on écoutait le village s’endormir. Je n’y avais plus pensé depuis des années.',t_reserve:'Je… je n’en parle jamais. Mais à toi, ça va.',t_solennel:'Je viens d’une terre où l’on raconte encore les guerres saintes au coin du feu. Je ne pensais pas en vivre une.',t_deconneur:'Mon enfance ? Une chèvre m’a mordu{e} le jour de mes six ans. Depuis, on est ennemis jurés. Elle doit être morte, maintenant. J’ai gagné.'},next:'pastend'},
 pastend:{who:'narr',text:'Ils marchent longtemps. Quand ils se séparent, {k2} pose une main sur le bras de {k}, juste une seconde. Ça suffit pour toute la nuit.',end:'home'},
 laugh:{who:'k2',text:{default:'(éclate de rire) Tu as vraiment fait ça devant le Grand Pope ?',t_subtil:'(un sourire en coin) Je note. Ça pourra servir un jour.',t_solennel:'(se retient, puis rit malgré {lui2}) Ce n’est pas digne d’un chevalier. C’est très drôle.'},next:'laughend'},
 laughend:{who:'narr',text:'Leurs rires résonnent jusqu’aux premières maisons. Un vieux berger secoue la tête en souriant : il a été jeune, lui aussi.',end:'home'},
 hand:{who:'narr',text:'{k} tend la main, lentement, sans rien dire.',roll:{p:'acc',ok:'handok',ko:'handko'}},
 handok:{who:'k2',text:{default:'(sa main serre la tienne) J’espérais que tu oserais.',t_reserve:'(ne dit rien, mais ne lâche plus ta main)',t_taquin:'Enfin. J’ai cru que j’allais devoir le faire moi-même.',t_franc:'Il était temps.'},fx:['love:2'],end:'home'},
 handko:{who:'k2',text:'Pas… pas encore. Laisse-moi un peu de temps, d’accord ?',end:'home'},
 shop:{who:'narr',text:'{k} parle de garde, de parades, de séries de pompes. {k2} hoche poliment la tête. Les oliviers, eux, soupirent.',end:'home'}
}},

aveu:{kind:'home',need:'confess',start:'a',log:'{k} a ouvert son cœur à {k2}.',nodes:{
 a:{who:'narr',text:'Au pied du grand escalier, {k} attend {k2}. {k} a répété ses mots toute la journée. Ils ont tous disparu.',next:'b'},
 b:{who:'k2',text:{default:'Tu voulais me voir ? Tu as une drôle de tête. Tout va bien ?',t_tendre:'Tu trembles. Viens, assieds-toi près de moi.',t_franc:'Bon. Qu’est-ce qui se passe ?',t_taquin:'Toi, tu as fait une bêtise. Avoue.',t_solennel:'Tu m’as fait mander. Je suis là.'},choices:[
  {t:'Tout lui avouer, simplement.',go:'say'},
  {t:'Avouer avec une blague, pour se donner du courage.',req:{ton:'deconneur|taquin'},go:'sayjoke'},
  {t:'Lui tendre un poème écrit dans la nuit.',req:{ton:'solennel|subtil|reserve|tendre'},go:'poem'},
  {t:'Se dégonfler et parler de la météo.',go:'chicken'}]},
 say:{who:'k',text:{default:'Je crois que je suis amoureux{e} de toi. Voilà. C’est dit.',t_reserve:'Je… depuis l’arène, je… je pense à toi tout le temps.',t_solennel:'Je t’offre mon cœur, {k2}. Il a survécu à une guerre ; il ne survivra pas à ton silence.',t_franc:'Je t’aime. Je ne sais pas faire de détours, alors voilà.'},next:'decide'},
 sayjoke:{who:'k',text:'Alors voilà : j’ai découvert une nouvelle technique secrète. Elle s’appelle « tomber amoureux{e} de toi ». Elle est redoutable. Surtout sur moi.',next:'decide'},
 poem:{who:'narr',text:'{k} tend un parchemin froissé. Quelques vers maladroits, raturés, recommencés. {k2} les lit deux fois.',next:'decide'},
 decide:{who:'narr',text:'{k2} reste silencieux{e2} un long moment.',roll:{p:'acc',ok:'yes',ko:'no'}},
 yes:{who:'k2',text:{default:'Tu en as mis, du temps. Moi aussi, idiot{e}.',t_tendre:'Moi aussi. Depuis bien plus longtemps que tu ne crois.',t_taquin:'Enfin ! J’avais parié avec les gardes que tu tiendrais encore un mois. Tu me coûtes trois drachmes.',t_reserve:'(hoche la tête, les yeux brillants) … Moi aussi.',t_deconneur:'Attends, je vérifie… Oui. Moi aussi. Zut, c’est sérieux, alors.',t_solennel:'Alors que les étoiles en soient témoins.'},fx:['couple'],next:'yesend'},
 yesend:{who:'narr',text:'Au-dessus des douze maisons, les étoiles ont l’air un peu plus proches ce soir.',end:'home'},
 no:{who:'k2',text:{default:'Je tiens à toi, vraiment. Mais pas comme ça. Pas maintenant. Je suis désolé{e2}.',t_franc:'Je préfère être honnête : je ne ressens pas la même chose.',t_tendre:'Tu comptes énormément pour moi. Mais mon cœur… il n’est pas prêt. Pardonne-moi.'},fx:['love:-2'],choices:[
  {t:'Respecter sa réponse.',go:'accept',fx:['bon:k:3','friend:1']},
  {t:'Insister.',go:'insist',fx:['friend:-1','love:-1','bon:k:-2']}]},
 accept:{who:'narr',text:'Ça fait mal. Mais {k} sourit quand même, et {k2} ne l’oubliera pas.',end:'home'},
 insist:{who:'k2',text:'S’il te plaît… ne rends pas les choses plus difficiles.',end:'home'},
 chicken:{who:'narr',text:'« Il va pleuvoir demain. » {k2} lève les yeux vers un ciel sans un nuage. {k} voudrait disparaître sous les marches.',end:'home'}
}},

tendresse:{kind:'home',need:'couple',start:'a',log:'{k} et {k2} ont partagé un moment de tendresse, face à la mer.',nodes:{
 a:{who:'narr',text:'Un matin calme. {k} et {k2} partagent un morceau de pain sur le mur d’enceinte, face à la mer.',next:'b'},
 b:{who:'k2',text:{default:'Tu crois qu’un jour, on pourra vivre sans attendre la prochaine guerre ?',t_taquin:'Tu as des miettes partout. C’est fascinant. Comment tu fais ?',t_deconneur:'Si Poséidon se réveille, je lui demande de nous laisser finir le petit déjeuner. Il comprendra.',t_solennel:'La mer est la même qu’au temps des premiers chevaliers. Nous, nous passerons.',t_reserve:'(pose sa tête sur ton épaule, sans rien dire)'},choices:[
  {t:'Parler de l’avenir, après la guerre.',go:'future',fx:['love:1','friend:1']},
  {t:'S’entraîner ensemble, comme au premier jour.',go:'train',fx:['kk_xp']},
  {t:'Lui faire une surprise : des fleurs du jardin des simples.',req:{bon:20},go:'flowers',fx:['love:1','bon:k:2']}]},
 future:{who:'k',text:{default:'Une maison sur une colline. Des oliviers. Et toi qui râles le matin.',t_deconneur:'Une maison, un potager, et une chèvre. Pas méchante, la chèvre. J’ai des comptes à régler avec les chèvres.',t_reserve:'… Je n’osais pas y penser. Avec toi, j’ose.',t_solennel:'Après la guerre, il y aura la paix. Et dans la paix, il y aura nous.'},next:'futureend'},
 futureend:{who:'narr',text:'Ils restent là jusqu’à ce que le soleil chauffe les pierres. Personne ne vient les déranger. Les gardes ont appris à faire un détour.',end:'home'},
 train:{who:'narr',text:'Ils s’entraînent côte à côte, en silence. Ils n’ont plus besoin de se parler pour se comprendre.',end:'home'},
 flowers:{who:'k2',text:{default:'(rougit) Tu les as volées au jardin des simples ? L’herboriste va te tuer. … Elles sont magnifiques.',t_franc:'Tu es ridicule. Je les garde.'},end:'home'}
}},

jalousie:{kind:'home',need:'jealous',start:'a',log:'{k} a été jaloux{e} de {k3}.',nodes:{
 a:{who:'narr',text:'Au réfectoire, {k2} rit aux éclats avec {k3}. Ce n’est rien. Juste un rire. {k} serre un peu trop fort sa cuillère.',next:'b'},
 b:{who:'k3',text:{default:'… et là, je lui réponds : « Ce n’est pas une armure, c’est une armoire ! »',t_subtil:'Je dis simplement que certains chevaliers portent leur armure comme on porte une rancune.',t_solennel:'Et c’est ainsi que la bataille de la troisième maison fut perdue, puis regagnée.',t_tendre:'Tu devrais rire plus souvent. Ça te va bien.'},next:'c'},
 c:{who:'k',text:{default:'(Depuis quand {il2} rit comme ça avec {k3} ?)',t_franc:'(Bon. Ça ne me plaît pas. Pas du tout.)',t_tendre:'(Ce n’est rien… Ce n’est rien, n’est-ce pas ?)',t_deconneur:'(Elle est nulle, cette blague. Je fais mieux les yeux fermés. Avec une seule main.)'},choices:[
  {t:'Aller voir {k3} : « On peut parler, toi et moi ? »',go:'confront',fx:['rival3:2','friend3:-1']},
  {t:'En parler calmement à {k2}, ce soir.',go:'talk'},
  {t:'Rire avec eux et s’asseoir à leur table.',req:{bon:20},go:'join',fx:['friend3:1','bon:k:2']},
  {t:'Bouder toute la journée.',go:'sulk',fx:['love:-1']}]},
 confront:{who:'k3',text:{default:'Tu as un problème ? On parlait, c’est tout.',arrogant:'Jaloux{e} ? Ça te va mal.',t_tendre:'Oh… Je crois que tu te trompes. Mais je comprends.',t_franc:'Si tu as quelque chose à me reprocher, dis-le en face.'},next:'confrontend'},
 confrontend:{who:'narr',text:'Le ton monte. Les apprentis s’écartent. {k2} les regarde, mi-flatté{e2}, mi-furieux{e2}.',end:'home'},
 talk:{who:'narr',text:'{k} attend le soir pour en parler, loin des oreilles.',roll:{p:.65,ok:'trust',ko:'quarrel'}},
 trust:{who:'k2',text:{default:'Tu es bête. C’est toi que je choisis. Tous les jours.',t_taquin:'Tu étais jaloux{e} ? Vraiment ? C’est adorable. Je vais t’embêter avec ça pendant des années.',t_franc:'Écoute-moi bien : il n’y a que toi.'},fx:['love:1'],end:'home'},
 quarrel:{who:'k2',text:'Tu me surveilles, maintenant ? Je n’ai pas besoin d’un geôlier.',fx:['friend:-1'],end:'home'},
 join:{who:'narr',text:'{k} pose son plateau à côté d’eux. Trois rires valent mieux que deux. Sous la table, {k2} serre sa main.',end:'home'},
 sulk:{who:'narr',text:'{k} ne dit pas un mot de la journée. {k2} ne comprend pas. {k3} non plus. Personne n’y gagne.',end:'home'}
}},

engueulade:{kind:'home',need:'couple',start:'a',log:'Dispute entre {k} et {k2}.',nodes:{
 a:{who:'narr',text:'Ça a commencé pour une broutille : une sangle d’armure oubliée, un mot de travers. Maintenant, {k} et {k2} se disputent pour de bon, dans le couloir des dortoirs.',next:'b'},
 b:{who:'k2',text:{default:'Tu ne m’écoutes jamais ! Jamais !',colerique:'Encore une fois et je te jure que cette porte va voler !',t_franc:'Tu veux la vérité ? Tu es insupportable quand tu as raison.',t_deconneur:'Je refuse de me disputer avec quelqu’un qui a de la sauce sur le menton. … Non, attends, je suis sérieux{e2}, là.',t_solennel:'Tu as manqué à ta parole. Je pensais que cela comptait, entre nous.',t_reserve:'(serre les poings, les yeux pleins de larmes) Laisse tomber.'},choices:[
  {t:'S’excuser le premier.',go:'sorry',fx:['love:1','bon:k:2']},
  {t:'Tenir bon : tu as raison, et tu le sais.',go:'hold',fx:['rival:1']},
  {t:'Désamorcer avec une grimace absurde.',req:{ton:'deconneur|taquin'},go:'joke'},
  {t:'Claquer la porte.',go:'slam',fx:['love:-2','friend:-1']}]},
 sorry:{who:'k2',text:{default:'… Moi aussi, j’ai exagéré. Viens là.',orgueilleux:'Bien. Je… j’accepte. Et je m’excuse aussi. Un peu.'},end:'home'},
 hold:{who:'narr',text:'Aucun des deux ne cède. Ils dorment dos à dos, raides comme des statues. Demain sera un autre jour.',end:'home'},
 joke:{who:'narr',text:'{k} louche, gonfle les joues et imite le Grand Pope en colère.',roll:{p:.6,ok:'jokeok',ko:'jokeko'}},
 jokeok:{who:'k2',text:'(éclate de rire malgré {lui2}) Tu es impossible. Totalement impossible.',fx:['love:1'],end:'home'},
 jokeko:{who:'k2',text:'Ce n’est pas drôle. Ce n’est vraiment pas le moment.',fx:['love:-1'],end:'home'},
 slam:{who:'narr',text:'La porte tremble encore longtemps après. Il faudra une réconciliation.',end:'home'}
}},

reconciliation:{kind:'home',need:'cold',start:'a',log:'{k} et {k2} ont fait un pas l’un vers l’autre.',nodes:{
 a:{who:'narr',text:'Depuis des jours, {k} et {k2} s’évitent. Ce matin, ils se retrouvent seuls à la fontaine, et aucun des deux ne bouge.',next:'b'},
 b:{who:'k2',text:{default:'… Salut.',orgueilleux:'Ne crois surtout pas que je suis venu{e2} pour toi.',t_tendre:'Ça me pèse, tu sais. Ce froid entre nous.',t_franc:'Bon. On continue à faire semblant de ne pas se voir, ou on règle ça ?',t_deconneur:'Belle fontaine, hein ? Très… fontaine. Bon, je n’ai rien préparé.'},choices:[
  {t:'Tendre la main.',go:'hand',fx:['rival:-2','friend:2','bon:k:3']},
  {t:'Briser la glace avec une blague.',req:{ton:'deconneur|taquin'},go:'joke',fx:['rival:-2','friend:1']},
  {t:'Attendre que {k2} fasse le premier pas.',go:'wait'},
  {t:'Partir sans un mot.',go:'leave',fx:['rival:1']}]},
 hand:{who:'k2',text:{default:'(hésite, puis serre ta main) … Je suis content{e2} que ce soit toi qui l’aies fait. Moi, je n’aurais pas su.',orgueilleux:'(serre ta main) Ceci ne veut pas dire que tu avais raison.'},end:'home'},
 joke:{who:'narr',text:'Le rire part tout seul, d’abord gêné, puis franc. L’eau de la fontaine en emporte le reste.',end:'home'},
 wait:{who:'narr',text:'Les secondes passent. Puis {k2} soupire, et s’assoit à côté de {k}.',roll:{p:.45,ok:'waitok',ko:'waitko'}},
 waitok:{who:'k2',text:'On a été idiots, tous les deux. On recommence ?',fx:['rival:-1','friend:1'],end:'home'},
 waitko:{who:'narr',text:'… et se relève sans avoir rien dit. Ce n’est pas encore le moment.',end:'home'},
 leave:{who:'narr',text:'{k} s’en va. Derrière, l’eau continue de couler. Le froid aussi.',end:'home'}
}},

rivalite:{kind:'home',need:'rival',start:'a',log:'Rivalité entre {k} et {k2}.',nodes:{
 a:{who:'narr',text:'Sur la stèle de l’arène, on a gravé les meilleurs temps de la montée des douze maisons. Le nom de {k2} est juste au-dessus de celui de {k}. Juste au-dessus.',next:'b'},
 b:{who:'k2',text:{default:'On admire le classement ? Il est très bien, ce classement.',t_taquin:'Tu veux que je te prête mes sandales ? Elles vont plus vite toutes seules.',arrogant:'Ne le prends pas mal. Certains naissent rapides, d’autres naissent… toi.',t_solennel:'La pierre ne ment pas. Mais elle peut être regravée.',t_reserve:'Je… c’était un bon jour, c’est tout.'},choices:[
  {t:'Le défier à la course, tout de suite.',go:'race',fx:['kk_xp','rival:1']},
  {t:'Le défier en duel à l’arène.',req:{qual:'courageux|fougueux|orgueilleux'},go:'duel',fx:['kk_xp','rival:2']},
  {t:'Lui serrer la main : « Tu le mérites. »',go:'respect',fx:['rival:-1','friend:1','bon:k:2']},
  {t:'L’ignorer et s’entraîner deux fois plus.',go:'ignore',fx:['kk_xp']}]},
 race:{who:'narr',text:'Ils s’élancent dans l’escalier, entre les maisons du zodiaque. Les gardes s’écartent en jurant.',roll:{p:.5,ok:'win',ko:'lose'}},
 win:{who:'k',text:{default:'Alors ? Il faudra regraver la stèle.',t_deconneur:'Et le vainqueur est… moi ! Merci, merci. Pas d’autographes, s’il vous plaît.',t_subtil:'(lève simplement un sourcil)',t_solennel:'La pierre sera regravée. Ainsi va la gloire.'},end:'home'},
 lose:{who:'k2',text:'Toujours juste au-dessus. Reviens quand tu veux.',end:'home'},
 duel:{who:'narr',text:'Le sable de l’arène vole sous les coups. À la fin, à bout de souffle, ils se relèvent l’un l’autre. Les rivalités font les grands chevaliers.',end:'home'},
 respect:{who:'k2',text:'… Merci. Et la prochaine fois, je ne te ferai pas de cadeau.',end:'home'},
 ignore:{who:'narr',text:'{k} tourne les talons sans un mot, et passe la nuit à monter et descendre l’escalier.',end:'home'}
}},

soutien:{kind:'home',need:'support',start:'a',log:'{k} a trouvé les mots pour redonner confiance à {k2}.',nodes:{
 a:{who:'narr',text:'À l’écart, sur les marches d’un temple effondré, {k2} fixe ses mains. {k} connaît ce regard : celui de quelqu’un qui doute.',next:'b'},
 b:{who:'k2',text:'{cxline}',next:'c'},
 c:{who:'k',text:{default:'(Il faut trouver les bons mots.)',t_deconneur:'(Pas de blague nulle. Pas de blague nulle. … Peut-être une petite.)',t_franc:'(Lui dire la vérité. Toute la vérité.)'},choices:[
  {t:'L’encourager sincèrement.',go:'sincere',fx:['conf:k2:20','friend:1']},
  {t:'Le taquiner gentiment pour le faire rire.',req:{ton:'deconneur|taquin'},go:'tease'},
  {t:'Lui confier ta propre faiblesse.',go:'share',fx:['conf:k2:30','friend:2','bon:k:2']},
  {t:'« Ressaisis-toi. Un chevalier ne se plaint pas. »',go:'hard',fx:['conf:k2:-10','friend:-1','bon:k:-3']}]},
 sincere:{who:'k',text:{default:'Je t’ai vu{e2} te battre. Je t’ai vu{e2} te relever. Ce que tu crois voir dans le miroir, personne d’autre ne le voit.',t_solennel:'La valeur d’un chevalier ne se mesure ni à son visage ni à sa naissance, mais à ce qu’il fait quand tout s’effondre. Et toi, tu restes debout.',t_tendre:'Tu es précieux{e2}, tu sais. Pour moi, pour nous tous.'},next:'sincereend'},
 sincereend:{who:'narr',text:'{k2} ne répond pas. Mais ses épaules se redressent, un peu. C’est un début.',end:'home'},
 tease:{who:'narr',text:'{k} s’assoit à côté et lâche une remarque si absurde que {k2} en reste bouche bée.',roll:{p:.6,ok:'teaseok',ko:'teaseko'}},
 teaseok:{who:'k2',text:'(éclate de rire) Tu es complètement fou… Merci. Vraiment.',fx:['conf:k2:25','friend:1'],end:'home'},
 teaseko:{who:'k2',text:'Ce n’est pas drôle. Pas aujourd’hui.',fx:['conf:k2:-5'],end:'home'},
 share:{who:'k',text:{default:'Tu veux savoir un secret ? La veille de mon épreuve, j’ai vomi trois fois. Tout le monde doute. Les meilleurs, surtout.',t_reserve:'Moi aussi… j’ai peur, souvent. Je ne l’ai jamais dit à personne.',t_deconneur:'Je fais le malin, mais je pleure devant les couchers de soleil. Tous. Même les moches.'},next:'shareend'},
 shareend:{who:'narr',text:'Ils restent assis côte à côte jusqu’à la nuit. Deux doutes partagés pèsent moins lourd qu’un seul.',end:'home'},
 hard:{who:'k2',text:'… D’accord. J’ai compris.',end:'home'}
}},

farce:{kind:'home',need:'prank',start:'a',log:'{k} a fait une farce à {k2}.',nodes:{
 a:{who:'narr',text:'Il est tôt. Très tôt. {k} se glisse dans le vestiaire de l’arène avec un pot de miel, trois plumes de poule et un sourire inquiétant.',next:'b'},
 b:{who:'k',text:{default:'(Ce sera mon chef-d’œuvre.)',t_taquin:'(Juste une petite blague. Rien de méchant. Enfin, presque rien.)'},choices:[
  {t:'Garnir les sandales de {k2} de miel et de plumes.',go:'honey'},
  {t:'Échanger sa cape avec celle du Grand Pope.',go:'cape'},
  {t:'Finalement, renoncer et lui laisser une fleur.',go:'flower',fx:['friend:1','bon:k:1']}]},
 honey:{who:'k2',text:{default:'{k} !!! Je sais que c’est toi !',t_deconneur:'Excellent. Vraiment excellent. Tu viens de signer ton arrêt de mort. Ta prochaine nuit sera… collante.',t_solennel:'Ceci… est un outrage à la dignité de l’armure.',t_reserve:'(regarde ses pieds, puis éclate de rire malgré {lui2})',t_taquin:'Pas mal. Pas mal du tout. Tu as une semaine pour te cacher.'},choices:[
  {t:'Assumer et éclater de rire.',go:'own',fx:['friend:1']},
  {t:'Nier en bloc, la bouche pleine de miel.',go:'deny'}]},
 own:{who:'narr',text:'Tout le vestiaire rit. Même {k2}, au bout d’un moment. Les plumes, elles, resteront collées une semaine.',end:'home'},
 deny:{who:'narr',text:'Personne n’y croit. Surtout pas avec ce miel au coin des lèvres.',end:'home'},
 cape:{who:'narr',text:'La cape du Grand Pope est lourde, brodée d’or. Celle de {k2} est… beaucoup plus petite.',roll:{p:.5,ok:'capeok',ko:'capeko'}},
 capeok:{who:'narr',text:'À l’assemblée du matin, {k2} parade en cape de Pope sans s’en rendre compte, et le Pope en cape courte. Le fou rire dure jusqu’à midi.',fx:['friend:1'],end:'home'},
 capeko:{who:'narr',text:'Le Pope surprend {k} la main dans le coffre. Il ne dit rien. Il note. Quelque part, une corvée de latrines vient de trouver preneur.',fx:['friend:-1'],end:'home'},
 flower:{who:'narr',text:'{k2} trouve une fleur sur ses sandales, sans un mot. {Il2} cherchera longtemps qui l’a posée là.',end:'home'}
}}
};

// Ce que dit celui qui doute, selon son complexe (character.js).
export const CX_LINES={
 apparence:'Tu as vu comment ils me regardent ? Je ne ressemble à rien, à côté des autres.',
 taille:'Je suis ridicule dans cette armure. Trop petit, trop grand, je ne sais même plus. Jamais à la bonne taille.',
 origine:'Ils disent que les gens de chez moi ne font pas de bons chevaliers. Peut-être qu’ils ont raison.',
 force:'J’ai encore perdu à l’entraînement. Je ne serai jamais assez fort. Jamais.',
 echec:'Je n’arrête pas d’y repenser. Ce jour-là, j’ai échoué, et quelqu’un a payé à ma place.',
 parole:'Ce matin, j’ai voulu répondre au maître devant tout le monde, et… rien n’est sorti. Comme d’habitude.'
};
