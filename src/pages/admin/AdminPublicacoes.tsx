import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

export default function AdminPublicacoes() {
  return (
    <div className="space-y-6">
      <SEOHead title="Publicações - Admin" description="Painel administrativo" noindex={true} />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Publicações</h1>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema Descontinuado:</strong> O sistema de publicações foi desabilitado como parte da migração 
          para o novo modelo de negócio focado em contato direto. Todas as funcionalidades relacionadas ao 
          processamento automático de pedidos e publicações foram removidas por questões de segurança e simplicidade.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidade Não Disponível</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            O sistema de gerenciamento de publicações fazia parte do checkout automatizado que foi 
            completamente quarentenado. No novo modelo:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Todas as vendas são processadas manualmente via contato direto</li>
            <li>Não há mais sistema automático de pedidos</li>
            <li>Publicações são gerenciadas externamente</li>
            <li>O blog continua disponível no painel de Blog</li>
          </ul>

          <div className="mt-6">
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar ao Painel Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}