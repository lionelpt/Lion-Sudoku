import { useState, useEffect } from 'react';

// Sudoku puzzle generator helper
const generatePuzzle = (): { puzzle: number[][], solution: number[][] } => {
  // A sample puzzle (difficulty: medium)
  const puzzle = [
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

  const solution = [
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

  return (
    <div
      className="size-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-4xl">🦁</span>
          <h1 className="text-3xl text-blue-600">Lion Sudoku</h1>
        </div>

        {isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 mb-6 text-center">
            <span className="text-green-700 text-lg">🎉 Congratulations! Puzzle solved!</span>
          </div>
        )}

        {/* Sudoku Grid */}
        <div className="mb-6 flex justify-center">
          <div className="grid grid-cols-9 gap-0 border-[3px] border-black bg-white">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isInitial = initialPuzzle[rowIndex][colIndex] !== 0;
                const hasError = errors.has(`${rowIndex}-${colIndex}`);
                const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
                const cellKey = `${rowIndex}-${colIndex}`;
                const cellNotes = notes[cellKey];

                return (
                  <button
                    key={cellKey}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                      w-14 h-14 flex items-center justify-center relative
                      border border-gray-200
                      transition-all
                      ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset z-10' : ''}
                      ${isInitial ? 'bg-slate-100' : 'bg-white'}
                      ${hasError ? '!bg-red-50 text-red-600' : ''}
                      ${!isInitial && !isSelected && !hasError ? 'hover:bg-blue-50' : ''}
                      ${isRightBorder ? 'border-r-[3px] border-r-black' : ''}
                      ${isBottomBorder ? 'border-b-[3px] border-b-black' : ''}
                    `}
                    disabled={isInitial}
                  >
                    {cell !== 0 ? (
                      <span className={`text-2xl ${isInitial ? 'text-black' : 'text-blue-600'}`}>
                        {cell}
                      </span>
                    ) : cellNotes && cellNotes.size > 0 ? (
                      <div className="grid grid-cols-3 gap-[1px] w-full h-full p-0.5 text-[9px] text-gray-500">
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

        {/* Control Buttons */}
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          <button
            onClick={startNewGame}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors border border-slate-200"
          >
            New Puzzle
          </button>
          <button
            onClick={checkSolution}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors border border-slate-200"
          >
            Check
          </button>
          <button
            onClick={solvePuzzle}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors border border-slate-200"
          >
            Solve
          </button>
          <button
            onClick={() => setNotesMode(!notesMode)}
            className={`px-6 py-2.5 rounded-full transition-colors border ${
              notesMode
                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            Notes {notesMode ? '✓' : ''}
          </button>
          <button
            onClick={resetPuzzle}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors border border-slate-200"
          >
            Reset
          </button>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-9 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="h-12 bg-slate-100 hover:bg-blue-100 text-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200"
              disabled={!selectedCell || (selectedCell && initialPuzzle[selectedCell.row][selectedCell.col] !== 0)}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>Fill the empty spaces with numbers from 1 to 9 without repeating in rows, columns, or 3×3 blocks.</p>
          <p className="text-gray-500">Tip: Use Notes mode to mark possible numbers, then solve step by step.</p>
        </div>
      </div>
    </div>
  );
}
