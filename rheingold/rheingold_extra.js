"use strict";
/* ============================================================
   L'OR DU RHIN — extension : complainte, leitmotivs, tanière
   ============================================================ */

/* ---------- NOUVEAUX LIEUX ---------- */
Object.assign(LOCATIONS, {
  foret_brouillard: {
    name: "La forêt de brume",
    desc: (s) => `Des troncs noirs montent dans une brume laiteuse. ${s.flags.foret_lanterne ? "La lanterne des nains éclaire vos pas." : "On n'y voit pas à trois pas ; des yeux y brillent parfois."} On entend y résonner, très loin, le cor d'un chasseur perdu.`,
    exits: [ { to: "valhalla_gate", label: "Revenir au pied du Walhalla" } ]
  },
  taniere_fafner: {
    name: "La tanière de Fafner",
    desc: (s) => `Une grotte basse et chaude, emplie du souffle d'un dragon ${s.flags.fafner_asleep ? "endormi par votre lyre." : "qui sommeille à demi"}. L'or y dort en montagnes, veillé par un œil jaune grand comme un bouclier.`,
    exits: [ { to: "giants_crag", label: "Sortir de la tanière au grand jour" } ]
  },
  salle_tresors: {
    name: "La salle des trésors du Walhalla",
    desc: () => `Une aile neuve du Walhalla où Wotan entrepose les prémices de sa fortune : armes d'or, étoffes de brume, et des tablettes de serments anciens que nul ne doit lire.`,
    exits: [ { to: "valhalla_hall", label: "Revenir dans la salle du trône" } ]
  }
});

/* sorties vers les nouveaux lieux */
LOCATIONS.valhalla_gate.exits.push(
  { to: "foret_brouillard", label: "Pénétrer dans la forêt de brume" }
);
LOCATIONS.valhalla_hall.exits.push(
  { to: "salle_tresors", label: "Pousser la porte de la salle des trésors", if: (s)=>s.flags.wotan_met }
);
LOCATIONS.giants_crag.exits.push(
  { to: "taniere_fafner", label: "Suivre Fafner jusqu'à sa tanière", if: (s)=>s.flags.fafner_talked && s.act>=4 }
);

/* ---------- NOUVELLES QUÊTES & SUCCÈS ---------- */
Object.assign(QUESTS, {
  complainte: { name: "La Complainte des Nibelungs", obj: (s)=> `Vers retrouvés : ${s.flags.complainte_count||0}/9 (demandez à Hovbard, à la forge)` },
  leitmotivs: { name: "L'oreille d'or", obj: (s)=> `Tours réussis au jeu des leitmotivs : ${s.flags.motif_wins||0}/3` },
  taniere: { name: "Le trésor du dragon", obj: (s)=> s.flags.taniere_done ? "Fafner dort et l'or est à vous ✔" : "Entrer dans la tanière de Fafner et ressortir vivant" }
});
Object.assign(ACHS, {
  barde_nibelung: "Barde des Nibelungs — reconstituer la Complainte des neuf vers",
  oreille_doree: "Oreille d'or — réussir 3 tours du jeu des leitmotivs",
  voleur_dragon: "Voleur de dragon — dépouiller la tanière de Fafner",
  forestier: "Forestier de brume — percer les trois secrets de la forêt"
});

/* ---------- OUTILS ---------- */
function countVerses(){ return Object.keys(S.flags).filter(k=>k.startsWith("vers_")).length; }
function motifWinCount(){ return S.flags.motif_wins||0; }

function pickVerse(locKey, text) {
  const n = countVerses()+1;
  if (n>9) { narrate("Vous connaissez déjà toute la complainte."); return; }
  sFlags("vers_"+n); S.flags.complainte_count = n;
  narrate(`📜 **Vers ${n}/9 de la Complainte des Nibelungs** : « ${text} »`, "gold");
  logLine("Vers de la complainte : "+n+"/9");
  if (n===9) {
    narrate(`Les neuf vers s'assemblent dans votre mémoire comme les neuf mesures d'un chant perdu. Allez porter la complainte entière à Hovbard, le vieux nain de la forge.`, "success");
  }
}

/* ---------- ÉVÉNEMENTS ADDITIONNELS ---------- */
Object.assign(EVENTS, {

  foret_brouillard: [
    { id: "foret_lanterne", label: "Chercher une source de lumière",
      run: () => {
        if (S.flags.foret_lanterne) { narrate("Votre lanterne de nain éclaire déjà la brume."); return; }
        if (S.flags.knows_nibelheim) {
          sFlags("foret_lanterne");
          narrate(`Sous une racine, une lanterne naine oubliée — les nains de Nibelheim ont dû passer par ici jadis. Vous l'allumez : la brume recule d'un pas.`, "success");
          if (!S.flags.foret_secret1) { sFlags("foret_secret1"); honorUp(3);
            narrate(`La lumière révèle une gravure sur un tronc : des vers à demi effacés.`, "gold");
            pickVerse("foret1", "Sous la terre, le marteau chante, et nul n'entend nos pleurs."); }
        } else narrate("Vos yeux seuls percent à peine la brume. Les nains, dit-on, savent faire des lanternes.");
      }
    },
    { id: "foret_chasseur", once: true, label: "Suivre le son du cor",
      run: () => {
        sFlags("foret_chasseur");
        narrate(`Un chasseur égaré, hagard, s'accroche à un bouleau : « Je poursuis un cerf blanc depuis trois jours et je tourne en rond ! Les dieux se moquent des mortels, ami. Prends mon cor de chasse — moi, je rentre avant que la nuit ne me garde ici. »`);
        addItem("corne"); honorUp(3);
      }
    },
    { id: "foret_boucle", label: "Marcher sans but dans la brume",
      run: () => {
        if (Math.random()<.5) { heal(3); narrate("La marche vous fait du bien : +3 vigueur. Mais vous tournez en rond.", "dim"); }
        else { damage(2); narrate("Une branche vous fouette le visage : -2 vigueur. Cette forêt n'aime personne.", "danger"); }
      }
    },
    { id: "foret_puits", once: true, label: "Examiner le vieux puits de pierres noires",
      run: () => {
        sFlags("foret_puits"); sFlags("foret_secret2");
        narrate(`Un puits de pierres noires, si vieux que la mousse y a renoncé. Une voix en monte, grêle : « Un vers… j'avais un vers… » Vous vous penchez.`, "dim");
        pickVerse("foret2", "L'or que nous portions à la lune est tombé au fond des eaux.");
        S.gold += 6; narrate("Six pièces remontent avec le vers, jetées là par on ne sait qui.", "gold");
      }
    },
    { id: "foret_clearing", once: true, label: "Trouver la clairière au cerf blanc",
      run: () => {
        sFlags("foret_clearing"); 
        if (S.flags.foret_lanterne) {
          sFlags("foret_secret3"); sFlags("forestier_ok");
          narrate(`La lanterne découvre une clairière où paît un cerf blanc, immobile comme une statue. Il vous regarde, souffle sur vos mains, et disparaît. À sa place : une pomme d'or de Freia, tombée du Walhalla.`, "success");
          addItem("pomme"); unlockAch("forestier"); honorUp(8);
        } else {
          damage(3);
          narrate("Des formes blanches fuient entre les arbres. Vous trébuchez : -3 vigueur. Il faudrait de la lumière pour voir ce que cette clairière cache.", "danger");
        }
      }
    }
  ],

  salle_tresors: [
    { id: "tresors_tablettes", once: true, label: "Lire les tablettes des serments anciens",
      run: () => {
        sFlags("tresors_tablettes"); addSkill("lore_serment");
        narrate(`Des tablettes de bronze alignent tous les serments des dieux depuis l'aube du monde : la forteresse promise, Freia gagée, et — déjà — l'or du Rhin volé qui ronge la liste comme du vert-de-gris. Vous comprenez enfin la logique des traités de Wotan.`, "success"); honorUp(5);
        pickVerse("tresors", "Ce que la bouche promet, la pierre le grave à jamais.");
      }
    },
    { id: "tresors_armes", label: "Examiner les armes d'or",
      run: () => { if (S.flags.tresors_armes) { narrate("Les armes d'or n'ont plus de secrets."); return; }
        sFlags("tresors_armes"); S.gold += 7;
        narrate("Vous dénichez quelques menues pièces d'or détachées des armes : +7 pièces. Wotan ne remarquera jamais le manque.", "gold"); }
    }
  ],

  taniere_fafner: [
    { id: "taniere_lyre", once: true, label: "Jouer la lyre de brume d'Erda",
      run: () => {
        if (!S.inv.includes("lyre")) { damage(6);
          narrate("Sans lyre, vous marchez sur une écaille : le dragon se réveille à demi et vous cingle du bout de la queue : -6 vigueur. Il vous faudrait de quoi l'endormir…", "danger"); return; }
        sFlags("fafner_asleep"); sFlags("taniere_done");
        narrate(`Vous jouez le motif d'Erda sur la lyre de brume. Le souffle du dragon s'allonge, s'apaise, devient marée. Fafner s'effondre dans un sommeil de pierre.`, "success");
        finishQuest("taniere");
      }
    },
    { id: "taniere_loot", requires:(s)=>s.flags.taniere_done && !s.flags.taniere_looted, label: "Dépouiller le trésor du dragon",
      run: () => {
        sFlags("taniere_looted"); S.gold += 40; addItem("vieux_or"); unlockAch("voleur_dragon");
        narrate(`Vous emplissez votre sacoche discrètement : 40 pièces et une brique du vieil or des Nibelungs que Fafner avait confisquée. Le dragon ronfle — pour l'heure.`, "gold");
        pickVerse("taniere", "Garde tout, n'aime rien, dors dessus : voilà tout notre savoir.");
      }
    },
    { id: "taniere_verse", once: true, label: "Écouter ce que murmure le dragon",
      run: () => {
        if (S.flags.fafner_asleep) { pickVerse("taniere2", "Mon frère aimait ; moi j'ai compté ; l'or seul ne ment jamais."); honorUp(3); }
        else { damage(3); narrate("Approcher son oreille d'un dragon à demi éveillé : -3 vigueur. Attendez qu'il dorme vraiment.", "danger"); }
      }
    }
  ],

  /* vers de la complainte dans les lieux existants */
  rhein_grotto_extra: [
    { id: "grotto_verse", once: true, requires:(s)=>s.flags.grotto_song, label: "Déchiffrer la gravure naine au fond du cristal",
      run: () => pickVerse("grotto", "Le Rhin garde ce que le Rhin perd, et se souvient de tout.") }
  ],
  rhein_depths_extra: [
    { id: "depths_verse", once: true, label: "Examiner la proue gravée d'une épave",
      run: () => pickVerse("depths", "Nous avons forgé le heaume, et le heaume nous a forgés.") }
  ],
  nibelheim_shaft_extra: [
    { id: "shaft_verse", once: true, label: "Soulever la dalle gravée près de l'enclume",
      run: () => pickVerse("shaft", "Alberich nous a pris le chant, l'or, et jusqu'au nom.") }
  ],
  nibelheim_forge_extra: [
    { id: "forge_verse", once: true, label: "Écouter le vieux Hovbard, le nain barde",
      run: () => {
        sFlags("hovbard_met");
        narrate(`**Hovbard**, le plus vieux nain de la forge, un œil éteint et l'autre or, vous fait signe : « Il existait une Complainte, petit, neuf vers, celle qu'on chantait avant que le nain noir ne nous l'interdise. Retrouve les neuf vers épars dans le monde, et je te donnerai ce que la mémoire garde de mieux : le chant complet. »`);
        startQuest("complainte", "Retrouver les neuf vers de la Complainte des Nibelungs");
        pickVerse("forge", "Frère, frappe doucement : la pierre a un cœur qui bat.");
      }
    },
    { id: "forge_hovbard_reward", requires:(s)=>s.flags.hovbard_met && countVerses()>=9 && !s.flags.complainte_done, label: "Apporter les neuf vers à Hovbard",
      run: () => {
        sFlags("complainte_done"); finishQuest("complainte"); unlockAch("barde_nibelung");
        addSkill("motif_forge"); S.gold += 25; S.honor = Math.min(100, S.honor+10);
        narrate(`Vous resumez les neuf vers devant Hovbard. Le vieux nain pleure des larmes de suie, puis se redresse et chante — la Complainte entière, interdite, magnifique. Toute la forge s'arrête pour écouter, et nul fouet ne s'abat.
« Tu es des nôtres, étranger. Prends ceci. » Il vous remet une bourse (25 pièces) et le chant complet s'installe dans votre mémoire.`, "success");
      }
    },
    { id: "forge_hovbard_hint", requires:(s)=>s.flags.hovbard_met && countVerses()<9, label: "Demander à Hovbard où chercher les vers",
      run: () => {
        const where = ["la grotte de cristal du Rhin","les épaves des profondeurs","la dalle du puits des nains","la forêt de brume","le puits de pierres noires","les tablettes du Walhalla","la tanière du dragon","près de l'enclume de Mime"];
        narrate(`Hovbard compte sur ses doigts noirs : « Il en manque ${9-countVerses()}. Cherche du côté de : ${where.filter((w,i)=>!S.flags["vers_"+ (i+2)]).slice(0,3).join(" ; ")}… »`, "dim");
      }
    }
  ],
  nibelheim_mines_extra: [
    { id: "mines_verse", once: true, label: "Lire les runes au carrefour des galeries",
      run: () => pickVerse("mines", "Trois routes sous la terre : l'or, l'eau, la pierre — et nulle sortie.") }
  ],
  valhalla_rampart_extra: [
    { id: "rampart_verse", once: true, label: "Gratter la mousse du rempart",
      run: () => pickVerse("rampart", "Les dieux bâtissent haut ; les nains creusent vrai.") }
  ],

  /* ---- mini-jeu : le jeu des leitmotivs ---- */
  rhein_rock_extra: [
    { id: "motif_game", label: "🎼 Jouer au jeu des leitmotivs avec les ondines",
      run: () => leitmotivGame() }
  ],
  valhalla_hall_extra: [
    { id: "motif_game2", label: "🎼 Jouer au jeu des leitmotivs avec les dieux",
      run: () => leitmotivGame() }
  ]
});


/* fusion des événements additionnels dans les lieux existants */
for (const [k, evs] of Object.entries(EVENTS)) {
  if (k.endsWith("_extra")) {
    const base = k.slice(0, -6);
    if (!EVENTS[base]) EVENTS[base] = [];
    EVENTS[base] = EVENTS[base].concat(evs);
    delete EVENTS[k];
  }
}

/* ---------- MINI-JEU : MÉMOIRE DES LEITMOTIVS ---------- */
const MOTIF_CARDS = [
  { id:"rhein", label:"🌊 Rhin", motif:"Mi — ré — fa — la" },
  { id:"walhalla", label:"🏰 Walhalla", motif:"Sol — do — mi — sol (majesté)" },
  { id:"anneau", label:"🜊 Anneau", motif:"Si — mi — si — mi (menace)" },
  { id:"erda", label:"🌍 Erda", motif:"Ré — sol — ré (sommeil)" },
  { id:"forge", label:"🔨 Forge", motif:"Ré — la — ré — la (marteau)" },
  { id:"geants", label:"⛰ Géants", motif:"Do — sol — do (poids)" }
];

function leitmotivGame() {
  const round = (S.flags.motif_round||0)+1;
  S.flags.motif_round = round;
  const len = 3 + Math.min(3, round);
  const seq = Array.from({length: len}, ()=>MOTIF_CARDS[Math.floor(Math.random()*MOTIF_CARDS.length)]);
  S.flags.last_seq = seq.map(m=>m.id);
  const seqHtml = seq.map(m=>`<span class="tag skill">${m.label}</span>`).join(" ");
  el("overlay-content").innerHTML = `
    <h2>🎼 Le jeu des leitmotivs — tour ${round}</h2>
    <p>Woglinde chante les motifs les uns après les autres. Retenez l'ordre, puis cliquez-les dans le même ordre !</p>
    <p>${seqHtml}</p>
    <p class="dim">Sequence : ${seq.map(m=>m.motif).join(" | ")}</p>
    <div class="topbtns" id="motif-btns"></div>`;
  el("overlay").style.display="flex";
  const btns = el("motif-btns");
  let input = [];
  MOTIF_CARDS.forEach(m => {
    const b = document.createElement("button");
    b.className = "tbtn"; b.textContent = m.label;
    b.onclick = () => {
      input.push(m.id);
      b.style.background = "rgba(212,175,55,.3)";
      if (input.length === seq.length) {
        closeOverlay();
        if (input.every((v,i)=>v===seq[i].id)) {
          S.flags.motif_wins = motifWinCount()+1;
          narrate(`✔ Tour réussi (${motifWinCount()}/3) ! Les auditeurs applaudissent.`, "success");
          S.gold += 5 + round*2; honorUp(3);
          if (motifWinCount()>=3) { unlockAch("oreille_doree"); finishQuest("leitmotivs"); }
          render();
        } else {
          narrate("✗ L'ordre se brise : les auditeurs rient gentiment. Réessayez !", "danger");
          damage(1); render();
        }
      }
    };
    btns.appendChild(b);
  });
  if (!S.quests.leitmotivs) startQuest("leitmotivs", "Réussir 3 tours du jeu des leitmotivs");
}

/* ouvrir la quête de la tanière quand Fafner parle */
const _orig_fafner_talk = EVENTS.giants_crag.find(e=>e.id==="fafner_talk");
const _orig_run = _orig_fafner_talk.run;
_orig_fafner_talk.run = function(){
  _orig_run();
  startQuest("taniere", "Suivre Fafner et entrer dans sa tanière");
};
