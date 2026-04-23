import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Esse método respeita as regras do CFM?", a: "Sim. Todo o ecossistema é construído dentro da Resolução CFM 2.336/2023 e do manual atualizado de 2024. Nada de promessa sensacionalista, nada de \"antes e depois\" em terreno cinza, nada de ancoragem proibida. A autoridade é construída pela densidade técnica do conteúdo — que é exatamente o que o EEAT do Google e o critério das IAs premiam hoje." },
  { q: "Funciona para a minha especialidade?", a: "O método funciona para qualquer especialidade com demanda particular — psiquiatria, endocrinologia, gastroenterologia, dermatologia, ortopedia, ginecologia, cardiologia, entre outras. O que muda é a estrutura das palavras-chave de fundo de funil e a configuração do agente de IA. No webinar eu mostro isso adaptado a diferentes especialidades." },
  { q: "Quanto tempo leva para ver resultado?", a: "Tráfego pago começa a gerar lead qualificado na primeira semana. SEO orgânico mostra movimento em 60 a 90 dias. GEO (aparecer nas IAs) tem começado a responder em 30 a 60 dias, dependendo da concorrência local. O agente de IA no WhatsApp começa a qualificar no dia que é implementado." },
  { q: "Preciso gravar vídeos, fazer stories, virar influencer?", a: "Não. O método funciona totalmente sem a sua exposição pessoal. Conteúdo pode ser escrito, gravado pela equipe, ou produzido em formato técnico (blog, landing page, artigo). Autoridade científica se constrói pela densidade do conteúdo, não pela exposição do rosto." },
  { q: "Minha secretária já está sobrecarregada. Vai piorar?", a: "Pelo contrário. O agente de IA no WhatsApp responde 24/7, qualifica, ancora preço e entrega o paciente já pronto para a sua recepção só confirmar o agendamento. A equipe para de apagar incêndio com curioso e volta a agendar paciente premium." },
  { q: "O webinar tem venda no final?", a: "Sim. Ao final, eu apresento a oportunidade de implementar o método na sua clínica com acompanhamento direto. Você sai com clareza total do método mesmo que não contrate — e a decisão de avançar é sempre sua." },
];

export const WebinarFAQ = () => (
  <section className="bg-white text-webinar-ink">
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h2 className="font-serif-display text-3xl sm:text-5xl font-medium tracking-tight mb-10">
        Perguntas que você provavelmente está se fazendo agora.
      </h2>

      <Accordion type="single" collapsible className="border-t border-webinar">
        {FAQS.map(({ q, a }, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b border-webinar">
            <AccordionTrigger className="text-left font-sans font-semibold text-base sm:text-lg py-5 hover:no-underline">
              {q}
            </AccordionTrigger>
            <AccordionContent className="text-[15px] leading-[1.7] text-webinar-muted pb-6">
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
