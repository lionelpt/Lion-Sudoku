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
    setSelectedCell(null);
    setNotes({});
    setNotesMode(false);
  };

  const resetPuzzle = () => {
    setBoard(initialPuzzle.map(row => [...row]));
    setErrors(new Set());
    setIsComplete(false);
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

      // Check if puzzle is complete
      const isFilled = newBoard.every(row => row.every(cell => cell !== 0));
      const isCorrect = JSON.stringify(newBoard) === JSON.stringify(solution);
      if (isFilled && isCorrect) {
        setIsComplete(true);
      }
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
  };

  const solvePuzzle = () => {
    setBoard(solution.map(row => [...row]));
    setErrors(new Set());
    setNotes({});
    setIsComplete(true);
  };

  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : 0;

  const getCellTone = (rowIndex: number, colIndex: number, isSelected: boolean, hasError: boolean) => {
    if (hasError) return 'bg-rose-50/95 text-rose-700 shadow-[inset_0_0_0_1px_rgba(190,24,93,0.18)]';
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
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-12%] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-[-8%] top-[10%] h-80 w-80 rounded-full bg-stone-400/20 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-96 w-96 rounded-full bg-orange-100/80 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
        <section className="rounded-[2rem] border border-white/60 bg-white/55 p-4 shadow-[0_24px_80px_rgba(73,50,28,0.16)] backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-950 text-2xl text-amber-100 shadow-[0_10px_30px_rgba(29,26,23,0.22)]">
                🦁
              </div>
              <div>
                <h1 className="text-4xl text-stone-950 sm:text-5xl">Lion Sudoku</h1>
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
            <div className="overflow-hidden rounded-[1.75rem] border border-stone-300/70 bg-white/90 shadow-[0_18px_60px_rgba(63,43,22,0.18)] ring-1 ring-white/60">
              <div className="grid grid-cols-9 gap-0 bg-stone-200/70 p-0.5 sm:p-1">
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isInitial = initialPuzzle[rowIndex][colIndex] !== 0;
                const hasError = errors.has(`${rowIndex}-${colIndex}`);
                const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
                const cellKey = `${rowIndex}-${colIndex}`;
                const cellNotes = notes[cellKey];
                const isRelated = selectedCell && (selectedCell.row === rowIndex || selectedCell.col === colIndex || (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)));

                    return (
                      <button
                        key={cellKey}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          relative flex aspect-square w-10 items-center justify-center border border-stone-200/70 transition-all duration-200 sm:w-14
                          ${getCellTone(rowIndex, colIndex, isSelected, hasError)}
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
                          <span className={`text-xl sm:text-2xl ${isInitial ? 'text-stone-950' : 'text-stone-700'}`}>
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

          {/* Aside content moved inside section to simplify layout */}
          <div className="space-y-6 border border-white/60 bg-stone-950/90 p-4 text-stone-100 shadow-[0_24px_80px_rgba(25,19,13,0.32)] backdrop-blur-xl sm:p-6 lg:p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Controls</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={startNewGame}
                  className="rounded-full border border-stone-700/80 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-100 shadow-sm transition-all hover:-translate-y-px hover:bg-stone-800"
                >
                  New Puzzle
                </button>
                <button
                  onClick={checkSolution}
                  className="rounded-full border border-stone-700/80 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-100 shadow-sm transition-all hover:-translate-y-px hover:bg-stone-800"
                >
                  Check
                </button>
                <button
                  onClick={solvePuzzle}
                  className="rounded-full border border-stone-700/80 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-100 shadow-sm transition-all hover:-translate-y-px hover:bg-stone-800"
                >
                  Solve
                </button>
                <button
                  onClick={() => setNotesMode(!notesMode)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-px ${
                    notesMode
                      ? 'border-amber-300 bg-amber-200 text-stone-950'
                      : 'border-stone-700/80 bg-stone-900 text-stone-100 hover:bg-stone-800'
                  }`}
                >
                  Notes {notesMode ? 'On' : 'Off'}
                </button>
                <button
                  onClick={resetPuzzle}
                  className="rounded-full border border-stone-700/80 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-100 shadow-sm transition-all hover:-translate-y-px hover:bg-stone-800"
                >
                  Reset
                </button>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Number pad</p>
                  <p className="mt-2 text-sm text-stone-300">Use it to enter values or toggle notes.</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
                  {selectedCell ? 'Active' : 'Idle'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="h-14 rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-white transition-all hover:-translate-y-px hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={!selectedCell || (selectedCell && initialPuzzle[selectedCell.row][selectedCell.col] !== 0)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-stone-300">
              <p className="font-semibold text-stone-100">How to play</p>
              <p className="mt-2">Fill the empty spaces with numbers from 1 to 9 without repeating in rows, columns, or 3×3 blocks.</p>
              <p className="mt-3 text-stone-400">Tip: Notes mode is ideal for marking candidates before locking a move.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
