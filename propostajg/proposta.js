  // ---- ajuste aqui ----
  const WHATS_KADNA = '5599984300711'; // 03/11: WhatsApp da Kadna (99) 98430-0711
  const MSG_KADNA = 'Olá! Vi a proposta da Jornada da Guerreira e quero saber como entrar no programa.';
  const LINK_APLICACAO = '';   // link da aplicação (versão da bio) — a definir
  const VERSAO = '?v=20261103-14'; // troque quando regravar um áudio

  // Modo: ?origem=bio esconde o valor e leva para a aplicação
  const params = new URLSearchParams(location.search);
  function aplicarModo(m) {
    document.body.classList.toggle('bio', m === 'bio');
    document.querySelectorAll('.modo button').forEach(b => b.classList.toggle('on', b.dataset.modo === m));
  }
  aplicarModo('bio');  // 30/10: sem valor na página; todo mundo vai para a aplicação (o modo Kadna fica guardado)
  document.querySelectorAll('.modo button').forEach(b => b.addEventListener('click', () => aplicarModo(b.dataset.modo)));

  const btW = document.getElementById('btWhats');
  if (WHATS_KADNA) btW.href = 'https://api.whatsapp.com/send?phone=' + WHATS_KADNA + '&text=' + encodeURIComponent(MSG_KADNA);
  // o botão do topo desce até o botão do convite, que fica no meio da tela
  document.querySelector('.botao-topo').addEventListener('click', e => { e.preventDefault(); btW.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  if (LINK_APLICACAO) document.getElementById('btAplicacao').href = LINK_APLICACAO;

  // Áudios: um por seção, em audios/<nome>.mp3. O botão fica no topo da seção.
  // Quando um áudio termina, a página desce sozinha para a próxima seção e toca o áudio dela.
  // Enquanto o áudio não foi gravado, o rascunho simula alguns segundos para mostrar o movimento.
  const SIMULACAO = 7, SIMULACAO_JORNADA = 18;
  const botoes = [...document.querySelectorAll('.ouvir')];
  const audio = new Audio();
  const barra = document.getElementById('barraAudio');
  const bPausa = document.getElementById('bPausa'), bVel = document.getElementById('bVel'), bFechar = document.getElementById('bFechar');
  const bNome = document.getElementById('bNome'), bFio = document.getElementById('bFio'), bSim = document.getElementById('bSim');
  let pos = -1, pausado = false, vel = 1, sim = null, simT = 0, simDur = 0, ultimaParada = -1;
  const secaoDe = bt => bt.closest('section, header');
  function rolarPara(el, frac) { scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * frac, behavior: 'smooth' }); }
  function marcar() {
    botoes.forEach((b, k) => { const on = k === pos; b.classList.toggle('tocando', on && !pausado); b.querySelector('.bola').textContent = on && !pausado ? '❚❚' : '▶'; });
    bPausa.textContent = pausado ? '▶' : '❚❚';
  }
  function limpar() { audio.pause(); audio.removeAttribute('src'); clearInterval(sim); sim = null; }
  function tocar(i) {
    limpar();
    if (i < 0 || i >= botoes.length) { fechar(); return; }
    pos = i; pausado = false; ultimaParada = -1;
    const bt = botoes[i], secao = secaoDe(bt);
    rolarPara(secao, 0);
    bNome.textContent = bt.querySelector('.sub').textContent.replace('·', '').trim();
    bSim.hidden = true; bFio.style.width = '0'; barra.classList.add('on'); marcar();
    audio.src = 'audios/' + bt.dataset.audio + '.mp3' + VERSAO;
    audio.playbackRate = vel;
    audio.play().catch(() => simular(i));
  }
  function simular(i) {
    if (sim || pos !== i) return;
    audio.removeAttribute('src');
    simT = 0; simDur = secaoDe(botoes[i]).querySelector('[data-sincronia]') ? SIMULACAO_JORNADA : SIMULACAO;
    bSim.hidden = false;
    sim = setInterval(() => { if (pausado) return; simT += 0.1 * vel; progresso(simT, simDur); if (simT >= simDur) tocar(pos + 1); }, 100);
  }
  function progresso(t, dur) {
    if (!dur || pos < 0) return;
    bFio.style.width = Math.min(100, t / dur * 100) + '%';
    // seções com sincronia: cada [data-tempo] (segundos) entra quando a fala chega nele; sem tempo, divide igual
    const linhaSinc = secaoDe(botoes[pos]).querySelector('[data-sincronia]');
    if (!linhaSinc) return;
    const ps = [...linhaSinc.querySelectorAll('.parada, .slide, .passo')];
    let k = -1;
    ps.forEach((p, j) => { const tempo = p.dataset.tempo ? +p.dataset.tempo : dur * (j + 0.5) / (ps.length + 0.5); if (t >= tempo) k = j; });
    if (k !== ultimaParada && k >= 0) {
      ultimaParada = k;
      if (linhaSinc.classList.contains('carrossel')) { if (k === 0) rolarPara(linhaSinc, 0.25); irPara(k); }
      else if (ps[k].classList.contains('passo')) { ps.forEach((x, j) => x.classList.toggle('acesa', j === k)); ps[k].classList.add('visivel'); rolarPara(ps[k], 0.5); }
      else rolarPara(ps[k].querySelector('.no'), 0.6);
    }
  }
  function fechar() { limpar(); pos = -1; pausado = false; barra.classList.remove('on'); marcar(); document.querySelectorAll('.passo.acesa').forEach(x => x.classList.remove('acesa')); brilhar(null); }

  // Raio: um brilho laranja passa pelo que a Jade está falando (tempos em segundos de cada áudio).
  // O seletor vale dentro da seção do áudio ('+ ' = na seção seguinte); null apaga o raio; 'print:N' passa os prints dos textões.
  const RAIOS = {
    '01-abertura': [[5.3, '.etiqueta'], [7.0, 'h1'], [12.3, '#subAbertura'], [17.8, '.botao-topo']],
    '01a-a-dor': [[0.0, '.etiqueta'], [1.5, 'h2'], [7.4, '.dor li:nth-child(1)'], [11.0, '.dor li:nth-child(2)'], [14.0, '.dor li:nth-child(3)'], [16.1, '.dor li:nth-child(4)'], [18.4, '.dor li:nth-child(5)'], [20.6, null], [25.8, '+ .etiqueta']],
    '01c-minha-historia': [[0.0, '.lead'], [4.9, null], [82.3, '+ .etiqueta']],
    '09b-textoes': [[0.0, '.lead'], [11.8, 'print:0'], [32.3, 'print:1'], [37.3, 'print:2'], [53.3, 'print:3'], [59.7, 'h2'], [64.8, '.etiqueta']],
    '10-depoimentos': [[0.0, '.etiqueta'], [5.7, '.dep:nth-child(1)'], [13.8, '.dep:nth-child(2)'], [22.1, '.dep:nth-child(3)'], [26.9, '.dep:nth-child(4)'], [27.8, '.dep:nth-child(5)'], [28.3, '.dep:nth-child(6)'], [28.8, '.dep:nth-child(7)'], [29.3, '.dep:nth-child(8)'], [33.0, '.honesta'], [43.1, 'h2'], [53.1, '+ .lead']],
    '01b-jornada-da-guerreira': [[0.1, '.cartao@0'], [8.7, '.cartao@1'], [17.9, '.cartao@2'], [26.9, '.cartao@3'], [35.2, '.cartao@4'], [43.2, '.cartao@5'], [52.0, '.cartao@6'], [59.8, '.cartao@7'], [65.0, '+ .etiqueta']],
    '11-por-que-grupo': [[0.0, 'h2'], [4.5, '.citacao'], [13.8, '.tres > div:nth-child(1)'], [21.4, '.tres > div:nth-child(2)'], [29.2, '.tres > div:nth-child(3)'], [37.7, '+ h2']],
    '09-para-quem': [[0.0, 'h2'], [1.2, '.sim li:nth-child(1)'], [5.1, '.sim li:nth-child(2)'], [9.6, '.sim li:nth-child(3)'], [13.2, '.sim li:nth-child(4)'], [19.0, null], [21.3, '.nao h3'], [22.4, '.nao li:nth-child(1)'], [24.7, '.nao li:nth-child(2)'], [27.1, '.nao li:nth-child(3)'], [30.2, '.sim h3'], [32.2, '+ h2']],
    '02-o-programa': [[0.0, '.lead'], [9.9, '.ficha > div:nth-child(1)'], [14.4, '.ficha > div:nth-child(2)'], [16.9, '.ficha > div:nth-child(3)'], [20.7, '.ficha > div:nth-child(4)'], [23.3, '.ficha > div:nth-child(5)'], [25.7, '.ficha > div:nth-child(6)'], [27.3, '+ h2']],
    '03-pilares': [[0.0, '.pilar:nth-child(1)'], [4.1, '.pilar:nth-child(2)'], [9.0, '.pilar:nth-child(3)'], [21.2, '.pilar:nth-child(4)'], [27.1, '.pilar:nth-child(5)'], [30.1, '.pilar:nth-child(6)'], [34.5, '+ .etiqueta']],
    '04-desafio': [[0.0, 'h2'], [1.2, '.lead'], [16.7, '.ano-topo h2'], [21.3, null], [27.9, '.momento-duvidas h3'], [30.5, '.momento-duvidas .lead'], [33.1, '.formato > div:nth-child(3)'], [35.1, '.lead + .lead'], [51.1, '+ h2']],
    '13-convite': [[0.0, '.oferta li:nth-child(1)'], [2.7, '.oferta li:nth-child(2)'], [6.1, '.oferta li:nth-child(3)'], [12.8, '.oferta li:nth-child(4)'], [17.5, '.oferta li:nth-child(5)'], [22.9, '.oferta li:nth-child(6)'], [26.3, '#btWhats']],
    '12-quem-e-a-jade': [[0, 'h2'], [1.1, '.lead'], [5.1, 'p:nth-of-type(2)'], [18.6, 'p:nth-of-type(3)'], [35.4, '.frase-jade']],
    '14-perguntas': [[0, 'h2'], [3.7, null]]
  };
  let raioAtual;
  function brilhar(sel) {
    if (sel === raioAtual) return;
    raioAtual = sel;
    document.querySelectorAll('.raio').forEach(x => x.classList.remove('raio'));
    if (!sel || pos < 0) return;
    if (sel.startsWith('print:')) { const k = +sel.slice(6); irParaPrint(k); prints[k].classList.add('raio'); const r = tx.getBoundingClientRect(); if (r.top < innerHeight * 0.08 || r.bottom > innerHeight * 0.92) tx.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    // '+ seletor' procura na seção seguinte (quando a fala já puxa o assunto de baixo)
    let secao = secaoDe(botoes[pos]);
    if (sel.startsWith('+ ')) { do { secao = secao.nextElementSibling; } while (secao && !secao.matches('section, header')); sel = sel.slice(2); }
    // 'seletor@N' = o N-ésimo (começando do 0) daquele seletor na seção
    const [css, n] = sel.split('@');
    const el = secao && (n === undefined ? secao.querySelector(css) : secao.querySelectorAll(css)[+n]);
    if (!el) return;
    el.classList.add('raio');
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.12 || r.bottom > innerHeight * 0.88) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  audio.addEventListener('timeupdate', () => {
    const r = pos >= 0 && RAIOS[botoes[pos].dataset.audio];
    if (!r) { brilhar(null); return; }
    let sel = null;
    // pequeno atraso para o raio chegar junto com a palavra, e não antes dela
    for (const [t, k] of r) if (audio.currentTime >= t + 0.3) sel = k;
    brilhar(sel);
  });
  function pausar() {
    pausado = !pausado;
    if (!sim) { pausado ? audio.pause() : audio.play().catch(() => {}); }
    marcar();
  }
  botoes.forEach((bt, i) => bt.addEventListener('click', () => (i === pos ? pausar() : tocar(i))));
  audio.addEventListener('timeupdate', () => progresso(audio.currentTime, audio.duration));
  audio.addEventListener('ended', () => tocar(pos + 1));
  audio.addEventListener('error', () => { if (pos >= 0 && audio.getAttribute('src')) simular(pos); });
  bPausa.addEventListener('click', pausar);
  bFechar.addEventListener('click', fechar);
  bVel.addEventListener('click', () => { vel = vel === 1 ? 1.5 : vel === 1.5 ? 2 : 1; audio.playbackRate = vel; bVel.textContent = vel + 'x'; });

  // A minha jornada em fotos: setas, pontinhos e arrastar com o dedo
  const car = document.getElementById('carrossel');
  const slides = [...car.querySelectorAll('.slide')];
  const pontos = document.getElementById('pontos');
  slides.forEach(() => pontos.appendChild(document.createElement('i')));
  let slideAtual = 0;
  function marcarSlide(k) { slideAtual = k; slides.forEach((s, j) => s.classList.toggle('atual', j === k)); [...pontos.children].forEach((p, j) => p.classList.toggle('on', j === k)); }
  function irPara(k) { k = Math.max(0, Math.min(slides.length - 1, k)); car.scrollTo({ left: slides[k].offsetLeft - car.offsetLeft, behavior: 'smooth' }); marcarSlide(k); }
  document.querySelectorAll('.seta[data-dir]').forEach(b => b.addEventListener('click', () => irPara(slideAtual + +b.dataset.dir)));
  car.addEventListener('scroll', () => { clearTimeout(car.t); car.t = setTimeout(() => {
    let melhor = 0; slides.forEach((s, j) => { if (Math.abs(s.offsetLeft - car.offsetLeft - car.scrollLeft) < Math.abs(slides[melhor].offsetLeft - car.offsetLeft - car.scrollLeft)) melhor = j; });
    marcarSlide(melhor);
  }, 120); }, { passive: true });
  marcarSlide(0);

  // Os textões no direct: setas e pontinhos, um print por vez
  const tx = document.querySelector('.textoes'), prints = [...tx.querySelectorAll('img')], pontosT = document.getElementById('pontosTextoes');
  prints.forEach(() => pontosT.appendChild(document.createElement('i')));
  let printAtual = 0;
  function marcarPrint(k) { printAtual = k; [...pontosT.children].forEach((p, j) => p.classList.toggle('on', j === k)); }
  function irParaPrint(k) { k = Math.max(0, Math.min(prints.length - 1, k)); tx.scrollTo({ left: prints[k].offsetLeft - tx.offsetLeft - 4, behavior: 'smooth' }); marcarPrint(k); }
  document.querySelectorAll('.seta[data-t]').forEach(b => b.addEventListener('click', () => irParaPrint(printAtual + +b.dataset.t)));
  tx.addEventListener('scroll', () => { clearTimeout(tx.t); tx.t = setTimeout(() => {
    const fim = tx.scrollLeft + tx.clientWidth >= tx.scrollWidth - 4;
    let melhor = 0; prints.forEach((s, j) => { if (Math.abs(s.offsetLeft - tx.offsetLeft - tx.scrollLeft) < Math.abs(prints[melhor].offsetLeft - tx.offsetLeft - tx.scrollLeft)) melhor = j; });
    marcarPrint(fim ? prints.length - 1 : melhor);
  }, 120); }, { passive: true });
  marcarPrint(0);


  // Rascunho: versões da frase de abertura
  const SUBS = [
    'Uma jornada ao meu lado para transformar o que você sabe em produtos autorais, um conteúdo que comunica a sua mensagem única e um setor de vendas que não depende do algoritmo.',
    'Em 12 semanas ao meu lado, você transforma o que sabe em produtos autorais, um conteúdo que comunica a sua mensagem única e um setor de vendas que não depende do algoritmo.',
    'Uma jornada ao meu lado para transformar o que você sabe em produtos autorais, uma comunicação que conecta e um setor de vendas que não depende dos números das redes sociais.'
  ];
  document.querySelectorAll('#testeSub button').forEach(b => b.addEventListener('click', () => {
    document.getElementById('subAbertura').textContent = SUBS[+b.dataset.i];
    document.querySelectorAll('#testeSub button').forEach(x => x.classList.toggle('on', x === b));
  }));



  // Rascunho: trocar a foto do topo (todas ficam em preto e branco)
  document.querySelectorAll('.troca-foto button').forEach(b => b.addEventListener('click', () => {
    const img = document.getElementById('fotoTopo');
    img.src = 'fotos/' + b.dataset.foto; img.style.objectPosition = b.dataset.pos || '';
    document.querySelectorAll('.troca-foto button').forEach(x => x.classList.toggle('on', x === b));
  }));

  // Jornada da Guerreira: a bola laranja desce pela linha e cada etapa entra de baixo para cima
  document.documentElement.classList.add('anima');  // sem script, os cartões aparecem parados
  const linha = document.getElementById('linhaJornada');
  const feito = document.getElementById('feito');
  const bolaGuia = document.getElementById('bolaGuia');
  const paradas = [...linha.querySelectorAll('.parada')];
  const io = new IntersectionObserver((itens) => itens.forEach(it => {
    if (it.isIntersecting) { it.target.classList.add('visivel'); io.unobserve(it.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  paradas.forEach(p => io.observe(p));
  document.querySelectorAll('.passo').forEach(p => io.observe(p));  // os Campos do desafio também sobem ao aparecer
  const troca = linha.querySelector('.parada.troca');
  function moverBola() {
    const r = linha.getBoundingClientRect();
    const alvo = innerHeight * 0.6;               // a bola fica a 60% da altura da tela
    const y = Math.max(0, Math.min(r.height, alvo - r.top));
    feito.style.height = y + 'px';
    feito.style.setProperty('--alt', r.height + 'px');
    const t = troca.getBoundingClientRect();
    feito.style.setProperty('--corte', (t.top + t.height / 2 - r.top) + 'px');
    bolaGuia.style.top = y + 'px';
    paradas.forEach(p => {
      const no = p.querySelector('.no');
      const meio = no.getBoundingClientRect().top + 13 - r.top;
      p.classList.toggle('acesa', y >= meio);
    });
  }
  addEventListener('scroll', moverBola, { passive: true });
  addEventListener('resize', moverBola);
  moverBola();
