import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";

export default function TermosDeUso() {
  return (
    <>
      <SEOHead
        title="Termos de Uso | MK Art SEO"
        description="Termos e condições de uso dos sites, landing pages, webinars e canais digitais da MK Art."
        canonicalUrl="https://mkart.com.br/termos-de-uso"
      />
      <Header />
      <main className="pt-24 mx-auto max-w-3xl px-4 py-16 text-neutral-800 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-neutral-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">Termos de Uso</h1>
          <p className="mt-3 text-sm text-neutral-500">Última atualização: 29 de abril de 2026</p>
        </header>

        <article className="space-y-8 text-base leading-relaxed">
          <section>
            <p>
              Estes Termos de Uso ("Termos") regulam o acesso e a utilização dos sites, landing pages, materiais, webinars e demais canais digitais mantidos pela <strong>Mk Art Tráfego Orgânico Ltda.</strong> ("Mk Art", "nós"). Ao acessar ou utilizar a Plataforma, você ("Usuário") declara ter lido, compreendido e concorda integralmente com estes Termos. Caso não concorde, você não deve acessar ou utilizar a Plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">1. Identificação</h2>
            <p>
              <strong>Mk Art Tráfego Orgânico Ltda.</strong><br />
              CNPJ: 26.248.684/0001-39<br />
              Endereço: Rua Caminho do Pilar, 401 — Santo André/SP<br />
              Contato: <a href="mailto:contato@mkart.com.br" className="text-neutral-900 underline underline-offset-2">contato@mkart.com.br</a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">2. Sobre os serviços</h2>
            <p>A Mk Art oferece serviços de marketing digital, SEO, GEO, consultoria e implementação de ecossistemas de aquisição para profissionais médicos e clínicas. As informações disponibilizadas na Plataforma têm caráter informativo, comercial e educacional, e não substituem aconselhamento profissional individualizado. A contratação efetiva de qualquer serviço será formalizada por instrumento contratual específico.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">3. Cadastro e veracidade das informações</h2>
            <p>Ao preencher formulários, inscrever-se em webinars ou solicitar contato, o Usuário declara que as informações fornecidas são verdadeiras, completas e atualizadas. O Usuário é o único responsável pelas informações que envia e pelo uso do seu e-mail e telefone para contato.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">4. Conduta do Usuário</h2>
            <p className="mb-3">Ao utilizar a Plataforma, o Usuário compromete-se a não:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Violar qualquer lei, regulamento ou direito de terceiros;</li>
              <li>Praticar engenharia reversa, copiar, distribuir ou modificar conteúdos protegidos sem autorização;</li>
              <li>Utilizar bots, crawlers ou ferramentas automatizadas para extrair informações sem autorização expressa;</li>
              <li>Tentar burlar mecanismos de segurança, autenticação ou controle de acesso;</li>
              <li>Enviar conteúdo ilícito, ofensivo, discriminatório, difamatório ou que viole direitos de terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">5. Propriedade intelectual</h2>
            <p>Todo o conteúdo da Plataforma — textos, imagens, vídeos, marcas, logotipos, layouts, códigos, metodologias, materiais educacionais e demais elementos — é de titularidade exclusiva da Mk Art ou de terceiros que licenciaram seu uso, e está protegido pela legislação brasileira e internacional de propriedade intelectual. É vedada a reprodução, distribuição, modificação ou utilização comercial sem autorização prévia e expressa.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">6. Limitação de responsabilidade</h2>
            <p className="mb-3">A Mk Art empenha-se em manter a Plataforma operacional, segura e atualizada, mas não se responsabiliza por:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Indisponibilidade temporária por motivos de manutenção, falhas técnicas, ataques cibernéticos ou caso fortuito e força maior;</li>
              <li>Resultados financeiros, comerciais ou clínicos eventualmente esperados pelo Usuário a partir do consumo de conteúdo educacional ou comercial; resultados dependem de múltiplos fatores fora do nosso controle;</li>
              <li>Conteúdo de sites de terceiros eventualmente vinculados por hyperlinks na Plataforma;</li>
              <li>Uso indevido das informações pelo Usuário ou por terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">7. Comunicação publicitária e ética médica</h2>
            <p>Os conteúdos comerciais voltados a profissionais médicos observam as diretrizes da Resolução CFM nº 2.336/2023 e demais normas aplicáveis. As estratégias e ferramentas oferecidas pela Mk Art são desenhadas para serem aplicadas em conformidade com a ética médica, sendo de responsabilidade do profissional contratante assegurar a aderência às normas do seu Conselho de Classe.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">8. Privacidade e proteção de dados</h2>
            <p>
              O tratamento de dados pessoais é regido pela nossa{" "}
              <Link to="/politica-de-privacidade" className="text-neutral-900 underline underline-offset-2">Política de Privacidade</Link> e pela{" "}
              <Link to="/politica-de-cookies" className="text-neutral-900 underline underline-offset-2">Política de Cookies</Link>, que integram estes Termos para todos os efeitos legais.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">9. Alterações dos Termos</h2>
            <p>A Mk Art pode atualizar estes Termos a qualquer momento, mediante publicação da versão revisada nesta página. O uso continuado da Plataforma após a publicação implica aceitação das alterações.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">10. Lei aplicável e foro</h2>
            <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Santo André/SP para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">11. Contato</h2>
            <p>Dúvidas sobre estes Termos podem ser enviadas para <a href="mailto:contato@mkart.com.br" className="text-neutral-900 underline underline-offset-2">contato@mkart.com.br</a>.</p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
