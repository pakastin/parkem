
import { el } from 'frzr';

export class Wheel {
  constructor ({ x, y, diameter, width }) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.width = width;
    this.el = el('wheel', { style: `left: ${x}rem; top: ${y}rem;` },
      el('graphic', { style: `width: ${width}rem; height: ${diameter}rem` })
    );
  }
  rotate(deg) {
    this.el.style.transform = `rotate(${deg}deg)`
  }
}
