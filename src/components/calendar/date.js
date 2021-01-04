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

import {Locale} from "./locale";

const local = {
  Locale
};

(function(DayPilot) {

  if (typeof DayPilot.Date !== "undefined") {
    return;
  }

  var isNullOrUndefined = function(val) {
    return val === null || typeof val === "undefined";
  };

  DayPilot.Duration = function(ticks) {
    var d = this;

    var day = 1000*60*60*24.0;
    var hour = 1000*60*60.0;
    var minute = 1000*60.0;
    var second = 1000.0;

    if (arguments.length === 2) {
      var start = arguments[0];
      var end = arguments[1];

      if (!(start instanceof DayPilot.Date) && (typeof start !== "string")) {
        throw "DayPilot.Duration(): Invalid start argument, DayPilot.Date expected";
      }
      if (!(end instanceof DayPilot.Date) && (typeof end !== "string")) {
        throw "DayPilot.Duration(): Invalid end argument, DayPilot.Date expected";
      }
      if (typeof start === "string") {
        start = new DayPilot.Date(start);
      }
      if (typeof end === "string") {
        end = new DayPilot.Date(end);
      }
      ticks = end.getTime() - start.getTime();
    }

    this.ticks = ticks;

    // caching, allows direct comparison
    if (DayPilot.Date.Cache.DurationCtor["" + ticks]) {
      return DayPilot.Date.Cache.DurationCtor["" + ticks];
    }
    DayPilot.Date.Cache.DurationCtor["" + ticks] = this;

    this.toString = function(pattern) {
      if (!pattern) {
        return d.days() + "." + d.hours() + ":" + d.minutes() + ":" + d.seconds() + "." + d.milliseconds();
      }

      var minutes = d.minutes();
      minutes = (minutes < 10 ? "0" : "") + minutes;

      // dumb replacement
      var result = pattern;
      result = result.replace("mm", minutes);
      result = result.replace("m", d.minutes());
      result = result.replace("H", d.hours());
      result = result.replace("h", d.hours());
      result = result.replace("d", d.days());
      result = result.replace("s", d.seconds());
      return result;
    };

    this.totalHours = function() {
      return d.ticks / hour;
    };

    this.totalDays = function() {
      return d.ticks / day;
    };

    this.totalMinutes = function() {
      return d.ticks / minute;
    };

    this.totalSeconds = function() {
      return d.ticks / second;
    };

    this.days = function() {
      return Math.floor(d.totalDays());
    };

    this.hours = function() {
      var hourPartTicks = d.ticks - d.days()*day;
      return Math.floor(hourPartTicks/hour);
    };

    this.minutes = function() {
      var minutePartTicks = d.ticks - Math.floor(d.totalHours()) * hour;
      return Math.floor(minutePartTicks/minute);
    };

    this.seconds = function() {
      var secondPartTicks = d.ticks - Math.floor(d.totalMinutes()) * minute;
      return Math.floor(secondPartTicks/second);
    };

    this.milliseconds = function() {
      return d.ticks % second;
    };

  };

  DayPilot.Duration.weeks = function(i) {
    return new DayPilot.Duration(i * 1000*60*60*24*7);
  };

  DayPilot.Duration.days = function(i) {
    return new DayPilot.Duration(i * 1000*60*60*24);
  };

  DayPilot.Duration.hours = function(i) {
    return new DayPilot.Duration(i * 1000*60*60);
  };

  DayPilot.Duration.minutes = function(i) {
    return new DayPilot.Duration(i * 1000*60);
  };

  DayPilot.Duration.seconds = function(i) {
    return new DayPilot.Duration(i * 1000);
  };

  // alias to DayPilot.Duration
  // disabled, doesn't work with caching
  DayPilot.TimeSpan = function() {

    throw "Please use DayPilot.Duration class instead of DayPilot.TimeSpan.";
    // DayPilot.Duration.apply(this, arguments);
  };
  try {
    DayPilot.TimeSpan.prototype = Object.create(DayPilot.Duration.prototype);  // make instanceof work
  }
  catch (e) {}  // doesn't work in IE8

  // DayPilot.TimeSpan.prototype.constructor = DayPilot.TimeSpan;  // not necessary, it's an alias, not an inherited class

  /* Date utils */

  // DayPilot.Date class
  /* Constructor signatures:

   -- new DayPilot.Date(date, isLocal)
   date - JavaScript Date object
   isLocal - true if the local time should be taken from date, otherwise GMT base is used

   -- new DayPilot.Date() - returns now, using local date

   -- new DayPilot.Date(string)
   string - date in ISO 8601 format, e.g. 2009-01-01T00:00:00

   */
  DayPilot.Date = function(date, readLocal) {

    if (date instanceof DayPilot.Date) { // it's already a DayPilot.Date object, return it (no copy)
      return date;
    }

    var ticks;

    if (isNullOrUndefined(date)) {  // date not set, use NOW
      ticks = DayPilot.DateUtil.fromLocal().getTime();
      date = ticks;
    }

    var cache = DayPilot.Date.Cache.Ctor;
    if (cache[date]) {
      return cache[date];
    }

    var isString = false;

    if (typeof date === "string") {
      try {
        ticks = DayPilot.DateUtil.fromStringSortable(date, readLocal).getTime();
      }
      catch (e) {
        throw new Error("DayPilot.Date - Unable to parse ISO8601 date/time string: " + date);
      }

      isString = true;
    }
    else if (typeof date === "number") {
      if (isNaN(date)) {
        throw "Cannot create DayPilot.Date from NaN";
      }
      ticks = date;
    }
    else if (date instanceof Date) {
      if (readLocal) {
        ticks = DayPilot.DateUtil.fromLocal(date).getTime();
      }
      else {
        ticks = date.getTime();
      }
    }
    else {
      throw "Unrecognized parameter: use Date, number or string in ISO 8601 format";
    }

    var value = ticksToSortable(ticks); // normalized value

    if (cache[value]) {
      return cache[value];
    }

    cache[value] = this;
    cache[ticks] = this;
    if (isString && value !== date  && DayPilot.DateUtil.hasTzSpec(date)) {  // don't cache strings with TZ spec
      cache[date] = this;
    }

    if (Object.defineProperty) {
      Object.defineProperty(this, "ticks", {
        get: function() { return ticks; }
      });
      Object.defineProperty(this, "value", {
        "value": value,
        "writable": false,
        "enumerable": true
      });
    }
    else {
      this.ticks = ticks;
      this.value = value;
    }

    if (DayPilot.Date.Config.legacyShowD) {
      this.d = new Date(ticks);
    }

  };

  DayPilot.Date.Config = {};
  DayPilot.Date.Config.legacyShowD = false;

  DayPilot.Date.Cache = {};
  DayPilot.Date.Cache.Parsing = {};
  DayPilot.Date.Cache.Ctor = {};
  DayPilot.Date.Cache.Ticks = {};
  DayPilot.Date.Cache.DurationCtor = {};

  DayPilot.Date.Cache.clear = function() {
    DayPilot.Date.Cache.Parsing = {};
    DayPilot.Date.Cache.Ctor = {};
    DayPilot.Date.Cache.Ticks = {};
    DayPilot.Date.Cache.DurationCtor = {};
  };


  DayPilot.Date.prototype.addDays = function(days) {
    if (!days) {
      return this;
    }
    return new DayPilot.Date(this.ticks + days * 24 * 60 * 60 * 1000);
  };

  DayPilot.Date.prototype.addHours = function(hours) {
    if (!hours) {
      return this;
    }
    return this.addTime(hours * 60 * 60 * 1000);
  };

  DayPilot.Date.prototype.addMilliseconds = function(millis) {
    if (!millis) {
      return this;
    }
    return this.addTime(millis);
  };

  DayPilot.Date.prototype.addMinutes = function(minutes) {
    if (!minutes) {
      return this;
    }
    return this.addTime(minutes * 60 * 1000);
  };

  DayPilot.Date.prototype.addMonths = function(months) {
    if (!months) {
      return this;
    }

    var date = new Date(this.ticks);

    var y = date.getUTCFullYear();
    var m = date.getUTCMonth() + 1;

    if (months > 0) {
      while (months >= 12) {
        months -= 12;
        y++;
      }
      if (months > 12 - m) {
        y++;
        m = months - (12 - m);
      }
      else {
        m += months;
      }
    }
    else {
      while (months <= -12) {
        months += 12;
        y--;
      }
      if (m + months <= 0) {  //
        y--;
        m = 12 + m + months;
      }
      else {
        m = m + months;
      }
    }

    var d = new Date(date.getTime());
    d.setUTCDate(1);
    d.setUTCFullYear(y);
    d.setUTCMonth(m - 1);

    //var max = DayPilot.Date.daysInMonth(y, m);
    var max = new DayPilot.Date(d).daysInMonth();
    d.setUTCDate(Math.min(max, date.getUTCDate()));

    return new DayPilot.Date(d);
  };

  DayPilot.Date.prototype.addSeconds = function(seconds) {
    if (!seconds) {
      return this;
    }
    return this.addTime(seconds * 1000);
  };

  DayPilot.Date.prototype.addTime = function(ticks) {
    if (!ticks) {
      return this;
    }
    if (ticks instanceof DayPilot.Duration) {
      ticks = ticks.ticks;
    }
    return new DayPilot.Date(this.ticks + ticks);
  };

  DayPilot.Date.prototype.addYears = function(years) {
    var original = new Date(this.ticks);
    var d = new Date(this.ticks);
    var y = this.getYear() + years;
    var m = this.getMonth();

    d.setUTCDate(1);
    d.setUTCFullYear(y);
    d.setUTCMonth(m);

    //var max = DayPilot.Date.daysInMonth(y, m + 1);
    var max = new DayPilot.Date(d).daysInMonth();
    d.setUTCDate(Math.min(max, original.getUTCDate()));

    return new DayPilot.Date(d);
  };

  DayPilot.Date.prototype.dayOfWeek = function() {
    return new Date(this.ticks).getUTCDay();
  };

  DayPilot.Date.prototype.getDayOfWeek = function() {
    return new Date(this.ticks).getUTCDay();
  };

  DayPilot.Date.prototype.getDayOfYear = function() {
    var first = this.firstDayOfYear();
    return DayPilot.DateUtil.daysDiff(first, this) + 1;
  };

  DayPilot.Date.prototype.daysInMonth = function() {
    var date = new Date(this.ticks);
    var month = date.getUTCMonth() + 1;
    var year = date.getUTCFullYear();


    var m = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month !== 2)
      return m[month - 1];
    if (year % 4 !== 0)
      return m[1];
    if (year % 100 === 0 && year % 400 !== 0)
      return m[1];
    return m[1] + 1;

  };

  DayPilot.Date.prototype.daysInYear = function() {
    var year = this.getYear();
    if (year % 4 !== 0) {
      return 365;
    }
    if (year % 100 === 0 && year % 400 !== 0) {
      return 365;
    }
    return 366;
  };

  DayPilot.Date.prototype.dayOfYear = function() {
    return Math.ceil((this.getDatePart().getTime() - this.firstDayOfYear().getTime()) / 86400000) + 1;
  };

  // not required, direct comparison can be used
  DayPilot.Date.prototype.equals = function(another) {
    if (another === null) {
      return false;
    }
    if (another instanceof DayPilot.Date) {
      return this === another;
    }
    else {
      throw "The parameter must be a DayPilot.Date object (DayPilot.Date.equals())";
    }
  };

  DayPilot.Date.prototype.firstDayOfMonth = function() {
    //var utc = DayPilot.Date.firstDayOfMonth(this.getYear(), this.getMonth() + 1);
    //return new DayPilot.Date(utc);

    var d = new Date();
    d.setUTCFullYear(this.getYear(), this.getMonth(), 1);
    d.setUTCHours(0);
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);
    d.setUTCMilliseconds(0);
    return new DayPilot.Date(d);

  };

  DayPilot.Date.prototype.firstDayOfYear = function() {
    var year = this.getYear();
    var d = new Date();
    d.setUTCFullYear(year, 0, 1);
    d.setUTCHours(0);
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);
    d.setUTCMilliseconds(0);
    return new DayPilot.Date(d);
  };

  DayPilot.Date.prototype.firstDayOfWeek = function(weekStarts) {
    var d = this;
    if (weekStarts instanceof DayPilot.Locale) {
      weekStarts = weekStarts.weekStarts;
    }
    else if (typeof weekStarts === "string" && DayPilot.Locale.find(weekStarts)) {
      var locale = DayPilot.Locale.find(weekStarts);
      weekStarts = locale.weekStarts;
    }
    else {
      weekStarts = weekStarts || 0;
    }

    var day = d.dayOfWeek();
    while (day !== weekStarts) {
      d = d.addDays(-1);
      day = d.dayOfWeek();
    }
    return new DayPilot.Date(d);
  };

  DayPilot.Date.prototype.getDay = function() {
    return new Date(this.ticks).getUTCDate();
  };

  DayPilot.Date.prototype.getDatePart = function() {
    var d = new Date(this.ticks);
    d.setUTCHours(0);
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);
    d.setUTCMilliseconds(0);
    return new DayPilot.Date(d);
  };

  DayPilot.Date.prototype.getYear = function() {
    return new Date(this.ticks).getUTCFullYear();
  };

  DayPilot.Date.prototype.getHours = function() {
    return new Date(this.ticks).getUTCHours();
  };

  DayPilot.Date.prototype.getMilliseconds = function() {
    return new Date(this.ticks).getUTCMilliseconds();
  };

  DayPilot.Date.prototype.getMinutes = function() {
    return new Date(this.ticks).getUTCMinutes();
  };

  DayPilot.Date.prototype.getMonth = function() {
    return new Date(this.ticks).getUTCMonth();
  };

  DayPilot.Date.prototype.getSeconds = function() {
    return new Date(this.ticks).getUTCSeconds();
  };

  DayPilot.Date.prototype.getTotalTicks = function() {
    return this.getTime();
  };

  // undocumented
  DayPilot.Date.prototype.getTime = function() {
    return this.ticks;
  };

  DayPilot.Date.prototype.getTimePart = function() {
    var datePart = this.getDatePart();
    return DayPilot.DateUtil.diff(this, datePart);
  };

  DayPilot.Date.prototype.lastDayOfMonth = function() {
    //var utc = DayPilot.Date.lastDayOfMonth(this.getYear(), this.getMonth() + 1);
    //return new DayPilot.Date(utc);
    var d = new Date(this.firstDayOfMonth().getTime());
    var length = this.daysInMonth();
    d.setUTCDate(length);
    return new DayPilot.Date(d);
  };

  DayPilot.Date.prototype.weekNumber = function() {
    var first = this.firstDayOfYear();
    var days = (this.getTime() - first.getTime()) / 86400000;
    return Math.ceil((days + first.dayOfWeek() + 1) / 7);
  };

  // ISO 8601
  DayPilot.Date.prototype.weekNumberISO = function() {
    var thursdayFlag = false;
    var dayOfYear = this.dayOfYear();

    var startWeekDayOfYear = this.firstDayOfYear().dayOfWeek();
    var endWeekDayOfYear = this.firstDayOfYear().addYears(1).addDays(-1).dayOfWeek();
    //int startWeekDayOfYear = new DateTime(date.getYear(), 1, 1).getDayOfWeekOrdinal();
    //int endWeekDayOfYear = new DateTime(date.getYear(), 12, 31).getDayOfWeekOrdinal();

    if (startWeekDayOfYear === 0) {
      startWeekDayOfYear = 7;
    }
    if (endWeekDayOfYear === 0) {
      endWeekDayOfYear = 7;
    }

    var daysInFirstWeek = 8 - (startWeekDayOfYear);

    if (startWeekDayOfYear === 4 || endWeekDayOfYear === 4) {
      thursdayFlag = true;
    }

    var fullWeeks = Math.ceil((dayOfYear - (daysInFirstWeek)) / 7.0);

    var weekNumber = fullWeeks;

    if (daysInFirstWeek >= 4) {
      weekNumber = weekNumber + 1;
    }

    if (weekNumber > 52 && !thursdayFlag) {
      weekNumber = 1;
    }

    if (weekNumber === 0) {
      weekNumber = this.firstDayOfYear().addDays(-1).weekNumberISO(); //weekNrISO8601(new DateTime(date.getYear() - 1, 12, 31));
    }

    return weekNumber;

  };

  DayPilot.Date.prototype.toDateLocal = function() {
    var date = new Date(this.ticks);

    var d = new Date();
    d.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    d.setHours(date.getUTCHours());
    d.setMinutes(date.getUTCMinutes());
    d.setSeconds(date.getUTCSeconds());
    d.setMilliseconds(date.getUTCMilliseconds());
    return d;

  };

  DayPilot.Date.prototype.toDate = function() {
    return new Date(this.ticks);
  };

  DayPilot.Date.prototype.toJSON = function() {
    return this.value;
  };

  // formatting and languages needed here
  DayPilot.Date.prototype.toString = function(pattern, locale) {
    if (!pattern) {
      return this.toStringSortable();
    }
    return new Pattern(pattern, locale).print(this);
  };

  DayPilot.Date.prototype.toStringSortable = function() {
    return ticksToSortable(this.ticks);
  };

  function ticksToSortable(ticks) {

    var cache = DayPilot.Date.Cache.Ticks;
    if (cache[ticks]) {
      return cache[ticks];
    }

    var d = new Date(ticks);

    var millisecond;
    var ms = d.getUTCMilliseconds();

    if (ms === 0) {
      millisecond = "";
    }
    else if (ms < 10) {
      millisecond = ".00" + ms;
    }
    else if (ms < 100) {
      millisecond = ".0" + ms;
    }
    else {
      millisecond = "." + ms
    }

    var second = d.getUTCSeconds();
    if (second < 10)
      second = "0" + second;
    var minute = d.getUTCMinutes();
    if (minute < 10)
      minute = "0" + minute;
    var hour = d.getUTCHours();
    if (hour < 10)
      hour = "0" + hour;
    var day = d.getUTCDate();
    if (day < 10)
      day = "0" + day;
    var month = d.getUTCMonth() + 1;
    if (month < 10)
      month = "0" + month;
    var year = d.getUTCFullYear();

    if (year <= 0) {
      throw "The minimum year supported is 1.";
    }
    if (year < 10) {
      year = "000" + year;
    }
    else if (year < 100) {
      year = "00" + year;
    }
    else if (year < 1000) {
      year = "0" + year;
    }

    var result = year + "-" + month + "-" + day + 'T' + hour + ":" + minute + ":" + second + millisecond;
    cache[ticks] = result;
    return result;
  }

  /* static functions, return DayPilot.Date object */

  // returns null if parsing was not successful
  DayPilot.Date.parse = function(str, pattern, locale) {
    var p = new Pattern(pattern, locale);
    return p.parse(str);
  };

  var todayCount = 0;

  DayPilot.Date.today = function() {
    //return new DayPilot.Date().getDatePart();
    return new DayPilot.Date(DayPilot.DateUtil.localToday(), true);
  };

  DayPilot.Date.fromYearMonthDay = function(year, month, day) {
    month = month || 1;
    day = day || 1;

    var d = new Date(0);
    d.setUTCFullYear(year);
    d.setUTCMonth(month - 1);
    d.setUTCDate(day);
    return new DayPilot.Date(d);
  };

  var Pattern = function(pattern, locale) {
    if (typeof locale === "string") {
      locale = DayPilot.Locale.find(locale);
    }
    var locale = locale || DayPilot.Locale.US;
    var all = [
      {"seq": "yyyy", "expr": "[0-9]{4,4\u007d", "str": function(d) {
          return d.getYear();
        }},
      {"seq": "yy", "expr": "[0-9]{2,2\u007d", "str": function(d) {
          return d.getYear() % 100;
        }},
      {"seq": "mm", "expr": "[0-9]{2,2\u007d", "str": function(d) {
          var r = d.getMinutes();
          return r < 10 ? "0" + r : r;
        }},
      {"seq": "m", "expr": "[0-9]{1,2\u007d", "str": function(d) {
          var r = d.getMinutes();
          return r;
        }},
      {"seq": "HH", "expr": "[0-9]{2,2\u007d", "str": function(d) {
          var r = d.getHours();
          return r < 10 ? "0" + r : r;
        }},
      {"seq": "H", "expr": "[0-9]{1,2\u007d", "str": function(d) {
          var r = d.getHours();
          return r;
        }},
      {"seq": "hh", "expr": "[0-9]{2,2\u007d", "str": function(d) {
          var hour = d.getHours();
          var hour = hour % 12;
          if (hour === 0) {
            hour = 12;
          }
          var r = hour;
          return r < 10 ? "0" + r : r;
        }},
      {"seq": "h", "expr": "[0-9]{1,2\u007d", "str": function(d) {
          var hour = d.getHours();
          var hour = hour % 12;
          if (hour === 0) {
            hour = 12;
          }
          return hour;
        }},
      {"seq": "ss", "expr": "[0-9]{2,2\u007d", "str": function(d) {
          var r = d.getSeconds();
          return r < 10 ? "0" + r : r;
        }},
      {"seq": "s", "expr": "[0-9]{1,2\u007d", "str": function(d) {
          var r = d.getSeconds();
          return r;
        }},
      {"seq": "MMMM", "expr": "[^\\s0-9]*", "str": function(d) {
          var r = locale.monthNames[d.getMonth()];
          return r;
        }, "transform" : function(input) {
          var index = indexOf(locale.monthNames, input, equalsIgnoreCase);
          if (index < 0) {
            return null;
          }
          return index + 1;
        }},
      {"seq": "MMM", "expr": "[^\\s0-9]*", "str": function(d) {  // \u0073 = 's'
          var r = locale.monthNamesShort[d.getMonth()];
          return r;
        }, "transform" : function(input) {
          var index = indexOf(locale.monthNamesShort, input, equalsIgnoreCase);
          if (index < 0) {
            return null;
          }
          return index + 1;
        }},
      {"seq": "MM", "expr": "[0-9]{2,2\u007d", "str": function(d) {
          var r = d.getMonth() + 1;
          return r < 10 ? "0" + r : r;
        }},
      {"seq": "M", "expr": "[0-9]{1,2\u007d", "str": function(d) {
          var r = d.getMonth() + 1;
          return r;
        }},
      {"seq": "dddd", "expr": "[^\\s0-9]*", "str": function(d) {
          var r = locale.dayNames[d.getDayOfWeek()];
          return r;
        }},
      {"seq": "ddd", "expr": "[^\\s0-9]*", "str": function(d) {
          var r = locale.dayNamesShort[d.getDayOfWeek()];
          return r;
        }},
      {"seq": "dd", "expr": "[0-9]{2,2\u007d", "str": function(d) {
          var r = d.getDay();
          return r < 10 ? "0" + r : r;
        }},
      {"seq": "%d", "expr": "[0-9]{1,2\u007d", "str": function(d) {
          var r = d.getDay();
          return r;
        }},
      {"seq": "d", "expr": "[0-9]{1,2\u007d", "str": function(d) {
          var r = d.getDay();
          return r;
        }},
      {"seq": "tt", "expr": "(AM|PM|am|pm)", "str": function(d) {
          var hour = d.getHours();
          var am = hour < 12;
          return am ? "AM" : "PM";
        }, "transform" : function(input) {
          return input.toUpperCase();
        }},
    ];

    var escapeRegex = function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    this.init = function() {
      this.year = this.findSequence("yyyy");
      this.month = this.findSequence("MMMM") || this.findSequence("MMM") || this.findSequence("MM") || this.findSequence("M");
      this.day = this.findSequence("dd") || this.findSequence("d");

      this.hours = this.findSequence("HH") || this.findSequence("H");
      this.minutes = this.findSequence("mm") || this.findSequence("m");
      this.seconds = this.findSequence("ss") || this.findSequence("s");

      this.ampm = this.findSequence("tt");
      this.hours12 = this.findSequence("hh") || this.findSequence("h");

      /*if (this.hours && this.ampm) {
          throw new DayPilot.Exception("'HH' and 'H' specifiers cannot be used in combination with 'tt'. Use 12-hour clock specifiers: 'hh' or 'h'.");
      }*/
    };

    this.findSequence = function(seq) {

      function defaultTransform(value) {
        return parseInt(value);
      }

      var index = pattern.indexOf(seq);
      if (index === -1) {
        return null;
      }
      return {
        "findValue": function(input) {
          var prepared = escapeRegex(pattern);
          var transform = null;
          for (var i = 0; i < all.length; i++) {
            var len = all[i].length;
            var pick = (seq === all[i].seq);
            //var expr = "";
            var expr = all[i].expr;
            if (pick) {
              expr = "(" + expr + ")";
              transform = all[i].transform;
            }
            prepared = prepared.replace(all[i].seq, expr);
          }

          prepared = "^" + prepared + "$";

          try {
            var r = new RegExp(prepared);
            var array = r.exec(input);
            if (!array) {
              return null;
            }
            transform = transform || defaultTransform;  // parseInt is the default transform/parse function
            return transform(array[1]);
          }
          catch (e) {
            throw "unable to create regex from: " + prepared;
          }
        }
      };
    };

    this.print = function(date) {
      // always recompiles the pattern

      var find = function(t) {
        for (var i = 0; i < all.length; i++) {
          if (all[i] && all[i].seq === t) {
            return all[i];
          }
        }
        return null;
      };

      var eos = pattern.length <= 0;
      var pos = 0;
      var components = [];

      while (!eos) {
        var rem = pattern.substring(pos);
        var matches = /%?(.)\1*/.exec(rem);  // matches a sequence of identical characters, with an optional '%' preceding char
        if (matches && matches.length > 0) {
          var match = matches[0];
          var q = find(match);
          if (q) {
            components.push(q);
          }
          else {
            components.push(match);
          }
          pos += match.length;
          eos = pattern.length <= pos;
        }
        else {
          eos = true;
        }
      }

      // resolve placeholders
      for (var i = 0; i < components.length; i++) {
        var c = components[i];
        if (typeof c !== 'string') {
          components[i] = c.str(date);
        }
      }

      return components.join("");
    };



    this.parse = function(input) {

      var year = this.year.findValue(input);
      if (!year) {
        return null; // unparseable
      }

      var month = this.month.findValue(input);
      if (isNullOrUndefined(month)) {
        return null;
      }
      if (month > 12 || month < 1) {
        return null;
      }
      var day = this.day.findValue(input);

      var daysInMonth = DayPilot.Date.fromYearMonthDay(year, month).daysInMonth();
      if (day < 1 || day > daysInMonth) {
        return null;
      }

      var hours = this.hours ? this.hours.findValue(input) : 0;
      var minutes = this.minutes ? this.minutes.findValue(input) : 0;
      var seconds = this.seconds ? this.seconds.findValue(input) : 0;

      var ampm = this.ampm ? this.ampm.findValue(input): null;

      if (this.ampm && this.hours12) {

        var hours12 = this.hours12.findValue(input);

        if (hours12 < 1 || hours12 > 12) {
          return null;
        }

        if (ampm === "PM") {
          if (hours12 === 12) {
            hours = 12;
          }
          else {
            hours = hours12 + 12;
          }
        }
        else {
          if (hours12 === 12) {
            hours = 0;
          }
          else {
            hours = hours12;
          }
        }

      }

      if (hours < 0 || hours > 23) {
        return null;
      }

      if (minutes < 0 || minutes > 59) {
        return null;
      }

      if (seconds < 0 || seconds > 59) {
        return null;
      }

      var d = new Date();
      d.setUTCFullYear(year, month - 1, day);
      d.setUTCHours(hours);
      d.setUTCMinutes(minutes);
      d.setUTCSeconds(seconds);
      d.setUTCMilliseconds(0);

      return new DayPilot.Date(d);
    };

    this.init();

  };

  function equalsIgnoreCase(str1, str2) {
    if (isNullOrUndefined(str1)) {
      return false;
    }
    if (isNullOrUndefined(str2)) {
      return false;
    }
    return str1.toLocaleLowerCase() === str2.toLocaleLowerCase();
  }

  function indexOf(array, object, equalsFunction) {
    if (!array || !array.length) {
      return -1;
    }
    for (var i = 0; i < array.length; i++) {
      if (equalsFunction) {
        if (equalsFunction(array[i], object)) {
          return i;
        }
      }
      else if (array[i] === object) {
        return i;
      }
    }
    return -1;
  };


  DayPilot.DateUtil = {};

  /* internal functions, all operate with GMT base of the date object
   (except of DayPilot.DateUtil.fromLocal()) */

  DayPilot.DateUtil.fromStringSortable = function(string, readLocal) {
    /*
    Supported formats:
    2015-01-01
    2015-01-01T00:00:00
    2015-01-01T00:00:00.000
    2015-01-01T00:00:00Z
    2015-01-01T00:00:00.000Z
    2015-01-01T00:00:00+01:00
    2015-01-01T00:00:00.000+01:00

     */

    if (!string) {
      throw "Can't create DayPilot.Date from an empty string";
    }

    var len = string.length;
    var date = len === 10;
    var datetime = len === 19;
    var long = len > 19;

    if (!date && !datetime && !long) {
      throw "Invalid string format (use '2010-01-01' or '2010-01-01T00:00:00'): " + string;
    }

    if (DayPilot.Date.Cache.Parsing[string] && !readLocal) {
      return DayPilot.Date.Cache.Parsing[string];
    }

    var year = string.substring(0, 4);
    var month = string.substring(5, 7);
    var day = string.substring(8, 10);

    var d = new Date(0);
    d.setUTCFullYear(year, month - 1, day);

    if (date) {
      /*
      d.setUTCHours(0);
      d.setUTCMinutes(0);
      d.setUTCSeconds(0);
      d.setUTCMilliseconds(0);
      */
      //result = d;
      DayPilot.Date.Cache.Parsing[string] = d;
      return d;
    }

    var hours = string.substring(11, 13);
    var minutes = string.substring(14, 16);
    var seconds = string.substring(17, 19);

    d.setUTCHours(hours);
    d.setUTCMinutes(minutes);
    d.setUTCSeconds(seconds);
    //d.setUTCMilliseconds(0);
    //result = d;

    if (datetime) {
      DayPilot.Date.Cache.Parsing[string] = d;
      return d;
    }

    var tzdir = string[19];

    var tzoffset = 0;

    if (tzdir === ".") {
      var ms = parseInt(string.substring(20, 23)); /// .000
      d.setUTCMilliseconds(ms);
      tzoffset = DayPilot.DateUtil.getTzOffsetMinutes(string.substring(23));
    }
    else {
      tzoffset = DayPilot.DateUtil.getTzOffsetMinutes(string.substring(19));
    }

    var dd = new DayPilot.Date(d);
    if (!readLocal) {
      dd = dd.addMinutes(-tzoffset);
    }

    d = dd.toDate(); // get UTC base

    DayPilot.Date.Cache.Parsing[string] = d;
    return d;
  };

  DayPilot.DateUtil.getTzOffsetMinutes = function(string) {
    if (isNullOrUndefined(string) || string === "") {
      return 0;
    }
    if (string === "Z") {
      return 0;
    }

    var tzdir = string[0];

    var tzhours = parseInt(string.substring(1, 3));
    var tzminutes = parseInt(string.substring(4));
    var tzoffset = tzhours * 60 + tzminutes;

    if (tzdir === "-") {
      return -tzoffset;
    }
    else if (tzdir === "+") {
      return tzoffset;
    }
    else {
      throw "Invalid timezone spec: " + string;
    }
  };

  DayPilot.DateUtil.hasTzSpec = function(string) {
    if (string.indexOf("+")) {
      return true;
    }
    if (string.indexOf("-")) {
      return true;
    }
    return false;
  };


  // rename candidate: diffDays
  DayPilot.DateUtil.daysDiff = function(first, second) {
    (first && second) || (function() { throw "two parameters required"; })();

    first = new DayPilot.Date(first);
    second = new DayPilot.Date(second);

    if (first.getTime() > second.getTime()) {
      return null;
    }

    var i = 0;
    var fDay = first.getDatePart();
    var sDay = second.getDatePart();

    while (fDay < sDay) {
      fDay = fDay.addDays(1);
      i++;
    }

    return i;
  };

  DayPilot.DateUtil.daysSpan = function(first, second) {
    (first && second) || (function() { throw "two parameters required"; })();

    first = new DayPilot.Date(first);
    second = new DayPilot.Date(second);

    if (first === second) {
      return 0;
    }

    var diff = DayPilot.DateUtil.daysDiff(first, second);

    if (second == second.getDatePart()) {
      diff--;
    }

    return diff;
  };

  DayPilot.DateUtil.diff = function(first, second) { // = first - second
    if (!(first && second && first.getTime && second.getTime)) {
      throw "Both compared objects must be Date objects (DayPilot.Date.diff).";
    }

    return first.getTime() - second.getTime();
  };

  // returns Date object
  DayPilot.DateUtil.fromLocal = function(localDate) {
    if (!localDate) {
      localDate = new Date();
    }

    var d = new Date();
    d.setUTCFullYear(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
    d.setUTCHours(localDate.getHours());
    d.setUTCMinutes(localDate.getMinutes());
    d.setUTCSeconds(localDate.getSeconds());
    d.setUTCMilliseconds(localDate.getMilliseconds());
    return d;
  };

  DayPilot.DateUtil.localToday = function() {
    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  };

  // rename candidate: toHourString
  DayPilot.DateUtil.hours = function(date, use12) {

    var minute = date.getUTCMinutes();
    if (minute < 10)
      minute = "0" + minute;


    var hour = date.getUTCHours();
    //if (hour < 10) hour = "0" + hour;

    if (use12) {
      var am = hour < 12;
      var hour = hour % 12;
      if (hour === 0) {
        hour = 12;
      }
      var suffix = am ? "AM" : "PM";
      return hour + ':' + minute + ' ' + suffix;
    }
    else {
      return hour + ':' + minute;
    }
  };

  DayPilot.DateUtil.max = function(first, second) {
    if (first.getTime() > second.getTime()) {
      return first;
    }
    else {
      return second;
    }
  };

  DayPilot.DateUtil.min = function(first, second) {
    if (first.getTime() < second.getTime()) {
      return first;
    }
    else {
      return second;
    }
  };

})(local);

const DayPilotDate = local.Date;
const DateUtil = local.DateUtil;

export {DayPilotDate as Date, DateUtil};
