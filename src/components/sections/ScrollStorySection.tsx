import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./scroll-story.css";

/**
 * Topo da home: um vídeo ligado à rolagem. O ferreiro forja o elo, a fábrica se
 * desfaz, a corrente se forma e sobe de ferro para cromo, ouro e o logo, e cada
 * etapa da corrente é uma faixa de preço da loja (do pacote de entrada ao premium).
 *
 * O vídeo são quadros soltos em `public/home-rolagem/` (`d/` para tela deitada,
 * `m/` recortado em pé para o celular), feitos na VPS pela skill `video-para-site`
 * a partir de `mkart-scroll-v01`. A rolagem escolhe qual quadro desenhar no canvas.
 *
 * Sem GSAP nem Lenis (dependência nova pede autorização): o laço é um
 * `requestAnimationFrame` que suaviza o progresso, e as entradas do texto são
 * transições de CSS ligadas à classe `is-active`. O texto todo é HTML de verdade,
 * com o `h1` da palavra-chave da página; o vídeo é só decoração (`aria-hidden`).
 */

/**
 * A rolagem não anda o vídeo numa velocidade só: cada trecho diz quanto de rolagem
 * (em vh) gasta e de que segundo a que segundo do vídeo vai. Trecho com o mesmo
 * segundo nas duas pontas é uma pausa, para o texto daquela faixa ficar na tela.
 * Segundos medidos em `mkart-scroll-v01` (39,33 s). Ajustes do Marco em 2026-10-21:
 * marteladas mais lentas, pausas no elo, nos dois elos, no cromo, no ouro e no
 * começo do último vídeo.
 *
 * [fim do trecho em vh, segundo inicial, segundo final]
 */
const LINHA: [number, number, number][] = [
  [105, 0, 3.5], //      marteladas, com o título na tela
  [240, 3.5, 8], //      marteladas, "Cada link num portal real"
  [340, 8, 11.5], //     a fábrica explode, o texto continua
  [380, 11.5, 13], //    o elo aparece no meio das partículas
  [430, 13, 13], //      pausa: o elo
  [470, 13, 14.75], //   o elo gira até os dois elos
  [530, 14.75, 14.75], // pausa: os dois elos, sem texto
  [555, 14.75, 15.5], // vira um elo só
  [615, 15.5, 16.2], //  o elo se mexe devagar, entra o Pacote Básico
  [685, 16.2, 18.5], //  a corrente se forma
  [795, 18.5, 23.6], //  a corrente vira cromo, entra o Pacote Médio
  [875, 23.6, 23.6], //  pausa: corrente cromada
  [955, 23.6, 27.5], //  clarão roxo, o elo do meio vira ouro
  [1000, 27.5, 29.5], // ouro
  [1080, 29.5, 29.5], // pausa: ouro, "Os portais mais disputados"
  [1135, 29.5, 32.3], // começa o último vídeo
  [1215, 32.3, 32.3], // pausa: "Portal a portal"
  [1335, 32.3, 38.2], // explode e vira o logo
  [1360, 38.2, 39.33],
  [1420, 39.33, 39.33], // pausa final: a chamada
];
const TOTAL = LINHA[LINHA.length - 1][0];
/** Posição na rolagem, em %, de um ponto da LINHA (para data-enter/data-leave). */
const em = (vh: number) => ((vh / TOTAL) * 100).toFixed(2);
/** O título do topo fica até aqui (vh) e some nos 15 vh seguintes. */
const TOPO_ATE = 95;

/**
 * Velocidade máxima do vídeo, em segundos de vídeo por segundo real. 1 = o ritmo
 * de quando se dá play. As marteladas e a explosão (até 11,5 s) andam no ritmo
 * real; o resto pode ir um pouco mais rápido. Para trás, mais rápido ainda.
 */
const RITMO = (segundo: number) => (segundo < 11.5 ? 1 : 1.6);
const RITMO_VOLTA = 3;
/** Rolagem máxima percorrida por segundo onde o vídeo está parado (pausas), em vh. */
const PAUSA_VH_S = 300;

/** Quadros carregados antes dos outros, para a primeira imagem aparecer logo. */
const FIRST_BATCH = 8;
/** Downloads de quadro em paralelo depois do primeiro lote. */
const PARALLEL = 6;
const WHATSAPP = "https://wa.me/5511989151997";

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

/** Segundo do vídeo para um ponto da rolagem (em vh), seguindo a LINHA. */
const segundoEm = (vh: number) => {
  let inicio = 0;
  for (const [fim, de, ate] of LINHA) {
    if (vh <= fim) return de + (ate - de) * clamp((vh - inicio) / (fim - inicio));
    inicio = fim;
  }
  return LINHA[LINHA.length - 1][2];
};

type Faixa = { enter: number; leave: number };
const faixa = (el: HTMLElement): Faixa => ({
  enter: parseFloat(el.dataset.enter ?? "0") / 100,
  leave: parseFloat(el.dataset.leave ?? "100") / 100,
});

const ScrollStorySection = () => {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !stage || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const emPe = window.matchMedia("(max-aspect-ratio: 1/1)").matches;
    const pasta = `/home-rolagem/${emPe ? "m" : "d"}`;

    const hero = stage.querySelector<HTMLElement>(".story-hero");
    const marquee = stage.querySelector<HTMLElement>(".story-marquee");
    const marqueeText = stage.querySelector<HTMLElement>(".story-marquee-text");
    const steps = Array.from(stage.querySelectorAll<HTMLElement>(".story-step"));

    let frames: HTMLImageElement[] = [];
    let count = 0;
    let duracao = 1;
    let drawn = -1;
    let alvo = 0;
    let suave = 0;
    let raf = 0;
    let visivel = true;
    let cancelado = false;

    // ---------- Canvas ----------
    const desenhar = (indice: number) => {
      // Ainda carregando: usa o quadro pronto mais próximo para trás.
      let i = indice;
      while (i > 0 && !(frames[i]?.complete && frames[i].naturalWidth)) i--;
      const img = frames[i];
      if (!img?.complete || !img.naturalWidth || i === drawn) return;
      drawn = i;
      const cw = canvas.width, ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * escala, dh = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const redimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(stage.clientWidth * dpr);
      canvas.height = Math.round(stage.clientHeight * dpr);
      const atual = drawn;
      drawn = -1;
      desenhar(Math.max(atual, 0));
    };
    const ro = new ResizeObserver(redimensionar);
    ro.observe(stage);

    // ---------- Quadros: primeiro lote na hora, o resto aos poucos ----------
    const carregar = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = img.onerror = () => resolve();
        img.src = `${pasta}/frame_${String(i + 1).padStart(4, "0")}.webp`;
        frames[i] = img;
      });

    (async () => {
      try {
        const info = await fetch(`${pasta}/info.json`).then((r) => r.json());
        if (cancelado) return;
        count = info.count;
        duracao = info.duration || 1;
        frames = new Array(count);
        await Promise.all(Array.from({ length: Math.min(FIRST_BATCH, count) }, (_, i) => carregar(i)));
        if (cancelado) return;
        redimensionar();
        let proximo = FIRST_BATCH;
        const fila = async () => {
          while (!cancelado && proximo < count) await carregar(proximo++);
        };
        await Promise.all(Array.from({ length: PARALLEL }, fila));
      } catch {
        // Sem quadros, a seção continua de pé: o texto não depende do vídeo.
      }
    })();

    // ---------- Laço da rolagem ----------
    const progresso = () => {
      const topo = parseFloat(getComputedStyle(stage).top) || 0;
      const total = root.offsetHeight - stage.offsetHeight;
      return total > 0 ? clamp((topo - root.getBoundingClientRect().top) / total) : 0;
    };

    const aplicar = (p: number) => {
      const vh = p * TOTAL;
      if (count) {
        const t = segundoEm(vh);
        desenhar(Math.min(Math.floor((t / duracao) * count), count - 1));
        // O segundo em que o vídeo está, para conferir o ritmo no navegador.
        root.dataset.segundo = t.toFixed(1);
      }
      if (hero) hero.style.opacity = String(clamp(1 - (vh - TOPO_ATE) / 15));

      steps.forEach((el) => {
        const { enter, leave } = faixa(el);
        const fica = el.dataset.persist === "true" && p > enter;
        const ativo = (p >= enter && p <= leave) || fica;
        if (ativo !== el.classList.contains("is-active")) el.classList.toggle("is-active", ativo);
      });

      if (marquee && marqueeText) {
        // O letreiro corre só dentro da própria faixa.
        const { enter, leave } = faixa(marquee);
        marquee.classList.toggle("is-active", p >= enter && p <= leave);
        marqueeText.style.transform = `translateX(${-clamp((p - enter) / (leave - enter)) * 28}%)`;
      }
    };

    // A rolagem diz até onde o vídeo deve ir; o vídeo anda até lá no próprio ritmo,
    // como se tivesse dado play. Rolada de rodinha pula ~300 px de uma vez: seguindo
    // a rolagem na hora, 1–2 s de marteladas passavam num instante e parecia acelerado.
    let ultimo = 0;
    const laco = (agora: number) => {
      const dt = ultimo ? Math.min((agora - ultimo) / 1000, 0.1) : 1 / 60;
      ultimo = agora;
      alvo = progresso();
      if (reduceMotion) {
        suave = alvo;
      } else {
        const atual = suave * TOTAL;
        const falta = alvo * TOTAL - atual;
        if (Math.abs(falta) < 0.05) {
          suave = alvo;
        } else {
          // Nas pausas o vídeo não anda: a posição avança no máximo PAUSA_VH_S.
          let passo = Math.sign(falta) * Math.min(Math.abs(falta), PAUSA_VH_S * dt);
          const t0 = segundoEm(atual);
          const dtVideo = Math.abs(segundoEm(atual + passo) - t0);
          // Atraso grande (rolou muito de uma vez): o vídeo acelera aos poucos para alcançar.
          const atraso = Math.abs(segundoEm(alvo * TOTAL) - t0);
          const ritmo = (falta > 0 ? RITMO(t0) : RITMO_VOLTA) * clamp(1 + (atraso - 1.5) / 2, 1, 4);
          if (dtVideo > ritmo * dt) passo *= (ritmo * dt) / dtVideo;
          suave = (atual + passo) / TOTAL;
        }
      }
      aplicar(suave);
      raf = visivel ? requestAnimationFrame(laco) : 0;
    };

    // Só roda o laço com a seção na tela; fora dela, a home não paga nada.
    const io = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting;
      if (visivel && !raf) raf = requestAnimationFrame(laco);
    });
    io.observe(root);
    raf = requestAnimationFrame(laco);

    return () => {
      cancelado = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={rootRef} id="home" className="story" aria-label="Da forja ao premium">
      <div ref={stageRef} className="story-stage">
        <canvas ref={canvasRef} className="story-canvas" aria-hidden="true" />
        <div className="story-vignette" aria-hidden="true" />
        <div className="story-marquee" data-enter={em(345)} data-leave={em(428)} aria-hidden="true">
          <div className="story-marquee-text">
            do primeiro link ao portal premium — do primeiro link ao portal premium —
          </div>
        </div>

        <div className="story-hero">
          <h1 className="story-label">Comprar backlinks de qualidade · MK Art</h1>
          <p className="story-hero-title">
            Do acessível ao <em>premium.</em>
          </p>
          <p className="story-hero-tagline">
            Backlinks para cada momento do seu site: dos pacotes de entrada aos portais mais
            difíceis de conseguir no mercado.
          </p>
          <div className="story-hint" aria-hidden="true">
            <span>Role para descer</span>
            <i />
          </div>
        </div>

        <div className="story-step story-left" data-enter={em(110)} data-leave={em(338)} data-anim="slide-left">
          <span className="story-item story-label">001 / Link de verdade</span>
          <h2 className="story-item story-title">Cada link num portal real.</h2>
          <p className="story-item story-body">
            Você vê o domínio, o DA e o tráfego de cada portal antes de comprar. O catálogo é
            aberto: não precisa de cadastro para ver preço.
          </p>
        </div>

        <div className="story-step story-right" data-enter={em(560)} data-leave={em(722)} data-anim="fade-up">
          <span className="story-item story-label">002 / Para começar</span>
          <h2 className="story-item story-title">Pacote Básico</h2>
          <p className="story-item story-body">
            20 backlinks em portais de DA 20 a 30, com âncoras inclusas, por <strong>R$ 197</strong>.
          </p>
          <Link className="story-item story-link" to="/pacote-backlinks/basico">
            Ver o pacote →
          </Link>
        </div>

        <div className="story-step story-left" data-enter={em(738)} data-leave={em(878)} data-anim="clip-reveal">
          <span className="story-item story-label">003 / Para crescer</span>
          <h2 className="story-item story-title">Pacote Médio</h2>
          <p className="story-item story-body">
            20 backlinks em portais de DA 30 a 40, com âncoras inclusas, por <strong>R$ 497</strong>.
          </p>
          <Link className="story-item story-link" to="/pacote-backlinks/medio">
            Ver o pacote →
          </Link>
        </div>

        <div className="story-step story-right" data-enter={em(968)} data-leave={em(1084)} data-anim="scale-up">
          <span className="story-item story-label">004 / Premium</span>
          <h2 className="story-item story-title">Os portais mais disputados.</h2>
          <p className="story-item story-body">
            Os portais de maior autoridade do catálogo, os que pouca gente consegue. A lista é
            montada com você, e o preço é sob consulta.
          </p>
          <a className="story-item story-link" href={WHATSAPP}>
            Montar uma lista premium →
          </a>
        </div>

        <div className="story-step story-left" data-enter={em(1100)} data-leave={em(1218)} data-anim="slide-right">
          <span className="story-item story-label">005 / Do seu jeito</span>
          <h2 className="story-item story-title">Portal a portal.</h2>
          <p className="story-item story-body">
            No catálogo avulso você escolhe cada publicação, de dezenas a milhares de reais. Para
            quem está começando, para agências, lojas virtuais e profissionais de saúde.
          </p>
        </div>

        <div className="story-step story-left story-cta" data-enter={em(1338)} data-leave="100" data-anim="rotate-in" data-persist="true">
          <span className="story-item story-label">006 / Próximo passo</span>
          <h2 className="story-item story-title">Escolha onde seu site vai aparecer.</h2>
          <p className="story-item story-body">
            Veja o catálogo com preço, DA e tráfego de cada portal, ou monte um plano com a gente.
          </p>
          <div className="story-item story-actions">
            <Link className="story-button" to="/comprar-backlinks">
              Ver catálogo
            </Link>
            <a className="story-button story-button-ghost" href={WHATSAPP}>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollStorySection;
