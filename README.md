# refund.ai

Aplicação SaaS moderna em React para validação de comprovantes e processamento de reembolsos, com fluxo de autenticação, React Query para busca de dados e interface com Tailwind CSS.

## Funcionalidades

### Autenticação e autorização
- Fluxo completo de autenticação (login, cadastro, redefinição de senha)
- Rotas protegidas com React Router
- Autenticação baseada em token
- Renovação automática de token
- Gerenciamento de sessão com Zustand

### UI/UX
- Design moderno e responsivo
- Estados de carregamento e animações
- Validação de formulários com Yup
- Notificações toast com React Toastify
- Ícones com Lucide React
- Componentes animados com Tailwind CSS
- Suporte a modo escuro

### Gerenciamento de dados
- Busca de dados eficiente com React Query
- Estado global com Zustand
- Chamadas de API tipadas
- Tratamento automático de erros
- Cache e invalidação de requisições

### Experiência de desenvolvimento
- TypeScript para segurança de tipos
- Padrões modernos de React e hooks
- Code splitting e carregamento sob demanda
- Vite para desenvolvimento e build rápidos
- ESLint para qualidade de código
- Estrutura de pastas organizada

## Stack tecnológica

### Núcleo
- React 18
- TypeScript
- Vite
- React Router v7

### Estado e dados
- Zustand (gerenciamento de estado)
- TanStack Query v5 (busca de dados)
- Yup (validação de formulários)

### Estilo e UI
- Tailwind CSS
- Radix UI (componentes headless)
- Lucide React (ícones)
- Class Variance Authority (variantes de componentes)
- Tailwind Merge (fusão de classes)
- Motion (animações)

### Ferramentas de desenvolvimento
- ESLint
- TypeScript
- PostCSS
- Autoprefixer

## Como começar

1. Clone o repositório

2. Execute `npm install` para instalar as dependências

3. Execute `npm run dev` para iniciar o servidor de desenvolvimento

4. Execute `npm run build` para gerar a build da aplicação

## Estrutura do projeto

- `src/`: Código-fonte
- `src/components/`: Componentes React
- `src/pages/`: Páginas React
- `src/processes/`: Funções de processo
- `src/stores/`: Stores Zustand
- `src/types/`: Tipos TypeScript
- `src/utils/`: Funções utilitárias
