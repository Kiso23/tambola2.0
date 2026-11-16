/**
 * Tambola Ticket Generator
 * Standard Tambola: 3 rows × 9 columns
 * Each row has exactly 5 numbers and 4 blanks
 * Column distribution: col 1 → 1-9, col 2 → 10-19, ..., col 9 → 80-90
 */

function generateTicket() {
  const ticket = Array.from({ length: 3 }, () => Array(9).fill(null));

  // Column ranges
  const colRanges = [
    [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
    [50, 59], [60, 69], [70, 79], [80, 90],
  ];

  // For each column, pick numbers to fill (1-3 numbers per column across 3 rows)
  const colNumbers = colRanges.map(([min, max]) => {
    const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 per column initially
    return pickUnique(min, max, count);
  });

  // Ensure each row gets exactly 5 numbers
  // Start by distributing colNumbers across rows
  // First pass: assign randomly
  const rowCounts = [0, 0, 0];

  // Track which columns have been assigned to which rows
  const colRowAssignments = Array.from({ length: 9 }, () => []);

  for (let col = 0; col < 9; col++) {
    for (const num of colNumbers[col]) {
      const row = leastFilledRow(rowCounts);
      colRowAssignments[col].push({ row, num });
      ticket[row][col] = num;
      rowCounts[row]++;
    }
  }

  // Balance rows to exactly 5 filled cells
  for (let targetRow = 0; targetRow < 3; targetRow++) {
    while (rowCounts[targetRow] < 5) {
      // Find a column that has 0 entries in this row but has space (some cols can have 2 rows)
      const emptyCols = [];
      for (let col = 0; col < 9; col++) {
        if (ticket[targetRow][col] === null) {
          // Check if this col already has numbers in other rows
          const usedInCol = colRowAssignments[col].map(a => a.row);
          if (usedInCol.length < 3) {
            emptyCols.push(col);
          }
        }
      }
      if (emptyCols.length === 0) break;
      const col = emptyCols[Math.floor(Math.random() * emptyCols.length)];
      const [min, max] = colRanges[col];
      const usedNums = colRowAssignments[col].map(a => a.num);
      const available = range(min, max).filter(n => !usedNums.includes(n));
      if (available.length === 0) break;
      const num = available[Math.floor(Math.random() * available.length)];
      ticket[targetRow][col] = num;
      colRowAssignments[col].push({ row: targetRow, num });
      rowCounts[targetRow]++;
    }

    while (rowCounts[targetRow] > 5) {
      // Remove a randomly filled cell
      const filledCols = [];
      for (let col = 0; col < 9; col++) {
        if (ticket[targetRow][col] !== null) {
          filledCols.push(col);
        }
      }
      const col = filledCols[Math.floor(Math.random() * filledCols.length)];
      const num = ticket[targetRow][col];
      ticket[targetRow][col] = null;
      colRowAssignments[col] = colRowAssignments[col].filter(a => !(a.row === targetRow && a.num === num));
      rowCounts[targetRow]--;
    }
  }

  // Sort numbers within each column ascending
  for (let col = 0; col < 9; col++) {
    const nums = [];
    const rows = [];
    for (let row = 0; row < 3; row++) {
      if (ticket[row][col] !== null) {
        nums.push(ticket[row][col]);
        rows.push(row);
      }
    }
    nums.sort((a, b) => a - b);
    for (let i = 0; i < rows.length; i++) {
      ticket[rows[i]][col] = nums[i];
    }
  }

  return { rows: ticket };
}

function leastFilledRow(rowCounts) {
  let minIdx = 0;
  for (let i = 1; i < rowCounts.length; i++) {
    if (rowCounts[i] < rowCounts[minIdx]) minIdx = i;
  }
  return minIdx;
}

function pickUnique(min, max, count) {
  const pool = range(min, max);
  const result = [];
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function range(min, max) {
  const arr = [];
  for (let i = min; i <= max; i++) arr.push(i);
  return arr;
}

/**
 * Validate winning patterns on a ticket
 */
function validatePatterns(ticket, markedNumbers) {
  const marked = new Set(markedNumbers);

  const rowFilled = (rowIdx) => {
    return ticket.rows[rowIdx].filter(n => n !== null).every(n => marked.has(n));
  };

  const earlyFive = markedNumbers.length >= 5;

  const topLine = rowFilled(0);
  const middleLine = rowFilled(1);
  const bottomLine = rowFilled(2);

  const allNums = ticket.rows.flat().filter(n => n !== null);
  const fullHouse = allNums.every(n => marked.has(n));

  return { earlyFive, topLine, middleLine, bottomLine, fullHouse };
}

/**
 * Verify a specific claim against the ticket and called numbers
 */
function verifyClaim(ticket, markedNumbers, calledNumbers, pattern) {
  const calledSet = new Set(calledNumbers);
  // Re-derive marks from actually called numbers
  const validMarked = ticket.rows.flat()
    .filter(n => n !== null && calledSet.has(n));

  const patterns = validatePatterns(ticket, validMarked);
  return patterns[pattern] === true;
}

module.exports = { generateTicket, validatePatterns, verifyClaim };
