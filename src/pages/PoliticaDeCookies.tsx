import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";

export default function PoliticaDeCookies() {
  return (
    <>
      <SEOHead
        title="Política de Cookies | MK Art SEO"
        description="Entenda como a MK Art utiliza cookies e tecnologias similares em seus sites e canais digitais."
        canonicalUrl="https://mkart.com.br/politica-de-cookies"
      />
      <Header />
      <main className="pt-24 mx-auto max-w-3xl px-4 py-16 text-neutral-800 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-neutral-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Política de Cookies
          </h1>
          <p className="mt-3 text-sm text-neutral-500">Última atualização: 29 de abril de 2026</p>
        </header>

        <article className="space-y-8 text-base leading-relaxed">
          <section>
            <p>
              Esta Política de Cookies explica como a <strong>Mk Art Tráfego Orgânico Ltda.</strong> (CNPJ 26.248.684/0001-39) utiliza cookies e tecnologias similares em seus sites, landing pages e canais digitais. Ela complementa nossa{" "}
              <Link to="/politica-de-privacidade" className="text-neutral-900 underline underline-offset-2">Política de Privacidade</Link>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">1. O que são cookies</h2>
            <p>Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles permitem reconhecer o seu dispositivo, lembrar preferências e medir o desempenho das páginas. Tecnologias similares, como pixels e armazenamento local (localStorage), funcionam de forma equivalente para finalidades análogas.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">2. Tipos de cookies que utilizamos</h2>

            <h3 className="mb-2 mt-4 text-base font-semibold text-neutral-900">2.1. Cookies essenciais</h3>
            <p>Necessários para o funcionamento básico do site, como navegação entre páginas, segurança e armazenamento da sua escolha sobre o banner de cookies. Não podem ser desativados sem prejudicar a experiência.</p>

            <h3 className="mb-2 mt-4 text-base font-semibold text-neutral-900">2.2. Cookies de desempenho e análise</h3>
            <p>Coletam dados agregados sobre como os visitantes utilizam o site (páginas mais acessadas, tempo de permanência, origem do tráfego), permitindo melhorar a experiência. Exemplo: Google Analytics.</p>

            <h3 className="mb-2 mt-4 text-base font-semibold text-neutral-900">2.3. Cookies de marketing e publicidade</h3>
            <p>Permitem mensurar e otimizar campanhas, exibir anúncios mais relevantes e ativar remarketing em outras plataformas. Exemplos: Google Ads, Meta Ads (Facebook/Instagram), LinkedIn Ads.</p>

            <h3 className="mb-2 mt-4 text-base font-semibold text-neutral-900">2.4. Cookies de terceiros</h3>
            <p>Alguns cookies são definidos por serviços de terceiros que integramos ao site (como ferramentas de análise, mensageria ou mídia paga). Esses fornecedores são responsáveis por seus próprios cookies e seguem suas próprias políticas de privacidade.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">3. Como gerenciar cookies</h2>
            <p className="mb-3">Ao acessar nossas páginas pela primeira vez, exibimos um aviso informando o uso de cookies. Você pode, a qualquer momento:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Configurar o seu navegador para bloquear, apagar ou avisar sobre o envio de cookies. As instruções variam conforme o navegador (Chrome, Safari, Firefox, Edge etc.) e estão disponíveis nas respectivas centrais de ajuda.</li>
              <li>Solicitar a exclusão dos seus dados pessoais coletados via cookies pelo e-mail <a href="mailto:privacidade@mkart.com.br" className="text-neutral-900 underline underline-offset-2">privacidade@mkart.com.br</a>.</li>
            </ul>
            <p className="mt-3">Importante: o bloqueio de cookies essenciais pode afetar o funcionamento de partes do site.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">4. Atualizações desta Política</h2>
            <p>Esta Política de Cookies pode ser atualizada para refletir alterações em ferramentas, serviços e exigências legais. Recomendamos revisitar esta página periodicamente.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">5. Contato</h2>
            <p>Em caso de dúvidas, entre em contato com o nosso encarregado de proteção de dados em <a href="mailto:privacidade@mkart.com.br" className="text-neutral-900 underline underline-offset-2">privacidade@mkart.com.br</a>.</p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
