"use strict";
/* ============================================================
   L'OR DU RHIN — moteur du jeu
   ============================================================ */
let S = null;

function freshState() {
  return {
    name: "Étranger",
    loc: "rhein_shallows",
    act: 1,
    hp: 20, hpMax: 20,
    honor: 50,
    gold: 0,
    renounced: false,
    time: 0,
    inv: ["lettre_wotan"],
    skills: [],
    flags: {},
    quests: {},
    achievements: {},
    visited: {},
    log: [],
    turn: 0,
    ending: null
  };
}

/* ---------- AFFICHAGE ---------- */
const el = (id)=>document.getElementById(id);

function narrate(text, cls) {
  const d = document.createElement("div");
  if (cls) d.className = cls;
  d.innerHTML = md(text);
  el("story").appendChild(d);
  el("story").scrollTop = el("story").scrollHeight;
}
function md(t) {
  return t.replace(/\*\*(.+?)\*\*/g, '<span class="gold">$1</span>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
}
function logLine(t) {
  S.log.unshift(`[${S.turn}] ${t}`);
  S.log = S.log.slice(0, 60);
  const d = document.createElement("div"); d.textContent = `[${S.turn}] ${t}`;
  el("log").prepend(d);
  while (el("log").children.length > 60) el("log").lastChild.remove();
}
function sFlags(f){ S.flags[f] = true; }
function addItem(id){ if(!S.inv.includes(id)) { S.inv.push(id); logLine("Obtenu : "+ITEMS[id].name); } }
function removeItem(id){ S.inv = S.inv.filter(i=>i!==id); }
function addSkill(id){ if(!S.skills.includes(id)) { S.skills.push(id); logLine("Savoir appris : "+skillName(id)); } }
function damage(n){ S.hp = Math.max(0, S.hp-n); if (S.hp<=0) death(); }
function heal(n){ S.hp = Math.min(S.hpMax, S.hp+n); }
function honorUp(n){ S.honor = Math.min(100, S.honor+n); }
function honorDown(n){ S.honor = Math.max(0, S.honor-n); }
function unlockAch(id){ if(!S.achievements[id]) { S.achievements[id]=true; narrate(`🏆 Haut fait : ${ACHS[id]}`, "success"); logLine("Haut fait : "+ACHS[id]); } }

/* ---------- QUÊTES ---------- */
function startQuest(id, desc) {
  if (S.quests[id]) return;
  S.quests[id] = { state: "active", prog: {} };
  narrate(`🗡 Nouvelle quête : **${QUESTS[id].name}** — ${desc}`, "dim");
  logLine("Quête : "+QUESTS[id].name);
}
function advanceQuest(id, key, val) {
  if (!S.quests[id]) startQuest(id, "");
  if (val!==undefined) S.quests[id].prog[key]=val; else S.quests[id].prog[key]=true;
}
function finishQuest(id) {
  if (!S.quests[id]) S.quests[id]={state:"done",prog:{}};
  S.quests[id].state = "done";
  narrate(`✔ Quête accomplie : **${QUESTS[id].name}** (+5 pièces)`, "success");
  logLine("Quête accomplie : "+QUESTS[id].name);
  S.gold += 5;
  checkAllDone();
}
function checkAllDone(){
  const ids = Object.keys(QUESTS);
  if (ids.every(q => S.quests[q] && S.quests[q].state==="done")) unlockAch("complet");
}

/* ---------- ÉNIGMES ---------- */
function openRiddle(question, answers, onWin, onLose) {
  el("overlay-content").innerHTML = `
    <h2>Énigme</h2><p>${question}</p>
    <input class="riddle-input" id="riddle-in" placeholder="Votre réponse…">
    <div class="topbtns"><button class="tbtn" id="riddle-ok">Répondre</button>
    <button class="tbtn" id="riddle-no">Y renoncer</button></div>`;
  el("overlay").style.display="flex";
  const check = () => {
    const v = el("riddle-in").value.trim().toLowerCase();
    closeOverlay();
    if (answers.some(a=>v.includes(a))) onWin(); else onLose(v);
  };
  el("riddle-ok").onclick = check;
  el("riddle-no").onclick = () => { closeOverlay(); narrate("Vous renoncez… pour l'instant.","dim"); };
  el("riddle-in").focus();
  el("riddle-in").addEventListener("keydown", e=>{ if(e.key==="Enter") check(); });
}
function closeOverlay(){ el("overlay").style.display="none"; }

const ERDA_RIDDLES = [
  { q: "Première énigme : « Je suis promise avant d'être bâtie, je loge des dieux mais coûte une déesse. Que suis-je ? »",
    a: ["walhalla","valhalla","forteresse","château","chateau"],
    hint: "Regarde la hauteur…" },
  { q: "Deuxième énigme : « Je suis forgé dans le reniement. Qui me porte tient le monde, et le perd. Que suis-je ? »",
    a: ["anneau","bague","ring"],
    hint: "Un cercle d'or…" },
  { q: "Troisième énigme : « Je suis gravé dans le bois d'une lance : tenir, c'est vivre ; trahir, c'est périr. Que suis-je ? »",
    a: ["serment","traité","traite","parole","promesse","contrat"],
    hint: "Ce que Wotan grave sur sa lance…" }
];
function erdaRiddle() {
  const solved = (S.quests.erda_riddles.prog.solved)||0;
  if (solved >= 3) { narrate("Erda n'a plus d'énigmes pour vous."); return; }
  const r = ERDA_RIDDLES[solved];
  openRiddle(r.q, r.a,
    () => {
      const n = solved+1;
      advanceQuest("erda_riddles","solved",n);
      narrate(`Erda hoche la tête : « Juste. » (${n}/3)`, "success"); heal(5); honorUp(5);
      if (n>=3) { sFlags("erda_riddles_done"); finishQuest("erda_riddles"); unlockAch("sage_erda"); addItem("lyre"); }
    },
    () => { narrate(`Erda secoue la terre : « Faux. ${r.hint} »`, "danger"); damage(2); }
  );
}

/* ---------- CHOIX FINAL ---------- */
function finalChoice() {
  const hasRing = S.inv.includes("anneau");
  el("overlay-content").innerHTML = `
    <h2>L'heure du choix</h2>
    <p>Au rivage du crépuscule, les filles du Rhin vous attendent. ${hasRing ? "L'Anneau brûle dans votre paume." : "L'Anneau est au doigt de Wotan, qui s'apprête à monter le pont d'arc-en-ciel."}</p>
    <p>Que décidez-vous, ${S.name} ?</p>
    <div class="topbtns" style="flex-direction:column">
      <button class="tbtn" id="f1">Rendre l'or et l'Anneau au Rhin, quoi qu'il m'en coûte</button>
      <button class="tbtn" id="f2">Garder l'Anneau : qui le tient règne sur le monde</button>
      <button class="tbtn" id="f3">Réclamer l'Anneau à Wotan au nom des filles du Rhin (parole et serment)</button>
      <button class="tbtn" id="f4">Jeter l'Anneau dans le Rhin et partir, sans rien demander</button>
    </div>`;
  el("overlay").style.display="flex";
  el("f1").onclick = ()=>ending(hasRing ? "rhein_ring" : "rhein_plea");
  el("f2").onclick = ()=>ending(hasRing ? "tyrant_self" : "tyrant_steal");
  el("f3").onclick = ()=>ending("wotan_plea");
  el("f4").onclick = ()=>ending("wanderer");
}

function ending(key) {
  closeOverlay();
  S.ending = key;
  const honor = S.honor, ren = S.renounced;
  const E = {
    rhein_ring: {
      t: "🜊 L'Or rendu au Rhin",
      x: `Vous tendez l'Anneau aux ondines. Woglinde le fait tourner, rieuse ; l'or s'abîme dans l'eau et le Rhin brille comme aux premiers jours. Alberich, tapi sous le pont, hurle. Les dieux montent le pont d'arc-en-ciel, et la malédiction ne les suivra pas — cette fois. « Le monde te doit une chanson », dit Floßhilde. ${honor>=70?"Vous la méritez.":""}`,
      ach: "libérateur"
    },
    rhein_plea: {
      t: "🌊 La supplique du Rhin exaucée",
      x: `Vous n'avez pas l'Anneau, mais vous avez la parole : devant tous, vous citez le serment gravé sur la lance de Wotan. Pris à son propre traité, le dieu cède l'Anneau aux filles du Rhin. Donner tonne ; l'or s'abîme dans l'eau. Le Walhalla se dresse, beau et vide de malédiction — pour un temps. Erda, quelque part, sourit dans son sommeil.`,
      ach: "libérateur"
    },
    tyrant_self: {
      t: "👑 Le roi maudit",
      x: `Vous glissez l'Anneau à votre doigt. La puissance monte comme une fièvre. Mais la malédiction d'Alberich vous connaît déjà : ${ren?"vous aviez renié l'amour, et l'or vous reconnaît pour sien.":"vous qui aimiez encore, l'or vous apprendra à ne plus aimer."} Les jours qui suivent vous assoient sur un trône — et chaque nuit, un frère, un ami, un serviteur vous trahira. Le monde est à vous. Il n'y paraît personne pour le partager.`,
      ach: "couronne_maudite"
    },
    tyrant_steal: {
      t: "🗡 Le vol du siècle",
      x: `Vous dérobez l'Anneau au doigt de Wotan au milieu du pont d'arc-en-ciel. Le dieu se retourne trop tard. Mais la malédiction ne fait pas de distinction entre voleurs : avant la nuit, les dieux vous chassent, et l'or vous pèse d'un poids de tombeau. Vous régnez sur rien, redouté de tous, aimé de personne.`,
      ach: "couronne_maudite"
    },
    wotan_plea: {
      t: "⚖️ Le droit contre la force",
      x: `Vous montez sur le pont et, devant l'assemblée des dieux, vous demandez l'Anneau au nom des filles du Rhin. Wotan hésite — puis Erda elle-même se dresse de la brume : « Rends l'anneau ! » Le dieu, la lance en avant, cède l'or au Rhin. Fasolt est mort, mais le cycle de la malédiction est brisé pour un temps. Les dieux vous saluent comme un homme de parole. ${honor>=60?"Et votre honneur le prouve.":"Nul n'oubliera, pourtant, d'où vous venez."}`,
      ach: "chevalier_walhalla"
    },
    wanderer: {
      t: "🚶 L'étranger s'en va",
      x: `Vous jetez l'or dans l'eau sans un mot et partez avant que quiconque ne vous remercie. Le Rhin chante derrière vous. Les dieux monteront leur pont ; l'or dormira ; et vous, vous porterez partout l'histoire d'un soir où le monde a failli se perdre — et où un étranger a choisi de n'en rien garder.`
    }
  };
  const e = E[key];
  if (e.ach) unlockAch(e.ach);
  narrate(`**${e.t}**\n\n${e.x}`, "gold");
  if (S.quests.rhein_promise && S.quests.rhein_promise.state==="active" && key!=="tyrant_self" && key!=="tyrant_steal") finishQuest("rhein_promise");
  if (S.quests.final_choice && S.quests.final_choice.state==="active") finishQuest("final_choice");
  narrate(`— FIN —\nHonneur final : ${S.honor}/100 · Or : ${S.gold} · Quêtes accomplies : ${Object.values(S.quests).filter(q=>q.state==="done").length}/${Object.keys(QUESTS).length}\nVous pouvez recommencer (bouton ↺) pour découvrir les ${Object.keys(E).length} fins.`, "dim");
  render();
}

/* ---------- MORT ---------- */
function death() {
  narrate(`💀 Les ténèbres vous emportent. Mais le Rhin rend volontiers ceux qu'il aime : les ondes vous reposent sur la berge, une pomme d'or à la bouche.`, "danger");
  S.hp = Math.max(6, Math.floor(S.hpMax/2));
  S.loc = "rhein_shallows";
  S.gold = Math.floor(S.gold/2);
  narrate(`Vous perdez la moitié de votre or. La légende des héros est faite de ces retours.`, "dim");
  render();
}

/* ---------- RENDU ---------- */
function render() {
  const loc = LOCATIONS[S.loc];
  el("location").textContent = "◈ " + loc.name;
  el("s-name").textContent = S.name;
  el("s-act").textContent = ["I","II","III","IV"][S.act-1] || "IV";
  el("s-hp").textContent = `${S.hp}/${S.hpMax}`;
  el("hp-bar").firstElementChild.style.width = (100*S.hp/S.hpMax)+"%";
  el("s-honor").textContent = S.honor+"/100";
  el("honor-bar").firstElementChild.style.width = S.honor+"%";
  el("s-gold").textContent = S.gold;
  el("s-love").textContent = S.renounced ? "A renié l'amour" : "Aime encore";
  el("s-time").textContent = ["Aube","Matin","Midi","Après-midi","Soir","Nuit"][Math.min(5,Math.floor(S.time/4))];
  el("inv").innerHTML = S.inv.length ? S.inv.map(i=>`<span class="tag item" title="${(ITEMS[i].desc||"").replace(/"/g,'&quot;')}">${ITEMS[i].name}</span>`).join("") : '<span class="dim">— vide —</span>';
  el("skills").innerHTML = S.skills.length ? S.skills.map(s=>`<span class="tag skill">${skillName(s)}</span>`).join("") : '<span class="dim">— aucun —</span>';
  renderChoices();
}
function skillName(s) {
  return { motif_rhein:"Motif du Rhin", motif_erda:"Motif d'Erda", motif_forge:"Chant de forge", lore_serment:"Lore des serments", tarnhelm_weakness:"Faiblesse du Tarnhelm", brave_orage:"Cœur d'orage", lore_alberich:"Colère d'Alberich" }[s] || s;
}
function renderChoices() {
  const box = el("choices"); box.innerHTML = "";
  const loc = LOCATIONS[S.loc];
  const add = (label, fn, cls) => {
    const b = document.createElement("button");
    b.className = "choice" + (cls ? " "+cls : "");
    b.innerHTML = md(label);
    b.onclick = fn;
    box.appendChild(b);
  };
  (EVENTS[S.loc]||[]).forEach(ev => {
    if (ev.once && S.flags["ev_"+ev.id]) return;
    if (ev.requires && !ev.requires(S)) return;
    add(ev.label, ()=>runEvent(ev), "quest");
  });
  loc.exits.forEach(ex => {
    if (ex.if && !ex.if(S)) return;
    if (ex.to==="giants_crag" && !S.flags.giants_crag_open) return;
    if (ex.to==="final_shore" && !S.flags.final_shore_open) return;
    add("→ " + ex.label, ()=>{
      S.loc = ex.to; S.turn++; S.time++;
      narrate(`— ${LOCATIONS[ex.to].name} —`,"dim");
      narrate(LOCATIONS[ex.to].desc(S));
      S.visited[ex.to] = true;
      render();
    }, "");
  });
  add("🍎 Se reposer (et croquer une pomme si vous en avez une)", ()=>{
    if (S.inv.includes("pomme")) { removeItem("pomme"); heal(10); narrate("La jeunesse revient dans vos membres : +10 vigueur.", "success"); }
    else { heal(4); narrate("Vous vous reposez au bord de l'eau : +4 vigueur.", "dim"); }
    S.time++; render();
  }, "");
  add("🜊 Méditer sur le renoncement à l'amour", ()=>{
    if (S.renounced) { narrate("Vous avez déjà renié l'amour. L'or vous regarde comme un parent."); return; }
    openRiddle("Renoncer à l'amour vous ouvrirait la puissance de l'or — comme Alberich. Voulez-vous sceller ce reniement ? (répondez NON pour refuser)",
      ["non","jamais"],
      ()=>{ narrate("Vous refusez. Le cœur reste entier — et l'or, muet.", "success"); honorUp(10); unlockAch("coeur_libre"); },
      ()=>{ S.renounced=true; honorDown(20); narrate("Vous prononcez le reniement, comme Alberich jadis. Un frisson d'or monte du fond : l'Or du Rhin *vous reconnaît*. (-20 honneur)", "danger"); unlockAch("coeur_maudit"); render(); });
  }, "gold");
  if (S.inv.includes("corne") && S.hp <= 5) {
    add("🐚 Souffler le cor de Floßhilde", ()=>{
      removeItem("corne"); S.hp = S.hpMax; narrate("Les eaux du Rhin vous portent et vous rendent toute votre vigueur !", "rhine"); render();
    }, "quest");
  }
}

function runEvent(ev) {
  S.flags["ev_"+ev.id] = true;
  S.turn++;
  ev.run();
  if (S.hp>0 && !S.ending) render();
}

/* ---------- AIDE / QUÊTES / SUCCÈS ---------- */
function showHelp() {
  el("overlay-content").innerHTML = `<h2>📜 Comment jouer</h2>
  <p><b>L'Or du Rhin</b> est une aventure textuelle qui suit les quatre scènes du <em>Rheingold</em> de Wagner : le Rhin, Nibelheim, le rocher des géants, et l'entrée au Walhalla.</p>
  <p>• <b>Choix</b> : cliquez sur les actions. Les boutons à liseré bleu sont des événements/quêtes, les flèches → sont des déplacements.<br>
  • <b>Vigueur</b> : votre santé. À zéro, le Rhin vous ramène — au prix de la moitié de votre or.<br>
  • <b>Honneur</b> : votre intégrité. Il conditionne certaines réactions et certaines fins.<br>
  • <b>Or</b> : 50 pièces rançonnent Freia. On en gagne en travaillant, fouillant, chantant.<br>
  • <b>Savoirs</b> : leitmotivs et lores qui débloquent des voies (le motif du Rhin apaise les eaux noires, la faiblesse du Tarnhelm permet la ruse…).<br>
  • <b>Méditer</b> : renier l'amour change le cours de certaines scènes — et votre honneur.<br>
  • Il existe <b>6 fins</b>, 9 quêtes, 3 énigmes d'Erda, des trésors cachés et 11 hauts faits. Sauvegardez souvent !</p>
  <div class="topbtns"><button class="tbtn" onclick="document.getElementById('overlay').style.display='none'">Fermer</button></div>`;
  el("overlay").style.display="flex";
}
function showQuests() {
  let h = "<h2>🗡 Journal des quêtes</h2>";
  for (const [id,q] of Object.entries(QUESTS)) {
    const st = S.quests[id] ? S.quests[id].state : "inconnue";
    h += `<p><b>${q.name}</b> — ${st==="done"?"✔ accomplie":st==="active"?"en cours":"non découverte"}<br><span class="dim">${st==="done"?"":q.obj(S)}</span></p>`;
  }
  h += `<div class="topbtns"><button class="tbtn" onclick="document.getElementById('overlay').style.display='none'">Fermer</button></div>`;
  el("overlay-content").innerHTML = h; el("overlay").style.display="flex";
}
function showAchievements() {
  let h = "<h2>🏆 Hauts faits</h2>";
  for (const [id,d] of Object.entries(ACHS)) h += `<p>${S.achievements[id]?"🟡":"⚫"} <span class="${S.achievements[id]?"":"dim"}">${d}</span></p>`;
  h += `<div class="topbtns"><button class="tbtn" onclick="document.getElementById('overlay').style.display='none'">Fermer</button></div>`;
  el("overlay-content").innerHTML = h; el("overlay").style.display="flex";
}

/* ---------- SAUVEGARDE ---------- */
function saveGame() { localStorage.setItem("rheingold_save", JSON.stringify(S)); narrate("💾 Partie sauvegardée.", "success"); }
function loadGame() {
  const raw = localStorage.getItem("rheingold_save");
  if (!raw) { narrate("Aucune sauvegarde trouvée.", "dim"); return; }
  S = JSON.parse(raw); narrate("📂 Sauvegarde chargée.", "success"); render();
}
function restart() {
  if (!confirm("Recommencer une nouvelle partie ? (la sauvegarde locale est conservée)")) return;
  S = freshState(); el("story").innerHTML=""; el("log").innerHTML=""; intro();
}

/* ---------- INTRO ---------- */
function intro() {
  el("overlay-content").innerHTML = `<h2>🜊 L'Or du Rhin</h2>
  <p><em>« Rheingold ! Rheingold ! »</em> — Au commencement du <em>Ring</em> de Wagner, l'or du Rhin brille au fond de l'eau, les dieux contractent des dettes, et un nain renonce à l'amour.</p>
  <p>Vous êtes <b>l'Étranger</b>, un mortel embarqué malgré lui dans les affaires des dieux. Comment appelez-vous votre héros ?</p>
  <input class="riddle-input" id="hero-name" placeholder="Votre nom (ou laissez vide : « Étranger »)">
  <div class="topbtns"><button class="tbtn" id="begin">Commencer l'aventure</button></div>`;
  el("overlay").style.display="flex";
  el("begin").onclick = () => {
    const n = el("hero-name").value.trim();
    if (n) S.name = n;
    closeOverlay();
    narrate(`Le prélude monte des profondeurs : un accord de mi bémol, immense, comme l'eau qui dort. Vous vous réveillez dans le lit du Rhin, étrangement capable d'y respirer. Une lettre scellée flotte près de vous : « Compte l'or, surveille les serments. — W. »`, "rhine");
    narrate(LOCATIONS.rhein_shallows.desc(S));
    render();
  };
}

/* ---------- DÉMARRAGE ---------- */
S = freshState();
intro();

const Game = { saveGame, loadGame, restart, showHelp, showQuests, showAchievements };
