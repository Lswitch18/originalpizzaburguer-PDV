import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/stores/useCartStore";

interface MenuGridProps {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export const MenuGrid = ({ items, onItemClick }: MenuGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "Todos", icon: "🍽️" },
    { id: "pizza", name: "Pizzas", icon: "🍕" },
    { id: "bebida", name: "Bebidas", icon: "🥤" },
    { id: "combo", name: "Combos", icon: "📦" },
    { id: "entrada", name: "Entradas", icon: "🥖" },
  ];

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-6xl">🍕</div>
            <h2 className="text-2xl font-bold">Cardápio em Breve</h2>
            <p className="text-muted-foreground">
              Faça upload de uma imagem do cardápio para começar a fazer seus pedidos!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white" id="cardapio">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Nosso <span className="text-primary italic">Cardápio</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pizzas artesanais feitas com os melhores ingredientes e muito amor
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2 px-6 py-3 text-lg"
              size="lg"
            >
              <span>{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="group hover:shadow-red transition-all duration-300 hover:scale-105 bg-white border-0 shadow-card-custom overflow-hidden"
            >
              <div className="relative">
                {item.image && (
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Indisponível
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-xl leading-tight text-foreground mb-2">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                      {item.sizes && item.sizes.length > 1 && (
                        <p className="text-xs text-muted-foreground">
                          A partir de
                        </p>
                      )}
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      30-45min
                    </Badge>
                  </div>

                  <Button 
                    className="w-full py-3" 
                    onClick={() => onItemClick(item)}
                    disabled={!item.available}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {item.available ? "Adicionar" : "Indisponível"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum item encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};