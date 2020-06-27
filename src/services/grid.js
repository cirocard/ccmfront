'user strict';

export function resizableGrid(table) {
  const thead = table.getElementsByTagName('thead')[0];
  const tbody = table.getElementsByTagName('tbody')[0];
  const row = tbody.querySelector('tr');
  const cols = row ? row.children : undefined;

  if (!cols) return;
  //  table.style.width = '2000px';
  thead.style.position = 'relative';
  // table.style.overflow = 'hidden';

  const tableHeight = table.offsetHeight;

  for (let i = 0; i < cols.length; i++) {
    const div = createDiv(tableHeight);
    cols[i].appendChild(div);
    cols[i].style.position = 'relative';
    setListeners(div);
  }

  function setListeners(div) {
    let pageX;
    let curCol;
    let nxtCol;
    let curColWidth;
    let nxtColWidth;

    div.addEventListener('mousedown', function (e) {
      curCol = e.target.parentElement;
      nxtCol = curCol.nextElementSibling;
      pageX = e.pageX;

      const padding = paddingDiff(curCol);

      curColWidth = curCol.offsetWidth - padding;
      if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;
    });

    div.addEventListener('mouseover', function (e) {
      e.target.style.borderRight = '2px solid #61098a';
    });

    div.addEventListener('mouseout', function (e) {
      e.target.style.borderRight = '';
    });

    document.addEventListener('mousemove', function (e) {
      if (curCol) {
        const diffX = e.pageX - pageX;

        if (nxtCol) nxtCol.style.width = `${nxtColWidth - diffX}px`;

        curCol.style.width = `${curColWidth + diffX}px`;
      }
    });

    document.addEventListener('mouseup', function (e) {
      curCol = undefined;
      nxtCol = undefined;
      pageX = undefined;
      nxtColWidth = undefined;
      curColWidth = undefined;
    });
  }

  function createDiv(height) {
    const div = document.createElement('div');
    div.style.top = 0;
    div.style.right = 0;
    div.style.width = '2px';
    div.style.background = 'transprent';
    div.style.position = 'absolute';
    div.style.cursor = 'col-resize';
    div.style.userSelect = 'none';
    div.style.height = `${height}px`;
    // div.className = 'columnSelector';
    return div;
  }

  function paddingDiff(col) {
    if (getStyleVal(col, 'box-sizing') === 'border-box') {
      return 0;
    }

    const padLeft = getStyleVal(col, 'padding-left');
    const padRight = getStyleVal(col, 'padding-right');
    return parseInt(padLeft) + parseInt(padRight);
  }

  function getStyleVal(elm, css) {
    return window.getComputedStyle(elm, null).getPropertyValue(css);
  }
}

// ========================================================

let lastSelectedRow;

document.onselectstart = function () {
  return false;
};

function toggleRow(row) {
  row.className = row.className === 'selected' ? '' : 'selected';
  row.style.backgroundColor = '#B6BBD1';
  lastSelectedRow = row;
}

function selectRowsBetweenIndexes(indexes, tabela) {
  indexes.sort(function (a, b) {
    return a - b;
  });

  const trs = document
    .getElementById(tabela)
    .tBodies[0].getElementsByTagName('tr');

  for (let i = indexes[0]; i <= indexes[1]; i++) {
    trs[i - 1].className = 'selected';
    trs[i - 1].style.backgroundColor = '#B6BBD1';
  }
}

function clearAll(tabela) {
  const trs = document
    .getElementById(tabela)
    .tBodies[0].getElementsByTagName('tr');

  for (let i = 0; i < trs.length; i++) {
    trs[i].className = '';
    trs[i].style.backgroundColor = '#fafafa';
  }
}

export function RowClick(currenttr, tabela) {
  if (window.event.ctrlKey) {
    toggleRow(currenttr);
  }

  if (window.event.button === 0) {
    if (!window.event.ctrlKey && !window.event.shiftKey) {
      clearAll(tabela);
      toggleRow(currenttr);
    }

    if (window.event.shiftKey) {
      selectRowsBetweenIndexes(
        [lastSelectedRow.rowIndex, currenttr.rowIndex],
        tabela
      );
    }
  }
}
