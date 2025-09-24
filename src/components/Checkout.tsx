import { useState, useEffect } from "react";
import { QrCode, Copy, CreditCard, Banknote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "@/hooks/use-toast";
import QRCode from 'qrcode';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Checkout = ({ isOpen, onClose }: CheckoutProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'delivery'>('pix');
  const [deliveryPayment, setDeliveryPayment] = useState<'dinheiro' | 'cartao'>('dinheiro');
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: 'Rua Vereador Wadislau Bugalski, 4813, Almirante Tamandaré, PR',
    complement: '',
    observations: ''
  });
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);

  const { items, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Generate PIX code when payment method changes to PIX
  useEffect(() => {
    if (paymentMethod === 'pix' && totalPrice > 0) {
      generatePixCode();
    }
  }, [paymentMethod, totalPrice]);

  const generatePixCode = async () => {
    setIsGeneratingPix(true);
    
    try {
      // Create PIX payload (simplified version)
      const pixKey = "(41) 99800-8720"; // PIX key from the business
      const amount = totalPrice.toFixed(2);
      const description = `Fornalli Pizzaria - Pedido`;
      
      // Simplified PIX code generation (in production, use proper BR Code library)
      const pixPayload = `PIX|${pixKey}|${amount}|${description}`;
      setPixCode(pixPayload);
      
      // Generate QR Code
      const qrUrl = await QRCode.toDataURL(pixPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#8B1538', // Primary color
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating PIX code:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: "Não foi possível gerar o código PIX. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast({
      title: "Código copiado!",
      description: "Código PIX copiado para a área de transferência.",
    });
  };

  const handleSubmitOrder = () => {
    // Validate required fields
    if (!customerData.name || !customerData.phone) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    // Create order object
    const order = {
      id: Date.now().toString(),
      items,
      customerData,
      paymentMethod,
      deliveryPayment: paymentMethod === 'delivery' ? deliveryPayment : undefined,
      totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save order (in a real app, this would be sent to a backend)
    const orders = JSON.parse(localStorage.getItem('fornalli-orders') || '[]');
    orders.push(order);
    localStorage.setItem('fornalli-orders', JSON.stringify(orders));

    // Send WhatsApp message
    const message = createWhatsAppMessage(order);
    const whatsappUrl = `https://wa.me/5541998008720?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Clear cart and close
    clearCart();
    toast({
      title: "Pedido enviado!",
      description: "Seu pedido foi enviado via WhatsApp. Aguarde nossa confirmação.",
    });
    onClose();
  };

  const createWhatsAppMessage = (order: any) => {
    let message = `🍕 *NOVO PEDIDO - FORNALLI PIZZARIA*\n\n`;
    message += `*Cliente:* ${order.customerData.name}\n`;
    message += `*Telefone:* ${order.customerData.phone}\n`;
    message += `*Endereço:* ${order.customerData.address}\n`;
    if (order.customerData.complement) {
      message += `*Complemento:* ${order.customerData.complement}\n`;
    }
    message += `\n*ITENS DO PEDIDO:*\n`;
    
    order.items.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.quantity}x ${item.menuItem.name}`;
      if (item.selectedSize) message += ` (${item.selectedSize})`;
      if (item.selectedExtras && item.selectedExtras.length > 0) {
        message += ` + ${item.selectedExtras.join(', ')}`;
      }
      message += ` - ${formatPrice(item.totalPrice)}\n`;
      if (item.customizations) {
        message += `   Obs: ${item.customizations}\n`;
      }
    });

    message += `\n*PAGAMENTO:* `;
    if (order.paymentMethod === 'pix') {
      message += `PIX\n`;
    } else {
      message += `Na entrega (${order.deliveryPayment === 'dinheiro' ? 'Dinheiro' : 'Cartão'})\n`;
    }

    message += `\n*TOTAL: ${formatPrice(order.totalPrice)}*\n`;
    
    if (order.customerData.observations) {
      message += `\n*Observações:* ${order.customerData.observations}\n`;
    }

    message += `\n_Pedido realizado em ${new Date().toLocaleString('pt-BR')}_`;

    return message;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados para Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    placeholder="(41) 99999-9999"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={customerData.complement}
                  onChange={(e) => setCustomerData({...customerData, complement: e.target.value})}
                  placeholder="Apartamento, casa, ponto de referência..."
                />
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={customerData.observations}
                  onChange={(e) => setCustomerData({...customerData, observations: e.target.value})}
                  placeholder="Alguma observação especial para o pedido?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={(value: 'pix' | 'delivery') => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex items-center gap-2 font-medium">
                    <QrCode className="h-4 w-4" />
                    PIX (Pagamento Antecipado)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2 font-medium">
                    <CreditCard className="h-4 w-4" />
                    Pagamento na Entrega
                  </Label>
                </div>
              </RadioGroup>

              {/* PIX Payment */}
              {paymentMethod === 'pix' && (
                <Card className="mt-4 bg-muted/50">
                  <CardContent className="p-4">
                    {isGeneratingPix ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p>Gerando código PIX...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-semibold mb-2">Pague com PIX</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Escaneie o QR Code ou copie o código abaixo
                          </p>
                        </div>

                        {qrCodeUrl && (
                          <div className="flex justify-center">
                            <img src={qrCodeUrl} alt="QR Code PIX" className="rounded-lg border" />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Código PIX Copia e Cola:</Label>
                          <div className="flex gap-2">
                            <Input
                              value={pixCode}
                              readOnly
                              className="flex-1 text-xs"
                            />
                            <Button size="icon" onClick={copyPixCode}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                          Após o pagamento, envie o comprovante via WhatsApp
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Delivery Payment */}
              {paymentMethod === 'delivery' && (
                <Card className="mt-4 bg-muted/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Como você irá pagar na entrega?</Label>
                      <RadioGroup value={deliveryPayment} onValueChange={(value: 'dinheiro' | 'cartao') => setDeliveryPayment(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dinheiro" id="dinheiro" />
                          <Label htmlFor="dinheiro" className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Dinheiro
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cartao" id="cartao" />
                          <Label htmlFor="cartao" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Cartão (Débito/Crédito)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Order summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menuItem.name}
                      {item.selectedSize && ` (${item.selectedSize})`}
                    </span>
                    <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSubmitOrder}
          >
            Enviar Pedido via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};