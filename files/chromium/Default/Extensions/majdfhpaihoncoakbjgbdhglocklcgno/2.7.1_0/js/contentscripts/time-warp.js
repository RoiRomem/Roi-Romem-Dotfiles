/* eslint-disable func-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef,no-param-reassign,no-bitwise */

function timeString() {
  return new Date()
    .toTimeString()
    .split('(')[1]
    .split(')')[0];
}

function isNative(fn) {
  return /\{\s*\[native code\]\s*\}/.test(`${fn}`);
}

function isClass(obj) {
  const isCtorClass = obj.constructor && obj.constructor.toString().substring(0, 5) === 'class';
  if (obj.prototype === undefined) {
    return isCtorClass;
  }
  const isPrototypeCtorClass = obj.prototype.constructor && obj.prototype.constructor.toString
    && obj.prototype.constructor.toString().substring(0, 5) === 'class';
  return isCtorClass || isPrototypeCtorClass;
}

function prefs() {
  if (!Date.oPrefs) {
    Date.oPrefs = [
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      -1 * new Date().getTimezoneOffset(),
      new Date().getTimezoneOffset(),
      timeString(),
    ];
  }

  Date.prefs = Date.prefs || Date.oPrefs;

  try {
    // get preferences for subframes synchronously
    Date.prefs = window.parent.Date.prefs;
  }
  catch (e) {
    console.error(e);
  }
}

function intl() {
  if (!Date.intlSet) {
    const intlObj = Intl.DateTimeFormat.prototype.resolvedOptions;
    Intl.DateTimeFormat.prototype.resolvedOptions = function (...args) {
      return Object.assign(intlObj.apply(this, args), {
        timeZone: Date.prefs[0],
      });
    };
    Date.intlSet = true;
  }
}

function shiftedDate() {
  const clean = (str) => {
    const toGMT = (offset) => {
      const z = (n) => { return (n < 10 ? '0' : '') + n; };
      const sign = offset <= 0 ? '+' : '-';
      offset = Math.abs(offset);
      return sign + z((offset / 60) | 0) + z(offset % 60);
    };
    str = str.replace(/([T\\(])[\\+-]\\d+/g, `$1${toGMT(Date.prefs[1])}`);
    if (str.indexOf(' (') !== -1) {
      str = `${str.split(' (')[0]} (${Date.prefs[3]})`;
    }
    return str;
  };

  const {
    getTime,
    getDate,
    getDay,
    getFullYear,
    getHours,
    getMilliseconds,
    getMinutes,
    getMonth,
    getSeconds,
    getYear,
    toDateString,
    toLocaleString,
    toString,
    toTimeString,
    toLocaleTimeString,
    toLocaleDateString,
    setYear,
    setHours,
    setTime,
    setFullYear,
    setMilliseconds,
    setMinutes,
    setMonth,
    setSeconds,
    setDate,
    setUTCDate,
    setUTCFullYear,
    setUTCHours,
    setUTCMilliseconds,
    setUTCMinutes,
    setUTCMonth,
    setUTCSeconds,
  } = ODate.prototype;

  window.ShiftedDate = class extends ODate {
    constructor(...args) {
      super(...args);
      if (!isClass(Date)) {
        // constructor was tampered with, fallback ->
        Date.prefs = ['Antarctica/McMurdo', -780, 300, 'McMurdo Daylight Time'];
      }

      this.nd = new ODate(
        getTime.apply(this) + (Date.prefs[2] - Date.prefs[1]) * 60 * 1000,
      );
    }

    // get
    toLocaleString(...args) {
      return toLocaleString.apply(this.nd, args);
    }

    toLocaleTimeString(...args) {
      return toLocaleTimeString.apply(this.nd, args);
    }

    toLocaleDateString(...args) {
      return toLocaleDateString.apply(this.nd, args);
    }

    toDateString(...args) {
      return toDateString.apply(this.nd, args);
    }

    getDate(...args) {
      return getDate.apply(this.nd, args);
    }

    getDay(...args) {
      return getDay.apply(this.nd, args);
    }

    getFullYear(...args) {
      return getFullYear.apply(this.nd, args);
    }

    getHours(...args) {
      return getHours.apply(this.nd, args);
    }

    getMilliseconds(...args) {
      return getMilliseconds.apply(this.nd, args);
    }

    getMinutes(...args) {
      return getMinutes.apply(this.nd, args);
    }

    getMonth(...args) {
      return getMonth.apply(this.nd, args);
    }

    getSeconds(...args) {
      return getSeconds.apply(this.nd, args);
    }

    getYear(...args) {
      return getYear.apply(this.nd, args);
    }

    // set
    setHours(...args) {
      const a = getTime.call(this.nd);
      const b = setHours.apply(this.nd, args);
      setTime.call(this, getTime.call(this) + b - a);
      return b;
    }

    setFullYear(...args) {
      const a = getTime.call(this.nd);
      const b = setFullYear.apply(this.nd, args);
      setTime.call(this, getTime.call(this) + b - a);
      return b;
    }

    setMilliseconds(...args) {
      const a = getTime.call(this.nd);
      const b = setMilliseconds.apply(this.nd, args);
      setTime.call(this, getTime.call(this) + b - a);
      return b;
    }

    setMinutes(...args) {
      const a = getTime.call(this.nd);
      const b = setMinutes.apply(this.nd, args);
      setTime.call(this, getTime.call(this) + b - a);
      return b;
    }

    setMonth(...args) {
      const a = getTime.call(this.nd);
      const b = setMonth.apply(this.nd, args);
      setTime.call(this, getTime.call(this) + b - a);
      return b;
    }

    setSeconds(...args) {
      const a = getTime.call(this.nd);
      const b = setSeconds.apply(this.nd, args);
      setTime.call(this, getTime.call(this) + b - a);
      return b;
    }

    setDate(...args) {
      const a = getTime.call(this.nd);
      const b = setDate.apply(this.nd, args);
      setTime.call(this, getTime.call(this) + b - a);
      return b;
    }

    setYear(...args) {
      const a = getTime.call(this.nd);
      const b = setYear.apply(this.nd, args);
      setTime.call(this, getTime.call(this) + b - a);
      return b;
    }

    setTime(...args) {
      const a = getTime.call(this);
      const b = setTime.apply(this, args);
      setTime.call(this.nd, getTime.call(this.nd) + b - a);
      return b;
    }

    setUTCDate(...args) {
      const a = getTime.call(this);
      const b = setUTCDate.apply(this, args);
      setTime.call(this.nd, getTime.call(this.nd) + b - a);
      return b;
    }

    setUTCFullYear(...args) {
      const a = getTime.call(this);
      const b = setUTCFullYear.apply(this, args);
      setTime.call(this.nd, getTime.call(this.nd) + b - a);
      return b;
    }

    setUTCHours(...args) {
      const a = getTime.call(this);
      const b = setUTCHours.apply(this, args);
      setTime.call(this.nd, getTime.call(this.nd) + b - a);
      return b;
    }

    setUTCMilliseconds(...args) {
      const a = getTime.call(this);
      const b = setUTCMilliseconds.apply(this, args);
      setTime.call(this.nd, getTime.call(this.nd) + b - a);
      return b;
    }

    setUTCMinutes(...args) {
      const a = getTime.call(this);
      const b = setUTCMinutes.apply(this, args);
      setTime.call(this.nd, getTime.call(this.nd) + b - a);
      return b;
    }

    setUTCMonth(...args) {
      const a = getTime.call(this);
      const b = setUTCMonth.apply(this, args);
      setTime.call(this.nd, getTime.call(this.nd) + b - a);
      return b;
    }

    setUTCSeconds(...args) {
      const a = getTime.call(this);
      const b = setUTCSeconds.apply(this, args);
      setTime.call(this.nd, getTime.call(this.nd) + b - a);
      return b;
    }

    // toString
    toString(...args) {
      return clean(toString.apply(this.nd, args));
    }

    toTimeString(...args) {
      return clean(toTimeString.apply(this.nd, args));
    }

    getTimezoneOffset() {
      return Date.prefs[1];
    }
  };
}

const injectScript = (content) => {
  const script = document.createElement('script');
  script.textContent = content;
  document.documentElement.insertBefore(script, document.head);
  script.remove();
};

const shiftTime = () => {
  return injectScript(`
    if (!window.ODate) {
      window.ODate = Date
    }
    ${isNative.toString()}
    ${isClass.toString()}
    ${timeString.toString()}
    ${prefs.toString()}
    prefs();
    ${intl.toString()}
    intl();
    ${shiftedDate.toString()}
    shiftedDate();
    Date = window.ShiftedDate;
  `);
};

chrome.runtime.sendMessage({ request: 'TimeWarp' }, (message) => {
  if (message === 'time-warp-on') shiftTime();
});

const proxyTimeListener = (message) => {
  if (message.type === 'time-warp-off') {
    injectScript(`
      if (window.ODate) { Date = window.ODate }
      if (Date.oPrefs) { Date.prefs = Date.oPrefs }
    `);
  }
  else if (message.type === 'time-warp-on') {
    shiftTime();
  }
};

if (!chrome.runtime.onMessage.hasListener(proxyTimeListener)) {
  chrome.runtime.onMessage.addListener(proxyTimeListener);
}
