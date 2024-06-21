
export const checkForDuplicates = (grid) => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell, isDuplicate: false })));

    // Check rows for duplicates
    for (let i = 0; i < 9; i++) {
        const seenInRow = new Set();
        for (let j = 0; j < 9; j++) {
            const value = grid[i][j].value;
            if (value !== null) {
                if (seenInRow.has(value)) {
                    newGrid[i][j].isDuplicate = true;
                    for (let k = 0; k < 9; k++) {
                        if (grid[i][k].value === value) {
                            newGrid[i][k].isDuplicate = true;
                        }
                    }
                } else {
                    seenInRow.add(value);
                }
            }
        }
    }

    // Check columns for duplicates
    for (let j = 0; j < 9; j++) {
        const seenInCol = new Set();
        for (let i = 0; i < 9; i++) {
            const value = grid[i][j].value;
            if (value !== null) {
                if (seenInCol.has(value)) {
                    newGrid[i][j].isDuplicate = true;
                    for (let k = 0; k < 9; k++) {
                        if (grid[k][j].value === value) {
                            newGrid[k][j].isDuplicate = true;
                        }
                    }
                } else {
                    seenInCol.add(value);
                }
            }
        }
    }

    // Check 3x3 boxes for duplicates
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const seenInBox = new Set();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const row = boxRow * 3 + i;
                    const col = boxCol * 3 + j;
                    const value = grid[row][col].value;
                    if (value !== null) {
                        if (seenInBox.has(value)) {
                            newGrid[row][col].isDuplicate = true;
                            for (let k = 0; k < 3; k++) {
                                for (let l = 0; l < 3; l++) {
                                    const checkRow = boxRow * 3 + k;
                                    const checkCol = boxCol * 3 + l;
                                    if (grid[checkRow][checkCol].value === value) {
                                        newGrid[checkRow][checkCol].isDuplicate = true;
                                    }
                                }
                            }
                        } else {
                            seenInBox.add(value);
                        }
                    }
                }
            }
        }
    }

    return newGrid;
};
