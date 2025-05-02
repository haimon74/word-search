interface Cell {
  letter: string;
  isSelected: boolean;
  color: string | null;
}

interface GridResult {
  grid: Cell[][];
  placedWords: string[];
}

export const DIRECTIONS = [
  { row: 0, col: 1 },   // horizontal
  { row: 1, col: 0 },   // vertical
  { row: 1, col: 1 },   // diagonal down-right
  { row: 1, col: -1 },  // diagonal down-left
  { row: 0, col: -1 },  // horizontal reverse
  { row: -1, col: 0 },  // vertical reverse
  { row: -1, col: -1 }, // diagonal up-left
  { row: -1, col: 1 },  // diagonal up-right
];

export const generateGrid = (size: number, words: string[]): GridResult => {
  // Initialize empty grid
  const grid: Cell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      letter: '',
      isSelected: false,
      color: null,
    }))
  );

  const placedWords: string[] = [];
  const shuffledWords = [...words].sort(() => Math.random() - 0.5);

  // Try to place each word
  for (const word of shuffledWords) {
    if (placeWord(grid, word)) {
      placedWords.push(word);
    }
  }

  // Fill remaining empty cells with random letters
  fillEmptyCells(grid);

  return { grid, placedWords };
};

const placeWord = (grid: Cell[][], word: string): boolean => {
  const size = grid.length;
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Try random starting position
    const startRow = Math.floor(Math.random() * size);
    const startCol = Math.floor(Math.random() * size);
    
    // Try each direction
    const shuffledDirections = [...DIRECTIONS].sort(() => Math.random() - 0.5);
    
    for (const direction of shuffledDirections) {
      if (canPlaceWord(grid, word, startRow, startCol, direction)) {
        placeWordInGrid(grid, word, startRow, startCol, direction);
        return true;
      }
    }
    
    attempts++;
  }

  return false;
};

const canPlaceWord = (
  grid: Cell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: { row: number; col: number }
): boolean => {
  const size = grid.length;
  
  // Check if word fits within grid bounds
  const endRow = startRow + direction.row * (word.length - 1);
  const endCol = startCol + direction.col * (word.length - 1);
  
  if (
    endRow < 0 || endRow >= size ||
    endCol < 0 || endCol >= size
  ) {
    return false;
  }

  // Check if cells are empty or contain matching letters
  for (let i = 0; i < word.length; i++) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;
    const cell = grid[row][col];
    
    if (cell.letter !== '' && cell.letter !== word[i]) {
      return false;
    }
  }

  return true;
};

const placeWordInGrid = (
  grid: Cell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: { row: number; col: number }
): void => {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;
    grid[row][col].letter = word[i];
  }
};

const fillEmptyCells = (grid: Cell[][]): void => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].letter === '') {
        grid[row][col].letter = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
};

export const checkWord = (grid: Cell[][], word: string): boolean => {
  const size = grid.length;
  
  // Check each possible starting position
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Check each direction
      for (const direction of DIRECTIONS) {
        if (isWordAtPosition(grid, word, row, col, direction)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

const isWordAtPosition = (
  grid: Cell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: { row: number; col: number }
): boolean => {
  const size = grid.length;
  
  // Check if word fits within grid bounds
  const endRow = startRow + direction.row * (word.length - 1);
  const endCol = startCol + direction.col * (word.length - 1);
  
  if (
    endRow < 0 || endRow >= size ||
    endCol < 0 || endCol >= size
  ) {
    return false;
  }

  // Check if letters match
  for (let i = 0; i < word.length; i++) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;
    if (grid[row][col].letter !== word[i]) {
      return false;
    }
  }

  return true;
}; 