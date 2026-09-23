/** Regras puras do Sudoku, sem dependência de React ou do navegador. */
export type Board = number[][];

/** Indica se um número pode ser colocado numa posição da grelha. */
export function isValidMove(board: Board, row: number, col: number, value: number): boolean {
  for (let index = 0; index < 9; index++) {
    if (index !== col && board[row][index] === value) return false;
    if (index !== row && board[index][col] === value) return false;
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
    for (let colOffset = 0; colOffset < 3; colOffset++) {
      const currentRow = startRow + rowOffset;
      const currentCol = startCol + colOffset;
      if (
        (currentRow !== row || currentCol !== col) &&
        board[currentRow][currentCol] === value
      ) {
        return false;
      }
    }
  }

  return true;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}
