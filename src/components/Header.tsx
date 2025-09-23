import { ShoppingCart, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/useCartStore";
import fornalliLogo from "@/assets/fornalli-logo.jpg";

export const Header = () => {
  const { toggleCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5541998008720?text=Ol%C3%A1%21%20Gostaria%20de%20fazer%20um%20pedido%20na%20Fornalli%20Pizzaria', '_blank');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={fornalliLogo} 
              alt="Fornalli Pizzaria Logo" 
              className="h-14 w-14 rounded-full object-cover shadow-card-custom"
            />
            <div>
              <h1 className="text-2xl font-bold text-primary">Fornalli Pizzaria</h1>
              <p className="text-sm text-muted-foreground">Almirante Tamandaré</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-primary transition-smooth font-medium">Home</a>
            <a href="#sobre" className="text-foreground hover:text-primary transition-smooth font-medium">Sobre Nós</a>
            <a href="#cardapio" className="text-foreground hover:text-primary transition-smooth font-medium">Cardápio</a>
            <a href="#contato" className="text-foreground hover:text-primary transition-smooth font-medium">Contato</a>
          </nav>

          {/* Contact & Cart */}
          <div className="flex items-center space-x-3">
            {/* WhatsApp Button */}
            <Button
              variant="whatsapp"
              size="sm"
              onClick={handleWhatsAppClick}
              className="hidden sm:flex"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>

            {/* Mobile WhatsApp */}
            <Button
              variant="whatsapp"
              size="icon"
              onClick={handleWhatsAppClick}
              className="sm:hidden"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            {/* Phone */}
            <Button variant="ghost" size="icon" asChild>
              <a href="tel:+5541998008720">
                <Phone className="h-4 w-4" />
              </a>
            </Button>

            {/* Cart */}
            <div className="relative">
              <Button variant="cart" size="icon" onClick={toggleCart}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};