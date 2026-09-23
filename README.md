# Sudoku - Instruções do Jogo

## Desenvolvimento

O projeto é uma única aplicação React/Vite. A mesma base poderá ser distribuída no navegador e, mais tarde, numa app iOS através do Capacitor.

```text
src/
├── App.tsx       # Interface e estado temporário do jogo
├── main.tsx      # Ponto de entrada React
└── styles/       # Tema, fontes e estilos globais
```

Para correr localmente:

```bash
npm run dev
```

Para disponibilizar na rede local por IP e porta:

```bash
npm run dev:network
```

O Vite mostrará o endereço a abrir, como `http://192.168.x.x:5173`. Quando a app iOS for preparada, o Capacitor usará a pasta `dist/` produzida por `npm run build`.

## Objetivo

Preencher todas as casas vazias com números de 1 a 9 sem repetir:

- na mesma linha
- na mesma coluna
- no mesmo bloco 3x3

## Como Jogar

1. Clica numa célula vazia da grelha.
2. Escolha um número no teclado numérico da interface (1 a 9) ou use o teclado.
3. Para limpar uma célula, utiliza 0, Delete ou Backspace.
4. Continua até preencher a grelha inteira corretamente.

## O Que Cada Botão Faz

- New Puzzle: cria uma nova grelha aleatória.
- Check: verifica a grelha atual e marca valores incorretos.
- Solve: resolva automaticamente o puzzle atual.
- Notes: ativa/desativa o modo de anotações para colocar candidatos nas células.
- Reset: repõe a grelha para o estado inicial do puzzle atual.

## Dicas Rápidas

- Utiliza o modo Notes para testar possibilidades antes de preencher definitivamente.
- Completa primeiro linhas, colunas ou blocos com menos casas vazias.
- Utiliza Check quando quiser validar o progresso.
