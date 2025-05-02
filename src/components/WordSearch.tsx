import React, { useState, useEffect } from 'react';
import { generateGrid, DIRECTIONS } from '../utils/wordSearchUtils';
import { getRandomWords } from '../utils/wordList';
import styles from '../styles/WordSearch.module.css';

interface Cell {
  letter: string;
  isSelected: boolean;
  color: string | null;
}

interface WordSearchProps {
  gridSize: 10 | 15 | 20;
  onChangeSize: (size: 10 | 15 | 20) => void;
}

const HIGHLIGHT_COLORS = [
  '#ff99c8', '#fec8c3', '#fcf6bd', '#d0f4de', '#a9def9', '#e4c1f9',
  '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#bdb2ff',
  '#f94144', '#f3722c', '#f9c74f', '#90be6d', '#43aa8b', '#577590'
];

const WordSearch: React.FC<WordSearchProps> = ({ gridSize, onChangeSize }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [lastClickedCell, setLastClickedCell] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  const initializeGame = () => {
    const wordCount = gridSize;
    const randomWords = getRandomWords(wordCount);
    const { grid: newGrid, placedWords } = generateGrid(gridSize, randomWords);
    setGrid(newGrid);
    setWords(placedWords);
    setFoundWords(new Set());
    setRevealedWords(new Set());
    setSelectedCells([]);
    setLastClickedCell(null);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    setSelectedCells([{ row, col }]);

    // Check for word boundary click
    if (lastClickedCell) {
      const cells = getCellsBetween(lastClickedCell, { row, col });
      if (cells.length > 0) {
        const word = cells.map(({ row, col }) => grid[row][col].letter).join('');
        const reversedWord = word.split('').reverse().join('');

        if (words.includes(word) && !foundWords.has(word)) {
          setFoundWords(prev => {
            const newSet = new Set(prev);
            newSet.add(word);
            return newSet;
          });
          const wordIndex = words.indexOf(word);
          highlightWord(cells, HIGHLIGHT_COLORS[wordIndex % HIGHLIGHT_COLORS.length]);
          setRevealedWords(prev => {
            const newSet = new Set(prev);
            newSet.delete(word);
            return newSet;
          });
        } else if (words.includes(reversedWord) && !foundWords.has(reversedWord)) {
          setFoundWords(prev => {
            const newSet = new Set(prev);
            newSet.add(reversedWord);
            return newSet;
          });
          const wordIndex = words.indexOf(reversedWord);
          highlightWord(cells, HIGHLIGHT_COLORS[wordIndex % HIGHLIGHT_COLORS.length]);
          setRevealedWords(prev => {
            const newSet = new Set(prev);
            newSet.delete(reversedWord);
            return newSet;
          });
        }
      }
    }
    setLastClickedCell({ row, col });
  };

  const getCellsBetween = (
    start: { row: number; col: number },
    end: { row: number; col: number }
  ): { row: number; col: number }[] => {
    const cells: { row: number; col: number }[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    // Check if the cells form a straight line
    if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
      return cells;
    }

    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = rowDiff === 0 ? 0 : rowDiff / steps;
    const colStep = colDiff === 0 ? 0 : colDiff / steps;

    for (let i = 0; i <= steps; i++) {
      const row = Math.round(start.row + rowStep * i);
      const col = Math.round(start.col + colStep * i);
      cells.push({ row, col });
    }

    return cells;
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      setSelectedCells(prev => [...prev, { row, col }]);
    }
  };

  const handleMouseUp = () => {
    if (selectedCells.length > 0) {
      checkSelectedWord();
    }
    setIsDragging(false);
    setSelectedCells([]);
  };

  const checkSelectedWord = () => {
    const selectedWord = selectedCells
      .map(({ row, col }) => grid[row][col].letter)
      .join('');

    const reversedWord = selectedWord.split('').reverse().join('');

    if (words.includes(selectedWord) && !foundWords.has(selectedWord)) {
      setFoundWords(prev => {
        const newSet = new Set(prev);
        newSet.add(selectedWord);
        return newSet;
      });
      const wordIndex = words.indexOf(selectedWord);
      highlightWord(selectedCells, HIGHLIGHT_COLORS[wordIndex % HIGHLIGHT_COLORS.length]);
      setRevealedWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedWord);
        return newSet;
      });
    } else if (words.includes(reversedWord) && !foundWords.has(reversedWord)) {
      setFoundWords(prev => {
        const newSet = new Set(prev);
        newSet.add(reversedWord);
        return newSet;
      });
      const wordIndex = words.indexOf(reversedWord);
      highlightWord(selectedCells, HIGHLIGHT_COLORS[wordIndex % HIGHLIGHT_COLORS.length]);
      setRevealedWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(reversedWord);
        return newSet;
      });
    }
  };

  const highlightWord = (cells: { row: number; col: number }[], color: string) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      cells.forEach(({ row, col }) => {
        newGrid[row][col].isSelected = true;
        newGrid[row][col].color = color;
      });
      return newGrid;
    });
  };

  const toggleWordVisibility = (word: string) => {
    setRevealedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(row => 
            row.map(cell => ({
              ...cell,
              isSelected: cell.isSelected && cell.color !== HIGHLIGHT_COLORS[words.indexOf(word) % HIGHLIGHT_COLORS.length],
              color: cell.color === HIGHLIGHT_COLORS[words.indexOf(word) % HIGHLIGHT_COLORS.length] ? null : cell.color
            }))
          );
          return newGrid;
        });
      } else {
        newSet.add(word);
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            for (const direction of DIRECTIONS) {
              const cells = [];
              let currentRow = row;
              let currentCol = col;
              let found = true;

              for (let i = 0; i < word.length; i++) {
                if (
                  currentRow < 0 || 
                  currentRow >= grid.length || 
                  currentCol < 0 || 
                  currentCol >= grid[0].length || 
                  grid[currentRow][currentCol].letter !== word[i]
                ) {
                  found = false;
                  break;
                }
                cells.push({ row: currentRow, col: currentCol });
                currentRow += direction.row;
                currentCol += direction.col;
              }

              if (found) {
                const wordIndex = words.indexOf(word);
                highlightWord(cells, HIGHLIGHT_COLORS[wordIndex % HIGHLIGHT_COLORS.length]);
                break;
              }
            }
          }
        }
      }
      return newSet;
    });
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeSize(Number(event.target.value) as 10 | 15 | 20);
  };

  return (
    <div className={styles.wordSearchContainer}>
      <div className={styles.gameContent}>
        <div className={styles.wordList}>
          <h3>Words to Find</h3>
          <div className={styles.wordsGrid}>
            {words.map((word, index) => (
              <div
                key={word}
                className={`${styles.wordItem} ${
                  foundWords.has(word) ? styles.found : ''
                }`}
                style={{ 
                  borderLeft: `4px solid ${HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]}` 
                }}
              >
                <span className={styles.wordText}>{word}</span>
                {!foundWords.has(word) && (
                  <button
                    className={`${styles.revealButton} ${
                      revealedWords.has(word) ? styles.revealed : ''
                    }`}
                    onClick={() => toggleWordVisibility(word)}
                    title={revealedWords.has(word) ? "Hide word" : "Show word"}
                  >
                    👁️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.gameGridSection}>
          <div className={styles.gridContainer}>
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.gridRow}>
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`${styles.gridCell} ${cell.isSelected ? styles.selected : ''}`}
                    style={{ backgroundColor: cell.color || 'white' }}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                  >
                    {cell.letter}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.gameControls}>
            <button className={styles.newGameButton} onClick={initializeGame}>
              New Game
            </button>
            <select
              className={styles.sizeDropdown}
              value={gridSize}
              onChange={handleSizeChange}
            >
              <option value={10}>10x10</option>
              <option value={15}>15x15</option>
              <option value={20}>20x20</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSearch; 