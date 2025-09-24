import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
}

interface BeverageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeverageModal = ({ isOpen, onClose }: BeverageModalProps) => {
  const [beverages, setBeverages] = useState<Product[]>([]);
  const [selectedBeverage, setSelectedBeverage] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      fetchBeverages();
    }
  }, [isOpen]);

  const fetchBeverages = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'bebida')
        .eq('available', true)
        .order('name');

      if (data) setBeverages(data);
    } catch (error) {
      toast.error("Erro ao carregar bebidas");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!selectedBeverage) {
      toast.error("Selecione uma bebida");
      return;
    }

    const cartItem = {
      id: `beverage-${Date.now()}`,
      menuItem: {
        id: selectedBeverage.id,
        name: selectedBeverage.name,
        description: selectedBeverage.description,
        price: selectedBeverage.price,
        category: 'bebida' as const,
        available: true,
        image: selectedBeverage.image_url || undefined,
      },
      quantity,
      totalPrice: selectedBeverage.price * quantity,
    };

    addItem(cartItem);
    toast.success("Bebida adicionada ao carrinho!");
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedBeverage(null);
    setQuantity(1);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Carregando bebidas...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Escolha sua Bebida</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lista de Bebidas */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Bebidas Disponíveis</h3>
            <div className="grid grid-cols-1 gap-3">
              {beverages.map((beverage) => (
                <button
                  key={beverage.id}
                  onClick={() => setSelectedBeverage(beverage)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedBeverage?.id === beverage.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">{beverage.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {beverage.description}
                      </div>
                    </div>
                    <div className="text-primary font-bold ml-4">
                      {formatPrice(beverage.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade e Preço */}
          {selectedBeverage && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Quantidade</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-8 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(selectedBeverage.price * quantity)}
                  </div>
                </div>
              </div>

              <Button onClick={handleAddToCart} className="w-full" size="lg">
                Adicionar ao Carrinho
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};