import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SudokuGrid.css';

const predefinedColors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'cyan', 'magenta'];

const SudokuGrid = () => {
  const initialGrid = Array(9).fill().map(() => Array(9).fill({ value: null, isPreGenerated: false }));
  const [grid, setGrid] = useState(initialGrid);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [cellColors, setCellColors] = useState(Array(9).fill(Array(9).fill(null)));

  const selectCell = (row, col) => {
    if (selectedCell.row === row && selectedCell.col === col) {
      setSelectedCell({ row: null, col: null });
    } else {
      setSelectedCell({ row, col });
    }
  };

  const inputDigit = useCallback((digit) => {
    if (selectedCell.row !== null && selectedCell.col !== null && !grid[selectedCell.row][selectedCell.col].isPreGenerated) {
      setSelectedDigit(digit);
      const newGrid = [...grid];
      newGrid[selectedCell.row] = [...newGrid[selectedCell.row]];
      newGrid[selectedCell.row][selectedCell.col] = { ...newGrid[selectedCell.row][selectedCell.col], value: digit };
      setGrid(newGrid);
    }
  }, [selectedCell, grid]);

  const clearCell = useCallback(() => {
    if (selectedCell.row !== null && selectedCell.col !== null && !grid[selectedCell.row][selectedCell.col].isPreGenerated) {
      const newGrid = [...grid];
      newGrid[selectedCell.row] = [...newGrid[selectedCell.row]];
      newGrid[selectedCell.row][selectedCell.col] = { ...newGrid[selectedCell.row][selectedCell.col], value: null };
      setGrid(newGrid);
    }
  }, [selectedCell, grid]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const digit = parseInt(event.key);
      if (digit >= 1 && digit <= 9) {
        inputDigit(digit);
      } else if (event.key === 'Backspace') {
        clearCell();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedCell, inputDigit, clearCell]);

  const selectColor = (color) => {
    if (selectedCell.row !== null && selectedCell.col !== null && !grid[selectedCell.row][selectedCell.col].isPreGenerated) {
      setSelectedColor(color);
      setColor(selectedCell.row, selectedCell.col, color);
    }
  };

  const getColor = (row, col) => {
    return cellColors[row][col];
  };

  const setColor = (row, col, color) => {
    if (!grid[row][col].isPreGenerated) {
      const newColors = [...cellColors];
      newColors[row] = [...newColors[row]];
      newColors[row][col] = newColors[row][col] === color ? '' : color;
      setCellColors(newColors);
    }
  };

  const handleCellClick = (row, col) => {
    selectCell(row, col);
  };

  const solvePuzzle = () => {
    axios.post('http://127.0.0.1:80/solve', { puzzle: grid.map(row => row.map(cell => cell.value)) })
      .then(response => {
        const solvedGrid = response.data.map((row, rowIndex) =>
          row.map((cell, colIndex) => ({
            value: cell,
            isPreGenerated: grid[rowIndex][colIndex].isPreGenerated
          }))
        );
        setGrid(solvedGrid);
      })
      .catch(error => {
        console.error("There was an error solving the puzzle!", error);
      });
  };

  const generatePuzzle = (difficulty = 'Easy') => {
    const url = 'http://127.0.0.1:80/generate?difficulty=' + difficulty;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        const newGrid = data.map(row => 
          row.map(cell => cell !== null ? { value: cell, isPreGenerated: true } : { value: null, isPreGenerated: false })
        );
        setGrid(newGrid);
      })
      .catch(error => {
        console.error("There was an error generating the puzzle!", error);
      });
  };

  return (
    <div>
      <h1>Sudoku Solver</h1>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'highlighted' : ''} ${cell.isPreGenerated ? 'pre-generated' : ''}`}
                style={{ backgroundColor: getColor(rowIndex, colIndex) }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell.value || ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="buttons">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
          <button 
            key={num} 
            className={`digit-selector ${selectedDigit === num ? 'selected' : ''}`} 
            onClick={() => inputDigit(num)}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="colors">
        {predefinedColors.map(color => (
          <button 
            key={color} 
            className={`color-selector ${selectedColor === color ? 'selected' : ''}`} 
            style={{ backgroundColor: color }} 
            onClick={() => selectColor(color)} 
          />
        ))}
      </div>
      <button onClick={solvePuzzle}>Solve</button>
      <button onClick={() => generatePuzzle('Easy')}>Generate Easy</button>
      <button onClick={() => generatePuzzle('Medium')}>Generate Medium</button>
      <button onClick={() => generatePuzzle('Hard')}>Generate Hard</button>
    </div>
  );
};

export default SudokuGrid;
