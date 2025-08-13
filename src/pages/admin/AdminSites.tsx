import SEOHead from "@/components/seo/SEOHead";
import AdminBacklinksImport from "@/components/admin/AdminBacklinksImport";
import AdminBacklinksManager from "@/components/admin/AdminBacklinksManager";

export default function AdminSites() {
  return (
    <>
      <SEOHead
        title="Admin – Gerenciar Sites | MK Art SEO"
        description="Painel admin para gerenciar sites de backlinks."
        canonicalUrl={`${window.location.origin}/admin/sites`}
        keywords="admin, sites, backlinks"
      />

      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Gerenciar Sites</h2>
        
        <section className="space-y-4">
          <AdminBacklinksImport />
        </section>

        <section className="space-y-4">
          <AdminBacklinksManager />
        </section>
      </div>
    </>
  );
}