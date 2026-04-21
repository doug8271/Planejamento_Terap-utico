/**
 * report.js — Passo 6: Geração dos Relatórios
 *
 * renderTable            → Documento de acompanhamento interno (fono)
 *                          Detalhado, editável, com sintomas + estratégias completas
 *
 * renderProfessionalReport → Documento compartilhável (escola, pais, outros profissionais)
 *                            Linguagem acessível mas com rigor clínico, sem jargão de letra
 */

import { OBJECTIVOS } from '../data/objetivos.js';

/* ══════════════════════════════════════════════════════
   HELPERS COMPARTILHADOS
══════════════════════════════════════════════════════ */

function normalizeText(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/undefined/g, '').trim();
}

function getSavedValue(rawValue) {
  if (rawValue === undefined || rawValue === null) return undefined;
  const normalized = normalizeText(rawValue);
  if (normalized === '' && String(rawValue).includes('undefined')) return undefined;
  return normalized;
}

function formatFrequency(rawFreq, weeklyFrequency) {
  const normalized = normalizeText(rawFreq);
  if (normalized) return normalized;
  return weeklyFrequency ? `${weeklyFrequency}x / semana` : '';
}

/**
 * Extrai o nome limpo de uma estratégia (sem a letra de prefixo "A - ").
 * Input: "A - Estimulação Focalizada:Exponha a criança..."
 * Output: "Estimulação Focalizada"
 */
function extractStratName(labelText) {
  const text = String(labelText || '');
  const colonIdx = text.indexOf(':');
  const nameWithLetter = colonIdx > -1 ? text.substring(0, colonIdx) : text;
  return nameWithLetter.replace(/^[A-Z]\s*[-–]\s*/, '').trim();
}

/**
 * Extrai a descrição de uma estratégia (tudo após o primeiro ':').
 * Input: "A - Estimulação Focalizada:Exponha a criança..."
 * Output: "Exponha a criança..."
 */
function extractStratDesc(labelText) {
  const text = String(labelText || '');
  const colonIdx = text.indexOf(':');
  return colonIdx > -1 ? text.substring(colonIdx + 1).trim() : '';
}

/* ══════════════════════════════════════════════════════
   HELPERS — DOCUMENTO INTERNO (ACOMPANHAMENTO)
══════════════════════════════════════════════════════ */

/**
 * Estratégias no formato visual para a tabela interna:
 * ▸ Nome da estratégia
 *   Descrição (o que é / como funciona)
 *   Como usar: instruções práticas
 */
function buildEstrategiasHtmlInterno(modulo, selectedEstrategias) {
  const checked = modulo.estrategias.filter(e => selectedEstrategias.has(e.id));
  const list    = checked.length > 0 ? checked : modulo.estrategias;
  if (!list.length) return '<span style="color:var(--text3);font-size:11px">Nenhuma estratégia selecionada</span>';
  return list.map(e => {
    const name    = extractStratName(e.label);
    const fullDesc = extractStratDesc(e.label);
    // Separa "o que é" de "Como usar:" quando o marcador existir
    const comoIdx = fullDesc.search(/Como usar\s*:/i);
    const desc    = comoIdx > -1 ? fullDesc.substring(0, comoIdx).trim() : fullDesc;
    const uso     = comoIdx > -1 ? fullDesc.substring(comoIdx + fullDesc.match(/Como usar\s*:/i)[0].length).trim() : '';
    return `<div class="est-report-item">
      <span class="est-report-name">${name}</span>
      ${desc ? `<span class="est-report-desc">${desc}</span>` : ''}
      ${uso  ? `<span class="est-report-uso"><strong>Como usar:</strong> ${uso}</span>` : ''}
    </div>`;
  }).join('');
}

/**
 * Sintomas marcados na sessão para a coluna do documento interno.
 */
function buildSintomasHtml(modulo, sintomasSelecionados) {
  const checkedIds = sintomasSelecionados?.get(modulo.id) || new Set();
  const list = modulo.sintomas.filter(s => checkedIds.has(s.id));
  if (!list.length) {
    return '<span style="color:var(--text3);font-size:11px;font-style:italic">Nenhum marcado</span>';
  }
  return list.map(s => `<div class="report-list-item">${s.label}</div>`).join('');
}

/**
 * Célula editável com data-label para o layout de impressão.
 */
function makeCell(content, field, label) {
  const td = document.createElement('td');
  td.contentEditable = 'true';
  td.dataset.field   = field;
  td.dataset.label   = label;
  td.innerHTML       = content;
  return td;
}

/* ══════════════════════════════════════════════════════
   HELPERS — DOCUMENTO PROFISSIONAL (COMPARTILHÁVEL)
══════════════════════════════════════════════════════ */

/**
 * Lista de nomes de estratégias como HTML <ul> — sem letra, sem descrição.
 * Para o documento compartilhável com pais/escola.
 */
function buildEstrategiasNomes(modulo, selectedEstrategias) {
  const checked = modulo.estrategias.filter(e => selectedEstrategias.has(e.id));
  const list    = checked.length > 0 ? checked : modulo.estrategias;
  const names   = list.map(e => extractStratName(e.label)).filter(Boolean);
  if (!names.length) return '';
  return `<ul class="prof-strat-list">${names.map(n => `<li>${n}</li>`).join('')}</ul>`;
}

/* ══════════════════════════════════════════════════════
   RENDER — DOCUMENTO INTERNO (ACOMPANHAMENTO DA FONO)
══════════════════════════════════════════════════════ */

/**
 * Renderiza a tabela de acompanhamento (documento de uso interno da fono).
 *
 * @param {Array}    modulosSelecionados
 * @param {Set}      selectedEstrategias
 * @param {Map}      sintomasSelecionados   — Map<moduloId, Set<sintomaId>>
 * @param {string}   weeklyFrequency
 * @param {Object}   savedEdits
 * @param {Function} onInput               — callback de autosave
 */
export function renderTable(
  modulosSelecionados,
  selectedEstrategias,
  sintomasSelecionados,
  weeklyFrequency,
  savedEdits,
  onInput
) {
  const tbody = document.getElementById('tabela-body');
  tbody.innerHTML = '';

  modulosSelecionados.forEach(modulo => {
    const ed        = savedEdits[modulo.id] || {};
    const objective = OBJECTIVOS[modulo.id] || {};

    const cpSaved   = getSavedValue(ed['cp']);
    const lpSaved   = getSavedValue(ed['lp']);
    const estSaved  = getSavedValue(ed['est']);
    const freqSaved = getSavedValue(ed['freq']);
    const sintSaved = getSavedValue(ed['sint']);

    const cpVal   = cpSaved   !== undefined ? cpSaved   : normalizeText(objective.cp)  || normalizeText(modulo.cp);
    const lpVal   = lpSaved   !== undefined ? lpSaved   : normalizeText(objective.lp)  || normalizeText(modulo.lp);
    // Regenera se o valor salvo for formato antigo (sem a estrutura HTML esperada)
    const estValido = estSaved !== undefined && estSaved.includes('est-report-item');
    const estVal  = estValido ? estSaved : buildEstrategiasHtmlInterno(modulo, selectedEstrategias);
    // Prioridade: edição salva › freq do módulo (objetivos.js) › campo do formulário
    const freqVal = freqSaved !== undefined ? freqSaved : formatFrequency(objective.freq || modulo.freq, weeklyFrequency);
    const sintValido = sintSaved !== undefined && sintSaved.includes('report-list-item');
    const sintVal = sintValido ? sintSaved : buildSintomasHtml(modulo, sintomasSelecionados);
    const microSaved = getSavedValue(ed['micro']);
    const microVal   = microSaved !== undefined ? microSaved : normalizeText(objective.micro || modulo.micro);

    const tr = document.createElement('tr');
    tr.dataset.id = modulo.id;

    // Área — não editável, só a tag
    const areaCell = document.createElement('td');
    areaCell.className     = 'area-cell';
    areaCell.dataset.label = 'Área';
    areaCell.innerHTML     = `<span class="area-tag">${modulo.tag}</span>`;
    tr.appendChild(areaCell);

    // Sintomas observados — editável, pré-preenchido com os marcados
    tr.appendChild(makeCell(sintVal,  'sint',  'Sintomas observados'));
    tr.appendChild(makeCell(cpVal,   'cp',    'Objetivo Curto Prazo'));
    tr.appendChild(makeCell(lpVal,   'lp',    'Objetivo Longo Prazo'));
    tr.appendChild(makeCell(estVal,  'est',   'Estratégias'));
    tr.appendChild(makeCell(freqVal, 'freq',  'Frequência'));
    tr.appendChild(makeCell(microVal,'micro', 'Prática domiciliar'));

    tbody.appendChild(tr);
  });

  tbody.oninput = onInput;
  checkScrollHint();
}

/* ══════════════════════════════════════════════════════
   RENDER — RELATÓRIO PROFISSIONAL (COMPARTILHÁVEL)
══════════════════════════════════════════════════════ */

/**
 * Renderiza o relatório para compartilhamento com pais, escola ou outros profissionais.
 * Linguagem didática mas com rigor clínico. Sem letras de estratégia, sem jargão excessivo.
 *
 * @param {Array}  modulosSelecionados
 * @param {Set}    selectedEstrategias
 * @param {string} weeklyFrequency
 * @param {Object} meta       — { nome, idade, data, fono, crfa, cid }
 * @param {Object} savedEdits — edições manuais da tabela de acompanhamento (mesma fonte)
 */
export function renderProfessionalReport(modulosSelecionados, selectedEstrategias, weeklyFrequency, meta = {}, savedEdits = {}) {
  const container = document.getElementById('prof-report');
  if (!container) return;
  container.innerHTML = '';

  if (!modulosSelecionados.length) {
    container.style.display = 'none';
    return;
  }

  const { nome = '', idade = '', data = '', fono = '', crfa = '', cid = '' } = meta;
  const fonoName = fono || 'Fonoaudióloga Responsável';
  const dataFmt  = data ? data.split('-').reverse().join('/') : '___/___/______';

  const doc = document.createElement('div');
  doc.className = 'prof-doc';

  /* ── Cabeçalho de impressão (visível só no print) ── */
  const ph = document.createElement('div');
  ph.className = 'prof-print-header';
  ph.innerHTML = `
    <div class="prof-print-left">
      <div class="prof-print-title">Relatório Terapêutico Fonoaudiológico</div>
      <div class="prof-print-subtitle">Planejamento e Objetivos Terapêuticos · PBE</div>
    </div>
    <div class="prof-print-right">
      <div class="prof-print-fono">${fonoName}</div>
      ${crfa ? `<div class="prof-print-crfa">CRFa: ${crfa}</div>` : ''}
    </div>`;
  doc.appendChild(ph);

  /* ── Barra de identificação do paciente ── */
  const patBar = document.createElement('div');
  patBar.className = 'prof-patient-bar';
  const parts = [];
  if (nome)  parts.push(`<span><strong>Paciente:</strong> ${nome}</span>`);
  if (idade) parts.push(`<span><strong>Idade:</strong> ${idade}</span>`);
  parts.push(`<span><strong>Data:</strong> ${dataFmt}</span>`);
  if (cid)   parts.push(`<span><strong>CID:</strong> ${cid}</span>`);
  patBar.innerHTML = parts.join('<span class="prof-sep"> · </span>');
  doc.appendChild(patBar);

  /* ── Parágrafo introdutório ── */
  const intro = document.createElement('p');
  intro.className = 'prof-intro';
  const nomeRef = nome || 'o(a) paciente';
  const areasCount = modulosSelecionados.length;
  intro.textContent = `Este relatório descreve o planejamento terapêutico fonoaudiológico de ${nomeRef}, elaborado com base em avaliação clínica e sustentado em práticas baseadas em evidências (PBE). São contempladas ${areasCount} área${areasCount > 1 ? 's' : ''} de intervenção, com objetivos terapêuticos definidos e abordagens específicas para cada condição identificada. Este documento pode ser compartilhado com familiares, educadores e demais profissionais envolvidos no cuidado.`;
  doc.appendChild(intro);

  /* ── Blocos por área ── */
  modulosSelecionados.forEach(modulo => {
    const objective = OBJECTIVOS[modulo.id] || {};
    // Edições manuais da tabela de acompanhamento têm prioridade sobre objetivos.js
    const ed        = savedEdits[modulo.id] || {};
    const cpSaved   = getSavedValue(ed['cp']);
    const lpSaved   = getSavedValue(ed['lp']);
    const freqSaved = getSavedValue(ed['freq']);
    const microSaved = getSavedValue(ed['micro']);

    const block = document.createElement('div');
    block.className = 'prof-area-block';

    // Título + tag
    const titleRow = document.createElement('div');
    titleRow.className = 'prof-area-title-row';
    titleRow.innerHTML = `
      <span class="prof-area-name">${modulo.label}</span>
      <span class="area-tag">${modulo.tag}</span>`;
    block.appendChild(titleRow);

    // Parágrafo de contexto clínico
    const contextText = objective.contexto || modulo.desc || '';
    if (contextText) {
      const ctx = document.createElement('p');
      ctx.className   = 'prof-area-context';
      ctx.textContent = contextText;
      block.appendChild(ctx);
    }

    // Objetivos CP + LP — savedEdits > objetivos.js > modulo
    const cpText = cpSaved !== undefined ? cpSaved : normalizeText(objective.cp || modulo.cp);
    const lpText = lpSaved !== undefined ? lpSaved : normalizeText(objective.lp || modulo.lp);
    if (cpText || lpText) {
      const objDiv = document.createElement('div');
      objDiv.className = 'prof-objectives';
      if (cpText) {
        objDiv.innerHTML += `
          <div class="prof-obj-row">
            <span class="prof-obj-label">Objetivo imediato</span>
            <span class="prof-obj-val">${cpText}</span>
          </div>`;
      }
      if (lpText) {
        objDiv.innerHTML += `
          <div class="prof-obj-row">
            <span class="prof-obj-label">Objetivo ampliado</span>
            <span class="prof-obj-val">${lpText}</span>
          </div>`;
      }
      block.appendChild(objDiv);
    }

    // Abordagens terapêuticas — lista de nomes, sem letras nem descrições técnicas
    const stratNamesHtml = buildEstrategiasNomes(modulo, selectedEstrategias);
    if (stratNamesHtml) {
      const stratDiv = document.createElement('div');
      stratDiv.className = 'prof-detail-row prof-detail-row--list';
      stratDiv.innerHTML = `<span class="prof-detail-label">Abordagens terapêuticas:</span>${stratNamesHtml}`;
      block.appendChild(stratDiv);
    }

    // Frequência — savedEdits > objetivos.js > campo do formulário
    const freqText = freqSaved !== undefined
      ? freqSaved
      : formatFrequency(objective.freq || modulo.freq, weeklyFrequency);
    if (freqText) {
      const freqDiv = document.createElement('div');
      freqDiv.className = 'prof-detail-row';
      freqDiv.innerHTML = `<span class="prof-detail-label">Frequência recomendada:</span> <span class="prof-detail-val">${freqText}.</span>`;
      block.appendChild(freqDiv);
    }

    // Prática domiciliar — savedEdits > objetivos.js
    const microText = microSaved !== undefined
      ? microSaved
      : normalizeText(objective.micro || modulo.micro);
    if (microText) {
      const microDiv = document.createElement('div');
      microDiv.className = 'prof-detail-row';
      microDiv.innerHTML = `<span class="prof-detail-label">Prática domiciliar:</span> <span class="prof-detail-val">${microText}.</span>`;
      block.appendChild(microDiv);
    }

    doc.appendChild(block);
  });

  /* ── Parágrafo de encerramento ── */
  const closing = document.createElement('p');
  closing.className = 'prof-closing';
  closing.textContent = 'Recomenda-se a manutenção da regularidade nas sessões terapêuticas e o envolvimento ativo da família nas orientações fornecidas pela profissional. Este planejamento é dinâmico e poderá ser revisado conforme a evolução clínica. Para esclarecimentos adicionais, entrar em contato com a fonoaudióloga responsável.';
  doc.appendChild(closing);

  /* ── Assinatura (visível só no print) ── */
  const sig = document.createElement('div');
  sig.className = 'prof-signature';
  sig.innerHTML = `
    <div class="sign-row">
      <div class="sign-col">
        <div class="sign-line"></div>
        <div class="sign-name-text">${fonoName}</div>
        <div class="sign-title-text">Fonoaudióloga</div>
        <div class="sign-crfa">${crfa ? `CRFa: ${crfa}` : 'CRFa: _______________'}</div>
      </div>
      <div class="sign-col" style="margin-left:auto">
        <div class="sign-date">${dataFmt}</div>
      </div>
    </div>`;
  doc.appendChild(sig);

  container.appendChild(doc);

  const section = container.closest('#prof-section');
  if (section) section.style.display = 'block';
  container.style.display = 'block';
}

/* ══════════════════════════════════════════════════════
   SCROLL HINT
══════════════════════════════════════════════════════ */

export function checkScrollHint() {
  const scroll = document.getElementById('tbl-scroll');
  const hint   = document.getElementById('scroll-hint');
  if (!scroll || !hint) return;

  const hasScroll = scroll.scrollWidth > scroll.clientWidth + 4;
  hint.classList.toggle('visible', hasScroll);

  scroll.onscroll = () => {
    const atEnd = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
    hint.classList.toggle('visible', hasScroll && !atEnd);
  };
}
