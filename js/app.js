/**
 * app.js — Controlador principal
 *
 * Fluxo dos 6 passos:
 *  1. Cadastro     → campos do formulário
 *  2. Área         → tabs geradas pelos data/area-*.js
 *  3. Sintomas     → checklist dentro do card (só se sintomas[] tiver dados)
 *  4. Motor        → sintoma marcado dispara motor{} → marca estratégias automaticamente
 *  5. Estratégias  → grid ajustável manualmente
 *  6. Relatório    → delegado a report.js
 *
 * REGRA: módulo com sintomas[] vazio não expande, não é selecionável.
 */

import { AREA as FALA }      from '../data/area-1-fala.js';
import { AREA as ESCRITA }   from '../data/area-2-escrita.js';
import { AREA as MECANICA }  from '../data/area-3-mecanica.js';
import { AREA as SINDROMES } from '../data/area-4-sindromes.js';
import { renderTable, renderProfessionalReport, checkScrollHint } from './report.js';

/* ── Catálogo unificado ──────────────────────────────── */
const CATEGORIAS = [FALA, ESCRITA, MECANICA, SINDROMES].map(a => ({
  id:      a.id,
  label:   a.label,
  modules: a.modules,
}));

/* ── Estado ──────────────────────────────────────────── */
const selectedModulos     = new Set();
const selectedEstrategias = new Set();

/* ── Toast ───────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast' + (type ? ' toast-' + type : '');
  void el.offsetWidth; // força reflow para reiniciar animação
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3200);
}

/* ── LocalStorage ────────────────────────────────────── */
const STORE_KEY = 'ptf_v3';
let saveTimer = null;

function getStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
}
function setStore(d) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch {}
}
function triggerSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { persistAll(); flashSaved(); }, 600);
}
function flashSaved() {
  const el = document.getElementById('save-indicator');
  const tx = document.getElementById('save-text');
  tx.textContent = 'Salvo';
  el.classList.add('saved');
  setTimeout(() => { el.classList.remove('saved'); tx.textContent = 'Rascunho salvo'; }, 2000);
}
function persistAll() {
  const s = getStore();
  s.inputs = {
    nome:           document.getElementById('nome').value,
    idade:          document.getElementById('idade').value,
    data:           document.getElementById('data').value,
    fono:           document.getElementById('fono').value,
    responsavel:    document.getElementById('responsavel').value,
    sessoesSemana:  document.getElementById('sessao-semana').value,
    crfa:           document.getElementById('crfa').value,
    cid:            document.getElementById('cid').value,
  };
  s.modulos     = [...selectedModulos];
  s.estrategias = [...selectedEstrategias];
  s.obs         = document.getElementById('obs').value;
  if (!s.tableEdits) s.tableEdits = {};
  document.querySelectorAll('#tabela-body tr').forEach(tr => {
    const id = tr.dataset.id;
    if (!id) return;
    if (!s.tableEdits[id]) s.tableEdits[id] = {};
    tr.querySelectorAll('td[data-field]').forEach(td => {
      s.tableEdits[id][td.dataset.field] = td.innerText;
    });
  });
  setStore(s);
}
function restoreFromStore() {
  const s = getStore();
  if (s.inputs) {
    ['nome','idade','data','fono','responsavel','sessao-semana'].forEach(k => {
      const el = document.getElementById(k);
      if (el && s.inputs[k] !== undefined) el.value = s.inputs[k];
    });
    // CRFa e CID (chaves diferentes dos ids dos campos)
    const crfaEl = document.getElementById('crfa');
    if (crfaEl && s.inputs.crfa !== undefined) crfaEl.value = s.inputs.crfa;
    const cidEl = document.getElementById('cid');
    if (cidEl && s.inputs.cid !== undefined) cidEl.value = s.inputs.cid;
  }
  if (s.modulos?.length) {
    s.modulos.forEach(id => {
      const mod = getModuloById(id);
      if (!mod || !mod.sintomas.length) return; // ignora se ficou vazio
      const cb   = document.getElementById('cb-' + id);
      const item = document.getElementById('si-' + id);
      if (cb) { cb.checked = true; item?.classList.add('selected'); selectedModulos.add(id); }
    });
  }
  if (s.estrategias?.length) {
    s.estrategias.forEach(id => {
      const cb   = document.getElementById('estcb-' + id);
      const item = document.getElementById('esti-' + id);
      if (cb) { cb.checked = true; item?.classList.add('est-selected'); selectedEstrategias.add(id); }
    });
  }
  if (s.obs) document.getElementById('obs').value = s.obs;
  updateSelectionUI();
}

/* ── Helpers ─────────────────────────────────────────── */
function getModuloById(id) {
  for (const cat of CATEGORIAS)
    for (const m of cat.modules)
      if (m.id === id) return m;
  return null;
}
function getSelectedModulosData() {
  return [...selectedModulos].map(id => getModuloById(id)).filter(Boolean);
}
function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* ══════════════════════════════════════════════════════
   PASSO 2 — Tabs de área
   PASSO 3 — Cards de módulo
══════════════════════════════════════════════════════ */
function initUI() {
  const tabsEl   = document.getElementById('cat-tabs');
  const panelsEl = document.getElementById('cat-panels');
  const pipsEl   = document.getElementById('sel-pips');

  CATEGORIAS.forEach(cat => {
    // pip por módulo com dados (ativo) ou sem dados (cinza)
    cat.modules.forEach(m => {
      const pip = document.createElement('span');
      pip.className = 'sel-pip' + (m.sintomas.length ? '' : ' pip-empty');
      pipsEl.appendChild(pip);
    });

    // Tab
    const tab = document.createElement('button');
    tab.className   = 'cat-tab' + (cat === CATEGORIAS[0] ? ' active' : '');
    tab.dataset.cat = cat.id;
    tab.innerHTML   = `${cat.label}<span class="cat-tab-count" id="count-${cat.id}">0</span>`;
    tab.addEventListener('click', () => switchTab(cat.id));
    tabsEl.appendChild(tab);

    // Painel
    const panel = document.createElement('div');
    panel.className = 'cat-panel' + (cat === CATEGORIAS[0] ? ' active' : '');
    panel.id        = 'panel-' + cat.id;

    const list = document.createElement('div');
    list.className = 'sintomas-list';

    cat.modules.forEach(mod => list.appendChild(createModuloCard(mod)));
    panel.appendChild(list);
    panelsEl.insertBefore(panel, document.getElementById('no-results-msg'));
  });
}

/* ── Card de módulo ───────────────────────────────────
   Com dados  → clicável, expande, mostra checklist de sintomas
   Sem dados  → visual "pendente", sem interação
─────────────────────────────────────────────────────── */
function createModuloCard(mod) {
  const hasData = mod.sintomas.length > 0;

  const item = document.createElement('div');
  item.className = 'sintoma-item' + (hasData ? '' : ' mod-pending');
  item.id        = 'si-' + mod.id;

  const header = document.createElement('div');
  header.className = 'sintoma-header';
  header.innerHTML = `
    <input type="checkbox" class="real-cb" id="cb-${mod.id}" value="${mod.id}"${hasData ? '' : ' disabled'}>
    <div class="sintoma-checkbox">
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
    </div>
    <div class="sintoma-info">
      <div class="sintoma-label">${mod.label}</div>
      <div class="sintoma-desc">${mod.desc}</div>
      <span class="sintoma-tag-pill">${mod.tag}</span>
    </div>
    ${hasData
      ? `<svg class="sintoma-expand-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
      : `<span class="mod-pending-badge">Em breve</span>`
    }`;

  if (hasData) {
    header.addEventListener('click', () => toggleModulo(mod));
    // Painel de expansão: sintomas (passo 3) + estratégias (passo 5)
    const expandPanel = buildExpandPanel(mod);
    item.appendChild(header);
    item.appendChild(expandPanel);
  } else {
    header.style.cursor = 'default';
    header.style.opacity = '0.55';
    item.appendChild(header);
  }

  return item;
}

/* ── Painel expandido (Passo 3 + Passo 5) ─────────── */
function buildExpandPanel(mod) {
  const panel = document.createElement('div');
  panel.className = 'estrategias-panel';
  panel.id        = 'est-' + mod.id;

  // Passo 3 — checklist de sintomas
  const sintLabel = document.createElement('span');
  sintLabel.className   = 'est-label';
  sintLabel.textContent = 'Sintomas observados — marque os presentes na sessão';
  panel.appendChild(sintLabel);
  panel.appendChild(buildSintomasGrid(mod));

  // Passo 5 — grid de estratégias (aparece após motor preencher)
  const estSection = document.createElement('div');
  estSection.id        = 'est-section-' + mod.id;
  estSection.className = 'est-section';

  const estLabel = document.createElement('span');
  estLabel.className   = 'est-label';
  estLabel.textContent = 'Estratégias selecionadas pelo motor — ajuste se necessário';
  estSection.appendChild(estLabel);
  estSection.appendChild(buildEstrategiasGrid(mod));

  panel.appendChild(estSection);
  return panel;
}

/* ── Passo 3: Grid de sintomas ───────────────────────  */
function buildSintomasGrid(mod) {
  const grid = document.createElement('div');
  grid.className = 'est-grid';
  grid.id        = 'sintgrid-' + mod.id;

  mod.sintomas.forEach(sint => {
    const el = document.createElement('div');
    el.className = 'est-item';
    el.id        = 'sinti-' + sint.id;
    el.innerHTML = `
      <input type="checkbox" class="est-cb" id="sintcb-${sint.id}" value="${sint.id}">
      <div class="est-visual-cb">
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
      </div>
      <span class="est-item-label">${sint.label}</span>`;

    el.addEventListener('click', () => {
      const cb = document.getElementById('sintcb-' + sint.id);
      cb.checked = !cb.checked;
      el.classList.toggle('est-selected', cb.checked);
      // Passo 4 — Motor
      applyMotor(mod, sint.id, cb.checked);
      triggerSave();
    });

    grid.appendChild(el);
  });

  return grid;
}

/* ── Passo 4: Motor de estratégias ──────────────────
   motor = { 'sintoma_id': ['A','B','C'] }
   Letras mapeiam para estrategias[] por índice (A=0, B=1, ...)
────────────────────────────────────────────────────── */
function applyMotor(mod, sintomaId, isChecked) {
  const letras = mod.motor[sintomaId];
  if (!letras?.length) return;

  letras.forEach(letra => {
    const idx  = letra.charCodeAt(0) - 65; // A=0, B=1...
    const est  = mod.estrategias[idx];
    if (!est) return;

    const estItem = document.getElementById('esti-' + est.id);
    const estCb   = document.getElementById('estcb-' + est.id);
    if (!estItem || !estCb) return;

    if (isChecked) {
      if (!estCb.checked) {
        estCb.checked = true;
        estItem.classList.add('est-selected');
        selectedEstrategias.add(est.id);
      }
    } else {
      // Remove a estratégia SOMENTE se nenhum outro sintoma ainda marcado a referenciar
      const stillNeeded = Object.entries(mod.motor).some(([sId, sLetras]) => {
        if (sId === sintomaId) return false; // ignora o que acabou de ser desmarcado
        const sintCb = document.getElementById('sintcb-' + sId);
        return sintCb?.checked && sLetras.includes(letra);
      });
      if (!stillNeeded && estCb.checked) {
        estCb.checked = false;
        estItem.classList.remove('est-selected');
        selectedEstrategias.delete(est.id);
      }
    }
  });
}

/* ── Passo 5: Grid de estratégias (ajuste manual) ─── */
function buildEstrategiasGrid(mod) {
  const grid = document.createElement('div');
  grid.className = 'est-grid';
  grid.id        = 'estgrid-' + mod.id;

  // Monta motor reverso: letra → [labels dos sintomas que a referenciam]
  // Usado para mostrar "Indicado para: Sintoma X, Sintoma Y" em cada estratégia
  const reverseMotor = {};
  Object.entries(mod.motor).forEach(([sId, letras]) => {
    letras.forEach(letra => {
      if (!reverseMotor[letra]) reverseMotor[letra] = [];
      const sintLabel = mod.sintomas.find(s => s.id === sId)?.label;
      if (sintLabel && !reverseMotor[letra].includes(sintLabel)) {
        reverseMotor[letra].push(sintLabel);
      }
    });
  });

  mod.estrategias.forEach((est, idx) => {
    const letra = String.fromCharCode(65 + idx); // A=0, B=1...

    // Separa nome limpo e descrição a partir do label "A - Nome:Descrição"
    const fullText = String(est.label || '');
    const colonIdx = fullText.indexOf(':');
    const rawName  = colonIdx > -1 ? fullText.substring(0, colonIdx) : fullText;
    const estName  = rawName.replace(/^[A-Z]\s*[-–]\s*/, '').trim();
    const estDesc  = colonIdx > -1 ? fullText.substring(colonIdx + 1).trim() : '';

    // Sintomas que indicam esta estratégia (truncados a 55 chars para não poluir)
    const triggers = (reverseMotor[letra] || [])
      .map(l => l.length > 55 ? l.substring(0, 55) + '…' : l);
    const triggerHtml = triggers.length
      ? `<span class="est-trigger-info">Indicado para: ${triggers.join('; ')}</span>`
      : '';

    const el = document.createElement('div');
    el.className = 'est-item';
    el.id        = 'esti-' + est.id;
    el.innerHTML = `
      <input type="checkbox" class="est-cb" id="estcb-${est.id}" value="${est.id}">
      <div class="est-visual-cb">
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
      </div>
      <div class="est-item-content">
        <span class="est-item-name">${estName}</span>
        ${estDesc  ? `<span class="est-item-desc">${estDesc}</span>`   : ''}
        ${triggerHtml}
      </div>`;

    el.addEventListener('click', () => {
      const cb = document.getElementById('estcb-' + est.id);
      cb.checked = !cb.checked;
      el.classList.toggle('est-selected', cb.checked);
      if (cb.checked) selectedEstrategias.add(est.id);
      else selectedEstrategias.delete(est.id);
      triggerSave();
    });

    grid.appendChild(el);
  });

  return grid;
}

/* ── Toggle do módulo ────────────────────────────────  */
function toggleModulo(mod) {
  if (!mod.sintomas.length) return; // segurança extra

  const cb   = document.getElementById('cb-' + mod.id);
  const item = document.getElementById('si-' + mod.id);
  cb.checked = !cb.checked;
  item.classList.toggle('selected', cb.checked);

  if (cb.checked) {
    selectedModulos.add(mod.id);
  } else {
    selectedModulos.delete(mod.id);
    // Desmarca sintomas e estratégias do módulo
    mod.sintomas.forEach(s => {
      const c = document.getElementById('sintcb-' + s.id);
      const i = document.getElementById('sinti-' + s.id);
      if (c) c.checked = false;
      i?.classList.remove('est-selected');
    });
    mod.estrategias.forEach(e => {
      const c = document.getElementById('estcb-' + e.id);
      const i = document.getElementById('esti-' + e.id);
      if (c) c.checked = false;
      i?.classList.remove('est-selected');
      selectedEstrategias.delete(e.id);
    });
  }
  updateSelectionUI();
  triggerSave();
}

/* ── Troca de tab ────────────────────────────────────  */
function switchTab(catId) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.cat-tab[data-cat="${catId}"]`)?.classList.add('active');
  document.getElementById('panel-' + catId)?.classList.add('active');
}

/* ── Limpar seleção ──────────────────────────────────  */
function limparSelecao() {
  selectedModulos.clear();
  selectedEstrategias.clear();
  document.querySelectorAll('.sintoma-item').forEach(i => i.classList.remove('selected'));
  document.querySelectorAll('.est-item').forEach(i => i.classList.remove('est-selected'));
  document.querySelectorAll('.real-cb, .est-cb').forEach(c => c.checked = false);
  updateSelectionUI();
  triggerSave();
}

/* ── Novo paciente ───────────────────────────────────  */
function novosPaciente() {
  if (!confirm('Iniciar novo paciente? Todos os dados atuais serão apagados.')) return;
  // Limpa formulário
  ['nome','idade','fono','responsavel','sessao-semana','crfa','cid','obs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('data').value = getLocalDate();
  // Limpa seleções
  limparSelecao();
  // Limpa relatório
  const sec = document.getElementById('plano-section');
  sec.classList.remove('visible');
  sec.style.display = 'none';
  // Limpa localStorage
  localStorage.removeItem(STORE_KEY);
  showToast('Novo paciente iniciado. Dados anteriores apagados.');
}

/* ── Atualiza UI de seleção (pips + contadores) ──────  */
function updateSelectionUI() {
  const pips = document.querySelectorAll('.sel-pip:not(.pip-empty)');
  let idx = 0;
  CATEGORIAS.forEach(cat => {
    cat.modules.forEach(m => {
      if (!m.sintomas.length) return;
      if (pips[idx]) pips[idx].classList.toggle('on', selectedModulos.has(m.id));
      idx++;
    });
  });

  CATEGORIAS.forEach(cat => {
    const n  = cat.modules.filter(m => selectedModulos.has(m.id)).length;
    const el = document.getElementById('count-' + cat.id);
    if (el) { el.textContent = n; el.classList.toggle('has-sel', n > 0); }
  });

  const count = selectedModulos.size;
  const txt   = document.getElementById('sel-text');
  txt.textContent = count === 0 ? 'Nenhuma área selecionada'
    : count === 1 ? '1 área selecionada'
    : `${count} áreas selecionadas`;
  txt.style.color = count === 0 ? 'var(--text3)' : 'var(--emerald)';
}

/* ── Busca ao vivo ────────────────────────────────────  */
function filterModulos(query) {
  const panelsEl  = document.getElementById('cat-panels');
  const noResults = document.getElementById('no-results-msg');
  const clearBtn  = document.getElementById('search-clear');
  const q         = query.trim().toLowerCase();

  clearBtn.classList.toggle('visible', query.length > 0);

  if (!q) {
    panelsEl.classList.remove('search-active');
    document.querySelectorAll('.sintoma-item').forEach(i => i.classList.remove('search-hidden'));
    noResults.classList.remove('visible');
    return;
  }

  panelsEl.classList.add('search-active');
  let found = false;

  CATEGORIAS.forEach(cat => {
    cat.modules.forEach(m => {
      const match = m.label.toLowerCase().includes(q)
        || m.desc.toLowerCase().includes(q)
        || m.tag.toLowerCase().includes(q)
        || m.sintomas.some(s => s.label.toLowerCase().includes(q))
        || m.estrategias.some(e => e.label.toLowerCase().includes(q));
      const item = document.getElementById('si-' + m.id);
      if (item) { item.classList.toggle('search-hidden', !match); if (match) found = true; }
    });
  });

  document.getElementById('no-results-query').textContent = query;
  noResults.classList.toggle('visible', !found);
}

/* ── buildSintomasSelecionados ───────────────────────
   Constrói Map<moduloId, Set<sintomaId>> a partir do DOM
────────────────────────────────────────────────────── */
function buildSintomasSelecionados() {
  const map = new Map();
  for (const modId of selectedModulos) {
    const mod = getModuloById(modId);
    if (!mod) continue;
    const checked = new Set();
    mod.sintomas.forEach(s => {
      const cb = document.getElementById('sintcb-' + s.id);
      if (cb?.checked) checked.add(s.id);
    });
    map.set(modId, checked);
  }
  return map;
}

/* ── buildMeta ───────────────────────────────────────
   Coleta os dados do formulário para o relatório profissional
────────────────────────────────────────────────────── */
function buildMeta() {
  return {
    nome:  document.getElementById('nome').value.trim(),
    idade: document.getElementById('idade').value.trim(),
    data:  document.getElementById('data').value,
    fono:  document.getElementById('fono').value.trim(),
    crfa:  document.getElementById('crfa').value.trim(),
    cid:   document.getElementById('cid').value.trim(),
  };
}

/* ══════════════════════════════════════════════════════
   PASSO 6 — Gerar relatório
══════════════════════════════════════════════════════ */
function gerarPlano() {
  const sel = getSelectedModulosData();
  if (!sel.length) { showToast('Selecione ao menos uma área de intervenção.', 'warn'); return; }

  const nome    = document.getElementById('nome').value.trim();
  const idade   = document.getElementById('idade').value.trim();
  const dataVal = document.getElementById('data').value;
  const fono    = document.getElementById('fono').value.trim();
  const resp    = document.getElementById('responsavel').value.trim();

  // Faixa de sessão
  const sessoesSemana = document.getElementById('sessao-semana').value.trim();
  const items = [];
  if (nome)    items.push({ l:'Paciente',      v: nome });
  if (idade)   items.push({ l:'Idade',         v: idade });
  if (dataVal) items.push({ l:'Data',          v: dataVal.split('-').reverse().join('/') });
  if (fono)    items.push({ l:'Fonoaudióloga', v: fono });
  if (resp)    items.push({ l:'Responsável',   v: resp });
  if (sessoesSemana) items.push({ l:'Sessões/semana', v: sessoesSemana });
  items.push({ l:'Áreas', v: sel.length + ' selecionada' + (sel.length > 1 ? 's' : '') });

  document.getElementById('strip-content').innerHTML = items.map(i =>
    `<div class="strip-item"><span class="strip-label">${i.l}</span><span class="strip-value">${i.v}</span></div>`
  ).join('');

  // Banner fono
  const fonoName = fono || '—';
  const initials = fonoName !== '—' ? fonoName.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() : '?';
  document.getElementById('fono-avatar').textContent      = initials;
  document.getElementById('fono-banner-name').textContent = fonoName;
  document.getElementById('print-fono-name').textContent  = fonoName !== '—' ? fonoName : 'Fonoaudióloga Responsável';

  // Assinatura
  document.getElementById('sign-name-text').textContent = fonoName !== '—' ? fonoName : '___________________________';
  document.getElementById('sign-resp-name').textContent = resp || '';
  const crfaVal = document.getElementById('crfa').value.trim();
  document.getElementById('sign-crfa-text').textContent = crfaVal ? `CRFa: ${crfaVal}` : 'CRFa: _______________';
  if (dataVal) {
    const [y,m,d] = dataVal.split('-');
    document.getElementById('sign-date-text').textContent = `${d}/${m}/${y}`;
  }

  const s = getStore();
  const sintomasSel = buildSintomasSelecionados();
  renderTable(sel, selectedEstrategias, sintomasSel, s.inputs?.sessoesSemana || '', s.tableEdits || {}, triggerSave);
  renderProfessionalReport(sel, selectedEstrategias, s.inputs?.sessoesSemana || '', buildMeta(), s.tableEdits || {});

  const sec = document.getElementById('plano-section');
  sec.style.display = 'block';
  sec.classList.remove('visible');
  void sec.offsetWidth;
  sec.classList.add('visible');
  sec.scrollIntoView({ behavior:'smooth', block:'start' });
  persistAll();
}

function printSection(sectionId) {
  // Usa window.print() direto com classe no body — evita popup blockers
  const cls = sectionId === 'plano-section' ? 'print-plano' : 'print-prof';
  document.body.classList.add(cls);
  window.print();
  // Remove a classe após a impressão (ou cancelamento)
  window.addEventListener('afterprint', () => document.body.classList.remove(cls), { once: true });
}

function gerarRelatorioProfissional() {
  const sel = getSelectedModulosData();
  if (!sel.length) {
    showToast('Selecione ao menos uma área de intervenção.', 'warn');
    return;
  }
  const s = getStore();
  renderProfessionalReport(sel, selectedEstrategias, s.inputs?.sessoesSemana || '', buildMeta(), s.tableEdits || {});
  document.getElementById('prof-report')?.scrollIntoView({ behavior:'smooth', block:'start' });
  persistAll();
}

/* ══════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════ */
window.gerarPlano    = gerarPlano;
window.gerarRelatorioProfissional = gerarRelatorioProfissional;
window.printSection = printSection;
window.limparSelecao = limparSelecao;
window.novosPaciente = novosPaciente;

document.getElementById('data').value = getLocalDate();
initUI();
restoreFromStore();

document.getElementById('sintoma-search').addEventListener('input', e => filterModulos(e.target.value));
document.getElementById('search-clear').addEventListener('click', () => {
  const inp = document.getElementById('sintoma-search');
  inp.value = ''; filterModulos(''); inp.focus();
});

['nome','idade','data','fono','responsavel','sessao-semana','crfa','cid'].forEach(id =>
  document.getElementById(id)?.addEventListener('input', triggerSave)
);
document.getElementById('obs').addEventListener('input', triggerSave);
window.addEventListener('resize', checkScrollHint);
document.getElementById('save-text').textContent = 'Rascunho salvo';
