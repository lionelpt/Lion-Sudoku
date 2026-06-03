import { useState, useEffect } from 'react';

// Sudoku puzzle generator helper
const generatePuzzle = (): { puzzle: number[][], solution: number[][] } => {
  // Base puzzle (difficulty: medium)
  const basePuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];

  const baseSolution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];

  const cloneBoard = (board: number[][]): number[][] => board.map(row => [...row]);

  const randomInt = (max: number): number => Math.floor(Math.random() * max);

  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const transpose = (board: number[][]): number[][] =>
    board[0].map((_, col) => board.map(row => row[col]));

  const swapRows = (board: number[][], rowA: number, rowB: number) => {
    [board[rowA], board[rowB]] = [board[rowB], board[rowA]];
  };

  const swapCols = (board: number[][], colA: number, colB: number) => {
    for (let row = 0; row < 9; row++) {
      [board[row][colA], board[row][colB]] = [board[row][colB], board[row][colA]];
    }
  };

  const swapRowBands = (board: number[][], bandA: number, bandB: number) => {
    for (let offset = 0; offset < 3; offset++) {
      swapRows(board, bandA * 3 + offset, bandB * 3 + offset);
    }
  };

  const swapColStacks = (board: number[][], stackA: number, stackB: number) => {
    for (let offset = 0; offset < 3; offset++) {
      swapCols(board, stackA * 3 + offset, stackB * 3 + offset);
    }
  };

  const remapDigits = (board: number[][], mapping: number[]): number[][] =>
    board.map(row => row.map(value => (value === 0 ? 0 : mapping[value])));

  let puzzle = cloneBoard(basePuzzle);
  let solution = cloneBoard(baseSolution);

  // Random digit permutation preserves Sudoku correctness.
  const shuffledDigits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const digitMap = Array(10).fill(0);
  for (let i = 1; i <= 9; i++) {
    digitMap[i] = shuffledDigits[i - 1];
  }
  puzzle = remapDigits(puzzle, digitMap);
  solution = remapDigits(solution, digitMap);

  // Randomize row/column structures while keeping a valid board.
  const applyBoardTransforms = (board: number[][]) => {
    const bandA = randomInt(3);
    let bandB = randomInt(3);
    while (bandB === bandA) bandB = randomInt(3);
    swapRowBands(board, bandA, bandB);

    const stackA = randomInt(3);
    let stackB = randomInt(3);
    while (stackB === stackA) stackB = randomInt(3);
    swapColStacks(board, stackA, stackB);

    for (let band = 0; band < 3; band++) {
      const rows = shuffle([0, 1, 2]);
      const [r0, r1, r2] = rows;
      const original = board.slice(band * 3, band * 3 + 3);
      board[band * 3] = [...original[r0]];
      board[band * 3 + 1] = [...original[r1]];
      board[band * 3 + 2] = [...original[r2]];
    }

    for (let stack = 0; stack < 3; stack++) {
      const cols = shuffle([0, 1, 2]);
      for (let row = 0; row < 9; row++) {
        const original = board[row].slice(stack * 3, stack * 3 + 3);
        board[row][stack * 3] = original[cols[0]];
        board[row][stack * 3 + 1] = original[cols[1]];
        board[row][stack * 3 + 2] = original[cols[2]];
      }
    }
  };

  applyBoardTransforms(puzzle);
  applyBoardTransforms(solution);

  if (Math.random() > 0.5) {
    puzzle = transpose(puzzle);
    solution = transpose(solution);
  }

  return { puzzle, solution };
};

type Notes = { [key: string]: Set<number> };

const isValidMove = (board: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (x !== row && board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = startRow + i;
      const c = startCol + j;
      if ((r !== row || c !== col) && board[r][c] === num) return false;
    }
  }

  return true;
};

export default function App() {
  const [initialPuzzle, setInitialPuzzle] = useState<number[][]>([]);
  const [board, setBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [proximityMap, setProximityMap] = useState<Record<string, 'green' | 'yellow' | 'orange' | 'red'>>({});
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Notes>({});

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const { puzzle, solution } = generatePuzzle();
    setInitialPuzzle(puzzle.map(row => [...row]));
    setBoard(puzzle.map(row => [...row]));
    setSolution(solution);
    setErrors(new Set());
    setIsComplete(false);
    setProximityMap({});
    setSelectedCell(null);
    setNotes({});
    setNotesMode(false);
  };

  const resetPuzzle = () => {
    setBoard(initialPuzzle.map(row => [...row]));
    setErrors(new Set());
    setIsComplete(false);
    setProximityMap({});
    setNotes({});
  };

  const handleCellClick = (row: number, col: number) => {
    if (initialPuzzle[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (initialPuzzle[row][col] !== 0) return;

    const cellKey = `${row}-${col}`;

    if (notesMode) {
      // Toggle note
      const newNotes = { ...notes };
      if (!newNotes[cellKey]) {
        newNotes[cellKey] = new Set();
      }
      if (newNotes[cellKey].has(num)) {
        newNotes[cellKey].delete(num);
      } else {
        newNotes[cellKey].add(num);
      }
      setNotes(newNotes);
    } else {
      // Place number
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = num;
      setBoard(newBoard);

      // Clear notes for this cell
      const newNotes = { ...notes };
      delete newNotes[cellKey];
      setNotes(newNotes);

      // Check for errors
      const newErrors = new Set<string>();
      if (num !== 0 && !isValidMove(newBoard, row, col, num)) {
        newErrors.add(cellKey);
      }
      setErrors(newErrors);

      // Compute a conservative color for the cell: only exact matches are green.
      if (num === 0) {
        const pm = { ...proximityMap };
        delete pm[cellKey];
        setProximityMap(pm);
      } else if (newErrors.has(cellKey)) {
        setProximityMap({ ...proximityMap, [cellKey]: 'red' });
      } else {
        const severity: 'green' | 'yellow' | 'orange' | 'red' = num === solution[row][col] ? 'green' : 'red';
        setProximityMap({ ...proximityMap, [cellKey]: severity });
      }

      // Check if puzzle is complete
      const isFilled = newBoard.every(row => row.every(cell => cell !== 0));
      const isCorrect = JSON.stringify(newBoard) === JSON.stringify(solution);
      setIsComplete(isFilled && isCorrect);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    if (e.key >= '1' && e.key <= '9') {
      handleNumberInput(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      handleNumberInput(0);
    } else if (e.key === 'ArrowUp' && selectedCell.row > 0) {
      setSelectedCell({ row: selectedCell.row - 1, col: selectedCell.col });
    } else if (e.key === 'ArrowDown' && selectedCell.row < 8) {
      setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col });
    } else if (e.key === 'ArrowLeft' && selectedCell.col > 0) {
      setSelectedCell({ row: selectedCell.row, col: selectedCell.col - 1 });
    } else if (e.key === 'ArrowRight' && selectedCell.col < 8) {
      setSelectedCell({ row: selectedCell.row, col: selectedCell.col + 1 });
    }
  };

  const checkSolution = () => {
    const newErrors = new Set<string>();
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== 0 && board[row][col] !== solution[row][col]) {
          newErrors.add(`${row}-${col}`);
        }
      }
    }
    setErrors(newErrors);

    const isFilled = board.every(row => row.every(cell => cell !== 0));
    const isCorrect = newErrors.size === 0 && isFilled && JSON.stringify(board) === JSON.stringify(solution);
    setIsComplete(isCorrect);
  };

  const solvePuzzle = () => {
    setBoard(solution.map(row => [...row]));
    setErrors(new Set());
    setNotes({});
    setIsComplete(true);
    setProximityMap({});
  };

  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : 0;

  const getCellTone = (rowIndex: number, colIndex: number, isSelected: boolean, hasError: boolean, cellKey: string) => {
    const p = proximityMap[cellKey];
    if (hasError) return 'bg-rose-50/95 text-rose-700 shadow-[inset_0_0_0_1px_rgba(190,24,93,0.18)]';
    if (p === 'green') return 'bg-emerald-50/90 text-emerald-800 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]';
    if (p === 'yellow') return 'bg-amber-100/90 text-amber-950 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.08)]';
    if (p === 'orange') return 'bg-orange-100/90 text-orange-800 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.08)]';
    if (isSelected) return 'bg-amber-100/90 text-amber-950 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.15),0_8px_24px_rgba(120,83,48,0.12)]';
    if (selectedCell && (selectedCell.row === rowIndex || selectedCell.col === colIndex)) return 'bg-stone-50/95 text-stone-900';
    return 'bg-white/90 text-stone-900';
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-6 text-stone-900 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background blur elements removed to prevent flicker on some GPUs */}

      <div className="mx-auto grid w-full max-w-6xl gap-6 justify-center">
        <section className="mx-auto w-full max-w-3xl rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl text-stone-950 sm:text-5xl">Lion Sudoku 26</h1>
              </div>
            </div>
          </div>

        {isComplete && (
          <div className="mb-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-6 py-4 text-center text-emerald-800 shadow-sm">
            <span className="text-lg font-medium">🎉 Congratulations! Puzzle solved!</span>
          </div>
        )}

          {/* Status cards removed as requested */}

          {/* Sudoku Grid */}
          <div className="mb-6 relative flex justify-center">
            <div className="board-wrapper overflow-hidden rounded-none bg-transparent shadow-none">
              <div className="grid grid-cols-9 gap-0 bg-transparent p-0 sm:p-0">
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isInitial = initialPuzzle[rowIndex][colIndex] !== 0;
                const hasError = errors.has(`${rowIndex}-${colIndex}`);
                const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
                const cellKey = `${rowIndex}-${colIndex}`;
                const cellNotes = notes[cellKey];
                const proximity = proximityMap[cellKey];
                const isRelated = selectedCell && (selectedCell.row === rowIndex || selectedCell.col === colIndex || (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)));

                    return (
                      <button
                        key={cellKey}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          relative flex aspect-square items-center justify-center border border-stone-200/70 transition-all duration-200
                          ${getCellTone(rowIndex, colIndex, isSelected, hasError, cellKey)}
                          ${isInitial ? 'font-semibold' : 'font-medium'}
                          ${isRelated && !isSelected ? 'bg-amber-50/70' : ''}
                          ${isSelected ? 'z-10 ring-1 ring-amber-300/60' : ''}
                          ${!isInitial && !isSelected && !hasError ? 'hover:-translate-y-px hover:bg-amber-50/90' : ''}
                          ${isRightBorder ? 'border-r-[2.5px] border-r-stone-700/90' : ''}
                          ${isBottomBorder ? 'border-b-[2.5px] border-b-stone-700/90' : ''}
                        `}
                        disabled={isInitial}
                      >
                        {cell !== 0 ? (
                          <span className={`text-xl sm:text-2xl ${isInitial ? 'text-stone-950' : (proximity ? '' : 'text-stone-700')}`}>
                            {cell}
                          </span>
                        ) : cellNotes && cellNotes.size > 0 ? (
                          <div className="grid h-full w-full grid-cols-3 gap-[1px] p-0.5 text-[8px] text-stone-500 sm:text-[9px]">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                              <div key={num} className="flex items-center justify-center">
                                {cellNotes.has(num) ? num : ''}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            </div>

          {/* Controls moved below the game board */}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={startNewGame}
              className="rounded px-3 py-1 border border-stone-300 bg-transparent text-sm text-stone-900 hover:bg-stone-100/5"
            >
              New Puzzle
            </button>
            <button
              onClick={checkSolution}
              className="rounded px-3 py-1 border border-stone-300 bg-transparent text-sm text-stone-900 hover:bg-stone-100/5"
            >
              Check
            </button>
            <button
              onClick={solvePuzzle}
              className="rounded px-3 py-1 border border-stone-300 bg-transparent text-sm text-stone-900 hover:bg-stone-100/5"
            >
              Solve
            </button>
            {/* Notes button removed per request */}
            <button
              onClick={resetPuzzle}
              className="rounded px-3 py-1 border border-stone-300 bg-transparent text-sm text-stone-900 hover:bg-stone-100/5"
            >
              Reset
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
