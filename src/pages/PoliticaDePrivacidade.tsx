import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";

export default function PoliticaDePrivacidade() {
  return (
    <>
      <SEOHead
        title="Política de Privacidade | MK Art SEO"
        description="Saiba como a MK Art coleta, utiliza e protege seus dados pessoais em conformidade com a LGPD."
        canonicalUrl="https://mkart.com.br/politica-de-privacidade"
      />
      <Header />
      <main className="pt-24 mx-auto max-w-3xl px-4 py-16 text-neutral-800 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-neutral-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Última atualização: 29 de abril de 2026
          </p>
        </header>

        <article className="space-y-8 text-base leading-relaxed">
          <section>
            <p>
              Esta Política de Privacidade descreve como a{" "}
              <strong>Mk Art Tráfego Orgânico Ltda.</strong> ("Mk Art", "nós") coleta,
              utiliza, compartilha e protege os dados pessoais de visitantes,
              leads e clientes em seus sites, landing pages, webinars e canais
              digitais (em conjunto, "Plataforma"). Este documento está em
              conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de
              Dados Pessoais — LGPD) e com o Marco Civil da Internet (Lei nº
              12.965/2014).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">1. Quem é o controlador dos dados</h2>
            <p>
              <strong>Mk Art Tráfego Orgânico Ltda.</strong><br />
              CNPJ: 26.248.684/0001-39<br />
              Endereço: Rua Caminho do Pilar, 401 — Santo André/SP<br />
              Contato do encarregado de proteção de dados (DPO):{" "}
              <a href="mailto:privacidade@mkart.com.br" className="text-neutral-900 underline underline-offset-2">privacidade@mkart.com.br</a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">2. Quais dados coletamos</h2>
            <p className="mb-3">
              Coletamos apenas os dados estritamente necessários para as finalidades descritas nesta Política. Os dados podem ser fornecidos ativamente por você ou coletados de forma automática.
            </p>
            <h3 className="mb-2 mt-4 text-base font-semibold text-neutral-900">2.1. Dados fornecidos por você</h3>
            <p>
              Nome, e-mail, telefone/WhatsApp, especialidade médica, cidade, informações sobre sua clínica ou prática profissional, e quaisquer outras informações que você nos envie por formulários, inscrições em webinars, contato comercial ou e-mail.
            </p>
            <h3 className="mb-2 mt-4 text-base font-semibold text-neutral-900">2.2. Dados coletados automaticamente</h3>
            <p>
              Endereço IP, tipo e versão do navegador, sistema operacional, páginas visitadas, tempo de permanência, origem do tráfego (UTMs), identificadores de dispositivo e dados de cookies. Para detalhes, consulte nossa{" "}
              <Link to="/politica-de-cookies" className="text-neutral-900 underline underline-offset-2">Política de Cookies</Link>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">3. Para que usamos seus dados (finalidades)</h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>Inscrever você em webinars, desafios, eventos e conteúdos.</li>
              <li>Enviar comunicações comerciais, materiais educacionais e novidades sobre serviços (você pode descadastrar a qualquer momento).</li>
              <li>Apresentar nossos serviços, agendar diagnósticos estratégicos e executar contratos firmados.</li>
              <li>Mensurar e otimizar campanhas de marketing, tráfego e desempenho da Plataforma.</li>
              <li>Cumprir obrigações legais, regulatórias e responder a autoridades competentes.</li>
              <li>Prevenir fraudes e proteger a segurança da Plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">4. Bases legais para o tratamento</h2>
            <p className="mb-3">O tratamento dos seus dados pessoais é fundamentado nas hipóteses previstas pelo art. 7º da LGPD, incluindo:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li><strong>Consentimento</strong> — para envio de comunicações de marketing e cookies não essenciais.</li>
              <li><strong>Execução de contrato</strong> — quando você contrata nossos serviços ou se inscreve em um evento.</li>
              <li><strong>Legítimo interesse</strong> — para análise de desempenho, segurança e melhoria contínua dos nossos serviços, sempre respeitando seus direitos fundamentais.</li>
              <li><strong>Cumprimento de obrigação legal ou regulatória</strong> — quando exigido por lei.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">5. Compartilhamento de dados</h2>
            <p className="mb-3">Não vendemos seus dados. Compartilhamos apenas com terceiros estritamente necessários à operação da Plataforma e dos nossos serviços, todos sujeitos a obrigações de confidencialidade e segurança:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Plataformas de hospedagem, análise e métricas (ex.: Google Analytics, Google Tag Manager).</li>
              <li>Plataformas de mídia paga e remarketing (ex.: Google Ads, Meta Ads).</li>
              <li>Ferramentas de e-mail marketing, automação de marketing e CRM.</li>
              <li>Plataformas de webinar, atendimento e mensageria.</li>
              <li>Contadores, advogados e prestadores de serviços jurídicos.</li>
              <li>Autoridades públicas, quando requisitado por lei ou ordem judicial.</li>
            </ul>
            <p className="mt-3">Alguns desses fornecedores podem realizar transferência internacional de dados. Quando isso ocorrer, garantimos que sejam adotados mecanismos previstos na LGPD para proteção dos seus dados em outros países.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">6. Por quanto tempo armazenamos seus dados</h2>
            <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta Política, observando prazos legais, regulatórios e de prescrição. Após esse período, os dados são eliminados ou anonimizados, exceto quando houver obrigação legal de guarda (por exemplo, registros de acesso por 6 meses, conforme o Marco Civil da Internet).</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">7. Seus direitos como titular</h2>
            <p className="mb-3">A LGPD garante a você os seguintes direitos, exercíveis a qualquer momento mediante solicitação ao nosso DPO:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Confirmação da existência de tratamento de dados pessoais;</li>
              <li>Acesso aos dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;</li>
              <li>Portabilidade dos dados;</li>
              <li>Eliminação dos dados tratados com base no consentimento, exceto nas hipóteses de guarda legal;</li>
              <li>Informação sobre as entidades públicas e privadas com as quais compartilhamos os dados;</li>
              <li>Informação sobre a possibilidade de não fornecer consentimento e suas consequências;</li>
              <li>Revogação do consentimento.</li>
            </ul>
            <p className="mt-3">Para exercer qualquer direito, escreva para <a href="mailto:privacidade@mkart.com.br" className="text-neutral-900 underline underline-offset-2">privacidade@mkart.com.br</a>. Responderemos no prazo legal. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">8. Segurança da informação</h2>
            <p>Adotamos medidas técnicas e administrativas razoáveis para proteger seus dados contra acessos não autorizados, perda, alteração e destruição, incluindo controle de acesso, criptografia em trânsito e auditorias periódicas. Apesar dos esforços, nenhum sistema é totalmente imune a falhas, e nos comprometemos a comunicar incidentes relevantes na forma da lei.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">9. Crianças e adolescentes</h2>
            <p>Nossa Plataforma é destinada a profissionais médicos, gestores de clínicas e empreendedores da saúde, todos maiores de 18 anos. Não coletamos intencionalmente dados de crianças ou adolescentes. Caso identifiquemos dados nessas condições, eles serão eliminados.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">10. Alterações nesta Política</h2>
            <p>Podemos atualizar esta Política periodicamente para refletir mudanças em nossos serviços, requisitos legais ou boas práticas. Quando houver alterações relevantes, comunicaremos por meios adequados. A versão vigente é sempre aquela publicada nesta página, com a data de atualização no topo.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">11. Contato</h2>
            <p>Dúvidas, solicitações ou reclamações sobre privacidade e dados pessoais devem ser direcionadas ao nosso DPO em <a href="mailto:privacidade@mkart.com.br" className="text-neutral-900 underline underline-offset-2">privacidade@mkart.com.br</a>.</p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
