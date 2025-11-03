import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { ArrowLeft, Plus, Minus, Pizza, Wine, CookingPot } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
}

interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  postal_code: string;
  delivery_fee: string;
  payment_method: string;
  external_code: string;
  order_source: string;
  notes: string;
}

const AdminNewOrder = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    postal_code: '',
    delivery_fee: '0',
    payment_method: 'delivery',
    external_code: '',
    order_source: 'whatsapp',
    notes: ''
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      toast.error("Acesso negado");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading products:', error);
      toast.error('Erro ao carregar produtos');
    } else {
      setProducts(data || []);
    }
  };

  const calculateTotal = () => {
    const subtotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product ? product.price * quantity : 0);
    }, 0);
    const deliveryFee = parseFloat(formData.delivery_fee) || 0;
    return { subtotal, total: subtotal + deliveryFee };
  };

  const addProduct = (productId: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newQuantity = (prev[productId] || 0) - 1;
      if (newQuantity <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'pizza': return <Pizza className="h-5 w-5" />;
      case 'bebida': return <Wine className="h-5 w-5" />;
      case 'pastel':
      case 'porcao': return <CookingPot className="h-5 w-5" />;
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (Object.keys(selectedProducts).length === 0) {
      toast.error("Selecione pelo menos um produto");
      return;
    }

    const { subtotal, total } = calculateTotal();

    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      delivery_address: formData.delivery_address,
      postal_code: formData.postal_code,
      subtotal: subtotal,
      delivery_fee: parseFloat(formData.delivery_fee),
      total: total,
      payment_method: formData.payment_method,
      external_code: formData.external_code || null,
      order_source: formData.order_source,
      notes: buildOrderNotes(),
      status: 'pending'
    });

    if (error) {
      console.error("Error creating order:", error);
      toast.error("Erro ao criar pedido");
    } else {
      toast.success("Pedido criado com sucesso!");
      navigate('/admin/orders');
    }
  };

  const buildOrderNotes = () => {
    const productsList = Object.entries(selectedProducts).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return `${quantity}x ${product?.name} - R$ ${(product ? product.price * quantity : 0).toFixed(2)}`;
    }).join('\n');
    
    return `${productsList}\n\n${formData.notes || ''}`.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Novo Pedido Manual</h1>
            <p className="text-muted-foreground">Cadastre pedidos externos (WhatsApp, iFood, ligação)</p>
          </div>
        </div>

        {/* Seleção de Produtos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const quantity = selectedProducts[product.id] || 0;
                return (
                  <Card 
                    key={product.id} 
                    className={`cursor-pointer transition-all ${quantity > 0 ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getCategoryIcon(product.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          <p className="text-lg font-bold text-primary mt-1">
                            R$ {product.price.toFixed(2)}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeProduct(product.id)}
                          disabled={quantity === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xl font-bold">{quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => addProduct(product.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {Object.keys(selectedProducts).length > 0 && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Resumo do Pedido</h4>
                {Object.entries(selectedProducts).map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId);
                  return product ? (
                    <div key={productId} className="flex justify-between text-sm py-1">
                      <span>{quantity}x {product.name}</span>
                      <span>R$ {(product.price * quantity).toFixed(2)}</span>
                    </div>
                  ) : null;
                })}
                <div className="border-t mt-2 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>R$ {calculateTotal().subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Nome do Cliente *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer_phone">Telefone *</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="delivery_address">Endereço de Entrega *</Label>
                <Input
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="postal_code">CEP</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_fee">Taxa de Entrega</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    step="0.01"
                    value={formData.delivery_fee}
                    onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Total do Pedido</Label>
                  <div className="h-10 flex items-center text-2xl font-bold text-primary">
                    R$ {calculateTotal().total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_method">Forma de Pagamento</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="delivery">Pagamento na Entrega</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="order_source">Origem do Pedido</Label>
                  <Select value={formData.order_source} onValueChange={(value) => setFormData({...formData, order_source: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="ifood">iFood</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="website">Site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="external_code">Código Externo (opcional)</Label>
                <Input
                  id="external_code"
                  value={formData.external_code}
                  onChange={(e) => setFormData({...formData, external_code: e.target.value})}
                  placeholder="Ex: #1234 do iFood"
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Detalhes do pedido..."
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Criar Pedido
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/orders')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminNewOrder;
