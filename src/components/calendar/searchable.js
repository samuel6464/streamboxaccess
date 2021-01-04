/*
Copyright (c) 2010 - 2020 Annpoint, s.r.o.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-------------------------------------------------------------------------

NOTE: Requires the following acknowledgement (see also NOTICE):

This product includes DayPilot Modal (https://modal.daypilot.org).

*/

const local = {};

(function (DayPilot) {
  'use strict';

  if (DayPilot.Searchable) {
    return;
  }

  var Searchable = function(options) {

    // properties
    this.data = [];
    this.name = null;
    this.theme = "searchable_default";
    this._disabled = false;
    this.listZIndex = 100000;


    // events
    this.onSelect = null;

    // state
    this._selected = null;
    this._highlighted = null;
    this._collapsed = false;
    // this._focused = false;
    // this._filter = null;

    // view
    this._input = null;
    this._list = null;
    this._options = [];
    this._hidden = null;

    options = options || {};

    var t = this;

    var specialHandling = {
      "selected": {
        post: function(val) {
          if (typeof val === "object" && val.id) {
            t._selected = val;
          }
          else if (typeof val === "string" || typeof val === "number") {
            t.select(val);
          }
        }
      }
    };

    Object.defineProperty(this, "selected", {
      get: function() {
        return this._selected;
      },
    });

    Object.defineProperty(this, "disabled", {
      get: function() {
        return this._disabled;
      },
      set: function(val) {
        this._disabled = val;
        if (this._input) {
          this._input.disabled = val;
          if (val) {
            // verify
            this._cancel();
          }
        }
      }
    });

    for (var name in options) {
      if (!specialHandling[name]) {
        this[name] = options[name];
      }
    }

    for (var name in options) {
      if (specialHandling[name]) {
        specialHandling[name].post(options[name]);
      }
    }

  };

  Searchable.prototype.select = function(id) {
    this._selected = this.data.find(function(item) { return item.id === id });
    this._doOnSelect(false);
    return this;
  };


  Searchable.prototype.create = function() {
    var component = this;
    var t = this;

    var div = document.createElement("div");
    div.className = this.theme + "_main";
    div.style.position = "relative";

    var icon = document.createElement("div");
    icon.className = this.theme + "_icon";
    icon.style.position = "absolute";
    icon.style.right = "0";
    icon.style.top = "0";
    icon.style.bottom = "0";
    icon.style.width = "20px";
    icon.addEventListener("mousedown", function(ev) {
      ev.preventDefault();
      if (component._collapsed) {
        component.focus();
        expand();
      }
      else {
        cancel();
        collapse();
      }
    });

    var list = document.createElement("div");
    list.className = this.theme + "_list";
    list.style.display = "none";
    list.style.position = "absolute";
    list.style.zIndex = this.listZIndex;

    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = this.name;
    hidden.searchable = t;
    this._hidden = hidden;

    var input = document.createElement("input");
    input.type = "text";
    input.className = this.theme + "_input";
    input.disabled = this._disabled;
    input.addEventListener("click", function(ev) {
      expand();
    });
    input.addEventListener("focus", function(ev) {
      // do not call expand() here, the readonly status has to stay
      input.value = "";
      filter();
    });
    input.addEventListener("input", function(ev) {
      filter();
    });
    input.addEventListener("blur", function(ev) {
      input.removeAttribute("readonly");
      cancel();
    });

    input.addEventListener("keydown", function(ev) {
      if (component._collapsed) {
        if (ev.key === "Enter") {
          return;
        }
        if (ev.key === "Esc" || ev.key === "Escape") {
          return;
        }
        expand();
      }

      if (ev.key === "ArrowDown") {
        var index = t._options.indexOf(t._highlighted);
        if (index + 1 < t._options.length) {
          t._highlighted = t._options[index + 1];
        }
        updateHiglight();
      } else if (ev.key === "ArrowUp") {
        var index = t._options.indexOf(t._highlighted);
        if (index - 1 >= 0) {
          t._highlighted = t._options[index - 1];
        }
        updateHiglight();
      } else if (ev.key === "Enter") {
        if (component._highlighted) {
          ev.stopPropagation();
          selectOption(component._highlighted);
        }
        else {
          ev.stopPropagation();
          // t._cancel();
          cancel();
          collapse();
        }
      } else if (ev.key === "Esc" || ev.key === "Escape") {
        ev.stopPropagation();
        cancel();
        collapse();
      }
    });
    this._input = input;
    this._list = list;

    if (!this._selected) {
      this._selected = this.data[0];
      if (this._selected) {
        input.value = this._selected.name;
      }
    }

    function filter() {
      // component._collapsed = false;

      list.style.display = "";
      list.style.top = input.offsetHeight + "px";
      list.style.left = "0px";
      list.style.width = input.offsetWidth + "px";
      list.innerHTML = "";

      // allow scrollbar access
      list.addEventListener("mousedown", function(ev) {
        ev.preventDefault();
      });

      component._highlighted = null;

      component._options = [];

      var first = null;

      component.data.forEach(function(item) {

        var name = item.name || item.id;

        if (name.toLowerCase().indexOf(input.value.toLowerCase()) === -1) {
          return;
        }

        var option = document.createElement("div");
        option.className = component.theme + "_list_item";
        option.innerText = name;

        option.item = item;

        if (item === component._selected) {
          component._highlighted = option;
        }
        if (!first) {
          first = option;
        }

        // "mousedown" goes before blur, "click" goes after
        option.addEventListener("mousedown", function(ev) {
          selectOption(option);
          ev.preventDefault();
        });

        option.addEventListener("mousemove", function(ev) {
          if (component._highlighted === option) {
            return;
          }
          component._highlighted = option;
          updateHiglight({dontScroll: true});
        });

        list.appendChild(option);

        component._options.push(option);
      });

      if (!component._highlighted) {
        component._highlighted = first;
      }
      updateHiglight();
    }

    function updateHiglight(options) {
      options = options || {};
      var scrollIntoView = !options.dontScroll;

      // redo, avoid selectors
      var previous = document.querySelectorAll("." + component.theme + "_list_item_highlight");
      previous.forEach(function(p) {
        p.className = p.className.replace(component.theme + "_list_item_highlight", "");
      });

      if (component._highlighted) {
        component._highlighted.className += " " + component.theme + "_list_item_highlight";

        if (scrollIntoView && !isScrolledIntoView(component._highlighted, list)) {
          component._highlighted.scrollIntoView();
        }
      }
    }

    function isScrolledIntoView(target, viewport) {
      var tRect = target.getBoundingClientRect();
      var vRect = viewport.getBoundingClientRect();
      return tRect.top >= vRect.top && tRect.bottom <= vRect.bottom;
    }

    function selectOption(option) {
      var item = option.item;

      // input.value = option.innerText;
      component._selected = item;
      component._doOnSelect(true);
      hide();
      collapse();
    }

    function cancel() {
      component._cancel();
    }

    function hide() {
      component._hide();
    }

    function collapse() {
      component._collapsed = true;
      input.setAttribute("readonly", "readonly");
      input.focus();
    }

    function expand() {
      component._collapsed = false;
      input.removeAttribute("readonly");
      input.value = "";
      filter();
    }

    div.appendChild(input);
    div.appendChild(icon);
    div.appendChild(hidden);
    div.appendChild(list);
    return div;
  };

  Searchable.prototype._cancel = function() {
    this._hide();
    if (!this._selected) {
      this._input.value = "";
      // not sure about this:
      this._doOnSelect(true);
    } else {
      this._input.value = this._selected.name;
    }
    // collapse();
  }

  Searchable.prototype.focus = function() {
      // this._input.focus();

    this._collapsed = true;
    this._input.setAttribute("readonly", "readonly");
    this._input.focus();
    this._cancel();
  };

  Searchable.prototype._hide = function() {
    this._list.style.display = "none";
  };

  Searchable.prototype._doOnSelect = function(byUser) {
    this._hidden.value = this.selected ? this.selected.id : null;
    if (this._selected) {
      this._input.value = this._selected.name;
    }
    else {
      this._input.value = "";
    }

    if (typeof this.onSelect === "function") {
      var args = {
        control: this,
        ui: byUser
      };
      this.onSelect(args);
    }
  };

  DayPilot.Searchable = Searchable;

})(local);

const {Searchable} = local;
export {Searchable};
