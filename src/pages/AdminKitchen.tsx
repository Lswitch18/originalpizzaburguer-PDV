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
    if (isAdmin) {
      fetchOrders();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('kitchen-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed', 'preparing'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus as any })
      .eq('id', orderId);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado!");
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

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.customer_name}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getTimeSince(order.created_at)}
          </Badge>
        </div>
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

        <div className="flex flex-col gap-2 pt-2">
          {order.status === 'pending' && (
            <Button 
              size="sm" 
              onClick={() => updateStatus(order.id, 'confirmed')}
              className="w-full"
            >
              Confirmar
            </Button>
          )}
          {order.status === 'confirmed' && (
            <Button 
              size="sm" 
              onClick={() => updateStatus(order.id, 'preparing')}
              className="w-full"
            >
              Iniciar Preparo
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button 
              size="sm" 
              onClick={() => updateStatus(order.id, 'delivering')}
              className="w-full"
            >
              Pronto para Entrega
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
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
            <h1 className="text-4xl font-bold">Monitor de Cozinha</h1>
            <p className="text-muted-foreground">Acompanhamento em tempo real</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Pendente</h2>
              <Badge>{pendingOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum pedido pendente
                  </CardContent>
                </Card>
              ) : (
                pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

          {/* Confirmed */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Confirmado</h2>
              <Badge>{confirmedOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {confirmedOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum pedido confirmado
                  </CardContent>
                </Card>
              ) : (
                confirmedOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>

          {/* Preparing */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Em Preparo</h2>
              <Badge>{preparingOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {preparingOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum pedido em preparo
                  </CardContent>
                </Card>
              ) : (
                preparingOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKitchen;
