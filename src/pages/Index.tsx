import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuUpload } from "@/components/MenuUpload";
import { MenuGrid } from "@/components/MenuGrid";
import { ProductModal } from "@/components/ProductModal";
import { Cart } from "@/components/Cart";
import { Checkout } from "@/components/Checkout";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/stores/useCartStore";
import pizzaMediaImg from "@/assets/pizza-media.jpg";
import pizzaDoisSaboresImg from "@/assets/pizza-dois-sabores.jpg";
import pizzaBigCocaImg from "@/assets/pizza-big-coca.jpg";
import duasPizzasBordaImg from "@/assets/duas-pizzas-borda.jpg";
import pastelImg from "@/assets/pastel.jpg";

const Index = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    // Sample items based on the uploaded images
    {
      id: "1",
      name: "Pizza Média - 1 Sabor",
      description: "Pizza salgada deliciosa, massa artesanal",
      price: 27.00,
      category: "pizza",
      available: true,
      image: pizzaMediaImg,
      sizes: [
        { size: "Média", price: 27.00 },
        { size: "Grande", price: 40.00 },
      ]
    },
    {
      id: "2", 
      name: "Pizza Média - 2 Sabores",
      description: "Incluindo pizzas doces",
      price: 30.00,
      category: "pizza",
      available: true,
      image: pizzaDoisSaboresImg,
      sizes: [
        { size: "Média", price: 30.00 },
        { size: "Grande", price: 45.00 },
      ]
    },
    {
      id: "3",
      name: "Pizza Big + Coca-Cola",
      description: "Pizza Big deliciosa acompanhada de Coca-Cola gelada",
      price: 57.00,
      category: "combo",
      available: true,
      image: pizzaBigCocaImg,
    },
    {
      id: "4",
      name: "2 Pizzas Grandes + Borda Recheada",
      description: "Terça a Quinta - Duas pizzas grandes (8 fatias cada) com borda de catupiry. Borda doce ou cheddar +R$5,00",
      price: 64.00,
      category: "combo",
      available: true,
      image: duasPizzasBordaImg,
    },
    {
      id: "5",
      name: "Pastel",
      description: "Delicioso pastel crocante",
      price: 10.00,
      category: "entrada",
      available: true,
      image: pastelImg,
    }
  ]);
  
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMenuUploadOpen, setIsMenuUploadOpen] = useState(false);

  const handleMenuExtracted = (extractedItems: MenuItem[]) => {
    setMenuItems(prev => [...prev, ...extractedItems]);
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsProductModalOpen(true);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Hero onUploadMenu={() => setIsMenuUploadOpen(true)} />
        
        <MenuUpload 
          onMenuExtracted={handleMenuExtracted} 
          isOpen={isMenuUploadOpen}
          onClose={() => setIsMenuUploadOpen(false)}
        />
        
        <MenuGrid 
          items={menuItems} 
          onItemClick={handleItemClick}
        />
      </main>

      {/* Modals */}
      <ProductModal
        item={selectedItem}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedItem(null);
        }}
      />

      <Cart onCheckout={handleCheckout} />

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-gradient-red-hero text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            
            {/* Logo and info */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Fornalli Pizzaria</h3>
              <p className="text-white/80">
                A melhor pizza artesanal de Almirante Tamandaré, 
                feita com ingredientes frescos e muito amor.
              </p>
            </div>

            {/* Contact info */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Contato</h4>
              <div className="space-y-2 text-white/80">
                <p>📍 Rua Vereador Wadislau Bugalski, 4813</p>
                <p>Almirante Tamandaré, PR</p>
                <p>📞 (41) 99800-8720</p>
                <p>🕒 Terça a Domingo • 18h às 23h</p>
              </div>
            </div>

            {/* Social and actions */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Siga-nos</h4>
              <div className="flex justify-center md:justify-start gap-4">
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary">
                  📘
                </Button>
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary">
                  📷
                </Button>
              </div>
              <Button 
                variant="secondary" 
                className="w-full md:w-auto"
                asChild
              >
                <a href="https://wa.me/5541998008720" target="_blank" rel="noopener noreferrer">
                  Pedir pelo WhatsApp
                </a>
              </Button>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-white/60">
              © 2024 Fornalli Pizzaria. Feito com ❤️ para você.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
