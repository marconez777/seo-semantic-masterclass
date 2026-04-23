export const WebinarFooter = () => (
  <footer className="bg-webinar-navy border-t border-webinar-inverse text-webinar-muted-inverse">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 text-[20px] space-y-2 text-center sm:text-left">
      <p className="text-webinar-ink-inverse font-medium">MK / Marco Guimarães</p>
      <p>Este conteúdo respeita a Resolução CFM 2.336/2023 e a LGPD. Não substitui orientação clínica.</p>
      <p>© {new Date().getFullYear()} — Todos os direitos reservados.</p>
    </div>
  </footer>
);
