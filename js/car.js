
import { el } from 'frzr';
import { Wheel } from './wheel';
import { Trailer } from './trailer';

export class Car {
  constructor ({ x, y, width, wheelbase, length }, wheelParams, trailerParams, trailerWheelParams) {
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

    this.el = el('car', { style: `transform: translate(${x}rem, ${y}rem)`},
      this.frontleft = el(Wheel, { x: -this.width/2, y: 0, ...wheelParams }),
      this.frontright = el(Wheel, { x: this.width/2, y: 0, ...wheelParams }),
      this.backleft = el(Wheel, { x: -this.width/2, y: wheelbase, ...wheelParams }),
      this.backright = el(Wheel, { x: this.width/2, y: wheelbase, ...wheelParams }),
      el('graphic', { style: `width: ${width}rem; height: ${length}rem; top: ${this.wheelbase/2}rem` },
        el('windshield'),
        el('windshield-back')
      ),
      this.trailer = new Trailer(this, { ...trailerParams, y: wheelbase/2 + length / 2 }, trailerWheelParams)
    );
  }
  accelerate () {
    if (this.v < 0) {
      this.v += .005;
    } else {
      this.v += .002;
    }
    if (this.v > .15) {
      this.v = .15;
    }
  }
  slowdown () {
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
  }
  brake () {
    if (this.v > 0) {
      this.v -= .005;
    } else {
      this.v -= .001;
    }
    if (this.v < -.05) {
      this.v = -.05;
    }
  }
  render () {
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

    this.el.style.transform = `translate(${this.x}rem, ${this.y}rem) rotate(${this.facing * 180/Math.PI + 90}deg)`;

    this.trailer.render();
  }
  turnRight () {
    this.dir += 1;
    if (this.dir > 40) {
      this.dir = 40;
    }
    this.frontleft.rotate(this.dir);
    this.frontright.rotate(this.dir);
  }
  turnLeft () {
    this.dir -= 1;
    if (this.dir < -40) {
      this.dir = -40;
    }
    this.frontleft.rotate(this.dir);
    this.frontright.rotate(this.dir);
  }
}

function deg2rad (deg) {
  return deg * Math.PI / 180;
}