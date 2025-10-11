import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const InitializeAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const createRootAdmin = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('create-root-admin');

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        toast.success('Usuário root criado com sucesso!');
        
        if (data.credentials) {
          toast.info('Email: admin@root.com | Senha: admin', {
            duration: 10000
          });
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Error creating root admin:', error);
      setStatus('error');
      setMessage(error.message || 'Erro ao criar usuário root');
      toast.error('Erro ao criar usuário root');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inicializar Sistema Admin</CardTitle>
          <CardDescription>
            Crie o usuário administrador root do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Este processo irá criar ou verificar o usuário administrador root:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Email: <strong className="text-foreground">admin@root.com</strong></li>
              <li>Senha: <strong className="text-foreground">admin</strong></li>
              <li>Role: <strong className="text-foreground">admin</strong></li>
            </ul>
          </div>

          {status === 'success' && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {message}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  {message}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={createRootAdmin}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Criando...' : 'Criar/Verificar Root Admin'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Voltar
            </Button>
          </div>

          {status === 'success' && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Ir para Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InitializeAdmin;
