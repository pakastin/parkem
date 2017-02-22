
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
  if (car.thrusting == null && !keydown[38] && !keydown[40]) {
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
window.addEventListener('mousedown', onMousedown);
window.addEventListener('touchstart', onMousedown);

function onMousedown (e) {
  e.preventDefault();

  var start = {
    x: e.touches ? e.touches[0].pageX : e.pageX,
    y: e.touches ? e.touches[0].pageY : e.pageY
  }

  window.addEventListener('mousemove', onMousemove);
  window.addEventListener('mouseup', onMouseup);
  window.addEventListener('touchmove', onMousemove);
  window.addEventListener('touchend', onMouseup);

  function onMousemove (e) {
    var current = {
      x: e.touches ? e.touches[0].pageX : e.pageX,
      y: e.touches ? e.touches[0].pageY : e.pageY
    }
    var delta = {
      x: current.x - start.x,
      y: start.y - current.y
    }

    if (delta.y > 0) {
      car.thrust(delta.y / (window.innerHeight / 4));
    } else if (delta.y < 0) {
      car.thrust(delta.y / (window.innerHeight / 4));
    } else {
      car.slowdown();
    }
    if (delta.x < 0) {
      car.turn(delta.x / (window.innerWidth / 4));
    } else if (delta.x > 0) {
      car.turn(delta.x / (window.innerWidth / 4));
    } else {
      car.dir = 0;
      car.turn();
    }
  }

  function onMouseup () {
    car.slowdown();
    keydown[37] = keydown[38] = keydown[39] = keydown[40] = false;
    window.removeEventListener('mousemove', onMousemove);
    window.removeEventListener('mouseup', onMouseup);
    window.removeEventListener('touchmove', onMousemove);
    window.removeEventListener('touchend', onMouseup);
  }
}

var rem = 16;

onResize();

function onResize () {
  cx = window.innerWidth / 2;
  cy = window.innerHeight / 2;

  if (cx <= 400) {
    rem = 8;
  } else {
    rem = 16;
  }

  canvas.width = cx * 2;
  canvas.height = cy * 2;

  ctx.fillStyle = '#ddd';
}

function renderLoop () {
  car.render();
  ctx.fillRect(cx + (car.x - car.width / 2) * rem, cy + car.y * rem, 1, 1);
  ctx.fillRect(cx + (car.x + car.width / 2) * rem, cy + car.y * rem, 1, 1);
  ctx.fillRect(cx + (car.x2 - car.width / 2) * rem, cy + car.y2 * rem, 1, 1);
  ctx.fillRect(cx + (car.x2 + car.width / 2) * rem, cy + car.y2 * rem, 1, 1);
  ctx.fillRect(cx + (car.trailer.x2 - car.width / 2) * rem, cy + car.trailer.y2 * rem, 1, 1);
  ctx.fillRect(cx + (car.trailer.x2 + car.width / 2) * rem, cy + car.trailer.y2 * rem, 1, 1);
  requestAnimationFrame(renderLoop);
}

gameLoop();
renderLoop();
