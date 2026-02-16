import SEOHead from "@/components/seo/SEOHead";
import AdminBacklinksImport from "@/components/admin/AdminBacklinksImport";
import AdminBacklinksManager from "@/components/admin/AdminBacklinksManager";
import AdminCategorizer from "@/components/admin/AdminCategorizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSites() {
  return (
    <>
      <SEOHead
        title="Admin – Gerenciar Sites | MK Art SEO"
        description="Painel admin para gerenciar sites de backlinks."
        canonicalUrl="https://mkart.com.br/admin/sites"
        keywords="admin, sites, backlinks"
        noindex={true}
      />

      <div className="space-y-6">
        <Tabs defaultValue="sites">
          <TabsList>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="importar">Importar</TabsTrigger>
            <TabsTrigger value="categorizar">Categorizar</TabsTrigger>
          </TabsList>

          <TabsContent value="sites">
            <AdminBacklinksManager />
          </TabsContent>

          <TabsContent value="importar">
            <AdminBacklinksImport />
          </TabsContent>

          <TabsContent value="categorizar">
            <AdminCategorizer />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
