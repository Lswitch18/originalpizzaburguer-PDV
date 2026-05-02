# 🍕 Original Pizzabu

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/last-commit/Lswitch18/originalpizzaburguer-PDV/main?style=for-the-badge" alt="Last Commit">
</p>

---

## 🍕 Original Pizzaburguer PDV

**Sistema de Point of Sale (PDV) para Pizzaria Original Pizzaburguer**

Este projeto foi desenvolvido para gerenciar pedidos, entregas e operações da pizzaria **Original Pizzaburguer**, acessível em: **https://originalpizzaburguer.com.br**

---

## 🏢 Sobre o Projeto

Este sistema de PDV (Point of Sale) foi criado especificamente para atender às necessidades da **Original Pizzaburguer**, uma pizzaria que atua com delivery e retirada no local.

### Funcionalidades Principais

#### 卡萨 系统a de Pedidos
- **Cardápio Digital**: Catálogo completo de pizzas, bebidas e acompanhamentos
- **Personalização**: Tamanhos (P, M, G), bordas rechadas, ingredientes adicionais
- **Carrinho de Compras**: Gestão de itens comQuantity eobservação
- **Status em Tempo Real**: Acompanhe o status do pedido (recebido, em preparação, saindo, entregue)

#### 管理后台 (Admin)
- **Dashboard**: Visão geral de vendas e pedidos
- **Gestão de Produtos**: Cadastro e edição do cardápio
- **Relatórios**: Vendas por periodo, produtos mais vendidos
- **Controle de Estoque**: Gerenciamento de ingredientes

#### 客户客户端
- **快速点餐**: Interface rápida para novos pedidos
- **Histórico**: Visualização de pedidos anteriores
- **Acompanhamento**: Status em tempo real do pedido
- **Saved Addresses**: Endereços salvos para delivery

---

## 技术 Stack

| Tecnologia | Descrição |
|------------|------------|
| React 18 | Interface de usuário |
| TypeScript | Tipagem estática |
| Vite | Build tool Ultra-rápido |
| TailwindCSS | Estilização utility-first |
| shadcn/ui | Componentes UI modernos |
| Supabase | Backend as a Service (BaaS) |
| Zustand | Gerenciamento de estado |
| React Hook Form | Gerenciamento de formulários |
| Lucide React | Ícones |

---

## 📁 Estrutura do Projeto

```
originalpizzaburguer-PDV/
├── src/
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point React
│   ├── index.css            # Estilos globais
│   ├── assets/              # Imagens e recursos
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes shadcn
│   │   └── *.tsx          # Componentes específicos
│   ├── pages/             # Páginas da aplicação
│   │   ├── Home.tsx       # Página inicial/cardápio
│   │   ├── Cart.tsx       # Carrinho de compras
│   │   ├── Admin.tsx      # Dashboard admin
│   │   └── Checkout.tsx   # Finalização pedido
│   ├── hooks/             # Custom hooks
│   ├── integrations/      # Integrações externas
│   │   └── supabase.ts   # Cliente Supabase
│   ├── lib/               # Utilitários
│   │   ├── utils.ts      # Funções helper
│   │   └── form schemas # Zod schemas
│   ├── stores/           # Zustand stores
│   │   ├── cart.ts       # Estado do carrinho
│   │   └── order.ts      # Estado dos pedidos
│   └── types/            # TypeScript types
├── public/               # Arquivos públicos
├── supabase/            # Scripts Supabase
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.example         # Variáveis de ambiente
```

---

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- npm ou bun

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Lswitch18/originalpizzaburguer-PDV.git
cd originalpizzaburguer-PDV

# Instale as dependências
npm install
# ou
bun install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves Supabase
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-anon-publica
VITE_SUPABASE_PROJECT_ID=seu-project-id
```

### Executando

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

| Tabela | Descrição |
|--------|------------|
| `products` | Catálogo de produtos |
| `categories` | Categorias (Pizzas, Bebidas, etc.) |
| `orders` | Pedidos realizados |
| `order_items` | Itens de cada pedido |
| `customers` | Dados dos clientes |
| `addresses` | Endereços de entrega |

### Esquema de Produtos

```sql
products:
  - id: uuid
  - name: text
  - description: text
  - price: numeric
  - category_id: uuid (FK)
  - image_url: text
  - available: boolean
  - created_at: timestamp
```

### Esquema de Pedidos

```sql
orders:
  - id: uuid
  - customer_id: uuid (FK)
  - status: text (pending/cooking/ready/delivered)
  - total: numeric
  - delivery_address: text
  - notes: text
  - created_at: timestamp
```

---

## 📱 Deploy

### Vercel (Recomendado)

```bash
# Instale a CLI
npm i -g vercel

# Deploy
vercel
```

### Hospedagem Alternativa

O projeto pode ser hospedado em qualquer serviço que suporte SPA:

- Netlify
- Vercel
- Cloudflare Pages
- Railway
- Render

---

## 🎨 Customize

### Cores da Marca

Edite `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: "#suacordesejada",
        secondary: "#outracor",
      },
    },
  },
}
```

---

## 📝 Licença

MIT License - Copyright (c) 2024 Wellynton Santos Jeronimo

---

## 👨‍💻 Desenvolvedor

**Wellynton Santos Jeronimo**

- Systems Architect | DevOps Engineer
- React | TypeScript | Node.js Specialist
- AWS | Terraform | Jenkins

---

<p align="center">
  <a href="https://github.com/Lswitch18">
    <img src="https://img.shields.io/badge/-lswitch18-black?style=flat&logo=github" alt="GitHub">
  </a>
</p>