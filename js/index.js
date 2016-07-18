
import { el, mount } from 'frzr';
import { Car } from './car';

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
