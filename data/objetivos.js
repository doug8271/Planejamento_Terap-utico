/**
 * OBJECTIVOS — fonte única de objetivos e metadados clínicos por módulo.
 *
 * Campos disponíveis:
 *   cp       — objetivo de curto prazo (tabela interna + relatório profissional)
 *   lp       — objetivo de longo prazo
 *   contexto — parágrafo clínico para o relatório compartilhável (pais/escola)
 *   freq     — frequência semanal padrão para o módulo (ex: '2x / semana')
 *   micro    — orientação de prática domiciliar resumida
 *
 * Prioridade de uso no report.js:
 *   freq  → objective.freq (este arquivo) › modulo.freq › sessao-semana do formulário
 */
export const OBJECTIVOS = {
  tdl: {
    cp: 'Promover o uso funcional de vocabulário e frases simples em contextos comunicativos reais.',
    lp: 'Desenvolver compreensão e geração de enunciados mais complexos, ampliando a expressividade oral.',
    contexto: 'A criança apresenta dificuldades no desenvolvimento da linguagem oral, com impacto na compreensão e na expressão comunicativa em situações cotidianas. O acompanhamento fonoaudiológico é fundamental para estimular o vocabulário, a estrutura gramatical e a comunicação funcional.',
    freq: '1–2x / semana',
    micro: '15–20 min/dia de leitura dialogada ou estimulação em rotina (banho, refeição)',
  },
  tsf: {
    cp: 'Reduzir erros fonológicos por meio de discriminação auditiva e prática motora sistemática.',
    lp: 'Generalizar a produção correta dos sons-alvo em palavras, frases e conversação espontânea.',
    contexto: 'Foram identificadas alterações nos padrões fonológicos, com substituições e omissões de sons que comprometem a inteligibilidade da fala. A intervenção visa reorganizar o sistema fonológico de forma que a criança seja compreendida com clareza em diferentes contextos.',
    freq: '2x / semana',
    micro: '10 min/dia de escuta do som-alvo e repetição em palavras reais com os cuidadores',
  },
  gagueira: {
    cp: 'Melhorar a fluência em situações estruturadas usando técnicas de ritmo e controle respiratório.',
    lp: 'Estabelecer estratégias adaptativas para reduzir a tensão e aumentar a comunicação funcional em diferentes ambientes.',
    contexto: 'Observam-se disfluências características da gagueira — como repetições, prolongamentos e bloqueios — que impactam a comunicação espontânea e o bem-estar emocional durante a fala. A terapia atua tanto na fluência quanto na relação do paciente com sua própria comunicação.',
    freq: '1–2x / semana',
    micro: '5 min/dia de fala lenta estruturada + ambiente familiar sem pressão comunicativa',
  },
  apraxia: {
    cp: 'Aprimorar o planejamento e a sequenciação dos movimentos da fala em sílabas e palavras.',
    lp: 'Integrar a fala planejada em frases curtas e em atividades comunicativas com maior autonomia.',
    contexto: 'A criança apresenta dificuldades no planejamento motor da fala, com erros inconsistentes e esforço articulatório visível ao tentar se expressar. A intervenção é intensiva, centrada na prática repetida e estruturada de padrões motores da fala.',
    freq: '3–5x / semana',
    micro: '15–20 min/dia de prática estruturada com pistas táteis/visuais orientadas pela fono',
  },
  pragmatico: {
    cp: 'Ampliar a habilidade de iniciar e manter turnos conversacionais com suportes visuais e prática estruturada.',
    lp: 'Desenvolver comportamentos comunicativos sociais adequados em diferentes contextos e com diferentes interlocutores.',
    contexto: 'Foram identificadas dificuldades no uso social da linguagem, afetando a adequação comunicativa, a interpretação de contextos e a interação com outras pessoas. A terapia foca nas habilidades pragmáticas que sustentam a comunicação em ambientes reais.',
    freq: '1–2x / semana',
    micro: 'Prática de rotinas de diálogo no jantar + reforço de scripts sociais no dia a dia',
  },
  leitura: {
    cp: 'Melhorar a decodificação e a precisão na leitura de palavras e pequenas frases.',
    lp: 'Construir fluência leitora e compreensão de textos básicos em tarefas escolares.',
    contexto: 'A criança apresenta dificuldades na leitura e decodificação escrita, com impacto direto no desempenho escolar e na aquisição de conhecimento. A intervenção fonoaudiológica complementa o trabalho pedagógico ao abordar as bases linguísticas da leitura.',
    freq: '2x / semana',
    micro: '10–15 min/dia de leitura assistida em voz alta com texto no nível de instrução',
  },
  disgrafia: {
    cp: 'Organizar traçados e espaço gráfico para obter escrita mais legível e menos fatigante.',
    lp: 'Estabelecer um padrão de escrita funcional que suporte a produção textual escolar com menor esforço.',
    contexto: 'Foram observadas alterações no grafismo, com dificuldades de legibilidade, controle de pressão e organização espacial da escrita que interferem no desempenho escolar e na autoestima da criança. A intervenção trabalha tanto os aspectos motores quanto os cognitivos da escrita.',
    freq: '1–2x / semana',
    micro: '10 min/dia de treino de traçado curto + atividade proprioceptiva antes de escrever',
  },
  mof: {
    cp: 'Reforçar a motricidade orofacial para apoiar padrões adequados de deglutição e postura labial.',
    lp: 'Promover controle muscular orofacial sustentável que contribua para fala clara e respiração nasal habitual.',
    contexto: 'A avaliação identificou alterações na motricidade orofacial — musculatura da face, lábios, língua e bochechas — que podem impactar a fala, a deglutição e o padrão respiratório. O tratamento é progressivo e envolve exercícios direcionados e orientações para casa.',
    freq: '1–2x / semana',
    micro: '10–15 min/dia de exercícios domiciliares (obrigatório para progressão clínica)',
  },
  resp: {
    cp: 'Iniciar exercícios de reeducação nasal e miofuncional para melhorar o padrão respiratório.',
    lp: 'Consolidar a respiração nasal e hábitos orais adequados em repouso e durante a fala.',
    contexto: 'A criança apresenta padrão de respiração oral habitual, com repercussões no desenvolvimento facial, na qualidade do sono, na postura e no desempenho geral. A intervenção fonoaudiológica atua em conjunto com otorrinolaringologia e odontologia para resultados duradouros.',
    freq: '1–2x / semana',
    micro: 'Exercícios de selamento labial + higiene nasal diária com soro fisiológico',
  },
  voz: {
    cp: 'Reduzir comportamentos vocais de risco e melhorar a higiene vocal nas atividades diárias.',
    lp: 'Estabelecer um padrão vocal saudável e resiliente com menor esforço em diferentes situações de uso.',
    contexto: 'Foram identificadas alterações vocais que indicam uso inadequado da voz e/ou risco para a saúde laríngea. A terapia vocal integra técnicas diretas de produção e orientações de higiene vocal para prevenir lesões e restaurar a qualidade da voz.',
    freq: '1–2x / semana',
    micro: '5–10 min/dia de exercícios SOVT (sopro em canudo) + registro de comportamentos vocais',
  },
  disartria: {
    cp: 'Aprimorar a precisão articulatória e a coordenação respiratória durante a fala.',
    lp: 'Promover inteligibilidade consistente e resistência vocal em atividades comunicativas prolongadas.',
    contexto: 'Observam-se alterações neuromotoras na fala que comprometem a precisão articulatória, a inteligibilidade e a comunicação funcional. O trabalho fonoaudiológico é parte integral da reabilitação e visa maximizar a independência comunicativa do paciente.',
    freq: '2–3x / semana',
    micro: 'Treino de velocidade de fala + pausas programadas em conversas do cotidiano',
  },
  tea: {
    cp: 'Incrementar a comunicação funcional por meio de suportes visuais, rotinas estruturadas e reforço positivo.',
    lp: 'Desenvolver trocas pragmáticas mais espontâneas com respostas sociais adaptadas ao contexto.',
    contexto: 'A criança apresenta alterações na comunicação e linguagem associadas ao Transtorno do Espectro Autista (TEA), com impacto nas interações sociais e na expressão de necessidades. A intervenção segue abordagens naturalistas baseadas em evidências, com envolvimento ativo da família.',
    freq: '2–3x / semana',
    micro: '20–30 min/dia de interação naturalista estruturada com a família (seguindo orientações da fono)',
  },
  tdah: {
    cp: 'Melhorar a organização do discurso e o seguimento de instruções com suportes visuais e estratégias de atenção.',
    lp: 'Fortalecer a narrativa e a regulação da comunicação em situações de alta demanda cognitiva e social.',
    contexto: 'Foram identificadas dificuldades na organização do discurso, na atenção comunicativa e na autorregulação da fala, associadas ao TDAH. A intervenção fonoaudiológica trabalha as habilidades linguísticas e comunicativas de forma a complementar o tratamento multidisciplinar.',
    freq: '1–2x / semana',
    micro: 'Uso de agenda visual + estratégias de auto-monitoramento no ambiente escolar',
  },
  sd: {
    cp: 'Ampliar a compreensão e a produção de palavras funcionais com apoio visual e repetição estruturada.',
    lp: 'Construir um repertório comunicativo mais expressivo com estratégias adaptativas de apoio à memória e à linguagem.',
    contexto: 'A criança apresenta alterações de linguagem e comunicação associadas à Síndrome de Down, com potencial real de desenvolvimento a partir de abordagem sistemática, adaptativa e centrada nos interesses da criança. A família é parceira essencial no processo terapêutico.',
    freq: '2x / semana',
    micro: '15 min/dia de estimulação de vocabulário funcional em rotinas reais com os cuidadores',
  },
  pc: {
    cp: 'Estabelecer canais de comunicação alternativos e suportes de parceiro para ampliar a expressão funcional.',
    lp: 'Integrar a Comunicação Aumentativa e Alternativa (CAA) e os recursos de linguagem em rotinas diárias para promover participação social.',
    contexto: 'Foram identificadas limitações na comunicação verbal associadas à Paralisia Cerebral. A abordagem prioriza a funcionalidade comunicativa por meio de recursos alternativos ou aumentativos, com o objetivo de garantir que a criança possa expressar suas necessidades e participar ativamente do ambiente social e escolar.',
    freq: '2–3x / semana',
    micro: 'Uso da prancha/app de CAA em pelo menos 3 situações do dia com apoio do cuidador',
  },
  di: {
    cp: 'Aprimorar a compreensão auditiva e a organização do discurso em atividades de aprendizagem escolar.',
    lp: 'Promover o uso funcional da linguagem em contextos escolares com melhor processamento e expressão adaptados ao nível de desenvolvimento.',
    contexto: 'A criança apresenta alterações no processamento e na expressão da linguagem associadas à Deficiência Intelectual. A intervenção foca em habilidades linguísticas funcionais com adaptações sistemáticas, promovendo maior independência comunicativa e desempenho escolar.',
    freq: '2x / semana',
    micro: 'Repetição de vocabulário funcional em rotinas + apoio visual em tarefas escolares',
  },
  ep: {
    cp: 'Estimular marcos comunicativos pré-linguísticos ausentes ou atrasados por meio de intervenção naturalista e treino familiar.',
    lp: 'Estabelecer as bases da comunicação intencional (gestos, atenção conjunta, primeiras palavras) que sustentam o desenvolvimento da linguagem oral.',
    contexto: 'Foram identificados atrasos ou ausências em marcos comunicativos esperados para a faixa etária, incluindo balbucio, gestos, atenção conjunta e primeiras palavras. A intervenção precoce e o envolvimento ativo dos cuidadores são os principais fatores de bom prognóstico nessa fase.',
    freq: '1–2x / semana',
    micro: 'Estimulação naturalista de 20–30 min/dia em rotinas (banho, refeição, troca) seguindo orientações da fono',
  },
  afasia: {
    cp: 'Melhorar o acesso ao léxico e a funcionalidade comunicativa nas situações do cotidiano.',
    lp: 'Maximizar a comunicação funcional e a participação social por meio de estratégias verbais, escritas ou aumentativas conforme o perfil do paciente.',
    contexto: 'O paciente apresenta afasia adquirida por lesão cerebral, com comprometimento variável de expressão, compreensão, leitura e/ou escrita. A intervenção fonoaudiológica é parte integral da reabilitação neurológica e visa restaurar a comunicação funcional com a maior autonomia possível.',
    freq: '2–3x / semana',
    micro: 'Prática de 15–20 min/dia de atividades indicadas pela fono (nomeação, leitura funcional ou uso de prancha/app)',
  },
};
