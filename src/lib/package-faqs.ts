/**
 * Avisos exibidos na página de finalização do pacote.
 *
 * Atenção: estas regras valem SOMENTE para a modalidade de pacote.
 * A compra avulsa (/comprar-backlinks) tem prazo e formas de pagamento
 * próprios, descritos no FAQ daquela página.
 */

export interface PackageFaq {
  question: string;
  answer: string;
}

export const PACKAGE_FAQS: PackageFaq[] = [
  {
    question: "Os backlinks são permanentes?",
    answer:
      "Sim. Caso algum link venha a se perder, alocamos outro link em um site com as mesmas métricas do que foi contratado.",
  },
  {
    question: "Quais são os nichos dos backlinks?",
    answer:
      "São blogs que falam sobre vários assuntos, entre eles tecnologia, saúde, bem-estar, entretenimento, turismo, negócios, finanças e imóveis.",
  },
  {
    question: "Posso escolher apenas um nicho para todos os sites?",
    answer:
      'Nessa modalidade de pacote, que é mais acessível, inserimos os artigos em sites de temas variados. O título do artigo é criado adaptando o tema do site que recebe o backlink ao tema do seu site de destino. Por exemplo, para um site de contabilidade, publicamos um artigo com o título "Como fazer a contabilidade de uma agência de marketing digital" apontando um backlink dentro de um blog de marketing digital. Se quiser somente sites de nicho exato, temos a nossa lista na loja, porém o valor é bem maior. Temos tido ótimos resultados com essa estratégia de adaptação.',
  },
  {
    question: "Posso parcelar?",
    answer: "Não. Por enquanto, pagamentos apenas à vista no PIX.",
  },
  {
    question: "E se eu não souber as âncoras e as páginas de destino?",
    answer:
      "Você pode marcar a opção para a nossa equipe analisar o seu site e escolher as âncoras e as páginas, ou falar com a gente no WhatsApp que ajudamos você a montar.",
  },
  {
    question: "Quanto tempo demora para entregar?",
    answer:
      "De 1 a 3 dias úteis. No pacote personalizado o prazo é combinado caso a caso.",
  },
  {
    question: "Posso escolher os sites?",
    answer:
      "Não. Na modalidade de pacotes não é possível escolher os sites. Isso é possível apenas na compra avulsa da nossa loja, onde o valor é maior.",
  },
  {
    question: "Se eu não gostar do trabalho, posso pedir reembolso?",
    answer:
      "Sim, você pode pedir o reembolso a hora que quiser, mas nesse caso os links serão removidos.",
  },
  {
    question: "O pagamento é mensal?",
    answer: "Não, é pagamento único.",
  },
  {
    question: "Quantos backlinks devo fazer por mês?",
    answer:
      "O ideal é fazer de 10 a 20 backlinks por mês, por pelo menos 6 meses a 1 ano, para não ser penalizado.",
  },
  {
    question: "Posso fazer backlinks em paralelo?",
    answer:
      "Não indicamos. O ideal é apontar de 10 a 20 backlinks por mês para ter um resultado satisfatório e não ser penalizado.",
  },
  {
    question: "Os backlinks são de quais sites?",
    answer: "Trabalhamos apenas com blogs de conteúdo.",
  },
  {
    question: "Os backlinks trazem tráfego?",
    answer:
      "Não muito. São backlinks focados em DA e em referência de sites com DA alto. Usamos esses mesmos backlinks em vários dos nossos cases de sucesso. Garantimos resultados satisfatórios ou você pode pedir o dinheiro de volta — nesse caso os backlinks são removidos.",
  },
];
