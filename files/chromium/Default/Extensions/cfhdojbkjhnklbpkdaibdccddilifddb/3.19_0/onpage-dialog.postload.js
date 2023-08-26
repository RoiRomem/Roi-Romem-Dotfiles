/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ../src/core/api/front/api.port.ts
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
let port;
const connectListeners = new Set();
const disconnectListeners = new Set();
const messageListeners = new Set();
function addConnectListener(listener) {
    connectListeners.add(listener);
    listener();
}
function addDisconnectListener(listener) {
    disconnectListeners.add(listener);
}
function addMessageListener(listener) {
    messageListeners.add(listener);
}
const connect = () => {
    if (port) {
        return port;
    }
    try {
        port = browser.runtime.connect({ name: "ui" });
    }
    catch (ex) {
        port = null;
        disconnectListeners.forEach((listener) => listener());
        return port;
    }
    port.onMessage.addListener((message) => {
        onMessage(message);
    });
    port.onDisconnect.addListener(onDisconnect);
    connectListeners.forEach((listener) => listener());
    return port;
};
function listen(_a) {
    var { type, filter } = _a, options = __rest(_a, ["type", "filter"]);
    addConnectListener(() => {
        if (port) {
            port.postMessage(Object.assign({ type: `${type}.listen`, filter }, options));
        }
    });
}
function onDisconnect() {
    port = null;
    setTimeout(() => connect(), 100);
}
function onMessage(message) {
    if (!message.type.endsWith(".respond")) {
        return;
    }
    messageListeners.forEach((listener) => listener(message));
}
function removeDisconnectListener(listener) {
    disconnectListeners.delete(listener);
}

;// CONCATENATED MODULE: ../src/core/api/front/api.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const platformToStore = {
    chromium: "chrome",
    edgehtml: "edge",
    gecko: "firefox"
};
const app = {
    get: (what) => send("app.get", { what }),
    getInfo: () => __awaiter(void 0, void 0, void 0, function* () {
        return Promise.all([app.get("application"), app.get("platform")]).then(([application, rawPlatform]) => {
            const platform = rawPlatform;
            let store;
            if (application !== "edge" && application !== "opera") {
                store = platformToStore[platform] || "chrome";
            }
            else {
                store = application;
            }
            return {
                application,
                platform,
                store
            };
        });
    }),
    listen: (filter) => listen({ type: "app", filter }),
    open: (what, options = {}) => send("app.open", Object.assign({ what }, options))
};
const ctalinks = {
    get: (link, queryParams = {}) => send("app.get", { what: "ctalink", link, queryParams })
};
const doclinks = {
    get: (link) => send("app.get", { what: "doclink", link })
};
const filters = {
    get: () => send("filters.get"),
    listen: (filter) => listen({ type: "filters", filter })
};
const notifications = {
    get: (displayMethod) => send("notifications.get", { displayMethod }),
    seen: () => send("notifications.seen")
};
const prefs = {
    get: (key) => send("prefs.get", { key }),
    listen: (filter) => listen({ type: "prefs", filter })
};
const premium = {
    activate: (userId) => send("premium.activate", { userId }),
    get: () => send("premium.get"),
    listen: (filter) => listen({ type: "premium", filter })
};
const requests = {
    listen: (filter, tabId) => listen({ type: "requests", filter, tabId })
};
function send(sendType, rawArgs = {}) {
    const args = Object.assign(Object.assign({}, rawArgs), { type: sendType });
    return browser.runtime.sendMessage(args);
}
const stats = {
    getBlockedPerPage: (tab) => send("stats.getBlockedPerPage", { tab }),
    getBlockedTotal: () => send("stats.getBlockedTotal"),
    listen: (filter) => listen({ type: "stats", filter })
};
const subscriptions = {
    add: (url) => send("subscriptions.add", { url }),
    get: (options) => send("subscriptions.get", options),
    getInitIssues: () => send("subscriptions.getInitIssues"),
    getRecommendations: () => send("subscriptions.getRecommendations"),
    listen: (filter) => listen({ type: "subscriptions", filter }),
    remove: (url) => send("subscriptions.remove", { url })
};
const api_api = {
    addDisconnectListener: addDisconnectListener,
    addListener: addMessageListener,
    app,
    ctalinks,
    doclinks,
    filters,
    notifications,
    prefs,
    premium,
    requests,
    removeDisconnectListener: removeDisconnectListener,
    subscriptions,
    stats
};
connect();
/* harmony default export */ const front_api = ((/* unused pure expression or super */ null && (api_api)));

;// CONCATENATED MODULE: ../src/core/api/front/index.ts




/* harmony default export */ const front = ((/* unused pure expression or super */ null && (api)));

;// CONCATENATED MODULE: ../src/polyfills/shared/polyfill.ts
function isMessage(candidate) {
    return (candidate !== null && typeof candidate === "object" && "type" in candidate);
}

;// CONCATENATED MODULE: ../src/onpage-dialog/content/frame-manager.ts


let iframe = null;
let overlay = null;
function handleMessage(message) {
    if (!isMessage(message)) {
        return;
    }
    switch (message.type) {
        case "onpage-dialog.hide":
            hideDialog();
            break;
        case "onpage-dialog.resize":
            if (!iframe) {
                break;
            }
            if (!isResizeMessage(message)) {
                break;
            }
            iframe.style.setProperty("--abp-overlay-onpage-dialog-height", `${message.height}px`);
            break;
        case "onpage-dialog.show":
            if (!isShowMessage(message)) {
                break;
            }
            showDialog(message.platform);
            break;
        default:
    }
}
function hideDialog() {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
    iframe = null;
    overlay = null;
}
function isResizeMessage(message) {
    return message.type === "onpage-dialog.resize" && "height" in message;
}
function isShowMessage(message) {
    return message.type === "onpage-dialog.show" && "platform" in message;
}
function showDialog(platform) {
    overlay = document.createElement("div");
    overlay.setAttribute("id", "__abp-overlay-onpage-dialog");
    iframe = document.createElement("iframe");
    iframe.setAttribute("frameborder", "0");
    if (platform !== "gecko") {
        iframe.setAttribute("sandbox", "");
    }
    iframe.addEventListener("load", () => {
        if (!(iframe === null || iframe === void 0 ? void 0 : iframe.contentWindow)) {
            return;
        }
        iframe.contentWindow.postMessage("onpage-dialog.start", "*");
    });
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
    if (platform === "gecko") {
        iframe.setAttribute("sandbox", "");
    }
}
function start() {
    browser.runtime.onMessage.addListener(handleMessage);
    addDisconnectListener(() => {
        stop();
    });
}
function stop() {
    browser.runtime.onMessage.removeListener(handleMessage);
    hideDialog();
}
start();

;// CONCATENATED MODULE: ../src/onpage-dialog/content/index.ts


/******/ })()
;