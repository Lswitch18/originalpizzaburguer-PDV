import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { ArrowLeft, Clock } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  delivery_address: string;
}

const AdminKitchen = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      toast.error("Acesso negado");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    fetchOrders();
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `status=in.(pending,accepted,preparing,out_for_delivery)`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'accepted', 'preparing', 'out_for_delivery'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } else {
      setOrders(data || []);
    }
  };

  const updateStatus = async (orderId: string, newStatus: 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Status atualizado com sucesso!');
      fetchOrders();
    }
  };

  const getTimeSince = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min`;
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return `${diffHours}h ${remainingMins}min`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const getStatusButtons = () => {
      switch (order.status) {
        case 'pending':
          return (
            <Button 
              onClick={() => updateStatus(order.id, 'accepted')}
              className="w-full"
            >
              Aceitar Pedido
            </Button>
          );
        case 'accepted':
          return (
            <Button 
              onClick={() => updateStatus(order.id, 'preparing')}
              className="w-full"
            >
              Iniciar Preparo
            </Button>
          );
        case 'preparing':
          return (
            <Button 
              onClick={() => updateStatus(order.id, 'out_for_delivery')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Saiu para Entrega
            </Button>
          );
        case 'out_for_delivery':
          return (
            <Button 
              onClick={() => updateStatus(order.id, 'delivered')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Marcar como Entregue
            </Button>
          );
        default:
          return null;
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{order.customer_name}</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTimeSince(order.created_at)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Endereço</p>
            <p className="text-sm font-medium">{order.delivery_address}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-primary">{formatPrice(order.total)}</p>
          </div>

          {getStatusButtons()}
        </CardContent>
      </Card>
    );
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

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'accepted');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Monitor de Cozinha - PDV</h1>
            <p className="text-muted-foreground">Acompanhamento em tempo real dos pedidos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Pedidos Pendentes */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="text-lg">
                {pendingOrders.length}
              </Badge>
              Pendentes
            </h2>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Pedidos Aceitos */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Badge variant="default" className="text-lg">
                {confirmedOrders.length}
              </Badge>
              Aceitos
            </h2>
            <div className="space-y-4">
              {confirmedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Pedidos em Preparo */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Badge variant="default" className="text-lg bg-orange-600">
                {preparingOrders.length}
              </Badge>
              Em Preparo
            </h2>
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Pedidos Saíram para Entrega */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Badge variant="default" className="text-lg bg-green-600">
                {orders.filter(o => o.status === 'out_for_delivery').length}
              </Badge>
              Saiu para Entrega
            </h2>
            <div className="space-y-4">
              {orders.filter(o => o.status === 'out_for_delivery').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKitchen;
