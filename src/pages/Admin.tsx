import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit, Plus } from "lucide-react";

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
  description: string;
  additional_price: number;
  available: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

const Admin = () => {
  const [sizes, setSizes] = useState<PizzaSize[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [sizeForm, setSizeForm] = useState({
    name: '',
    size_enum: '',
    base_price: '',
    max_flavors: '1'
  });

  const [flavorForm, setFlavorForm] = useState({
    name: '',
    description: '',
    additional_price: '0',
    available: true
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'bebida',
    available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sizesResult, flavorsResult, productsResult] = await Promise.all([
        supabase.from('pizza_sizes').select('*').order('base_price'),
        supabase.from('flavors').select('*').order('name'),
        supabase.from('products').select('*').order('name')
      ]);

      if (sizesResult.data) setSizes(sizesResult.data);
      if (flavorsResult.data) setFlavors(flavorsResult.data);
      if (productsResult.data) setProducts(productsResult.data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSize = async () => {
    if (!sizeForm.name || !sizeForm.size_enum || !sizeForm.base_price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { error } = await supabase.from('pizza_sizes').insert({
        name: sizeForm.name,
        size_enum: sizeForm.size_enum as 'broto' | 'media' | 'big' | 'gigante',
        base_price: parseFloat(sizeForm.base_price),
        max_flavors: parseInt(sizeForm.max_flavors)
      });

      if (error) {
        toast.error("Erro ao adicionar tamanho");
      } else {
        toast.success("Tamanho adicionado com sucesso!");
        setSizeForm({ name: '', size_enum: '', base_price: '', max_flavors: '1' });
        fetchData();
      }
    } catch (error) {
      toast.error("Erro ao adicionar tamanho");
    }
  };

  const handleAddFlavor = async () => {
    if (!flavorForm.name) {
      toast.error("Nome do sabor é obrigatório");
      return;
    }

    try {
      const { error } = await supabase.from('flavors').insert({
        name: flavorForm.name,
        description: flavorForm.description,
        additional_price: parseFloat(flavorForm.additional_price),
        available: flavorForm.available
      });

      if (error) {
        toast.error("Erro ao adicionar sabor");
      } else {
        toast.success("Sabor adicionado com sucesso!");
        setFlavorForm({ name: '', description: '', additional_price: '0', available: true });
        fetchData();
      }
    } catch (error) {
      toast.error("Erro ao adicionar sabor");
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    try {
      const { error } = await supabase.from('products').insert({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category as 'pizza' | 'bebida' | 'combo' | 'entrada',
        available: productForm.available
      });

      if (error) {
        toast.error("Erro ao adicionar produto");
      } else {
        toast.success("Produto adicionado com sucesso!");
        setProductForm({ name: '', description: '', price: '', category: 'bebida', available: true });
        fetchData();
      }
    } catch (error) {
      toast.error("Erro ao adicionar produto");
    }
  };

  const handleDeleteSize = async (id: string) => {
    try {
      const { error } = await supabase.from('pizza_sizes').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao deletar tamanho");
      } else {
        toast.success("Tamanho deletado com sucesso!");
        fetchData();
      }
    } catch (error) {
      toast.error("Erro ao deletar tamanho");
    }
  };

  const handleDeleteFlavor = async (id: string) => {
    try {
      const { error } = await supabase.from('flavors').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao deletar sabor");
      } else {
        toast.success("Sabor deletado com sucesso!");
        fetchData();
      }
    } catch (error) {
      toast.error("Erro ao deletar sabor");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao deletar produto");
      } else {
        toast.success("Produto deletado com sucesso!");
        fetchData();
      }
    } catch (error) {
      toast.error("Erro ao deletar produto");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <div className="text-center py-8">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-primary mb-8">Painel Administrativo</h1>
        
        <Tabs defaultValue="sizes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sizes">Tamanhos</TabsTrigger>
            <TabsTrigger value="flavors">Sabores</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
          </TabsList>

          {/* Tamanhos */}
          <TabsContent value="sizes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Tamanho</CardTitle>
                <CardDescription>Cadastre novos tamanhos de pizza</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="size-name">Nome</Label>
                  <Input
                    id="size-name"
                    value={sizeForm.name}
                    onChange={(e) => setSizeForm({...sizeForm, name: e.target.value})}
                    placeholder="Ex: Média"
                  />
                </div>
                <div>
                  <Label htmlFor="size-enum">Código</Label>
                  <Input
                    id="size-enum"
                    value={sizeForm.size_enum}
                    onChange={(e) => setSizeForm({...sizeForm, size_enum: e.target.value})}
                    placeholder="Ex: media"
                  />
                </div>
                <div>
                  <Label htmlFor="size-price">Preço Base</Label>
                  <Input
                    id="size-price"
                    type="number"
                    step="0.01"
                    value={sizeForm.base_price}
                    onChange={(e) => setSizeForm({...sizeForm, base_price: e.target.value})}
                    placeholder="35.00"
                  />
                </div>
                <div>
                  <Label htmlFor="size-flavors">Max Sabores</Label>
                  <Input
                    id="size-flavors"
                    type="number"
                    value={sizeForm.max_flavors}
                    onChange={(e) => setSizeForm({...sizeForm, max_flavors: e.target.value})}
                  />
                </div>
                <div className="md:col-span-4">
                  <Button onClick={handleAddSize} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Tamanho
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tamanhos Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Preço Base</TableHead>
                      <TableHead>Max Sabores</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizes.map((size) => (
                      <TableRow key={size.id}>
                        <TableCell>{size.name}</TableCell>
                        <TableCell><Badge variant="secondary">{size.size_enum}</Badge></TableCell>
                        <TableCell>{formatPrice(size.base_price)}</TableCell>
                        <TableCell>{size.max_flavors}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSize(size.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sabores */}
          <TabsContent value="flavors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Sabor</CardTitle>
                <CardDescription>Cadastre novos sabores de pizza</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="flavor-name">Nome</Label>
                  <Input
                    id="flavor-name"
                    value={flavorForm.name}
                    onChange={(e) => setFlavorForm({...flavorForm, name: e.target.value})}
                    placeholder="Ex: Margherita"
                  />
                </div>
                <div>
                  <Label htmlFor="flavor-price">Preço Adicional</Label>
                  <Input
                    id="flavor-price"
                    type="number"
                    step="0.01"
                    value={flavorForm.additional_price}
                    onChange={(e) => setFlavorForm({...flavorForm, additional_price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="flavor-description">Descrição</Label>
                  <Textarea
                    id="flavor-description"
                    value={flavorForm.description}
                    onChange={(e) => setFlavorForm({...flavorForm, description: e.target.value})}
                    placeholder="Molho de tomate, mussarela, manjericão..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={flavorForm.available}
                    onCheckedChange={(checked) => setFlavorForm({...flavorForm, available: checked})}
                  />
                  <Label>Disponível</Label>
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleAddFlavor} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Sabor
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sabores Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Preço Adicional</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flavors.map((flavor) => (
                      <TableRow key={flavor.id}>
                        <TableCell>{flavor.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{flavor.description}</TableCell>
                        <TableCell>{formatPrice(flavor.additional_price)}</TableCell>
                        <TableCell>
                          <Badge variant={flavor.available ? "default" : "secondary"}>
                            {flavor.available ? "Disponível" : "Indisponível"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFlavor(flavor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Produtos */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Produto</CardTitle>
                <CardDescription>Cadastre bebidas e outros produtos</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name">Nome</Label>
                  <Input
                    id="product-name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="Ex: Coca-Cola 2L"
                  />
                </div>
                <div>
                  <Label htmlFor="product-price">Preço</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    placeholder="15.00"
                  />
                </div>
                <div>
                  <Label htmlFor="product-category">Categoria</Label>
                  <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bebida">Bebida</SelectItem>
                      <SelectItem value="combo">Combo</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={productForm.available}
                    onCheckedChange={(checked) => setProductForm({...productForm, available: checked})}
                  />
                  <Label>Disponível</Label>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="product-description">Descrição</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Descrição do produto..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleAddProduct} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          <Badge variant={product.available ? "default" : "secondary"}>
                            {product.available ? "Disponível" : "Indisponível"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;