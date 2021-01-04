/**
 * Created on 2020-08-14.
 */

const local = {};

(function (DayPilot) {
  'use strict';

  if (DayPilot.Table) {
    return;
  }

  var Table = function(options) {

    this.form = null;
    this.data = null;
    this.name = null;
    this.theme = "edit_table_default";

    this.nav = {};

    this._activeEdit = null;
    this._rows = [];

    options = options || {};

    for (var name in options) {
      this[name] = options[name];
    }

  };

  Table.prototype.create = function() {
    var table = this;

    var div = document.createElement("div");
    div.className = this.theme + "_main";
    div.style.position = "relative";

    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = table.name;
    hidden.table = this;
    div.appendChild(hidden);

    var tableElement = document.createElement("div");
    tableElement.className = this.theme + "_table";
    var header = this._createHeader();
    tableElement.appendChild(header);

    var spacerRow = table._createRowState({});
    spacerRow.spacer = true;
    var spacer = this._renderRow(spacerRow);
    // spacer.style.visibility = "hidden";
    spacer.classList.add(table.theme + "_spacer");
    tableElement.appendChild(spacer);

    var body = document.createElement("div");
    body.className = table.theme + "_tbody";
    tableElement.appendChild(body);

    div.appendChild(tableElement);

    var after = document.createElement("div");
    div.appendChild(after);

    this.nav.body = body;
    this.nav.table = tableElement;
    this.nav.main = div;
    this.nav.after = after;

    var add = document.createElement("div");
    var plus = document.createElement("span");
    plus.className = this.theme + "_plus";

    plus.addEventListener("click", function(ev) {
      if (table.disabled) {
        return;
      }
      var row = table._createRowState({});
      table._rows.push(row);
      table._render();
    });

    add.appendChild(plus);
    div.appendChild(add);

    return div;
  };

  Table.prototype._createHeader = function() {
    var table = this;
    var row = document.createElement("div");
    row.classList.add(this.theme + "_row");
    row.classList.add(this.theme + "_header");
    this.form.forEach(function(item) {
      var cell = document.createElement("div");
      cell.classList.add(table.theme + "_cell");
      cell.innerText = item.name;
      row.appendChild(cell);
    });
    return row;
  };


  Table.prototype.save = function() {
    var table = this;
    var data = [];

    table._rows.forEach(function(row) {
      var item = {};
      row.cells.forEach(function(cell) {
        item[cell.id] = cell.value;
      });
      data.push(item);
    });

    return data;
  };

  Table.prototype.load = function(data) {
    var table = this;

    var isArray = Object.prototype.toString.call(data) === '[object Array]';
    if (!isArray) {
      throw new Error("Array expected");
    }

    this.data = data;

    this._createState();
    this._render();
  };

  Table.prototype._updateCss = function() {
    if (this.disabled) {
      this.nav.main.classList.add(this.theme + "_disabled");
    }
    else {
      this.nav.main.classList.remove(this.theme + "_disabled");
    }
  };

  Table.prototype._createState = function() {
    var table = this;
    this._rows = [];
    this.data.forEach(function(dataRow) {
      var row = table._createRowState(dataRow);
      table._rows.push(row);
    });
  };

  Table.prototype._removeRow = function(row) {
    var table = this;

    var index = table._rows.indexOf(row);
    table._rows.splice(index, 1);
  };

  Table.prototype._createRowState = function(dataRow) {
    var table = this;

    var row = {};
    row.data = dataRow;
    row.cells = [];

    table.form.forEach(function(formItem) {
      var id = formItem.id;
      var value = dataRow[id];

      var type = table._formItemType(formItem);
      if (typeof value === "undefined") {
        if (type === "text") {
          value = "";
        }
        else if (type === "number") {
          value = 0;
        }
        else if (type === "select") {
          var options = formItem.options;
          value = options && options[0].id;
        }
      }

      var cell = {};
      cell.id = id;
      cell.value = value;
      cell.type = type;
      cell.data = formItem;
      row.cells.push(cell);
    });

    return row;
  };

  Table.prototype._formItemType = function(formItem) {
    var type = formItem.type;
    if (!type) {
      if (formItem.options) {
        type = "select";
      }
      else {
        type = "text";
      }
    }
    return type;
  };

  Table.prototype._render = function() {
    var table = this;
    this.nav.body.innerHTML = "";
    this.nav.after.innerHTML = "";

    this._rows.forEach(function(row) {
      var el = table._renderRow(row);
      table.nav.body.appendChild(el);
    });

    if (this._rows.length === 0) {
      var el = table._renderEmpty();
      table.nav.after.appendChild(el);
    }

    this._updateCss();
  };

  Table.prototype._renderEmpty = function() {
    var div = document.createElement("div");
    div.className = this.theme + "_empty";

    return div;
  };

  Table.prototype._renderRow = function(row) {
    var table = this;
    var el = document.createElement("div");
    el.className = table.theme + "_row";

    row.cells.forEach(function(cell) {

      var cellEl = document.createElement("div");
      cellEl.className = table.theme + "_cell";
      var interactive = table._renderCell(cell);

      if (row.spacer) {
        var wrap = document.createElement("div");
        wrap.style.height = "0px";
        wrap.style.overflow = "hidden";
        wrap.appendChild(interactive);

        cellEl.appendChild(wrap);
      }
      else {
        cellEl.appendChild(interactive);

      }

      el.appendChild(cellEl);
    });

    var cell = document.createElement("div");
    cell.classList.add(table.theme + "_cell");
    cell.classList.add(table.theme + "_rowaction");

    var span = document.createElement("span");
    span.className = this.theme + "_delete";

    span.addEventListener("click", function(ev) {
      if (table.disabled) {
        return;
      }
      table._removeRow(row);
      table._render();
    });

    if (!row.spacer) {
      cell.appendChild(span);
    }


    el.appendChild(cell);

    return el;
  };

  Table.prototype._renderCell = function(cell) {
    var table = this;
    var type = cell.type;
    if (type === "text" || type === "number") {
      var input = document.createElement("input");
      input.type = type;
      if (table.disabled) {
        input.disabled = true;
      }
      if (cell.value) {
        input.value = cell.value;
      }
      input.addEventListener("keyup", function(ev) {
        if (type === "number") {
          cell.value = Number(this.value);
        }
        else {
          cell.value = this.value;
        }
      });
      return input;
    }
    else if (type === "select") {
      var select = document.createElement("select");
      if (table.disabled) {
        select.disabled = true;
      }

      cell.data.options.forEach(function(item) {
        var option = document.createElement("option");
        option.innerText = item.name;
        option.value = item.id;
        option._originalValue = item.id;

        select.appendChild(option);

        if (cell.value === item.id) {
          option.setAttribute("selected", true);
        }
      });

      select.addEventListener("change", function(ev) {
        var option = select.options[select.selectedIndex];
        if (option && typeof option._originalValue !== "undefined") {
          cell.value = option._originalValue;
        }
      });

      return select;
    }

    throw new Error("Unsupported item type: " + type);
  };

  Table.prototype.focus = function() {
  };

  DayPilot.Table = Table;
})(local);

const {Table} = local;
export {Table};
