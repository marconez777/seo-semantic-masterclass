import { FAB } from "@/components/ui/fab"
import { MessageCircle } from "lucide-react"

export function WhatsAppFAB() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os serviços de SEO e backlinks.")
    const whatsappUrl = `https://wa.me/5511999999999?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <FAB 
      onClick={handleWhatsAppClick}
      className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      aria-label="Falar no WhatsApp"
    >
      <div className="flex flex-col items-center gap-1">
        <MessageCircle className="w-5 h-5" />
        <div className="text-xs leading-tight">
          <div className="font-medium">FALE AGORA</div>
          <div className="font-bold">WhatsApp</div>
        </div>
      </div>
    </FAB>
  )
}