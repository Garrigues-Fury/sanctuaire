/* Feuilletons (demandés par Seba le 2026-10-27) : longues histoires en épisodes, avec de la profondeur.
   Format des scènes : celui de data/scenes.js, plus :
   - branch : [{if:{…},go:'x'},…,{go:'y'}] aiguillage invisible selon ce qui s'est passé avant ;
   - conditions : flag, noflag, aff (affection cachée minimale), clues (nombre d'indices), romance (homme et femme adultes),
     cx2 (l'autre a un complexe). Un choix dont la condition de feuilleton n'est pas remplie est caché, pas grisé.
   - effets : aff:n (caché), flag:x, clue:x, et ceux des scènes de vie (couple, friend, love, rival, bon, kk_xp, faveur, res).
   - fin d'épisode : end:'arc'.
   Variables : {k} {k2} et leurs accords, {pays2} {d2} (« du Japon »), {cx2} {cxline}, {archiviste} {servante}. */

export const ARCS={
 etoiles:{n:'Ce que cachent les étoiles',type:'romance',eps:['Le pendentif brisé','La forge, la nuit','Ce qui fait mal','Les langues de Rodorio','La fête des moissons','Sous les étoiles']},
 archives:{n:'Les pages arrachées',type:'enquete',once:true,eps:['Les pages manquantes','Encre et encens','La silhouette de minuit','Ce que cachent les cendres','La vérité'],
  clues:{registre:'le registre des emprunts a été corrigé à l’encre bleue',encre:'des taches d’encre bleue sur les doigts de l’archiviste',encens:'l’odeur de l’encens des archives, loin de la bibliothèque',lettres:'la servante sort la nuit, mais pour un amoureux',silhouette:'une silhouette voûtée arrache une page à minuit',cendres:'des pages à demi brûlées dans le foyer de l’archiviste',pere:'un nom de famille souligné sur une liste de déserteurs'}},
 arene:{n:'Le sable de l’arène',type:'rival',eps:['L’humiliation','La garde de nuit','La dette','Le dernier duel']}
};

export const ARC_SCENES={

/* ================= Ce que cachent les étoiles (romance lente) ================= */
etoiles1:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Arène, fin de matinée. Les exercices à deux s’enchaînent. {k} esquive trop tard, {k2} trébuche, et quelque chose tinte sur la pierre : un pendentif d’argent, fendu en deux.',next:'b'},
 b:{who:'k2',text:{default:'Non… non, non, non.',t_franc:'Tu ne pouvais pas regarder où tu mettais les pieds ?',t_reserve:'(ramasse les morceaux sans un mot, les mains tremblantes)',t_deconneur:'Bravo. Vraiment bravo. Ce truc a survécu à une guerre sainte, et il n’a pas survécu à toi.',t_solennel:'Ce bijou a traversé trois générations. Il s’arrête aujourd’hui.',t_tendre:'Ce n’est pas ta faute… C’est juste que… c’est tout ce qui me reste de chez moi.',t_taquin:'Tu sais que tu viens de casser la seule chose à laquelle je tiens ? Non, évidemment.'},next:'c'},
 c:{who:'k',text:'(Il faut dire quelque chose. N’importe quoi. Pas n’importe quoi.)',choices:[
  {t:'« Je suis désolé{e}. Laisse-moi le réparer. Je trouverai un moyen. »',go:'promise',fx:['aff:2','flag:promesse']},
  {t:'S’agenouiller et ramasser les morceaux avec {lui2}, sans un mot.',go:'silent',fx:['aff:2','flag:silence']},
  {t:'« Il était déjà fendu, non ? »',go:'clumsy',fx:['aff:-2']},
  {t:'Tenter une plaisanterie pour détendre l’atmosphère.',req:{ton:'deconneur|taquin'},go:'joke'}]},
 promise:{who:'k2',text:{default:'Tu ne sais même pas ce que c’est.',t_tendre:'… Tu ferais ça ?',t_franc:'Tu n’as pas idée de la difficulté. Mais d’accord.'},next:'promise2'},
 promise2:{who:'narr',text:'« Il vient de ma grand-mère. Elle l’avait rapporté {d2}. » {k2} dépose les deux morceaux dans la paume de {k}. Ses doigts s’attardent une seconde de plus que nécessaire.',end:'arc'},
 silent:{who:'narr',text:'Ils s’agenouillent ensemble dans le sable. Quand leurs mains se frôlent sur le dernier éclat, {k2} lève les yeux. Pour la première fois, {il2} regarde vraiment {k}.',end:'arc'},
 clumsy:{who:'k2',text:'Fendu. Oui. Comme ta délicatesse.',next:'clumsy2'},
 clumsy2:{who:'narr',text:'{k2} tourne les talons. Dans le sable, un petit éclat brille encore. {k} le ramasse, et le garde.',fx:['flag:eclat'],end:'arc'},
 joke:{who:'narr',text:'{k} lâche la première bêtise qui lui passe par la tête.',roll:{p:.45,ok:'jokeok',ko:'jokeko'}},
 jokeok:{who:'k2',text:'(un rire lui échappe malgré {lui2}) Tu es insupportable. … Merci. J’allais pleurer devant tout le monde.',fx:['aff:2','flag:rire'],end:'arc'},
 jokeko:{who:'k2',text:'Ce n’est pas drôle. Rien de tout ça n’est drôle.',fx:['aff:-2'],end:'arc'}
}},
etoiles2:{kind:'arc',start:'a',nodes:{
 a:{branch:[{if:{flag:'promesse'},go:'p'},{if:{flag:'eclat'},go:'e'},{go:'n'}]},
 p:{who:'narr',text:'Trois nuits que {k} se glisse à la forge après le couvre-feu. Le vieux forgeron a fini par lui montrer comment souder l’argent sans le noircir. Ce soir, la porte grince.',next:'b'},
 e:{who:'narr',text:'{k} n’a rien promis. Mais l’éclat ramassé dans le sable pèse dans sa poche depuis des jours. Ce soir, {k} est à la forge, l’éclat sur l’établi. La porte grince.',next:'b'},
 n:{who:'narr',text:'Ce soir, {k} donne un coup de main à la forge : les forgerons manquent de bras. La porte grince. Ce n’est pas un forgeron.',next:'b'},
 b:{who:'k2',text:{default:'Je me demandais qui faisait chanter l’enclume si tard.',t_taquin:'Alors c’est là que tu te caches. Les gardes parient sur une histoire d’amour, tu sais.',t_reserve:'Je… je n’arrivais pas à dormir. J’ai vu de la lumière.',t_solennel:'Le feu parle, la nuit. On entend des choses qu’on n’entend pas le jour.',t_deconneur:'Je viens dénoncer un vacarme nocturne. Ah, c’est toi. Je retire ma plainte. Enfin, je réfléchis.'},next:'b2'},
 b2:{branch:[{if:{flag:'promesse'},go:'pp'},{if:{flag:'eclat'},go:'pe'},{go:'q'}]},
 pp:{who:'k2',text:'Tu… tu le répares vraiment. Je pensais que tu avais dit ça pour te débarrasser de moi.',fx:['aff:2'],next:'q'},
 pe:{who:'k2',text:'C’est… l’éclat qui manquait. Tu l’as gardé ?',fx:['aff:2','flag:promesse'],next:'q'},
 q:{who:'k',text:'(Le métal refroidit. Il faudrait dire quelque chose.)',choices:[
  {t:'« Ta grand-mère, comment était-elle ? »',go:'past',fx:['aff:2','flag:passe']},
  {t:'« Je ne me débarrasserais pas si facilement de toi. »',go:'flirt',fx:['flag:drague']},
  {t:'Lui tendre le marteau : « Viens. Aide-moi. »',go:'together',fx:['aff:2']},
  {t:'Rester concentré{e} sur le métal.',go:'focus'}]},
 past:{who:'k2',text:{default:'Elle disait que les étoiles {d2} étaient plus proches qu’ailleurs. Elle mentait, évidemment. Mais quand elle le disait, j’y croyais.',t_deconneur:'Terrible. Elle trichait aux cartes, buvait comme un pêcheur et m’a appris à jurer dans trois langues. Je l’adorais.',t_solennel:'Une femme de devoir. Elle a enterré deux fils sans verser une larme devant nous. Elle pleurait la nuit. Je l’entendais.',t_reserve:'Elle… elle chantait en cousant. Je ne me souviens plus des paroles. Ça me fait peur, d’oublier.'},next:'pastend'},
 pastend:{who:'narr',text:'{k2} parle longtemps. {k} ne dit presque rien, et c’est exactement ce qu’il fallait.',end:'arc'},
 flirt:{branch:[{if:{aff:3},go:'flirtok'},{go:'flirtko'}]},
 flirtok:{who:'k2',text:{default:'(un sourire en coin) Fais attention. Je pourrais finir par te croire.',t_reserve:'(détourne les yeux vers le feu, mais sourit)',t_franc:'Tu dragues mal. Continue.'},fx:['aff:1'],end:'arc'},
 flirtko:{who:'k2',text:'(recule d’un pas) On ne se connaît pas encore assez pour ça.',fx:['aff:-1'],end:'arc'},
 together:{who:'narr',text:'Leurs mains sur le même manche, le même rythme. L’argent fond, coule, se ressoude. Quand {k2} relève la tête, il y a de la suie sur sa joue. {k} ne la lui enlève pas. Pas encore.',end:'arc'},
 focus:{who:'narr',text:'{k2} regarde travailler {k} un moment, puis repart sans bruit. Sur l’établi, {il2} a laissé une gourde d’eau fraîche.',end:'arc'}
}},
etoiles3:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Une patrouille a mal tourné du côté des collines. {k2} est revenu{e2} sur ses jambes, mais en serrant les dents. À l’infirmerie, on lui a bandé le flanc et ordonné de ne pas bouger.',next:'a2'},
 a2:{branch:[{if:{cx2:true},go:'cx'},{go:'nocx'}]},
 cx:{who:'k2',text:'Tu veux savoir pourquoi j’ai foncé seul{e2} ? Parce que… {cxline}',next:'c'},
 nocx:{who:'k2',text:{default:'Ce n’est rien. J’ai juste été lent{e2}. Trop lent{e2}.',t_franc:'J’ai fait une erreur stupide, et j’aurais pu y rester. Voilà.',t_deconneur:'Si quelqu’un demande, j’ai combattu dix géants. Pas un sanglier. Un sanglier, {k}. Un SANGLIER.',t_solennel:'J’ai failli. Un chevalier ne devrait pas faillir.'},next:'c'},
 c:{who:'k',text:'(Ne pas dire « je te l’avais dit ». Surtout pas.)',choices:[
  {t:'Rester toute la nuit à son chevet.',go:'night',fx:['aff:3','flag:chevet']},
  {t:'Lui apporter un repas chaud, puis le laisser dormir.',go:'meal',fx:['aff:2']},
  {t:'« Tu aurais dû m’appeler. »',go:'reproach',fx:['aff:1']},
  {t:'Le faire rire jusqu’à ce que ça tire sur le bandage.',req:{ton:'deconneur|taquin|tendre'},go:'laugh',fx:['aff:2','flag:rire']},
  {t:'Lui prendre la main, sans rien dire.',req:{aff:5},go:'hand',fx:['aff:3','flag:main']}]},
 night:{who:'narr',text:'La lampe baisse. {k2} s’endort enfin, la main posée près de celle de {k}, sans tout à fait la toucher. Au matin, {k} est toujours là.',next:'night2'},
 night2:{who:'k2',text:'… Tu es resté{e}. Toute la nuit ?',end:'arc'},
 meal:{who:'k2',text:'Tu as pensé aux olives. Personne ne pense jamais aux olives.',end:'arc'},
 reproach:{who:'k2',text:{default:'T’appeler ? Pour que tu me voies comme ça ?',t_tendre:'Je sais… Je n’ai pas l’habitude qu’on s’inquiète pour moi.'},end:'arc'},
 laugh:{who:'narr',text:'« Arrête, ça tire ! » Et pourtant {k2} rit encore, plié{e2} en deux, une main sur le bandage. L’infirmier les fusille du regard. Ça valait le coup.',end:'arc'},
 hand:{who:'narr',text:'La main de {k2} est froide. Elle se réchauffe lentement dans celle de {k}. Aucun des deux ne la retire.',end:'arc'}
}},
etoiles4:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Au marché de Rodorio, les nouvelles vont plus vite que les chevaux. Ce matin, on murmure que {k} et {k2} se voient la nuit : à la forge, à l’infirmerie, partout.',next:'b'},
 b:{who:'narr',text:'Quand {k} croise {k2} dans l’escalier, {il2} détourne les yeux et accélère le pas.',choices:[
  {t:'Le rattraper pour en parler.',go:'talk'},
  {t:'Lui laisser de l’espace.',go:'space',fx:['aff:1','flag:espace']},
  {t:'Aller faire taire les commères.',go:'gossip',fx:['flag:defendu']},
  {t:'En rire publiquement, pour désamorcer.',req:{ton:'deconneur|taquin|subtil'},go:'laughit',fx:['aff:1']}]},
 talk:{branch:[{if:{aff:6},go:'talkok'},{go:'talkko'}]},
 talkok:{who:'k2',text:{default:'Ça ne me dérange pas qu’ils parlent. Ce qui me dérange, c’est que j’aimerais qu’ils aient raison. Voilà. Oublie ce que je viens de dire.',t_reserve:'(rouge jusqu’aux oreilles) Ce n’est pas ce qu’ils disent qui me gêne. C’est que ce ne soit pas vrai.',t_franc:'Tu veux la vérité ? Je me moque des commères. C’est toi qui m’intéresses.',t_deconneur:'Le problème, ce n’est pas la rumeur. Le problème, c’est qu’elle est mal écrite. Dans ma version, il y a des chevaux.'},fx:['aff:2','flag:demiaveu'],end:'arc'},
 talkko:{who:'k2',text:'Je préfère qu’on garde nos distances quelque temps. Le temps que ça se calme.',fx:['aff:-1'],end:'arc'},
 space:{who:'narr',text:'Deux jours passent. Le troisième soir, un mot glissé sous la porte de {k} : « Merci de ne pas avoir insisté. On se voit à la fête ? »',end:'arc'},
 gossip:{who:'narr',text:'{k} remet à sa place le marchand le plus bavard, devant tout le marché. Le soir même, tout Rodorio sait que {k} a défendu l’honneur de {k2}.',next:'gossip2'},
 gossip2:{branch:[{if:{aff:5},go:'gossipok'},{go:'gossipko'}]},
 gossipok:{who:'k2',text:'Tu es fou… Plus personne ne va parler d’autre chose. … Merci.',fx:['aff:2'],end:'arc'},
 gossipko:{who:'k2',text:'Tu crois que ça arrange les choses ? Maintenant, ils sont sûrs d’avoir raison.',fx:['aff:-1'],end:'arc'},
 laughit:{who:'narr',text:'Au réfectoire, {k} lance à la cantonade : « Paraît que je passe mes nuits à la forge. C’est vrai : je suis amoureux{e} d’une enclume. » Éclat de rire général. {k2} cache son sourire dans son bol.',end:'arc'}
}},
etoiles5:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Rodorio fête les moissons. Des lampions entre les oliviers, une musique qui tourne la tête, du vin coupé d’eau, et des rondes où l’on change de partenaire à chaque refrain.',next:'b'},
 b:{who:'narr',text:'Au troisième refrain, la ronde dépose {k2} juste devant {k}.',next:'c'},
 c:{who:'k2',text:{default:'On dirait que le hasard insiste.',t_taquin:'Toi, tu as soudoyé le joueur de flûte.',t_solennel:'Les anciens disent qu’on ne refuse pas une danse des moissons. Ça porte malheur.',t_reserve:'Je… je danse très mal. Je te préviens.',t_deconneur:'Je te préviens : j’ai déjà écrasé les pieds de deux chevaliers et d’un âne.',t_franc:'Tu danses, ou tu restes planté{e} là ?'},choices:[
  {t:'Danser, sans le quitter des yeux.',go:'dance',fx:['aff:2']},
  {t:'« Viens, on s’éclipse. Je connais un endroit. »',go:'away',fx:['aff:1']},
  {t:'Lui demander pourquoi {il2} a laissé faire le hasard.',req:{aff:6},go:'why',fx:['aff:2']}]},
 why:{who:'k2',text:'Parce que j’en avais envie. Depuis la forge, peut-être. Ou depuis le pendentif. Je ne sais plus.',fx:['flag:demiaveu'],next:'dance'},
 dance:{who:'narr',text:'La musique ralentit. Ils ne changent pas de partenaire au refrain suivant. Ni au suivant.',next:'d2'},
 d2:{branch:[{if:{aff:9},go:'kiss'},{go:'dend'}]},
 kiss:{who:'narr',text:'Quand la dernière note s’éteint, {k2} ne recule pas. Leurs fronts se touchent. Puis, très doucement, leurs lèvres.',fx:['flag:baiser','aff:2'],end:'arc'},
 dend:{who:'narr',text:'La fête se termine tard. Ils rentrent côte à côte, sans se toucher, en parlant de tout sauf de l’essentiel.',end:'arc'},
 away:{who:'narr',text:'Le vieux temple au-dessus du village. On entend encore la musique, assourdie. Le ciel est immense.',next:'away2'},
 away2:{who:'k2',text:'C’est ici que tu viens quand tu veux être seul{e} ?',choices:[
  {t:'« Oui. Je n’y avais jamais amené personne. »',go:'awayend',fx:['aff:2']},
  {t:'L’embrasser.',go:'kisstry'}]},
 kisstry:{branch:[{if:{aff:8},go:'kiss2'},{go:'kissno'}]},
 kiss2:{who:'narr',text:'{k2} ferme les yeux une seconde avant que leurs lèvres se trouvent. Comme si {il2} l’attendait depuis la forge.',fx:['aff:2','flag:baiser'],end:'arc'},
 kissno:{who:'k2',text:'(détourne doucement le visage) Pas comme ça. Pas encore. … Mais ne t’éloigne pas.',fx:['aff:-1'],end:'arc'},
 awayend:{who:'narr',text:'Ils restent assis là jusqu’à ce que les lampions s’éteignent un à un, en contrebas.',end:'arc'}
}},
etoiles6:{kind:'arc',start:'a',nodes:{
 a:{branch:[{if:{flag:'promesse'},go:'gift'},{go:'start'}]},
 gift:{who:'narr',text:'{k} a fini. Le pendentif est entier, la soudure presque invisible : une fine ligne d’argent là où il s’était brisé. Ce soir, {k} attend {k2} sur le mur d’enceinte.',fx:['flag:pendentif'],next:'start'},
 start:{who:'narr',text:'Le ciel est d’une clarté rare. On voit la Voie lactée jusqu’à l’horizon. {k2} arrive et s’assoit, sans un mot.',next:'b'},
 b:{branch:[{if:{flag:'chevet'},go:'b1'},{if:{flag:'rire'},go:'b2'},{if:{flag:'baiser'},go:'b4'},{go:'b3'}]},
 b1:{who:'k2',text:'Tu sais à quoi j’ai pensé, cette nuit-là, à l’infirmerie ? Que personne n’était jamais resté. Personne. Sauf toi.',next:'c'},
 b2:{who:'k2',text:'Tu te rends compte que tu m’as fait rire avec le flanc ouvert ? Je devrais t’en vouloir. Je n’y arrive pas.',next:'c'},
 b4:{who:'k2',text:'Depuis la fête, je n’arrive plus à penser à autre chose. C’est très gênant pour l’entraînement, tu sais.',next:'c'},
 b3:{who:'k2',text:'Il s’est passé beaucoup de choses, ces derniers temps. Entre nous, je veux dire.',next:'c'},
 c:{who:'k',text:'(C’est maintenant, ou jamais.)',choices:[
  {t:'Lui tendre le pendentif réparé.',req:{flag:'pendentif'},go:'pend',fx:['aff:3']},
  {t:'Lui dire ce que tu ressens, simplement.',go:'say',fx:['aff:1']},
  {t:'Attendre qu’{il2} parle en premier.',go:'wait'}]},
 pend:{who:'k2',text:'(le retourne dans la lumière des étoiles, longtemps) … Il est entier. Tu l’as vraiment fait. Tu te rends compte que plus personne ne fait ce qu’il promet ?',next:'final'},
 say:{who:'k',text:{default:'Je ne sais pas quand c’est arrivé. Mais chaque fois que je cherche quelqu’un des yeux, c’est toi.',t_solennel:'Si les étoiles ont un sens, alors elles m’ont conduit{e} jusqu’à toi. Je ne veux pas aller plus loin sans toi.',t_deconneur:'J’avais préparé un discours magnifique. Je l’ai oublié. Alors voilà la version courte : je t’aime. Voilà. C’était la version courte.',t_reserve:'Je… Tu comptes pour moi. Plus que tout. Voilà.',t_franc:'Je t’aime. Je voulais que tu le saches avant que la guerre nous rattrape.',t_tendre:'Tu es la première personne à qui je pense le matin. Et la dernière, le soir.'},next:'final'},
 wait:{who:'narr',text:'Le silence s’étire. Une étoile filante traverse le ciel. {k2} prend une inspiration.',next:'final'},
 final:{branch:[{if:{aff:14},go:'yes'},{if:{aff:7},go:'friend'},{go:'no'}]},
 yes:{who:'k2',text:{default:'Moi aussi. Depuis bien plus longtemps que tu ne crois.',t_taquin:'Enfin. Il aura fallu une forge, une infirmerie et une fête. Tu es lent{e}, mais tu es à moi.',t_reserve:'(pose la tête sur ton épaule) … Moi aussi.',t_deconneur:'Attends, je dois vérifier quelque chose. (l’embrasse) Oui. Moi aussi. Confirmé.',t_solennel:'Alors que ce ciel en soit témoin : je suis à tes côtés, quoi qu’il arrive.',t_franc:'Moi aussi. Et je ne te lâcherai pas.'},next:'yesend'},
 yesend:{who:'narr',text:'Au-dessus des douze maisons, les étoiles ont l’air un peu plus proches ce soir. Peut-être que la grand-mère avait raison.',fx:['couple','friend:2'],end:'arc'},
 friend:{who:'k2',text:'Tu es la personne en qui j’ai le plus confiance ici. Je ne veux pas risquer de te perdre. Restons… ce que nous sommes. Pour l’instant.',fx:['friend:3','love:3'],end:'arc'},
 no:{who:'k2',text:'Je suis désolé{e2}. Je tiens à toi, vraiment. Mais pas de cette façon.',fx:['friend:1'],end:'arc'}
}},

/* ================= Les pages arrachées (enquête) ================= */
archives1:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'La bibliothèque se relève à peine, et déjà un mystère : dans la plus vieille chronique du Sanctuaire, celle de la précédente guerre sainte, des pages ont été arrachées. Proprement. Au couteau.',next:'b'},
 b:{who:'archiviste',text:'Trente-deux pages. Les années de la guerre. Qui ferait une chose pareille ? Ce sont nos morts, entendez-vous ? Nos morts !',next:'c'},
 c:{who:'k2',text:{default:'Le Grand Pope nous confie l’affaire. Discrètement.',t_solennel:'Quiconque profane la mémoire des morts devra en répondre.',t_deconneur:'Une enquête ! Enfin. Je réclame le titre d’inspecteur en chef. Tu seras mon assistant{e}.',t_franc:'On a une semaine. Après, le Pope s’en charge lui-même, et personne ne veut ça.'},next:'d'},
 d:{who:'k',text:'(Par où commencer ?)',choices:[
  {t:'Examiner la chronique de près.',go:'exam'},
  {t:'Interroger {archiviste} sur ses habitudes.',go:'ask'},
  {t:'Demander aux gardes qui est entré la nuit.',go:'guards'},
  {t:'Proposer à {k2} de travailler en duo, nuit et jour.',req:{romance:true},go:'duo',fx:['aff:2']}]},
 exam:{who:'narr',text:'Les coupures sont nettes. Et dans le registre des emprunts, une ligne a été grattée puis réécrite. À l’encre bleue. Or la seule encre bleue du Sanctuaire est celle de l’archiviste.',fx:['clue:registre'],end:'arc'},
 ask:{who:'archiviste',text:'Mes habitudes ? Je classe, je recopie, je dors. Je suis vieux, je ne sors plus la nuit.',next:'ask2'},
 ask2:{who:'narr',text:'En parlant, {archiviste} cache ses mains dans ses manches. Trop tard : {k} a vu les taches d’encre bleue au bout de ses doigts.',fx:['clue:encre'],end:'arc'},
 guards:{who:'narr',text:'Les gardes n’ont vu personne entrer. Mais l’un d’eux se souvient d’une silhouette, la nuit, du côté des dortoirs des villageois. Une femme, peut-être.',fx:['flag:piste_servante'],end:'arc'},
 duo:{who:'k2',text:'(un demi-sourire) Nuit et jour ? Tu as l’air de beaucoup tenir à cette enquête. Ou à autre chose.',end:'arc'}
}},
archives2:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Une piste mène aux dortoirs des villageois. On y trouve {servante}, une jeune femme qui travaille à la bibliothèque. Elle pâlit en voyant entrer deux chevaliers.',next:'b'},
 b:{who:'servante',text:'Je n’ai rien fait ! Je range, je balaie, c’est tout !',next:'c'},
 c:{who:'k',text:'(Elle tremble. Peur d’être prise, ou peur tout court ?)',choices:[
  {t:'La rassurer doucement avant de questionner.',go:'soft',fx:['bon:k:1']},
  {t:'La presser de questions.',go:'hard',fx:['bon:k:-2']},
  {t:'Humer l’air : cette odeur lourde, sucrée…',go:'smell'},
  {t:'Laisser {k2} mener l’interrogatoire.',go:'k2lead',fx:['aff:1']}]},
 soft:{who:'servante',text:'Je… je sors la nuit, c’est vrai. Mais pas pour voler. Pour… quelqu’un. Un garçon du village. Ne le dites à personne, je vous en supplie. Mon père me tuerait.',fx:['clue:lettres'],end:'arc'},
 hard:{who:'servante',text:'(fond en larmes) Laissez-moi tranquille ! Je n’ai rien fait !',next:'hard2'},
 hard2:{who:'narr',text:'{k2} pose une main sur le bras de {k}. « Doucement. » Il faudra revenir, plus tard, autrement.',fx:['flag:larmes'],end:'arc'},
 smell:{who:'narr',text:'Une odeur lourde, sucrée. L’encens de la bibliothèque, celui qu’on ne brûle que dans la salle des archives. Ici, dans les dortoirs ? Quelqu’un l’a rapporté sur ses vêtements. Mais qui vient de la salle des archives jusqu’ici ?',fx:['clue:encens'],end:'arc'},
 k2lead:{who:'k2',text:{default:'Personne ne t’accuse. On veut juste comprendre.',t_tendre:'Tu as peur, je le vois. On n’est pas là pour te punir.',t_franc:'Écoute : si tu mens, on le saura. Si tu dis la vérité, on te protège.',t_deconneur:'Respire. Je te promets qu’on est beaucoup moins effrayants qu’on en a l’air. Surtout {k}.'},next:'soft'}
}},
archives3:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Planque, cette nuit, derrière les colonnes de la bibliothèque. Il fait froid, il fait noir, et {k2} est très près.',next:'b'},
 b:{who:'k2',text:{default:'Si quelqu’un vient, ce sera bientôt.',t_deconneur:'Je propose qu’on se fasse passer pour des statues. Toi, la statue de la Prudence. Moi, celle de la Beauté. Pour des raisons évidentes.',t_reserve:'(chuchote) Tu entends ? … Non, rien. Désolé{e2}.',t_taquin:'Si tu as peur du noir, tu peux me tenir la main. Je ne le dirai à personne. Enfin, pas à tout le monde.'},next:'c'},
 c:{who:'narr',text:'Minuit passé. Une lueur. Une silhouette voûtée entre dans la salle des archives, une chandelle à la main.',choices:[
  {t:'La suivre en silence.',go:'follow'},
  {t:'L’interpeller tout de suite.',go:'stop'},
  {t:'Profiter du noir pour prendre la main de {k2}.',req:{romance:true},go:'hand'}]},
 hand:{branch:[{if:{aff:3},go:'handok'},{go:'handko'}]},
 handok:{who:'narr',text:'Les doigts de {k2} se referment sur ceux de {k}. Ni l’un ni l’autre ne dit rien. Puis la lueur s’approche, et ils se lâchent. Pas tout de suite.',fx:['aff:2'],next:'follow'},
 handko:{who:'narr',text:'{k2} retire doucement sa main. « Concentre-toi. » La lueur s’approche.',next:'follow'},
 follow:{who:'narr',text:'La silhouette s’arrête devant l’étagère des registres de guerre, arrache une page, puis disparaît par l’escalier de service. Dans la lueur de la chandelle, {k} a eu le temps d’apercevoir un dos voûté. Pas celui d’une jeune femme.',fx:['clue:silhouette'],end:'arc'},
 stop:{who:'narr',text:'« Halte ! » La chandelle s’éteint. Des pas précipités, une porte qui claque. Trop tard. Sur le sol, une goutte de cire, et une odeur d’encens.',fx:['clue:encens'],end:'arc'}
}},
archives4:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Le logement de {archiviste} jouxte la bibliothèque. Ce matin, {archiviste} est au marché. La porte n’est pas fermée à clé.',next:'b'},
 b:{who:'k2',text:{default:'On n’a pas le droit d’entrer comme ça.',t_franc:'On entre. Je prendrai la responsabilité.',t_solennel:'Pénétrer chez un homme sans son accord… Que les morts nous le pardonnent.',t_deconneur:'Techniquement, une porte ouverte, c’est une invitation. Techniquement.'},next:'c'},
 c:{who:'k',text:'(Une seule chance de chercher avant son retour.)',choices:[
  {t:'Fouiller le foyer.',go:'hearth'},
  {t:'Fouiller le bureau.',go:'desk'},
  {t:'Fouiller les deux, vite.',go:'both'},
  {t:'Renoncer, attendre son retour et lui parler franchement.',go:'wait',fx:['bon:k:2']}]},
 hearth:{who:'narr',text:'Sous les cendres froides, des morceaux de parchemin à demi brûlés. On lit encore des dates : les années de la guerre.',fx:['clue:cendres'],end:'arc'},
 desk:{who:'narr',text:'Dans un tiroir, une page arrachée, pliée en quatre. Une liste : « Déserteurs de la bataille du col ». Un nom souligné, d’une main tremblante : Nikias. Le même nom de famille que {archiviste}.',fx:['clue:pere'],end:'arc'},
 both:{who:'narr',text:'Le foyer, puis le bureau, en hâte.',roll:{p:.55,ok:'bothok',ko:'caught'}},
 bothok:{who:'narr',text:'Sous les cendres, des pages brûlées. Dans le tiroir, une liste de déserteurs et un nom souligné : Nikias. Le même nom de famille que {archiviste}.',fx:['clue:cendres','clue:pere'],end:'arc'},
 caught:{who:'archiviste',text:'Que faites-vous chez moi ?! Sortez ! Sortez !',fx:['flag:surpris'],end:'arc'},
 wait:{who:'archiviste',text:'(rentre, pose son panier, voit leurs visages) … Vous savez, n’est-ce pas ? Vous savez.',fx:['flag:aveu'],end:'arc'}
}},
archives5:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Le Grand Pope attend un nom. {k} et {k2} ont rassemblé ce qu’ils ont pu. Ce soir, il faudra parler.',next:'b'},
 b:{who:'k2',text:{default:'Alors ? On est sûrs de nous ?',t_franc:'Je veux qu’on soit certains. Une accusation, ça ne se reprend pas.',t_deconneur:'Bon, inspecteur. C’est le moment de la grande révélation. Pas de pression.'},choices:[
  {t:'Accuser {archiviste}.',go:'accA'},
  {t:'Accuser {servante}.',go:'accS'},
  {t:'Dire au Pope que les preuves manquent.',go:'noacc'}]},
 accA:{branch:[{if:{clues:4},go:'truth'},{if:{flag:'aveu'},go:'truth'},{go:'weak'}]},
 truth:{who:'archiviste',text:'Mon père a fui la bataille du col. D’autres sont morts à sa place. Toute ma vie, j’ai recopié l’histoire des héros en cachant celle-là. Quand les chroniques sont revenues à la bibliothèque, je n’ai pas pu. Je voulais effacer son nom. Le mien.',next:'decide'},
 decide:{who:'k',text:'(La vérité, ou la miséricorde ?)',choices:[
  {t:'« La vérité appartient aux morts. Les pages seront recopiées, avec son nom. »',go:'justice',fx:['bon:k:1','res:savoir:25','faveur:2']},
  {t:'« Votre père a fui. Pas vous. Vous avez rebâti cette bibliothèque. Gardons ce secret. »',go:'mercy',fx:['bon:k:4','faveur:1']}]},
 justice:{who:'narr',text:'Les pages sont recopiées. Le nom de Nikias y figure, suivi d’une note de la main de son fils : « Il a eu peur. Moi aussi, longtemps. » Le Grand Pope approuve d’un signe de tête.',next:'out'},
 mercy:{who:'narr',text:'{archiviste} pleure sans bruit. Les pages ne seront pas recopiées. Mais le lendemain commence une nouvelle chronique, d’une écriture bleue et appliquée : celle de la reconstruction.',next:'out'},
 weak:{who:'narr',text:'{archiviste} nie tout, avec une dignité blessée. Sans preuves solides, le Pope classe l’affaire. Les pages ne reviendront pas.',next:'out'},
 accS:{who:'narr',text:'{servante} est convoquée devant le Pope. Elle avoue ses sorties nocturnes, son amoureux, sa honte. Rien sur les pages. Le coupable court toujours, et {servante} n’ose plus croiser le regard de personne.',fx:['bon:k:-3'],next:'out'},
 noacc:{who:'k2',text:'Tu as raison. Mieux vaut un mystère qu’une injustice.',fx:['bon:k:1'],next:'out'},
 out:{branch:[{if:{aff:5,romance:true},go:'duo'},{go:'fin'}]},
 duo:{who:'narr',text:'En sortant de chez le Pope, {k2} effleure la main de {k}. « On fait une bonne équipe, toi et moi. Il faudra trouver un autre mystère. » Ça ressemble beaucoup à une invitation.',fx:['friend:2','love:3','kk_xp'],end:'arc'},
 fin:{who:'narr',text:'Affaire close. {k} et {k2} se connaissent mieux qu’au premier jour. Les enquêtes font ça.',fx:['friend:2','kk_xp'],end:'arc'}
}},

/* ================= Le sable de l'arène (rivaux, puis respect… ou plus) ================= */
arene1:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Démonstration devant les apprentis. Le maître d’armes a choisi {k} et {k2} pour montrer une parade. {k2} a préféré montrer autre chose : {k} finit le dos dans le sable, devant tout le monde.',next:'b'},
 b:{who:'k2',text:{default:'Garde haute. Leçon numéro un.',arrogant:'Pardon. Je pensais que tu savais te battre.',t_taquin:'Applaudissez, les enfants : voilà exactement ce qu’il ne faut pas faire.',t_solennel:'La garde est un serment. Tu l’as rompu.',t_deconneur:'Et c’est ainsi que la gravité fonctionne. Merci à notre volontaire.'},next:'c'},
 c:{who:'k',text:'(Les apprentis regardent. Tout le monde regarde.)',choices:[
  {t:'Se relever en riant : « Belle prise. Je la retiens. »',go:'laugh',fx:['aff:2','bon:k:2','flag:fairplay']},
  {t:'« Recommence, si tu oses. »',go:'again',fx:['aff:1','rival:1','kk_xp']},
  {t:'Partir sans un mot, la mâchoire serrée.',go:'leave',fx:['rival:1']},
  {t:'Lui faucher la jambe en se relevant.',go:'trip',fx:['rival:2','bon:k:-3','flag:coupbas']}]},
 laugh:{who:'k2',text:'(pris{e2} de court) … Tu prends bien les choses. Je ne m’y attendais pas.',end:'arc'},
 again:{who:'narr',text:'Deuxième assaut. Cette fois, c’est {k2} qui mord la poussière. Les apprentis hurlent de joie. Le maître d’armes soupire : il voulait juste montrer une parade.',end:'arc'},
 leave:{who:'narr',text:'Dans le dos de {k}, quelques rires étouffés. {k2} ne rit pas. {Il2} regarde {k} s’éloigner avec une drôle d’expression.',end:'arc'},
 trip:{who:'narr',text:'{k2} s’écrase dans le sable à son tour. Le maître d’armes renvoie tout le monde. « Vous deux, vous me copierez la règle de l’arène. Cent fois. »',end:'arc'}
}},
arene2:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Le Grand Pope a la mémoire longue et l’humour discret : {k} et {k2} monteront la garde ensemble, cette nuit, devant la douzième maison.',next:'a2'},
 a2:{branch:[{if:{flag:'coupbas'},go:'cold'},{go:'b'}]},
 cold:{who:'k2',text:'Si tu me fauches dans l’escalier, je te pousse dans le vide. Juste pour que tu saches.',next:'c'},
 b:{who:'k2',text:{default:'Bon. Huit heures. On peut essayer de ne pas s’entretuer.',t_deconneur:'Je propose un jeu : celui qui s’endort le premier cire les sandales de l’autre pendant une semaine.',t_reserve:'(s’assoit à l’autre bout de la marche, le plus loin possible)',t_franc:'On n’est pas obligés de se parler.'},next:'c'},
 c:{who:'narr',text:'Vers minuit, le froid tombe. {k2} frissonne, et fait semblant que non.',choices:[
  {t:'Lui tendre sa cape, sans un mot.',go:'cape',fx:['aff:2','flag:cape']},
  {t:'Lui demander pourquoi {il2} se bat si dur.',go:'why',fx:['aff:2','flag:pourquoi']},
  {t:'Raconter une histoire absurde pour passer le temps.',req:{ton:'deconneur|taquin'},go:'story',fx:['aff:2']},
  {t:'Garder ses distances et surveiller l’horizon.',go:'watch'}]},
 cape:{who:'k2',text:'… Ne crois pas que ça change quoi que ce soit entre nous.',next:'cape2'},
 cape2:{who:'narr',text:'Mais {il2} la garde jusqu’au matin.',end:'arc'},
 why:{who:'k2',text:{default:'Parce que là d’où je viens, {d2}, personne n’attendait rien de moi. Alors j’attends tout de moi-même. Et toi, tu étais là, si facile, si doué{e}… Ça m’a énervé{e2}.',t_franc:'Parce que j’ai peur d’être ordinaire. Voilà. Content{e} ?',t_solennel:'Mon maître est mort en me protégeant. Je dois valoir sa vie. Chaque jour.'},end:'arc'},
 story:{who:'narr',text:'L’histoire parle d’un chevalier, d’une chèvre et d’un terrible malentendu. À trois heures du matin, {k2} pleure de rire, le front contre une colonne de la douzième maison.',end:'arc'},
 watch:{who:'narr',text:'La nuit passe, silencieuse. À l’aube, {k2} murmure un « bonne garde » à peine audible. C’est déjà ça.',end:'arc'}
}},
arene3:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'Une incursion, au crépuscule. Trois soldats d’Hermès ont franchi le mur près des réserves. {k} en tient deux en respect quand le troisième surgit dans son dos.',next:'b'},
 b:{who:'narr',text:'Un éclair de cosmos. Le troisième soldat s’effondre. {k2} est là, essoufflé{e2}, le poing encore fumant.',next:'b2'},
 b2:{branch:[{if:{flag:'pourquoi'},go:'c1'},{go:'c2'}]},
 c1:{who:'k2',text:'Ne me remercie pas. Je ne voulais pas que tu meures avant de m’avoir battu{e2} une fois. Ce serait trop facile.',next:'d'},
 c2:{who:'k2',text:{default:'On est quittes pour l’arène.',arrogant:'Tu vois ? Toujours un temps d’avance.',t_tendre:'Tu n’as rien ? Dis-moi que tu n’as rien.',t_deconneur:'Je note : un sauvetage héroïque. Tu me devras des olives jusqu’à la fin de tes jours.'},next:'d'},
 d:{who:'k',text:'(Le cœur bat encore trop vite.)',choices:[
  {t:'« Merci. Sincèrement. »',go:'thanks',fx:['aff:2']},
  {t:'« J’avais la situation en main. »',go:'proud',fx:['aff:-1','rival:1']},
  {t:'Lui prendre le bras pour voir sa blessure.',go:'care',fx:['aff:2','flag:soin']},
  {t:'« Je te dois une vie. Je paie toujours mes dettes. »',go:'debt',fx:['aff:1']}]},
 thanks:{who:'k2',text:'… De rien. Ça m’a fait plaisir. Enfin, non, ça m’a fait peur. Enfin. De rien.',end:'arc'},
 proud:{who:'k2',text:'Bien sûr. Comme dans l’arène.',end:'arc'},
 care:{who:'narr',text:'Une coupure au bras, rien de grave. {k} la bande quand même, avec un soin qui surprend {k2} autant que {k}.',end:'arc'},
 debt:{who:'k2',text:'Je retiens. Et j’ai une très bonne mémoire.',end:'arc'}
}},
arene4:{kind:'arc',start:'a',nodes:{
 a:{who:'narr',text:'L’arène est pleine. La revanche de {k} contre {k2} est devenue l’événement du mois. Même le Grand Pope a fait porter un siège.',next:'a2'},
 a2:{branch:[{if:{aff:7},go:'b1'},{go:'b2'}]},
 b1:{who:'k2',text:'Quoi qu’il arrive aujourd’hui… je suis content{e2} que ce soit toi en face.',next:'c'},
 b2:{who:'k2',text:'Cette fois, pas de pitié.',next:'c'},
 c:{who:'narr',text:'Le gong. Ils s’élancent.',roll:{p:.5,ok:'win',ko:'lose'}},
 win:{who:'narr',text:'Une feinte, une parade, et {k2} est au sol. Un silence, puis la clameur. {k} tend la main.',next:'end0'},
 lose:{who:'narr',text:'{k} n’a rien vu venir. Le sable, encore. Mais cette fois, c’est {k2} qui tend la main.',next:'end0'},
 end0:{branch:[{if:{aff:9,romance:true},go:'love'},{if:{aff:5},go:'respect'},{go:'still'}]},
 love:{who:'narr',text:'Les mains restent liées plus longtemps que nécessaire. Devant toute l’arène, {k2} murmure : « Il va falloir trouver une autre excuse pour se voir tous les jours. » Les apprentis sifflent. Le Grand Pope fait semblant de n’avoir rien vu.',fx:['couple','rival:-6','kk_xp'],end:'arc'},
 respect:{who:'k2',text:'Je retire tout ce que j’ai dit sur toi. Enfin, presque tout. … Ami{e} ?',fx:['rival:-6','friend:4','kk_xp'],end:'arc'},
 still:{who:'k2',text:'Ce n’est pas fini. Ce ne sera jamais fini, entre nous.',fx:['rival:2','kk_xp'],end:'arc'}
}}
};
