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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
}

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
  description: string | null;
  additional_price: number;
}

interface PizzaSelection {
  productId: string;
  sizeId: string;
  sizeName: string;
  flavorIds: string[];
  flavorNames: string[];
  price: number;
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
  const [pizzaSelections, setPizzaSelections] = useState<PizzaSelection[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pizzaSizes, setPizzaSizes] = useState<PizzaSize[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [pizzaModalOpen, setPizzaModalOpen] = useState(false);
  const [selectedPizzaProduct, setSelectedPizzaProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
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
    loadPizzaSizes();
    loadFlavors();
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

  const loadPizzaSizes = async () => {
    const { data, error } = await supabase
      .from('pizza_sizes')
      .select('*')
      .order('base_price', { ascending: true });

    if (error) {
      console.error('Error loading pizza sizes:', error);
    } else {
      setPizzaSizes(data || []);
    }
  };

  const loadFlavors = async () => {
    const { data, error } = await supabase
      .from('flavors')
      .select('*')
      .eq('available', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading flavors:', error);
    } else {
      setFlavors(data || []);
    }
  };

  const calculateTotal = () => {
    const productsSubtotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product ? product.price * quantity : 0);
    }, 0);
    
    const pizzasSubtotal = pizzaSelections.reduce((sum, pizza) => sum + pizza.price, 0);
    
    const subtotal = productsSubtotal + pizzasSubtotal;
    const deliveryFee = parseFloat(formData.delivery_fee) || 0;
    return { subtotal, total: subtotal + deliveryFee };
  };

  const openPizzaModal = (product: Product) => {
    setSelectedPizzaProduct(product);
    setSelectedSize(null);
    setSelectedFlavors([]);
    setPizzaModalOpen(true);
  };

  const addPizza = () => {
    if (!selectedPizzaProduct || !selectedSize || selectedFlavors.length === 0) {
      toast.error("Selecione tamanho e sabor(es)");
      return;
    }

    const flavorObjects = selectedFlavors.map(id => flavors.find(f => f.id === id)!);
    const additionalPrice = Math.max(...flavorObjects.map(f => f.additional_price));
    const totalPrice = selectedSize.base_price + additionalPrice;

    const newPizza: PizzaSelection = {
      productId: selectedPizzaProduct.id,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      flavorIds: selectedFlavors,
      flavorNames: flavorObjects.map(f => f.name),
      price: totalPrice
    };

    setPizzaSelections(prev => [...prev, newPizza]);
    setPizzaModalOpen(false);
    toast.success("Pizza adicionada!");
  };

  const removePizza = (index: number) => {
    setPizzaSelections(prev => prev.filter((_, i) => i !== index));
  };

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product?.category === 'pizza') {
      openPizzaModal(product);
    } else {
      setSelectedProducts(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1
      }));
    }
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

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'pizza': return 'Pizzas';
      case 'bebida': return 'Bebidas';
      case 'pastel': return 'Pastéis';
      case 'porcao': return 'Porções';
      case 'combo': return 'Combos';
      case 'entrada': return 'Entradas';
      default: return category;
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  const filteredProducts = categoryFilter === 'all' 
    ? products 
    : products.filter(p => p.category === categoryFilter);

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

    if (Object.keys(selectedProducts).length === 0 && pizzaSelections.length === 0) {
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
    });

    const pizzasList = pizzaSelections.map(pizza => 
      `1x Pizza ${pizza.sizeName} - ${pizza.flavorNames.join(' + ')} - R$ ${pizza.price.toFixed(2)}`
    );
    
    const allItems = [...productsList, ...pizzasList].join('\n');
    return `${allItems}\n\n${formData.notes || ''}`.trim();
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
            {/* Barra de Filtros */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                type="button"
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setCategoryFilter('all')}
                className="flex items-center gap-2"
              >
                Todos ({products.length})
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter(category)}
                  className="flex items-center gap-2"
                >
                  {getCategoryIcon(category)}
                  {getCategoryLabel(category)} ({products.filter(p => p.category === category).length})
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
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

            {(Object.keys(selectedProducts).length > 0 || pizzaSelections.length > 0) && (
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
                {pizzaSelections.map((pizza, index) => (
                  <div key={index} className="flex justify-between items-center text-sm py-1">
                    <div className="flex-1">
                      <div>Pizza {pizza.sizeName}</div>
                      <div className="text-xs text-muted-foreground">{pizza.flavorNames.join(' + ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>R$ {pizza.price.toFixed(2)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removePizza(index)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
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

        {/* Modal de Seleção de Pizza */}
        <Dialog open={pizzaModalOpen} onOpenChange={setPizzaModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Personalizar Pizza</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Seleção de Tamanho */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Escolha o Tamanho</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {pizzaSizes.map((size) => (
                    <Card
                      key={size.id}
                      className={`cursor-pointer transition-all ${
                        selectedSize?.id === size.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedSize(size);
                        setSelectedFlavors([]);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="font-semibold">{size.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Até {size.max_flavors} sabor{size.max_flavors > 1 ? 'es' : ''}
                        </div>
                        <div className="text-lg font-bold text-primary mt-2">
                          R$ {size.base_price.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Seleção de Sabores */}
              {selectedSize && (
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Escolha {selectedSize.max_flavors > 1 ? `até ${selectedSize.max_flavors} sabores` : 'o sabor'}
                    {selectedFlavors.length > 0 && ` (${selectedFlavors.length}/${selectedSize.max_flavors})`}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {flavors.map((flavor) => {
                      const isSelected = selectedFlavors.includes(flavor.id);
                      const canSelect = selectedFlavors.length < selectedSize.max_flavors;
                      
                      return (
                        <Card
                          key={flavor.id}
                          className={`cursor-pointer transition-all ${
                            isSelected ? 'ring-2 ring-primary' : ''
                          } ${!canSelect && !isSelected ? 'opacity-50' : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedFlavors(prev => prev.filter(id => id !== flavor.id));
                            } else if (canSelect) {
                              setSelectedFlavors(prev => [...prev, flavor.id]);
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="font-semibold">{flavor.name}</div>
                            {flavor.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {flavor.description}
                              </div>
                            )}
                            {flavor.additional_price > 0 && (
                              <div className="text-sm text-primary mt-2">
                                +R$ {flavor.additional_price.toFixed(2)}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={addPizza}
                  disabled={!selectedSize || selectedFlavors.length === 0}
                  className="flex-1"
                >
                  Adicionar Pizza
                  {selectedSize && selectedFlavors.length > 0 && (
                    <span className="ml-2">
                      - R$ {(selectedSize.base_price + Math.max(...selectedFlavors.map(id => flavors.find(f => f.id === id)?.additional_price || 0))).toFixed(2)}
                    </span>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setPizzaModalOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminNewOrder;
