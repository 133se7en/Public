"use strict";
/* ============================================================
   L'OR DU RHIN — événements par lieu (PNJ, quêtes, énigmes)
   ============================================================ */

const EVENTS = {
  rhein_shallows: [
    { id: "meet_maidens", once: true, label: "Approcher les rires dans le courant",
      run: () => {
        sFlags("maidens_met");
        narrate(`Trois ondines jaillissent de l'écume : **Woglinde**, l'aînée enjouée, **Wellgunde**, la moqueuse, et **Floßhilde**, la sage du Rhin.
« Un mortel dans nos eaux ! » s'esclaffent-elles. « Gare à toi, baigneur : c'est ici que le nain Alberich renonça à l'amour pour l'or — et depuis, notre trésor nous brûle les doigts. »`);
        startQuest("rhein_promise", "Aider les filles du Rhin à récupérer leur or");
      }
    },
    { id: "dive_fish", label: "Pêcher dans les roseaux (gagner un peu d'or)",
      run: () => { const g = 1 + Math.floor(Math.random()*3); S.gold += g; narrate(`Vous fouillez les roseaux et remontez ${g} pièce(s) d'or de bateaux échoués.`, "gold"); }
    }
  ],
  rhein_rock: [
    { id: "watch_gold", once: true, label: "Contempler l'Or du Rhin",
      run: () => {
        sFlags("gold_seen");
        narrate(`L'or rougeoie comme un soleil captif. Woglinde glisse près de vous : « Beau, n'est-ce pas ? Un seul être qui renoncerait à l'amour pourrait en forger un anneau qui donnerait la puissance du monde. Mais qui renoncerait à l'amour ? »`, "rhine");
        startQuest("watch_ring", "Découvrir le secret de l'Or");
      }
    },
    { id: "alberich_scene", once: true, requires: (s)=>s.flags.gold_seen, label: "Observer : un nain grimpe vers l'or",
      run: () => {
        sFlags("alberich_seen"); sFlags("knows_nibelheim");
        narrate(`Un nain velu surgit des algues : **Alberich**. Haletant d'amour, il courtise les ondines qui se moquent de lui cruellement.
« Riez donc ! » crache-t-il soudain, l'œil allumé. « Je renonce à l'amour ! » — et saisissant l'or, il l'arrache au rocher. Les eaux hurlent.`, "danger");
        narrate(`Alberich s'enfuit vers les profondeurs avec le trésor. Floßhilde vous fixe : « Retiens ce que tu as vu, étranger. Le monde va payer ce vol. »`);
        advanceQuest("watch_ring", "seen");
        if (S.quests.watch_ring && S.quests.watch_ring.state==="active") finishQuest("watch_ring");
      }
    },
    { id: "sing_maidens", label: "Chanter avec les filles du Rhin (apprendre le motif)",
      run: () => {
        if (S.flags.maiden_song) { narrate("Vous reprenez ensemble le chant du Rhin ; les eaux s'apaisent."); return; }
        sFlags("maiden_song"); addSkill("motif_rhein"); unlockAch("baigneur");
        narrate(`Woglinde vous apprend le leitmotiv du Rhin : « Mi — ré — fa — la... » Les ondes portent votre voix. Vous gagnez le savoir 🎼 Motif du Rhin.`, "success");
        honorUp(5);
      }
    },
    { id: "corne_gift", requires:(s)=>s.flags.maiden_song && !s.flags.corne_given, label: "Demander la protection du Rhin à Floßhilde",
      run: () => { sFlags("corne_given"); addItem("corne");
        narrate(`Floßhilde vous remet un cor de conque : « Souffle dedans quand tout sera perdu. Le Rhin n'abandonne pas ses amis. »`, "rhine"); }
    }
  ],
  rhein_depths: [
    { id: "wreck_search", label: "Fouiller les épaves",
      run: () => {
        if (S.flags.wreck_done) { narrate("Les épaves n'ont plus rien à offrir."); return; }
        sFlags("wreck_done"); addItem("diamant_nain"); S.gold += 5;
        narrate(`Dans une cabine de bois pourri, vous trouvez un diamant nain et 5 pièces d'or.`, "gold");
      }
    },
    { id: "bones_event", label: "Examiner les os de géants",
      run: () => { if (S.flags.bones_taken) { narrate("Le tas d'os n'a plus rien d'utile."); return; }
        sFlags("bones_taken"); addItem("os_geant"); narrate("Vous vous emparez d'un fémur de géant : une massue de fortune — et un levier digne de ce nom."); }
    }
  ],
  rhein_grotto: [
    { id: "crystal_song", label: "Chanter dans la grotte de cristal",
      run: () => {
        if (S.flags.grotto_song) { narrate("Les cristaux ruminent encore votre chant."); return; }
        openRiddle(
          "Le cristal exige une note juste : le prélude du Rheingold naît d'un accord tenu, immense, à la basse. Quel est le nom de cette note ? (indice : la tonalité de tout l'opéra)",
          ["mi", "mi bémol", "mi bemol", "e-flat", "eb"],
          () => { sFlags("grotto_song"); addSkill("motif_erda"); addItem("perle");
            narrate(`Le cristal s'ouvre en gerbe de lumière. Une perle de nacre roule à vos pieds, et un savoir s'inscrit en vous : 🎼 Motif d'Erda — la voix des profondeurs vous répondra.`, "success"); honorUp(5); },
          () => narrate("Les cristaux grincent et se referment. Réfléchissez : le prélude naît d'un accord de… (indice : la tonalité de tout l'opéra)", "danger")
        );
      }
    }
  ],
  valhalla_gate: [
    { id: "see_castle", once: true, label: "Admirer le Walhalla pour la première fois",
      run: () => { sFlags("knows_valhalla");
        narrate(`Une forteresse de pierre et de lumière couronne la hauteur : le **Walhalla**, la salle des dieux, bâtie en échange de la déesse Freia. Wotan l'arpente, ivre de sa grandeur ; Fricka, son épouse, y tremble déjà.`); }
    },
    { id: "meet_freia", once: true, label: "Parler à la déesse près des pommes d'or",
      run: () => {
        sFlags("freia_met");
        narrate(`**Freia** accourt, les joues mouillées : « Mes frères Fasolt et Fafner réclament leur salaire ! Wotan leur a promis *moi* en paiement de la forteresse ! Sauve-moi, étranger, et je te donnerai une pomme de jeunesse. »`);
        startQuest("save_freia", "Sauver Freia des géants");
      }
    },
    { id: "freia_apple", requires:(s)=>s.quests.save_freia && s.quests.save_freia.state==='done' && !s.flags.apple_given, label: "Réclamer la pomme promise par Freia",
      run: () => { sFlags("apple_given"); addItem("pomme"); narrate("Freia vous remet une pomme d'or : « Croque-la quand tes forces te quitteront. »", "success"); }
    }
  ],
  gods_field: [
    { id: "giants_talk", once: true, label: "Parler aux géants Fasolt et Fafner",
      run: () => {
        sFlags("giants_met");
        narrate(`**Fasolt** (le sentimental) : « La forteresse est bâtie, dieu rusé. Nous voulons notre salaire : la femme aux pommes d'or. »
**Fafner** (le froid) : « L'amour ne nourrit pas. L'or, si. Si le nain Alberich a volé l'or du Rhin, alors l'or vaut mieux que Freia. »`);
        startQuest("gold_ransom", "Rassembler assez d'or pour rançonner Freia (50 pièces)");
      }
    },
    { id: "giants_ransom", requires:(s)=>s.gold>=50 && s.flags.giants_met && !s.flags.ransom_paid, label: "Proposer l'or de rançon aux géants (50 pièces)",
      run: () => {
        S.gold -= 50; sFlags("ransom_paid");
        narrate(`Fafner pèse votre or d'un regard de balance : « Cela suffit pour prix. Freia est libre. Mais si un seul doigt manque au compte… » Fasolt soupire : « Nous aurions préféré la femme. »`);
        finishQuest("gold_ransom"); honorUp(15);
        if (S.quests.save_freia && S.quests.save_freia.state==="active") finishQuest("save_freia");
        narrate("Freia vous embrasse sur le front. Les dieux reprennent des couleurs.", "success");
      }
    }
  ],
  valhalla_hall: [
    { id: "meet_wotan", once: true, label: "Se présenter à Wotan",
      run: () => {
        sFlags("wotan_met");
        narrate(`**Wotan**, la lance aux traités gravés, vous dévisage : « Un mortel dans mes murs ? Soit. Il me faut un œil qui ne soit pas le mien : compte, épie, pèse. Alberich a volé l'or du Rhin et forge en bas un anneau de puissance. Rapporte-moi ce savoir, et je te ferai chevalier du Walhalla. »`);
        startQuest("spy_nibelheim", "Espionner Alberich à Nibelheim");
      }
    },
    { id: "fricka_talk", once: true, label: "Parler à Fricka",
      run: () => { sFlags("fricka_met");
        narrate(`**Fricka** : « Mon époux rêve de châteaux et d'éternité, et hypothèque l'amour pour ses murs. Retiens ceci, étranger : ce qui est promis doit être tenu — c'est gravé sur sa lance. Un jour, cette gravure le tuera. »`);
        addSkill("lore_serment"); honorUp(5);
      }
    },
    { id: "loge_talk", once: true, label: "Chercher le dieu du feu, Loge",
      run: () => { sFlags("loge_met"); sFlags("knows_nibelheim"); sFlags("knows_lair");
        narrate(`**Loge** jaillit d'un filet de flamme : « Le demi-dieu des malices, à votre service. Wotan veut l'or du nain ? Faisons simple : Alberich ne peut être pris que par ruse. Va à Nibelheim, flatte son orgueil, et quand il montrera son heaume magique… sais-le. Je te soufflerai le reste. »`);
      }
    },
    { id: "donner_talk", once: true, label: "Parler à Donner, le dieu de l'orage",
      run: () => { sFlags("donner_met");
        narrate(`**Donner** fait craquer ses phalanges : « Tout ce bavardage d'or et de serments… Un jour je nettoierai l'air d'un coup de foudre. Si l'ennui te tue en bas, souviens-toi : tenir tête à un géant, c'est surtout ne pas trembler. »`);
        addSkill("brave_orage");
      }
    },
    { id: "froh_talk", once: true, label: "Parler à Froh",
      run: () => { sFlags("froh_met");
        narrate(`**Froh** sourit : « Le pont d'arc-en-ciel, c'est moi. Quand l'heure viendra de relier la terre aux dieux, je tisserai la lumière. Mais n'y marche pas avant que l'or soit rendu… ou tu porteras le poids du monde. »`);
      }
    },
    { id: "wotan_report", requires:(s)=>s.flags.alberich_captured && !s.flags.wotan_reported, label: "Faire rapport à Wotan : Alberich est pris",
      run: () => {
        sFlags("wotan_reported"); S.act = Math.max(S.act,3); sFlags("giants_crag_open");
        narrate(`Wotan écoute, la lèvre fine : « Le nain est enchaîné et son or est à nous. Viens au rocher des géants : le tribut sera compté, et je verrai si ton œil de mortel a bien compté. »`, "gold");
        startQuest("tribute", "Aller au rocher des géants assister au paiement du tribut");
      }
    },
    { id: "wotan_lance", requires:(s)=>s.flags.wotan_reported && !s.flags.lance_given, label: "Demander à Wotan un gage de sa lance",
      run: () => { sFlags("lance_given"); addItem("lance_eclat");
        narrate(`Wotan détache un éclat de sa lance : « Le bois des traités. Tant que tu le porteras, nul géant ne te fera de mal. Mais souviens-toi : les serments protègent autant qu'ils enchaînent. »`, "success"); }
    },
    { id: "wotan_knight", requires:(s)=>s.flags.wotan_reported && s.honor>=70 && !s.flags.knighted, label: "Demander à être fait chevalier du Walhalla (honneur ≥ 70)",
      run: () => { sFlags("knighted"); unlockAch("chevalier_walhalla"); addItem("pomme");
        narrate(`Wotan touche votre épaule de sa lance : « Honneur, vaillance, parole tenue : sois chevalier du Walhalla, mortel. Les murs que voici sont aussi un peu les tiens. »`, "gold"); honorUp(10); }
    }
  ],
  earth_mound: [
    { id: "erda_summon", once: true, label: "Appeler Erda depuis le tertre",
      run: () => {
        sFlags("erda_met"); S.flags.knows_erda = true;
        narrate(`La terre s'entrouvre. **Erda**, la plus vieille du monde, monte, verte de sommeil : « Je sais tout ce qui fut. Tout ce qui est. Tout ce qui sera. Pose tes questions, mortel — mais chaque savoir a son prix. »`);
        startQuest("erda_riddles", "Résoudre les trois énigmes d'Erda");
      }
    },
    { id: "erda_riddle_go", requires:(s)=>s.flags.erda_met && s.quests.erda_riddles && s.quests.erda_riddles.state==='active', label: "Affronter une énigme d'Erda",
      run: () => erdaRiddle()
    },
    { id: "erda_wisdom", requires:(s)=>s.flags.erda_riddles_done && !s.flags.erda_wisdom, label: "Écouter le dernier conseil d'Erda",
      run: () => {
        sFlags("erda_wisdom"); addItem("rune_mere");
        narrate(`Erda pose sa main d'argile sur votre front : « Fuis l'anneau ! Malheur sans fin à qui le garde : la malédiction d'Alberich ronge tout ce qu'il touche. Si tu dois le tenir, tiens-le le moins possible. »`, "danger");
        honorUp(10);
      }
    }
  ],
  nibelheim_shaft: [
    { id: "mime_event", once: true, label: "Examiner le nain qui gémit",
      run: () => {
        sFlags("mime_met");
        narrate(`**Mime**, le frère d'Alberich, sanglote sur une enclume : monstre à la tête osseuse, forgeron incomparable. « Mon frère m'a volé mon ouvrage ! Le Tarnhelm que *j'* ai forgé, il le porte ! Et l'anneau… l'anneau qu'il s'est fait à partir de l'or volé, il me fouette avec sa puissance ! »`);
        startQuest("mime_help", "Aider Mime contre la tyrannie d'Alberich");
      }
    },
    { id: "mime_free", requires:(s)=>s.flags.mime_met && !s.flags.mime_freed, label: "Libérer Mime du fouet d'Alberich",
      run: () => {
        sFlags("mime_freed"); addItem("carte_mines"); sFlags("mine_map");
        narrate(`Vous brisez le fouet de fer qui liait Mime. Le nain, mi-reconnaissant mi-méfiant, vous glisse une carte : « Les mines. Trois galeries, trois dangers. Ne le dis pas à mon frère. »`, "success");
        advanceQuest("mime_help","freed"); honorUp(10);
        if (S.quests.mime_help && S.quests.mime_help.state==="active") finishQuest("mime_help");
      }
    },
    { id: "mime_tarnhelm_lore", requires:(s)=>s.flags.mime_freed && !s.flags.mime_lore, label: "Interroger Mime sur le Tarnhelm",
      run: () => { sFlags("mime_lore");
        narrate(`Mime ricane : « Le Tarnhelm ? Mon chef-d'œuvre. Il change la taille et la forme : dragon, crapaud, pierre… tout ce que son porteur imagine. Mais il a une faiblesse : quand son porteur *reprend sa forme* pour se vanter, il est nu comme un ver. C'est là qu'il faut frapper. »`);
        addSkill("tarnhelm_weakness");
      }
    },
    { id: "mime_weapon", requires:(s)=>s.flags.mime_freed && !s.flags.mime_weapon, label: "Demander à Mime une arme de sa forge",
      run: () => { sFlags("mime_weapon"); addItem("epee_rhinemaide");
        narrate(`Mime trempe une lame dans l'eau qu'il fait venir du Rhin : « De l'écume de nos fontaines. Elle ne coupe ni chair ni os — seulement la cupidité. Sers-t'en contre un cœur d'or. »`, "success"); }
    }
  ],
  nibelheim_forge: [
    { id: "forge_song_event", label: "Redonner le chant aux forgerons",
      run: () => {
        if (S.flags.forge_song) { narrate("La forge fredonne désormais votre chant."); return; }
        if (S.skills.includes("motif_rhein")) {
          sFlags("forge_song"); addItem("trefle_forge"); addSkill("motif_forge"); unlockAch("chantre");
          narrate(`Vous entonnez le motif du Rhin par-dessus les marteaux. Un à un, les nains relèvent la tête et reprennent un vieil air de forge. Un vieux nain vous remet le chant noté : « Pour ce qu'on n'avait plus osé chanter. »`, "success"); honorUp(10);
        } else {
          narrate("Les nains baissent la tête : « Chantons ? Alberich nous briserait les dents. » Il leur faudrait un chant venu d'ailleurs… peut-être des eaux du Rhin.");
        }
      }
    },
    { id: "forge_work", label: "Travailler à la forge (gagner de l'or)",
      run: () => {
        const g = 2 + Math.floor(Math.random()*4); S.gold += g; damage(1);
        narrate(`Vous martelez une heure durant. Vos mains brûlent mais votre bourse grossit de ${g} pièces.`, "gold");
        if (S.skills.includes("motif_forge")) { S.gold += 3; narrate("Le chant de forge porte vos coups : +3 pièces.", "gold"); }
      }
    }
  ],
  nibelheim_mines: [
    { id: "mine_wander", label: "Écouter le vent des galeries (sans carte)",
      run: () => {
        const r = Math.random();
        if (r < .4) { damage(3); narrate("Un éboulement vous frôle : -3 vigueur. Une carte vous aurait épargné cela.", "danger"); }
        else { S.gold += 4; narrate("Vous ramassez 4 pièces dans une veine abandonnée.", "gold"); }
      }
    }
  ],
  mine_deadfall: [
    { id: "deadfall_dig", label: "Creuser l'éboulis",
      run: () => {
        if (S.flags.deadfall_done) { narrate("Il n'y a plus que de la poussière."); return; }
        if (S.inv.includes("os_geant")) {
          sFlags("deadfall_done"); addItem("vieux_or"); S.gold += 20;
          narrate(`Vous servez de l'os de géant comme d'un levier. Le rocher cède : un magot du vieil or des Nibelungs et 20 pièces !`, "gold");
          unlockAch("archéologue");
        } else { damage(4); narrate("Vous creusez à mains nues : -4 vigueur. Il vous faudrait un levier digne de ce nom.", "danger"); }
      }
    }
  ],
  mine_lake: [
    { id: "lake_dive", label: "Plonger vers le pilier scintillant",
      run: () => {
        if (S.flags.lake_done) { narrate("Le lac est vide désormais."); return; }
        if (S.skills.includes("motif_rhein")) {
          sFlags("lake_done"); addItem("filet_mist"); S.gold += 10;
          narrate(`Vous chantez le motif du Rhin. Les bulles s'apaisent, une forme d'eau se retire. Vous nagez jusqu'au pilier : un filet de brume et 10 pièces d'or !`, "success");
        } else { damage(5); narrate("Quelque chose vous mord dans l'ombre : -5 vigueur. Les eaux noires ne répondent qu'aux chants du Rhin.", "danger"); }
      }
    }
  ],
  mine_cache: [
    { id: "cache_open_ev", label: "Poser la main sur le mur nain",
      run: () => {
        if (S.flags.cache_open) { narrate("La cache est déjà vide."); return; }
        sFlags("cache_open"); S.gold += 15; addItem("diamant_nain");
        narrate(`Le mur reconnaît votre paume de chair. Il pivote : 15 pièces et un diamant nain dorment dans la cache.`, "gold");
      }
    }
  ],
  alberich_lair: [
    { id: "alberich_confront", once: true, label: "Affronter Alberich sur son trône",
      run: () => {
        sFlags("alberich_talked");
        narrate(`**Alberich** se dresse, l'Anneau au doigt : « Un mortel ? Les dieux m'ont volé l'amour des ondines, alors j'ai volé l'or. Avec l'anneau, je rassemblerai les Nibelungs, je prendrai le monde, et les dieux ramperont ! »`, "danger");
        narrate("Il toise votre sacoche : « Que portes-tu là, espion ? Montre-moi si tu viens en ami… ou meurs comme un chien. »");
      }
    },
    { id: "alberich_trick", requires:(s)=>s.flags.alberich_talked && !s.flags.alberich_tricked, label: "Flatter Alberich : lui faire démontrer le Tarnhelm",
      run: () => {
        if (S.skills.includes("tarnhelm_weakness")) {
          sFlags("alberich_tricked");
          narrate(`Vous louangez le heaume : « On dit qu'il change la forme… mais peut-il rendre *invisible* ? » Vantard, Alberich se dissout en brume — puis, pour prouver sa supériorité, reprend forme de nain en éclatant de rire.
**C'est l'instant.** Vous le ceignez de vos bras, et le Tarnhelm tombe.`, "success");
          honorUp(5);
        } else {
          damage(6);
          narrate("Alberich se change en dragon et vous flanque un coup de queue : -6 vigueur. Sans connaître la faiblesse du heaume, la ruse échoue. Quelqu'un à Nibelheim la connaît sans doute…", "danger");
        }
      }
    },
    { id: "alberich_bind", requires:(s)=>s.flags.alberich_tricked && !s.flags.alberich_captured, label: "Lier Alberich et le hisser vers le Walhalla",
      run: () => {
        sFlags("alberich_captured");
        narrate(`Lié et traîné hors de son royaume, Alberich hurla sa malédiction : « L'anneau ! Que qui le porte soit maudit : l'envie le rongera, la peur le tiendra, le meurtre le couronnera ! » Puis on l'emmena, enchaîné, vers les dieux.`, "danger");
        finishQuest("spy_nibelheim");
        narrate("Sa dépouille confisquée est là : le Tarnhelm, l'or du Rhin en lingots… et l'Anneau, au doigt du prisonnier.");
        unlockAch("prisonnier_nain");
      }
    },
    { id: "lair_loot", requires:(s)=>s.flags.alberich_captured && !s.flags.lair_looted, label: "Ramasser le butin de l'antre",
      run: () => {
        sFlags("lair_looted"); addItem("tarlier"); S.gold += 30;
        narrate(`Vous empochez le **Tarnhelm** et 30 pièces de l'or du Rhin. L'Anneau, lui, est sur le doigt d'Alberich — et Wotan le voudra. Allez faire votre rapport au Walhalla.`, "gold");
      }
    }
  ],
  giants_crag: [
    { id: "tribute_scene", once: true, requires:(s)=>s.flags.wotan_reported, label: "Assister au compte du tribut",
      run: () => {
        narrate(`Sur le rocher, l'or du Rhin est entassé. Alberich enchaîné ricanne. Wotan arrache l'Anneau de son doigt malgré ses cris — et le pose sur le tas.
**Fasolt**, le sentimental, aime Freia : il demande qu'on la cache derrière l'or. **Fafner** compte, compte… et réclame l'Anneau, « le cœur de la puissance ». Fasolt, fou de douleur, refuse. Ils se battent. Fafner abat son frère d'un coup de masse.`, "danger");
        narrate(`« Le premier effet de la malédiction », souffle Erda dans toutes les têtes à la fois. Freia est rendue, mais l'Anneau brûle de malheur.`, "dim");
        sFlags("fasolt_dead"); sFlags("fafner_gone"); finishQuest("tribute");
        S.act = 4; sFlags("bridge_built"); sFlags("final_shore_open");
        narrate(`Froh tisse le **pont de l'arc-en-ciel**. Donner fait gronder le tonnerre pour purifier l'air. Les dieux s'apprêtent à monter au Walhalla — mais les filles du Rhin gémissent : « Rends l'or ! Rends l'or ! »`, "rhine");
        startQuest("final_choice", "Aller au rivage du crépuscule et décider du sort de l'Anneau");
        addItem("anneau");
        narrate(`Dans la confusion, Wotan — la main brûlée par la malédiction — vous confie l'Anneau : « Tiens, mortel. Porte-le au rivage. Fais ce que je ne peux pas. » **L'Anneau est en votre possession.**`, "gold");
      }
    },
    { id: "fafner_talk", requires:(s)=>s.flags.fasolt_dead && !s.flags.fafner_talked, label: "Parler à Fafner, seul avec son or",
      run: () => {
        sFlags("fafner_talked");
        narrate(`**Fafner**, assis sur son frère mort et sur son or : « La puissance ne se partage pas, petit. J'emporterai tout ceci dans une grotte et je dormirai dessus. Si tu es sage, tu feras pareil : garde tout, n'aime rien, et tu vivras vieux. »`);
        if (S.honor >= 60) { honorUp(5); narrate("Sa froideur vous glace le cœur — mais vous ne baissez pas les yeux. (+honneur)", "success"); }
      }
    },
    { id: "crag_foret", label: "Fouiller les recoins du rocher",
      run: () => { if (S.flags.crag_looted) { narrate("Rien de plus."); return; } sFlags("crag_looted"); S.gold += 8;
        narrate("Vous ramassez 8 pièces échappées au tas du tribut.", "gold"); }
    }
  ],
  valhalla_rampart: [
    { id: "rampart_listen", label: "Écouter la vallée du haut du rempart",
      run: () => {
        if (S.skills.includes("motif_erda")) {
          narrate(`Avec le savoir d'Erda, vous percez la brume : les plaintes du Rhin montent claires. « L'or ! Rends-nous l'or ! » Et sous le pont, quelque chose de noir veille — un nain évadé ?`, "rhine");
          sFlags("heard_rhein");
        } else narrate("Les plaintes du Rhin montent, à peine audibles. Il vous faudrait l'oreille des profondeurs.");
      }
    }
  ],
  final_shore: [
    { id: "final_act", requires:(s)=>s.act>=4 && !s.ending, label: "⚡ Affronter l'heure du choix final",
      run: () => finalChoice()
    }
  ]
};
