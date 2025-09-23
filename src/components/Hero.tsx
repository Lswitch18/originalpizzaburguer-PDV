import { Upload, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HeroProps {
  onUploadMenu: () => void;
}

export const Hero = ({ onUploadMenu }: HeroProps) => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8">
          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="gradient-text">Pizza Artesanal</span>
              <br />
              <span className="text-foreground">com Sabor de</span>
              <br />
              <span className="text-primary">Tradição!</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Delivery rápido em Almirante Tamandaré. Faça seu pedido e receba em casa com todo o carinho da família Fornalli.
            </p>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
              className="w-full sm:w-auto"
            >
              <a href="tel:+5541998008720">
                Ligar Agora: (41) 99800-8720
              </a>
            </Button>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-gradient-card border-0 shadow-card-custom">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Entrega Rápida</h3>
                <p className="text-muted-foreground">De 30 a 45 minutos</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card-custom">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Almirante Tamandaré</h3>
                <p className="text-muted-foreground">Rua Vereador Wadislau Bugalski, 4813</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card-custom">
              <CardContent className="p-6 text-center">
                <div className="h-8 w-8 text-primary mx-auto mb-3 flex items-center justify-center">
                  🍕
                </div>
                <h3 className="font-semibold text-lg mb-2">Massa Artesanal</h3>
                <p className="text-muted-foreground">Feita diariamente com carinho</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};