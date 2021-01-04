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

import {Date} from "./date";
import {Navigator} from "./navigator";
import {Locale} from "./locale";

var local = {
  Date,
  Navigator,
  Locale
};

(function(DayPilot) {
  'use strict';

  if (typeof DayPilot.DatePicker !== 'undefined') {
    return;
  }

  DayPilot.DatePicker = function(properties) {
    this.v = '${v}';
    var navigatorId = "navigator_" + new Date().getTime();
    var This = this;

    this.onShow = null;
    this.onTimeRangeSelect = null;
    this.onTimeRangeSelected = null;

    this.prepare = function() {
      this.locale = "en-us";
      this.target = null;
      this.targetAlignment = "left";
      this.resetTarget = true;
      this.pattern = this._resolved.locale().datePattern;    // "M/d/yyyy"
      //this.cssClassPrefix = null;
      this.theme = "navigator_default";
      this.patterns = [];
      this.zIndex = null;

      // load settings
      if (properties) {
        for (var name in properties) {
          this[name] = properties[name];
        }
      }
      this.init();
    };

    this.init = function() {
      this.date = new DayPilot.Date(this.date);

      var value = this._readFromTarget();

      if (this.resetTarget && !value) {
        this._writeToTarget(this.date);
      }
      else if (!this.resetTarget) {
        This.date = value;
      }

      var target = this._element();
      if (target) {
        target.addEventListener("input", function() {
          This.date = This._readFromTarget();
          if (This.date) {
            This.navigator.select(This.date, {dontNotify: true});
          }
        });
      }

      document.addEventListener("mousedown", function() {
        This.close();
      });

      return this;

    };

    this.close = function() {
      if (!this._visible) {
        return;
      }

      this._visible = false;

      if (this.navigator) {
        this.navigator.dispose();
      }
      this.div.innerHTML = '';
      if (this.div && this.div.parentNode === document.body) {
        document.body.removeChild(this.div);
      }
    };

    this.setDate = function(date) {
      this.date = new DayPilot.Date(date);
      this._writeToTarget(this.date);
    };

    this._readFromTarget = function() {
      // recognized targets: input (value), other DOM elements (innerHTML)
      var element = this._element();

      if (!element) {
        return this.date;
      }

      var value = null;
      if (element.tagName === "INPUT") {
        value = element.value;
      }
      else {
        value = element.innerText;
      }

      if (!value) {
        return null;
      }

      var date = DayPilot.Date.parse(value, This.pattern);
      for (var i = 0; i < This.patterns.length; i++) {
        if (date) {
          return date;
        }
        date = DayPilot.Date.parse(value, This.patterns[i]);
      }

      return date;
    };

    this._writeToTarget = function(date) {
      var element = this._element();

      if (!element) {
        return;
      }

      var value = date.toString(This.pattern, This.locale);
      if (element.tagName === "INPUT") {
        element.value = value;
      }
      else {
        element.innerHTML = value;
      }

    };

    this._resolved = {};
    this._resolved.locale = function() {
      return DayPilot.Locale.find(This.locale);
    };

    this._element = function() {
      var id = this.target;
      // accept DOM element or id (string)
      var element = (id && id.nodeType && id.nodeType === 1 ) ? id : document.getElementById(id);
      return element;
    };

    Object.defineProperty(this, "visible", {
      get: function() { return This._visible; }
    });

    this.show = function() {

      if (this._visible) {
        return;
      }

      var element = this._element();
      var navigator = this.navigator;

      var navigator = new DayPilot.Navigator(navigatorId);
      navigator.api = 2;
      navigator.cssOnly = true;
      navigator.theme = This.theme;
      navigator.weekStarts = "Auto";
      navigator.locale = This.locale;
      navigator.onTimeRangeSelected = function(args) {
        This.date = args.start;

        var start = args.start.addTime(navigator._pickerTimePart);
        var value = start.toString(This.pattern, This.locale);

        var args = {};
        args.start = start;
        args.date = start;
        args.preventDefault = function() {
          this.preventDefault.value = true;
        };

        if (typeof This.onTimeRangeSelect ===  'function') {
          This.onTimeRangeSelect(args);
          if (args.preventDefault.value) {
            return;
          }
        }

        This._writeToTarget(value);
        This.close();

        if (typeof This.onTimeRangeSelected === 'function') {
          This.onTimeRangeSelected(args);
        }
      };

      this.navigator = navigator;

      var position = abs(element);
      var height = element.offsetHeight;

      var align = This.targetAlignment;

      var div = document.createElement("div");
      div.style.position = "absolute";

      if (align === "left") {
        div.style.left = position.x + "px";
      }


      div.style.top = (position.y + height) + "px";
      if (This.zIndex) {
        div.style.zIndex = This.zIndex;
      }

      var nav = document.createElement("div");
      nav.id = navigatorId;
      div.appendChild(nav);

      div.addEventListener("mousedown", function(ev) {
        var ev = ev || window.event;
        ev.cancelBubble = true;
        ev.stopPropagation && ev.stopPropagation();
      });

      document.body.appendChild(div);

      this.div = div;

      var selected = This._readFromTarget() || new DayPilot.Date().getDatePart();

      navigator.startDate = selected;
      navigator._pickerTimePart = selected.getTimePart();
      // navigator.selectionStart = selected.getDatePart();
      navigator.selectionDay = selected.getDatePart();
      navigator.init();

      if (align === "right") {
        var left = (position.x + element.offsetWidth - navigator.nav.top.offsetWidth);
        div.style.left = left + "px";
      }

      this._visible = true;
      if (this.onShow) {
        this.onShow();
      }
    };

    this.prepare();
  };

  // absolute element position on page
  function abs(element, visible) {
    if (!element) {
      return null;
    }

    if (!document.body.contains(element)) {
      return null;
    }
    if (element.getBoundingClientRect) {
      var r = absBoundingClientBased(element);

      if (visible) {
        // use diff, absOffsetBased is not as accurate
        var full = absOffsetBased(element, false);
        var visible = absOffsetBased(element, true);

        r.x += visible.x - full.x;
        r.y += visible.y - full.y;
        r.w = visible.w;
        r.h = visible.h;
      }

      return r;
    }
    else {
      return absOffsetBased(element, visible);
    }
  }

  function absBoundingClientBased(element) {
    var elemRect = element.getBoundingClientRect();

    return {
      x: elemRect.left + window.pageXOffset,
      y: elemRect.top + window.pageYOffset,
      w: element.clientWidth,
      h: element.clientHeight,
      toString: function() {
        return "x:" + this.x + " y:" + this.y + " w:" + this.w + " h:" + this.h;
      }
    };
  }

  function absOffsetBased(element, visible) {
    var r = {
      x: element.offsetLeft,
      y: element.offsetTop,
      w: element.clientWidth,
      h: element.clientHeight,
      toString: function() {
        return "x:" + this.x + " y:" + this.y + " w:" + this.w + " h:" + this.h;
      }
    };

    while (op(element)) {
      element = op(element);

      r.x -= element.scrollLeft;
      r.y -= element.scrollTop;

      if (visible) {  // calculates the visible part
        if (r.x < 0) {
          r.w += r.x; // decrease width
          r.x = 0;
        }

        if (r.y < 0) {
          r.h += r.y; // decrease height
          r.y = 0;
        }

        if (element.scrollLeft > 0 && r.x + r.w > element.clientWidth) {
          r.w -= r.x + r.w - element.clientWidth;
        }

        if (element.scrollTop && r.y + r.h > element.clientHeight) {
          r.h -= r.y + r.h - element.clientHeight;
        }
      }

      r.x += element.offsetLeft;
      r.y += element.offsetTop;

    }

    var pageOffset = pageOffset();
    r.x += pageOffset.x;
    r.y += pageOffset.y;

    return r;
  }

  function op(element) {
    try {
      return element.offsetParent;
    }
    catch (e) {
      return document.body;
    }
  }

  function pageOffset() {
    if (typeof window.pageXOffset !== 'undefined') {
      return {x: window.pageXOffset, y: window.pageYOffset};
    }
    //return { x: 0, y: 0};
    var d = doc();
    return {x: d.scrollLeft, y: d.scrollTop};
  }

  // document element
  function doc() {
    var de = document.documentElement;
    return (de && de.clientHeight) ? de : document.body;
  }

})(local);

const {DatePicker} = local;

export {DatePicker};
