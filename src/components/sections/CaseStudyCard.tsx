import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface CaseStudyCardProps {
  title: string;
  clientName: string;
  description: string;
  videoId: string;
  keywords: string[];
  backlinks: number;
  monthlyTraffic: string;
  reverse?: boolean;
}

const CaseStudyCard = ({ 
  title, 
  clientName, 
  description, 
  videoId, 
  keywords, 
  backlinks, 
  monthlyTraffic,
  reverse = false 
}: CaseStudyCardProps) => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className={`grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
          <div className={reverse ? 'lg:col-start-2' : ''}>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              {title.split(clientName)[0]}
              <span className="text-primary">{clientName}</span>
              {title.split(clientName)[1]}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              {description}
            </p>
            
            <div className="space-y-3 mb-8">
              {keywords.map((keyword, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">{keyword}</span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  {backlinks}
                </div>
                <div className="text-muted-foreground">Backlinks</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  {monthlyTraffic}
                </div>
                <div className="text-muted-foreground">Tráfego Mensal</div>
              </div>
            </div>
            
            <a href="#hero-form">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                RECEBER AUDITORIA GRÁTIS
              </Button>
            </a>
          </div>
          
          <div className={reverse ? 'lg:col-start-1' : ''}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Case Study Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyCard;