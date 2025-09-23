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
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nosso <span className="gradient-text">Cardápio</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pizzas artesanais feitas com os melhores ingredientes e muito amor
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="group hover:shadow-primary transition-all duration-300 hover:scale-105 bg-gradient-card border-0"
            >
              <CardHeader className="p-4">
                {item.image && (
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(item.price)}
                    </span>
                    {item.sizes && item.sizes.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        A partir de
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {!item.available && (
                      <Badge variant="destructive" className="text-xs">
                        Indisponível
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      30-45min
                    </Badge>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  onClick={() => onItemClick(item)}
                  disabled={!item.available}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {item.available ? "Adicionar" : "Indisponível"}
                </Button>
              </CardFooter>
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