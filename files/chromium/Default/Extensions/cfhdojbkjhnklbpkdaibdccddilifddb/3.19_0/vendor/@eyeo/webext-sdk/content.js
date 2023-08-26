/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/adblockpluscore/lib/common.js":
/*!****************************************************!*\
  !*** ./node_modules/adblockpluscore/lib/common.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



let textToRegExp =
/**
 * Converts raw text into a regular expression string
 * @param {string} text the string to convert
 * @return {string} regular expression representation of the text
 * @package
 */
exports.textToRegExp = text => text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const regexpRegexp = /^\/(.*)\/([imu]*)$/;

/**
 * Make a regular expression from a text argument.
 *
 * If it can be parsed as a regular expression, parse it and the flags.
 *
 * @param {string} text the text argument.
 *
 * @return {?RegExp} a RegExp object or null in case of error.
 */
exports.makeRegExpParameter = function makeRegExpParameter(text) {
  let [, source, flags] = regexpRegexp.exec(text) || [null, textToRegExp(text)];

  try {
    return new RegExp(source, flags);
  }
  catch (e) {
    return null;
  }
};

let splitSelector = exports.splitSelector = function splitSelector(selector) {
  if (!selector.includes(","))
    return [selector];

  let selectors = [];
  let start = 0;
  let level = 0;
  let sep = "";

  for (let i = 0; i < selector.length; i++) {
    let chr = selector[i];

    // ignore escaped characters
    if (chr == "\\") {
      i++;
    }
    // don't split within quoted text
    else if (chr == sep) {
      sep = "";             // e.g. [attr=","]
    }
    else if (sep == "") {
      if (chr == '"' || chr == "'") {
        sep = chr;
      }
      // don't split between parentheses
      else if (chr == "(") {
        level++;            // e.g. :matches(div,span)
      }
      else if (chr == ")") {
        level = Math.max(0, level - 1);
      }
      else if (chr == "," && level == 0) {
        selectors.push(selector.substring(start, i));
        start = i + 1;
      }
    }
  }

  selectors.push(selector.substring(start));
  return selectors;
};

function findTargetSelectorIndex(selector) {
  let index = 0;
  let whitespace = 0;
  let scope = [];

  // Start from the end of the string and go character by character, where each
  // character is a Unicode code point.
  for (let character of [...selector].reverse()) {
    let currentScope = scope[scope.length - 1];

    if (character == "'" || character == "\"") {
      // If we're already within the same type of quote, close the scope;
      // otherwise open a new scope.
      if (currentScope == character)
        scope.pop();
      else
        scope.push(character);
    }
    else if (character == "]" || character == ")") {
      // For closing brackets and parentheses, open a new scope only if we're
      // not within a quote. Within quotes these characters should have no
      // meaning.
      if (currentScope != "'" && currentScope != "\"")
        scope.push(character);
    }
    else if (character == "[") {
      // If we're already within a bracket, close the scope.
      if (currentScope == "]")
        scope.pop();
    }
    else if (character == "(") {
      // If we're already within a parenthesis, close the scope.
      if (currentScope == ")")
        scope.pop();
    }
    else if (!currentScope) {
      // At the top level (not within any scope), count the whitespace if we've
      // encountered it. Otherwise if we've hit one of the combinators,
      // terminate here; otherwise if we've hit a non-colon character,
      // terminate here.
      if (/\s/.test(character))
        whitespace++;
      else if ((character == ">" || character == "+" || character == "~") ||
               (whitespace > 0 && character != ":"))
        break;
    }

    // Zero out the whitespace count if we've entered a scope.
    if (scope.length > 0)
      whitespace = 0;

    // Increment the index by the size of the character. Note that for Unicode
    // composite characters (like emoji) this will be more than one.
    index += character.length;
  }

  return selector.length - index + whitespace;
}

/**
 * Qualifies a CSS selector with a qualifier, which may be another CSS selector
 * or an empty string. For example, given the selector "div.bar" and the
 * qualifier "#foo", this function returns "div#foo.bar".
 * @param {string} selector The selector to qualify.
 * @param {string} qualifier The qualifier with which to qualify the selector.
 * @returns {string} The qualified selector.
 * @package
 */
exports.qualifySelector = function qualifySelector(selector, qualifier) {
  let qualifiedSelector = "";

  let qualifierTargetSelectorIndex = findTargetSelectorIndex(qualifier);
  let [, qualifierType = ""] =
    /^([a-z][a-z-]*)?/i.exec(qualifier.substring(qualifierTargetSelectorIndex));

  for (let sub of splitSelector(selector)) {
    sub = sub.trim();

    qualifiedSelector += ", ";

    let index = findTargetSelectorIndex(sub);

    // Note that the first group in the regular expression is optional. If it
    // doesn't match (e.g. "#foo::nth-child(1)"), type will be an empty string.
    let [, type = "", rest] =
      /^([a-z][a-z-]*)?\*?(.*)/i.exec(sub.substring(index));

    if (type == qualifierType)
      type = "";

    // If the qualifier ends in a combinator (e.g. "body #foo>"), we put the
    // type and the rest of the selector after the qualifier
    // (e.g. "body #foo>div.bar"); otherwise (e.g. "body #foo") we merge the
    // type into the qualifier (e.g. "body div#foo.bar").
    if (/[\s>+~]$/.test(qualifier))
      qualifiedSelector += sub.substring(0, index) + qualifier + type + rest;
    else
      qualifiedSelector += sub.substring(0, index) + type + qualifier + rest;
  }

  // Remove the initial comma and space.
  return qualifiedSelector.substring(2);
};


/***/ }),

/***/ "./node_modules/adblockpluscore/lib/content/elemHideEmulation.js":
/*!***********************************************************************!*\
  !*** ./node_modules/adblockpluscore/lib/content/elemHideEmulation.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



const {makeRegExpParameter, splitSelector,
       qualifySelector} = __webpack_require__(/*! ../common */ "./node_modules/adblockpluscore/lib/common.js");
const {filterToRegExp} = __webpack_require__(/*! ../patterns */ "./node_modules/adblockpluscore/lib/patterns.js");

const DEFAULT_MIN_INVOCATION_INTERVAL = 3000;
let minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
const DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME = 50;
let maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;

let abpSelectorRegexp = /:(-abp-[\w-]+|has|has-text|xpath|not)\(/;

let testInfo = null;

function toCSSStyleDeclaration(value) {
  return Object.assign(document.createElement("test"), {style: value}).style;
}

/**
 * Enables test mode, which tracks additional metadata about the inner
 * workings for test purposes. This also allows overriding internal
 * configuration.
 *
 * @param {object} options
 * @param {number} options.minInvocationInterval Overrides how long
 *   must be waited between filter processing runs
 * @param {number} options.maxSynchronousProcessingTime Overrides how
 *   long the thread may spend processing filters before it must yield
 *   its thread
 */
exports.setTestMode = function setTestMode(options) {
  if (typeof options.minInvocationInterval !== "undefined")
    minInvocationInterval = options.minInvocationInterval;
  if (typeof options.maxSynchronousProcessingTime !== "undefined")
    maxSynchronousProcessingTime = options.maxSynchronousProcessingTime;

  testInfo = {
    lastProcessedElements: new Set(),
    failedAssertions: []
  };
};

exports.getTestInfo = function getTestInfo() {
  return testInfo;
};

exports.clearTestMode = function() {
  minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
  maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;
  testInfo = null;
};

/**
 * Creates a new IdleDeadline.
 *
 * Note: This function is synchronous and does NOT request an idle
 * callback.
 *
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline}.
 * @return {IdleDeadline}
 */
function newIdleDeadline() {
  let startTime = performance.now();
  return {
    didTimeout: false,
    timeRemaining() {
      let elapsed = performance.now() - startTime;
      let remaining = maxSynchronousProcessingTime - elapsed;
      return Math.max(0, remaining);
    }
  };
}

/**
 * Returns a promise that is resolved when the browser is next idle.
 *
 * This is intended to be used for long running tasks on the UI thread
 * to allow other UI events to process.
 *
 * @return {Promise.<IdleDeadline>}
 *    A promise that is fulfilled when you can continue processing
 */
function yieldThread() {
  return new Promise(resolve => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(resolve);
    }
    else {
      setTimeout(() => {
        resolve(newIdleDeadline());
      }, 0);
    }
  });
}


function getCachedPropertyValue(object, name, defaultValueFunc = () => {}) {
  let value = object[name];
  if (typeof value == "undefined")
    Object.defineProperty(object, name, {value: value = defaultValueFunc()});
  return value;
}

/**
 * Return position of node from parent.
 * @param {Node} node the node to find the position of.
 * @return {number} One-based index like for :nth-child(), or 0 on error.
 */
function positionInParent(node) {
  let index = 0;
  for (let child of node.parentNode.children) {
    if (child == node)
      return index + 1;

    index++;
  }

  return 0;
}

function makeSelector(node, selector = "") {
  if (node == null)
    return null;
  if (!node.parentElement) {
    let newSelector = ":root";
    if (selector)
      newSelector += " > " + selector;
    return newSelector;
  }
  let idx = positionInParent(node);
  if (idx > 0) {
    let newSelector = `${node.tagName}:nth-child(${idx})`;
    if (selector)
      newSelector += " > " + selector;
    return makeSelector(node.parentElement, newSelector);
  }

  return selector;
}

function parseSelectorContent(content, startIndex) {
  let parens = 1;
  let quote = null;
  let i = startIndex;
  for (; i < content.length; i++) {
    let c = content[i];
    if (c == "\\") {
      // Ignore escaped characters
      i++;
    }
    else if (quote) {
      if (c == quote)
        quote = null;
    }
    else if (c == "'" || c == '"') {
      quote = c;
    }
    else if (c == "(") {
      parens++;
    }
    else if (c == ")") {
      parens--;
      if (parens == 0)
        break;
    }
  }

  if (parens > 0)
    return null;
  return {text: content.substring(startIndex, i), end: i};
}

/**
 * Stringified style objects
 * @typedef {Object} StringifiedStyle
 * @property {string} style CSS style represented by a string.
 * @property {string[]} subSelectors selectors the CSS properties apply to.
 */

/**
 * Produce a string representation of the stylesheet entry.
 * @param {CSSStyleRule} rule the CSS style rule.
 * @return {StringifiedStyle} the stringified style.
 */
function stringifyStyle(rule) {
  let styles = [];
  for (let i = 0; i < rule.style.length; i++) {
    let property = rule.style.item(i);
    let value = rule.style.getPropertyValue(property);
    let priority = rule.style.getPropertyPriority(property);
    styles.push(`${property}: ${value}${priority ? " !" + priority : ""};`);
  }
  styles.sort();
  return {
    style: styles.join(" "),
    subSelectors: splitSelector(rule.selectorText)
  };
}

let scopeSupported = null;

function tryQuerySelector(subtree, selector, all) {
  let elements = null;
  try {
    elements = all ? subtree.querySelectorAll(selector) :
      subtree.querySelector(selector);
    scopeSupported = true;
  }
  catch (e) {
    // Edge doesn't support ":scope"
    scopeSupported = false;
  }
  return elements;
}

/**
 * Query selector.
 *
 * If it is relative, will try :scope.
 *
 * @param {Node} subtree the element to query selector
 * @param {string} selector the selector to query
 * @param {bool} [all=false] true to perform querySelectorAll()
 *
 * @returns {?(Node|NodeList)} result of the query. null in case of error.
 */
function scopedQuerySelector(subtree, selector, all) {
  if (selector[0] == ">") {
    selector = ":scope" + selector;
    if (scopeSupported) {
      return all ? subtree.querySelectorAll(selector) :
        subtree.querySelector(selector);
    }
    if (scopeSupported == null)
      return tryQuerySelector(subtree, selector, all);
    return null;
  }
  return all ? subtree.querySelectorAll(selector) :
    subtree.querySelector(selector);
}

function scopedQuerySelectorAll(subtree, selector) {
  return scopedQuerySelector(subtree, selector, true);
}

class PlainSelector {
  constructor(selector) {
    this._selector = selector;
    this.maybeDependsOnAttributes = /[#.:]|\[.+\]/.test(selector);
    this.maybeContainsSiblingCombinators = /[~+]/.test(selector);
  }

  /**
   * Generator function returning a pair of selector string and subtree.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getSelectors(prefix, subtree, targets) {
    yield [prefix + this._selector, subtree];
  }
}

const incompletePrefixRegexp = /[\s>+~]$/;

class NotSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        if (!this._innerPattern.matches(element, subtree))
          yield element;

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class HasSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        for (let selector of this._innerPattern.evaluate(element, targets)) {
          if (selector == null)
            yield null;
          else if (scopedQuerySelector(element, selector))
            yield element;
        }

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class XPathSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;
    this.maybeDependsOnAttributes = true;

    let evaluator = new XPathEvaluator();
    this._expression = evaluator.createExpression(textContent, null);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  *getElements(prefix, subtree, targets) {
    let {ORDERED_NODE_SNAPSHOT_TYPE: flag} = XPathResult;
    let elements = prefix ? scopedQuerySelectorAll(subtree, prefix) : [subtree];
    for (let parent of elements) {
      let result = this._expression.evaluate(parent, flag, null);
      for (let i = 0, {snapshotLength} = result; i < snapshotLength; i++)
        yield result.snapshotItem(i);
    }
  }
}

class ContainsSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;

    this._regexp = makeRegExpParameter(textContent);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), subtree];
  }

  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;

    let elements = scopedQuerySelectorAll(subtree, actualPrefix);

    if (elements) {
      let lastRoot = null;
      for (let element of elements) {
        // For a filter like div:-abp-contains(Hello) and a subtree like
        // <div id="a"><div id="b"><div id="c">Hello</div></div></div>
        // we're only interested in div#a
        if (lastRoot && lastRoot.contains(element)) {
          yield null;
          continue;
        }

        lastRoot = element;

        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        if (this._regexp && this._regexp.test(element.textContent))
          yield element;
        else
          yield null;
      }
    }
  }
}

class PropsSelector {
  constructor(propertyExpression) {
    this.dependsOnStyles = true;
    this.maybeDependsOnAttributes = true;

    let regexpString;
    if (propertyExpression.length >= 2 && propertyExpression[0] == "/" &&
        propertyExpression[propertyExpression.length - 1] == "/")
      regexpString = propertyExpression.slice(1, -1);
    else
      regexpString = filterToRegExp(propertyExpression);

    this._regexp = new RegExp(regexpString, "i");

    this._subSelectors = [];
  }

  *getSelectors(prefix, subtree, targets) {
    for (let subSelector of this._subSelectors) {
      if (subSelector.startsWith("*") &&
          !incompletePrefixRegexp.test(prefix))
        subSelector = subSelector.substring(1);

      yield [qualifySelector(subSelector, prefix), subtree];
    }
  }

  setStyles(styles) {
    this._subSelectors = [];
    for (let style of styles) {
      if (this._regexp.test(style.style)) {
        for (let subSelector of style.subSelectors) {
          let idx = subSelector.lastIndexOf("::");
          if (idx != -1)
            subSelector = subSelector.substring(0, idx);

          this._subSelectors.push(subSelector);
        }
      }
    }
  }
}

class Pattern {
  constructor(selectors, text) {
    this.selectors = selectors;
    this.text = text;
  }

  get dependsOnStyles() {
    return getCachedPropertyValue(
      this, "_dependsOnStyles", () => this.selectors.some(
        selector => selector.dependsOnStyles
      )
    );
  }

  get maybeDependsOnAttributes() {
    // Observe changes to attributes if either there's a plain selector that
    // looks like an ID selector, class selector, or attribute selector in one
    // of the patterns (e.g. "a[href='https://example.com/']")
    // or there's a properties selector nested inside a has selector
    // (e.g. "div:-abp-has(:-abp-properties(color: blue))")
    return getCachedPropertyValue(
      this, "_maybeDependsOnAttributes", () => this.selectors.some(
        selector => selector.maybeDependsOnAttributes ||
                    (selector instanceof HasSelector &&
                     selector.dependsOnStyles)
      )
    );
  }

  get dependsOnCharacterData() {
    // Observe changes to character data only if there's a contains selector in
    // one of the patterns.
    return getCachedPropertyValue(
      this, "_dependsOnCharacterData", () => this.selectors.some(
        selector => selector.dependsOnCharacterData
      )
    );
  }

  get maybeContainsSiblingCombinators() {
    return getCachedPropertyValue(
      this, "_maybeContainsSiblingCombinators", () => this.selectors.some(
        selector => selector.maybeContainsSiblingCombinators
      )
    );
  }

  matchesMutationTypes(mutationTypes) {
    let mutationTypeMatchMap = getCachedPropertyValue(
      this, "_mutationTypeMatchMap", () => new Map([
        // All types of DOM-dependent patterns are affected by mutations of
        // type "childList".
        ["childList", true],
        ["attributes", this.maybeDependsOnAttributes],
        ["characterData", this.dependsOnCharacterData]
      ])
    );

    for (let mutationType of mutationTypes) {
      if (mutationTypeMatchMap.get(mutationType))
        return true;
    }

    return false;
  }

  /**
   * Generator function returning CSS selectors for all elements that
   * match the pattern.
   *
   * This allows transforming from selectors that may contain custom
   * :-abp- selectors to pure CSS selectors that can be used to select
   * elements.
   *
   * The selectors returned from this function may be invalidated by DOM
   * mutations.
   *
   * @param {Node} subtree the subtree we work on
   * @param {Node[]} [targets] the nodes we are interested in. May be
   * used to optimize search.
   */
  *evaluate(subtree, targets) {
    let selectors = this.selectors;
    function* evaluateInner(index, prefix, currentSubtree) {
      if (index >= selectors.length) {
        yield prefix;
        return;
      }
      for (let [selector, element] of selectors[index].getSelectors(
        prefix, currentSubtree, targets
      )) {
        if (selector == null)
          yield null;
        else
          yield* evaluateInner(index + 1, selector, element);
      }
      // Just in case the getSelectors() generator above had to run some heavy
      // document.querySelectorAll() call which didn't produce any results, make
      // sure there is at least one point where execution can pause.
      yield null;
    }
    yield* evaluateInner(0, "", subtree);
  }

  /**
   * Checks if a pattern matches a specific element
   * @param {Node} [target] the element we're interested in checking for
   * matches on.
   * @param {Node} subtree the subtree we work on
   * @return {bool}
   */
  matches(target, subtree) {
    let targetFilter = [target];
    if (this.maybeContainsSiblingCombinators)
      targetFilter = null;

    let selectorGenerator = this.evaluate(subtree, targetFilter);
    for (let selector of selectorGenerator) {
      if (selector && target.matches(selector))
        return true;
    }
    return false;
  }

  setStyles(styles) {
    for (let selector of this.selectors) {
      if (selector.dependsOnStyles)
        selector.setStyles(styles);
    }
  }
}

function extractMutationTypes(mutations) {
  let types = new Set();

  for (let mutation of mutations) {
    types.add(mutation.type);

    // There are only 3 types of mutations: "attributes", "characterData", and
    // "childList".
    if (types.size == 3)
      break;
  }

  return types;
}

function extractMutationTargets(mutations) {
  if (!mutations)
    return null;

  let targets = new Set();

  for (let mutation of mutations) {
    if (mutation.type == "childList") {
      // When new nodes are added, we're interested in the added nodes rather
      // than the parent.
      for (let node of mutation.addedNodes)
        targets.add(node);
      if (mutation.removedNodes.length > 0)
        targets.add(mutation.target);
    }
    else {
      targets.add(mutation.target);
    }
  }

  return [...targets];
}

function filterPatterns(patterns, {stylesheets, mutations}) {
  if (!stylesheets && !mutations)
    return patterns.slice();

  let mutationTypes = mutations ? extractMutationTypes(mutations) : null;

  return patterns.filter(
    pattern => (stylesheets && pattern.dependsOnStyles) ||
               (mutations && pattern.matchesMutationTypes(mutationTypes))
  );
}

function shouldObserveAttributes(patterns) {
  return patterns.some(pattern => pattern.maybeDependsOnAttributes);
}

function shouldObserveCharacterData(patterns) {
  return patterns.some(pattern => pattern.dependsOnCharacterData);
}

function shouldObserveStyles(patterns) {
  return patterns.some(pattern => pattern.dependsOnStyles);
}

/**
 * @callback hideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 * @param {string[]} elementFilters
 *   The filter text that caused the elements to be hidden
 */

/**
 * @callback unhideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 */


/**
 * Manages the front-end processing of element hiding emulation filters.
 */
exports.ElemHideEmulation = class ElemHideEmulation {
  /**
   * @param {module:content/elemHideEmulation~hideElemsFunc} hideElemsFunc
   *   A callback that should be provided to do the actual element hiding.
   * @param {module:content/elemHideEmulation~unhideElemsFunc} unhideElemsFunc
   *   A callback that should be provided to unhide previously hidden elements.
   */
  constructor(hideElemsFunc = () => {}, unhideElemsFunc = () => {}) {
    this._filteringInProgress = false;
    this._nextFilteringScheduled = false;
    this._lastInvocation = -minInvocationInterval;
    this._scheduledProcessing = null;

    this.document = document;
    this.hideElemsFunc = hideElemsFunc;
    this.unhideElemsFunc = unhideElemsFunc;
    this.observer = new MutationObserver(this.observe.bind(this));
    this.hiddenElements = new Set();
  }

  isSameOrigin(stylesheet) {
    try {
      return new URL(stylesheet.href).origin == this.document.location.origin;
    }
    catch (e) {
      // Invalid URL, assume that it is first-party.
      return true;
    }
  }

  /**
   * Parse the selector
   * @param {string} selector the selector to parse
   * @return {Array} selectors is an array of objects,
   * or null in case of errors.
   */
  parseSelector(selector) {
    if (selector.length == 0)
      return [];

    let match = abpSelectorRegexp.exec(selector);
    if (!match)
      return [new PlainSelector(selector)];

    let selectors = [];
    if (match.index > 0)
      selectors.push(new PlainSelector(selector.substring(0, match.index)));

    let startIndex = match.index + match[0].length;
    let content = parseSelectorContent(selector, startIndex);
    if (!content) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector} ` +
                                   "due to unmatched parentheses."));
      return null;
    }
    if (match[1] == "-abp-properties") {
      selectors.push(new PropsSelector(content.text));
    }
    else if (match[1] == "-abp-has" || match[1] == "has") {
      let hasSelectors = this.parseSelector(content.text);
      if (hasSelectors == null)
        return null;
      selectors.push(new HasSelector(hasSelectors));
    }
    else if (match[1] == "-abp-contains" || match[1] == "has-text") {
      selectors.push(new ContainsSelector(content.text));
    }
    else if (match[1] === "xpath") {
      try {
        selectors.push(new XPathSelector(content.text));
      }
      catch ({message}) {
        console.warn(
          new SyntaxError(
            "Failed to parse Adblock Plus " +
            `selector ${selector}, invalid ` +
            `xpath: ${content.text} ` +
            `error: ${message}.`
          )
        );

        return null;
      }
    }
    else if (match[1] == "not") {
      let notSelectors = this.parseSelector(content.text);
      if (notSelectors == null)
        return null;

      // if all of the inner selectors are PlainSelectors, then we
      // don't actually need to use our selector at all. We're better
      // off delegating to the browser :not implementation.
      if (notSelectors.every(s => s instanceof PlainSelector))
        selectors.push(new PlainSelector(`:not(${content.text})`));
      else
        selectors.push(new NotSelector(notSelectors));
    }
    else {
      // this is an error, can't parse selector.
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, invalid ` +
                                   `pseudo-class :${match[1]}().`));
      return null;
    }

    let suffix = this.parseSelector(selector.substring(content.end + 1));
    if (suffix == null)
      return null;

    selectors.push(...suffix);

    if (selectors.length == 1 && selectors[0] instanceof ContainsSelector) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, can't ` +
                                   "have a lonely :-abp-contains()."));
      return null;
    }
    return selectors;
  }

  /**
   * Reads the rules out of CSS stylesheets
   * @param {CSSStyleSheet[]} [stylesheets] The list of stylesheets to
   * read.
   * @return {CSSStyleRule[]}
   */
  _readCssRules(stylesheets) {
    let cssStyles = [];

    for (let stylesheet of stylesheets || []) {
      // Explicitly ignore third-party stylesheets to ensure consistent behavior
      // between Firefox and Chrome.
      if (!this.isSameOrigin(stylesheet))
        continue;

      let rules;
      try {
        rules = stylesheet.cssRules;
      }
      catch (e) {
        // On Firefox, there is a chance that an InvalidAccessError
        // get thrown when accessing cssRules. Just skip the stylesheet
        // in that case.
        // See https://searchfox.org/mozilla-central/rev/f65d7528e34ef1a7665b4a1a7b7cdb1388fcd3aa/layout/style/StyleSheet.cpp#699
        continue;
      }

      if (!rules)
        continue;

      for (let rule of rules) {
        if (rule.type != rule.STYLE_RULE)
          continue;

        cssStyles.push(stringifyStyle(rule));
      }
    }
    return cssStyles;
  }

  /**
   * Processes the current document and applies all rules to it.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    The list of new stylesheets that have been added to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, all of document's stylesheets will be considered
   *    then and all rules, including the ones not dependent on styles.
   * @param {MutationRecord[]} [mutations]
   *    The list of DOM mutations that have been applied to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, the entire document will be considered
   *    then and all rules, including the ones not dependent on the DOM.
   * @return {Promise}
   *    A promise that is fulfilled once all filtering is completed
   */
  async _addSelectors(stylesheets, mutations) {
    if (testInfo)
      testInfo.lastProcessedElements.clear();

    let deadline = newIdleDeadline();

    if (shouldObserveStyles(this.patterns))
      this._refreshPatternStyles();

    let patternsToCheck = filterPatterns(
      this.patterns, {stylesheets, mutations}
    );

    let targets = extractMutationTargets(mutations);

    let elementsToHide = [];
    let elementFilters = [];
    let elementsToUnhide = new Set(this.hiddenElements);

    for (let pattern of patternsToCheck) {
      let evaluationTargets = targets;

      // If the pattern appears to contain any sibling combinators, we can't
      // easily optimize based on the mutation targets. Since this is a
      // special case, skip the optimization. By setting it to null here we
      // make sure we process the entire DOM.
      if (pattern.maybeContainsSiblingCombinators)
        evaluationTargets = null;

      let generator = pattern.evaluate(this.document, evaluationTargets);
      for (let selector of generator) {
        if (selector != null) {
          for (let element of this.document.querySelectorAll(selector)) {
            if (!this.hiddenElements.has(element)) {
              elementsToHide.push(element);
              elementFilters.push(pattern.text);
            }
            else {
              elementsToUnhide.delete(element);
            }
          }
        }

        if (deadline.timeRemaining() <= 0)
          deadline = await yieldThread();
      }
    }
    this._hideElems(elementsToHide, elementFilters);

    // The search for elements to hide it optimized to find new things
    // to hide quickly, by not checking all patterns and not checking
    // the full DOM. That's why we need to do a more thorough check
    // for each remaining element that might need to be unhidden,
    // checking all patterns.
    for (let elem of elementsToUnhide) {
      if (!elem.isConnected) {
        // elements that are no longer in the DOM should be unhidden
        // in case they're ever readded, and then forgotten about so
        // we don't cause a memory leak.
        continue;
      }
      let matchesAny = this.patterns.some(pattern => pattern.matches(
        elem, this.document
      ));
      if (matchesAny)
        elementsToUnhide.delete(elem);

      if (deadline.timeRemaining() <= 0)
        deadline = await yieldThread();
    }
    this._unhideElems(Array.from(elementsToUnhide));
  }

  _hideElems(elementsToHide, elementFilters) {
    if (elementsToHide.length > 0) {
      this.hideElemsFunc(elementsToHide, elementFilters);
      for (let elem of elementsToHide)
        this.hiddenElements.add(elem);
    }
  }

  _unhideElems(elementsToUnhide) {
    if (elementsToUnhide.length > 0) {
      this.unhideElemsFunc(elementsToUnhide);
      for (let elem of elementsToUnhide)
        this.hiddenElements.delete(elem);
    }
  }

  /**
   * Performed any scheduled processing.
   *
   * This function is asyncronous, and should not be run multiple
   * times in parallel. The flag `_filteringInProgress` is set and
   * unset so you can check if it's already running.
   * @return {Promise}
   *  A promise that is fulfilled once all filtering is completed
   */
  async _processFiltering() {
    if (this._filteringInProgress) {
      console.warn("ElemHideEmulation scheduling error: " +
                   "Tried to process filtering in parallel.");
      if (testInfo) {
        testInfo.failedAssertions.push(
          "Tried to process filtering in parallel"
        );
      }
      return;
    }
    let params = this._scheduledProcessing || {};
    this._scheduledProcessing = null;
    this._filteringInProgress = true;
    this._nextFilteringScheduled = false;
    await this._addSelectors(
      params.stylesheets,
      params.mutations
    );
    this._lastInvocation = performance.now();
    this._filteringInProgress = false;
    if (this._scheduledProcessing)
      this._scheduleNextFiltering();
  }

  /**
   * Appends new changes to the list of filters for the next time
   * filtering is run.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  _appendScheduledProcessing(stylesheets, mutations) {
    if (!this._scheduledProcessing) {
      // There isn't anything scheduled yet. Make the schedule.
      this._scheduledProcessing = {stylesheets, mutations};
    }
    else if (!stylesheets && !mutations) {
      // The new request was to reprocess everything, and so any
      // previous filters are irrelevant.
      this._scheduledProcessing = {};
    }
    else if (this._scheduledProcessing.stylesheets ||
             this._scheduledProcessing.mutations) {
      // The previous filters are not to filter everything, so the new
      // parameters matter. Push them onto the appropriate lists.
      if (stylesheets) {
        if (!this._scheduledProcessing.stylesheets)
          this._scheduledProcessing.stylesheets = [];
        this._scheduledProcessing.stylesheets.push(...stylesheets);
      }
      if (mutations) {
        if (!this._scheduledProcessing.mutations)
          this._scheduledProcessing.mutations = [];
        this._scheduledProcessing.mutations.push(...mutations);
      }
    }
    else {
      // this._scheduledProcessing is already going to recheck
      // everything, so no need to do anything here.
    }
  }

  /**
   * Schedule filtering to be processed in the future, or start
   * processing immediately.
   *
   * If processing is already scheduled, this does nothing.
   */
  _scheduleNextFiltering() {
    if (this._nextFilteringScheduled || this._filteringInProgress) {
      // The next one has already been scheduled. Our new events are
      // on the queue, so nothing more to do.
      return;
    }

    if (this.document.readyState === "loading") {
      // Document isn't fully loaded yet, so schedule our first
      // filtering as soon as that's done.
      this.document.addEventListener(
        "DOMContentLoaded",
        () => this._processFiltering(),
        {once: true}
      );
      this._nextFilteringScheduled = true;
    }
    else if (performance.now() - this._lastInvocation <
             minInvocationInterval) {
      // It hasn't been long enough since our last filter. Set the
      // timeout for when it's time for that.
      setTimeout(
        () => this._processFiltering(),
        minInvocationInterval - (performance.now() - this._lastInvocation)
      );
      this._nextFilteringScheduled = true;
    }
    else {
      // We can actually just start filtering immediately!
      this._processFiltering();
    }
  }

  /**
   * Re-run filtering either immediately or queued.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  queueFiltering(stylesheets, mutations) {
    this._appendScheduledProcessing(stylesheets, mutations);
    this._scheduleNextFiltering();
  }

  _refreshPatternStyles(stylesheet) {
    let allCssRules = this._readCssRules(this.document.styleSheets);
    for (let pattern of this.patterns)
      pattern.setStyles(allCssRules);
  }

  onLoad(event) {
    let stylesheet = event.target.sheet;
    if (stylesheet)
      this.queueFiltering([stylesheet]);
  }

  observe(mutations) {
    if (testInfo) {
      // In test mode, filter out any mutations likely done by us
      // (i.e. style="display: none !important"). This makes it easier to
      // observe how the code responds to DOM mutations.
      mutations = mutations.filter(
        ({type, attributeName, target: {style: newValue}, oldValue}) =>
          !(type == "attributes" && attributeName == "style" &&
            newValue.display == "none" &&
            toCSSStyleDeclaration(oldValue).display != "none")
      );

      if (mutations.length == 0)
        return;
    }

    this.queueFiltering(null, mutations);
  }

  apply(patterns) {
    this.patterns = [];
    for (let pattern of patterns) {
      let selectors = this.parseSelector(pattern.selector);
      if (selectors != null && selectors.length > 0)
        this.patterns.push(new Pattern(selectors, pattern.text));
    }

    if (this.patterns.length > 0) {
      this.queueFiltering();

      let attributes = shouldObserveAttributes(this.patterns);
      this.observer.observe(
        this.document,
        {
          childList: true,
          attributes,
          attributeOldValue: attributes && !!testInfo,
          characterData: shouldObserveCharacterData(this.patterns),
          subtree: true
        }
      );
      if (shouldObserveStyles(this.patterns)) {
        let onLoad = this.onLoad.bind(this);
        if (this.document.readyState === "loading")
          this.document.addEventListener("DOMContentLoaded", onLoad, true);
        this.document.addEventListener("load", onLoad, true);
      }
    }
  }
};


/***/ }),

/***/ "./node_modules/adblockpluscore/lib/patterns.js":
/*!******************************************************!*\
  !*** ./node_modules/adblockpluscore/lib/patterns.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



/**
 * The maximum number of patterns that
 * `{@link module:patterns.compilePatterns compilePatterns()}` will compile
 * into regular expressions.
 * @type {number}
 */
const COMPILE_PATTERNS_MAX = 100;

/**
 * Regular expression used to match the `^` suffix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let separatorRegExp = /[\x00-\x24\x26-\x2C\x2F\x3A-\x40\x5B-\x5E\x60\x7B-\x7F]/;

let filterToRegExp =
/**
 * Converts filter text into regular expression string
 * @param {string} text as in Filter()
 * @return {string} regular expression representation of filter text
 * @package
 */
exports.filterToRegExp = function filterToRegExp(text) {
  // remove multiple wildcards
  text = text.replace(/\*+/g, "*");

  // remove leading wildcard
  if (text[0] == "*")
    text = text.substring(1);

  // remove trailing wildcard
  if (text[text.length - 1] == "*")
    text = text.substring(0, text.length - 1);

  return text
    // remove anchors following separator placeholder
    .replace(/\^\|$/, "^")
    // escape special symbols
    .replace(/\W/g, "\\$&")
    // replace wildcards by .*
    .replace(/\\\*/g, ".*")
    // process separator placeholders (all ANSI characters but alphanumeric
    // characters and _%.-)
    .replace(/\\\^/g, `(?:${separatorRegExp.source}|$)`)
    // process extended anchor at expression start
    .replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?:[^\\/]+\\.)?")
    // process anchor at expression start
    .replace(/^\\\|/, "^")
    // process anchor at expression end
    .replace(/\\\|$/, "$");
};

/**
 * Regular expression used to match the `||` prefix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let extendedAnchorRegExp = new RegExp(filterToRegExp("||") + "$");

/**
 * Regular expression for matching a keyword in a filter.
 * @type {RegExp}
 */
let keywordRegExp = /[^a-z0-9%*][a-z0-9%]{2,}(?=[^a-z0-9%*])/;

/**
 * Regular expression for matching all keywords in a filter.
 * @type {RegExp}
 */
let allKeywordsRegExp = new RegExp(keywordRegExp, "g");

/**
 * A `CompiledPatterns` object represents the compiled version of multiple URL
 * request patterns. It is returned by
 * `{@link module:patterns.compilePatterns compilePatterns()}`.
 */
class CompiledPatterns {
  /**
   * Creates an object with the given regular expressions for case-sensitive
   * and case-insensitive matching respectively.
   * @param {?RegExp} [caseSensitive]
   * @param {?RegExp} [caseInsensitive]
   * @private
   */
  constructor(caseSensitive, caseInsensitive) {
    this._caseSensitive = caseSensitive;
    this._caseInsensitive = caseInsensitive;
  }

  /**
   * Tests whether the given URL request matches the patterns used to create
   * this object.
   * @param {module:url.URLRequest} request
   * @returns {boolean}
   */
  test(request) {
    return ((this._caseSensitive &&
             this._caseSensitive.test(request.href)) ||
            (this._caseInsensitive &&
             this._caseInsensitive.test(request.lowerCaseHref)));
  }
}

/**
 * Compiles patterns from the given filters into a single
 * `{@link module:patterns~CompiledPatterns CompiledPatterns}` object.
 *
 * @param {module:filterClasses.URLFilter|
 *         Set.<module:filterClasses.URLFilter>} filters
 *   The filters. If the number of filters exceeds
 *   `{@link module:patterns~COMPILE_PATTERNS_MAX COMPILE_PATTERNS_MAX}`, the
 *   function returns `null`.
 *
 * @returns {?module:patterns~CompiledPatterns}
 *
 * @package
 */
exports.compilePatterns = function compilePatterns(filters) {
  let list = Array.isArray(filters) ? filters : [filters];

  // If the number of filters is too large, it may choke especially on low-end
  // platforms. As a precaution, we refuse to compile. Ideally we would check
  // the length of the regular expression source rather than the number of
  // filters, but this is far more straightforward and practical.
  if (list.length > COMPILE_PATTERNS_MAX)
    return null;

  let caseSensitive = "";
  let caseInsensitive = "";

  for (let filter of filters) {
    let source = filter.urlPattern.regexpSource;

    if (filter.matchCase)
      caseSensitive += source + "|";
    else
      caseInsensitive += source + "|";
  }

  let caseSensitiveRegExp = null;
  let caseInsensitiveRegExp = null;

  try {
    if (caseSensitive)
      caseSensitiveRegExp = new RegExp(caseSensitive.slice(0, -1));

    if (caseInsensitive)
      caseInsensitiveRegExp = new RegExp(caseInsensitive.slice(0, -1));
  }
  catch (error) {
    // It is possible in theory for the regular expression to be too large
    // despite COMPILE_PATTERNS_MAX
    return null;
  }

  return new CompiledPatterns(caseSensitiveRegExp, caseInsensitiveRegExp);
};

/**
 * Patterns for matching against URLs.
 *
 * Internally, this may be a RegExp or match directly against the
 * pattern for simple literal patterns.
 */
exports.Pattern = class Pattern {
  /**
   * @param {string} pattern pattern that requests URLs should be
   * matched against in filter text notation
   * @param {bool} matchCase `true` if comparisons must be case
   * sensitive
   */
  constructor(pattern, matchCase) {
    this.matchCase = matchCase || false;

    if (!this.matchCase)
      pattern = pattern.toLowerCase();

    if (pattern.length >= 2 &&
        pattern[0] == "/" &&
        pattern[pattern.length - 1] == "/") {
      // The filter is a regular expression - convert it immediately to
      // catch syntax errors
      pattern = pattern.substring(1, pattern.length - 1);
      this._regexp = new RegExp(pattern);
    }
    else {
      // Patterns like /foo/bar/* exist so that they are not treated as regular
      // expressions. We drop any superfluous wildcards here so our
      // optimizations can kick in.
      pattern = pattern.replace(/^\*+/, "").replace(/\*+$/, "");

      // No need to convert this filter to regular expression yet, do it on
      // demand
      this.pattern = pattern;
    }
  }

  /**
   * Checks whether the pattern is a string of literal characters with
   * no wildcards or any other special characters.
   *
   * If the pattern is prefixed with a `||` or suffixed with a `^` but otherwise
   * contains no special characters, it is still considered to be a literal
   * pattern.
   *
   * @returns {boolean}
   */
  isLiteralPattern() {
    return typeof this.pattern !== "undefined" &&
      !/[*^|]/.test(this.pattern.replace(/^\|{1,2}/, "").replace(/[|^]$/, ""));
  }

  /**
   * Regular expression to be used when testing against this pattern.
   *
   * null if the pattern is matched without using regular expressions.
   * @type {RegExp}
   */
  get regexp() {
    if (typeof this._regexp == "undefined") {
      this._regexp = this.isLiteralPattern() ?
        null : new RegExp(filterToRegExp(this.pattern));
    }
    return this._regexp;
  }

  /**
   * Pattern in regular expression notation. This will have a value
   * even if `regexp` returns null.
   * @type {string}
   */
  get regexpSource() {
    return this._regexp ? this._regexp.source : filterToRegExp(this.pattern);
  }

  /**
   * Checks whether the given URL request matches this filter's pattern.
   * @param {module:url.URLRequest} request The URL request to check.
   * @returns {boolean} `true` if the URL request matches.
   */
  matchesLocation(request) {
    let location = this.matchCase ? request.href : request.lowerCaseHref;
    let regexp = this.regexp;
    if (regexp)
      return regexp.test(location);

    let pattern = this.pattern;
    let startsWithAnchor = pattern[0] == "|";
    let startsWithExtendedAnchor = startsWithAnchor && pattern[1] == "|";
    let endsWithSeparator = pattern[pattern.length - 1] == "^";
    let endsWithAnchor = !endsWithSeparator &&
        pattern[pattern.length - 1] == "|";

    if (startsWithExtendedAnchor)
      pattern = pattern.substr(2);
    else if (startsWithAnchor)
      pattern = pattern.substr(1);

    if (endsWithSeparator || endsWithAnchor)
      pattern = pattern.slice(0, -1);

    let index = location.indexOf(pattern);

    while (index != -1) {
      // The "||" prefix requires that the text that follows does not start
      // with a forward slash.
      if ((startsWithExtendedAnchor ?
           location[index] != "/" &&
           extendedAnchorRegExp.test(location.substring(0, index)) :
           startsWithAnchor ?
           index == 0 :
           true) &&
          (endsWithSeparator ?
           !location[index + pattern.length] ||
           separatorRegExp.test(location[index + pattern.length]) :
           endsWithAnchor ?
           index == location.length - pattern.length :
           true))
        return true;

      if (pattern == "")
        return true;

      index = location.indexOf(pattern, index + 1);
    }

    return false;
  }

  /**
   * Checks whether the pattern has keywords
   * @returns {boolean}
   */
  hasKeywords() {
    return this.pattern && keywordRegExp.test(this.pattern);
  }

  /**
   * Finds all keywords that could be associated with this pattern
   * @returns {string[]}
   */
  keywordCandidates() {
    if (!this.pattern)
      return null;
    return this.pattern.toLowerCase().match(allKeywordsRegExp);
  }
};


/***/ }),

/***/ "./node_modules/webextension-polyfill/dist/browser-polyfill.js":
/*!*********************************************************************!*\
  !*** ./node_modules/webextension-polyfill/dist/browser-polyfill.js ***!
  \*********************************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.8.0 - Tue Apr 20 2021 11:27:38 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
    const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)"; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.reject
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      });

      const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps an onRequestFinished listener function so that it will return a
         * `getContent()` property which returns a `Promise` rather than using a
         * callback API.
         *
         * @param {object} req
         *        The HAR entry object representing the network request.
         */


        return function onRequestFinished(req) {
          const wrappedReq = wrapObject(req, {}
          /* wrappers */
          , {
            getContent: {
              minArgs: 0,
              maxArgs: 0
            }
          });
          listener(wrappedReq);
        };
      }); // Keep track if the deprecation warning has been logged at least once.

      let loggedSendResponseDeprecationWarning = false;
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              if (!loggedSendResponseDeprecationWarning) {
                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                loggedSendResponseDeprecationWarning = true;
              }

              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(new Error(extensionAPIs.runtime.lastError.message));
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        devtools: {
          network: {
            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
          }
        },
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    };

    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      throw new Error("This script should only be loaded in a browser extension.");
    } // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = browser;
  }
});


/***/ }),

/***/ "./sdk/content/allowlisting.js":
/*!*************************************!*\
  !*** ./sdk/content/allowlisting.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "stopOneClickAllowlisting": () => (/* binding */ stopOneClickAllowlisting),
/* harmony export */   "startOneClickAllowlisting": () => (/* binding */ startOneClickAllowlisting)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const MAX_ERROR_THRESHOLD = 30;
const MAX_QUEUED_EVENTS = 20;
const EVENT_INTERVAL_MS = 100;

let errorCount = 0;
let eventProcessingInterval = null;
let eventProcessingInProgress = false;
let eventQueue = [];

function isEventTrusted(event) {
  return Object.getPrototypeOf(event) === CustomEvent.prototype &&
    !Object.hasOwnProperty.call(event, "detail");
}

async function allowlistDomain(event) {
  if (!isEventTrusted(event))
    return false;

  return (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
    webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({
      type: "ewe:allowlist-page",
      timestamp: event.detail.timestamp,
      signature: event.detail.signature
    })
  );
}

async function processNextEvent() {
  if (eventProcessingInProgress)
    return;

  try {
    eventProcessingInProgress = true;
    let event = eventQueue.shift();
    if (event) {
      try {
        let allowlistingResult = await allowlistDomain(event);
        if (allowlistingResult === true) {
          document.dispatchEvent(new Event("domain_allowlisting_success"));
          stopOneClickAllowlisting();
        }
        else {
          throw new Error("Domain allowlisting rejected");
        }
      }
      catch (e) {
        errorCount++;
        if (errorCount >= MAX_ERROR_THRESHOLD)
          stopOneClickAllowlisting();
      }
    }

    if (!eventQueue.length)
      stopProcessingInterval();
  }
  finally {
    eventProcessingInProgress = false;
  }
}

function onDomainAllowlistingRequest(event) {
  if (eventQueue.length >= MAX_QUEUED_EVENTS)
    return;

  eventQueue.push(event);
  startProcessingInterval();
}

function startProcessingInterval() {
  if (!eventProcessingInterval) {
    processNextEvent();
    eventProcessingInterval = setInterval(processNextEvent, EVENT_INTERVAL_MS);
  }
}

function stopProcessingInterval() {
  clearInterval(eventProcessingInterval);
  eventProcessingInterval = null;
}

function stopOneClickAllowlisting() {
  document.removeEventListener("domain_allowlisting_request",
                               onDomainAllowlistingRequest, true);
  eventQueue = [];
  stopProcessingInterval();
}

function startOneClickAllowlisting() {
  document.addEventListener("domain_allowlisting_request",
                            onDomainAllowlistingRequest, true);
}


/***/ }),

/***/ "./sdk/content/element-collapsing.js":
/*!*******************************************!*\
  !*** ./sdk/content/element-collapsing.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hideElement": () => (/* binding */ hideElement),
/* harmony export */   "unhideElement": () => (/* binding */ unhideElement),
/* harmony export */   "startElementCollapsing": () => (/* binding */ startElementCollapsing)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




let collapsedSelectors = new Set();
let observers = new WeakMap();

function getURLFromElement(element) {
  if (element.localName == "object") {
    if (element.data)
      return element.data;

    for (let child of element.children) {
      if (child.localName == "param" && child.name == "movie" && child.value)
        return new URL(child.value, document.baseURI).href;
    }

    return null;
  }

  return element.currentSrc || element.src;
}

function getSelectorForBlockedElement(element) {
  // Setting the "display" CSS property to "none" doesn't have any effect on
  // <frame> elements (in framesets). So we have to hide it inline through
  // the "visibility" CSS property.
  if (element.localName == "frame")
    return null;

  // If the <video> or <audio> element contains any <source> children,
  // we cannot address it in CSS by the source URL; in that case we
  // don't "collapse" it using a CSS selector but rather hide it directly by
  // setting the style="..." attribute.
  if (element.localName == "video" || element.localName == "audio") {
    for (let child of element.children) {
      if (child.localName == "source")
        return null;
    }
  }

  let selector = "";
  for (let attr of ["src", "srcset"]) {
    let value = element.getAttribute(attr);
    if (value && attr in element)
      selector += "[" + attr + "=" + CSS.escape(value) + "]";
  }

  return selector ? element.localName + selector : null;
}

function hideElement(element, properties) {
  let {style} = element;

  if (!properties) {
    if (element.localName == "frame")
      properties = [["visibility", "hidden"]];
    else
      properties = [["display", "none"]];
  }

  for (let [key, value] of properties)
    style.setProperty(key, value, "important");

  if (observers.has(element))
    observers.get(element).disconnect();

  let observer = new MutationObserver(() => {
    for (let [key, value] of properties) {
      if (style.getPropertyValue(key) != value ||
          style.getPropertyPriority(key) != "important")
        style.setProperty(key, value, "important");
    }
  });
  observer.observe(
    element, {
      attributes: true,
      attributeFilter: ["style"]
    }
  );
  observers.set(element, observer);
}

function unhideElement(element) {
  let observer = observers.get(element);
  if (observer) {
    observer.disconnect();
    observers.delete(element);
  }

  let property = element.localName == "frame" ? "visibility" : "display";
  element.style.removeProperty(property);
}

function collapseElement(element) {
  let selector = getSelectorForBlockedElement(element);
  if (!selector) {
    hideElement(element);
    return;
  }

  if (!collapsedSelectors.has(selector)) {
    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
      webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({
        type: "ewe:inject-css",
        selector
      })
    );
    collapsedSelectors.add(selector);
  }
}

function hideInAboutBlankFrames(selector, urls) {
  // Resources (e.g. images) loaded into about:blank frames
  // are (sometimes) loaded with the frameId of the main_frame.
  for (let frame of document.querySelectorAll("iframe[src='about:blank']")) {
    if (!frame.contentDocument)
      continue;

    for (let element of frame.contentDocument.querySelectorAll(selector)) {
      // Use hideElement, because we don't have the correct frameId
      // for the "ewe:inject-css" message.
      if (urls.has(getURLFromElement(element)))
        hideElement(element);
    }
  }
}

function startElementCollapsing() {
  let deferred = null;

  webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.onMessage.addListener((message, sender) => {
    if (!message || message.type != "ewe:collapse")
      return false;

    if (document.readyState == "loading") {
      if (!deferred) {
        deferred = new Map();
        document.addEventListener("DOMContentLoaded", () => {
          for (let [selector, urls] of deferred) {
            for (let element of document.querySelectorAll(selector)) {
              if (urls.has(getURLFromElement(element)))
                collapseElement(element);
            }

            hideInAboutBlankFrames(selector, urls);
          }

          deferred = null;
        });
      }

      let urls = deferred.get(message.selector) || new Set();
      deferred.set(message.selector, urls);
      urls.add(message.url);
    }
    else {
      for (let element of document.querySelectorAll(message.selector)) {
        if (getURLFromElement(element) == message.url)
          collapseElement(element);
      }

      hideInAboutBlankFrames(message.selector, new Set([message.url]));
    }
    return true;
  });
}


/***/ }),

/***/ "./sdk/content/element-hiding-tracer.js":
/*!**********************************************!*\
  !*** ./sdk/content/element-hiding-tracer.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ElementHidingTracer": () => (/* binding */ ElementHidingTracer)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




class ElementHidingTracer {
  constructor(selectors) {
    this.selectors = new Map(selectors);

    this.observer = new MutationObserver(() => {
      this.observer.disconnect();
      setTimeout(() => this.trace(), 1000);
    });

    if (document.readyState == "loading")
      document.addEventListener("DOMContentLoaded", () => this.trace());
    else
      this.trace();
  }

  log(filters, selectors = []) {
    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage(
      {type: "ewe:trace-elem-hide", filters, selectors}
    ));
  }

  trace() {
    let filters = [];
    let selectors = [];

    for (let [selector, filter] of this.selectors) {
      if (document.querySelector(selector)) {
        this.selectors.delete(selector);
        if (filter)
          filters.push(filter);
        else
          selectors.push(selector);
      }
    }

    if (filters.length > 0 || selectors.length > 0)
      this.log(filters, selectors);

    this.observer.observe(document, {childList: true,
                                     attributes: true,
                                     subtree: true});
  }
}


/***/ }),

/***/ "./sdk/content/subscribe-links.js":
/*!****************************************!*\
  !*** ./sdk/content/subscribe-links.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "subscribeLinksEnabled": () => (/* binding */ subscribeLinksEnabled),
/* harmony export */   "handleSubscribeLinks": () => (/* binding */ handleSubscribeLinks)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const ALLOWED_DOMAINS = new Set([
  "abpchina.org",
  "abpindo.blogspot.com",
  "abpvn.com",
  "adblock.ee",
  "adblock.gardar.net",
  "adblockplus.me",
  "adblockplus.org",
  "commentcamarche.net",
  "droit-finances.commentcamarche.com",
  "easylist.to",
  "eyeo.com",
  "fanboy.co.nz",
  "filterlists.com",
  "forums.lanik.us",
  "gitee.com",
  "gitee.io",
  "github.com",
  "github.io",
  "gitlab.com",
  "gitlab.io",
  "gurud.ee",
  "hugolescargot.com",
  "i-dont-care-about-cookies.eu",
  "journaldesfemmes.fr",
  "journaldunet.com",
  "linternaute.com",
  "spam404.com",
  "stanev.org",
  "void.gr",
  "xfiles.noads.it",
  "zoso.ro"
]);

function isDomainAllowed(domain) {
  if (domain.endsWith("."))
    domain = domain.substring(0, domain.length - 1);

  while (true) {
    if (ALLOWED_DOMAINS.has(domain))
      return true;
    let index = domain.indexOf(".");
    if (index == -1)
      return false;
    domain = domain.substr(index + 1);
  }
}

function subscribeLinksEnabled(url) {
  let {protocol, hostname} = new URL(url);
  return hostname == "localhost" ||
    protocol == "https:" && isDomainAllowed(hostname);
}

function handleSubscribeLinks() {
  document.addEventListener("click", event => {
    if (event.button == 2 || !event.isTrusted)
      return;

    let link = event.target;
    while (!(link instanceof HTMLAnchorElement)) {
      link = link.parentNode;

      if (!link)
        return;
    }

    let queryString = null;
    if (link.protocol == "http:" || link.protocol == "https:") {
      if (link.host == "subscribe.adblockplus.org" && link.pathname == "/")
        queryString = link.search.substr(1);
    }
    else {
      // Firefox doesn't seem to populate the "search" property for
      // links with non-standard URL schemes so we need to extract the query
      // string manually.
      let match = /^abp:\/*subscribe\/*\?(.*)/i.exec(link.href);
      if (match)
        queryString = match[1];
    }

    if (!queryString)
      return;

    let title = null;
    let url = null;
    for (let param of queryString.split("&")) {
      let parts = param.split("=", 2);
      if (parts.length != 2 || !/\S/.test(parts[1]))
        continue;
      switch (parts[0]) {
        case "title":
          title = decodeURIComponent(parts[1]);
          break;
        case "location":
          url = decodeURIComponent(parts[1]);
          break;
      }
    }
    if (!url)
      return;

    if (!title)
      title = url;

    title = title.trim();
    url = url.trim();
    if (!/^(https?|ftp):/.test(url))
      return;

    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
      webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({type: "ewe:subscribe-link-clicked",
                                   title, url})
    );

    event.preventDefault();
    event.stopPropagation();
  }, true);
}


/***/ }),

/***/ "./sdk/errors.js":
/*!***********************!*\
  !*** ./sdk/errors.js ***!
  \***********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ERROR_DUPLICATE_FILTERS": () => (/* binding */ ERROR_DUPLICATE_FILTERS),
/* harmony export */   "ERROR_FILTER_NOT_FOUND": () => (/* binding */ ERROR_FILTER_NOT_FOUND),
/* harmony export */   "ERROR_TOO_MANY_FILTERS": () => (/* binding */ ERROR_TOO_MANY_FILTERS),
/* harmony export */   "ignoreNoConnectionError": () => (/* binding */ ignoreNoConnectionError)
/* harmony export */ });
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */

const ERROR_NO_CONNECTION = "Could not establish connection. " +
      "Receiving end does not exist.";
const ERROR_CLOSED_CONNECTION = "A listener indicated an asynchronous " +
      "response by returning true, but the message channel closed before a " +
      "response was received";

const ERROR_DUPLICATE_FILTERS = "storage_duplicate_filters";
const ERROR_FILTER_NOT_FOUND = "filter_not_found";
const ERROR_TOO_MANY_FILTERS = "too_many_filters";

function ignoreNoConnectionError(promise) {
  return promise.catch(error => {
    if (typeof error == "object" &&
        (error.message == ERROR_NO_CONNECTION ||
         error.message == ERROR_CLOSED_CONNECTION))
      return;

    throw error;
  });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************************!*\
  !*** ./sdk/content/index.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var adblockpluscore_lib_content_elemHideEmulation_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! adblockpluscore/lib/content/elemHideEmulation.js */ "./node_modules/adblockpluscore/lib/content/elemHideEmulation.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/* harmony import */ var _element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./element-collapsing.js */ "./sdk/content/element-collapsing.js");
/* harmony import */ var _allowlisting_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./allowlisting.js */ "./sdk/content/allowlisting.js");
/* harmony import */ var _element_hiding_tracer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./element-hiding-tracer.js */ "./sdk/content/element-hiding-tracer.js");
/* harmony import */ var _subscribe_links_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./subscribe-links.js */ "./sdk/content/subscribe-links.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */











async function initContentFeatures() {
  if ((0,_subscribe_links_js__WEBPACK_IMPORTED_MODULE_6__.subscribeLinksEnabled)(window.location.href))
    (0,_subscribe_links_js__WEBPACK_IMPORTED_MODULE_6__.handleSubscribeLinks)();

  let response = await (0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.ignoreNoConnectionError)(
    webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({type: "ewe:content-hello"})
  );

  if (!response)
    return;

  let tracer;
  if (response.tracedSelectors)
    tracer = new _element_hiding_tracer_js__WEBPACK_IMPORTED_MODULE_5__.ElementHidingTracer(response.tracedSelectors);

  if (response.emulatedPatterns.length > 0) {
    let elemHideEmulation = new adblockpluscore_lib_content_elemHideEmulation_js__WEBPACK_IMPORTED_MODULE_1__.ElemHideEmulation((elements, filters) => {
      for (let element of elements)
        (0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.hideElement)(element, response.cssProperties);

      if (tracer)
        tracer.log(filters);
    }, elements => {
      for (let element of elements)
        (0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.unhideElement)(element);
    });
    elemHideEmulation.apply(response.emulatedPatterns);
  }
}

(0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.startElementCollapsing)();
(0,_allowlisting_js__WEBPACK_IMPORTED_MODULE_4__.startOneClickAllowlisting)();
initContentFeatures();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vbm9kZV9tb2R1bGVzL2FkYmxvY2twbHVzY29yZS9saWIvY29tbW9uLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9ub2RlX21vZHVsZXMvYWRibG9ja3BsdXNjb3JlL2xpYi9jb250ZW50L2VsZW1IaWRlRW11bGF0aW9uLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9ub2RlX21vZHVsZXMvYWRibG9ja3BsdXNjb3JlL2xpYi9wYXR0ZXJucy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vbm9kZV9tb2R1bGVzL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9kaXN0L2Jyb3dzZXItcG9seWZpbGwuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L2FsbG93bGlzdGluZy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vc2RrL2NvbnRlbnQvZWxlbWVudC1jb2xsYXBzaW5nLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9zZGsvY29udGVudC9lbGVtZW50LWhpZGluZy10cmFjZXIuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L3N1YnNjcmliZS1saW5rcy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vc2RrL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbImJyb3dzZXIiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsIkNIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSIsIlNFTkRfUkVTUE9OU0VfREVQUkVDQVRJT05fV0FSTklORyIsIndyYXBBUElzIiwiZXh0ZW5zaW9uQVBJcyIsImFwaU1ldGFkYXRhIiwia2V5cyIsImxlbmd0aCIsIkVycm9yIiwiRGVmYXVsdFdlYWtNYXAiLCJXZWFrTWFwIiwiY29uc3RydWN0b3IiLCJjcmVhdGVJdGVtIiwiaXRlbXMiLCJ1bmRlZmluZWQiLCJnZXQiLCJrZXkiLCJoYXMiLCJzZXQiLCJpc1RoZW5hYmxlIiwidmFsdWUiLCJ0aGVuIiwibWFrZUNhbGxiYWNrIiwicHJvbWlzZSIsIm1ldGFkYXRhIiwiY2FsbGJhY2tBcmdzIiwicnVudGltZSIsImxhc3RFcnJvciIsInJlamVjdCIsIm1lc3NhZ2UiLCJzaW5nbGVDYWxsYmFja0FyZyIsInJlc29sdmUiLCJwbHVyYWxpemVBcmd1bWVudHMiLCJudW1BcmdzIiwid3JhcEFzeW5jRnVuY3Rpb24iLCJuYW1lIiwiYXN5bmNGdW5jdGlvbldyYXBwZXIiLCJ0YXJnZXQiLCJhcmdzIiwibWluQXJncyIsIm1heEFyZ3MiLCJQcm9taXNlIiwiZmFsbGJhY2tUb05vQ2FsbGJhY2siLCJjYkVycm9yIiwiY29uc29sZSIsIndhcm4iLCJub0NhbGxiYWNrIiwid3JhcE1ldGhvZCIsIm1ldGhvZCIsIndyYXBwZXIiLCJQcm94eSIsImFwcGx5IiwidGFyZ2V0TWV0aG9kIiwidGhpc09iaiIsImNhbGwiLCJoYXNPd25Qcm9wZXJ0eSIsIkZ1bmN0aW9uIiwiYmluZCIsIndyYXBPYmplY3QiLCJ3cmFwcGVycyIsImNhY2hlIiwiY3JlYXRlIiwiaGFuZGxlcnMiLCJwcm94eVRhcmdldCIsInByb3AiLCJyZWNlaXZlciIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsImRlc2MiLCJSZWZsZWN0IiwiZGVsZXRlUHJvcGVydHkiLCJ3cmFwRXZlbnQiLCJ3cmFwcGVyTWFwIiwiYWRkTGlzdGVuZXIiLCJsaXN0ZW5lciIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzIiwib25SZXF1ZXN0RmluaXNoZWQiLCJyZXEiLCJ3cmFwcGVkUmVxIiwiZ2V0Q29udGVudCIsImxvZ2dlZFNlbmRSZXNwb25zZURlcHJlY2F0aW9uV2FybmluZyIsIm9uTWVzc2FnZVdyYXBwZXJzIiwib25NZXNzYWdlIiwic2VuZGVyIiwic2VuZFJlc3BvbnNlIiwiZGlkQ2FsbFNlbmRSZXNwb25zZSIsIndyYXBwZWRTZW5kUmVzcG9uc2UiLCJzZW5kUmVzcG9uc2VQcm9taXNlIiwicmVzcG9uc2UiLCJzdGFjayIsInJlc3VsdCIsImVyciIsImlzUmVzdWx0VGhlbmFibGUiLCJzZW5kUHJvbWlzZWRSZXN1bHQiLCJtc2ciLCJlcnJvciIsIl9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXyIsImNhdGNoIiwid3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2siLCJyZXBseSIsIndyYXBwZWRTZW5kTWVzc2FnZSIsImFwaU5hbWVzcGFjZU9iaiIsIndyYXBwZWRDYiIsInB1c2giLCJzZW5kTWVzc2FnZSIsInN0YXRpY1dyYXBwZXJzIiwiZGV2dG9vbHMiLCJuZXR3b3JrIiwib25NZXNzYWdlRXh0ZXJuYWwiLCJ0YWJzIiwic2V0dGluZ01ldGFkYXRhIiwiY2xlYXIiLCJwcml2YWN5Iiwic2VydmljZXMiLCJ3ZWJzaXRlcyIsImNocm9tZSIsImlkIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FB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QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsS0FBSztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLEtBQUs7QUFDbEI7QUFDQSxhQUFhLEtBQUs7QUFDbEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFD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Q0E7O0FBRUE7QUFDQTs7QUFFQSxxQ0FBcUM7QUFDckM7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUU0QztBQUNTOztBQUVyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQLE9BQU8sbUJBQW1CO0FBQzFCO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQUksbUVBQXVCO0FBQzNCLE1BQU0sc0VBQTJCLEVBQUU7QUFDbkMsOENBQThDO0FBQzlDOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ0E7QUFDQTs7QUFFQTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7VUNwQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx3Q0FBd0MseUNBQXlDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHNEQUFzRCxrQkFBa0I7V0FDeEU7V0FDQSwrQ0FBK0MsY0FBYztXQUM3RCxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFNEM7O0FBR2M7O0FBRUw7QUFFcEI7QUFDMkI7QUFDRztBQUNrQjs7QUFFakY7QUFDQSxNQUFNLDBFQUFxQjtBQUMzQixJQUFJLHlFQUFvQjs7QUFFeEIsdUJBQXVCLG1FQUF1QjtBQUM5QyxJQUFJLHNFQUEyQixFQUFFLDBCQUEwQjtBQUMzRDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQkFBaUIsMEVBQW1COztBQUVwQztBQUNBLGdDQUFnQywrRkFBaUI7QUFDakQ7QUFDQSxRQUFRLG1FQUFXOztBQUVuQjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsUUFBUSxxRUFBYTtBQUNyQixLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBLDhFQUFzQjtBQUN0QiwyRUFBeUI7QUFDekIiLCJmaWxlIjoiZXdlLWNvbnRlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgQWRibG9jayBQbHVzIDxodHRwczovL2FkYmxvY2twbHVzLm9yZy8+LFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEFkYmxvY2sgUGx1cy4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiogQG1vZHVsZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxubGV0IHRleHRUb1JlZ0V4cCA9XG4vKipcbiAqIENvbnZlcnRzIHJhdyB0ZXh0IGludG8gYSByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCB0aGUgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm4ge3N0cmluZ30gcmVndWxhciBleHByZXNzaW9uIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0ZXh0XG4gKiBAcGFja2FnZVxuICovXG5leHBvcnRzLnRleHRUb1JlZ0V4cCA9IHRleHQgPT4gdGV4dC5yZXBsYWNlKC9bLS9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKTtcblxuY29uc3QgcmVnZXhwUmVnZXhwID0gL15cXC8oLiopXFwvKFtpbXVdKikkLztcblxuLyoqXG4gKiBNYWtlIGEgcmVndWxhciBleHByZXNzaW9uIGZyb20gYSB0ZXh0IGFyZ3VtZW50LlxuICpcbiAqIElmIGl0IGNhbiBiZSBwYXJzZWQgYXMgYSByZWd1bGFyIGV4cHJlc3Npb24sIHBhcnNlIGl0IGFuZCB0aGUgZmxhZ3MuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgdGhlIHRleHQgYXJndW1lbnQuXG4gKlxuICogQHJldHVybiB7P1JlZ0V4cH0gYSBSZWdFeHAgb2JqZWN0IG9yIG51bGwgaW4gY2FzZSBvZiBlcnJvci5cbiAqL1xuZXhwb3J0cy5tYWtlUmVnRXhwUGFyYW1ldGVyID0gZnVuY3Rpb24gbWFrZVJlZ0V4cFBhcmFtZXRlcih0ZXh0KSB7XG4gIGxldCBbLCBzb3VyY2UsIGZsYWdzXSA9IHJlZ2V4cFJlZ2V4cC5leGVjKHRleHQpIHx8IFtudWxsLCB0ZXh0VG9SZWdFeHAodGV4dCldO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc291cmNlLCBmbGFncyk7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxubGV0IHNwbGl0U2VsZWN0b3IgPSBleHBvcnRzLnNwbGl0U2VsZWN0b3IgPSBmdW5jdGlvbiBzcGxpdFNlbGVjdG9yKHNlbGVjdG9yKSB7XG4gIGlmICghc2VsZWN0b3IuaW5jbHVkZXMoXCIsXCIpKVxuICAgIHJldHVybiBbc2VsZWN0b3JdO1xuXG4gIGxldCBzZWxlY3RvcnMgPSBbXTtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGxldmVsID0gMDtcbiAgbGV0IHNlcCA9IFwiXCI7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaHIgPSBzZWxlY3RvcltpXTtcblxuICAgIC8vIGlnbm9yZSBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICBpZiAoY2hyID09IFwiXFxcXFwiKSB7XG4gICAgICBpKys7XG4gICAgfVxuICAgIC8vIGRvbid0IHNwbGl0IHdpdGhpbiBxdW90ZWQgdGV4dFxuICAgIGVsc2UgaWYgKGNociA9PSBzZXApIHtcbiAgICAgIHNlcCA9IFwiXCI7ICAgICAgICAgICAgIC8vIGUuZy4gW2F0dHI9XCIsXCJdXG4gICAgfVxuICAgIGVsc2UgaWYgKHNlcCA9PSBcIlwiKSB7XG4gICAgICBpZiAoY2hyID09ICdcIicgfHwgY2hyID09IFwiJ1wiKSB7XG4gICAgICAgIHNlcCA9IGNocjtcbiAgICAgIH1cbiAgICAgIC8vIGRvbid0IHNwbGl0IGJldHdlZW4gcGFyZW50aGVzZXNcbiAgICAgIGVsc2UgaWYgKGNociA9PSBcIihcIikge1xuICAgICAgICBsZXZlbCsrOyAgICAgICAgICAgIC8vIGUuZy4gOm1hdGNoZXMoZGl2LHNwYW4pXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjaHIgPT0gXCIpXCIpIHtcbiAgICAgICAgbGV2ZWwgPSBNYXRoLm1heCgwLCBsZXZlbCAtIDEpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoY2hyID09IFwiLFwiICYmIGxldmVsID09IDApIHtcbiAgICAgICAgc2VsZWN0b3JzLnB1c2goc2VsZWN0b3Iuc3Vic3RyaW5nKHN0YXJ0LCBpKSk7XG4gICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0b3JzLnB1c2goc2VsZWN0b3Iuc3Vic3RyaW5nKHN0YXJ0KSk7XG4gIHJldHVybiBzZWxlY3RvcnM7XG59O1xuXG5mdW5jdGlvbiBmaW5kVGFyZ2V0U2VsZWN0b3JJbmRleChzZWxlY3Rvcikge1xuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgd2hpdGVzcGFjZSA9IDA7XG4gIGxldCBzY29wZSA9IFtdO1xuXG4gIC8vIFN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgc3RyaW5nIGFuZCBnbyBjaGFyYWN0ZXIgYnkgY2hhcmFjdGVyLCB3aGVyZSBlYWNoXG4gIC8vIGNoYXJhY3RlciBpcyBhIFVuaWNvZGUgY29kZSBwb2ludC5cbiAgZm9yIChsZXQgY2hhcmFjdGVyIG9mIFsuLi5zZWxlY3Rvcl0ucmV2ZXJzZSgpKSB7XG4gICAgbGV0IGN1cnJlbnRTY29wZSA9IHNjb3BlW3Njb3BlLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKGNoYXJhY3RlciA9PSBcIidcIiB8fCBjaGFyYWN0ZXIgPT0gXCJcXFwiXCIpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGFscmVhZHkgd2l0aGluIHRoZSBzYW1lIHR5cGUgb2YgcXVvdGUsIGNsb3NlIHRoZSBzY29wZTtcbiAgICAgIC8vIG90aGVyd2lzZSBvcGVuIGEgbmV3IHNjb3BlLlxuICAgICAgaWYgKGN1cnJlbnRTY29wZSA9PSBjaGFyYWN0ZXIpXG4gICAgICAgIHNjb3BlLnBvcCgpO1xuICAgICAgZWxzZVxuICAgICAgICBzY29wZS5wdXNoKGNoYXJhY3Rlcik7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNoYXJhY3RlciA9PSBcIl1cIiB8fCBjaGFyYWN0ZXIgPT0gXCIpXCIpIHtcbiAgICAgIC8vIEZvciBjbG9zaW5nIGJyYWNrZXRzIGFuZCBwYXJlbnRoZXNlcywgb3BlbiBhIG5ldyBzY29wZSBvbmx5IGlmIHdlJ3JlXG4gICAgICAvLyBub3Qgd2l0aGluIGEgcXVvdGUuIFdpdGhpbiBxdW90ZXMgdGhlc2UgY2hhcmFjdGVycyBzaG91bGQgaGF2ZSBub1xuICAgICAgLy8gbWVhbmluZy5cbiAgICAgIGlmIChjdXJyZW50U2NvcGUgIT0gXCInXCIgJiYgY3VycmVudFNjb3BlICE9IFwiXFxcIlwiKVxuICAgICAgICBzY29wZS5wdXNoKGNoYXJhY3Rlcik7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNoYXJhY3RlciA9PSBcIltcIikge1xuICAgICAgLy8gSWYgd2UncmUgYWxyZWFkeSB3aXRoaW4gYSBicmFja2V0LCBjbG9zZSB0aGUgc2NvcGUuXG4gICAgICBpZiAoY3VycmVudFNjb3BlID09IFwiXVwiKVxuICAgICAgICBzY29wZS5wb3AoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hhcmFjdGVyID09IFwiKFwiKSB7XG4gICAgICAvLyBJZiB3ZSdyZSBhbHJlYWR5IHdpdGhpbiBhIHBhcmVudGhlc2lzLCBjbG9zZSB0aGUgc2NvcGUuXG4gICAgICBpZiAoY3VycmVudFNjb3BlID09IFwiKVwiKVxuICAgICAgICBzY29wZS5wb3AoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWN1cnJlbnRTY29wZSkge1xuICAgICAgLy8gQXQgdGhlIHRvcCBsZXZlbCAobm90IHdpdGhpbiBhbnkgc2NvcGUpLCBjb3VudCB0aGUgd2hpdGVzcGFjZSBpZiB3ZSd2ZVxuICAgICAgLy8gZW5jb3VudGVyZWQgaXQuIE90aGVyd2lzZSBpZiB3ZSd2ZSBoaXQgb25lIG9mIHRoZSBjb21iaW5hdG9ycyxcbiAgICAgIC8vIHRlcm1pbmF0ZSBoZXJlOyBvdGhlcndpc2UgaWYgd2UndmUgaGl0IGEgbm9uLWNvbG9uIGNoYXJhY3RlcixcbiAgICAgIC8vIHRlcm1pbmF0ZSBoZXJlLlxuICAgICAgaWYgKC9cXHMvLnRlc3QoY2hhcmFjdGVyKSlcbiAgICAgICAgd2hpdGVzcGFjZSsrO1xuICAgICAgZWxzZSBpZiAoKGNoYXJhY3RlciA9PSBcIj5cIiB8fCBjaGFyYWN0ZXIgPT0gXCIrXCIgfHwgY2hhcmFjdGVyID09IFwiflwiKSB8fFxuICAgICAgICAgICAgICAgKHdoaXRlc3BhY2UgPiAwICYmIGNoYXJhY3RlciAhPSBcIjpcIikpXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIFplcm8gb3V0IHRoZSB3aGl0ZXNwYWNlIGNvdW50IGlmIHdlJ3ZlIGVudGVyZWQgYSBzY29wZS5cbiAgICBpZiAoc2NvcGUubGVuZ3RoID4gMClcbiAgICAgIHdoaXRlc3BhY2UgPSAwO1xuXG4gICAgLy8gSW5jcmVtZW50IHRoZSBpbmRleCBieSB0aGUgc2l6ZSBvZiB0aGUgY2hhcmFjdGVyLiBOb3RlIHRoYXQgZm9yIFVuaWNvZGVcbiAgICAvLyBjb21wb3NpdGUgY2hhcmFjdGVycyAobGlrZSBlbW9qaSkgdGhpcyB3aWxsIGJlIG1vcmUgdGhhbiBvbmUuXG4gICAgaW5kZXggKz0gY2hhcmFjdGVyLmxlbmd0aDtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3Rvci5sZW5ndGggLSBpbmRleCArIHdoaXRlc3BhY2U7XG59XG5cbi8qKlxuICogUXVhbGlmaWVzIGEgQ1NTIHNlbGVjdG9yIHdpdGggYSBxdWFsaWZpZXIsIHdoaWNoIG1heSBiZSBhbm90aGVyIENTUyBzZWxlY3RvclxuICogb3IgYW4gZW1wdHkgc3RyaW5nLiBGb3IgZXhhbXBsZSwgZ2l2ZW4gdGhlIHNlbGVjdG9yIFwiZGl2LmJhclwiIGFuZCB0aGVcbiAqIHF1YWxpZmllciBcIiNmb29cIiwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIFwiZGl2I2Zvby5iYXJcIi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgdG8gcXVhbGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBxdWFsaWZpZXIgVGhlIHF1YWxpZmllciB3aXRoIHdoaWNoIHRvIHF1YWxpZnkgdGhlIHNlbGVjdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gVGhlIHF1YWxpZmllZCBzZWxlY3Rvci5cbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydHMucXVhbGlmeVNlbGVjdG9yID0gZnVuY3Rpb24gcXVhbGlmeVNlbGVjdG9yKHNlbGVjdG9yLCBxdWFsaWZpZXIpIHtcbiAgbGV0IHF1YWxpZmllZFNlbGVjdG9yID0gXCJcIjtcblxuICBsZXQgcXVhbGlmaWVyVGFyZ2V0U2VsZWN0b3JJbmRleCA9IGZpbmRUYXJnZXRTZWxlY3RvckluZGV4KHF1YWxpZmllcik7XG4gIGxldCBbLCBxdWFsaWZpZXJUeXBlID0gXCJcIl0gPVxuICAgIC9eKFthLXpdW2Etei1dKik/L2kuZXhlYyhxdWFsaWZpZXIuc3Vic3RyaW5nKHF1YWxpZmllclRhcmdldFNlbGVjdG9ySW5kZXgpKTtcblxuICBmb3IgKGxldCBzdWIgb2Ygc3BsaXRTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICBzdWIgPSBzdWIudHJpbSgpO1xuXG4gICAgcXVhbGlmaWVkU2VsZWN0b3IgKz0gXCIsIFwiO1xuXG4gICAgbGV0IGluZGV4ID0gZmluZFRhcmdldFNlbGVjdG9ySW5kZXgoc3ViKTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgZmlyc3QgZ3JvdXAgaW4gdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBvcHRpb25hbC4gSWYgaXRcbiAgICAvLyBkb2Vzbid0IG1hdGNoIChlLmcuIFwiI2Zvbzo6bnRoLWNoaWxkKDEpXCIpLCB0eXBlIHdpbGwgYmUgYW4gZW1wdHkgc3RyaW5nLlxuICAgIGxldCBbLCB0eXBlID0gXCJcIiwgcmVzdF0gPVxuICAgICAgL14oW2Etel1bYS16LV0qKT9cXCo/KC4qKS9pLmV4ZWMoc3ViLnN1YnN0cmluZyhpbmRleCkpO1xuXG4gICAgaWYgKHR5cGUgPT0gcXVhbGlmaWVyVHlwZSlcbiAgICAgIHR5cGUgPSBcIlwiO1xuXG4gICAgLy8gSWYgdGhlIHF1YWxpZmllciBlbmRzIGluIGEgY29tYmluYXRvciAoZS5nLiBcImJvZHkgI2Zvbz5cIiksIHdlIHB1dCB0aGVcbiAgICAvLyB0eXBlIGFuZCB0aGUgcmVzdCBvZiB0aGUgc2VsZWN0b3IgYWZ0ZXIgdGhlIHF1YWxpZmllclxuICAgIC8vIChlLmcuIFwiYm9keSAjZm9vPmRpdi5iYXJcIik7IG90aGVyd2lzZSAoZS5nLiBcImJvZHkgI2Zvb1wiKSB3ZSBtZXJnZSB0aGVcbiAgICAvLyB0eXBlIGludG8gdGhlIHF1YWxpZmllciAoZS5nLiBcImJvZHkgZGl2I2Zvby5iYXJcIikuXG4gICAgaWYgKC9bXFxzPit+XSQvLnRlc3QocXVhbGlmaWVyKSlcbiAgICAgIHF1YWxpZmllZFNlbGVjdG9yICs9IHN1Yi5zdWJzdHJpbmcoMCwgaW5kZXgpICsgcXVhbGlmaWVyICsgdHlwZSArIHJlc3Q7XG4gICAgZWxzZVxuICAgICAgcXVhbGlmaWVkU2VsZWN0b3IgKz0gc3ViLnN1YnN0cmluZygwLCBpbmRleCkgKyB0eXBlICsgcXVhbGlmaWVyICsgcmVzdDtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0aGUgaW5pdGlhbCBjb21tYSBhbmQgc3BhY2UuXG4gIHJldHVybiBxdWFsaWZpZWRTZWxlY3Rvci5zdWJzdHJpbmcoMik7XG59O1xuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEFkYmxvY2sgUGx1cyA8aHR0cHM6Ly9hZGJsb2NrcGx1cy5vcmcvPixcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBBZGJsb2NrIFBsdXMuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyoqIEBtb2R1bGUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHttYWtlUmVnRXhwUGFyYW1ldGVyLCBzcGxpdFNlbGVjdG9yLFxuICAgICAgIHF1YWxpZnlTZWxlY3Rvcn0gPSByZXF1aXJlKFwiLi4vY29tbW9uXCIpO1xuY29uc3Qge2ZpbHRlclRvUmVnRXhwfSA9IHJlcXVpcmUoXCIuLi9wYXR0ZXJuc1wiKTtcblxuY29uc3QgREVGQVVMVF9NSU5fSU5WT0NBVElPTl9JTlRFUlZBTCA9IDMwMDA7XG5sZXQgbWluSW52b2NhdGlvbkludGVydmFsID0gREVGQVVMVF9NSU5fSU5WT0NBVElPTl9JTlRFUlZBTDtcbmNvbnN0IERFRkFVTFRfTUFYX1NZQ0hST05PVVNfUFJPQ0VTU0lOR19USU1FID0gNTA7XG5sZXQgbWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSA9IERFRkFVTFRfTUFYX1NZQ0hST05PVVNfUFJPQ0VTU0lOR19USU1FO1xuXG5sZXQgYWJwU2VsZWN0b3JSZWdleHAgPSAvOigtYWJwLVtcXHctXSt8aGFzfGhhcy10ZXh0fHhwYXRofG5vdClcXCgvO1xuXG5sZXQgdGVzdEluZm8gPSBudWxsO1xuXG5mdW5jdGlvbiB0b0NTU1N0eWxlRGVjbGFyYXRpb24odmFsdWUpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRlc3RcIiksIHtzdHlsZTogdmFsdWV9KS5zdHlsZTtcbn1cblxuLyoqXG4gKiBFbmFibGVzIHRlc3QgbW9kZSwgd2hpY2ggdHJhY2tzIGFkZGl0aW9uYWwgbWV0YWRhdGEgYWJvdXQgdGhlIGlubmVyXG4gKiB3b3JraW5ncyBmb3IgdGVzdCBwdXJwb3Nlcy4gVGhpcyBhbHNvIGFsbG93cyBvdmVycmlkaW5nIGludGVybmFsXG4gKiBjb25maWd1cmF0aW9uLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5taW5JbnZvY2F0aW9uSW50ZXJ2YWwgT3ZlcnJpZGVzIGhvdyBsb25nXG4gKiAgIG11c3QgYmUgd2FpdGVkIGJldHdlZW4gZmlsdGVyIHByb2Nlc3NpbmcgcnVuc1xuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMubWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSBPdmVycmlkZXMgaG93XG4gKiAgIGxvbmcgdGhlIHRocmVhZCBtYXkgc3BlbmQgcHJvY2Vzc2luZyBmaWx0ZXJzIGJlZm9yZSBpdCBtdXN0IHlpZWxkXG4gKiAgIGl0cyB0aHJlYWRcbiAqL1xuZXhwb3J0cy5zZXRUZXN0TW9kZSA9IGZ1bmN0aW9uIHNldFRlc3RNb2RlKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zLm1pbkludm9jYXRpb25JbnRlcnZhbCAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwgPSBvcHRpb25zLm1pbkludm9jYXRpb25JbnRlcnZhbDtcbiAgaWYgKHR5cGVvZiBvcHRpb25zLm1heFN5bmNocm9ub3VzUHJvY2Vzc2luZ1RpbWUgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgbWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSA9IG9wdGlvbnMubWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZTtcblxuICB0ZXN0SW5mbyA9IHtcbiAgICBsYXN0UHJvY2Vzc2VkRWxlbWVudHM6IG5ldyBTZXQoKSxcbiAgICBmYWlsZWRBc3NlcnRpb25zOiBbXVxuICB9O1xufTtcblxuZXhwb3J0cy5nZXRUZXN0SW5mbyA9IGZ1bmN0aW9uIGdldFRlc3RJbmZvKCkge1xuICByZXR1cm4gdGVzdEluZm87XG59O1xuXG5leHBvcnRzLmNsZWFyVGVzdE1vZGUgPSBmdW5jdGlvbigpIHtcbiAgbWluSW52b2NhdGlvbkludGVydmFsID0gREVGQVVMVF9NSU5fSU5WT0NBVElPTl9JTlRFUlZBTDtcbiAgbWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSA9IERFRkFVTFRfTUFYX1NZQ0hST05PVVNfUFJPQ0VTU0lOR19USU1FO1xuICB0ZXN0SW5mbyA9IG51bGw7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgSWRsZURlYWRsaW5lLlxuICpcbiAqIE5vdGU6IFRoaXMgZnVuY3Rpb24gaXMgc3luY2hyb25vdXMgYW5kIGRvZXMgTk9UIHJlcXVlc3QgYW4gaWRsZVxuICogY2FsbGJhY2suXG4gKlxuICogU2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSWRsZURlYWRsaW5lfS5cbiAqIEByZXR1cm4ge0lkbGVEZWFkbGluZX1cbiAqL1xuZnVuY3Rpb24gbmV3SWRsZURlYWRsaW5lKCkge1xuICBsZXQgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIHJldHVybiB7XG4gICAgZGlkVGltZW91dDogZmFsc2UsXG4gICAgdGltZVJlbWFpbmluZygpIHtcbiAgICAgIGxldCBlbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICBsZXQgcmVtYWluaW5nID0gbWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSAtIGVsYXBzZWQ7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoMCwgcmVtYWluaW5nKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBicm93c2VyIGlzIG5leHQgaWRsZS5cbiAqXG4gKiBUaGlzIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgZm9yIGxvbmcgcnVubmluZyB0YXNrcyBvbiB0aGUgVUkgdGhyZWFkXG4gKiB0byBhbGxvdyBvdGhlciBVSSBldmVudHMgdG8gcHJvY2Vzcy5cbiAqXG4gKiBAcmV0dXJuIHtQcm9taXNlLjxJZGxlRGVhZGxpbmU+fVxuICogICAgQSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4geW91IGNhbiBjb250aW51ZSBwcm9jZXNzaW5nXG4gKi9cbmZ1bmN0aW9uIHlpZWxkVGhyZWFkKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0SWRsZUNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJlcXVlc3RJZGxlQ2FsbGJhY2socmVzb2x2ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlc29sdmUobmV3SWRsZURlYWRsaW5lKCkpO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBnZXRDYWNoZWRQcm9wZXJ0eVZhbHVlKG9iamVjdCwgbmFtZSwgZGVmYXVsdFZhbHVlRnVuYyA9ICgpID0+IHt9KSB7XG4gIGxldCB2YWx1ZSA9IG9iamVjdFtuYW1lXTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcInVuZGVmaW5lZFwiKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIHt2YWx1ZTogdmFsdWUgPSBkZWZhdWx0VmFsdWVGdW5jKCl9KTtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIFJldHVybiBwb3NpdGlvbiBvZiBub2RlIGZyb20gcGFyZW50LlxuICogQHBhcmFtIHtOb2RlfSBub2RlIHRoZSBub2RlIHRvIGZpbmQgdGhlIHBvc2l0aW9uIG9mLlxuICogQHJldHVybiB7bnVtYmVyfSBPbmUtYmFzZWQgaW5kZXggbGlrZSBmb3IgOm50aC1jaGlsZCgpLCBvciAwIG9uIGVycm9yLlxuICovXG5mdW5jdGlvbiBwb3NpdGlvbkluUGFyZW50KG5vZGUpIHtcbiAgbGV0IGluZGV4ID0gMDtcbiAgZm9yIChsZXQgY2hpbGQgb2Ygbm9kZS5wYXJlbnROb2RlLmNoaWxkcmVuKSB7XG4gICAgaWYgKGNoaWxkID09IG5vZGUpXG4gICAgICByZXR1cm4gaW5kZXggKyAxO1xuXG4gICAgaW5kZXgrKztcbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiBtYWtlU2VsZWN0b3Iobm9kZSwgc2VsZWN0b3IgPSBcIlwiKSB7XG4gIGlmIChub2RlID09IG51bGwpXG4gICAgcmV0dXJuIG51bGw7XG4gIGlmICghbm9kZS5wYXJlbnRFbGVtZW50KSB7XG4gICAgbGV0IG5ld1NlbGVjdG9yID0gXCI6cm9vdFwiO1xuICAgIGlmIChzZWxlY3RvcilcbiAgICAgIG5ld1NlbGVjdG9yICs9IFwiID4gXCIgKyBzZWxlY3RvcjtcbiAgICByZXR1cm4gbmV3U2VsZWN0b3I7XG4gIH1cbiAgbGV0IGlkeCA9IHBvc2l0aW9uSW5QYXJlbnQobm9kZSk7XG4gIGlmIChpZHggPiAwKSB7XG4gICAgbGV0IG5ld1NlbGVjdG9yID0gYCR7bm9kZS50YWdOYW1lfTpudGgtY2hpbGQoJHtpZHh9KWA7XG4gICAgaWYgKHNlbGVjdG9yKVxuICAgICAgbmV3U2VsZWN0b3IgKz0gXCIgPiBcIiArIHNlbGVjdG9yO1xuICAgIHJldHVybiBtYWtlU2VsZWN0b3Iobm9kZS5wYXJlbnRFbGVtZW50LCBuZXdTZWxlY3Rvcik7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3I7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2VsZWN0b3JDb250ZW50KGNvbnRlbnQsIHN0YXJ0SW5kZXgpIHtcbiAgbGV0IHBhcmVucyA9IDE7XG4gIGxldCBxdW90ZSA9IG51bGw7XG4gIGxldCBpID0gc3RhcnRJbmRleDtcbiAgZm9yICg7IGkgPCBjb250ZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGMgPSBjb250ZW50W2ldO1xuICAgIGlmIChjID09IFwiXFxcXFwiKSB7XG4gICAgICAvLyBJZ25vcmUgZXNjYXBlZCBjaGFyYWN0ZXJzXG4gICAgICBpKys7XG4gICAgfVxuICAgIGVsc2UgaWYgKHF1b3RlKSB7XG4gICAgICBpZiAoYyA9PSBxdW90ZSlcbiAgICAgICAgcXVvdGUgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjID09IFwiJ1wiIHx8IGMgPT0gJ1wiJykge1xuICAgICAgcXVvdGUgPSBjO1xuICAgIH1cbiAgICBlbHNlIGlmIChjID09IFwiKFwiKSB7XG4gICAgICBwYXJlbnMrKztcbiAgICB9XG4gICAgZWxzZSBpZiAoYyA9PSBcIilcIikge1xuICAgICAgcGFyZW5zLS07XG4gICAgICBpZiAocGFyZW5zID09IDApXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJlbnMgPiAwKVxuICAgIHJldHVybiBudWxsO1xuICByZXR1cm4ge3RleHQ6IGNvbnRlbnQuc3Vic3RyaW5nKHN0YXJ0SW5kZXgsIGkpLCBlbmQ6IGl9O1xufVxuXG4vKipcbiAqIFN0cmluZ2lmaWVkIHN0eWxlIG9iamVjdHNcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFN0cmluZ2lmaWVkU3R5bGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdHlsZSBDU1Mgc3R5bGUgcmVwcmVzZW50ZWQgYnkgYSBzdHJpbmcuXG4gKiBAcHJvcGVydHkge3N0cmluZ1tdfSBzdWJTZWxlY3RvcnMgc2VsZWN0b3JzIHRoZSBDU1MgcHJvcGVydGllcyBhcHBseSB0by5cbiAqL1xuXG4vKipcbiAqIFByb2R1Y2UgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHN0eWxlc2hlZXQgZW50cnkuXG4gKiBAcGFyYW0ge0NTU1N0eWxlUnVsZX0gcnVsZSB0aGUgQ1NTIHN0eWxlIHJ1bGUuXG4gKiBAcmV0dXJuIHtTdHJpbmdpZmllZFN0eWxlfSB0aGUgc3RyaW5naWZpZWQgc3R5bGUuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVN0eWxlKHJ1bGUpIHtcbiAgbGV0IHN0eWxlcyA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGUuc3R5bGUubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgcHJvcGVydHkgPSBydWxlLnN0eWxlLml0ZW0oaSk7XG4gICAgbGV0IHZhbHVlID0gcnVsZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KTtcbiAgICBsZXQgcHJpb3JpdHkgPSBydWxlLnN0eWxlLmdldFByb3BlcnR5UHJpb3JpdHkocHJvcGVydHkpO1xuICAgIHN0eWxlcy5wdXNoKGAke3Byb3BlcnR5fTogJHt2YWx1ZX0ke3ByaW9yaXR5ID8gXCIgIVwiICsgcHJpb3JpdHkgOiBcIlwifTtgKTtcbiAgfVxuICBzdHlsZXMuc29ydCgpO1xuICByZXR1cm4ge1xuICAgIHN0eWxlOiBzdHlsZXMuam9pbihcIiBcIiksXG4gICAgc3ViU2VsZWN0b3JzOiBzcGxpdFNlbGVjdG9yKHJ1bGUuc2VsZWN0b3JUZXh0KVxuICB9O1xufVxuXG5sZXQgc2NvcGVTdXBwb3J0ZWQgPSBudWxsO1xuXG5mdW5jdGlvbiB0cnlRdWVyeVNlbGVjdG9yKHN1YnRyZWUsIHNlbGVjdG9yLCBhbGwpIHtcbiAgbGV0IGVsZW1lbnRzID0gbnVsbDtcbiAgdHJ5IHtcbiAgICBlbGVtZW50cyA9IGFsbCA/IHN1YnRyZWUucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOlxuICAgICAgc3VidHJlZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICBzY29wZVN1cHBvcnRlZCA9IHRydWU7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICAvLyBFZGdlIGRvZXNuJ3Qgc3VwcG9ydCBcIjpzY29wZVwiXG4gICAgc2NvcGVTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gZWxlbWVudHM7XG59XG5cbi8qKlxuICogUXVlcnkgc2VsZWN0b3IuXG4gKlxuICogSWYgaXQgaXMgcmVsYXRpdmUsIHdpbGwgdHJ5IDpzY29wZS5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIGVsZW1lbnQgdG8gcXVlcnkgc2VsZWN0b3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciB0aGUgc2VsZWN0b3IgdG8gcXVlcnlcbiAqIEBwYXJhbSB7Ym9vbH0gW2FsbD1mYWxzZV0gdHJ1ZSB0byBwZXJmb3JtIHF1ZXJ5U2VsZWN0b3JBbGwoKVxuICpcbiAqIEByZXR1cm5zIHs/KE5vZGV8Tm9kZUxpc3QpfSByZXN1bHQgb2YgdGhlIHF1ZXJ5LiBudWxsIGluIGNhc2Ugb2YgZXJyb3IuXG4gKi9cbmZ1bmN0aW9uIHNjb3BlZFF1ZXJ5U2VsZWN0b3Ioc3VidHJlZSwgc2VsZWN0b3IsIGFsbCkge1xuICBpZiAoc2VsZWN0b3JbMF0gPT0gXCI+XCIpIHtcbiAgICBzZWxlY3RvciA9IFwiOnNjb3BlXCIgKyBzZWxlY3RvcjtcbiAgICBpZiAoc2NvcGVTdXBwb3J0ZWQpIHtcbiAgICAgIHJldHVybiBhbGwgPyBzdWJ0cmVlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDpcbiAgICAgICAgc3VidHJlZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICB9XG4gICAgaWYgKHNjb3BlU3VwcG9ydGVkID09IG51bGwpXG4gICAgICByZXR1cm4gdHJ5UXVlcnlTZWxlY3RvcihzdWJ0cmVlLCBzZWxlY3RvciwgYWxsKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gYWxsID8gc3VidHJlZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6XG4gICAgc3VidHJlZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBzZWxlY3Rvcikge1xuICByZXR1cm4gc2NvcGVkUXVlcnlTZWxlY3RvcihzdWJ0cmVlLCBzZWxlY3RvciwgdHJ1ZSk7XG59XG5cbmNsYXNzIFBsYWluU2VsZWN0b3Ige1xuICBjb25zdHJ1Y3RvcihzZWxlY3Rvcikge1xuICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMgPSAvWyMuOl18XFxbLitcXF0vLnRlc3Qoc2VsZWN0b3IpO1xuICAgIHRoaXMubWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9ycyA9IC9bfitdLy50ZXN0KHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgZnVuY3Rpb24gcmV0dXJuaW5nIGEgcGFpciBvZiBzZWxlY3RvciBzdHJpbmcgYW5kIHN1YnRyZWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdGhlIHByZWZpeCBmb3IgdGhlIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIHN1YnRyZWUgd2Ugd29yayBvbi5cbiAgICogQHBhcmFtIHtOb2RlW119IFt0YXJnZXRzXSB0aGUgbm9kZXMgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gICAqL1xuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIHlpZWxkIFtwcmVmaXggKyB0aGlzLl9zZWxlY3Rvciwgc3VidHJlZV07XG4gIH1cbn1cblxuY29uc3QgaW5jb21wbGV0ZVByZWZpeFJlZ2V4cCA9IC9bXFxzPit+XSQvO1xuXG5jbGFzcyBOb3RTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9ycykge1xuICAgIHRoaXMuX2lubmVyUGF0dGVybiA9IG5ldyBQYXR0ZXJuKHNlbGVjdG9ycyk7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uU3R5bGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4uZGVwZW5kc09uU3R5bGVzO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPbkNoYXJhY3RlckRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhO1xuICB9XG5cbiAgZ2V0IG1heWJlRGVwZW5kc09uQXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcztcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykpXG4gICAgICB5aWVsZCBbbWFrZVNlbGVjdG9yKGVsZW1lbnQpLCBlbGVtZW50XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgZnVuY3Rpb24gcmV0dXJuaW5nIHNlbGVjdGVkIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRoZSBwcmVmaXggZm9yIHRoZSBzZWxlY3Rvci5cbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb24uXG4gICAqIEBwYXJhbSB7Tm9kZVtdfSBbdGFyZ2V0c10gdGhlIG5vZGVzIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICAgKi9cbiAgKmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCBhY3R1YWxQcmVmaXggPSAoIXByZWZpeCB8fCBpbmNvbXBsZXRlUHJlZml4UmVnZXhwLnRlc3QocHJlZml4KSkgP1xuICAgICAgcHJlZml4ICsgXCIqXCIgOiBwcmVmaXg7XG4gICAgbGV0IGVsZW1lbnRzID0gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBhY3R1YWxQcmVmaXgpO1xuICAgIGlmIChlbGVtZW50cykge1xuICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBuZWl0aGVyIGFuIGFuY2VzdG9yIG5vciBhIGRlc2NlbmRhbnQgb2Ygb25lIG9mIHRoZVxuICAgICAgICAvLyB0YXJnZXRzLCB3ZSBjYW4gc2tpcCBpdC5cbiAgICAgICAgaWYgKHRhcmdldHMgJiYgIXRhcmdldHMuc29tZSh0YXJnZXQgPT4gZWxlbWVudC5jb250YWlucyh0YXJnZXQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5jb250YWlucyhlbGVtZW50KSkpIHtcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRlc3RJbmZvKVxuICAgICAgICAgIHRlc3RJbmZvLmxhc3RQcm9jZXNzZWRFbGVtZW50cy5hZGQoZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pbm5lclBhdHRlcm4ubWF0Y2hlcyhlbGVtZW50LCBzdWJ0cmVlKSlcbiAgICAgICAgICB5aWVsZCBlbGVtZW50O1xuXG4gICAgICAgIHlpZWxkIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0U3R5bGVzKHN0eWxlcykge1xuICAgIHRoaXMuX2lubmVyUGF0dGVybi5zZXRTdHlsZXMoc3R5bGVzKTtcbiAgfVxufVxuXG5jbGFzcyBIYXNTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9ycykge1xuICAgIHRoaXMuX2lubmVyUGF0dGVybiA9IG5ldyBQYXR0ZXJuKHNlbGVjdG9ycyk7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uU3R5bGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4uZGVwZW5kc09uU3R5bGVzO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPbkNoYXJhY3RlckRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhO1xuICB9XG5cbiAgZ2V0IG1heWJlRGVwZW5kc09uQXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcztcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykpXG4gICAgICB5aWVsZCBbbWFrZVNlbGVjdG9yKGVsZW1lbnQpLCBlbGVtZW50XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0b3IgZnVuY3Rpb24gcmV0dXJuaW5nIHNlbGVjdGVkIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHRoZSBwcmVmaXggZm9yIHRoZSBzZWxlY3Rvci5cbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb24uXG4gICAqIEBwYXJhbSB7Tm9kZVtdfSBbdGFyZ2V0c10gdGhlIG5vZGVzIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICAgKi9cbiAgKmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCBhY3R1YWxQcmVmaXggPSAoIXByZWZpeCB8fCBpbmNvbXBsZXRlUHJlZml4UmVnZXhwLnRlc3QocHJlZml4KSkgP1xuICAgICAgcHJlZml4ICsgXCIqXCIgOiBwcmVmaXg7XG4gICAgbGV0IGVsZW1lbnRzID0gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBhY3R1YWxQcmVmaXgpO1xuICAgIGlmIChlbGVtZW50cykge1xuICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBuZWl0aGVyIGFuIGFuY2VzdG9yIG5vciBhIGRlc2NlbmRhbnQgb2Ygb25lIG9mIHRoZVxuICAgICAgICAvLyB0YXJnZXRzLCB3ZSBjYW4gc2tpcCBpdC5cbiAgICAgICAgaWYgKHRhcmdldHMgJiYgIXRhcmdldHMuc29tZSh0YXJnZXQgPT4gZWxlbWVudC5jb250YWlucyh0YXJnZXQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5jb250YWlucyhlbGVtZW50KSkpIHtcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRlc3RJbmZvKVxuICAgICAgICAgIHRlc3RJbmZvLmxhc3RQcm9jZXNzZWRFbGVtZW50cy5hZGQoZWxlbWVudCk7XG5cbiAgICAgICAgZm9yIChsZXQgc2VsZWN0b3Igb2YgdGhpcy5faW5uZXJQYXR0ZXJuLmV2YWx1YXRlKGVsZW1lbnQsIHRhcmdldHMpKSB7XG4gICAgICAgICAgaWYgKHNlbGVjdG9yID09IG51bGwpXG4gICAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIGVsc2UgaWYgKHNjb3BlZFF1ZXJ5U2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKVxuICAgICAgICAgICAgeWllbGQgZWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIHlpZWxkIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0U3R5bGVzKHN0eWxlcykge1xuICAgIHRoaXMuX2lubmVyUGF0dGVybi5zZXRTdHlsZXMoc3R5bGVzKTtcbiAgfVxufVxuXG5jbGFzcyBYUGF0aFNlbGVjdG9yIHtcbiAgY29uc3RydWN0b3IodGV4dENvbnRlbnQpIHtcbiAgICB0aGlzLmRlcGVuZHNPbkNoYXJhY3RlckRhdGEgPSB0cnVlO1xuICAgIHRoaXMubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzID0gdHJ1ZTtcblxuICAgIGxldCBldmFsdWF0b3IgPSBuZXcgWFBhdGhFdmFsdWF0b3IoKTtcbiAgICB0aGlzLl9leHByZXNzaW9uID0gZXZhbHVhdG9yLmNyZWF0ZUV4cHJlc3Npb24odGV4dENvbnRlbnQsIG51bGwpO1xuICB9XG5cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSlcbiAgICAgIHlpZWxkIFttYWtlU2VsZWN0b3IoZWxlbWVudCksIGVsZW1lbnRdO1xuICB9XG5cbiAgKmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCB7T1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEU6IGZsYWd9ID0gWFBhdGhSZXN1bHQ7XG4gICAgbGV0IGVsZW1lbnRzID0gcHJlZml4ID8gc2NvcGVkUXVlcnlTZWxlY3RvckFsbChzdWJ0cmVlLCBwcmVmaXgpIDogW3N1YnRyZWVdO1xuICAgIGZvciAobGV0IHBhcmVudCBvZiBlbGVtZW50cykge1xuICAgICAgbGV0IHJlc3VsdCA9IHRoaXMuX2V4cHJlc3Npb24uZXZhbHVhdGUocGFyZW50LCBmbGFnLCBudWxsKTtcbiAgICAgIGZvciAobGV0IGkgPSAwLCB7c25hcHNob3RMZW5ndGh9ID0gcmVzdWx0OyBpIDwgc25hcHNob3RMZW5ndGg7IGkrKylcbiAgICAgICAgeWllbGQgcmVzdWx0LnNuYXBzaG90SXRlbShpKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ29udGFpbnNTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHRleHRDb250ZW50KSB7XG4gICAgdGhpcy5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhID0gdHJ1ZTtcblxuICAgIHRoaXMuX3JlZ2V4cCA9IG1ha2VSZWdFeHBQYXJhbWV0ZXIodGV4dENvbnRlbnQpO1xuICB9XG5cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSlcbiAgICAgIHlpZWxkIFttYWtlU2VsZWN0b3IoZWxlbWVudCksIHN1YnRyZWVdO1xuICB9XG5cbiAgKmdldEVsZW1lbnRzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCBhY3R1YWxQcmVmaXggPSAoIXByZWZpeCB8fCBpbmNvbXBsZXRlUHJlZml4UmVnZXhwLnRlc3QocHJlZml4KSkgP1xuICAgICAgcHJlZml4ICsgXCIqXCIgOiBwcmVmaXg7XG5cbiAgICBsZXQgZWxlbWVudHMgPSBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHN1YnRyZWUsIGFjdHVhbFByZWZpeCk7XG5cbiAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgIGxldCBsYXN0Um9vdCA9IG51bGw7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICAgIC8vIEZvciBhIGZpbHRlciBsaWtlIGRpdjotYWJwLWNvbnRhaW5zKEhlbGxvKSBhbmQgYSBzdWJ0cmVlIGxpa2VcbiAgICAgICAgLy8gPGRpdiBpZD1cImFcIj48ZGl2IGlkPVwiYlwiPjxkaXYgaWQ9XCJjXCI+SGVsbG88L2Rpdj48L2Rpdj48L2Rpdj5cbiAgICAgICAgLy8gd2UncmUgb25seSBpbnRlcmVzdGVkIGluIGRpdiNhXG4gICAgICAgIGlmIChsYXN0Um9vdCAmJiBsYXN0Um9vdC5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsYXN0Um9vdCA9IGVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKHRhcmdldHMgJiYgIXRhcmdldHMuc29tZSh0YXJnZXQgPT4gZWxlbWVudC5jb250YWlucyh0YXJnZXQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5jb250YWlucyhlbGVtZW50KSkpIHtcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRlc3RJbmZvKVxuICAgICAgICAgIHRlc3RJbmZvLmxhc3RQcm9jZXNzZWRFbGVtZW50cy5hZGQoZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlZ2V4cCAmJiB0aGlzLl9yZWdleHAudGVzdChlbGVtZW50LnRleHRDb250ZW50KSlcbiAgICAgICAgICB5aWVsZCBlbGVtZW50O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUHJvcHNTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHByb3BlcnR5RXhwcmVzc2lvbikge1xuICAgIHRoaXMuZGVwZW5kc09uU3R5bGVzID0gdHJ1ZTtcbiAgICB0aGlzLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcyA9IHRydWU7XG5cbiAgICBsZXQgcmVnZXhwU3RyaW5nO1xuICAgIGlmIChwcm9wZXJ0eUV4cHJlc3Npb24ubGVuZ3RoID49IDIgJiYgcHJvcGVydHlFeHByZXNzaW9uWzBdID09IFwiL1wiICYmXG4gICAgICAgIHByb3BlcnR5RXhwcmVzc2lvbltwcm9wZXJ0eUV4cHJlc3Npb24ubGVuZ3RoIC0gMV0gPT0gXCIvXCIpXG4gICAgICByZWdleHBTdHJpbmcgPSBwcm9wZXJ0eUV4cHJlc3Npb24uc2xpY2UoMSwgLTEpO1xuICAgIGVsc2VcbiAgICAgIHJlZ2V4cFN0cmluZyA9IGZpbHRlclRvUmVnRXhwKHByb3BlcnR5RXhwcmVzc2lvbik7XG5cbiAgICB0aGlzLl9yZWdleHAgPSBuZXcgUmVnRXhwKHJlZ2V4cFN0cmluZywgXCJpXCIpO1xuXG4gICAgdGhpcy5fc3ViU2VsZWN0b3JzID0gW107XG4gIH1cblxuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGZvciAobGV0IHN1YlNlbGVjdG9yIG9mIHRoaXMuX3N1YlNlbGVjdG9ycykge1xuICAgICAgaWYgKHN1YlNlbGVjdG9yLnN0YXJ0c1dpdGgoXCIqXCIpICYmXG4gICAgICAgICAgIWluY29tcGxldGVQcmVmaXhSZWdleHAudGVzdChwcmVmaXgpKVxuICAgICAgICBzdWJTZWxlY3RvciA9IHN1YlNlbGVjdG9yLnN1YnN0cmluZygxKTtcblxuICAgICAgeWllbGQgW3F1YWxpZnlTZWxlY3RvcihzdWJTZWxlY3RvciwgcHJlZml4KSwgc3VidHJlZV07XG4gICAgfVxuICB9XG5cbiAgc2V0U3R5bGVzKHN0eWxlcykge1xuICAgIHRoaXMuX3N1YlNlbGVjdG9ycyA9IFtdO1xuICAgIGZvciAobGV0IHN0eWxlIG9mIHN0eWxlcykge1xuICAgICAgaWYgKHRoaXMuX3JlZ2V4cC50ZXN0KHN0eWxlLnN0eWxlKSkge1xuICAgICAgICBmb3IgKGxldCBzdWJTZWxlY3RvciBvZiBzdHlsZS5zdWJTZWxlY3RvcnMpIHtcbiAgICAgICAgICBsZXQgaWR4ID0gc3ViU2VsZWN0b3IubGFzdEluZGV4T2YoXCI6OlwiKTtcbiAgICAgICAgICBpZiAoaWR4ICE9IC0xKVxuICAgICAgICAgICAgc3ViU2VsZWN0b3IgPSBzdWJTZWxlY3Rvci5zdWJzdHJpbmcoMCwgaWR4KTtcblxuICAgICAgICAgIHRoaXMuX3N1YlNlbGVjdG9ycy5wdXNoKHN1YlNlbGVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBQYXR0ZXJuIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3JzLCB0ZXh0KSB7XG4gICAgdGhpcy5zZWxlY3RvcnMgPSBzZWxlY3RvcnM7XG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25TdHlsZXMoKSB7XG4gICAgcmV0dXJuIGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9kZXBlbmRzT25TdHlsZXNcIiwgKCkgPT4gdGhpcy5zZWxlY3RvcnMuc29tZShcbiAgICAgICAgc2VsZWN0b3IgPT4gc2VsZWN0b3IuZGVwZW5kc09uU3R5bGVzXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGdldCBtYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMoKSB7XG4gICAgLy8gT2JzZXJ2ZSBjaGFuZ2VzIHRvIGF0dHJpYnV0ZXMgaWYgZWl0aGVyIHRoZXJlJ3MgYSBwbGFpbiBzZWxlY3RvciB0aGF0XG4gICAgLy8gbG9va3MgbGlrZSBhbiBJRCBzZWxlY3RvciwgY2xhc3Mgc2VsZWN0b3IsIG9yIGF0dHJpYnV0ZSBzZWxlY3RvciBpbiBvbmVcbiAgICAvLyBvZiB0aGUgcGF0dGVybnMgKGUuZy4gXCJhW2hyZWY9J2h0dHBzOi8vZXhhbXBsZS5jb20vJ11cIilcbiAgICAvLyBvciB0aGVyZSdzIGEgcHJvcGVydGllcyBzZWxlY3RvciBuZXN0ZWQgaW5zaWRlIGEgaGFzIHNlbGVjdG9yXG4gICAgLy8gKGUuZy4gXCJkaXY6LWFicC1oYXMoOi1hYnAtcHJvcGVydGllcyhjb2xvcjogYmx1ZSkpXCIpXG4gICAgcmV0dXJuIGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXNcIiwgKCkgPT4gdGhpcy5zZWxlY3RvcnMuc29tZShcbiAgICAgICAgc2VsZWN0b3IgPT4gc2VsZWN0b3IubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzIHx8XG4gICAgICAgICAgICAgICAgICAgIChzZWxlY3RvciBpbnN0YW5jZW9mIEhhc1NlbGVjdG9yICYmXG4gICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvci5kZXBlbmRzT25TdHlsZXMpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25DaGFyYWN0ZXJEYXRhKCkge1xuICAgIC8vIE9ic2VydmUgY2hhbmdlcyB0byBjaGFyYWN0ZXIgZGF0YSBvbmx5IGlmIHRoZXJlJ3MgYSBjb250YWlucyBzZWxlY3RvciBpblxuICAgIC8vIG9uZSBvZiB0aGUgcGF0dGVybnMuXG4gICAgcmV0dXJuIGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9kZXBlbmRzT25DaGFyYWN0ZXJEYXRhXCIsICgpID0+IHRoaXMuc2VsZWN0b3JzLnNvbWUoXG4gICAgICAgIHNlbGVjdG9yID0+IHNlbGVjdG9yLmRlcGVuZHNPbkNoYXJhY3RlckRhdGFcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0IG1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnMoKSB7XG4gICAgcmV0dXJuIGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9tYXliZUNvbnRhaW5zU2libGluZ0NvbWJpbmF0b3JzXCIsICgpID0+IHRoaXMuc2VsZWN0b3JzLnNvbWUoXG4gICAgICAgIHNlbGVjdG9yID0+IHNlbGVjdG9yLm1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnNcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgbWF0Y2hlc011dGF0aW9uVHlwZXMobXV0YXRpb25UeXBlcykge1xuICAgIGxldCBtdXRhdGlvblR5cGVNYXRjaE1hcCA9IGdldENhY2hlZFByb3BlcnR5VmFsdWUoXG4gICAgICB0aGlzLCBcIl9tdXRhdGlvblR5cGVNYXRjaE1hcFwiLCAoKSA9PiBuZXcgTWFwKFtcbiAgICAgICAgLy8gQWxsIHR5cGVzIG9mIERPTS1kZXBlbmRlbnQgcGF0dGVybnMgYXJlIGFmZmVjdGVkIGJ5IG11dGF0aW9ucyBvZlxuICAgICAgICAvLyB0eXBlIFwiY2hpbGRMaXN0XCIuXG4gICAgICAgIFtcImNoaWxkTGlzdFwiLCB0cnVlXSxcbiAgICAgICAgW1wiYXR0cmlidXRlc1wiLCB0aGlzLm1heWJlRGVwZW5kc09uQXR0cmlidXRlc10sXG4gICAgICAgIFtcImNoYXJhY3RlckRhdGFcIiwgdGhpcy5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhXVxuICAgICAgXSlcbiAgICApO1xuXG4gICAgZm9yIChsZXQgbXV0YXRpb25UeXBlIG9mIG11dGF0aW9uVHlwZXMpIHtcbiAgICAgIGlmIChtdXRhdGlvblR5cGVNYXRjaE1hcC5nZXQobXV0YXRpb25UeXBlKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRvciBmdW5jdGlvbiByZXR1cm5pbmcgQ1NTIHNlbGVjdG9ycyBmb3IgYWxsIGVsZW1lbnRzIHRoYXRcbiAgICogbWF0Y2ggdGhlIHBhdHRlcm4uXG4gICAqXG4gICAqIFRoaXMgYWxsb3dzIHRyYW5zZm9ybWluZyBmcm9tIHNlbGVjdG9ycyB0aGF0IG1heSBjb250YWluIGN1c3RvbVxuICAgKiA6LWFicC0gc2VsZWN0b3JzIHRvIHB1cmUgQ1NTIHNlbGVjdG9ycyB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlbGVjdFxuICAgKiBlbGVtZW50cy5cbiAgICpcbiAgICogVGhlIHNlbGVjdG9ycyByZXR1cm5lZCBmcm9tIHRoaXMgZnVuY3Rpb24gbWF5IGJlIGludmFsaWRhdGVkIGJ5IERPTVxuICAgKiBtdXRhdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gc3VidHJlZSB0aGUgc3VidHJlZSB3ZSB3b3JrIG9uXG4gICAqIEBwYXJhbSB7Tm9kZVtdfSBbdGFyZ2V0c10gdGhlIG5vZGVzIHdlIGFyZSBpbnRlcmVzdGVkIGluLiBNYXkgYmVcbiAgICogdXNlZCB0byBvcHRpbWl6ZSBzZWFyY2guXG4gICAqL1xuICAqZXZhbHVhdGUoc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGxldCBzZWxlY3RvcnMgPSB0aGlzLnNlbGVjdG9ycztcbiAgICBmdW5jdGlvbiogZXZhbHVhdGVJbm5lcihpbmRleCwgcHJlZml4LCBjdXJyZW50U3VidHJlZSkge1xuICAgICAgaWYgKGluZGV4ID49IHNlbGVjdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgeWllbGQgcHJlZml4O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBbc2VsZWN0b3IsIGVsZW1lbnRdIG9mIHNlbGVjdG9yc1tpbmRleF0uZ2V0U2VsZWN0b3JzKFxuICAgICAgICBwcmVmaXgsIGN1cnJlbnRTdWJ0cmVlLCB0YXJnZXRzXG4gICAgICApKSB7XG4gICAgICAgIGlmIChzZWxlY3RvciA9PSBudWxsKVxuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB5aWVsZCogZXZhbHVhdGVJbm5lcihpbmRleCArIDEsIHNlbGVjdG9yLCBlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIC8vIEp1c3QgaW4gY2FzZSB0aGUgZ2V0U2VsZWN0b3JzKCkgZ2VuZXJhdG9yIGFib3ZlIGhhZCB0byBydW4gc29tZSBoZWF2eVxuICAgICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgpIGNhbGwgd2hpY2ggZGlkbid0IHByb2R1Y2UgYW55IHJlc3VsdHMsIG1ha2VcbiAgICAgIC8vIHN1cmUgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHBvaW50IHdoZXJlIGV4ZWN1dGlvbiBjYW4gcGF1c2UuXG4gICAgICB5aWVsZCBudWxsO1xuICAgIH1cbiAgICB5aWVsZCogZXZhbHVhdGVJbm5lcigwLCBcIlwiLCBzdWJ0cmVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSBwYXR0ZXJuIG1hdGNoZXMgYSBzcGVjaWZpYyBlbGVtZW50XG4gICAqIEBwYXJhbSB7Tm9kZX0gW3RhcmdldF0gdGhlIGVsZW1lbnQgd2UncmUgaW50ZXJlc3RlZCBpbiBjaGVja2luZyBmb3JcbiAgICogbWF0Y2hlcyBvbi5cbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb25cbiAgICogQHJldHVybiB7Ym9vbH1cbiAgICovXG4gIG1hdGNoZXModGFyZ2V0LCBzdWJ0cmVlKSB7XG4gICAgbGV0IHRhcmdldEZpbHRlciA9IFt0YXJnZXRdO1xuICAgIGlmICh0aGlzLm1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnMpXG4gICAgICB0YXJnZXRGaWx0ZXIgPSBudWxsO1xuXG4gICAgbGV0IHNlbGVjdG9yR2VuZXJhdG9yID0gdGhpcy5ldmFsdWF0ZShzdWJ0cmVlLCB0YXJnZXRGaWx0ZXIpO1xuICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIHNlbGVjdG9yR2VuZXJhdG9yKSB7XG4gICAgICBpZiAoc2VsZWN0b3IgJiYgdGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc2V0U3R5bGVzKHN0eWxlcykge1xuICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIHRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICBpZiAoc2VsZWN0b3IuZGVwZW5kc09uU3R5bGVzKVxuICAgICAgICBzZWxlY3Rvci5zZXRTdHlsZXMoc3R5bGVzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdE11dGF0aW9uVHlwZXMobXV0YXRpb25zKSB7XG4gIGxldCB0eXBlcyA9IG5ldyBTZXQoKTtcblxuICBmb3IgKGxldCBtdXRhdGlvbiBvZiBtdXRhdGlvbnMpIHtcbiAgICB0eXBlcy5hZGQobXV0YXRpb24udHlwZSk7XG5cbiAgICAvLyBUaGVyZSBhcmUgb25seSAzIHR5cGVzIG9mIG11dGF0aW9uczogXCJhdHRyaWJ1dGVzXCIsIFwiY2hhcmFjdGVyRGF0YVwiLCBhbmRcbiAgICAvLyBcImNoaWxkTGlzdFwiLlxuICAgIGlmICh0eXBlcy5zaXplID09IDMpXG4gICAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiB0eXBlcztcbn1cblxuZnVuY3Rpb24gZXh0cmFjdE11dGF0aW9uVGFyZ2V0cyhtdXRhdGlvbnMpIHtcbiAgaWYgKCFtdXRhdGlvbnMpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgbGV0IHRhcmdldHMgPSBuZXcgU2V0KCk7XG5cbiAgZm9yIChsZXQgbXV0YXRpb24gb2YgbXV0YXRpb25zKSB7XG4gICAgaWYgKG11dGF0aW9uLnR5cGUgPT0gXCJjaGlsZExpc3RcIikge1xuICAgICAgLy8gV2hlbiBuZXcgbm9kZXMgYXJlIGFkZGVkLCB3ZSdyZSBpbnRlcmVzdGVkIGluIHRoZSBhZGRlZCBub2RlcyByYXRoZXJcbiAgICAgIC8vIHRoYW4gdGhlIHBhcmVudC5cbiAgICAgIGZvciAobGV0IG5vZGUgb2YgbXV0YXRpb24uYWRkZWROb2RlcylcbiAgICAgICAgdGFyZ2V0cy5hZGQobm9kZSk7XG4gICAgICBpZiAobXV0YXRpb24ucmVtb3ZlZE5vZGVzLmxlbmd0aCA+IDApXG4gICAgICAgIHRhcmdldHMuYWRkKG11dGF0aW9uLnRhcmdldCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGFyZ2V0cy5hZGQobXV0YXRpb24udGFyZ2V0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWy4uLnRhcmdldHNdO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJQYXR0ZXJucyhwYXR0ZXJucywge3N0eWxlc2hlZXRzLCBtdXRhdGlvbnN9KSB7XG4gIGlmICghc3R5bGVzaGVldHMgJiYgIW11dGF0aW9ucylcbiAgICByZXR1cm4gcGF0dGVybnMuc2xpY2UoKTtcblxuICBsZXQgbXV0YXRpb25UeXBlcyA9IG11dGF0aW9ucyA/IGV4dHJhY3RNdXRhdGlvblR5cGVzKG11dGF0aW9ucykgOiBudWxsO1xuXG4gIHJldHVybiBwYXR0ZXJucy5maWx0ZXIoXG4gICAgcGF0dGVybiA9PiAoc3R5bGVzaGVldHMgJiYgcGF0dGVybi5kZXBlbmRzT25TdHlsZXMpIHx8XG4gICAgICAgICAgICAgICAobXV0YXRpb25zICYmIHBhdHRlcm4ubWF0Y2hlc011dGF0aW9uVHlwZXMobXV0YXRpb25UeXBlcykpXG4gICk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZE9ic2VydmVBdHRyaWJ1dGVzKHBhdHRlcm5zKSB7XG4gIHJldHVybiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRPYnNlcnZlQ2hhcmFjdGVyRGF0YShwYXR0ZXJucykge1xuICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4uZGVwZW5kc09uQ2hhcmFjdGVyRGF0YSk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZE9ic2VydmVTdHlsZXMocGF0dGVybnMpIHtcbiAgcmV0dXJuIHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLmRlcGVuZHNPblN0eWxlcyk7XG59XG5cbi8qKlxuICogQGNhbGxiYWNrIGhpZGVFbGVtc0Z1bmNcbiAqIEBwYXJhbSB7Tm9kZVtdfSBlbGVtZW50cyBFbGVtZW50cyBvbiB0aGUgcGFnZSB0aGF0IHNob3VsZCBiZSBoaWRkZW5cbiAqIEBwYXJhbSB7c3RyaW5nW119IGVsZW1lbnRGaWx0ZXJzXG4gKiAgIFRoZSBmaWx0ZXIgdGV4dCB0aGF0IGNhdXNlZCB0aGUgZWxlbWVudHMgdG8gYmUgaGlkZGVuXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgdW5oaWRlRWxlbXNGdW5jXG4gKiBAcGFyYW0ge05vZGVbXX0gZWxlbWVudHMgRWxlbWVudHMgb24gdGhlIHBhZ2UgdGhhdCBzaG91bGQgYmUgaGlkZGVuXG4gKi9cblxuXG4vKipcbiAqIE1hbmFnZXMgdGhlIGZyb250LWVuZCBwcm9jZXNzaW5nIG9mIGVsZW1lbnQgaGlkaW5nIGVtdWxhdGlvbiBmaWx0ZXJzLlxuICovXG5leHBvcnRzLkVsZW1IaWRlRW11bGF0aW9uID0gY2xhc3MgRWxlbUhpZGVFbXVsYXRpb24ge1xuICAvKipcbiAgICogQHBhcmFtIHttb2R1bGU6Y29udGVudC9lbGVtSGlkZUVtdWxhdGlvbn5oaWRlRWxlbXNGdW5jfSBoaWRlRWxlbXNGdW5jXG4gICAqICAgQSBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBwcm92aWRlZCB0byBkbyB0aGUgYWN0dWFsIGVsZW1lbnQgaGlkaW5nLlxuICAgKiBAcGFyYW0ge21vZHVsZTpjb250ZW50L2VsZW1IaWRlRW11bGF0aW9ufnVuaGlkZUVsZW1zRnVuY30gdW5oaWRlRWxlbXNGdW5jXG4gICAqICAgQSBjYWxsYmFjayB0aGF0IHNob3VsZCBiZSBwcm92aWRlZCB0byB1bmhpZGUgcHJldmlvdXNseSBoaWRkZW4gZWxlbWVudHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoaWRlRWxlbXNGdW5jID0gKCkgPT4ge30sIHVuaGlkZUVsZW1zRnVuYyA9ICgpID0+IHt9KSB7XG4gICAgdGhpcy5fZmlsdGVyaW5nSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgIHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9sYXN0SW52b2NhdGlvbiA9IC1taW5JbnZvY2F0aW9uSW50ZXJ2YWw7XG4gICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyA9IG51bGw7XG5cbiAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7XG4gICAgdGhpcy5oaWRlRWxlbXNGdW5jID0gaGlkZUVsZW1zRnVuYztcbiAgICB0aGlzLnVuaGlkZUVsZW1zRnVuYyA9IHVuaGlkZUVsZW1zRnVuYztcbiAgICB0aGlzLm9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5vYnNlcnZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuaGlkZGVuRWxlbWVudHMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBpc1NhbWVPcmlnaW4oc3R5bGVzaGVldCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbmV3IFVSTChzdHlsZXNoZWV0LmhyZWYpLm9yaWdpbiA9PSB0aGlzLmRvY3VtZW50LmxvY2F0aW9uLm9yaWdpbjtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIC8vIEludmFsaWQgVVJMLCBhc3N1bWUgdGhhdCBpdCBpcyBmaXJzdC1wYXJ0eS5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSB0aGUgc2VsZWN0b3JcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIHRoZSBzZWxlY3RvciB0byBwYXJzZVxuICAgKiBAcmV0dXJuIHtBcnJheX0gc2VsZWN0b3JzIGlzIGFuIGFycmF5IG9mIG9iamVjdHMsXG4gICAqIG9yIG51bGwgaW4gY2FzZSBvZiBlcnJvcnMuXG4gICAqL1xuICBwYXJzZVNlbGVjdG9yKHNlbGVjdG9yKSB7XG4gICAgaWYgKHNlbGVjdG9yLmxlbmd0aCA9PSAwKVxuICAgICAgcmV0dXJuIFtdO1xuXG4gICAgbGV0IG1hdGNoID0gYWJwU2VsZWN0b3JSZWdleHAuZXhlYyhzZWxlY3Rvcik7XG4gICAgaWYgKCFtYXRjaClcbiAgICAgIHJldHVybiBbbmV3IFBsYWluU2VsZWN0b3Ioc2VsZWN0b3IpXTtcblxuICAgIGxldCBzZWxlY3RvcnMgPSBbXTtcbiAgICBpZiAobWF0Y2guaW5kZXggPiAwKVxuICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IFBsYWluU2VsZWN0b3Ioc2VsZWN0b3Iuc3Vic3RyaW5nKDAsIG1hdGNoLmluZGV4KSkpO1xuXG4gICAgbGV0IHN0YXJ0SW5kZXggPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICBsZXQgY29udGVudCA9IHBhcnNlU2VsZWN0b3JDb250ZW50KHNlbGVjdG9yLCBzdGFydEluZGV4KTtcbiAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgIGNvbnNvbGUud2FybihuZXcgU3ludGF4RXJyb3IoXCJGYWlsZWQgdG8gcGFyc2UgQWRibG9jayBQbHVzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHNlbGVjdG9yICR7c2VsZWN0b3J9IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImR1ZSB0byB1bm1hdGNoZWQgcGFyZW50aGVzZXMuXCIpKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAobWF0Y2hbMV0gPT0gXCItYWJwLXByb3BlcnRpZXNcIikge1xuICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IFByb3BzU2VsZWN0b3IoY29udGVudC50ZXh0KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1hdGNoWzFdID09IFwiLWFicC1oYXNcIiB8fCBtYXRjaFsxXSA9PSBcImhhc1wiKSB7XG4gICAgICBsZXQgaGFzU2VsZWN0b3JzID0gdGhpcy5wYXJzZVNlbGVjdG9yKGNvbnRlbnQudGV4dCk7XG4gICAgICBpZiAoaGFzU2VsZWN0b3JzID09IG51bGwpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IEhhc1NlbGVjdG9yKGhhc1NlbGVjdG9ycykpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtYXRjaFsxXSA9PSBcIi1hYnAtY29udGFpbnNcIiB8fCBtYXRjaFsxXSA9PSBcImhhcy10ZXh0XCIpIHtcbiAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBDb250YWluc1NlbGVjdG9yKGNvbnRlbnQudGV4dCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtYXRjaFsxXSA9PT0gXCJ4cGF0aFwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICBzZWxlY3RvcnMucHVzaChuZXcgWFBhdGhTZWxlY3Rvcihjb250ZW50LnRleHQpKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoICh7bWVzc2FnZX0pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICAgIFwiRmFpbGVkIHRvIHBhcnNlIEFkYmxvY2sgUGx1cyBcIiArXG4gICAgICAgICAgICBgc2VsZWN0b3IgJHtzZWxlY3Rvcn0sIGludmFsaWQgYCArXG4gICAgICAgICAgICBgeHBhdGg6ICR7Y29udGVudC50ZXh0fSBgICtcbiAgICAgICAgICAgIGBlcnJvcjogJHttZXNzYWdlfS5gXG4gICAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChtYXRjaFsxXSA9PSBcIm5vdFwiKSB7XG4gICAgICBsZXQgbm90U2VsZWN0b3JzID0gdGhpcy5wYXJzZVNlbGVjdG9yKGNvbnRlbnQudGV4dCk7XG4gICAgICBpZiAobm90U2VsZWN0b3JzID09IG51bGwpXG4gICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAvLyBpZiBhbGwgb2YgdGhlIGlubmVyIHNlbGVjdG9ycyBhcmUgUGxhaW5TZWxlY3RvcnMsIHRoZW4gd2VcbiAgICAgIC8vIGRvbid0IGFjdHVhbGx5IG5lZWQgdG8gdXNlIG91ciBzZWxlY3RvciBhdCBhbGwuIFdlJ3JlIGJldHRlclxuICAgICAgLy8gb2ZmIGRlbGVnYXRpbmcgdG8gdGhlIGJyb3dzZXIgOm5vdCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIGlmIChub3RTZWxlY3RvcnMuZXZlcnkocyA9PiBzIGluc3RhbmNlb2YgUGxhaW5TZWxlY3RvcikpXG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBQbGFpblNlbGVjdG9yKGA6bm90KCR7Y29udGVudC50ZXh0fSlgKSk7XG4gICAgICBlbHNlXG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBOb3RTZWxlY3Rvcihub3RTZWxlY3RvcnMpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0aGlzIGlzIGFuIGVycm9yLCBjYW4ndCBwYXJzZSBzZWxlY3Rvci5cbiAgICAgIGNvbnNvbGUud2FybihuZXcgU3ludGF4RXJyb3IoXCJGYWlsZWQgdG8gcGFyc2UgQWRibG9jayBQbHVzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHNlbGVjdG9yICR7c2VsZWN0b3J9LCBpbnZhbGlkIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgcHNldWRvLWNsYXNzIDoke21hdGNoWzFdfSgpLmApKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBzdWZmaXggPSB0aGlzLnBhcnNlU2VsZWN0b3Ioc2VsZWN0b3Iuc3Vic3RyaW5nKGNvbnRlbnQuZW5kICsgMSkpO1xuICAgIGlmIChzdWZmaXggPT0gbnVsbClcbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgc2VsZWN0b3JzLnB1c2goLi4uc3VmZml4KTtcblxuICAgIGlmIChzZWxlY3RvcnMubGVuZ3RoID09IDEgJiYgc2VsZWN0b3JzWzBdIGluc3RhbmNlb2YgQ29udGFpbnNTZWxlY3Rvcikge1xuICAgICAgY29uc29sZS53YXJuKG5ldyBTeW50YXhFcnJvcihcIkZhaWxlZCB0byBwYXJzZSBBZGJsb2NrIFBsdXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2VsZWN0b3IgJHtzZWxlY3Rvcn0sIGNhbid0IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhhdmUgYSBsb25lbHkgOi1hYnAtY29udGFpbnMoKS5cIikpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBzZWxlY3RvcnM7XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIHJ1bGVzIG91dCBvZiBDU1Mgc3R5bGVzaGVldHNcbiAgICogQHBhcmFtIHtDU1NTdHlsZVNoZWV0W119IFtzdHlsZXNoZWV0c10gVGhlIGxpc3Qgb2Ygc3R5bGVzaGVldHMgdG9cbiAgICogcmVhZC5cbiAgICogQHJldHVybiB7Q1NTU3R5bGVSdWxlW119XG4gICAqL1xuICBfcmVhZENzc1J1bGVzKHN0eWxlc2hlZXRzKSB7XG4gICAgbGV0IGNzc1N0eWxlcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgc3R5bGVzaGVldCBvZiBzdHlsZXNoZWV0cyB8fCBbXSkge1xuICAgICAgLy8gRXhwbGljaXRseSBpZ25vcmUgdGhpcmQtcGFydHkgc3R5bGVzaGVldHMgdG8gZW5zdXJlIGNvbnNpc3RlbnQgYmVoYXZpb3JcbiAgICAgIC8vIGJldHdlZW4gRmlyZWZveCBhbmQgQ2hyb21lLlxuICAgICAgaWYgKCF0aGlzLmlzU2FtZU9yaWdpbihzdHlsZXNoZWV0KSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIGxldCBydWxlcztcbiAgICAgIHRyeSB7XG4gICAgICAgIHJ1bGVzID0gc3R5bGVzaGVldC5jc3NSdWxlcztcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIE9uIEZpcmVmb3gsIHRoZXJlIGlzIGEgY2hhbmNlIHRoYXQgYW4gSW52YWxpZEFjY2Vzc0Vycm9yXG4gICAgICAgIC8vIGdldCB0aHJvd24gd2hlbiBhY2Nlc3NpbmcgY3NzUnVsZXMuIEp1c3Qgc2tpcCB0aGUgc3R5bGVzaGVldFxuICAgICAgICAvLyBpbiB0aGF0IGNhc2UuXG4gICAgICAgIC8vIFNlZSBodHRwczovL3NlYXJjaGZveC5vcmcvbW96aWxsYS1jZW50cmFsL3Jldi9mNjVkNzUyOGUzNGVmMWE3NjY1YjRhMWE3YjdjZGIxMzg4ZmNkM2FhL2xheW91dC9zdHlsZS9TdHlsZVNoZWV0LmNwcCM2OTlcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghcnVsZXMpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBmb3IgKGxldCBydWxlIG9mIHJ1bGVzKSB7XG4gICAgICAgIGlmIChydWxlLnR5cGUgIT0gcnVsZS5TVFlMRV9SVUxFKVxuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGNzc1N0eWxlcy5wdXNoKHN0cmluZ2lmeVN0eWxlKHJ1bGUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNzc1N0eWxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgdGhlIGN1cnJlbnQgZG9jdW1lbnQgYW5kIGFwcGxpZXMgYWxsIHJ1bGVzIHRvIGl0LlxuICAgKiBAcGFyYW0ge0NTU1N0eWxlU2hlZXRbXX0gW3N0eWxlc2hlZXRzXVxuICAgKiAgICBUaGUgbGlzdCBvZiBuZXcgc3R5bGVzaGVldHMgdGhhdCBoYXZlIGJlZW4gYWRkZWQgdG8gdGhlIGRvY3VtZW50IGFuZFxuICAgKiAgICBtYWRlIHJlcHJvY2Vzc2luZyBuZWNlc3NhcnkuIFRoaXMgcGFyYW1ldGVyIHNob3VsZG4ndCBiZSBwYXNzZWQgaW4gZm9yXG4gICAqICAgIHRoZSBpbml0aWFsIHByb2Nlc3NpbmcsIGFsbCBvZiBkb2N1bWVudCdzIHN0eWxlc2hlZXRzIHdpbGwgYmUgY29uc2lkZXJlZFxuICAgKiAgICB0aGVuIGFuZCBhbGwgcnVsZXMsIGluY2x1ZGluZyB0aGUgb25lcyBub3QgZGVwZW5kZW50IG9uIHN0eWxlcy5cbiAgICogQHBhcmFtIHtNdXRhdGlvblJlY29yZFtdfSBbbXV0YXRpb25zXVxuICAgKiAgICBUaGUgbGlzdCBvZiBET00gbXV0YXRpb25zIHRoYXQgaGF2ZSBiZWVuIGFwcGxpZWQgdG8gdGhlIGRvY3VtZW50IGFuZFxuICAgKiAgICBtYWRlIHJlcHJvY2Vzc2luZyBuZWNlc3NhcnkuIFRoaXMgcGFyYW1ldGVyIHNob3VsZG4ndCBiZSBwYXNzZWQgaW4gZm9yXG4gICAqICAgIHRoZSBpbml0aWFsIHByb2Nlc3NpbmcsIHRoZSBlbnRpcmUgZG9jdW1lbnQgd2lsbCBiZSBjb25zaWRlcmVkXG4gICAqICAgIHRoZW4gYW5kIGFsbCBydWxlcywgaW5jbHVkaW5nIHRoZSBvbmVzIG5vdCBkZXBlbmRlbnQgb24gdGhlIERPTS5cbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICogICAgQSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIG9uY2UgYWxsIGZpbHRlcmluZyBpcyBjb21wbGV0ZWRcbiAgICovXG4gIGFzeW5jIF9hZGRTZWxlY3RvcnMoc3R5bGVzaGVldHMsIG11dGF0aW9ucykge1xuICAgIGlmICh0ZXN0SW5mbylcbiAgICAgIHRlc3RJbmZvLmxhc3RQcm9jZXNzZWRFbGVtZW50cy5jbGVhcigpO1xuXG4gICAgbGV0IGRlYWRsaW5lID0gbmV3SWRsZURlYWRsaW5lKCk7XG5cbiAgICBpZiAoc2hvdWxkT2JzZXJ2ZVN0eWxlcyh0aGlzLnBhdHRlcm5zKSlcbiAgICAgIHRoaXMuX3JlZnJlc2hQYXR0ZXJuU3R5bGVzKCk7XG5cbiAgICBsZXQgcGF0dGVybnNUb0NoZWNrID0gZmlsdGVyUGF0dGVybnMoXG4gICAgICB0aGlzLnBhdHRlcm5zLCB7c3R5bGVzaGVldHMsIG11dGF0aW9uc31cbiAgICApO1xuXG4gICAgbGV0IHRhcmdldHMgPSBleHRyYWN0TXV0YXRpb25UYXJnZXRzKG11dGF0aW9ucyk7XG5cbiAgICBsZXQgZWxlbWVudHNUb0hpZGUgPSBbXTtcbiAgICBsZXQgZWxlbWVudEZpbHRlcnMgPSBbXTtcbiAgICBsZXQgZWxlbWVudHNUb1VuaGlkZSA9IG5ldyBTZXQodGhpcy5oaWRkZW5FbGVtZW50cyk7XG5cbiAgICBmb3IgKGxldCBwYXR0ZXJuIG9mIHBhdHRlcm5zVG9DaGVjaykge1xuICAgICAgbGV0IGV2YWx1YXRpb25UYXJnZXRzID0gdGFyZ2V0cztcblxuICAgICAgLy8gSWYgdGhlIHBhdHRlcm4gYXBwZWFycyB0byBjb250YWluIGFueSBzaWJsaW5nIGNvbWJpbmF0b3JzLCB3ZSBjYW4ndFxuICAgICAgLy8gZWFzaWx5IG9wdGltaXplIGJhc2VkIG9uIHRoZSBtdXRhdGlvbiB0YXJnZXRzLiBTaW5jZSB0aGlzIGlzIGFcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSwgc2tpcCB0aGUgb3B0aW1pemF0aW9uLiBCeSBzZXR0aW5nIGl0IHRvIG51bGwgaGVyZSB3ZVxuICAgICAgLy8gbWFrZSBzdXJlIHdlIHByb2Nlc3MgdGhlIGVudGlyZSBET00uXG4gICAgICBpZiAocGF0dGVybi5tYXliZUNvbnRhaW5zU2libGluZ0NvbWJpbmF0b3JzKVxuICAgICAgICBldmFsdWF0aW9uVGFyZ2V0cyA9IG51bGw7XG5cbiAgICAgIGxldCBnZW5lcmF0b3IgPSBwYXR0ZXJuLmV2YWx1YXRlKHRoaXMuZG9jdW1lbnQsIGV2YWx1YXRpb25UYXJnZXRzKTtcbiAgICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIGdlbmVyYXRvcikge1xuICAgICAgICBpZiAoc2VsZWN0b3IgIT0gbnVsbCkge1xuICAgICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmhpZGRlbkVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgICAgICBlbGVtZW50c1RvSGlkZS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICAgICAgICBlbGVtZW50RmlsdGVycy5wdXNoKHBhdHRlcm4udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgZWxlbWVudHNUb1VuaGlkZS5kZWxldGUoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlYWRsaW5lLnRpbWVSZW1haW5pbmcoKSA8PSAwKVxuICAgICAgICAgIGRlYWRsaW5lID0gYXdhaXQgeWllbGRUaHJlYWQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5faGlkZUVsZW1zKGVsZW1lbnRzVG9IaWRlLCBlbGVtZW50RmlsdGVycyk7XG5cbiAgICAvLyBUaGUgc2VhcmNoIGZvciBlbGVtZW50cyB0byBoaWRlIGl0IG9wdGltaXplZCB0byBmaW5kIG5ldyB0aGluZ3NcbiAgICAvLyB0byBoaWRlIHF1aWNrbHksIGJ5IG5vdCBjaGVja2luZyBhbGwgcGF0dGVybnMgYW5kIG5vdCBjaGVja2luZ1xuICAgIC8vIHRoZSBmdWxsIERPTS4gVGhhdCdzIHdoeSB3ZSBuZWVkIHRvIGRvIGEgbW9yZSB0aG9yb3VnaCBjaGVja1xuICAgIC8vIGZvciBlYWNoIHJlbWFpbmluZyBlbGVtZW50IHRoYXQgbWlnaHQgbmVlZCB0byBiZSB1bmhpZGRlbixcbiAgICAvLyBjaGVja2luZyBhbGwgcGF0dGVybnMuXG4gICAgZm9yIChsZXQgZWxlbSBvZiBlbGVtZW50c1RvVW5oaWRlKSB7XG4gICAgICBpZiAoIWVsZW0uaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgLy8gZWxlbWVudHMgdGhhdCBhcmUgbm8gbG9uZ2VyIGluIHRoZSBET00gc2hvdWxkIGJlIHVuaGlkZGVuXG4gICAgICAgIC8vIGluIGNhc2UgdGhleSdyZSBldmVyIHJlYWRkZWQsIGFuZCB0aGVuIGZvcmdvdHRlbiBhYm91dCBzb1xuICAgICAgICAvLyB3ZSBkb24ndCBjYXVzZSBhIG1lbW9yeSBsZWFrLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCBtYXRjaGVzQW55ID0gdGhpcy5wYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5tYXRjaGVzKFxuICAgICAgICBlbGVtLCB0aGlzLmRvY3VtZW50XG4gICAgICApKTtcbiAgICAgIGlmIChtYXRjaGVzQW55KVxuICAgICAgICBlbGVtZW50c1RvVW5oaWRlLmRlbGV0ZShlbGVtKTtcblxuICAgICAgaWYgKGRlYWRsaW5lLnRpbWVSZW1haW5pbmcoKSA8PSAwKVxuICAgICAgICBkZWFkbGluZSA9IGF3YWl0IHlpZWxkVGhyZWFkKCk7XG4gICAgfVxuICAgIHRoaXMuX3VuaGlkZUVsZW1zKEFycmF5LmZyb20oZWxlbWVudHNUb1VuaGlkZSkpO1xuICB9XG5cbiAgX2hpZGVFbGVtcyhlbGVtZW50c1RvSGlkZSwgZWxlbWVudEZpbHRlcnMpIHtcbiAgICBpZiAoZWxlbWVudHNUb0hpZGUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5oaWRlRWxlbXNGdW5jKGVsZW1lbnRzVG9IaWRlLCBlbGVtZW50RmlsdGVycyk7XG4gICAgICBmb3IgKGxldCBlbGVtIG9mIGVsZW1lbnRzVG9IaWRlKVxuICAgICAgICB0aGlzLmhpZGRlbkVsZW1lbnRzLmFkZChlbGVtKTtcbiAgICB9XG4gIH1cblxuICBfdW5oaWRlRWxlbXMoZWxlbWVudHNUb1VuaGlkZSkge1xuICAgIGlmIChlbGVtZW50c1RvVW5oaWRlLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMudW5oaWRlRWxlbXNGdW5jKGVsZW1lbnRzVG9VbmhpZGUpO1xuICAgICAgZm9yIChsZXQgZWxlbSBvZiBlbGVtZW50c1RvVW5oaWRlKVxuICAgICAgICB0aGlzLmhpZGRlbkVsZW1lbnRzLmRlbGV0ZShlbGVtKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybWVkIGFueSBzY2hlZHVsZWQgcHJvY2Vzc2luZy5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBpcyBhc3luY3Jvbm91cywgYW5kIHNob3VsZCBub3QgYmUgcnVuIG11bHRpcGxlXG4gICAqIHRpbWVzIGluIHBhcmFsbGVsLiBUaGUgZmxhZyBgX2ZpbHRlcmluZ0luUHJvZ3Jlc3NgIGlzIHNldCBhbmRcbiAgICogdW5zZXQgc28geW91IGNhbiBjaGVjayBpZiBpdCdzIGFscmVhZHkgcnVubmluZy5cbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICogIEEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCBvbmNlIGFsbCBmaWx0ZXJpbmcgaXMgY29tcGxldGVkXG4gICAqL1xuICBhc3luYyBfcHJvY2Vzc0ZpbHRlcmluZygpIHtcbiAgICBpZiAodGhpcy5fZmlsdGVyaW5nSW5Qcm9ncmVzcykge1xuICAgICAgY29uc29sZS53YXJuKFwiRWxlbUhpZGVFbXVsYXRpb24gc2NoZWR1bGluZyBlcnJvcjogXCIgK1xuICAgICAgICAgICAgICAgICAgIFwiVHJpZWQgdG8gcHJvY2VzcyBmaWx0ZXJpbmcgaW4gcGFyYWxsZWwuXCIpO1xuICAgICAgaWYgKHRlc3RJbmZvKSB7XG4gICAgICAgIHRlc3RJbmZvLmZhaWxlZEFzc2VydGlvbnMucHVzaChcbiAgICAgICAgICBcIlRyaWVkIHRvIHByb2Nlc3MgZmlsdGVyaW5nIGluIHBhcmFsbGVsXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHBhcmFtcyA9IHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgfHwge307XG4gICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyA9IG51bGw7XG4gICAgdGhpcy5fZmlsdGVyaW5nSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgdGhpcy5fbmV4dEZpbHRlcmluZ1NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIGF3YWl0IHRoaXMuX2FkZFNlbGVjdG9ycyhcbiAgICAgIHBhcmFtcy5zdHlsZXNoZWV0cyxcbiAgICAgIHBhcmFtcy5tdXRhdGlvbnNcbiAgICApO1xuICAgIHRoaXMuX2xhc3RJbnZvY2F0aW9uID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5fZmlsdGVyaW5nSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nKVxuICAgICAgdGhpcy5fc2NoZWR1bGVOZXh0RmlsdGVyaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBuZXcgY2hhbmdlcyB0byB0aGUgbGlzdCBvZiBmaWx0ZXJzIGZvciB0aGUgbmV4dCB0aW1lXG4gICAqIGZpbHRlcmluZyBpcyBydW4uXG4gICAqIEBwYXJhbSB7Q1NTU3R5bGVTaGVldFtdfSBbc3R5bGVzaGVldHNdXG4gICAqICAgIG5ldyBzdHlsZXNoZWV0cyB0byBiZSBwcm9jZXNzZWQuIFRoaXMgcGFyYW1ldGVyIHNob3VsZCBiZSBvbWl0dGVkXG4gICAqICAgIGZvciBmdWxsIHJlcHJvY2Vzc2luZy5cbiAgICogQHBhcmFtIHtNdXRhdGlvblJlY29yZFtdfSBbbXV0YXRpb25zXVxuICAgKiAgICBuZXcgRE9NIG11dGF0aW9ucyB0byBiZSBwcm9jZXNzZWQuIFRoaXMgcGFyYW1ldGVyIHNob3VsZCBiZSBvbWl0dGVkXG4gICAqICAgIGZvciBmdWxsIHJlcHJvY2Vzc2luZy5cbiAgICovXG4gIF9hcHBlbmRTY2hlZHVsZWRQcm9jZXNzaW5nKHN0eWxlc2hlZXRzLCBtdXRhdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcpIHtcbiAgICAgIC8vIFRoZXJlIGlzbid0IGFueXRoaW5nIHNjaGVkdWxlZCB5ZXQuIE1ha2UgdGhlIHNjaGVkdWxlLlxuICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyA9IHtzdHlsZXNoZWV0cywgbXV0YXRpb25zfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIXN0eWxlc2hlZXRzICYmICFtdXRhdGlvbnMpIHtcbiAgICAgIC8vIFRoZSBuZXcgcmVxdWVzdCB3YXMgdG8gcmVwcm9jZXNzIGV2ZXJ5dGhpbmcsIGFuZCBzbyBhbnlcbiAgICAgIC8vIHByZXZpb3VzIGZpbHRlcnMgYXJlIGlycmVsZXZhbnQuXG4gICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nID0ge307XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuX3NjaGVkdWxlZFByb2Nlc3Npbmcuc3R5bGVzaGVldHMgfHxcbiAgICAgICAgICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLm11dGF0aW9ucykge1xuICAgICAgLy8gVGhlIHByZXZpb3VzIGZpbHRlcnMgYXJlIG5vdCB0byBmaWx0ZXIgZXZlcnl0aGluZywgc28gdGhlIG5ld1xuICAgICAgLy8gcGFyYW1ldGVycyBtYXR0ZXIuIFB1c2ggdGhlbSBvbnRvIHRoZSBhcHByb3ByaWF0ZSBsaXN0cy5cbiAgICAgIGlmIChzdHlsZXNoZWV0cykge1xuICAgICAgICBpZiAoIXRoaXMuX3NjaGVkdWxlZFByb2Nlc3Npbmcuc3R5bGVzaGVldHMpXG4gICAgICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5zdHlsZXNoZWV0cyA9IFtdO1xuICAgICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLnN0eWxlc2hlZXRzLnB1c2goLi4uc3R5bGVzaGVldHMpO1xuICAgICAgfVxuICAgICAgaWYgKG11dGF0aW9ucykge1xuICAgICAgICBpZiAoIXRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcubXV0YXRpb25zKVxuICAgICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcubXV0YXRpb25zID0gW107XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcubXV0YXRpb25zLnB1c2goLi4ubXV0YXRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nIGlzIGFscmVhZHkgZ29pbmcgdG8gcmVjaGVja1xuICAgICAgLy8gZXZlcnl0aGluZywgc28gbm8gbmVlZCB0byBkbyBhbnl0aGluZyBoZXJlLlxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZSBmaWx0ZXJpbmcgdG8gYmUgcHJvY2Vzc2VkIGluIHRoZSBmdXR1cmUsIG9yIHN0YXJ0XG4gICAqIHByb2Nlc3NpbmcgaW1tZWRpYXRlbHkuXG4gICAqXG4gICAqIElmIHByb2Nlc3NpbmcgaXMgYWxyZWFkeSBzY2hlZHVsZWQsIHRoaXMgZG9lcyBub3RoaW5nLlxuICAgKi9cbiAgX3NjaGVkdWxlTmV4dEZpbHRlcmluZygpIHtcbiAgICBpZiAodGhpcy5fbmV4dEZpbHRlcmluZ1NjaGVkdWxlZCB8fCB0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzKSB7XG4gICAgICAvLyBUaGUgbmV4dCBvbmUgaGFzIGFscmVhZHkgYmVlbiBzY2hlZHVsZWQuIE91ciBuZXcgZXZlbnRzIGFyZVxuICAgICAgLy8gb24gdGhlIHF1ZXVlLCBzbyBub3RoaW5nIG1vcmUgdG8gZG8uXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgIC8vIERvY3VtZW50IGlzbid0IGZ1bGx5IGxvYWRlZCB5ZXQsIHNvIHNjaGVkdWxlIG91ciBmaXJzdFxuICAgICAgLy8gZmlsdGVyaW5nIGFzIHNvb24gYXMgdGhhdCdzIGRvbmUuXG4gICAgICB0aGlzLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIFwiRE9NQ29udGVudExvYWRlZFwiLFxuICAgICAgICAoKSA9PiB0aGlzLl9wcm9jZXNzRmlsdGVyaW5nKCksXG4gICAgICAgIHtvbmNlOiB0cnVlfVxuICAgICAgKTtcbiAgICAgIHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuX2xhc3RJbnZvY2F0aW9uIDxcbiAgICAgICAgICAgICBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwpIHtcbiAgICAgIC8vIEl0IGhhc24ndCBiZWVuIGxvbmcgZW5vdWdoIHNpbmNlIG91ciBsYXN0IGZpbHRlci4gU2V0IHRoZVxuICAgICAgLy8gdGltZW91dCBmb3Igd2hlbiBpdCdzIHRpbWUgZm9yIHRoYXQuXG4gICAgICBzZXRUaW1lb3V0KFxuICAgICAgICAoKSA9PiB0aGlzLl9wcm9jZXNzRmlsdGVyaW5nKCksXG4gICAgICAgIG1pbkludm9jYXRpb25JbnRlcnZhbCAtIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuX2xhc3RJbnZvY2F0aW9uKVxuICAgICAgKTtcbiAgICAgIHRoaXMuX25leHRGaWx0ZXJpbmdTY2hlZHVsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIFdlIGNhbiBhY3R1YWxseSBqdXN0IHN0YXJ0IGZpbHRlcmluZyBpbW1lZGlhdGVseSFcbiAgICAgIHRoaXMuX3Byb2Nlc3NGaWx0ZXJpbmcoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmUtcnVuIGZpbHRlcmluZyBlaXRoZXIgaW1tZWRpYXRlbHkgb3IgcXVldWVkLlxuICAgKiBAcGFyYW0ge0NTU1N0eWxlU2hlZXRbXX0gW3N0eWxlc2hlZXRzXVxuICAgKiAgICBuZXcgc3R5bGVzaGVldHMgdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIHBhcmFtZXRlciBzaG91bGQgYmUgb21pdHRlZFxuICAgKiAgICBmb3IgZnVsbCByZXByb2Nlc3NpbmcuXG4gICAqIEBwYXJhbSB7TXV0YXRpb25SZWNvcmRbXX0gW211dGF0aW9uc11cbiAgICogICAgbmV3IERPTSBtdXRhdGlvbnMgdG8gYmUgcHJvY2Vzc2VkLiBUaGlzIHBhcmFtZXRlciBzaG91bGQgYmUgb21pdHRlZFxuICAgKiAgICBmb3IgZnVsbCByZXByb2Nlc3NpbmcuXG4gICAqL1xuICBxdWV1ZUZpbHRlcmluZyhzdHlsZXNoZWV0cywgbXV0YXRpb25zKSB7XG4gICAgdGhpcy5fYXBwZW5kU2NoZWR1bGVkUHJvY2Vzc2luZyhzdHlsZXNoZWV0cywgbXV0YXRpb25zKTtcbiAgICB0aGlzLl9zY2hlZHVsZU5leHRGaWx0ZXJpbmcoKTtcbiAgfVxuXG4gIF9yZWZyZXNoUGF0dGVyblN0eWxlcyhzdHlsZXNoZWV0KSB7XG4gICAgbGV0IGFsbENzc1J1bGVzID0gdGhpcy5fcmVhZENzc1J1bGVzKHRoaXMuZG9jdW1lbnQuc3R5bGVTaGVldHMpO1xuICAgIGZvciAobGV0IHBhdHRlcm4gb2YgdGhpcy5wYXR0ZXJucylcbiAgICAgIHBhdHRlcm4uc2V0U3R5bGVzKGFsbENzc1J1bGVzKTtcbiAgfVxuXG4gIG9uTG9hZChldmVudCkge1xuICAgIGxldCBzdHlsZXNoZWV0ID0gZXZlbnQudGFyZ2V0LnNoZWV0O1xuICAgIGlmIChzdHlsZXNoZWV0KVxuICAgICAgdGhpcy5xdWV1ZUZpbHRlcmluZyhbc3R5bGVzaGVldF0pO1xuICB9XG5cbiAgb2JzZXJ2ZShtdXRhdGlvbnMpIHtcbiAgICBpZiAodGVzdEluZm8pIHtcbiAgICAgIC8vIEluIHRlc3QgbW9kZSwgZmlsdGVyIG91dCBhbnkgbXV0YXRpb25zIGxpa2VseSBkb25lIGJ5IHVzXG4gICAgICAvLyAoaS5lLiBzdHlsZT1cImRpc3BsYXk6IG5vbmUgIWltcG9ydGFudFwiKS4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG9cbiAgICAgIC8vIG9ic2VydmUgaG93IHRoZSBjb2RlIHJlc3BvbmRzIHRvIERPTSBtdXRhdGlvbnMuXG4gICAgICBtdXRhdGlvbnMgPSBtdXRhdGlvbnMuZmlsdGVyKFxuICAgICAgICAoe3R5cGUsIGF0dHJpYnV0ZU5hbWUsIHRhcmdldDoge3N0eWxlOiBuZXdWYWx1ZX0sIG9sZFZhbHVlfSkgPT5cbiAgICAgICAgICAhKHR5cGUgPT0gXCJhdHRyaWJ1dGVzXCIgJiYgYXR0cmlidXRlTmFtZSA9PSBcInN0eWxlXCIgJiZcbiAgICAgICAgICAgIG5ld1ZhbHVlLmRpc3BsYXkgPT0gXCJub25lXCIgJiZcbiAgICAgICAgICAgIHRvQ1NTU3R5bGVEZWNsYXJhdGlvbihvbGRWYWx1ZSkuZGlzcGxheSAhPSBcIm5vbmVcIilcbiAgICAgICk7XG5cbiAgICAgIGlmIChtdXRhdGlvbnMubGVuZ3RoID09IDApXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnF1ZXVlRmlsdGVyaW5nKG51bGwsIG11dGF0aW9ucyk7XG4gIH1cblxuICBhcHBseShwYXR0ZXJucykge1xuICAgIHRoaXMucGF0dGVybnMgPSBbXTtcbiAgICBmb3IgKGxldCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgICBsZXQgc2VsZWN0b3JzID0gdGhpcy5wYXJzZVNlbGVjdG9yKHBhdHRlcm4uc2VsZWN0b3IpO1xuICAgICAgaWYgKHNlbGVjdG9ycyAhPSBudWxsICYmIHNlbGVjdG9ycy5sZW5ndGggPiAwKVxuICAgICAgICB0aGlzLnBhdHRlcm5zLnB1c2gobmV3IFBhdHRlcm4oc2VsZWN0b3JzLCBwYXR0ZXJuLnRleHQpKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wYXR0ZXJucy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnF1ZXVlRmlsdGVyaW5nKCk7XG5cbiAgICAgIGxldCBhdHRyaWJ1dGVzID0gc2hvdWxkT2JzZXJ2ZUF0dHJpYnV0ZXModGhpcy5wYXR0ZXJucyk7XG4gICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoXG4gICAgICAgIHRoaXMuZG9jdW1lbnQsXG4gICAgICAgIHtcbiAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgYXR0cmlidXRlcyxcbiAgICAgICAgICBhdHRyaWJ1dGVPbGRWYWx1ZTogYXR0cmlidXRlcyAmJiAhIXRlc3RJbmZvLFxuICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHNob3VsZE9ic2VydmVDaGFyYWN0ZXJEYXRhKHRoaXMucGF0dGVybnMpLFxuICAgICAgICAgIHN1YnRyZWU6IHRydWVcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGlmIChzaG91bGRPYnNlcnZlU3R5bGVzKHRoaXMucGF0dGVybnMpKSB7XG4gICAgICAgIGxldCBvbkxvYWQgPSB0aGlzLm9uTG9hZC5iaW5kKHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5kb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIilcbiAgICAgICAgICB0aGlzLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIG9uTG9hZCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgb25Mb2FkLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgQWRibG9jayBQbHVzIDxodHRwczovL2FkYmxvY2twbHVzLm9yZy8+LFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEFkYmxvY2sgUGx1cy4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiogQG1vZHVsZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgcGF0dGVybnMgdGhhdFxuICogYHtAbGluayBtb2R1bGU6cGF0dGVybnMuY29tcGlsZVBhdHRlcm5zIGNvbXBpbGVQYXR0ZXJucygpfWAgd2lsbCBjb21waWxlXG4gKiBpbnRvIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5jb25zdCBDT01QSUxFX1BBVFRFUk5TX01BWCA9IDEwMDtcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBtYXRjaCB0aGUgYF5gIHN1ZmZpeCBpbiBhbiBvdGhlcndpc2UgbGl0ZXJhbFxuICogcGF0dGVybi5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmxldCBzZXBhcmF0b3JSZWdFeHAgPSAvW1xceDAwLVxceDI0XFx4MjYtXFx4MkNcXHgyRlxceDNBLVxceDQwXFx4NUItXFx4NUVcXHg2MFxceDdCLVxceDdGXS87XG5cbmxldCBmaWx0ZXJUb1JlZ0V4cCA9XG4vKipcbiAqIENvbnZlcnRzIGZpbHRlciB0ZXh0IGludG8gcmVndWxhciBleHByZXNzaW9uIHN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgYXMgaW4gRmlsdGVyKClcbiAqIEByZXR1cm4ge3N0cmluZ30gcmVndWxhciBleHByZXNzaW9uIHJlcHJlc2VudGF0aW9uIG9mIGZpbHRlciB0ZXh0XG4gKiBAcGFja2FnZVxuICovXG5leHBvcnRzLmZpbHRlclRvUmVnRXhwID0gZnVuY3Rpb24gZmlsdGVyVG9SZWdFeHAodGV4dCkge1xuICAvLyByZW1vdmUgbXVsdGlwbGUgd2lsZGNhcmRzXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcKisvZywgXCIqXCIpO1xuXG4gIC8vIHJlbW92ZSBsZWFkaW5nIHdpbGRjYXJkXG4gIGlmICh0ZXh0WzBdID09IFwiKlwiKVxuICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygxKTtcblxuICAvLyByZW1vdmUgdHJhaWxpbmcgd2lsZGNhcmRcbiAgaWYgKHRleHRbdGV4dC5sZW5ndGggLSAxXSA9PSBcIipcIilcbiAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sZW5ndGggLSAxKTtcblxuICByZXR1cm4gdGV4dFxuICAgIC8vIHJlbW92ZSBhbmNob3JzIGZvbGxvd2luZyBzZXBhcmF0b3IgcGxhY2Vob2xkZXJcbiAgICAucmVwbGFjZSgvXFxeXFx8JC8sIFwiXlwiKVxuICAgIC8vIGVzY2FwZSBzcGVjaWFsIHN5bWJvbHNcbiAgICAucmVwbGFjZSgvXFxXL2csIFwiXFxcXCQmXCIpXG4gICAgLy8gcmVwbGFjZSB3aWxkY2FyZHMgYnkgLipcbiAgICAucmVwbGFjZSgvXFxcXFxcKi9nLCBcIi4qXCIpXG4gICAgLy8gcHJvY2VzcyBzZXBhcmF0b3IgcGxhY2Vob2xkZXJzIChhbGwgQU5TSSBjaGFyYWN0ZXJzIGJ1dCBhbHBoYW51bWVyaWNcbiAgICAvLyBjaGFyYWN0ZXJzIGFuZCBfJS4tKVxuICAgIC5yZXBsYWNlKC9cXFxcXFxeL2csIGAoPzoke3NlcGFyYXRvclJlZ0V4cC5zb3VyY2V9fCQpYClcbiAgICAvLyBwcm9jZXNzIGV4dGVuZGVkIGFuY2hvciBhdCBleHByZXNzaW9uIHN0YXJ0XG4gICAgLnJlcGxhY2UoL15cXFxcXFx8XFxcXFxcfC8sIFwiXltcXFxcd1xcXFwtXSs6XFxcXC8rKD86W15cXFxcL10rXFxcXC4pP1wiKVxuICAgIC8vIHByb2Nlc3MgYW5jaG9yIGF0IGV4cHJlc3Npb24gc3RhcnRcbiAgICAucmVwbGFjZSgvXlxcXFxcXHwvLCBcIl5cIilcbiAgICAvLyBwcm9jZXNzIGFuY2hvciBhdCBleHByZXNzaW9uIGVuZFxuICAgIC5yZXBsYWNlKC9cXFxcXFx8JC8sIFwiJFwiKTtcbn07XG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gbWF0Y2ggdGhlIGB8fGAgcHJlZml4IGluIGFuIG90aGVyd2lzZSBsaXRlcmFsXG4gKiBwYXR0ZXJuLlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xubGV0IGV4dGVuZGVkQW5jaG9yUmVnRXhwID0gbmV3IFJlZ0V4cChmaWx0ZXJUb1JlZ0V4cChcInx8XCIpICsgXCIkXCIpO1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgbWF0Y2hpbmcgYSBrZXl3b3JkIGluIGEgZmlsdGVyLlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xubGV0IGtleXdvcmRSZWdFeHAgPSAvW15hLXowLTklKl1bYS16MC05JV17Mix9KD89W15hLXowLTklKl0pLztcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gZm9yIG1hdGNoaW5nIGFsbCBrZXl3b3JkcyBpbiBhIGZpbHRlci5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmxldCBhbGxLZXl3b3Jkc1JlZ0V4cCA9IG5ldyBSZWdFeHAoa2V5d29yZFJlZ0V4cCwgXCJnXCIpO1xuXG4vKipcbiAqIEEgYENvbXBpbGVkUGF0dGVybnNgIG9iamVjdCByZXByZXNlbnRzIHRoZSBjb21waWxlZCB2ZXJzaW9uIG9mIG11bHRpcGxlIFVSTFxuICogcmVxdWVzdCBwYXR0ZXJucy4gSXQgaXMgcmV0dXJuZWQgYnlcbiAqIGB7QGxpbmsgbW9kdWxlOnBhdHRlcm5zLmNvbXBpbGVQYXR0ZXJucyBjb21waWxlUGF0dGVybnMoKX1gLlxuICovXG5jbGFzcyBDb21waWxlZFBhdHRlcm5zIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb2JqZWN0IHdpdGggdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbnMgZm9yIGNhc2Utc2Vuc2l0aXZlXG4gICAqIGFuZCBjYXNlLWluc2Vuc2l0aXZlIG1hdGNoaW5nIHJlc3BlY3RpdmVseS5cbiAgICogQHBhcmFtIHs/UmVnRXhwfSBbY2FzZVNlbnNpdGl2ZV1cbiAgICogQHBhcmFtIHs/UmVnRXhwfSBbY2FzZUluc2Vuc2l0aXZlXVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoY2FzZVNlbnNpdGl2ZSwgY2FzZUluc2Vuc2l0aXZlKSB7XG4gICAgdGhpcy5fY2FzZVNlbnNpdGl2ZSA9IGNhc2VTZW5zaXRpdmU7XG4gICAgdGhpcy5fY2FzZUluc2Vuc2l0aXZlID0gY2FzZUluc2Vuc2l0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIHdoZXRoZXIgdGhlIGdpdmVuIFVSTCByZXF1ZXN0IG1hdGNoZXMgdGhlIHBhdHRlcm5zIHVzZWQgdG8gY3JlYXRlXG4gICAqIHRoaXMgb2JqZWN0LlxuICAgKiBAcGFyYW0ge21vZHVsZTp1cmwuVVJMUmVxdWVzdH0gcmVxdWVzdFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIHRlc3QocmVxdWVzdCkge1xuICAgIHJldHVybiAoKHRoaXMuX2Nhc2VTZW5zaXRpdmUgJiZcbiAgICAgICAgICAgICB0aGlzLl9jYXNlU2Vuc2l0aXZlLnRlc3QocmVxdWVzdC5ocmVmKSkgfHxcbiAgICAgICAgICAgICh0aGlzLl9jYXNlSW5zZW5zaXRpdmUgJiZcbiAgICAgICAgICAgICB0aGlzLl9jYXNlSW5zZW5zaXRpdmUudGVzdChyZXF1ZXN0Lmxvd2VyQ2FzZUhyZWYpKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21waWxlcyBwYXR0ZXJucyBmcm9tIHRoZSBnaXZlbiBmaWx0ZXJzIGludG8gYSBzaW5nbGVcbiAqIGB7QGxpbmsgbW9kdWxlOnBhdHRlcm5zfkNvbXBpbGVkUGF0dGVybnMgQ29tcGlsZWRQYXR0ZXJuc31gIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge21vZHVsZTpmaWx0ZXJDbGFzc2VzLlVSTEZpbHRlcnxcbiAqICAgICAgICAgU2V0Ljxtb2R1bGU6ZmlsdGVyQ2xhc3Nlcy5VUkxGaWx0ZXI+fSBmaWx0ZXJzXG4gKiAgIFRoZSBmaWx0ZXJzLiBJZiB0aGUgbnVtYmVyIG9mIGZpbHRlcnMgZXhjZWVkc1xuICogICBge0BsaW5rIG1vZHVsZTpwYXR0ZXJuc35DT01QSUxFX1BBVFRFUk5TX01BWCBDT01QSUxFX1BBVFRFUk5TX01BWH1gLCB0aGVcbiAqICAgZnVuY3Rpb24gcmV0dXJucyBgbnVsbGAuXG4gKlxuICogQHJldHVybnMgez9tb2R1bGU6cGF0dGVybnN+Q29tcGlsZWRQYXR0ZXJuc31cbiAqXG4gKiBAcGFja2FnZVxuICovXG5leHBvcnRzLmNvbXBpbGVQYXR0ZXJucyA9IGZ1bmN0aW9uIGNvbXBpbGVQYXR0ZXJucyhmaWx0ZXJzKSB7XG4gIGxldCBsaXN0ID0gQXJyYXkuaXNBcnJheShmaWx0ZXJzKSA/IGZpbHRlcnMgOiBbZmlsdGVyc107XG5cbiAgLy8gSWYgdGhlIG51bWJlciBvZiBmaWx0ZXJzIGlzIHRvbyBsYXJnZSwgaXQgbWF5IGNob2tlIGVzcGVjaWFsbHkgb24gbG93LWVuZFxuICAvLyBwbGF0Zm9ybXMuIEFzIGEgcHJlY2F1dGlvbiwgd2UgcmVmdXNlIHRvIGNvbXBpbGUuIElkZWFsbHkgd2Ugd291bGQgY2hlY2tcbiAgLy8gdGhlIGxlbmd0aCBvZiB0aGUgcmVndWxhciBleHByZXNzaW9uIHNvdXJjZSByYXRoZXIgdGhhbiB0aGUgbnVtYmVyIG9mXG4gIC8vIGZpbHRlcnMsIGJ1dCB0aGlzIGlzIGZhciBtb3JlIHN0cmFpZ2h0Zm9yd2FyZCBhbmQgcHJhY3RpY2FsLlxuICBpZiAobGlzdC5sZW5ndGggPiBDT01QSUxFX1BBVFRFUk5TX01BWClcbiAgICByZXR1cm4gbnVsbDtcblxuICBsZXQgY2FzZVNlbnNpdGl2ZSA9IFwiXCI7XG4gIGxldCBjYXNlSW5zZW5zaXRpdmUgPSBcIlwiO1xuXG4gIGZvciAobGV0IGZpbHRlciBvZiBmaWx0ZXJzKSB7XG4gICAgbGV0IHNvdXJjZSA9IGZpbHRlci51cmxQYXR0ZXJuLnJlZ2V4cFNvdXJjZTtcblxuICAgIGlmIChmaWx0ZXIubWF0Y2hDYXNlKVxuICAgICAgY2FzZVNlbnNpdGl2ZSArPSBzb3VyY2UgKyBcInxcIjtcbiAgICBlbHNlXG4gICAgICBjYXNlSW5zZW5zaXRpdmUgKz0gc291cmNlICsgXCJ8XCI7XG4gIH1cblxuICBsZXQgY2FzZVNlbnNpdGl2ZVJlZ0V4cCA9IG51bGw7XG4gIGxldCBjYXNlSW5zZW5zaXRpdmVSZWdFeHAgPSBudWxsO1xuXG4gIHRyeSB7XG4gICAgaWYgKGNhc2VTZW5zaXRpdmUpXG4gICAgICBjYXNlU2Vuc2l0aXZlUmVnRXhwID0gbmV3IFJlZ0V4cChjYXNlU2Vuc2l0aXZlLnNsaWNlKDAsIC0xKSk7XG5cbiAgICBpZiAoY2FzZUluc2Vuc2l0aXZlKVxuICAgICAgY2FzZUluc2Vuc2l0aXZlUmVnRXhwID0gbmV3IFJlZ0V4cChjYXNlSW5zZW5zaXRpdmUuc2xpY2UoMCwgLTEpKTtcbiAgfVxuICBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJdCBpcyBwb3NzaWJsZSBpbiB0aGVvcnkgZm9yIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdG8gYmUgdG9vIGxhcmdlXG4gICAgLy8gZGVzcGl0ZSBDT01QSUxFX1BBVFRFUk5TX01BWFxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBDb21waWxlZFBhdHRlcm5zKGNhc2VTZW5zaXRpdmVSZWdFeHAsIGNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCk7XG59O1xuXG4vKipcbiAqIFBhdHRlcm5zIGZvciBtYXRjaGluZyBhZ2FpbnN0IFVSTHMuXG4gKlxuICogSW50ZXJuYWxseSwgdGhpcyBtYXkgYmUgYSBSZWdFeHAgb3IgbWF0Y2ggZGlyZWN0bHkgYWdhaW5zdCB0aGVcbiAqIHBhdHRlcm4gZm9yIHNpbXBsZSBsaXRlcmFsIHBhdHRlcm5zLlxuICovXG5leHBvcnRzLlBhdHRlcm4gPSBjbGFzcyBQYXR0ZXJuIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuIHBhdHRlcm4gdGhhdCByZXF1ZXN0cyBVUkxzIHNob3VsZCBiZVxuICAgKiBtYXRjaGVkIGFnYWluc3QgaW4gZmlsdGVyIHRleHQgbm90YXRpb25cbiAgICogQHBhcmFtIHtib29sfSBtYXRjaENhc2UgYHRydWVgIGlmIGNvbXBhcmlzb25zIG11c3QgYmUgY2FzZVxuICAgKiBzZW5zaXRpdmVcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhdHRlcm4sIG1hdGNoQ2FzZSkge1xuICAgIHRoaXMubWF0Y2hDYXNlID0gbWF0Y2hDYXNlIHx8IGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLm1hdGNoQ2FzZSlcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBpZiAocGF0dGVybi5sZW5ndGggPj0gMiAmJlxuICAgICAgICBwYXR0ZXJuWzBdID09IFwiL1wiICYmXG4gICAgICAgIHBhdHRlcm5bcGF0dGVybi5sZW5ndGggLSAxXSA9PSBcIi9cIikge1xuICAgICAgLy8gVGhlIGZpbHRlciBpcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiAtIGNvbnZlcnQgaXQgaW1tZWRpYXRlbHkgdG9cbiAgICAgIC8vIGNhdGNoIHN5bnRheCBlcnJvcnNcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cmluZygxLCBwYXR0ZXJuLmxlbmd0aCAtIDEpO1xuICAgICAgdGhpcy5fcmVnZXhwID0gbmV3IFJlZ0V4cChwYXR0ZXJuKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBQYXR0ZXJucyBsaWtlIC9mb28vYmFyLyogZXhpc3Qgc28gdGhhdCB0aGV5IGFyZSBub3QgdHJlYXRlZCBhcyByZWd1bGFyXG4gICAgICAvLyBleHByZXNzaW9ucy4gV2UgZHJvcCBhbnkgc3VwZXJmbHVvdXMgd2lsZGNhcmRzIGhlcmUgc28gb3VyXG4gICAgICAvLyBvcHRpbWl6YXRpb25zIGNhbiBraWNrIGluLlxuICAgICAgcGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZSgvXlxcKisvLCBcIlwiKS5yZXBsYWNlKC9cXCorJC8sIFwiXCIpO1xuXG4gICAgICAvLyBObyBuZWVkIHRvIGNvbnZlcnQgdGhpcyBmaWx0ZXIgdG8gcmVndWxhciBleHByZXNzaW9uIHlldCwgZG8gaXQgb25cbiAgICAgIC8vIGRlbWFuZFxuICAgICAgdGhpcy5wYXR0ZXJuID0gcGF0dGVybjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHBhdHRlcm4gaXMgYSBzdHJpbmcgb2YgbGl0ZXJhbCBjaGFyYWN0ZXJzIHdpdGhcbiAgICogbm8gd2lsZGNhcmRzIG9yIGFueSBvdGhlciBzcGVjaWFsIGNoYXJhY3RlcnMuXG4gICAqXG4gICAqIElmIHRoZSBwYXR0ZXJuIGlzIHByZWZpeGVkIHdpdGggYSBgfHxgIG9yIHN1ZmZpeGVkIHdpdGggYSBgXmAgYnV0IG90aGVyd2lzZVxuICAgKiBjb250YWlucyBubyBzcGVjaWFsIGNoYXJhY3RlcnMsIGl0IGlzIHN0aWxsIGNvbnNpZGVyZWQgdG8gYmUgYSBsaXRlcmFsXG4gICAqIHBhdHRlcm4uXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNMaXRlcmFsUGF0dGVybigpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaXMucGF0dGVybiAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgIS9bKl58XS8udGVzdCh0aGlzLnBhdHRlcm4ucmVwbGFjZSgvXlxcfHsxLDJ9LywgXCJcIikucmVwbGFjZSgvW3xeXSQvLCBcIlwiKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVndWxhciBleHByZXNzaW9uIHRvIGJlIHVzZWQgd2hlbiB0ZXN0aW5nIGFnYWluc3QgdGhpcyBwYXR0ZXJuLlxuICAgKlxuICAgKiBudWxsIGlmIHRoZSBwYXR0ZXJuIGlzIG1hdGNoZWQgd2l0aG91dCB1c2luZyByZWd1bGFyIGV4cHJlc3Npb25zLlxuICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgKi9cbiAgZ2V0IHJlZ2V4cCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3JlZ2V4cCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLl9yZWdleHAgPSB0aGlzLmlzTGl0ZXJhbFBhdHRlcm4oKSA/XG4gICAgICAgIG51bGwgOiBuZXcgUmVnRXhwKGZpbHRlclRvUmVnRXhwKHRoaXMucGF0dGVybikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmVnZXhwO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdHRlcm4gaW4gcmVndWxhciBleHByZXNzaW9uIG5vdGF0aW9uLiBUaGlzIHdpbGwgaGF2ZSBhIHZhbHVlXG4gICAqIGV2ZW4gaWYgYHJlZ2V4cGAgcmV0dXJucyBudWxsLlxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0IHJlZ2V4cFNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVnZXhwID8gdGhpcy5fcmVnZXhwLnNvdXJjZSA6IGZpbHRlclRvUmVnRXhwKHRoaXMucGF0dGVybik7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIFVSTCByZXF1ZXN0IG1hdGNoZXMgdGhpcyBmaWx0ZXIncyBwYXR0ZXJuLlxuICAgKiBAcGFyYW0ge21vZHVsZTp1cmwuVVJMUmVxdWVzdH0gcmVxdWVzdCBUaGUgVVJMIHJlcXVlc3QgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlIFVSTCByZXF1ZXN0IG1hdGNoZXMuXG4gICAqL1xuICBtYXRjaGVzTG9jYXRpb24ocmVxdWVzdCkge1xuICAgIGxldCBsb2NhdGlvbiA9IHRoaXMubWF0Y2hDYXNlID8gcmVxdWVzdC5ocmVmIDogcmVxdWVzdC5sb3dlckNhc2VIcmVmO1xuICAgIGxldCByZWdleHAgPSB0aGlzLnJlZ2V4cDtcbiAgICBpZiAocmVnZXhwKVxuICAgICAgcmV0dXJuIHJlZ2V4cC50ZXN0KGxvY2F0aW9uKTtcblxuICAgIGxldCBwYXR0ZXJuID0gdGhpcy5wYXR0ZXJuO1xuICAgIGxldCBzdGFydHNXaXRoQW5jaG9yID0gcGF0dGVyblswXSA9PSBcInxcIjtcbiAgICBsZXQgc3RhcnRzV2l0aEV4dGVuZGVkQW5jaG9yID0gc3RhcnRzV2l0aEFuY2hvciAmJiBwYXR0ZXJuWzFdID09IFwifFwiO1xuICAgIGxldCBlbmRzV2l0aFNlcGFyYXRvciA9IHBhdHRlcm5bcGF0dGVybi5sZW5ndGggLSAxXSA9PSBcIl5cIjtcbiAgICBsZXQgZW5kc1dpdGhBbmNob3IgPSAhZW5kc1dpdGhTZXBhcmF0b3IgJiZcbiAgICAgICAgcGF0dGVybltwYXR0ZXJuLmxlbmd0aCAtIDFdID09IFwifFwiO1xuXG4gICAgaWYgKHN0YXJ0c1dpdGhFeHRlbmRlZEFuY2hvcilcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnN1YnN0cigyKTtcbiAgICBlbHNlIGlmIChzdGFydHNXaXRoQW5jaG9yKVxuICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyKDEpO1xuXG4gICAgaWYgKGVuZHNXaXRoU2VwYXJhdG9yIHx8IGVuZHNXaXRoQW5jaG9yKVxuICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc2xpY2UoMCwgLTEpO1xuXG4gICAgbGV0IGluZGV4ID0gbG9jYXRpb24uaW5kZXhPZihwYXR0ZXJuKTtcblxuICAgIHdoaWxlIChpbmRleCAhPSAtMSkge1xuICAgICAgLy8gVGhlIFwifHxcIiBwcmVmaXggcmVxdWlyZXMgdGhhdCB0aGUgdGV4dCB0aGF0IGZvbGxvd3MgZG9lcyBub3Qgc3RhcnRcbiAgICAgIC8vIHdpdGggYSBmb3J3YXJkIHNsYXNoLlxuICAgICAgaWYgKChzdGFydHNXaXRoRXh0ZW5kZWRBbmNob3IgP1xuICAgICAgICAgICBsb2NhdGlvbltpbmRleF0gIT0gXCIvXCIgJiZcbiAgICAgICAgICAgZXh0ZW5kZWRBbmNob3JSZWdFeHAudGVzdChsb2NhdGlvbi5zdWJzdHJpbmcoMCwgaW5kZXgpKSA6XG4gICAgICAgICAgIHN0YXJ0c1dpdGhBbmNob3IgP1xuICAgICAgICAgICBpbmRleCA9PSAwIDpcbiAgICAgICAgICAgdHJ1ZSkgJiZcbiAgICAgICAgICAoZW5kc1dpdGhTZXBhcmF0b3IgP1xuICAgICAgICAgICAhbG9jYXRpb25baW5kZXggKyBwYXR0ZXJuLmxlbmd0aF0gfHxcbiAgICAgICAgICAgc2VwYXJhdG9yUmVnRXhwLnRlc3QobG9jYXRpb25baW5kZXggKyBwYXR0ZXJuLmxlbmd0aF0pIDpcbiAgICAgICAgICAgZW5kc1dpdGhBbmNob3IgP1xuICAgICAgICAgICBpbmRleCA9PSBsb2NhdGlvbi5sZW5ndGggLSBwYXR0ZXJuLmxlbmd0aCA6XG4gICAgICAgICAgIHRydWUpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgaWYgKHBhdHRlcm4gPT0gXCJcIilcbiAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgIGluZGV4ID0gbG9jYXRpb24uaW5kZXhPZihwYXR0ZXJuLCBpbmRleCArIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgcGF0dGVybiBoYXMga2V5d29yZHNcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBoYXNLZXl3b3JkcygpIHtcbiAgICByZXR1cm4gdGhpcy5wYXR0ZXJuICYmIGtleXdvcmRSZWdFeHAudGVzdCh0aGlzLnBhdHRlcm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIGFsbCBrZXl3b3JkcyB0aGF0IGNvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHBhdHRlcm5cbiAgICogQHJldHVybnMge3N0cmluZ1tdfVxuICAgKi9cbiAga2V5d29yZENhbmRpZGF0ZXMoKSB7XG4gICAgaWYgKCF0aGlzLnBhdHRlcm4pXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gdGhpcy5wYXR0ZXJuLnRvTG93ZXJDYXNlKCkubWF0Y2goYWxsS2V5d29yZHNSZWdFeHApO1xuICB9XG59O1xuIiwiLyogd2ViZXh0ZW5zaW9uLXBvbHlmaWxsIC0gdjAuOC4wIC0gVHVlIEFwciAyMCAyMDIxIDExOjI3OjM4ICovXG4vKiAtKi0gTW9kZTogaW5kZW50LXRhYnMtbW9kZTogbmlsOyBqcy1pbmRlbnQtbGV2ZWw6IDIgLSotICovXG4vKiB2aW06IHNldCBzdHM9MiBzdz0yIGV0IHR3PTgwOiAqL1xuLyogVGhpcyBTb3VyY2UgQ29kZSBGb3JtIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zIG9mIHRoZSBNb3ppbGxhIFB1YmxpY1xuICogTGljZW5zZSwgdi4gMi4wLiBJZiBhIGNvcHkgb2YgdGhlIE1QTCB3YXMgbm90IGRpc3RyaWJ1dGVkIHdpdGggdGhpc1xuICogZmlsZSwgWW91IGNhbiBvYnRhaW4gb25lIGF0IGh0dHA6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5pZiAodHlwZW9mIGJyb3dzZXIgPT09IFwidW5kZWZpbmVkXCIgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKGJyb3dzZXIpICE9PSBPYmplY3QucHJvdG90eXBlKSB7XG4gIGNvbnN0IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSA9IFwiVGhlIG1lc3NhZ2UgcG9ydCBjbG9zZWQgYmVmb3JlIGEgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkLlwiO1xuICBjb25zdCBTRU5EX1JFU1BPTlNFX0RFUFJFQ0FUSU9OX1dBUk5JTkcgPSBcIlJldHVybmluZyBhIFByb21pc2UgaXMgdGhlIHByZWZlcnJlZCB3YXkgdG8gc2VuZCBhIHJlcGx5IGZyb20gYW4gb25NZXNzYWdlL29uTWVzc2FnZUV4dGVybmFsIGxpc3RlbmVyLCBhcyB0aGUgc2VuZFJlc3BvbnNlIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBzcGVjcyAoU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvTW96aWxsYS9BZGQtb25zL1dlYkV4dGVuc2lvbnMvQVBJL3J1bnRpbWUvb25NZXNzYWdlKVwiO1xuXG4gIC8vIFdyYXBwaW5nIHRoZSBidWxrIG9mIHRoaXMgcG9seWZpbGwgaW4gYSBvbmUtdGltZS11c2UgZnVuY3Rpb24gaXMgYSBtaW5vclxuICAvLyBvcHRpbWl6YXRpb24gZm9yIEZpcmVmb3guIFNpbmNlIFNwaWRlcm1vbmtleSBkb2VzIG5vdCBmdWxseSBwYXJzZSB0aGVcbiAgLy8gY29udGVudHMgb2YgYSBmdW5jdGlvbiB1bnRpbCB0aGUgZmlyc3QgdGltZSBpdCdzIGNhbGxlZCwgYW5kIHNpbmNlIGl0IHdpbGxcbiAgLy8gbmV2ZXIgYWN0dWFsbHkgbmVlZCB0byBiZSBjYWxsZWQsIHRoaXMgYWxsb3dzIHRoZSBwb2x5ZmlsbCB0byBiZSBpbmNsdWRlZFxuICAvLyBpbiBGaXJlZm94IG5lYXJseSBmb3IgZnJlZS5cbiAgY29uc3Qgd3JhcEFQSXMgPSBleHRlbnNpb25BUElzID0+IHtcbiAgICAvLyBOT1RFOiBhcGlNZXRhZGF0YSBpcyBhc3NvY2lhdGVkIHRvIHRoZSBjb250ZW50IG9mIHRoZSBhcGktbWV0YWRhdGEuanNvbiBmaWxlXG4gICAgLy8gYXQgYnVpbGQgdGltZSBieSByZXBsYWNpbmcgdGhlIGZvbGxvd2luZyBcImluY2x1ZGVcIiB3aXRoIHRoZSBjb250ZW50IG9mIHRoZVxuICAgIC8vIEpTT04gZmlsZS5cbiAgICBjb25zdCBhcGlNZXRhZGF0YSA9IHtcbiAgICAgIFwiYWxhcm1zXCI6IHtcbiAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJjbGVhckFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJib29rbWFya3NcIjoge1xuICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0Q2hpbGRyZW5cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0UmVjZW50XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFN1YlRyZWVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VHJlZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVUcmVlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJyb3dzZXJBY3Rpb25cIjoge1xuICAgICAgICBcImRpc2FibGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcImVuYWJsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3JcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QmFkZ2VUZXh0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFBvcHVwXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFRpdGxlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm9wZW5Qb3B1cFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRCYWRnZUJhY2tncm91bmRDb2xvclwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0QmFkZ2VUZXh0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRJY29uXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNldFBvcHVwXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRUaXRsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJyb3dzaW5nRGF0YVwiOiB7XG4gICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUNhY2hlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUNvb2tpZXNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlRG93bmxvYWRzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUZvcm1EYXRhXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUhpc3RvcnlcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlTG9jYWxTdG9yYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVBhc3N3b3Jkc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVQbHVnaW5EYXRhXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJjb21tYW5kc1wiOiB7XG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJjb250ZXh0TWVudXNcIjoge1xuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJjb29raWVzXCI6IHtcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbENvb2tpZVN0b3Jlc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJkZXZ0b29sc1wiOiB7XG4gICAgICAgIFwiaW5zcGVjdGVkV2luZG93XCI6IHtcbiAgICAgICAgICBcImV2YWxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMixcbiAgICAgICAgICAgIFwic2luZ2xlQ2FsbGJhY2tBcmdcIjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwicGFuZWxzXCI6IHtcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMyxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAzLFxuICAgICAgICAgICAgXCJzaW5nbGVDYWxsYmFja0FyZ1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImVsZW1lbnRzXCI6IHtcbiAgICAgICAgICAgIFwiY3JlYXRlU2lkZWJhclBhbmVcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImRvd25sb2Fkc1wiOiB7XG4gICAgICAgIFwiY2FuY2VsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImRvd25sb2FkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImVyYXNlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEZpbGVJY29uXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcIm9wZW5cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInBhdXNlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUZpbGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVzdW1lXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzaG93XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiZXh0ZW5zaW9uXCI6IHtcbiAgICAgICAgXCJpc0FsbG93ZWRGaWxlU2NoZW1lQWNjZXNzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImlzQWxsb3dlZEluY29nbml0b0FjY2Vzc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiaGlzdG9yeVwiOiB7XG4gICAgICAgIFwiYWRkVXJsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZUFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWxldGVSYW5nZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWxldGVVcmxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VmlzaXRzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiaTE4blwiOiB7XG4gICAgICAgIFwiZGV0ZWN0TGFuZ3VhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWNjZXB0TGFuZ3VhZ2VzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJpZGVudGl0eVwiOiB7XG4gICAgICAgIFwibGF1bmNoV2ViQXV0aEZsb3dcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImlkbGVcIjoge1xuICAgICAgICBcInF1ZXJ5U3RhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIm1hbmFnZW1lbnRcIjoge1xuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0U2VsZlwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRFbmFibGVkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInVuaW5zdGFsbFNlbGZcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIm5vdGlmaWNhdGlvbnNcIjoge1xuICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0UGVybWlzc2lvbkxldmVsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwicGFnZUFjdGlvblwiOiB7XG4gICAgICAgIFwiZ2V0UG9wdXBcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VGl0bGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiaGlkZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0SWNvblwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRQb3B1cFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0VGl0bGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInNob3dcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJwZXJtaXNzaW9uc1wiOiB7XG4gICAgICAgIFwiY29udGFpbnNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZXF1ZXN0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJydW50aW1lXCI6IHtcbiAgICAgICAgXCJnZXRCYWNrZ3JvdW5kUGFnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRQbGF0Zm9ybUluZm9cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwib3Blbk9wdGlvbnNQYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInJlcXVlc3RVcGRhdGVDaGVja1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZW5kTWVzc2FnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDNcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZW5kTmF0aXZlTWVzc2FnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRVbmluc3RhbGxVUkxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInNlc3Npb25zXCI6IHtcbiAgICAgICAgXCJnZXREZXZpY2VzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFJlY2VudGx5Q2xvc2VkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlc3RvcmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInN0b3JhZ2VcIjoge1xuICAgICAgICBcImxvY2FsXCI6IHtcbiAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIm1hbmFnZWRcIjoge1xuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInN5bmNcIjoge1xuICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInRhYnNcIjoge1xuICAgICAgICBcImNhcHR1cmVWaXNpYmxlVGFiXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZXRlY3RMYW5ndWFnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJkaXNjYXJkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImR1cGxpY2F0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJleGVjdXRlU2NyaXB0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRDdXJyZW50XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImdldFpvb21cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0Wm9vbVNldHRpbmdzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdvQmFja1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnb0ZvcndhcmRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiaGlnaGxpZ2h0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImluc2VydENTU1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbG9hZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlQ1NTXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInNlbmRNZXNzYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogM1xuICAgICAgICB9LFxuICAgICAgICBcInNldFpvb21cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0Wm9vbVNldHRpbmdzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwidG9wU2l0ZXNcIjoge1xuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwid2ViTmF2aWdhdGlvblwiOiB7XG4gICAgICAgIFwiZ2V0QWxsRnJhbWVzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEZyYW1lXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJ3ZWJSZXF1ZXN0XCI6IHtcbiAgICAgICAgXCJoYW5kbGVyQmVoYXZpb3JDaGFuZ2VkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJ3aW5kb3dzXCI6IHtcbiAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRDdXJyZW50XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldExhc3RGb2N1c2VkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKE9iamVjdC5rZXlzKGFwaU1ldGFkYXRhKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImFwaS1tZXRhZGF0YS5qc29uIGhhcyBub3QgYmVlbiBpbmNsdWRlZCBpbiBicm93c2VyLXBvbHlmaWxsXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgV2Vha01hcCBzdWJjbGFzcyB3aGljaCBjcmVhdGVzIGFuZCBzdG9yZXMgYSB2YWx1ZSBmb3IgYW55IGtleSB3aGljaCBkb2VzXG4gICAgICogbm90IGV4aXN0IHdoZW4gYWNjZXNzZWQsIGJ1dCBiZWhhdmVzIGV4YWN0bHkgYXMgYW4gb3JkaW5hcnkgV2Vha01hcFxuICAgICAqIG90aGVyd2lzZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNyZWF0ZUl0ZW1cbiAgICAgKiAgICAgICAgQSBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGNhbGxlZCBpbiBvcmRlciB0byBjcmVhdGUgdGhlIHZhbHVlIGZvciBhbnlcbiAgICAgKiAgICAgICAga2V5IHdoaWNoIGRvZXMgbm90IGV4aXN0LCB0aGUgZmlyc3QgdGltZSBpdCBpcyBhY2Nlc3NlZC4gVGhlXG4gICAgICogICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVzLCBhcyBpdHMgb25seSBhcmd1bWVudCwgdGhlIGtleSBiZWluZyBjcmVhdGVkLlxuICAgICAqL1xuICAgIGNsYXNzIERlZmF1bHRXZWFrTWFwIGV4dGVuZHMgV2Vha01hcCB7XG4gICAgICBjb25zdHJ1Y3RvcihjcmVhdGVJdGVtLCBpdGVtcyA9IHVuZGVmaW5lZCkge1xuICAgICAgICBzdXBlcihpdGVtcyk7XG4gICAgICAgIHRoaXMuY3JlYXRlSXRlbSA9IGNyZWF0ZUl0ZW07XG4gICAgICB9XG5cbiAgICAgIGdldChrZXkpIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgdGhpcy5zZXQoa2V5LCB0aGlzLmNyZWF0ZUl0ZW0oa2V5KSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3VwZXIuZ2V0KGtleSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gb2JqZWN0IHdpdGggYSBgdGhlbmAgbWV0aG9kLCBhbmQgY2FuXG4gICAgICogdGhlcmVmb3JlIGJlIGFzc3VtZWQgdG8gYmVoYXZlIGFzIGEgUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3QuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHRoZW5hYmxlLlxuICAgICAqL1xuICAgIGNvbnN0IGlzVGhlbmFibGUgPSB2YWx1ZSA9PiB7XG4gICAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSBcImZ1bmN0aW9uXCI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBmdW5jdGlvbiB3aGljaCwgd2hlbiBjYWxsZWQsIHdpbGwgcmVzb2x2ZSBvciByZWplY3RcbiAgICAgKiB0aGUgZ2l2ZW4gcHJvbWlzZSBiYXNlZCBvbiBob3cgaXQgaXMgY2FsbGVkOlxuICAgICAqXG4gICAgICogLSBJZiwgd2hlbiBjYWxsZWQsIGBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JgIGNvbnRhaW5zIGEgbm9uLW51bGwgb2JqZWN0LFxuICAgICAqICAgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQgd2l0aCB0aGF0IHZhbHVlLlxuICAgICAqIC0gSWYgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGV4YWN0bHkgb25lIGFyZ3VtZW50LCB0aGUgcHJvbWlzZSBpc1xuICAgICAqICAgcmVzb2x2ZWQgdG8gdGhhdCB2YWx1ZS5cbiAgICAgKiAtIE90aGVyd2lzZSwgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgdG8gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlXG4gICAgICogICBmdW5jdGlvbidzIGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9taXNlXG4gICAgICogICAgICAgIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIGFuZCByZWplY3Rpb24gZnVuY3Rpb25zIG9mIGFcbiAgICAgKiAgICAgICAgcHJvbWlzZS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9taXNlLnJlc29sdmVcbiAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZXNvbHV0aW9uIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb21pc2UucmVqZWN0XG4gICAgICogICAgICAgIFRoZSBwcm9taXNlJ3MgcmVqZWN0aW9uIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgd3JhcHBlZCBtZXRob2Qgd2hpY2ggaGFzIGNyZWF0ZWQgdGhlIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmdcbiAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAqICAgICAgICBjYWxsYmFjayBhcmd1bWVudHMgaXMgcmVzb2x2ZWQuIEJ5IGRlZmF1bHQsIGlmIHRoZSBjYWxsYmFja1xuICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgKiAgICAgICAgYW4gYXJyYXkgaWYgbXVsdGlwbGUgYXJlIGdpdmVuLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9ufVxuICAgICAqICAgICAgICBUaGUgZ2VuZXJhdGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0IG1ha2VDYWxsYmFjayA9IChwcm9taXNlLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuICguLi5jYWxsYmFja0FyZ3MpID0+IHtcbiAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICBwcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmcgfHxcbiAgICAgICAgICAgICAgICAgICAoY2FsbGJhY2tBcmdzLmxlbmd0aCA8PSAxICYmIG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnICE9PSBmYWxzZSkpIHtcbiAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgY29uc3QgcGx1cmFsaXplQXJndW1lbnRzID0gKG51bUFyZ3MpID0+IG51bUFyZ3MgPT0gMSA/IFwiYXJndW1lbnRcIiA6IFwiYXJndW1lbnRzXCI7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgd3JhcHBlciBmdW5jdGlvbiBmb3IgYSBtZXRob2Qgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgbWV0YWRhdGEuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAqICAgICAgICBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHdoaWNoIGlzIGJlaW5nIHdyYXBwZWQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG1ldGFkYXRhXG4gICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSBtZXRob2QgYmVpbmcgd3JhcHBlZC5cbiAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG1ldGFkYXRhLm1pbkFyZ3NcbiAgICAgKiAgICAgICAgVGhlIG1pbmltdW0gbnVtYmVyIG9mIGFyZ3VtZW50cyB3aGljaCBtdXN0IGJlIHBhc3NlZCB0byB0aGVcbiAgICAgKiAgICAgICAgZnVuY3Rpb24uIElmIGNhbGxlZCB3aXRoIGZld2VyIHRoYW4gdGhpcyBudW1iZXIgb2YgYXJndW1lbnRzLCB0aGVcbiAgICAgKiAgICAgICAgd3JhcHBlciB3aWxsIHJhaXNlIGFuIGV4Y2VwdGlvbi5cbiAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG1ldGFkYXRhLm1heEFyZ3NcbiAgICAgKiAgICAgICAgVGhlIG1heGltdW0gbnVtYmVyIG9mIGFyZ3VtZW50cyB3aGljaCBtYXkgYmUgcGFzc2VkIHRvIHRoZVxuICAgICAqICAgICAgICBmdW5jdGlvbi4gSWYgY2FsbGVkIHdpdGggbW9yZSB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICogICAgICAgIHdyYXBwZXIgd2lsbCByYWlzZSBhbiBleGNlcHRpb24uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZ1xuICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICogICAgICAgIGNhbGxiYWNrIGFyZ3VtZW50cyBpcyByZXNvbHZlZC4gQnkgZGVmYXVsdCwgaWYgdGhlIGNhbGxiYWNrXG4gICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAqICAgICAgICBhbiBhcnJheSBpZiBtdWx0aXBsZSBhcmUgZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb24ob2JqZWN0LCAuLi4qKX1cbiAgICAgKiAgICAgICBUaGUgZ2VuZXJhdGVkIHdyYXBwZXIgZnVuY3Rpb24uXG4gICAgICovXG4gICAgY29uc3Qgd3JhcEFzeW5jRnVuY3Rpb24gPSAobmFtZSwgbWV0YWRhdGEpID0+IHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBhc3luY0Z1bmN0aW9uV3JhcHBlcih0YXJnZXQsIC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5taW5BcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBtb3N0ICR7bWV0YWRhdGEubWF4QXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWF4QXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBpZiAobWV0YWRhdGEuZmFsbGJhY2tUb05vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIFRoaXMgQVBJIG1ldGhvZCBoYXMgY3VycmVudGx5IG5vIGNhbGxiYWNrIG9uIENocm9tZSwgYnV0IGl0IHJldHVybiBhIHByb21pc2Ugb24gRmlyZWZveCxcbiAgICAgICAgICAgIC8vIGFuZCBzbyB0aGUgcG9seWZpbGwgd2lsbCB0cnkgdG8gY2FsbCBpdCB3aXRoIGEgY2FsbGJhY2sgZmlyc3QsIGFuZCBpdCB3aWxsIGZhbGxiYWNrXG4gICAgICAgICAgICAvLyB0byBub3QgcGFzc2luZyB0aGUgY2FsbGJhY2sgaWYgdGhlIGZpcnN0IGNhbGwgZmFpbHMuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncywgbWFrZUNhbGxiYWNrKHtyZXNvbHZlLCByZWplY3R9LCBtZXRhZGF0YSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoY2JFcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7bmFtZX0gQVBJIG1ldGhvZCBkb2Vzbid0IHNlZW0gdG8gc3VwcG9ydCB0aGUgY2FsbGJhY2sgcGFyYW1ldGVyLCBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZmFsbGluZyBiYWNrIHRvIGNhbGwgaXQgd2l0aG91dCBhIGNhbGxiYWNrOiBcIiwgY2JFcnJvcik7XG5cbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MpO1xuXG4gICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgQVBJIG1ldGhvZCBtZXRhZGF0YSwgc28gdGhhdCB0aGUgbmV4dCBBUEkgY2FsbHMgd2lsbCBub3QgdHJ5IHRvXG4gICAgICAgICAgICAgIC8vIHVzZSB0aGUgdW5zdXBwb3J0ZWQgY2FsbGJhY2sgYW55bW9yZS5cbiAgICAgICAgICAgICAgbWV0YWRhdGEuZmFsbGJhY2tUb05vQ2FsbGJhY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgbWV0YWRhdGEubm9DYWxsYmFjayA9IHRydWU7XG5cbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEubm9DYWxsYmFjaykge1xuICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncywgbWFrZUNhbGxiYWNrKHtyZXNvbHZlLCByZWplY3R9LCBtZXRhZGF0YSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcyBhbiBleGlzdGluZyBtZXRob2Qgb2YgdGhlIHRhcmdldCBvYmplY3QsIHNvIHRoYXQgY2FsbHMgdG8gaXQgYXJlXG4gICAgICogaW50ZXJjZXB0ZWQgYnkgdGhlIGdpdmVuIHdyYXBwZXIgZnVuY3Rpb24uIFRoZSB3cmFwcGVyIGZ1bmN0aW9uIHJlY2VpdmVzLFxuICAgICAqIGFzIGl0cyBmaXJzdCBhcmd1bWVudCwgdGhlIG9yaWdpbmFsIGB0YXJnZXRgIG9iamVjdCwgZm9sbG93ZWQgYnkgZWFjaCBvZlxuICAgICAqIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBvcmlnaW5hbCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gICAgICogICAgICAgIFRoZSBvcmlnaW5hbCB0YXJnZXQgb2JqZWN0IHRoYXQgdGhlIHdyYXBwZWQgbWV0aG9kIGJlbG9uZ3MgdG8uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWV0aG9kXG4gICAgICogICAgICAgIFRoZSBtZXRob2QgYmVpbmcgd3JhcHBlZC4gVGhpcyBpcyB1c2VkIGFzIHRoZSB0YXJnZXQgb2YgdGhlIFByb3h5XG4gICAgICogICAgICAgIG9iamVjdCB3aGljaCBpcyBjcmVhdGVkIHRvIHdyYXAgdGhlIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB3cmFwcGVyXG4gICAgICogICAgICAgIFRoZSB3cmFwcGVyIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiBhIGRpcmVjdCBpbnZvY2F0aW9uXG4gICAgICogICAgICAgIG9mIHRoZSB3cmFwcGVkIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm94eTxmdW5jdGlvbj59XG4gICAgICogICAgICAgIEEgUHJveHkgb2JqZWN0IGZvciB0aGUgZ2l2ZW4gbWV0aG9kLCB3aGljaCBpbnZva2VzIHRoZSBnaXZlbiB3cmFwcGVyXG4gICAgICogICAgICAgIG1ldGhvZCBpbiBpdHMgcGxhY2UuXG4gICAgICovXG4gICAgY29uc3Qgd3JhcE1ldGhvZCA9ICh0YXJnZXQsIG1ldGhvZCwgd3JhcHBlcikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm94eShtZXRob2QsIHtcbiAgICAgICAgYXBwbHkodGFyZ2V0TWV0aG9kLCB0aGlzT2JqLCBhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIHdyYXBwZXIuY2FsbCh0aGlzT2JqLCB0YXJnZXQsIC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBoYXNPd25Qcm9wZXJ0eSA9IEZ1bmN0aW9uLmNhbGwuYmluZChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxuICAgIC8qKlxuICAgICAqIFdyYXBzIGFuIG9iamVjdCBpbiBhIFByb3h5IHdoaWNoIGludGVyY2VwdHMgYW5kIHdyYXBzIGNlcnRhaW4gbWV0aG9kc1xuICAgICAqIGJhc2VkIG9uIHRoZSBnaXZlbiBgd3JhcHBlcnNgIGFuZCBgbWV0YWRhdGFgIG9iamVjdHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gICAgICogICAgICAgIFRoZSB0YXJnZXQgb2JqZWN0IHRvIHdyYXAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3dyYXBwZXJzID0ge31dXG4gICAgICogICAgICAgIEFuIG9iamVjdCB0cmVlIGNvbnRhaW5pbmcgd3JhcHBlciBmdW5jdGlvbnMgZm9yIHNwZWNpYWwgY2FzZXMuIEFueVxuICAgICAqICAgICAgICBmdW5jdGlvbiBwcmVzZW50IGluIHRoaXMgb2JqZWN0IHRyZWUgaXMgY2FsbGVkIGluIHBsYWNlIG9mIHRoZVxuICAgICAqICAgICAgICBtZXRob2QgaW4gdGhlIHNhbWUgbG9jYXRpb24gaW4gdGhlIGB0YXJnZXRgIG9iamVjdCB0cmVlLiBUaGVzZVxuICAgICAqICAgICAgICB3cmFwcGVyIG1ldGhvZHMgYXJlIGludm9rZWQgYXMgZGVzY3JpYmVkIGluIHtAc2VlIHdyYXBNZXRob2R9LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFttZXRhZGF0YSA9IHt9XVxuICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIG1ldGFkYXRhIHVzZWQgdG8gYXV0b21hdGljYWxseSBnZW5lcmF0ZVxuICAgICAqICAgICAgICBQcm9taXNlLWJhc2VkIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhc3luY2hyb25vdXMuIEFueSBmdW5jdGlvbiBpblxuICAgICAqICAgICAgICB0aGUgYHRhcmdldGAgb2JqZWN0IHRyZWUgd2hpY2ggaGFzIGEgY29ycmVzcG9uZGluZyBtZXRhZGF0YSBvYmplY3RcbiAgICAgKiAgICAgICAgaW4gdGhlIHNhbWUgbG9jYXRpb24gaW4gdGhlIGBtZXRhZGF0YWAgdHJlZSBpcyByZXBsYWNlZCB3aXRoIGFuXG4gICAgICogICAgICAgIGF1dG9tYXRpY2FsbHktZ2VuZXJhdGVkIHdyYXBwZXIgZnVuY3Rpb24sIGFzIGRlc2NyaWJlZCBpblxuICAgICAqICAgICAgICB7QHNlZSB3cmFwQXN5bmNGdW5jdGlvbn1cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm94eTxvYmplY3Q+fVxuICAgICAqL1xuICAgIGNvbnN0IHdyYXBPYmplY3QgPSAodGFyZ2V0LCB3cmFwcGVycyA9IHt9LCBtZXRhZGF0YSA9IHt9KSA9PiB7XG4gICAgICBsZXQgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgbGV0IGhhbmRsZXJzID0ge1xuICAgICAgICBoYXMocHJveHlUYXJnZXQsIHByb3ApIHtcbiAgICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQgfHwgcHJvcCBpbiBjYWNoZTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQocHJveHlUYXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKHByb3AgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZVtwcm9wXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIShwcm9wIGluIHRhcmdldCkpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHZhbHVlID0gdGFyZ2V0W3Byb3BdO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIG9uIHRoZSB1bmRlcmx5aW5nIG9iamVjdC4gQ2hlY2sgaWYgd2UgbmVlZCB0byBkb1xuICAgICAgICAgICAgLy8gYW55IHdyYXBwaW5nLlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHdyYXBwZXJzW3Byb3BdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHNwZWNpYWwtY2FzZSB3cmFwcGVyIGZvciB0aGlzIG1ldGhvZC5cbiAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyc1twcm9wXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBwcm9wKSkge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIGFzeW5jIG1ldGhvZCB0aGF0IHdlIGhhdmUgbWV0YWRhdGEgZm9yLiBDcmVhdGUgYVxuICAgICAgICAgICAgICAvLyBQcm9taXNlIHdyYXBwZXIgZm9yIGl0LlxuICAgICAgICAgICAgICBsZXQgd3JhcHBlciA9IHdyYXBBc3luY0Z1bmN0aW9uKHByb3AsIG1ldGFkYXRhW3Byb3BdKTtcbiAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBtZXRob2QgdGhhdCB3ZSBkb24ndCBrbm93IG9yIGNhcmUgYWJvdXQuIFJldHVybiB0aGVcbiAgICAgICAgICAgICAgLy8gb3JpZ2luYWwgbWV0aG9kLCBib3VuZCB0byB0aGUgdW5kZXJseWluZyBvYmplY3QuXG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuYmluZCh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAoaGFzT3duUHJvcGVydHkod3JhcHBlcnMsIHByb3ApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIHByb3ApKSkge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBvYmplY3QgdGhhdCB3ZSBuZWVkIHRvIGRvIHNvbWUgd3JhcHBpbmcgZm9yIHRoZSBjaGlsZHJlblxuICAgICAgICAgICAgLy8gb2YuIENyZWF0ZSBhIHN1Yi1vYmplY3Qgd3JhcHBlciBmb3IgaXQgd2l0aCB0aGUgYXBwcm9wcmlhdGUgY2hpbGRcbiAgICAgICAgICAgIC8vIG1ldGFkYXRhLlxuICAgICAgICAgICAgdmFsdWUgPSB3cmFwT2JqZWN0KHZhbHVlLCB3cmFwcGVyc1twcm9wXSwgbWV0YWRhdGFbcHJvcF0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIFwiKlwiKSkge1xuICAgICAgICAgICAgLy8gV3JhcCBhbGwgcHJvcGVydGllcyBpbiAqIG5hbWVzcGFjZS5cbiAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW1wiKlwiXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55IHdyYXBwaW5nIGZvciB0aGlzIHByb3BlcnR5LFxuICAgICAgICAgICAgLy8gc28ganVzdCBmb3J3YXJkIGFsbCBhY2Nlc3MgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNhY2hlLCBwcm9wLCB7XG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYWNoZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQocHJveHlUYXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgIGlmIChwcm9wIGluIGNhY2hlKSB7XG4gICAgICAgICAgICBjYWNoZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVmaW5lUHJvcGVydHkocHJveHlUYXJnZXQsIHByb3AsIGRlc2MpIHtcbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwgZGVzYyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVsZXRlUHJvcGVydHkocHJveHlUYXJnZXQsIHByb3ApIHtcbiAgICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShjYWNoZSwgcHJvcCk7XG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICAvLyBQZXIgY29udHJhY3Qgb2YgdGhlIFByb3h5IEFQSSwgdGhlIFwiZ2V0XCIgcHJveHkgaGFuZGxlciBtdXN0IHJldHVybiB0aGVcbiAgICAgIC8vIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSB0YXJnZXQgaWYgdGhhdCB2YWx1ZSBpcyBkZWNsYXJlZCByZWFkLW9ubHkgYW5kXG4gICAgICAvLyBub24tY29uZmlndXJhYmxlLiBGb3IgdGhpcyByZWFzb24sIHdlIGNyZWF0ZSBhbiBvYmplY3Qgd2l0aCB0aGVcbiAgICAgIC8vIHByb3RvdHlwZSBzZXQgdG8gYHRhcmdldGAgaW5zdGVhZCBvZiB1c2luZyBgdGFyZ2V0YCBkaXJlY3RseS5cbiAgICAgIC8vIE90aGVyd2lzZSB3ZSBjYW5ub3QgcmV0dXJuIGEgY3VzdG9tIG9iamVjdCBmb3IgQVBJcyB0aGF0XG4gICAgICAvLyBhcmUgZGVjbGFyZWQgcmVhZC1vbmx5IGFuZCBub24tY29uZmlndXJhYmxlLCBzdWNoIGFzIGBjaHJvbWUuZGV2dG9vbHNgLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBwcm94eSBoYW5kbGVycyB0aGVtc2VsdmVzIHdpbGwgc3RpbGwgdXNlIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YFxuICAgICAgLy8gaW5zdGVhZCBvZiB0aGUgYHByb3h5VGFyZ2V0YCwgc28gdGhhdCB0aGUgbWV0aG9kcyBhbmQgcHJvcGVydGllcyBhcmVcbiAgICAgIC8vIGRlcmVmZXJlbmNlZCB2aWEgdGhlIG9yaWdpbmFsIHRhcmdldHMuXG4gICAgICBsZXQgcHJveHlUYXJnZXQgPSBPYmplY3QuY3JlYXRlKHRhcmdldCk7XG4gICAgICByZXR1cm4gbmV3IFByb3h5KHByb3h5VGFyZ2V0LCBoYW5kbGVycyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzZXQgb2Ygd3JhcHBlciBmdW5jdGlvbnMgZm9yIGFuIGV2ZW50IG9iamVjdCwgd2hpY2ggaGFuZGxlc1xuICAgICAqIHdyYXBwaW5nIG9mIGxpc3RlbmVyIGZ1bmN0aW9ucyB0aGF0IHRob3NlIG1lc3NhZ2VzIGFyZSBwYXNzZWQuXG4gICAgICpcbiAgICAgKiBBIHNpbmdsZSB3cmFwcGVyIGlzIGNyZWF0ZWQgZm9yIGVhY2ggbGlzdGVuZXIgZnVuY3Rpb24sIGFuZCBzdG9yZWQgaW4gYVxuICAgICAqIG1hcC4gU3Vic2VxdWVudCBjYWxscyB0byBgYWRkTGlzdGVuZXJgLCBgaGFzTGlzdGVuZXJgLCBvciBgcmVtb3ZlTGlzdGVuZXJgXG4gICAgICogcmV0cmlldmUgdGhlIG9yaWdpbmFsIHdyYXBwZXIsIHNvIHRoYXQgIGF0dGVtcHRzIHRvIHJlbW92ZSBhXG4gICAgICogcHJldmlvdXNseS1hZGRlZCBsaXN0ZW5lciB3b3JrIGFzIGV4cGVjdGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtEZWZhdWx0V2Vha01hcDxmdW5jdGlvbiwgZnVuY3Rpb24+fSB3cmFwcGVyTWFwXG4gICAgICogICAgICAgIEEgRGVmYXVsdFdlYWtNYXAgb2JqZWN0IHdoaWNoIHdpbGwgY3JlYXRlIHRoZSBhcHByb3ByaWF0ZSB3cmFwcGVyXG4gICAgICogICAgICAgIGZvciBhIGdpdmVuIGxpc3RlbmVyIGZ1bmN0aW9uIHdoZW4gb25lIGRvZXMgbm90IGV4aXN0LCBhbmQgcmV0cmlldmVcbiAgICAgKiAgICAgICAgYW4gZXhpc3Rpbmcgb25lIHdoZW4gaXQgZG9lcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAgICovXG4gICAgY29uc3Qgd3JhcEV2ZW50ID0gd3JhcHBlck1hcCA9PiAoe1xuICAgICAgYWRkTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lciwgLi4uYXJncykge1xuICAgICAgICB0YXJnZXQuYWRkTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpLCAuLi5hcmdzKTtcbiAgICAgIH0sXG5cbiAgICAgIGhhc0xpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5oYXNMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lcikpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lcikge1xuICAgICAgICB0YXJnZXQucmVtb3ZlTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzID0gbmV3IERlZmF1bHRXZWFrTWFwKGxpc3RlbmVyID0+IHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogV3JhcHMgYW4gb25SZXF1ZXN0RmluaXNoZWQgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCB3aWxsIHJldHVybiBhXG4gICAgICAgKiBgZ2V0Q29udGVudCgpYCBwcm9wZXJ0eSB3aGljaCByZXR1cm5zIGEgYFByb21pc2VgIHJhdGhlciB0aGFuIHVzaW5nIGFcbiAgICAgICAqIGNhbGxiYWNrIEFQSS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVxXG4gICAgICAgKiAgICAgICAgVGhlIEhBUiBlbnRyeSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBuZXR3b3JrIHJlcXVlc3QuXG4gICAgICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBvblJlcXVlc3RGaW5pc2hlZChyZXEpIHtcbiAgICAgICAgY29uc3Qgd3JhcHBlZFJlcSA9IHdyYXBPYmplY3QocmVxLCB7fSAvKiB3cmFwcGVycyAqLywge1xuICAgICAgICAgIGdldENvbnRlbnQ6IHtcbiAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0ZW5lcih3cmFwcGVkUmVxKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBLZWVwIHRyYWNrIGlmIHRoZSBkZXByZWNhdGlvbiB3YXJuaW5nIGhhcyBiZWVuIGxvZ2dlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGxldCBsb2dnZWRTZW5kUmVzcG9uc2VEZXByZWNhdGlvbldhcm5pbmcgPSBmYWxzZTtcblxuICAgIGNvbnN0IG9uTWVzc2FnZVdyYXBwZXJzID0gbmV3IERlZmF1bHRXZWFrTWFwKGxpc3RlbmVyID0+IHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogV3JhcHMgYSBtZXNzYWdlIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgbWF5IHNlbmQgcmVzcG9uc2VzIGJhc2VkIG9uXG4gICAgICAgKiBpdHMgcmV0dXJuIHZhbHVlLCByYXRoZXIgdGhhbiBieSByZXR1cm5pbmcgYSBzZW50aW5lbCB2YWx1ZSBhbmQgY2FsbGluZyBhXG4gICAgICAgKiBjYWxsYmFjay4gSWYgdGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHJldHVybnMgYSBQcm9taXNlLCB0aGUgcmVzcG9uc2UgaXNcbiAgICAgICAqIHNlbnQgd2hlbiB0aGUgcHJvbWlzZSBlaXRoZXIgcmVzb2x2ZXMgb3IgcmVqZWN0cy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0geyp9IG1lc3NhZ2VcbiAgICAgICAqICAgICAgICBUaGUgbWVzc2FnZSBzZW50IGJ5IHRoZSBvdGhlciBlbmQgb2YgdGhlIGNoYW5uZWwuXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gc2VuZGVyXG4gICAgICAgKiAgICAgICAgRGV0YWlscyBhYm91dCB0aGUgc2VuZGVyIG9mIHRoZSBtZXNzYWdlLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbigqKX0gc2VuZFJlc3BvbnNlXG4gICAgICAgKiAgICAgICAgQSBjYWxsYmFjayB3aGljaCwgd2hlbiBjYWxsZWQgd2l0aCBhbiBhcmJpdHJhcnkgYXJndW1lbnQsIHNlbmRzXG4gICAgICAgKiAgICAgICAgdGhhdCB2YWx1ZSBhcyBhIHJlc3BvbnNlLlxuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgKiAgICAgICAgVHJ1ZSBpZiB0aGUgd3JhcHBlZCBsaXN0ZW5lciByZXR1cm5lZCBhIFByb21pc2UsIHdoaWNoIHdpbGwgbGF0ZXJcbiAgICAgICAqICAgICAgICB5aWVsZCBhIHJlc3BvbnNlLiBGYWxzZSBvdGhlcndpc2UuXG4gICAgICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBvbk1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgbGV0IGRpZENhbGxTZW5kUmVzcG9uc2UgPSBmYWxzZTtcblxuICAgICAgICBsZXQgd3JhcHBlZFNlbmRSZXNwb25zZTtcbiAgICAgICAgbGV0IHNlbmRSZXNwb25zZVByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICB3cmFwcGVkU2VuZFJlc3BvbnNlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmICghbG9nZ2VkU2VuZFJlc3BvbnNlRGVwcmVjYXRpb25XYXJuaW5nKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihTRU5EX1JFU1BPTlNFX0RFUFJFQ0FUSU9OX1dBUk5JTkcsIG5ldyBFcnJvcigpLnN0YWNrKTtcbiAgICAgICAgICAgICAgbG9nZ2VkU2VuZFJlc3BvbnNlRGVwcmVjYXRpb25XYXJuaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpZENhbGxTZW5kUmVzcG9uc2UgPSB0cnVlO1xuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSBsaXN0ZW5lcihtZXNzYWdlLCBzZW5kZXIsIHdyYXBwZWRTZW5kUmVzcG9uc2UpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICByZXN1bHQgPSBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNSZXN1bHRUaGVuYWJsZSA9IHJlc3VsdCAhPT0gdHJ1ZSAmJiBpc1RoZW5hYmxlKHJlc3VsdCk7XG5cbiAgICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIGRpZG4ndCByZXR1cm5lZCB0cnVlIG9yIGEgUHJvbWlzZSwgb3IgY2FsbGVkXG4gICAgICAgIC8vIHdyYXBwZWRTZW5kUmVzcG9uc2Ugc3luY2hyb25vdXNseSwgd2UgY2FuIGV4aXQgZWFybGllclxuICAgICAgICAvLyBiZWNhdXNlIHRoZXJlIHdpbGwgYmUgbm8gcmVzcG9uc2Ugc2VudCBmcm9tIHRoaXMgbGlzdGVuZXIuXG4gICAgICAgIGlmIChyZXN1bHQgIT09IHRydWUgJiYgIWlzUmVzdWx0VGhlbmFibGUgJiYgIWRpZENhbGxTZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBIHNtYWxsIGhlbHBlciB0byBzZW5kIHRoZSBtZXNzYWdlIGlmIHRoZSBwcm9taXNlIHJlc29sdmVzXG4gICAgICAgIC8vIGFuZCBhbiBlcnJvciBpZiB0aGUgcHJvbWlzZSByZWplY3RzIChhIHdyYXBwZWQgc2VuZE1lc3NhZ2UgaGFzXG4gICAgICAgIC8vIHRvIHRyYW5zbGF0ZSB0aGUgbWVzc2FnZSBpbnRvIGEgcmVzb2x2ZWQgcHJvbWlzZSBvciBhIHJlamVjdGVkXG4gICAgICAgIC8vIHByb21pc2UpLlxuICAgICAgICBjb25zdCBzZW5kUHJvbWlzZWRSZXN1bHQgPSAocHJvbWlzZSkgPT4ge1xuICAgICAgICAgIHByb21pc2UudGhlbihtc2cgPT4ge1xuICAgICAgICAgICAgLy8gc2VuZCB0aGUgbWVzc2FnZSB2YWx1ZS5cbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShtc2cpO1xuICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgIC8vIFNlbmQgYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpZiB0aGUgcmVqZWN0ZWQgdmFsdWVcbiAgICAgICAgICAgIC8vIGlzIGFuIGluc3RhbmNlIG9mIGVycm9yLCBvciB0aGUgb2JqZWN0IGl0c2VsZiBvdGhlcndpc2UuXG4gICAgICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgICAgIGlmIChlcnJvciAmJiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciB8fFxuICAgICAgICAgICAgICAgIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWRcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgX19tb3pXZWJFeHRlbnNpb25Qb2x5ZmlsbFJlamVjdF9fOiB0cnVlLFxuICAgICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIC8vIFByaW50IGFuIGVycm9yIG9uIHRoZSBjb25zb2xlIGlmIHVuYWJsZSB0byBzZW5kIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gc2VuZCBvbk1lc3NhZ2UgcmVqZWN0ZWQgcmVwbHlcIiwgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgcmV0dXJuZWQgYSBQcm9taXNlLCBzZW5kIHRoZSByZXNvbHZlZCB2YWx1ZSBhcyBhXG4gICAgICAgIC8vIHJlc3VsdCwgb3RoZXJ3aXNlIHdhaXQgdGhlIHByb21pc2UgcmVsYXRlZCB0byB0aGUgd3JhcHBlZFNlbmRSZXNwb25zZVxuICAgICAgICAvLyBjYWxsYmFjayB0byByZXNvbHZlIGFuZCBzZW5kIGl0IGFzIGEgcmVzcG9uc2UuXG4gICAgICAgIGlmIChpc1Jlc3VsdFRoZW5hYmxlKSB7XG4gICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHNlbmRSZXNwb25zZVByb21pc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0IENocm9tZSBrbm93IHRoYXQgdGhlIGxpc3RlbmVyIGlzIHJlcGx5aW5nLlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBjb25zdCB3cmFwcGVkU2VuZE1lc3NhZ2VDYWxsYmFjayA9ICh7cmVqZWN0LCByZXNvbHZlfSwgcmVwbHkpID0+IHtcbiAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgIC8vIERldGVjdCB3aGVuIG5vbmUgb2YgdGhlIGxpc3RlbmVycyByZXBsaWVkIHRvIHRoZSBzZW5kTWVzc2FnZSBjYWxsIGFuZCByZXNvbHZlXG4gICAgICAgIC8vIHRoZSBwcm9taXNlIHRvIHVuZGVmaW5lZCBhcyBpbiBGaXJlZm94LlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvd2ViZXh0ZW5zaW9uLXBvbHlmaWxsL2lzc3Vlcy8xMzBcbiAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSA9PT0gQ0hST01FX1NFTkRfTUVTU0FHRV9DQUxMQkFDS19OT19SRVNQT05TRV9NRVNTQUdFKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmVwbHkgJiYgcmVwbHkuX19tb3pXZWJFeHRlbnNpb25Qb2x5ZmlsbFJlamVjdF9fKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYmFjayB0aGUgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXJyb3IgaW50b1xuICAgICAgICAvLyBhbiBFcnJvciBpbnN0YW5jZS5cbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXBseS5tZXNzYWdlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKHJlcGx5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlID0gKG5hbWUsIG1ldGFkYXRhLCBhcGlOYW1lc3BhY2VPYmosIC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA8IG1ldGFkYXRhLm1pbkFyZ3MpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBsZWFzdCAke21ldGFkYXRhLm1pbkFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1pbkFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IG1vc3QgJHttZXRhZGF0YS5tYXhBcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5tYXhBcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHdyYXBwZWRDYiA9IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrLmJpbmQobnVsbCwge3Jlc29sdmUsIHJlamVjdH0pO1xuICAgICAgICBhcmdzLnB1c2god3JhcHBlZENiKTtcbiAgICAgICAgYXBpTmFtZXNwYWNlT2JqLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IHN0YXRpY1dyYXBwZXJzID0ge1xuICAgICAgZGV2dG9vbHM6IHtcbiAgICAgICAgbmV0d29yazoge1xuICAgICAgICAgIG9uUmVxdWVzdEZpbmlzaGVkOiB3cmFwRXZlbnQob25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcnVudGltZToge1xuICAgICAgICBvbk1lc3NhZ2U6IHdyYXBFdmVudChvbk1lc3NhZ2VXcmFwcGVycyksXG4gICAgICAgIG9uTWVzc2FnZUV4dGVybmFsOiB3cmFwRXZlbnQob25NZXNzYWdlV3JhcHBlcnMpLFxuICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7bWluQXJnczogMSwgbWF4QXJnczogM30pLFxuICAgICAgfSxcbiAgICAgIHRhYnM6IHtcbiAgICAgICAgc2VuZE1lc3NhZ2U6IHdyYXBwZWRTZW5kTWVzc2FnZS5iaW5kKG51bGwsIFwic2VuZE1lc3NhZ2VcIiwge21pbkFyZ3M6IDIsIG1heEFyZ3M6IDN9KSxcbiAgICAgIH0sXG4gICAgfTtcbiAgICBjb25zdCBzZXR0aW5nTWV0YWRhdGEgPSB7XG4gICAgICBjbGVhcjoge21pbkFyZ3M6IDEsIG1heEFyZ3M6IDF9LFxuICAgICAgZ2V0OiB7bWluQXJnczogMSwgbWF4QXJnczogMX0sXG4gICAgICBzZXQ6IHttaW5BcmdzOiAxLCBtYXhBcmdzOiAxfSxcbiAgICB9O1xuICAgIGFwaU1ldGFkYXRhLnByaXZhY3kgPSB7XG4gICAgICBuZXR3b3JrOiB7XCIqXCI6IHNldHRpbmdNZXRhZGF0YX0sXG4gICAgICBzZXJ2aWNlczoge1wiKlwiOiBzZXR0aW5nTWV0YWRhdGF9LFxuICAgICAgd2Vic2l0ZXM6IHtcIipcIjogc2V0dGluZ01ldGFkYXRhfSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHdyYXBPYmplY3QoZXh0ZW5zaW9uQVBJcywgc3RhdGljV3JhcHBlcnMsIGFwaU1ldGFkYXRhKTtcbiAgfTtcblxuICBpZiAodHlwZW9mIGNocm9tZSAhPSBcIm9iamVjdFwiIHx8ICFjaHJvbWUgfHwgIWNocm9tZS5ydW50aW1lIHx8ICFjaHJvbWUucnVudGltZS5pZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgc2NyaXB0IHNob3VsZCBvbmx5IGJlIGxvYWRlZCBpbiBhIGJyb3dzZXIgZXh0ZW5zaW9uLlwiKTtcbiAgfVxuXG4gIC8vIFRoZSBidWlsZCBwcm9jZXNzIGFkZHMgYSBVTUQgd3JhcHBlciBhcm91bmQgdGhpcyBmaWxlLCB3aGljaCBtYWtlcyB0aGVcbiAgLy8gYG1vZHVsZWAgdmFyaWFibGUgYXZhaWxhYmxlLlxuICBtb2R1bGUuZXhwb3J0cyA9IHdyYXBBUElzKGNocm9tZSk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IGJyb3dzZXI7XG59XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2Vycm9ycy5qc1wiO1xuXG5jb25zdCBNQVhfRVJST1JfVEhSRVNIT0xEID0gMzA7XG5jb25zdCBNQVhfUVVFVUVEX0VWRU5UUyA9IDIwO1xuY29uc3QgRVZFTlRfSU5URVJWQUxfTVMgPSAxMDA7XG5cbmxldCBlcnJvckNvdW50ID0gMDtcbmxldCBldmVudFByb2Nlc3NpbmdJbnRlcnZhbCA9IG51bGw7XG5sZXQgZXZlbnRQcm9jZXNzaW5nSW5Qcm9ncmVzcyA9IGZhbHNlO1xubGV0IGV2ZW50UXVldWUgPSBbXTtcblxuZnVuY3Rpb24gaXNFdmVudFRydXN0ZWQoZXZlbnQpIHtcbiAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihldmVudCkgPT09IEN1c3RvbUV2ZW50LnByb3RvdHlwZSAmJlxuICAgICFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChldmVudCwgXCJkZXRhaWxcIik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFsbG93bGlzdERvbWFpbihldmVudCkge1xuICBpZiAoIWlzRXZlbnRUcnVzdGVkKGV2ZW50KSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKFxuICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiBcImV3ZTphbGxvd2xpc3QtcGFnZVwiLFxuICAgICAgdGltZXN0YW1wOiBldmVudC5kZXRhaWwudGltZXN0YW1wLFxuICAgICAgc2lnbmF0dXJlOiBldmVudC5kZXRhaWwuc2lnbmF0dXJlXG4gICAgfSlcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc05leHRFdmVudCgpIHtcbiAgaWYgKGV2ZW50UHJvY2Vzc2luZ0luUHJvZ3Jlc3MpXG4gICAgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgZXZlbnRQcm9jZXNzaW5nSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgbGV0IGV2ZW50ID0gZXZlbnRRdWV1ZS5zaGlmdCgpO1xuICAgIGlmIChldmVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGFsbG93bGlzdGluZ1Jlc3VsdCA9IGF3YWl0IGFsbG93bGlzdERvbWFpbihldmVudCk7XG4gICAgICAgIGlmIChhbGxvd2xpc3RpbmdSZXN1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImRvbWFpbl9hbGxvd2xpc3Rpbmdfc3VjY2Vzc1wiKSk7XG4gICAgICAgICAgc3RvcE9uZUNsaWNrQWxsb3dsaXN0aW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRG9tYWluIGFsbG93bGlzdGluZyByZWplY3RlZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyb3JDb3VudCsrO1xuICAgICAgICBpZiAoZXJyb3JDb3VudCA+PSBNQVhfRVJST1JfVEhSRVNIT0xEKVxuICAgICAgICAgIHN0b3BPbmVDbGlja0FsbG93bGlzdGluZygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZXZlbnRRdWV1ZS5sZW5ndGgpXG4gICAgICBzdG9wUHJvY2Vzc2luZ0ludGVydmFsKCk7XG4gIH1cbiAgZmluYWxseSB7XG4gICAgZXZlbnRQcm9jZXNzaW5nSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uRG9tYWluQWxsb3dsaXN0aW5nUmVxdWVzdChldmVudCkge1xuICBpZiAoZXZlbnRRdWV1ZS5sZW5ndGggPj0gTUFYX1FVRVVFRF9FVkVOVFMpXG4gICAgcmV0dXJuO1xuXG4gIGV2ZW50UXVldWUucHVzaChldmVudCk7XG4gIHN0YXJ0UHJvY2Vzc2luZ0ludGVydmFsKCk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0UHJvY2Vzc2luZ0ludGVydmFsKCkge1xuICBpZiAoIWV2ZW50UHJvY2Vzc2luZ0ludGVydmFsKSB7XG4gICAgcHJvY2Vzc05leHRFdmVudCgpO1xuICAgIGV2ZW50UHJvY2Vzc2luZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwocHJvY2Vzc05leHRFdmVudCwgRVZFTlRfSU5URVJWQUxfTVMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0b3BQcm9jZXNzaW5nSW50ZXJ2YWwoKSB7XG4gIGNsZWFySW50ZXJ2YWwoZXZlbnRQcm9jZXNzaW5nSW50ZXJ2YWwpO1xuICBldmVudFByb2Nlc3NpbmdJbnRlcnZhbCA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wT25lQ2xpY2tBbGxvd2xpc3RpbmcoKSB7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkb21haW5fYWxsb3dsaXN0aW5nX3JlcXVlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRvbWFpbkFsbG93bGlzdGluZ1JlcXVlc3QsIHRydWUpO1xuICBldmVudFF1ZXVlID0gW107XG4gIHN0b3BQcm9jZXNzaW5nSW50ZXJ2YWwoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0T25lQ2xpY2tBbGxvd2xpc3RpbmcoKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkb21haW5fYWxsb3dsaXN0aW5nX3JlcXVlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRvbWFpbkFsbG93bGlzdGluZ1JlcXVlc3QsIHRydWUpO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9lcnJvcnMuanNcIjtcblxubGV0IGNvbGxhcHNlZFNlbGVjdG9ycyA9IG5ldyBTZXQoKTtcbmxldCBvYnNlcnZlcnMgPSBuZXcgV2Vha01hcCgpO1xuXG5mdW5jdGlvbiBnZXRVUkxGcm9tRWxlbWVudChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgaWYgKGVsZW1lbnQuZGF0YSlcbiAgICAgIHJldHVybiBlbGVtZW50LmRhdGE7XG5cbiAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQubG9jYWxOYW1lID09IFwicGFyYW1cIiAmJiBjaGlsZC5uYW1lID09IFwibW92aWVcIiAmJiBjaGlsZC52YWx1ZSlcbiAgICAgICAgcmV0dXJuIG5ldyBVUkwoY2hpbGQudmFsdWUsIGRvY3VtZW50LmJhc2VVUkkpLmhyZWY7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZWxlbWVudC5jdXJyZW50U3JjIHx8IGVsZW1lbnQuc3JjO1xufVxuXG5mdW5jdGlvbiBnZXRTZWxlY3RvckZvckJsb2NrZWRFbGVtZW50KGVsZW1lbnQpIHtcbiAgLy8gU2V0dGluZyB0aGUgXCJkaXNwbGF5XCIgQ1NTIHByb3BlcnR5IHRvIFwibm9uZVwiIGRvZXNuJ3QgaGF2ZSBhbnkgZWZmZWN0IG9uXG4gIC8vIDxmcmFtZT4gZWxlbWVudHMgKGluIGZyYW1lc2V0cykuIFNvIHdlIGhhdmUgdG8gaGlkZSBpdCBpbmxpbmUgdGhyb3VnaFxuICAvLyB0aGUgXCJ2aXNpYmlsaXR5XCIgQ1NTIHByb3BlcnR5LlxuICBpZiAoZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJmcmFtZVwiKVxuICAgIHJldHVybiBudWxsO1xuXG4gIC8vIElmIHRoZSA8dmlkZW8+IG9yIDxhdWRpbz4gZWxlbWVudCBjb250YWlucyBhbnkgPHNvdXJjZT4gY2hpbGRyZW4sXG4gIC8vIHdlIGNhbm5vdCBhZGRyZXNzIGl0IGluIENTUyBieSB0aGUgc291cmNlIFVSTDsgaW4gdGhhdCBjYXNlIHdlXG4gIC8vIGRvbid0IFwiY29sbGFwc2VcIiBpdCB1c2luZyBhIENTUyBzZWxlY3RvciBidXQgcmF0aGVyIGhpZGUgaXQgZGlyZWN0bHkgYnlcbiAgLy8gc2V0dGluZyB0aGUgc3R5bGU9XCIuLi5cIiBhdHRyaWJ1dGUuXG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcInZpZGVvXCIgfHwgZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJhdWRpb1wiKSB7XG4gICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgaWYgKGNoaWxkLmxvY2FsTmFtZSA9PSBcInNvdXJjZVwiKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBsZXQgc2VsZWN0b3IgPSBcIlwiO1xuICBmb3IgKGxldCBhdHRyIG9mIFtcInNyY1wiLCBcInNyY3NldFwiXSkge1xuICAgIGxldCB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpO1xuICAgIGlmICh2YWx1ZSAmJiBhdHRyIGluIGVsZW1lbnQpXG4gICAgICBzZWxlY3RvciArPSBcIltcIiArIGF0dHIgKyBcIj1cIiArIENTUy5lc2NhcGUodmFsdWUpICsgXCJdXCI7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3IgPyBlbGVtZW50LmxvY2FsTmFtZSArIHNlbGVjdG9yIDogbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVFbGVtZW50KGVsZW1lbnQsIHByb3BlcnRpZXMpIHtcbiAgbGV0IHtzdHlsZX0gPSBlbGVtZW50O1xuXG4gIGlmICghcHJvcGVydGllcykge1xuICAgIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcImZyYW1lXCIpXG4gICAgICBwcm9wZXJ0aWVzID0gW1tcInZpc2liaWxpdHlcIiwgXCJoaWRkZW5cIl1dO1xuICAgIGVsc2VcbiAgICAgIHByb3BlcnRpZXMgPSBbW1wiZGlzcGxheVwiLCBcIm5vbmVcIl1dO1xuICB9XG5cbiAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHByb3BlcnRpZXMpXG4gICAgc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgXCJpbXBvcnRhbnRcIik7XG5cbiAgaWYgKG9ic2VydmVycy5oYXMoZWxlbWVudCkpXG4gICAgb2JzZXJ2ZXJzLmdldChlbGVtZW50KS5kaXNjb25uZWN0KCk7XG5cbiAgbGV0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShrZXkpICE9IHZhbHVlIHx8XG4gICAgICAgICAgc3R5bGUuZ2V0UHJvcGVydHlQcmlvcml0eShrZXkpICE9IFwiaW1wb3J0YW50XCIpXG4gICAgICAgIHN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIFwiaW1wb3J0YW50XCIpO1xuICAgIH1cbiAgfSk7XG4gIG9ic2VydmVyLm9ic2VydmUoXG4gICAgZWxlbWVudCwge1xuICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlcjogW1wic3R5bGVcIl1cbiAgICB9XG4gICk7XG4gIG9ic2VydmVycy5zZXQoZWxlbWVudCwgb2JzZXJ2ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5oaWRlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBvYnNlcnZlciA9IG9ic2VydmVycy5nZXQoZWxlbWVudCk7XG4gIGlmIChvYnNlcnZlcikge1xuICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICBvYnNlcnZlcnMuZGVsZXRlKGVsZW1lbnQpO1xuICB9XG5cbiAgbGV0IHByb3BlcnR5ID0gZWxlbWVudC5sb2NhbE5hbWUgPT0gXCJmcmFtZVwiID8gXCJ2aXNpYmlsaXR5XCIgOiBcImRpc3BsYXlcIjtcbiAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShwcm9wZXJ0eSk7XG59XG5cbmZ1bmN0aW9uIGNvbGxhcHNlRWxlbWVudChlbGVtZW50KSB7XG4gIGxldCBzZWxlY3RvciA9IGdldFNlbGVjdG9yRm9yQmxvY2tlZEVsZW1lbnQoZWxlbWVudCk7XG4gIGlmICghc2VsZWN0b3IpIHtcbiAgICBoaWRlRWxlbWVudChlbGVtZW50KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbGxhcHNlZFNlbGVjdG9ycy5oYXMoc2VsZWN0b3IpKSB7XG4gICAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoXG4gICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiBcImV3ZTppbmplY3QtY3NzXCIsXG4gICAgICAgIHNlbGVjdG9yXG4gICAgICB9KVxuICAgICk7XG4gICAgY29sbGFwc2VkU2VsZWN0b3JzLmFkZChzZWxlY3Rvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhzZWxlY3RvciwgdXJscykge1xuICAvLyBSZXNvdXJjZXMgKGUuZy4gaW1hZ2VzKSBsb2FkZWQgaW50byBhYm91dDpibGFuayBmcmFtZXNcbiAgLy8gYXJlIChzb21ldGltZXMpIGxvYWRlZCB3aXRoIHRoZSBmcmFtZUlkIG9mIHRoZSBtYWluX2ZyYW1lLlxuICBmb3IgKGxldCBmcmFtZSBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lW3NyYz0nYWJvdXQ6YmxhbmsnXVwiKSkge1xuICAgIGlmICghZnJhbWUuY29udGVudERvY3VtZW50KVxuICAgICAgY29udGludWU7XG5cbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIGZyYW1lLmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkge1xuICAgICAgLy8gVXNlIGhpZGVFbGVtZW50LCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlIGNvcnJlY3QgZnJhbWVJZFxuICAgICAgLy8gZm9yIHRoZSBcImV3ZTppbmplY3QtY3NzXCIgbWVzc2FnZS5cbiAgICAgIGlmICh1cmxzLmhhcyhnZXRVUkxGcm9tRWxlbWVudChlbGVtZW50KSkpXG4gICAgICAgIGhpZGVFbGVtZW50KGVsZW1lbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRFbGVtZW50Q29sbGFwc2luZygpIHtcbiAgbGV0IGRlZmVycmVkID0gbnVsbDtcblxuICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIpID0+IHtcbiAgICBpZiAoIW1lc3NhZ2UgfHwgbWVzc2FnZS50eXBlICE9IFwiZXdlOmNvbGxhcHNlXCIpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSBcImxvYWRpbmdcIikge1xuICAgICAgaWYgKCFkZWZlcnJlZCkge1xuICAgICAgICBkZWZlcnJlZCA9IG5ldyBNYXAoKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgICAgICAgIGZvciAobGV0IFtzZWxlY3RvciwgdXJsc10gb2YgZGVmZXJyZWQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgaWYgKHVybHMuaGFzKGdldFVSTEZyb21FbGVtZW50KGVsZW1lbnQpKSlcbiAgICAgICAgICAgICAgICBjb2xsYXBzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGhpZGVJbkFib3V0QmxhbmtGcmFtZXMoc2VsZWN0b3IsIHVybHMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRlZmVycmVkID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGxldCB1cmxzID0gZGVmZXJyZWQuZ2V0KG1lc3NhZ2Uuc2VsZWN0b3IpIHx8IG5ldyBTZXQoKTtcbiAgICAgIGRlZmVycmVkLnNldChtZXNzYWdlLnNlbGVjdG9yLCB1cmxzKTtcbiAgICAgIHVybHMuYWRkKG1lc3NhZ2UudXJsKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwobWVzc2FnZS5zZWxlY3RvcikpIHtcbiAgICAgICAgaWYgKGdldFVSTEZyb21FbGVtZW50KGVsZW1lbnQpID09IG1lc3NhZ2UudXJsKVxuICAgICAgICAgIGNvbGxhcHNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhtZXNzYWdlLnNlbGVjdG9yLCBuZXcgU2V0KFttZXNzYWdlLnVybF0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9lcnJvcnMuanNcIjtcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRIaWRpbmdUcmFjZXIge1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMpIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IG5ldyBNYXAoc2VsZWN0b3JzKTtcblxuICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICB0aGlzLm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy50cmFjZSgpLCAxMDAwKTtcbiAgICB9KTtcblxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwibG9hZGluZ1wiKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4gdGhpcy50cmFjZSgpKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnRyYWNlKCk7XG4gIH1cblxuICBsb2coZmlsdGVycywgc2VsZWN0b3JzID0gW10pIHtcbiAgICBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICB7dHlwZTogXCJld2U6dHJhY2UtZWxlbS1oaWRlXCIsIGZpbHRlcnMsIHNlbGVjdG9yc31cbiAgICApKTtcbiAgfVxuXG4gIHRyYWNlKCkge1xuICAgIGxldCBmaWx0ZXJzID0gW107XG4gICAgbGV0IHNlbGVjdG9ycyA9IFtdO1xuXG4gICAgZm9yIChsZXQgW3NlbGVjdG9yLCBmaWx0ZXJdIG9mIHRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZGVsZXRlKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGZpbHRlcilcbiAgICAgICAgICBmaWx0ZXJzLnB1c2goZmlsdGVyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGVjdG9ycy5wdXNoKHNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmlsdGVycy5sZW5ndGggPiAwIHx8IHNlbGVjdG9ycy5sZW5ndGggPiAwKVxuICAgICAgdGhpcy5sb2coZmlsdGVycywgc2VsZWN0b3JzKTtcblxuICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwge2NoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWV9KTtcbiAgfVxufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmltcG9ydCB7aWdub3JlTm9Db25uZWN0aW9uRXJyb3J9IGZyb20gXCIuLi9lcnJvcnMuanNcIjtcblxuY29uc3QgQUxMT1dFRF9ET01BSU5TID0gbmV3IFNldChbXG4gIFwiYWJwY2hpbmEub3JnXCIsXG4gIFwiYWJwaW5kby5ibG9nc3BvdC5jb21cIixcbiAgXCJhYnB2bi5jb21cIixcbiAgXCJhZGJsb2NrLmVlXCIsXG4gIFwiYWRibG9jay5nYXJkYXIubmV0XCIsXG4gIFwiYWRibG9ja3BsdXMubWVcIixcbiAgXCJhZGJsb2NrcGx1cy5vcmdcIixcbiAgXCJjb21tZW50Y2FtYXJjaGUubmV0XCIsXG4gIFwiZHJvaXQtZmluYW5jZXMuY29tbWVudGNhbWFyY2hlLmNvbVwiLFxuICBcImVhc3lsaXN0LnRvXCIsXG4gIFwiZXllby5jb21cIixcbiAgXCJmYW5ib3kuY28ubnpcIixcbiAgXCJmaWx0ZXJsaXN0cy5jb21cIixcbiAgXCJmb3J1bXMubGFuaWsudXNcIixcbiAgXCJnaXRlZS5jb21cIixcbiAgXCJnaXRlZS5pb1wiLFxuICBcImdpdGh1Yi5jb21cIixcbiAgXCJnaXRodWIuaW9cIixcbiAgXCJnaXRsYWIuY29tXCIsXG4gIFwiZ2l0bGFiLmlvXCIsXG4gIFwiZ3VydWQuZWVcIixcbiAgXCJodWdvbGVzY2FyZ290LmNvbVwiLFxuICBcImktZG9udC1jYXJlLWFib3V0LWNvb2tpZXMuZXVcIixcbiAgXCJqb3VybmFsZGVzZmVtbWVzLmZyXCIsXG4gIFwiam91cm5hbGR1bmV0LmNvbVwiLFxuICBcImxpbnRlcm5hdXRlLmNvbVwiLFxuICBcInNwYW00MDQuY29tXCIsXG4gIFwic3RhbmV2Lm9yZ1wiLFxuICBcInZvaWQuZ3JcIixcbiAgXCJ4ZmlsZXMubm9hZHMuaXRcIixcbiAgXCJ6b3NvLnJvXCJcbl0pO1xuXG5mdW5jdGlvbiBpc0RvbWFpbkFsbG93ZWQoZG9tYWluKSB7XG4gIGlmIChkb21haW4uZW5kc1dpdGgoXCIuXCIpKVxuICAgIGRvbWFpbiA9IGRvbWFpbi5zdWJzdHJpbmcoMCwgZG9tYWluLmxlbmd0aCAtIDEpO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgaWYgKEFMTE9XRURfRE9NQUlOUy5oYXMoZG9tYWluKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGxldCBpbmRleCA9IGRvbWFpbi5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgZG9tYWluID0gZG9tYWluLnN1YnN0cihpbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJzY3JpYmVMaW5rc0VuYWJsZWQodXJsKSB7XG4gIGxldCB7cHJvdG9jb2wsIGhvc3RuYW1lfSA9IG5ldyBVUkwodXJsKTtcbiAgcmV0dXJuIGhvc3RuYW1lID09IFwibG9jYWxob3N0XCIgfHxcbiAgICBwcm90b2NvbCA9PSBcImh0dHBzOlwiICYmIGlzRG9tYWluQWxsb3dlZChob3N0bmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVTdWJzY3JpYmVMaW5rcygpIHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGV2ZW50ID0+IHtcbiAgICBpZiAoZXZlbnQuYnV0dG9uID09IDIgfHwgIWV2ZW50LmlzVHJ1c3RlZClcbiAgICAgIHJldHVybjtcblxuICAgIGxldCBsaW5rID0gZXZlbnQudGFyZ2V0O1xuICAgIHdoaWxlICghKGxpbmsgaW5zdGFuY2VvZiBIVE1MQW5jaG9yRWxlbWVudCkpIHtcbiAgICAgIGxpbmsgPSBsaW5rLnBhcmVudE5vZGU7XG5cbiAgICAgIGlmICghbGluaylcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBxdWVyeVN0cmluZyA9IG51bGw7XG4gICAgaWYgKGxpbmsucHJvdG9jb2wgPT0gXCJodHRwOlwiIHx8IGxpbmsucHJvdG9jb2wgPT0gXCJodHRwczpcIikge1xuICAgICAgaWYgKGxpbmsuaG9zdCA9PSBcInN1YnNjcmliZS5hZGJsb2NrcGx1cy5vcmdcIiAmJiBsaW5rLnBhdGhuYW1lID09IFwiL1wiKVxuICAgICAgICBxdWVyeVN0cmluZyA9IGxpbmsuc2VhcmNoLnN1YnN0cigxKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBGaXJlZm94IGRvZXNuJ3Qgc2VlbSB0byBwb3B1bGF0ZSB0aGUgXCJzZWFyY2hcIiBwcm9wZXJ0eSBmb3JcbiAgICAgIC8vIGxpbmtzIHdpdGggbm9uLXN0YW5kYXJkIFVSTCBzY2hlbWVzIHNvIHdlIG5lZWQgdG8gZXh0cmFjdCB0aGUgcXVlcnlcbiAgICAgIC8vIHN0cmluZyBtYW51YWxseS5cbiAgICAgIGxldCBtYXRjaCA9IC9eYWJwOlxcLypzdWJzY3JpYmVcXC8qXFw/KC4qKS9pLmV4ZWMobGluay5ocmVmKTtcbiAgICAgIGlmIChtYXRjaClcbiAgICAgICAgcXVlcnlTdHJpbmcgPSBtYXRjaFsxXTtcbiAgICB9XG5cbiAgICBpZiAoIXF1ZXJ5U3RyaW5nKVxuICAgICAgcmV0dXJuO1xuXG4gICAgbGV0IHRpdGxlID0gbnVsbDtcbiAgICBsZXQgdXJsID0gbnVsbDtcbiAgICBmb3IgKGxldCBwYXJhbSBvZiBxdWVyeVN0cmluZy5zcGxpdChcIiZcIikpIHtcbiAgICAgIGxldCBwYXJ0cyA9IHBhcmFtLnNwbGl0KFwiPVwiLCAyKTtcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT0gMiB8fCAhL1xcUy8udGVzdChwYXJ0c1sxXSkpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgc3dpdGNoIChwYXJ0c1swXSkge1xuICAgICAgICBjYXNlIFwidGl0bGVcIjpcbiAgICAgICAgICB0aXRsZSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJsb2NhdGlvblwiOlxuICAgICAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghdXJsKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKCF0aXRsZSlcbiAgICAgIHRpdGxlID0gdXJsO1xuXG4gICAgdGl0bGUgPSB0aXRsZS50cmltKCk7XG4gICAgdXJsID0gdXJsLnRyaW0oKTtcbiAgICBpZiAoIS9eKGh0dHBzP3xmdHApOi8udGVzdCh1cmwpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWdub3JlTm9Db25uZWN0aW9uRXJyb3IoXG4gICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe3R5cGU6IFwiZXdlOnN1YnNjcmliZS1saW5rLWNsaWNrZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUsIHVybH0pXG4gICAgKTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sIHRydWUpO1xufVxuIiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmNvbnN0IEVSUk9SX05PX0NPTk5FQ1RJT04gPSBcIkNvdWxkIG5vdCBlc3RhYmxpc2ggY29ubmVjdGlvbi4gXCIgK1xuICAgICAgXCJSZWNlaXZpbmcgZW5kIGRvZXMgbm90IGV4aXN0LlwiO1xuY29uc3QgRVJST1JfQ0xPU0VEX0NPTk5FQ1RJT04gPSBcIkEgbGlzdGVuZXIgaW5kaWNhdGVkIGFuIGFzeW5jaHJvbm91cyBcIiArXG4gICAgICBcInJlc3BvbnNlIGJ5IHJldHVybmluZyB0cnVlLCBidXQgdGhlIG1lc3NhZ2UgY2hhbm5lbCBjbG9zZWQgYmVmb3JlIGEgXCIgK1xuICAgICAgXCJyZXNwb25zZSB3YXMgcmVjZWl2ZWRcIjtcblxuZXhwb3J0IGNvbnN0IEVSUk9SX0RVUExJQ0FURV9GSUxURVJTID0gXCJzdG9yYWdlX2R1cGxpY2F0ZV9maWx0ZXJzXCI7XG5leHBvcnQgY29uc3QgRVJST1JfRklMVEVSX05PVF9GT1VORCA9IFwiZmlsdGVyX25vdF9mb3VuZFwiO1xuZXhwb3J0IGNvbnN0IEVSUk9SX1RPT19NQU5ZX0ZJTFRFUlMgPSBcInRvb19tYW55X2ZpbHRlcnNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKHByb21pc2UpIHtcbiAgcmV0dXJuIHByb21pc2UuY2F0Y2goZXJyb3IgPT4ge1xuICAgIGlmICh0eXBlb2YgZXJyb3IgPT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAoZXJyb3IubWVzc2FnZSA9PSBFUlJPUl9OT19DT05ORUNUSU9OIHx8XG4gICAgICAgICBlcnJvci5tZXNzYWdlID09IEVSUk9SX0NMT1NFRF9DT05ORUNUSU9OKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRocm93IGVycm9yO1xuICB9KTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcblxuaW1wb3J0IHtFbGVtSGlkZUVtdWxhdGlvbn1cbiAgZnJvbSBcImFkYmxvY2twbHVzY29yZS9saWIvY29udGVudC9lbGVtSGlkZUVtdWxhdGlvbi5qc1wiO1xuXG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQge3N0YXJ0RWxlbWVudENvbGxhcHNpbmcsIGhpZGVFbGVtZW50LCB1bmhpZGVFbGVtZW50fVxuICBmcm9tIFwiLi9lbGVtZW50LWNvbGxhcHNpbmcuanNcIjtcbmltcG9ydCB7c3RhcnRPbmVDbGlja0FsbG93bGlzdGluZ30gZnJvbSBcIi4vYWxsb3dsaXN0aW5nLmpzXCI7XG5pbXBvcnQge0VsZW1lbnRIaWRpbmdUcmFjZXJ9IGZyb20gXCIuL2VsZW1lbnQtaGlkaW5nLXRyYWNlci5qc1wiO1xuaW1wb3J0IHtzdWJzY3JpYmVMaW5rc0VuYWJsZWQsIGhhbmRsZVN1YnNjcmliZUxpbmtzfSBmcm9tIFwiLi9zdWJzY3JpYmUtbGlua3MuanNcIjtcblxuYXN5bmMgZnVuY3Rpb24gaW5pdENvbnRlbnRGZWF0dXJlcygpIHtcbiAgaWYgKHN1YnNjcmliZUxpbmtzRW5hYmxlZCh3aW5kb3cubG9jYXRpb24uaHJlZikpXG4gICAgaGFuZGxlU3Vic2NyaWJlTGlua3MoKTtcblxuICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe3R5cGU6IFwiZXdlOmNvbnRlbnQtaGVsbG9cIn0pXG4gICk7XG5cbiAgaWYgKCFyZXNwb25zZSlcbiAgICByZXR1cm47XG5cbiAgbGV0IHRyYWNlcjtcbiAgaWYgKHJlc3BvbnNlLnRyYWNlZFNlbGVjdG9ycylcbiAgICB0cmFjZXIgPSBuZXcgRWxlbWVudEhpZGluZ1RyYWNlcihyZXNwb25zZS50cmFjZWRTZWxlY3RvcnMpO1xuXG4gIGlmIChyZXNwb25zZS5lbXVsYXRlZFBhdHRlcm5zLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgZWxlbUhpZGVFbXVsYXRpb24gPSBuZXcgRWxlbUhpZGVFbXVsYXRpb24oKGVsZW1lbnRzLCBmaWx0ZXJzKSA9PiB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxuICAgICAgICBoaWRlRWxlbWVudChlbGVtZW50LCByZXNwb25zZS5jc3NQcm9wZXJ0aWVzKTtcblxuICAgICAgaWYgKHRyYWNlcilcbiAgICAgICAgdHJhY2VyLmxvZyhmaWx0ZXJzKTtcbiAgICB9LCBlbGVtZW50cyA9PiB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxuICAgICAgICB1bmhpZGVFbGVtZW50KGVsZW1lbnQpO1xuICAgIH0pO1xuICAgIGVsZW1IaWRlRW11bGF0aW9uLmFwcGx5KHJlc3BvbnNlLmVtdWxhdGVkUGF0dGVybnMpO1xuICB9XG59XG5cbnN0YXJ0RWxlbWVudENvbGxhcHNpbmcoKTtcbnN0YXJ0T25lQ2xpY2tBbGxvd2xpc3RpbmcoKTtcbmluaXRDb250ZW50RmVhdHVyZXMoKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=