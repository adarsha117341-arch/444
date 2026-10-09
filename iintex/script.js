class ImageSlider {
  constructor(root) {
    this.root = root;
    this.slides = [...root.querySelectorAll('.slide')];
    this.count = this.slides.length;
    this.index = 1;          // 1 because a clone of the last slide sits at position 0
    this.isMoving = false;

    this.build();
    this.bindEvents();
    this.update(false);
  }

  build() {
    this.viewport = document.createElement('div');
    this.viewport.className = 'slider-viewport';
    this.track = document.createElement('div');
    this.track.className = 'slider-track';

    // Clones at both ends make the infinite loop possible
    const firstClone = this.slides[0].cloneNode(true);
    const lastClone = this.slides[this.count - 1].cloneNode(true);
    this.track.append(lastClone, ...this.slides, firstClone);
    this.viewport.appendChild(this.track);

    this.prevBtn = this.createButton('prev', '‹', 'Previous slide');
    this.nextBtn = this.createButton('next', '›', 'Next slide');

    this.dotsWrap = document.createElement('div');
    this.dotsWrap.className = 'slider-dots';
    this.dots = this.slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      this.dotsWrap.appendChild(dot);
      return dot;
    });

    this.root.append(this.viewport, this.prevBtn, this.nextBtn, this.dotsWrap);
  }

  createButton(type, label, aria) {
    const btn = document.createElement('button');
    btn.className = `slider-btn ${type}`;
    btn.textContent = label;
    btn.setAttribute('aria-label', aria);
    return btn;
  }

  bindEvents() {
    this.nextBtn.addEventListener('click', () => this.goTo(this.index + 1));
    this.prevBtn.addEventListener('click', () => this.goTo(this.index - 1));
    this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.goTo(i + 1)));
    this.track.addEventListener('transitionend', (e) => this.onTransitionEnd(e));
  }

  goTo(target) {
    if (this.isMoving || target === this.index) return;
    this.isMoving = true;
    this.index = target;
    this.update(true);
  }

  update(animate) {
    this.track.style.transition = animate ? '' : 'none';
    this.track.style.transform = `translateX(-${this.index * 100}%)`;

    const real = ((this.index - 1) % this.count + this.count) % this.count;
    this.dots.forEach((dot, i) => dot.classList.toggle('active', i === real));
  }

  // After sliding onto a clone, silently jump to the real slide
  onTransitionEnd(e) {
    if (e.target !== this.track || e.propertyName !== 'transform') return;

    if (this.index === this.count + 1) this.index = 1;
    else if (this.index === 0) this.index = this.count;
    else { this.isMoving = false; return; }

    this.update(false);
    this.track.offsetWidth;   // force reflow so the jump is not animated
    this.track.style.transition = '';
    this.isMoving = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ImageSlider(document.getElementById('slider'));
});