import {Searchable} from "./searchable";
import {DatePicker} from "./datepicker";
import {Date} from "./date";
import {Table} from "./table";

const local = {
  Date,
  DatePicker,
  Searchable,
  Table
};

(function (DayPilot) {
  'use strict';

  if (DayPilot.Form) {
    return;
  }

  var Form = function (options) {

    // properties
    this.form = [];
    this.data = {};
    this.theme = "form_default";
    this.zIndex = 99999;
    this.locale = "en-us";
    this.plugins = {};

    // events
    this.onKey = null;

    // state
    this._rows = [];
    this._newRows = null;
    this.canceling = false;

    this._validationTimeouts = [];

    // view
    this._views = [];
    this._div = null;

    options = options || {};

    for (var name in options) {
      this[name] = options[name];
    }
  };

  Form.prototype.create = function () {
    this.load();
    this.render();

    return this._div;
  };

  Form.prototype.render = function () {
    var form = this;
    this._div = document.createElement("div");
    this._rows.forEach(function (row) {
      form.createView(row);
    });
    this.applyState();
  };

  Form.prototype.createView = function (row) {
    var theme = this.theme;
    var form = this;

    var div = document.createElement("div");
    div.className = theme + "_form_item " + theme + "_form_item_level" + row.level;
    if (!row.interactive && row.type === "title") {
/*
      if (row.type === "title") {
        div.className += " " + theme + "_form_title";
      }
*/
      div.className += " " + theme + "_form_title";
    }
    else {
      div.className += " " + theme + "_form_item_" + row.type;
    }
    if (row.data.cssClass) {
      div.className += " " + row.data.cssClass;
    }

    if (!row.isValue) {
      var label = document.createElement("div");
      label.className = theme + "_form_item_label";
      label.innerText = row.text;
      div.appendChild(label);
    }

    var interactive = this.createInteractive(row);
    interactive.onInput = function(options) {
      options = options || {};
      form._validateInteractive(interactive, {
        "debounce": !options.immediate
      });
    };
    interactive.onBlur = function() {
      if (!form.canceling) {
        form._validateInteractive(interactive);
      }
    };
    interactive.apply(row);
    interactive._div = div;
    interactive._row = row;

    if (interactive.element) {
      div.appendChild(interactive.element);
    }

    this._views.push(interactive);

    this._div.appendChild(div);

  };

  Form.prototype.validate = function() {
    var form = this;
    var valid = true;
    this._views.forEach(function(interactive) {
      var iv = form._validateInteractive(interactive);
      valid = valid && iv;
    });
    return valid;
  };

  Form.prototype._validateInteractive = function(interactive, options) {
    options = options || {};
    var debounce = options.debounce;
    var silent = options.silent;


    var row = interactive._row;
    var valid = true;
    if (typeof row.data.validate === "function") {

      var args = {};
      args.valid = true;
      args.value = interactive.save()[row.field];
      args.message = "Error";
      args.values = this.serialize();

      row.data.validate(args);

      var cssClassInvalid = this.theme + "_form_item_invalid";
      var cssClassMessage = this.theme + "_form_item_invalid_message";
      if (args.valid) {
        clearTimeout(this._validationTimeouts[row.field]);

        if (interactive._errorMsg) {
          interactive._errorMsg.remove();
          interactive._errorMsg = null;
        }
        interactive._div.classList.remove(cssClassInvalid);
      }
      else {

        function showInvalid() {
          if (interactive._errorMsg) {
            interactive._errorMsg.remove();
            interactive._errorMsg = null;
          }

          interactive._div.classList.add(cssClassInvalid);
          var msg = document.createElement("div");
          msg.classList.add(cssClassMessage);
          msg.innerText = args.message;

          interactive._errorMsg = msg;

          interactive._div.appendChild(msg);
        }

        if (!silent) {
          if (debounce) {

            var debounceDelay = 1000;

            clearTimeout(this._validationTimeouts[row.field]);

            this._validationTimeouts[row.field] = setTimeout(function() {
              showInvalid();
            }, debounceDelay);
          }
          else {
            showInvalid();
          }

        }

      }
      valid = args.valid;
    }
    return valid;
  };

  Form.prototype.load = function () {
    // transform this.form + this.data into state (_rows)
    var t = this;
    this.form.forEach(function (item) {
      t.processFormItem(item, 0);
    });

    // sanity check (especially for circular references)
    try {
      JSON.stringify(this.data);
    }
    catch (e) {
      throw new Error("The 'data' object is not serializable: " + e);
    }

    var flat = flatten(this.data);

    // set values
    for (var name in flat) {
      this.setValue(name, flat[name]);
    }

    // set state depending on values
    // this.updateDependentState();
  };

  Form.prototype.setValue = function (name, value) {
    this._rows.forEach(function (row) {
      row.applyValue(name, value);
    });
  };

  Form.prototype.updateDependentState = function () {
    var form = this;
    var enabled = [true];

    var source = this._newRows ? this._newRows : this._rows;

    source.forEach(function (row) {

      var updatedRow = form.updateState(row, {
        enabled: enabled[row.level] && !row.data.disabled
      });

      if (updatedRow.isValue) {
        enabled[updatedRow.level + 1] = updatedRow.enabled && updatedRow.checked;
      }
    });
  };

  Form.prototype.processFormItem = function (item, level) {
    var form = this;
    var type = this.getFieldType(item);

    var rows = [];

    if (type === "radio") {

      if (item.name) {
        var row = new RowModel();
        row.field = item.id;
        row.data = item;
        row.level = level;
        row.type = "label";
        row.interactive = false;
        row.text = item.name;
        form._rows.push(row);
        rows.push(row);
      }

      item.options.forEach(function (option) {
        var row = new RowModel();
        row.field = item.id;
        row.data = option;
        row.level = level;
        row.type = type;
        row.isValue = true;
        row.text = option.name;
        row.resolved = option.id;
        form._rows.push(row);
        rows.push(row);

        if (option.children) {
          option.children.forEach(function (child) {
            var childRows = form.processFormItem(child, level + 1);
            rows = rows.concat(childRows);
          })
        }
      });
    }
    else if (type === "title") {
      var row = new RowModel();
      row.field = item.id;
      row.data = item;
      row.level = level;
      row.type = type;
      row.interactive = false;
      row.text = item.name;
      form._rows.push(row);
      rows.push(row);
    }
    else if (type === "image") {
      var row = new RowModel();
      row.isValue = true;
      row.field = item.id;
      row.data = item;
      row.level = level;
      row.type = type;
      row.interactive = false;
      row.text = null;
      form._rows.push(row);
      rows.push(row);
    }
    else if (type === "html") {
      var row = new RowModel();
      row.isValue = true;
      row.field = item.id;
      row.data = item;
      row.level = level;
      row.type = type;
      row.interactive = false;
      row.text = null;
      form._rows.push(row);
      rows.push(row);
    }
    else if (type === "scrollable") {
      var row = new RowModel();
      row.isValue = true;
      row.field = item.id;
      row.data = item;
      row.level = level;
      row.type = type;
      row.interactive = false;
      row.text = null;
      form._rows.push(row);
      rows.push(row);
    }
    else {
      var row = new RowModel();
      row.field = item.id;
      row.data = item;
      row.level = level;
      row.type = type;
      row.text = item.name;
      row.children = [];
      form._rows.push(row);
      rows.push(row);
    }

    if (type === "checkbox") {
      row.isValue = true;
      row.resolved = true;

      if (item.children) {
        item.children.forEach(function (child) {
          var childRows = form.processFormItem(child, level + 1);
          rows = rows.concat(childRows);
        })
      }
    }

    return rows;

  };

  Form.prototype.doOnKey = function (key) {
    if (typeof this.onKey === "function") {
      var args = {
        key: key
      };
      this.onKey(args);
    }
  };

  Form.prototype.createInteractive = function (row) {
    var form = this;
    var views = {
      "label": function () {
        return new Interactive();
      },
      "title": function () {
        return new Interactive();
      },
      "image": function() {
        var interactive = new Interactive();

        var image = document.createElement("img");
        image.src = row.data.image;

        interactive.element = image;

        return interactive;
      },
      "html": function() {
        var interactive = new Interactive();

        var div = document.createElement("div");
        if (typeof row.data.text === "string") {
          div.innerText = row.data.text;
        }
        else if (typeof row.data.html === "string") {
          div.innerHTML = row.data.html;
        }

        interactive.element = div;

        return interactive;
      },
      "scrollable": function() {
        var interactive = new Interactive();

        var scroll = document.createElement("div");
        scroll.className = form.theme + "_form_item_scrollable_scroll";

        if (row.data.height) {
          scroll.style.height = row.data.height + "px";
        }

        var div = document.createElement("div");
        div.className = form.theme + "_form_item_scrollable_scroll_content";
        if (typeof row.data.text === "string") {
          div.innerText = row.data.text;
        }
        else if (typeof row.data.html === "string") {
          div.innerHTML = row.data.html;
        }

        scroll.appendChild(div);

        interactive.element = scroll;

        return interactive;
      },
      "text": function () {
        var interactive = new Interactive();
        interactive.apply = function (row) {
          interactive.row = row;

          var input = interactive.element;
          input.value = row.value;
          input.disabled = !row.enabled;
        };

        var input = document.createElement("input");
        input.name = row.field;
        input.type = "text";
        input.onkeydown = function (e) {
          var letcontinue = false;
          switch (e.keyCode) {
            case 13:
              form.doOnKey("Enter");
              break;
            case 27:
              form.doOnKey("Escape");
              break;
            default:
              letcontinue = true;
              break;
          }
          if (!letcontinue) {
            e.preventDefault();
            e.stopPropagation();
          }
        };

        input.oninput = function(e) {
          interactive.onInput();
        };
        input.onblur = function(e) {
          interactive.onBlur();
        }

        interactive.element = input;
        interactive.canFocus = function() {
          return !interactive.element.disabled;
        };
        interactive.focus = function () {
          interactive.element.focus();
          interactive.element.setSelectionRange(0, interactive.element.value.length);
        };
        interactive.save = function() {
          var result = {};
          result[row.field] = input.value;
          return result;
        };

        return interactive;
      },
      "textarea": function () {
        var interactive = new Interactive();
        interactive.apply = function (row) {
          interactive.row = row;

          var input = interactive.element;
          input.value = row.value;
          input.disabled = !row.enabled;
        };

        var textarea = document.createElement("textarea");
        textarea.name = row.field;
        if (row.data.height) {
          textarea.style.height = row.data.height + "px";
        }
        // input.type = "text";
        textarea.onkeydown = function (e) {
          var letcontinue = false;
          switch (e.keyCode) {
            case 13:
              // form.doOnKey("Enter");
              letcontinue = false;
              break;
            case 27:
              form.doOnKey("Escape");
              break;
            default:
              letcontinue = true;
              break;
          }
          if (!letcontinue) {
            e.preventDefault();
            e.stopPropagation();
          }
        };

        textarea.oninput = function(e) {
          interactive.onInput();
        };
        textarea.onblur = function(e) {
          interactive.onBlur();
        }

        interactive.element = textarea;
        interactive.canFocus = function() {
          return !interactive.element.disabled;
        };
        interactive.focus = function () {
          interactive.element.focus();
          interactive.element.setSelectionRange(0, 0);
        };
        interactive.save = function() {
          var result = {};
          result[row.field] = textarea.value;
          return result;
        };

        return interactive;
      },
      "date": function () {
        var interactive = new Interactive();
        interactive.apply = function (row) {
          interactive.row = row;
          var input = interactive.element;
          var picker = interactive.picker;

          if (row.data.dateFormat) {
            picker.pattern = row.data.dateFormat;
          }
          var locale = row.data.locale || form.locale;
          if (locale) {
            picker.locale = locale;
          }

          input.disabled = !row.enabled;

          picker.date = new DayPilot.Date(row.value);
          var formatted = new DayPilot.Date(row.value).toString(row.data.dateFormat || picker.pattern, picker.locale);
          input.value = formatted;
        };

        var input = document.createElement("input");
        input.name = row.field;

        var picker = new DayPilot.DatePicker({
          target: input,
          theme: "navigator_modal",
          zIndex: form.zIndex + 1,
          resetTarget: false,
          targetAlignment: "left",
          onTimeRangeSelect: function(args) {
            interactive.onInput({"immediate": true});
          }
        });

        // required for serialization - to get the normalized value
        input.picker = picker;
        input.className = form.theme + "_input_date";
        input.type = "text";
        input.onkeydown = function (e) {
          var letcontinue = false;
          switch (e.keyCode) {
            case 13:  // enter
              if (picker.visible) {
                picker.close();
              } else {
                form.doOnKey("Enter");
              }
              break;
            case 27: // escape
              if (picker.visible) {
                picker.close();
              } else {
                form.doOnKey("Escape");
              }
              break;
            case 9:  // tab
              picker.close();
              letcontinue = true;
              break;
            default:
              letcontinue = true;
              break;
          }
          if (!letcontinue) {
            e.preventDefault();
            e.stopPropagation();
          }
        };

        input.onfocus = function () {
          picker.show();
        };

        input.onclick = function () {
          picker.show();
        };

/*
        input.onblur = function () {
          // input.picker.close();
        };
*/

        input.oninput = function(e) {
          interactive.onInput();
        };
        input.onblur = function(e) {
          interactive.onBlur();
        }

        interactive.element = input;
        interactive.picker = picker;
        interactive.canFocus = function() {
          return !interactive.element.disabled;
        };
        interactive.focus = function () {
          interactive.element.focus();
        };
        interactive.save = function() {
          var value = picker.date ? picker.date.toString() : null;
          var result = {};
          result[row.field] = value;
          return result;
        };
        return interactive;
      },
      "select": function () {
        var interactive = new Interactive();
        interactive.apply = function (row) {
          interactive.row = row;
          var select = interactive.element;

          select.value = row.value;
          select.disabled = !row.enabled;
        };

        var select = document.createElement("select");
        select.name = row.field;

        if (row.data.options && row.data.options.forEach) {
          row.data.options.forEach(function (i) {
            var option = document.createElement("option");
            option.innerText = i.name || i.id;
            option.value = i.id;
            option._originalValue = i.id;
            select.appendChild(option);
          });
        }

        select.onchange = function(e) {
          interactive.onInput({"immediate": true});
        };
        select.onblur = function(e) {
          interactive.onBlur();
        };

        interactive.element = select;
        interactive.canFocus = function() {
          return !interactive.element.disabled;
        };
        interactive.focus = function () {
          interactive.element.focus();
        };
        interactive.save = function() {
          var value = null;
          var option = select.options[select.selectedIndex];
          if (option && typeof option._originalValue !== "undefined") {
            value = option._originalValue;
          }
          var result = {};
          result[row.field] = value;
          return result;
        };

        return interactive;

      },
      "searchable": function () {
        var interactive = new Interactive();
        interactive.apply = function (row) {
          interactive.row = row;
          var searchable = interactive.searchable;

          searchable.disabled = !row.enabled;
          searchable.select(row.value);
        };

        var searchable = new Searchable({
          data: row.data.options,
          name: row.field,
          theme: form.theme + "_form_item_searchable",
          listZIndex: form.zIndex + 1,
          // disabled: !row.enabled
          onSelect: function(args) {
            if (args.ui) {
              interactive.onInput({"immediate": true});
            }
          }
        });

        var element = searchable.create();

        interactive.element = element;
        interactive.searchable = searchable;
        interactive.canFocus = function() {
          return !interactive.searchable.disabled;
        };
        interactive.focus = function () {
          interactive.searchable.focus();
        };
        interactive.save = function() {
          var value = searchable.selected && searchable.selected.id;
          var result = {};
          result[row.field] = value;
          return result;
        };

        return interactive;
      },
      "radio": function () {
        var interactive = new Interactive();
        interactive.apply = function (row) {
          interactive.row = row;
          var radio = interactive.radio;

          radio.checked = row.checked;
          radio.disabled = !row.enabled;
        };

        var label = document.createElement("label");

        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = row.field;
        radio._originalValue = row.resolved;

        radio.onchange = function (ev) {
          // activation only

          var row = interactive.row;
          form.findRowsByField(row.field).forEach(function (row) {
            form.updateState(row, {
              checked: false
            });
          });
          form.updateState(row, {
            checked: true
          });

          form.applyState();

          interactive.onInput({"immediate": true});
        };

        radio.onblur = function(e) {
          interactive.onBlur();
        };

        label.appendChild(radio);

        var text = document.createTextNode(row.text);
        label.append(text);

        interactive.element = label;
        interactive.radio = radio;
        interactive.canFocus = function() {
          return false;
        };
        interactive.focus = function () {
          interactive.radio.focus();
        }
        interactive.save = function() {
          if (!radio.checked) {
            return {};
          }
          var value = radio._originalValue;
          var result = {};
          result[row.field] = value;
          return result;
        };

        return interactive;
      },
      "checkbox": function () {
        var interactive = new Interactive();
        interactive.apply = function (row) {
          interactive.row = row;
          var checkbox = interactive.checkbox;

          checkbox.checked = row.checked;
          checkbox.disabled = !row.enabled;
        };

        var label = document.createElement("label");

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = row.field;
        checkbox._originalValue = row.resolved;

        checkbox.onchange = function (ev) {
          var row = interactive.row;
          form.updateState(row, {
            checked: this.checked
          });
          form.applyState();

          interactive.onInput({"immediate": true});
        };

        checkbox.onblur = function(e) {
          interactive.onBlur();
        };

        label.appendChild(checkbox);

        var text = document.createTextNode(row.text);
        label.append(text);

        interactive.element = label;
        interactive.checkbox = checkbox;
        interactive.canFocus = function() {
          return false;
        };
        interactive.focus = function () {
          interactive.checkbox.focus();
        }
        interactive.save = function() {
          var value = checkbox.checked;
          var result = {};
          result[row.field] = value;
          return result;
        };

        return interactive;
      },
      "table": function() {
        var interactive = new Interactive();
        interactive.apply = function (row) {
          interactive.row = row;
          var table = interactive.table;

          table.disabled = !row.enabled;
          if (row.value) {
            table.load(row.value);
          }
        };

        var table = new Table({
          name: row.field,
          form: row.data.columns,
          theme: form.theme + "_form_item_tabular",
        });

        var element = table.create();

        interactive.element = element;
        interactive.table = table;
        interactive.canFocus = function() {
          // return !interactive.table.disabled;
          return false;
        };
        interactive.focus = function () {
          interactive.table.focus();
        };
        interactive.save = function() {
          var value = table.save();
          var result = {};
          result[row.field] = value;
          return result;
        };

        return interactive;
      }
    };
    if (form.plugins && form.plugins[row.type]) {
      return form.plugins[row.type](row);
    }
    return views[row.type]();
  };

  Form.prototype.findRowsByField = function (field) {
    return this._rows.filter(function (row) {
      return row.field === field;
    });
  };

  // ooptional value param applies to radio which can have multiple views, one for each value
  Form.prototype.findViewById = function (id, value) {
    return this._views.find(function (v) {
      if (v.row.field === id) {
        if (v.row.type === "radio") {
          return v.row.resolved === value;
        } else {
          return true;
        }
      }
      return false;
    });
  };

  Form.prototype.firstFocusable = function () {
    return this._views.find(function (v) {
      return v.canFocus && v.canFocus();
    });
  };

  Form.prototype.updateState = function (row, props) {
    var source = this._newRows ? this._newRows : this._rows;
    var index = source.indexOf(row);
    this._newRows = source.map(function (srow) {
      if (srow !== row) {
        return srow;
      }
      // our row
      if (row.propsEqual(props)) {
        return row;
      }
      var cloned = row.clone();
      for (var name in props) {
        cloned[name] = props[name];
      }
      return cloned;
    });
    return this._newRows[index];
  };

  // dirty row received, a member of _newRows
  Form.prototype.updateInteractive = function (row) {
    var index = this._newRows.indexOf(row);
    this._views[index].apply(row);
  };

  Form.prototype.applyState = function () {
    var form = this;

    this.updateDependentState();

    if (!this._newRows) {
      return;
    }

    var dirtyRows = this._newRows.filter(function (row, i) {
      return form._rows[i] !== row;
    });

    dirtyRows.forEach(function (row) {
      form.updateInteractive(row);
    });

    this._rows = this._newRows;

    this._newRows = null;
  };

  Form.prototype.getFieldType = function (item) {

    var known = ["text", "date", "select", "searchable", "radio", "checkbox", "table", "title", "image", "html", "textarea", "scrollable"];
    if (known.indexOf(item.type) !== -1) {
      return item.type;
    }

    if (item.type && this.plugins && this.plugins[item.type]) {
      return item.type;
    }

    if (item.image) {
      return "image";
    }

    if (item.html || item.text) {
      return "html";
    }

    if (!item.id) {
      return "title";
    }

    if (item.options) {
      return "searchable";
    }

    if (item.dateFormat) {
      return "date";
    }

    if (item.columns) {
      return "table";
    }

    return "text";
  };

  Form.prototype.serialize = function() {
      var result = {};

      this._views.forEach(function(interactive) {
        var out = interactive.save();
        for (var name in out) {
          result[name] = out[name];
        }
      });

      return result;
  };

  var RowModel = function () {
    this.id = this.guid();
    this.field = null;
    this.data = null;
    this.type = null;
    this.level = 0;
    this.enabled = true;
    this.value = null;
    this.text = null;

    this.interactive = true;

    this.isValue = false;
    this.checked = false;
    this.resolved = null;  // value resolves to
  };

  RowModel.prototype.clone = function () {
    var rm = new RowModel();
    for (var name in this) {
      if (name === "id") {
        continue;
      }
      rm[name] = this[name];
    }
    return rm;
  };

  RowModel.prototype.propsEqual = function (props) {
    for (var name in props) {
      if (this[name] !== props[name]) {
        return false;
      }
    }
    return true;
  };

  RowModel.prototype.guid = function () {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return ("" + S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  };

  RowModel.prototype.applyValue = function (name, value) {
    if (this.field !== name) {
      return;
    }
    this.value = value;
    if (this.isValue && value === this.resolved) {
      this.checked = true;
    }
  };

  var Interactive = function () {
    // this.row = row;
    this.element = null;

    // only used for autofocus
    this.canFocus = function() {
      return false;
    };
    this.apply = function (row) {
    };
    this.focus = function () {
    };
    this.save = function() {
      return {};
    }
  };

  function flatten(object, result, prefix) {
    result = result || {};
    prefix = prefix || "";
    for (var name in object) {
      var src = object[name];
      if (typeof src === "object") {
        if (Object.prototype.toString.call(src) === '[object Array]') {
          result[prefix + name] = src;
        }
        else if (src && src.toJSON) {
          result[prefix + name] = src.toJSON();
        }
        else {
          flatten(src, result, prefix + name + ".");
        }
      }
      else {
        result[prefix + name] = src;
      }
    }
    return result;
  }

  DayPilot.Form = Form;

})(local);

const {Form} = local;
export {Form};
