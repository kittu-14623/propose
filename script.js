
let highestZ = 1;

class Paper {
  holdingPaper = false;
  touchId = null;
  mouseTouchX = 0;
  mouseTouchY = 0;
  mouseX = 0;
  mouseY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    document.addEventListener('mousemove', (e) => {
      if(!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }
        
      const dirX = e.clientX - this.mouseTouchX;
      const dirY = e.clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if(this.rotating) {
        this.rotation = degrees;
      }

      if(this.holdingPaper) {
        if(!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    })

    // Touchmove: support dragging with one finger and rotating with two fingers
    document.addEventListener('touchmove', (e) => {
      let primaryTouch = null;
      if(!this.rotating) {
        if(this.touchId != null) {
          for(const t of e.touches) { if(t.identifier === this.touchId) { primaryTouch = t; break; } }
        }
        if(!primaryTouch) primaryTouch = e.touches[0];

        if(primaryTouch) {
          this.mouseX = primaryTouch.clientX;
          this.mouseY = primaryTouch.clientY;
          this.velX = this.mouseX - this.prevMouseX;
          this.velY = this.mouseY - this.prevMouseY;
        }
      }

      if(e.touches.length >= 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dirX = t1.clientX - t0.clientX;
        const dirY = t1.clientY - t0.clientY;
        const angle = Math.atan2(dirY, dirX);
        let degrees = 180 * angle / Math.PI;
        degrees = (360 + Math.round(degrees)) % 360;
        if(this.rotating) this.rotation = degrees;
      } else {
        const dirX = this.mouseX - this.mouseTouchX;
        const dirY = this.mouseY - this.mouseTouchY;
        const dirLength = Math.sqrt(dirX*dirX+dirY*dirY) || 1;
        const dirNormalizedX = dirX / dirLength;
        const dirNormalizedY = dirY / dirLength;
        const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
        let degrees = 180 * angle / Math.PI;
        degrees = (360 + Math.round(degrees)) % 360;
        if(this.rotating) this.rotation = degrees;
      }

      if(this.holdingPaper) {
        if(!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }

      if(this.holdingPaper || this.rotating) e.preventDefault();
    }, {passive:false});

    paper.addEventListener('mousedown', (e) => {
      if(this.holdingPaper) return; 
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;
      
      if(e.button === 0) {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      if(e.button === 2) {
        this.rotating = true;
      }
    });

    // Touchstart: start drag (one finger) or rotate (two fingers)
    paper.addEventListener('touchstart', (e) => {
      if(e.touches.length >= 2) {
        this.rotating = true;
        this.holdingPaper = true;
        this.touchId = null;
        paper.style.zIndex = highestZ;
        highestZ += 1;
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const angle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);
        let degrees = 180 * angle / Math.PI;
        this.rotation = (360 + Math.round(degrees)) % 360;
      } else {
        const touch = e.touches[0];
        if(this.holdingPaper) return;
        this.holdingPaper = true;
        this.touchId = touch.identifier;
        paper.style.zIndex = highestZ;
        highestZ += 1;
        this.mouseTouchX = touch.clientX;
        this.mouseTouchY = touch.clientY;
        this.prevMouseX = touch.clientX;
        this.prevMouseY = touch.clientY;
      }
    }, {passive:false});
    window.addEventListener('mouseup', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });

    window.addEventListener('touchend', (e) => {
      if(e.touches.length === 0) {
        this.holdingPaper = false;
        this.rotating = false;
        this.touchId = null;
      } else if(e.touches.length === 1) {
        this.rotating = false;
        const t = e.touches[0];
        this.touchId = t.identifier;
        this.prevMouseX = t.clientX;
        this.prevMouseY = t.clientY;
        this.mouseX = t.clientX;
        this.mouseY = t.clientY;
      }
    });

    paper.addEventListener('contextmenu', (e) => { e.preventDefault(); });
  }
}

const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});
