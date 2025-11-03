import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

const InitializeFornalliAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const createFornalliAdmin = async () => {
    setLoading(true);
    setStatus('idle');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-fornalli-admin');
      
      if (error) throw error;
      
      console.log('Fornalli admin creation response:', data);
      
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        toast.success("Admin Fornalli criado com sucesso!");
      } else {
        setStatus('error');
        setMessage(data.error || 'Erro desconhecido');
        toast.error("Erro ao criar admin Fornalli");
      }
    } catch (error) {
      console.error('Error creating Fornalli admin:', error);
      setStatus('error');
      setMessage(error.message);
      toast.error("Erro ao criar admin Fornalli");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inicializar Admin Fornalli</CardTitle>
          <CardDescription>
            Crie o usuário administrador da Fornalli para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Credenciais padrão:</p>
            <p className="text-sm">Email: admin@fornalli.com.br</p>
            <p className="text-sm">Senha: fornalli@2025</p>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <XCircle className="h-5 w-5" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={createFornalliAdmin} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Admin Fornalli'
              )}
            </Button>

            {status === 'success' && (
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Ir para Login
              </Button>
            )}

            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitializeFornalliAdmin;
