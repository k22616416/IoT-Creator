// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Import all plugins
// import $ from 'jquery';
// import * as bootstrap from 'bootstrap';
// import * as $ from 'jquery';
var overlapOffset = 0;
var onTop;
var node_len = 5;
var node_list = new Array();
var node_container_list = new Array();
$(document).on('ready', function () {
  for (i = 0; i < node_len; i++) {
    var t = new Node($('#canvas'), i);
    node_list.push(t);
    node_container_list.push(t.container);
  }

  var line = new CreateLine();
  $('#screen_size').html($(document).width() + " x " + $(document).height());
  $('#canvas_size').html($('#canvas').width() + " x " + $('#canvas').height());
  $.each(node_container_list, function (key, value) {
    $(value).css('z-index', key);

    if (key == node_container_list.length - 1) {
      onTop = this;
    }
  });
  $(node_container_list).draggable({
    containment: "parent",
    scroll: false,
    drag: function drag(event, ui) {
      var closest = getClosestNode($('.node'), event.target).target;
      $(closest).addClass("overlap");

      if (isOverlap(closest, event.target) || isOverlap(event.target, closest)) {
        $(closest).addClass("overlap");
        $(event.target).addClass('overlap');
        line.Destroy();
        var f = node_list.find(function (value, key) {
          return value.container == event.target;
        });
        f.isOverlap = true;
        f.overlap_target = closest;
        f = node_list.find(function (value, key) {
          return value.container == closest;
        });
        f.isOverlap = true;
        f.overlap_target = event.target;
      } else {
        $(node_container_list).removeClass("overlap"); // $(event.target).removeClass('overlap');

        if (line.line === undefined) {
          line.Init(closest, event.target);
          return;
        }

        line.ReDraw(closest, event.target);
        node_list.forEach(function (value, key) {
          value.isOverlap = false;
          value.overlap_target = undefined;
        });
      }
    },
    start: function start(event, ui) {
      $(onTop).css('z-index', $(this).css('z-index'));
      $(this).css('z-index', node_container_list.length - 1);
      onTop = this;
    },
    stop: function stop(event, ui) {
      line.Destroy();
      var f = node_list.find(function (value, key) {
        return value.container == event.target;
      });

      if (f.isOverlap) {
        $(f.container).addClass('connected');
        $(f.overlap_target).addClass('connected');
        console.log('overlap');
        return;
      }
    }
  });
});

function getClosestNode(_list, self) {
  var target = undefined;
  var self_pos = [$(self).offset().left + $(self).width() / 2, $(self).offset().top + $(self).height() / 2];
  var dx, dy, closest_dis;
  var dis;
  var c_pos;
  $.each(_list, function (key, value) {
    if (value == self) return;
    c_pos = [$(value).offset().left + $(value).width() / 2, $(value).offset().top + $(value).height() / 2];

    if (target == undefined) {
      target = value;
      dx = Math.abs(self_pos[0] - c_pos[0]);
      dy = Math.abs(self_pos[1] - c_pos[1]);
      closest_dis = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      return;
    }

    dx = Math.abs(self_pos[0] - c_pos[0]);
    dy = Math.abs(self_pos[1] - c_pos[1]);
    dis = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    if (dis < closest_dis) {
      target = value;
      closest_dis = dis;
    }
  });
  return {
    target: target,
    closest_dis: closest_dis,
    c_pos: c_pos
  };
}

function isOverlap(idOne, idTwo) {
  var objOne = $(idOne),
      objTwo = $(idTwo),
      offsetOne = objOne.offset(),
      offsetTwo = objTwo.offset(),
      topOne = offsetOne.top,
      topTwo = offsetTwo.top,
      leftOne = offsetOne.left,
      leftTwo = offsetTwo.left,
      widthOne = objOne.width() + overlapOffset,
      widthTwo = objTwo.width() + overlapOffset,
      heightOne = objOne.height() + overlapOffset,
      heightTwo = objTwo.height() + overlapOffset;
  var leftTop = leftTwo > leftOne && leftTwo < leftOne + widthOne && topTwo > topOne && topTwo < topOne + heightOne,
      rightTop = leftTwo + widthTwo > leftOne && leftTwo + widthTwo < leftOne + widthOne && topTwo > topOne && topTwo < topOne + heightOne,
      leftBottom = leftTwo > leftOne && leftTwo < leftOne + widthOne && topTwo + heightTwo > topOne && topTwo + heightTwo < topOne + heightOne,
      rightBottom = leftTwo + widthTwo > leftOne && leftTwo + widthTwo < leftOne + widthOne && topTwo + heightTwo > topOne && topTwo + heightTwo < topOne + heightOne;
  var topLine = Math.abs(topOne - topTwo) <= 5,
      bottomLine = Math.abs(topOne + heightOne - (topTwo + heightTwo)) <= 5,
      leftLine = Math.abs(leftOne - leftTop) <= 5,
      rightLine = Math.abs(leftOne + widthOne - (leftTwo + widthTwo)) <= 5;
  return leftTop || rightTop || leftBottom || rightBottom || topLine && bottomLine && leftLine && rightLine;
}

var Node = // DOM elements
// 整個node的DOM
// node顯示文字的DOM
//連接的node
// variables
// node顯示的文字
// other

/**
 * 
 * @constructor
 * @param {HTMLElement} canvas node擺設的畫布
 * @param {String} text node顯示的文字
 * @param {Object} size node的大小
 */
function Node(canvas) {
  var text = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    width: "3em",
    height: "3em"
  };

  _classCallCheck(this, Node);

  _defineProperty(this, "container", undefined);

  _defineProperty(this, "node_content", undefined);

  _defineProperty(this, "connected_node", new Array());

  _defineProperty(this, "overlap_target", undefined);

  _defineProperty(this, "id", undefined);

  _defineProperty(this, "text", "");

  _defineProperty(this, "defultSize", ["3em", "3em"]);

  _defineProperty(this, "size", undefined);

  _defineProperty(this, "isOverlap", false);

  _defineProperty(this, "group", {
    id: undefined,
    groupDOM: undefined // 群組的DOM

  });

  if (canvas == undefined) throw new ReferenceError('canvas is undefined.');
  this.container = $('<div class="node"><div')[0];

  if (size != undefined) {
    $(this.container).css('width', size.width);
    $(this.container).css('height', size.height);
  }

  this.node_content = $('<div class="node_content"></div>')[0];
  $(this.container).append(this.node_content);
  $(canvas).append(this.container);
  $(this.node_content).html(text);
};

var CreateLine = /*#__PURE__*/function () {
  function CreateLine() {
    _classCallCheck(this, CreateLine);

    _defineProperty(this, "line", void 0);

    this.line = undefined;
  }

  _createClass(CreateLine, [{
    key: "DrawLine",
    value: function DrawLine(ax, ay, bx, by) {
      if (ax > bx) {
        bx = ax + bx;
        ax = bx - ax;
        bx = bx - ax;
        by = ay + by;
        ay = by - ay;
        by = by - ay;
      }

      var angle = Math.atan((ay - by) / (bx - ax));
      angle = angle * 180 / Math.PI;
      angle = -angle;
      var length = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
      var style = "";
      style += "left:" + ax + "px;";
      style += "top:" + ay + "px;";
      style += "width:" + length + "px;";
      style += "height:1px;"; // style += "background-color: rgba(50,50,50,0.5);"

      style += "position:absolute;";
      style += "transform:rotate(" + angle + "deg);"; // style += "-ms-transform:rotate(" + angle + "deg);"

      style += "transform-origin:0% 0%;"; // style += "-moz-transform:rotate(" + angle + "deg);"
      // style += "-moz-transform-origin:0% 0%;"
      // style += "-webkit-transform:rotate(" + angle + "deg);"
      // style += "-webkit-transform-origin:0% 0%;"
      // style += "-o-transform:rotate(" + angle + "deg);"
      // style += "-o-transform-origin:0% 0%;"
      // style += "-webkit-box-shadow: 0px 0px 2px 2px rgba(0, 0, 0, .1);"

      style += "box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, .1);";
      style += "z-index:99;";
      style += "border:1px dashed rgba(50,50,50,0.3)";
      return style; // return $("<div style='" + style + "'></div>");
    }
  }, {
    key: "Init",
    value: function Init(element, element2) {
      var reDraw = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var el1 = this.GetCoord(element);
      var el2 = this.GetCoord(element2);
      var x1 = el1[0];
      var y1 = el1[1];
      var x2 = el2[0];
      var y2 = el2[1];
      var line;

      if (reDraw) {
        this.line.style = this.DrawLine(x1, y1, x2, y2);
      } else {
        line = document.createElement("div");
        line.style = this.DrawLine(x1, y1, x2, y2);
        this.line = line;
      }

      $(element).after(line); // let length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
      // let cx = ((x1 + x2) / 2) - (length / 2);
      // let cy = ((y1 + y2) / 2) - (1 / 2);
      // let deg = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
      // let line
      // if (reDraw) {
      //     line = this.line;
      // }
      // else {
      //     line = document.createElement("div");
      //     // line.style.position = "absolute";
      //     line.style.backgroundColor = "#000";
      //     line.style.zIndex = 999;
      // }
      // line.style.left = cx + "px";
      // line.style.top = cy + "px";
      // line.style.width = length + "px";
      // line.style.height = "2px";
      // line.style.transform = "rotate(" + deg + "deg)";
      // this.line = line;
      // $(element).after(line);
    }
  }, {
    key: "ReDraw",
    value: function ReDraw(element, element2) {
      this.Init(element, element2, true);
    }
  }, {
    key: "GetLine",
    value: function GetLine() {
      return this.line;
    }
  }, {
    key: "GetCoord",
    value: function GetCoord(element) {
      var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      // 取div中心座標 座標從0開始所以要+1
      var x = element.offsetLeft + $(element).width() / 2 + 1;
      var y = element.offsetTop + $(element).height() / 2 + 1;
      return [x, y];
    }
  }, {
    key: "Destroy",
    value: function Destroy() {
      try {
        $(this.line).remove();
      } catch (e) {
        throw e;
      }

      delete this.line;
    }
  }]);

  return CreateLine;
}();
},{}],"C:/Users/kk013/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52748" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/kk013/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/IoT-Creator.e31bb0bc.js.map