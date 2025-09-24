import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Cart } from "@/components/Cart";
import { Checkout } from "@/components/Checkout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Hero />
      </main>

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
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary"
                  onClick={() => navigate('/admin')}
                >
                  🛠️ Admin
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
