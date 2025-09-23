import { useState, useRef } from "react";
import { Upload, Camera, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';

interface MenuUploadProps {
  onMenuExtracted: (extractedData: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MenuUpload = ({ onMenuExtracted, isOpen, onClose }: MenuUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Process with Tesseract.js
      const result = await Tesseract.recognize(file, 'por', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      setExtractedText(result.data.text);
      
      // Simple parsing logic for menu items
      const menuItems = parseMenuText(result.data.text);
      
      onMenuExtracted(menuItems);
      
      toast({
        title: "Sucesso!",
        description: `Cardápio extraído com sucesso! ${menuItems.length} itens encontrados.`,
      });

      onClose();
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Erro na extração",
        description: "Não foi possível extrair o texto da imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const parseMenuText = (text: string) => {
    const items = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    // Simple regex patterns for common menu formats
    const pricePattern = /R\$?\s*(\d+[,\.]\d{2})/g;
    const itemPattern = /^([A-ZÁÇÃOÊ\s]+)/;

    let currentItem = null;
    
    for (const line of lines) {
      const priceMatch = line.match(pricePattern);
      const itemMatch = line.match(itemPattern);
      
      if (itemMatch && itemMatch[1].length > 3) {
        // This looks like a menu item name
        currentItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: itemMatch[1].trim(),
          description: '',
          price: 0,
          category: 'pizza' as const,
          available: true,
        };
      }
      
      if (priceMatch && currentItem) {
        // Extract the first price found
        const price = parseFloat(priceMatch[0].replace(/R\$?\s*/, '').replace(',', '.'));
        currentItem.price = price;
        items.push(currentItem);
        currentItem = null;
      }
    }

    return items;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Carregar Cardápio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!isProcessing ? (
            <Card className="border-dashed border-2 border-muted-foreground/50 hover:border-primary transition-smooth">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold mb-2">Envie uma foto do cardápio</h3>
                    <p className="text-sm text-muted-foreground">
                      Tire uma foto clara do cardápio e nossa tecnologia irá extrair automaticamente os itens e preços.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagem
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processando Cardápio...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Extraindo texto da imagem... {progress}%
                </p>
              </CardContent>
            </Card>
          )}

          {extractedText && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Texto Extraído
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-32 overflow-y-auto bg-muted p-3 rounded text-sm">
                  {extractedText}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};