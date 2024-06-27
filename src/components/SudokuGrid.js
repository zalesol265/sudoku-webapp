import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SudokuGrid.css';
import { checkForDuplicates } from '../services/validation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPuzzlePiece, faEraser, faPalette, faPencil } from '@fortawesome/free-solid-svg-icons';

const predefinedColors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'cyan', 'magenta'];
const baseUrl = "http://127.0.0.1:80";

const SudokuGrid = () => {
  const initialGrid = Array(9).fill().map(() => Array(9).fill({ value: null, isPreGenerated: false }));
  const [grid, setGrid] = useState(initialGrid);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [cellColors, setCellColors] = useState(Array(9).fill(Array(9).fill(null)));
  const [candidates, setCandidates] = useState([]);
  const [view, setView] = useState('numbers'); // Add state for toggle view

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
      setGrid(checkForDuplicates(newGrid));
    }
  }, [selectedCell, grid]);

  const clearCell = useCallback(() => {
    if (selectedCell.row !== null && selectedCell.col !== null && !grid[selectedCell.row][selectedCell.col].isPreGenerated) {
      const newGrid = [...grid];
      newGrid[selectedCell.row] = [...newGrid[selectedCell.row]];
      newGrid[selectedCell.row][selectedCell.col] = { ...newGrid[selectedCell.row][selectedCell.col], value: null };
      setGrid(checkForDuplicates(newGrid));
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

  const generatePuzzle = (difficulty = 'Easy') => {
    const url = baseUrl + '/generate?difficulty=' + difficulty;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        const newGrid = data.map(row => 
          row.map(cell => cell !== null ? { value: cell, isPreGenerated: true, isDuplicate: false } : { value: null, isPreGenerated: false, isDuplicate: false })
        );
        setGrid(checkForDuplicates(newGrid));
      })
      .catch(error => {
        console.error("There was an error generating the puzzle!", error);
      });
  };

  const solvePuzzle = () => {
    axios.post(baseUrl + '/solve', { puzzle: grid.map(row => row.map(cell => cell.value)) })
      .then(response => {
        const solvedGrid = response.data.map((row, rowIndex) =>
          row.map((cell, colIndex) => ({
            value: cell,
            isPreGenerated: grid[rowIndex][colIndex].isPreGenerated,
            isDuplicate: false
          }))
        );
        setGrid(checkForDuplicates(solvedGrid));
      })
      .catch(error => {
        console.error("There was an error solving the puzzle!", error);
      });
  };

  const getCellCandidates = () => {
    axios.post(baseUrl + '/candidates', { puzzle: grid.map(row => row.map(cell => cell.value)) })
      .then(response => {
        const candidates = response.data
        setCandidates(candidates);
      })
      .catch(error => {
        console.error("There was an error solving the puzzle!", error);
      });
  };

  const getSoleCellCandidates = () => {
    axios.post(baseUrl + '/soleCandidates', { puzzle: grid.map(row => row.map(cell => cell.value)) })
      .then(response => {
        const candidates = response.data
        setCandidates(candidates);
      })
      .catch(error => {
        console.error("There was an error solving the puzzle!", error);
      });
  };

  return (
    <div className="sudoku-container">
      <div className="left-column">
        <div className="candidates">
          {candidates.map((box, index) => (
            <div key={index} className="box-candidates">
              <h4>Box {(box.box_row * 3) + (box.box_col + 1)}</h4>
                {Object.entries(box.candidates).map(([cellKey, cell], cellIndex) => (              
                  <p key={cellIndex}>
                    Cell {(((cell.row )%3)*3) +((cell.col%3)+1)}: [{Array.isArray(cell.candidates) ? cell.candidates.join(', ') : ''}]
                  </p>
                ))}
            </div>
          ))}
        </div>
      </div>

      <div className='middle-column'>
        <div className="grid">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`cell ${selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'highlighted' : ''} ${cell.isPreGenerated ? 'pre-generated' : ''} ${cell.isDuplicate ? 'duplicate' : ''}`}
                  style={{ backgroundColor: getColor(rowIndex, colIndex) }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell.value || ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons Section (Right Third) */}
      <div className="buttons-and-colors">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${view === 'numbers' ? 'active' : ''}`}
            onClick={() => setView('numbers')}
          >
            <span className="number-button">123</span>
          </button>
          <button
            className={`tab ${view === 'third' ? 'active' : ''}`}
            onClick={() => setView('third')}
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button
            className={`tab ${view === 'colors' ? 'active' : ''}`}
            onClick={() => setView('colors')}
          >
            <FontAwesomeIcon icon={faPalette} /> 
          </button>
        </div>

        {view === 'numbers' && (
          <div className="buttons">
            {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => inputDigit(num)}
                className="digit-selector"
              >
                {num}
              </button>
            ))}
            <button onClick={clearCell}><FontAwesomeIcon icon={faEraser} /></button>
          </div>
        )}

        {view === 'colors' && (
          <div className="colors">
            {predefinedColors.map((color, index) => (
              <button
                key={index}
                onClick={() => selectColor(color)}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        <div className="buttons">
          <button onClick={solvePuzzle}>Solve</button>
          <button onClick={() => generatePuzzle('Easy')}>Generate Easy</button>
          <button onClick={() => generatePuzzle('Medium')}>Generate Medium</button>
          <button onClick={() => generatePuzzle('Hard')}>Generate Hard</button>
          <button onClick={getSoleCellCandidates}>Candidates</button>
        </div>
      </div>
    </div>
  );
};

export default SudokuGrid;
