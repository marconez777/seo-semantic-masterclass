
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import StructuredData from './StructuredData';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  faqs: FAQItem[];
  className?: string;
}

const FAQSection = ({ title, faqs, className }: FAQSectionProps) => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className={cn("space-y-6", className)} itemScope itemType="https://schema.org/FAQPage">
      <StructuredData type="faq" data={{ questions: faqs }} />
      
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-border rounded-lg overflow-hidden"
            itemScope 
            itemProp="mainEntity" 
            itemType="https://schema.org/Question"
          >
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
              onClick={() => toggleItem(index)}
              aria-expanded={openItems.includes(index)}
            >
              <h3 className="font-semibold text-lg" itemProp="name">
                {faq.question}
              </h3>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  openItems.includes(index) && "rotate-180"
                )}
              />
            </button>
            
            <div 
              className={cn(
                "px-6 overflow-hidden transition-all duration-200",
                openItems.includes(index) ? "pb-4 max-h-96" : "max-h-0"
              )}
              itemScope 
              itemProp="acceptedAnswer" 
              itemType="https://schema.org/Answer"
            >
              <div className="prose prose-sm max-w-none" itemProp="text">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
