(function () {
  'use strict';

  var customElements;
  var customAttributes;

  function el (tagName) {
    var arguments$1 = arguments;

    if (customElements) {
      var customElement = customElements[tagName];

      if (customElement) {
        return customElement.apply(this, arguments);
      }
    }

    if (typeof tagName === 'function') {
      var args = new Array(arguments.length);
      args[0] = this;
      for (var i = 1; i < arguments.length; i++) {
        args[i] = arguments$1[i];
      }
      return new (Function.prototype.bind.apply(tagName, args));
    } else {
      var element = document.createElement(tagName);
    }

    for (var i = 1; i < arguments.length; i++) {
      var arg = arguments$1[i];

      if (arg == null) {
        continue;
      } else if (mount(element, arg)) {
        continue;
      } else if (typeof arg === 'object') {
        for (var attr in arg) {
          if (customAttributes) {
            var customAttribute = customAttributes[attr];
            if (customAttribute) {
              customAttribute(element, arg[attr]);
              continue;
            }
          }
          var value = arg[attr];
          if (attr === 'style' || (element[attr] == null && typeof value != 'function')) {
            element.setAttribute(attr, value);
          } else {
            element[attr] = value;
          }
        }
      }
    }

    return element;
  }

  el.extend = function (tagName) {
    return function () {
      var arguments$1 = arguments;

      var args = new Array(arguments.length);

      for (var i = 0; i < args.length; i++) {
        args[i] = arguments$1[i];
      }

      return el.apply(this, [tagName].concat(args));
    }
  }

  function List (View, key, initData, skipRender) {
    this.View = View;
    this.views = [];
    this.initData = initData;
    this.skipRender = skipRender;

    if (key) {
      this.key = key;
      this.lookup = {};
    }
  }

  List.prototype.update = function (data, cb) {
    var View = this.View;
    var views = this.views;
    var parent = this.parent;
    var key = this.key;
    var initData = this.initData;
    var skipRender = this.skipRender;

    if (cb) {
      var added = [];
      var updated = [];
      var removed = [];
    }

    if (key) {
      var lookup = this.lookup;
      var newLookup = {};

      views.length = data.length;

      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var id = item[key];
        var view = lookup[id];

        if (!view) {
          view = new View(initData, item, i);
          cb && added.push(view);
        } else {
          cb && updated.push(view);
        }

        views[i] = newLookup[id] = view;

        view.update && view.update(item, i);
      }

      if (cb) {
        for (var id in lookup) {
          if (!newLookup[id]) {
            removed.push(lookup[id]);
            !skipRender && parent && destroy(lookup[id]);
          }
        }
      }

      this.lookup = newLookup;
    } else {
      if (cb) {
        for (var i = data.length; i < views.length; i++) {
          var view = views[i];

          !skipRender && parent && destroy(view);
          removed.push(view);
        }
      }

      views.length = data.length;

      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var view = views[i];

        if (!view) {
          view = new View(initData, item, i);
          cb && added.push(view);
        } else {
          cb && updated.push(view);
        }

        view.update && view.update(item, i);
        views[i] = view;
      }
    }

    !skipRender && parent && setChildren(parent, views);
    cb && cb(added, updated, removed);
  }

  function mount (parent, child, before) {
    var parentEl = parent.el || parent;
    var childEl = child.el || child;
    var childWasMounted = childEl.parentNode != null;

    if (childWasMounted) {
      child.remounting && child.remounting();
    } else {
      child.mounting && child.mounting();
    }

    if (childEl instanceof Node) {
      if (before) {
        var beforeEl = before.el || before;
        parentEl.insertBefore(childEl, beforeEl);
      } else {
        parentEl.appendChild(childEl);
      }

      if (childWasMounted) {
        child.remounted && child.remounted();
      } else {
        child.mounted && child.mounted();
      }
      if (childEl !== child) {
        childEl.view = child;
        child.parent = parent;
      }

    } else if (typeof childEl === 'string' || typeof childEl === 'number') {
      mount(parentEl, document.createTextNode(childEl), before);

    } else if (childEl instanceof Array) {
      for (var i = 0; i < childEl.length; i++) {
        mount(parentEl, childEl[i], before);
      }

    } else if (child instanceof List) {
      child.parent = parent;
      setChildren(parentEl, child.views);

    } else {
      return false;
    }
    return true;
  }

  function unmount (parent, child) {
    var parentEl = parent.el || parent;
    var childEl = child.el || child;

    child.unmounting && child.unmounting();

    parentEl.removeChild(childEl);

    child.unmounted && child.unmounted();

    if (childEl !== child) {
      child.parent = null;
    }
  }

  function destroy (child) {
    var childEl = child.el || child;
    var parent = childEl.parentNode;
    var parentView = parent.view || parent;

    child.destroying && child.destroying(child);
    notifyDown(child, 'destroying');
    parent && unmount(parentView, child);
    child.destroyed && child.destroyed(child);
    notifyDown(child, 'destroyed');
  }

  function notifyDown (child, eventName, originalChild) {
    var childEl = child.el || child;
    var traverse = childEl.firstChild;

    while (traverse) {
      var next = traverse.nextSibling;
      var view = traverse.view || traverse;
      var event = view[eventName];

      event && event.call(view, originalChild || child);
      notifyDown(traverse, eventName, originalChild || child);

      traverse = next;
    }
  }

  function setChildren (parent, children) {
    var parentEl = parent.el || parent;
    var traverse = parentEl.firstChild;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var childEl = child.el || child;

      if (traverse === childEl) {
        traverse = traverse.nextSibling;
        continue;
      }

      mount(parent, child, traverse);
    }

    while (traverse) {
      var next = traverse.nextSibling;

      unmount(parent, traverse.view || traverse);

      traverse = next;
    }
  }

  var Wheel = function Wheel (ref) {
    var x = ref.x;
    var y = ref.y;
    var diameter = ref.diameter;
    var width = ref.width;

    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.width = width;
    this.el = el('wheel', { style: ("left: " + x + "rem; top: " + y + "rem;") },
      el('graphic', { style: ("width: " + width + "rem; height: " + diameter + "rem") })
    );
  };
  Wheel.prototype.rotate = function rotate (deg) {
    this.el.style.transform = "rotate(" + deg + "deg)"
  };

  var Trailer = function Trailer (car, ref, wheelParams) {
    var x = ref.x;
    var y = ref.y;
    var width = ref.width;
    var length = ref.length;
    var shaftLength = ref.shaftLength;

    this.car = car;
    this.x = car.x3;
    this.y = car.y3;
    this.x2 = this.x;
    this.y2 = this.y + shaftLength + length / 2;
    this.width = width;
    this.length = length;
    this.shaftLength = shaftLength;
    this.facing = Math.PI / 2;

    this.el = el('trailer', { style: ("left: " + x + "rem; top: " + y + "rem;") },
      el(Wheel, Object.assign({}, {x: -width/2, y: shaftLength + length/2}, wheelParams)),
      el(Wheel, Object.assign({}, {x: width/2, y: shaftLength + length/2}, wheelParams)),
      el('shaft', { style: ("width: .2rem; height: " + shaftLength + "rem; top: " + (shaftLength / 2) + "rem;") }),
      el('graphic', { style: ("top: " + (shaftLength + length / 2) + "rem; width: " + width + "rem; height: " + length + "rem;") })
    );
  };
  Trailer.prototype.render = function render () {
    this.x = this.car.x3;
    this.y = this.car.y3;
    this.facing = Math.atan2(this.y - this.y2, this.x - this.x2);
    this.x2 = this.x - Math.cos(this.facing) * (this.length / 2 + this.shaftLength);
    this.y2 = this.y - Math.sin(this.facing) * (this.length / 2 + this.shaftLength);

    this.el.style.transform = "rotate(" + ((this.facing - this.car.facing) * 180/Math.PI) + "deg)";
  };

  var Car = function Car (ref, wheelParams, trailerParams, trailerWheelParams) {
    var x = ref.x;
    var y = ref.y;
    var width = ref.width;
    var wheelbase = ref.wheelbase;
    var length = ref.length;

    this.x = x;
    this.y = y;
    this.wheelbase = wheelbase;
    this.width = width;
    this.length = length;
    this.dir = 0;
    this.facing = Math.PI / 2;
    this.v = 0;
    this.x2 = x;
    this.y2 = y + this.wheelbase;
    this.x3 = x;
    this.y3 = y + this.wheelbase + (this.length - this.wheelbase) / 2;

    this.el = el('car', { style: ("transform: translate(" + x + "rem, " + y + "rem)")},
      this.frontleft = el(Wheel, Object.assign({}, {x: -this.width/2, y: 0}, wheelParams)),
      this.frontright = el(Wheel, Object.assign({}, {x: this.width/2, y: 0}, wheelParams)),
      this.backleft = el(Wheel, Object.assign({}, {x: -this.width/2, y: wheelbase}, wheelParams)),
      this.backright = el(Wheel, Object.assign({}, {x: this.width/2, y: wheelbase}, wheelParams)),
      el('graphic', { style: ("width: " + width + "rem; height: " + length + "rem; top: " + (this.wheelbase/2) + "rem") },
        el('windshield'),
        el('windshield-back')
      ),
      this.trailer = new Trailer(this, Object.assign({}, trailerParams, {y: wheelbase/2 + length / 2}), trailerWheelParams)
    );
  };
  Car.prototype.accelerate = function accelerate () {
    if (this.v < 0) {
        this.v += .005;
    } else {
      this.v += .002;
      }
    if (this.v > .15) {
      this.v = .15;
    }
  };
  Car.prototype.slowdown = function slowdown () {
    if (this.v > 0) {
      this.v -= .002;
      if (this.v < 0) {
        this.v = 0;
      }
    } else {
      this.v += .002;
      if (this.v > 0) {
        this.v = 0;
      }
    }
  };
  Car.prototype.brake = function brake () {
    if (this.v > 0) {
      this.v -= .005;
    } else {
      this.v -= .001;
    }
    if (this.v < -.05) {
      this.v = -.05;
    }
  };
  Car.prototype.render = function render () {
    if (this.v === 0) {
      return;
    }
    this.x += this.v * Math.cos(this.dir * Math.PI/180 + this.facing);
    this.y += this.v * Math.sin(this.dir * Math.PI/180 + this.facing);

    this.facing = Math.atan2(this.y - this.y2, this.x - this.x2);

    this.x2 = this.x - Math.cos(this.facing) * this.wheelbase;
    this.y2 = this.y - Math.sin(this.facing) * this.wheelbase;

    this.x3 = this.x2 - Math.cos(this.facing) * (this.length - this.wheelbase) / 2;
    this.y3 = this.y2 - Math.sin(this.facing) * (this.length - this.wheelbase) / 2;

    this.el.style.transform = "translate(" + (this.x) + "rem, " + (this.y) + "rem) rotate(" + (this.facing * 180/Math.PI + 90) + "deg)";

    this.trailer.render();
  };
  Car.prototype.turnRight = function turnRight () {
    this.dir += 1;
    if (this.dir > 40) {
      this.dir = 40;
    }
    this.frontleft.rotate(this.dir);
    this.frontright.rotate(this.dir);
  };
  Car.prototype.turnLeft = function turnLeft () {
    this.dir -= 1;
    if (this.dir < -40) {
      this.dir = -40;
    }
    this.frontleft.rotate(this.dir);
    this.frontright.rotate(this.dir);
  };

  var car = new Car({
    x: 0,
    y: 0,
    length: 5,
    width: 2,
    wheelbase: 3
  }, {
    diameter: .5,
    width: .25
  }, {
    x: 0,
    width: 2,
    length: 5,
    shaftLength: 1
  }, {
    diameter: .5,
    width: .25
  });

  var container = el('container', car);
  var keydown = {};
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var cx = window.innerWidth / 2;
  var cy = window.innerHeight / 2;

  mount(document.body, canvas);
  mount(document.body, container);

  window.addEventListener('keydown', onKeydown);
  window.addEventListener('keyup', onKeyup);

  function onKeydown (e) {
    keydown[e.which] = true;
  }

  function onKeyup (e) {
    keydown[e.which] = false;
  }

  function gameLoop () {
    if (keydown[38]) {
      car.accelerate();
    }
    if (keydown[40]) {
      car.brake();
    }
    if (!keydown[38] && !keydown[40]) {
      car.slowdown();
    }
    if (keydown[39]) {
      car.turnRight();
    }
    if (keydown[37]) {
      car.turnLeft();
    }
    setTimeout(gameLoop, 1000 / 60);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('touchstart', onMousedown);

  function onMousedown (e) {
    var start = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    }

    window.addEventListener('touchmove', onMousemove);
    window.addEventListener('touchend', onMouseup);

    function onMousemove (e) {
      var current = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      }

      if (current.y < start.y) {
        keydown[38] = true;
      } else {
        keydown[38] = false;
      }
      if (current.y > start.y) {
        keydown[40] = true;
      } else {
        keydown[40] = false;
      }
      if (current.x < start.x) {
        keydown[37] = true;
      } else {
        keydown[37] = false;
      }
      if (current.x > start.x) {
        keydown[39] = true;
      } else {
        keydown[39] = false;
      }
    }

    function onMouseup () {
      keydown[37] = keydown[38] = keydown[39] = keydown[40] = false;
      window.removeEventListener('touchmove', onMousemove);
      window.removeEventListener('touchend', onMouseup);
    }
  }

  onResize();

  function onResize () {
    cx = window.innerWidth / 2;
    cy = window.innerHeight / 2;
    canvas.width = cx * 2;
    canvas.height = cy * 2;
    ctx.fillStyle = '#ddd';
  }

  function renderLoop () {
    car.render();
    ctx.fillRect(cx + (car.x - car.width / 2) * 16, cy + car.y * 16, 1, 1);
    ctx.fillRect(cx + (car.x + car.width / 2) * 16, cy + car.y * 16, 1, 1);
    ctx.fillRect(cx + (car.x2 - car.width / 2) * 16, cy + car.y2 * 16, 1, 1);
    ctx.fillRect(cx + (car.x2 + car.width / 2) * 16, cy + car.y2 * 16, 1, 1);
    ctx.fillRect(cx + (car.trailer.x2 - car.width / 2) * 16, cy + car.trailer.y2 * 16, 1, 1);
    ctx.fillRect(cx + (car.trailer.x2 + car.width / 2) * 16, cy + car.trailer.y2 * 16, 1, 1);
    requestAnimationFrame(renderLoop);
  }

  gameLoop();
  renderLoop();

}());