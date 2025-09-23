import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MenuItem, useCartStore, CartItem } from "@/stores/useCartStore";
import { toast } from "@/hooks/use-toast";

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal = ({ item, isOpen, onClose }: ProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState("");
  
  const { addItem } = useCartStore();

  if (!item) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getSelectedSizePrice = () => {
    if (!item.sizes || !selectedSize) return item.price;
    const size = item.sizes.find(s => s.size === selectedSize);
    return size ? size.price : item.price;
  };

  const getExtrasPrice = () => {
    if (!item.extras) return 0;
    return item.extras
      .filter(extra => selectedExtras.includes(extra.name))
      .reduce((total, extra) => total + extra.price, 0);
  };

  const getTotalPrice = () => {
    return (getSelectedSizePrice() + getExtrasPrice()) * quantity;
  };

  const handleAddToCart = () => {
    // Validate required selections
    if (item.sizes && item.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Selecione um tamanho",
        description: "Por favor, escolha o tamanho desejado.",
        variant: "destructive",
      });
      return;
    }

    const cartItem: CartItem = {
      id: `${item.id}-${selectedSize}-${selectedExtras.join(',')}-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedSize: selectedSize || undefined,
      selectedExtras: selectedExtras.length > 0 ? selectedExtras : undefined,
      customizations: customizations || undefined,
      totalPrice: getTotalPrice(),
    };

    addItem(cartItem);
    
    toast({
      title: "Adicionado ao carrinho!",
      description: `${quantity}x ${item.name} adicionado com sucesso.`,
    });

    // Reset form
    setSelectedSize("");
    setSelectedExtras([]);
    setQuantity(1);
    setCustomizations("");
    onClose();
  };

  const handleExtraChange = (extraName: string, checked: boolean) => {
    if (checked) {
      setSelectedExtras([...selectedExtras, extraName]);
    } else {
      setSelectedExtras(selectedExtras.filter(name => name !== extraName));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product image */}
          {item.image && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Size selection */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tamanho *</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                {item.sizes.map((size) => (
                  <div key={size.size} className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={size.size} id={size.size} />
                      <Label htmlFor={size.size} className="font-medium">
                        {size.size}
                      </Label>
                    </div>
                    <span className="font-bold text-primary">
                      {formatPrice(size.price)}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Extras */}
          {item.extras && item.extras.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Extras</Label>
              <div className="space-y-2">
                {item.extras.map((extra) => (
                  <div key={extra.name} className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={extra.name}
                        checked={selectedExtras.includes(extra.name)}
                        onCheckedChange={(checked) => handleExtraChange(extra.name, !!checked)}
                      />
                      <Label htmlFor={extra.name} className="font-medium">
                        {extra.name}
                      </Label>
                    </div>
                    <span className="font-bold text-primary">
                      + {formatPrice(extra.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customizations */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Observações</Label>
            <Textarea
              placeholder="Alguma observação especial? (sem cebola, massa fina, etc.)"
              value={customizations}
              onChange={(e) => setCustomizations(e.target.value)}
              rows={3}
            />
          </div>

          {/* Quantity and price */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Quantidade</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="w-8 text-center font-bold">{quantity}</span>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary text-xl">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
            </div>
          </div>

          {/* Add to cart button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleAddToCart}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};