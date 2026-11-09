// Harnais de test : DOM minimal + simulation complète d'une partie
const elements = {};
function fakeEl(id){
  if(!elements[id]) {
    const o = { textContent:"", style:{}, _children:[], children:[],
      appendChild(c){ this._children.push(c); },
      prepend(c){ this._children.unshift(c); },
      firstElementChild:{ style:{} },
      addEventListener(){}, focus(){}, onclick:null, value:"non" };
    Object.defineProperty(o, "innerHTML", {
      get(){ return o._html; },
      set(v){ o._html = v; o._children.length = 0; }
    });
    Object.defineProperty(o, "children", { get(){ return o._children; } });
    Object.defineProperty(o, "lastChild", { get(){ const c=o._children; const last={ remove(){ c.pop(); } }; return c.length?last:{ remove(){} }; } });
    elements[id] = o;
  }
  return elements[id];
}
global.document = {
  getElementById: fakeEl,
  createElement: () => ({ style:{}, classList:{ add(){} }, appendChild(){}, addEventListener(){}, remove(){} })
};
global.localStorage = { _d:{}, getItem(k){return this._d[k]||null;}, setItem(k,v){this._d[k]=v;} };
global.confirm = () => true;

const fs = require("fs");
const src = ["rheingold_data.js","rheingold_events.js","rheingold_extra.js","rheingold.js"]
  .map(f => fs.readFileSync(f, "utf8")).join("\n;\n");
const patched = src + "\n;globalThis.__S=()=>S; globalThis.__run=(loc,evId)=>{S.loc=loc;const ev=(EVENTS[loc]||[]).find(e=>e.id===evId);if(!ev)throw new Error('evenement inconnu '+evId+' en '+loc);S.flags['ev_'+ev.id]=true;ev.run();render();};";
eval(patched + "\n;globalThis.LOCATIONS=LOCATIONS; globalThis.EVENTS=EVENTS; globalThis.QUESTS=QUESTS; globalThis.ACHS=ACHS;");
document.getElementById("begin").onclick();

const run = globalThis.__run;
function answer(v){ elements["riddle-in"].value = v; elements["riddle-ok"].onclick(); }
const S = new Proxy({}, { get:(t,k)=>globalThis.__S()[k], set:(t,k,v)=>{globalThis.__S()[k]=v; return true;} });
const { LOCATIONS, EVENTS, QUESTS, ACHS } = globalThis;

// cohérence
let errs = [];
for (const [id, evs] of Object.entries(EVENTS)) if (!LOCATIONS[id]) errs.push("lieu manquant: "+id);
for (const [id, loc] of Object.entries(LOCATIONS))
  loc.exits.forEach(e => { if (!LOCATIONS[e.to]) errs.push("sortie inconnue "+e.to+" depuis "+id); });
if (errs.length) { console.log("ERREURS:", errs); process.exit(1); }

// ---- simulation complète : trame principale ----
run("rhein_shallows","meet_maidens");
run("rhein_rock","watch_gold");
run("rhein_rock","alberich_scene");
run("rhein_rock","sing_maidens");
run("rhein_rock","corne_gift");
run("rhein_grotto","crystal_song"); answer("je ne sais pas");
if (S.flags.grotto_song) throw new Error("une mauvaise réponse ne devrait pas ouvrir le cristal");
run("rhein_grotto","crystal_song"); answer("mi bémol");
if (!S.flags.grotto_song || !S.skills.includes("motif_erda")) throw new Error("le motif d'Erda devrait être appris");
run("rhein_grotto","grotto_verse");
run("rhein_depths","wreck_search");
run("rhein_depths","bones_event");
run("rhein_depths","depths_verse");

S.flags.knows_valhalla = true;
run("valhalla_gate","see_castle");
run("valhalla_gate","meet_freia");
S.flags.wotan_met = true;
run("valhalla_hall","meet_wotan");
run("valhalla_hall","fricka_talk");
run("valhalla_hall","loge_talk");
run("valhalla_hall","donner_talk");
run("valhalla_hall","froh_talk");
run("salle_tresors","tresors_tablettes");
run("salle_tresors","tresors_armes");
run("gods_field","giants_talk");
S.gold = 60;
run("gods_field","giants_ransom");
if (S.gold !== 20) throw new Error("rançon : or attendu 20, obtenu "+S.gold);
run("valhalla_gate","freia_apple");

S.flags.knows_erda = true;
run("earth_mound","erda_summon");
run("earth_mound","erda_riddle_go"); answer("walhalla");
run("earth_mound","erda_riddle_go"); answer("anneau");
run("earth_mound","erda_riddle_go"); answer("serment");
if (!S.inv.includes("lyre")) throw new Error("la lyre d'Erda devrait être obtenue");
run("earth_mound","erda_wisdom");

// forêt de brume
S.flags.knows_nibelheim = true;
run("foret_brouillard","foret_lanterne");
run("foret_brouillard","foret_chasseur");
run("foret_brouillard","foret_puits");
run("foret_brouillard","foret_clearing");
if (!S.achievements.forestier) throw new Error("le haut fait forestier devrait être débloqué");

// nibelheim
run("nibelheim_shaft","mime_event");
run("nibelheim_shaft","mime_free");
run("nibelheim_shaft","mime_tarnhelm_lore");
run("nibelheim_shaft","mime_weapon");
run("nibelheim_shaft","shaft_verse");
run("nibelheim_forge","forge_song_event");
run("nibelheim_forge","forge_verse");        // Hovbard, barde + vers
run("nibelheim_forge","forge_hovbard_hint"); // indice (avant tous les vers)
run("nibelheim_mines","mines_verse");
run("mine_deadfall","deadfall_dig");
run("mine_lake","lake_dive");
run("mine_cache","cache_open_ev");

// mini-jeu des leitmotivs : 3 tours gagnés
for (let t=0; t<3; t++) {
  delete elements["motif-btns"]; // le vrai DOM recrée ce conteneur à chaque tour
  run("rhein_rock","motif_game");
  const seq = S.flags.last_seq;
  const btns = elements["motif-btns"].children;
  seq.forEach(id => {
    const card = ["🌊 Rhin","🏰 Walhalla","🜊 Anneau","🌍 Erda","🔨 Forge","⛰ Géants"][["rhein","walhalla","anneau","erda","forge","geants"].indexOf(id)];
    const b = btns.find(x => x.textContent === card);
    b.onclick();
  });
}
if ((S.flags.motif_wins||0) < 3) throw new Error("3 tours de leitmotivs devraient être gagnés, obtenu "+S.flags.motif_wins);

// alberich
S.flags.knows_lair = true;
run("alberich_lair","alberich_confront");
run("alberich_lair","alberich_trick");
run("alberich_lair","alberich_bind");
run("alberich_lair","lair_loot");
run("valhalla_hall","wotan_report");
run("valhalla_hall","wotan_lance");
run("valhalla_hall","wotan_knight");
S.flags.giants_crag_open = true;
run("giants_crag","tribute_scene");
run("giants_crag","fafner_talk");
run("giants_crag","crag_foret");
if (!S.inv.includes("anneau")) throw new Error("l'anneau devrait être en possession");

// tanière de Fafner
run("taniere_fafner","taniere_lyre");
if (!S.flags.fafner_asleep) throw new Error("la lyre devrait endormir Fafner");
run("taniere_fafner","taniere_loot");
run("taniere_fafner","taniere_verse");
run("valhalla_rampart","rampart_verse");
run("valhalla_rampart","rampart_listen");

// complainte complète ?
const verses = Object.keys(S.flags).filter(k=>k.startsWith("vers_")).length;
if (verses < 9) throw new Error("9 vers attendus, obtenu "+verses);
run("nibelheim_forge","forge_hovbard_reward");
if (!S.achievements.barde_nibelung) throw new Error("le haut fait barde devrait être débloqué");

// fin
S.flags.final_shore_open = true;
run("final_shore","final_act");
document.getElementById("f1").onclick();
if (!S.ending) throw new Error("la fin n'a pas été enregistrée");

console.log("Fin atteinte :", S.ending);
console.log("Quêtes accomplies :", Object.values(S.quests).filter(q=>q.state==="done").length+"/"+Object.keys(QUESTS).length);
console.log("Hauts faits :", Object.keys(S.achievements).length+"/"+Object.keys(ACHS).length);
console.log("Vers de la complainte :", verses, "| Or :", S.gold, "| Honneur :", S.honor);
console.log("=== SIMULATION COMPLÈTE : OK ===");
