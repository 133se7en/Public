"use strict";
/* ============================================================
   L'OR DU RHIN — données : lieux, objets, quêtes, succès
   ============================================================ */

const LOCATIONS = {
  // ---- Scène I : le Rhin ----
  rhein_shallows: {
    name: "Les bas-fonds du Rhin",
    desc: (s) => `La lumière du matin d'or filtre à travers l'eau verte et claire. ${s.flags.maidens_met ? "Les ondes dansent autour de vous, pleines de rires étouffés." : "Quelque part, des rires de femmes résonnent dans le courant."} Un éclat d'or pur vacille sur un rocher au sommet d'une butte sous-marine.`,
    exits: [
      { to: "rhein_rock", label: "Nager vers le rocher lumineux" },
      { to: "rhein_depths", label: "Plonger vers les profondeurs sombres" },
      { to: "rhein_grotto", label: "Explorer la grotte de cristal" },
      { to: "valhalla_gate", label: "Remonter à la surface et longer la rive vers les cimes", if: (s)=>s.flags.knows_valhalla }
    ]
  },
  rhein_rock: {
    name: "Le Rocher de l'Or",
    desc: (s) => `Le fameux Or du Rhin, ${s.flags.gold_seen ? "que vous avez déjà contemplé" : "que vous voyez pour la première fois"}, brille d'un éclat que nul feu mortel ne saurait imiter. ${s.flags.maidens_met ? "Wellgunde, Woglinde et Floßhilde veillent à l'entour." : "Trois ondines nagent en cercle autour du rocher."}`,
    exits: [ { to: "rhein_shallows", label: "Redescendre vers les bas-fonds" } ]
  },
  rhein_depths: {
    name: "Les profondeurs du Rhin",
    desc: () => `L'eau y est noire et froide. Des épaves de navires anciens gisent dans la vase ; des os de géants des temps passés s'y entassent. Au loin, une lueur rouge trahit l'entrée des grottes de Nibelheim.`,
    exits: [
      { to: "rhein_shallows", label: "Remonter vers la lumière" },
      { to: "nibelheim_shaft", label: "Suivre la lueur rouge vers les galeries de Nibelheim", if: (s)=>s.flags.knows_nibelheim }
    ]
  },
  rhein_grotto: {
    name: "La grotte de cristal",
    desc: (s) => `Des voiles de cristal tissent les parois. ${s.flags.grotto_song ? "Les cristaux résonnent encore de votre chant — un motif gravé y persiste." : "L'eau y chante toute seule : les cristaux amplifient chaque son. Une inscription naine gravée au fond dit : « Seul un chant juste ouvre le cœur de la pierre. »"}`,
    exits: [ { to: "rhein_shallows", label: "Sortir de la grotte" } ]
  },

  // ---- Terres de surface ----
  valhalla_gate: {
    name: "Le pied du Walhalla",
    desc: (s) => `Sur la hauteur verdoyante, la forteresse des dieux achève de se dresser : le Walhalla, promesse de Wotan, bâti par les géants. ${s.flags.freia_taken ? "Freia n'est plus là pour arroser les pommes d'or — les dieux commencent à pâlir." : "Freia, déesse de la jeunesse, garde ses pommes d'or près de la forteresse."}`,
    exits: [
      { to: "rhein_shallows", label: "Redescendre vers le Rhin" },
      { to: "valhalla_hall", label: "Monter la rampe de pierre vers la salle du trône", if: (s)=>s.flags.wotan_met },
      { to: "gods_field", label: "Traverser le pré des dieux", if: (s)=>s.flags.wotan_met },
      { to: "giants_crag", label: "Monter au rocher des géants", if: (s)=>s.flags.giants_crag_open },
      { to: "earth_mound", label: "Chercher le tertre d'Erda au-delà du pré", if: (s)=>s.flags.knows_erda },
      { to: "final_shore", label: "Descendre au rivage du crépuscule", if: (s)=>s.flags.final_shore_open }
    ]
  },
  gods_field: {
    name: "Le pré des dieux",
    desc: (s) => `Une prairie suspendue entre brumes et lumière. ${s.flags.fafner_gone ? "Il n'y paraît plus rien qu'un silence inquiet." : "Fasolt et Fafner y reposent, massifs comme des montagnes, l'œil fixé sur la forteresse qu'ils ont bâtie."}`,
    exits: [
      { to: "valhalla_gate", label: "Revenir au pied du Walhalla" },
      { to: "rainbow_bridge", label: "S'avancer sur le pont de l'arc-en-ciel", if: (s)=>s.flags.bridge_built }
    ]
  },
  valhalla_hall: {
    name: "La salle du trône du Walhalla",
    desc: (s) => `Des colonnes de pierre montent vers une voûte où s'enroulent des serpents de brume. ${s.flags.wotan_met ? "Wotan, la lance en main, y délibère." : "Un trône vide attend son maître."} Fricka veille, soucieuse, près d'un banc de pierre.`,
    exits: [
      { to: "valhalla_gate", label: "Descendre au pied du Walhalla" },
      { to: "valhalla_rampart", label: "Monter au rempart", if: (s)=>s.act>=3 }
    ]
  },
  earth_mound: {
    name: "Le tertre d'Erda",
    desc: () => `Un monticule de terre noire d'où suinte une brume verte. Tout son de vie s'y éteint. On dit que la prophétesse Erda, la plus vieille du monde, y dort et y veille à la fois.`,
    exits: [ { to: "valhalla_gate", label: "Revenir vers le Walhalla" } ]
  },
  rainbow_bridge: {
    name: "Le pont de l'arc-en-ciel",
    desc: () => `Un arc de lumière et de brume relie la terre nouvelle au Walhalla. Donner y résonne encore, mais l'or maudit pèse sur chaque pas.`,
    exits: [
      { to: "gods_field", label: "Redescendre dans le pré" },
      { to: "valhalla_hall", label: "Entrer triomphalement dans le Walhalla", if: (s)=>s.act>=4 }
    ]
  },

  // ---- Scène II : Nibelheim ----
  nibelheim_shaft: {
    name: "Le puits des nains",
    desc: (s) => `La vapeur y est épaisse et le vacarme des marteaux y roule sans fin. ${s.flags.mime_freed ? "Mime, l'épaule meurtrie mais libre, vous doit une fière chandelle." : "Un nain au torse noueux, Mime, y gémit devant une enclume."}`,
    exits: [
      { to: "rhein_depths", label: "Remonter vers le Rhin" },
      { to: "nibelheim_forge", label: "Descendre à la grande forge" },
      { to: "nibelheim_mines", label: "Prendre la galerie des mines" },
      { to: "alberich_lair", label: "Se glisser vers l'antre d'Alberich", if: (s)=>s.flags.knows_lair }
    ]
  },
  nibelheim_forge: {
    name: "La grande forge de Nibelheim",
    desc: (s) => `Des centaines de nains y peinent, fouettés par la peur d'Alberich. ${s.flags.forge_song ? "Un chant de forge que vous avez appris y circule encore." : "Nul n'y chante : le maître du Tarnhelm interdit la moindre joie."}`,
    exits: [
      { to: "nibelheim_shaft", label: "Remonter au puits" },
      { to: "nibelheim_mines", label: "Aller aux mines" }
    ]
  },
  nibelheim_mines: {
    name: "Les mines de Nibelheim",
    desc: (s) => `Des galeries s'enfoncent en zigzag. ${s.flags.mine_map ? "Grâce à la carte de Mime, vous savez où mènent les trois branches." : "Trois branches s'ouvrent, et un vent mauvais en sort."}`,
    exits: [
      { to: "nibelheim_shaft", label: "Revenir au puits" },
      { to: "mine_deadfall", label: "Prendre la galerie effondrée", if: (s)=>s.flags.mine_map },
      { to: "mine_lake", label: "Prendre la galerie inondée", if: (s)=>s.flags.mine_map },
      { to: "mine_cache", label: "Prendre la galerie murée", if: (s)=>s.flags.mine_map }
    ]
  },
  mine_deadfall: {
    name: "La galerie effondrée",
    desc: () => `Un éboulis bloque la voie, mais un cliquetis d'os et d'or s'y fait entendre. Un trésor oublié des anciens Nibelungs est enseveli là.`,
    exits: [ { to: "nibelheim_mines", label: "Revenir aux mines" } ]
  },
  mine_lake: {
    name: "La galerie inondée",
    desc: () => `Un lac noir et immobile occupe le fond. Au milieu, sur un pilier, scintille quelque chose. Des bulles remontent : quelque chose vit dessous.`,
    exits: [ { to: "nibelheim_mines", label: "Revenir aux mines" } ]
  },
  mine_cache: {
    name: "La galerie murée",
    desc: (s) => `Un mur de briques naines porte l'empreinte d'une main ouverte. ${s.flags.cache_open ? "Il est ouvert sur une cache pleine de vieil or." : "Il attend une main de chair pour s'ouvrir — nul nain ne le peut."}`,
    exits: [ { to: "nibelheim_mines", label: "Revenir aux mines" } ]
  },
  alberich_lair: {
    name: "L'antre d'Alberich",
    desc: (s) => `Une salle de basalte poli où ${s.flags.alberich_captured ? "le trône est vide — son maître est prisonnier au Walhalla." : "Alberich siège, l'Anneau au doigt et le Tarnhelm à la ceinture."}`,
    exits: [ { to: "nibelheim_shaft", label: "Fuir vers le puits des nains" } ]
  },

  // ---- Scène III / IV ----
  giants_crag: {
    name: "Le rocher des géants",
    desc: (s) => `Un piton aride d'où l'on voit la terre entière. ${s.flags.fasolt_dead ? "Fafner veille seul sur le cadavre de son frère et sur l'or maudit." : "Fasolt et Fafner y attendent le tribut, l'œil dur."} La brume y sent l'orage.`,
    exits: [
      { to: "valhalla_gate", label: "Redescendre vers le Walhalla" },
      { to: "earth_mound", label: "Chercher le tertre d'Erda", if: (s)=>s.flags.knows_erda }
    ]
  },
  valhalla_rampart: {
    name: "Le rempart du Walhalla",
    desc: () => `De là-haut, la vallée du Rhin scintille. Les plaintes des filles du Rhin montent, à peine audibles, comme un reproche.`,
    exits: [ { to: "valhalla_hall", label: "Rentrer dans la salle du trône" } ]
  },
  final_shore: {
    name: "Le rivage du crépuscule",
    desc: () => `Le Rhin s'y élargit, calme et perfide. Les trois filles du Rhin y attendent l'accomplissement de toutes choses. C'est ici que l'aventure se jugera.`,
    exits: [ { to: "valhalla_gate", label: "Remonter vers le Walhalla", if:(s)=>!s.ending } ]
  }
};

/* ---------- OBJETS ---------- */
const ITEMS = {
  lettre_wotan: { name: "Lettre scellée de Wotan", desc: "Un ordre de mission : « Compte l'or, surveille les serments. — W. »" },
  perle: { name: "Perle de Woglinde", desc: "Une perle de nacre chantante, gage d'amitié du Rhin." },
  corne: { name: "Cor de conque de Floßhilde", desc: "Appelle les eaux du Rhin en cas de péril (une seule fois)." },
  tarlier: { name: "Tarnhelm (le heaume magique)", desc: "Ouvrage de Mime : transforme son porteur en forme ou en lieu quelconque." },
  anneau: { name: "🜊 L'Anneau", desc: "L'anneau forgé dans l'or renié. Il confère le pouvoir de régner — et la malédiction d'Alberich." },
  trefle_forge: { name: "Chant de forge de Nibelheim", desc: "Un air que les nains fredonnaient avant la tyrannie." },
  carte_mines: { name: "Carte des mines de Mime", desc: "Trois branches, trois dangers, trois trésors." },
  pomme: { name: "Pomme d'or de Freia", desc: "Un fruit de jeunesse : rend 10 vigueur." },
  lance_eclat: { name: "Éclat de la lance de Wotan", desc: "Un éclat des traités gravés. Preuve de serment." },
  lyre: { name: "Lyre de brume d'Erda", desc: "Jouée juste, elle endort ce qui veille." },
  vieux_or: { name: "Vieil or des Nibelungs", desc: "Un magot ancien, lourd et froid." },
  rune_mere: { name: "Rune de la Mère", desc: "Le savoir d'Erda, gravé dans l'os du monde." },
  filet_mist: { name: "Filet de brume", desc: "Tissé du brouillard de Nibelheim : rend invisible un court instant." },
  os_geant: { name: "Os de géant", desc: "Une clé massive et macabre — un levier digne de ce nom." },
  diamant_nain: { name: "Diamant nain", desc: "Pierre de valeur, monnaie des profondeurs." },
  epee_rhinemaide: { name: "Épée d'écume", desc: "Une lame d'eau vive qui ne coupe que la cupidité." }
};

/* ---------- QUÊTES ---------- */
const QUESTS = {
  rhein_promise: { name: "La promesse du Rhin", obj: ()=> "Aller au rivage du crépuscule et rendre l'or (fin)" },
  watch_ring: { name: "Le secret de l'Or", obj: (s)=> s.flags.alberich_seen ? "Suivre Alberich à Nibelheim ✔" : "Découvrir ce que devient l'or volé" },
  save_freia: { name: "Freia en péril", obj: (s)=> s.flags.ransom_paid ? "Freia est rançonnée ✔" : "Rassembler 50 pièces d'or de rançon pour les géants" },
  gold_ransom: { name: "La rançon d'or", obj: (s)=> `Or réuni : ${Math.min(S.gold,50)}/50` },
  spy_nibelheim: { name: "L'espion de Nibelheim", obj: (s)=> s.flags.alberich_captured ? "Alberich est capturé ✔ (faire rapport à Wotan)" : "Capturer Alberich par la ruse" },
  mime_help: { name: "Le forgeron fouetté", obj: (s)=> s.flags.mime_freed ? "Mime est libre ✔" : "Libérer Mime" },
  erda_riddles: { name: "Les énigmes d'Erda", obj: (s)=> `Énigmes résolues : ${((s.quests.erda_riddles||{}).prog||{}).solved||0}/3` },
  tribute: { name: "Le tribut du rocher", obj: ()=>"Assister au paiement au rocher des géants" },
  final_choice: { name: "Le destin de l'Anneau", obj: ()=>"Décider du sort de l'Anneau au rivage du crépuscule" }
};

/* ---------- SUCCÈS ---------- */
const ACHS = {
  baigneur: "Baigneur du Rhin — chanter avec les filles du Rhin",
  archéologue: "Archéologue nain — ouvrir le magot de la galerie effondrée",
  prisonnier_nain: "Preneur de nain — capturer Alberich",
  sage_erda: "Sage d'Erda — résoudre les trois énigmes",
  coeur_libre: "Cœur libre — refuser de renoncer à l'amour",
  coeur_maudit: "Cœur maudit — renoncer à l'amour pour l'or",
  chevalier_walhalla: "Chevalier du Walhalla — être adoubé par Wotan",
  libérateur: "Libérateur — rendre l'or au Rhin",
  couronne_maudite: "Roi maudit — garder l'Anneau pour soi",
  chantre: "Chantre de Nibelheim — redonner le chant aux forgerons",
  complet: "Œil de Wotan — terminer toutes les quêtes"
};
