let rowsAmount, columnsAmount, typesAmount;
const table = document.querySelector('table');
const rowsInput = document.getElementById('rows');
const columnsInput = document.getElementById('cols');
const typesInput = document.getElementById('types');
const start = document.querySelector('.start')

rowsInput.addEventListener('input', (event) => {
  rowsAmount = event.target.value;
})

columnsInput.addEventListener('input', (event) => {
  columnsAmount = event.target.value;
})

typesInput.addEventListener('input', (event) => {
  typesAmount = event.target.value;
})

start.addEventListener('click', () => {
  new Field('#field', rowsAmount, columnsAmount, typesAmount);
})

// #region classes
class Field {
  constructor(selector, rowsNum, colsNum, typesNum) {
    this._field = document.querySelector(selector);
    this._rowsNum = rowsNum;
    this._colsNum = colsNum;
    this._typesNum = typesNum

    this._cells = new Cells();
    this._html = new HTML;
    this._html.createTable(this._field, this._rowsNum, this._colsNum, this._typesNum, this._cells);
    this._run();
  }

  _run() {
    // вішаємо слухача на все поле (таблицю) і делегуємо обробник на комірку
    this._field.addEventListener('click', (event) => {
      let cell = event.target.closest('td');
      let row = cell.parentElement

      let y = this._html.getPrevSibling(row);
      let x = this._html.getPrevSibling(cell);

      const currentCell = this._cells.getCell(y, x);
      currentCell._select();
      this._cells.createBlock(currentCell);

      setTimeout(() => {
        this._cells.removeBlock();
      }, 3000)
    })
  }
}

class Cell {
  // створюємо клітинку, куди передаємо тип, елемент(td) в якому відображається, номер рядка та колонки в таблиці, об'єкт з іншими клітинками
  constructor(type, elem, row, col, cells) {
    this._type = type;
    this._elem = elem;
    this._row = row;
    this._col = col;
    this._cells = cells;
    console.log('cell: ', this._cells)
  }

  getRow() {
    return this._row
  }

  getCol() {
    return this._col
  }

  getNeighbour(offsetRow, offsetCol) {
    const row = this._row + offsetRow;
    const col = this._col + offsetCol;

    if (this._cells._cells[row] !== undefined) {
      return this._cells._cells[row][col];
    }
  }

  _select() {
    this._elem.classList.add('selected');
  }

  _unselect() {
    this._elem.classList.remove('selected');
  }

  _belongsTo(type) {
    return this._type === type;
  }

  _clear() {
    const type = this._type;
    this._elem.classList.remove('selected', `cell--${type}`)
    this._elem.innerText = '';
  }
}

class Cells {
  constructor() {
    this._cells = {};
    this._block = [];
  }

  addCell(cell, row, col) {
    if (this._cells[row] === undefined) {
      this._cells[row] = {}
    }
    this._cells[row][col] = cell;
  }

  getCell(row, col) {
      return this._cells[row] ? this._cells[row][col] : undefined;
  }

  createBlock(cell) {
    if (this._block.length > 0) {
      while (this._block.length) {
        const item = this._block[0];

        item._unselect();
        this._block.shift();
      }
    }
    this._block.push(cell);

    for (let i = 0; i < this._block.length; i++) {
      const offSets = [[-1, 0], [0, -1], [0, 1], [1, 0]]
      const row = this._block[i].getRow();
      const col = this._block[i].getCol();

      offSets.forEach((elem) => {
        const neighbour = this._block[i].getNeighbour(elem[0], elem[1]);

        if (neighbour) {
          if (neighbour._belongsTo(this._block[i]._type)) {
            neighbour._select();
            if (!this._block.includes(neighbour)) {
              this._block.push(neighbour);
            }
          }
        }
      })
    }
  }

  removeBlock() {
    while (this._block.length > 0) {
      const item = this._block[0];
      const row = item.getRow();
      const col = item.getCol();
      item._clear();
      this.removeCell(row, col);
      this._block.shift();
    }
  }

  removeCell(row, col) {
    this._cells[row][col] = null;
  }
}

class HTML {
  createTable(parent, rows, cols, types, cells) {
    const table = document.createElement('table');

    for (let i = 0; i < rows; i++) {
      const newRow = document.createElement('tr');

      for (let j = 0; j < cols; j++) {
        const newtd = document.createElement('td');
        const rnd = this.getRandomType(types)
        newtd.classList.add('cell', `cell--${rnd}`)
        newtd.innerText = rnd;

        const cell = new Cell(rnd, newtd, i, j, cells)
        cells.addCell(cell, i, j);

        newRow.append(newtd);

      }

      table.append(newRow);
    }

    parent.append(table);
  }

  getRandomType(num) {
    return Math.floor(Math.random() * num + 1);
  }

  getPrevSibling(elem) {
    let prev = elem.previousSibling
    let i = 0;

    while (prev) {
      prev = prev.previousSibling;
      i++;
    }

    return i;
  }
}
// #endregion
