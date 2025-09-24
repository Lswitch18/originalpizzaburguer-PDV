import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PizzaSize {
  id: string;
  name: string;
  size_enum: string;
  base_price: number;
  max_flavors: number;
}

interface Flavor {
  id: string;
  name: string;
  description: string;
  additional_price: number;
  available: boolean;
}

interface PizzaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PizzaBuilder = ({ isOpen, onClose }: PizzaBuilderProps) => {
  const [sizes, setSizes] = useState<PizzaSize[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<Flavor[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sizesResult, flavorsResult] = await Promise.all([
        supabase.from('pizza_sizes').select('*').order('base_price'),
        supabase.from('flavors').select('*').eq('available', true).order('name')
      ]);

      if (sizesResult.data) setSizes(sizesResult.data);
      if (flavorsResult.data) setFlavors(flavorsResult.data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
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

  const handleFlavorToggle = (flavor: Flavor) => {
    if (!selectedSize) return;

    const isSelected = selectedFlavors.find(f => f.id === flavor.id);
    
    if (isSelected) {
      setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavor.id));
    } else {
      if (selectedFlavors.length < selectedSize.max_flavors) {
        setSelectedFlavors([...selectedFlavors, flavor]);
      } else {
        toast.error(`Máximo ${selectedSize.max_flavors} sabores para este tamanho`);
      }
    }
  };

  const calculatePrice = () => {
    if (!selectedSize) return 0;
    
    const basePrice = selectedSize.base_price;
    const flavorsPrice = selectedFlavors.reduce((acc, flavor) => acc + flavor.additional_price, 0);
    
    return (basePrice + flavorsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (!selectedSize || selectedFlavors.length === 0) {
      toast.error("Selecione um tamanho e pelo menos um sabor");
      return;
    }

    const cartItem = {
      id: `pizza-${Date.now()}`,
      menuItem: {
        id: `pizza-${selectedSize.id}`,
        name: `Pizza ${selectedSize.name}`,
        description: `Sabores: ${selectedFlavors.map(f => f.name).join(', ')}`,
        price: selectedSize.base_price,
        category: 'pizza' as const,
        available: true,
      },
      quantity,
      selectedSize: selectedSize.name,
      selectedExtras: selectedFlavors.map(f => f.name),
      totalPrice: calculatePrice(),
    };

    addItem(cartItem);
    toast.success("Pizza adicionada ao carrinho!");
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedSize(null);
    setSelectedFlavors([]);
    setQuantity(1);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Carregando...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Monte sua Pizza</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tamanhos */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Escolha o Tamanho</h3>
            <div className="grid grid-cols-2 gap-3">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => {
                    setSelectedSize(size);
                    setSelectedFlavors([]);
                  }}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedSize?.id === size.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">{size.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Até {size.max_flavors} sabores
                  </div>
                  <div className="text-primary font-bold">
                    {formatPrice(size.base_price)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sabores */}
          {selectedSize && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Escolha os Sabores ({selectedFlavors.length}/{selectedSize.max_flavors})
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {flavors.map((flavor) => {
                  const isSelected = selectedFlavors.find(f => f.id === flavor.id);
                  return (
                    <button
                      key={flavor.id}
                      onClick={() => handleFlavorToggle(flavor)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{flavor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {flavor.description}
                          </div>
                        </div>
                        {flavor.additional_price > 0 && (
                          <Badge variant="secondary">
                            +{formatPrice(flavor.additional_price)}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantidade e Preço */}
          {selectedSize && selectedFlavors.length > 0 && (
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
                    {formatPrice(calculatePrice())}
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