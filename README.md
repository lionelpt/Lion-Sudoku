
  # Sudoku - Documentação Técnica

  Bundle frontend baseado no layout original do Figma:
  https://www.figma.com/design/kE7vOyOST3EQ5My1jybMEO/center-square-and-header

  ## Visão Geral

  Aplicação web React com Vite, organizada para desenvolvimento rápido de interface.

  Tecnologias principais:
  - React 18
  - Vite 6
  - TypeScript
  - Componentes de UI baseados em Radix e utilitários de estilo

  ## Pré-requisitos

  Antes de iniciar, garanta que o ambiente possui:
  - Node.js 18+
  - npm 9+

  Verificação opcional:

  ```bash
  node -v
  npm -v
  ```

  ## Instalação

  Instale as dependências do projeto:

  ```bash
  npm install
  ```

  ## Execução em Desenvolvimento

  Inicie o servidor local:

  ```bash
  npm run dev
  ```

  A aplicação ficará disponível em:
  - http://localhost:5173/

  ## Build de Produção

  Gere os artefatos otimizados:

  ```bash
  npm run build
  ```

  ## Scripts Disponíveis

  - `npm run dev`: inicia o servidor de desenvolvimento (Vite)
  - `npm run build`: gera build de produção

  ## Estrutura Relevante

  - `src/main.tsx`: ponto de entrada da aplicação
  - `src/app/App.tsx`: composição principal da interface
  - `src/app/components/ui/`: biblioteca de componentes reutilizáveis
  - `src/styles/`: estilos globais, tema e fontes

  ## Observações Técnicas

  - O projeto utiliza Vite com módulo ES (`"type": "module"`).
  - Caso o servidor não suba, reinstale dependências com `npm install`.
  