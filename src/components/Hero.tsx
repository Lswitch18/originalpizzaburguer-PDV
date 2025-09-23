import { Upload, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroPizzaImg from "@/assets/hero-pizza.png";

interface HeroProps {
  onUploadMenu: () => void;
}

export const Hero = ({ onUploadMenu }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-red-hero wave-divider overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
                <span className="hero-text block text-4xl md:text-5xl mb-4">
                  A melhor pizza de
                </span>
                <span className="hero-text block text-6xl md:text-8xl">
                  Almirante Tamandaré
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Delivery rápido e saboroso direto na sua casa
              </p>
            </div>

            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <Button 
                variant="hero" 
                onClick={onUploadMenu}
                className="w-full sm:w-auto"
              >
                <Upload className="h-5 w-5" />
                Carregar Cardápio
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm"
              >
                <a href="tel:+5541998008720">
                  Ligar: (41) 99800-8720
                </a>
              </Button>
            </div>
          </div>

          {/* Pizza image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-96 h-96 md:w-[500px] md:h-[500px] relative">
                {/* Hero pizza image */}
                <img 
                  src={heroPizzaImg} 
                  alt="Delicious Fornalli Pizza" 
                  className="w-full h-full object-contain drop-shadow-2xl animate-pulse"
                />
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-2xl animate-bounce shadow-glow">
                  🥤
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-lg animate-pulse shadow-glow">
                  🧄
                </div>
                
                <div className="absolute top-1/4 -left-8 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-xl animate-bounce delay-300 shadow-glow">
                  🌶️
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info cards */}
      <div className="absolute bottom-20 left-0 right-0 z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
              <Clock className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold text-lg mb-2">Entrega Rápida</h3>
              <p className="text-white/80">30 a 45 minutos</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold text-lg mb-2">Almirante Tamandaré</h3>
              <p className="text-white/80">Rua Vereador Wadislau Bugalski, 4813</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20">
              <div className="h-8 w-8 mx-auto mb-3 flex items-center justify-center text-secondary text-2xl">
                🔥
              </div>
              <h3 className="font-semibold text-lg mb-2">Forno a Lenha</h3>
              <p className="text-white/80">Sabor tradicional autêntico</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};