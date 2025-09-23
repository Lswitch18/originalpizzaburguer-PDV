import { Minus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/useCartStore";

interface CartProps {
  onCheckout: () => void;
}

export const Cart = ({ onCheckout }: CartProps) => {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    updateQuantity, 
    removeItem, 
    getTotalPrice,
    getTotalItems 
  } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Seu Pedido
            <Badge variant="secondary">{totalItems} itens</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🛒</div>
                <h3 className="text-lg font-semibold">Carrinho vazio</h3>
                <p className="text-muted-foreground">
                  Adicione alguns itens deliciosos do nosso cardápio!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {items.map((item) => (
                  <Card key={item.id} className="shadow-card-custom">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.menuItem.name}</h4>
                          {item.selectedSize && (
                            <p className="text-xs text-muted-foreground">
                              Tamanho: {item.selectedSize}
                            </p>
                          )}
                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Extras: {item.selectedExtras.join(', ')}
                            </p>
                          )}
                          {item.customizations && (
                            <p className="text-xs text-muted-foreground">
                              Obs: {item.customizations}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cart footer */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      toggleCart();
                      onCheckout();
                    }}
                  >
                    Finalizar Pedido
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={toggleCart}
                  >
                    Continuar Comprando
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};