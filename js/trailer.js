
import { el } from 'frzr';
import { Wheel } from './wheel';

export class Trailer {
  constructor (car, { x, y, width, length, shaftLength }, wheelParams) {
    this.car = car;
    this.x = car.x3;
    this.y = car.y3;
    this.x2 = this.x;
    this.y2 = this.y + shaftLength + length / 2;
    this.width = width;
    this.length = length;
    this.shaftLength = shaftLength;
    this.facing = Math.PI / 2;

    this.el = el('trailer', { style: `left: ${x}rem; top: ${y}rem;` },
      el(Wheel, {x: -width/2, y: shaftLength + length/2, ...wheelParams}),
      el(Wheel, {x: width/2, y: shaftLength + length/2, ...wheelParams}),
      el('shaft', { style: `width: .2rem; height: ${shaftLength}rem; top: ${shaftLength / 2}rem;` }),
      el('graphic', { style: `top: ${shaftLength + length / 2}rem; width: ${width}rem; height: ${length}rem;` })
    );
  }
  render () {
    this.x = this.car.x3;
    this.y = this.car.y3;
    this.facing = Math.atan2(this.y - this.y2, this.x - this.x2);
    this.x2 = this.x - Math.cos(this.facing) * (this.length / 2 + this.shaftLength);
    this.y2 = this.y - Math.sin(this.facing) * (this.length / 2 + this.shaftLength);

    this.el.style.transform = `rotate(${(this.facing - this.car.facing) * 180/Math.PI}deg)`;
  }
}
