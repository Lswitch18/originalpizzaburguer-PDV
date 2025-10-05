import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/stores/useCartStore";
import { Trash2, ArrowLeft, ShoppingCart } from "lucide-react";
import { Header } from "@/components/Header";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, clearCart, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o cardápio
          </Button>
          
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
              <p className="text-muted-foreground mb-6">
                Adicione itens ao carrinho para continuar
              </p>
              <Button onClick={() => navigate('/')}>
                Ver Cardápio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuar comprando
          </Button>
          <Button
            variant="destructive"
            onClick={clearCart}
          >
            Limpar carrinho
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold mb-6">Carrinho de Compras</h1>
            
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.menuItem.name}</h3>
                      
                      {item.selectedSize && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Tamanho: {item.selectedSize}
                        </p>
                      )}
                      
                      {item.selectedExtras && item.selectedExtras.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Extras: {item.selectedExtras.join(', ')}
                        </p>
                      )}
                      
                      {item.customizations && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Obs: {item.customizations}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-4">
                        <p className="text-xl font-bold text-primary">
                          {formatPrice(item.totalPrice)}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxa de Entrega</span>
                  <span>A calcular</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/#checkout')}
                >
                  Finalizar Pedido
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
