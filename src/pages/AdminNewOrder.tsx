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
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const AdminNewOrder = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAdmin();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    postal_code: '',
    subtotal: '',
    delivery_fee: '0',
    total: '',
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
    // Calculate total when subtotal or delivery_fee changes
    const subtotal = parseFloat(formData.subtotal) || 0;
    const deliveryFee = parseFloat(formData.delivery_fee) || 0;
    const total = subtotal + deliveryFee;
    setFormData(prev => ({ ...prev, total: total.toFixed(2) }));
  }, [formData.subtotal, formData.delivery_fee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address || !formData.subtotal) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      delivery_address: formData.delivery_address,
      postal_code: formData.postal_code,
      subtotal: parseFloat(formData.subtotal),
      delivery_fee: parseFloat(formData.delivery_fee),
      total: parseFloat(formData.total),
      payment_method: formData.payment_method,
      external_code: formData.external_code || null,
      order_source: formData.order_source,
      notes: formData.notes || null,
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

        <Card>
          <CardHeader>
            <CardTitle>Informações do Pedido</CardTitle>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subtotal">Subtotal *</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    value={formData.subtotal}
                    onChange={(e) => setFormData({...formData, subtotal: e.target.value})}
                    required
                  />
                </div>

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
                  <Label htmlFor="total">Total</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={formData.total}
                    disabled
                  />
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
