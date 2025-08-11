class JoyStick {
  constructor(containerId, options = {}) {
    this.options = {
      title: "joystick",
      width: 200,
      height: 200,
      internalFillColor: "#808080",
      internalLineWidth: 4,
      internalStrokeColor: "#ebf8e1",
      externalLineWidth: 2,
      externalStrokeColor: "#919191",
      autoReturnToCenter: true,
      basicOpacity: 0.65,
      touchedOpacity: 0.45,
      offsetX: 40,
      offsetY: 40,
      ...options,
    };

    this.callback = this.options.callback || function (status) {};

    if (containerId && containerId.startsWith(".")) {
      this.container = document.querySelector(containerId);
    } else {
      this.container = document.getElementById(containerId);
    }

    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = this.options.title + "Container";
      this.container.style.position = "fixed";
      this.container.style.bottom = this.options.offsetY + "px";
      this.container.style.left = this.options.offsetX + "px";
      this.container.style.borderRadius = "50%";
      this.container.style.width = this.options.width + "px";
      this.container.style.height = this.options.height + "px";
      this.container.style.background =
        "radial-gradient(closest-side, #717d83, #ebf8e1, #464646ff)";
      this.container.style.filter = "drop-shadow(0 0 50px #242424ff)";
      this.container.style.transition =
        "opacity 0.22s ease-in, filter 0.12s ease-in";
      this.container.style.opacity = this.options.basicOpacity;
      document.body.appendChild(this.container);
    }

    this.canvas = document.createElement("canvas");
    this.canvas.id = this.options.title;
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.touchAction = "none";
    this.canvas.style.border = "none";
    this.canvas.style.background = "transparent";
    this.container.appendChild(this.canvas);

    this.context = this.canvas.getContext("2d");
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.internalRadius = Math.min(this.centerX, this.centerY) * 0.4 * 0.5;
    this.maxMoveStick = this.internalRadius;
    this.externalRadius = this.internalRadius + 20;

    this.movedX = this.centerX;
    this.movedY = this.centerY;
    this.pressed = false;
    this.activeTouchId = null;

    this.initEvents();
    this.draw();
  }

  initEvents() {
    const handleStart = (e) => {
      if (e.touches) {
        for (let i = 0; i < e.touches.length; i++) {
          if (this.canvas.contains(e.touches[i].target)) {
            this.activeTouchId = e.touches[i].identifier;
            this.pressed = true;
            this.updatePosition(e.touches[i]);
            this.setOpacity(this.options.touchedOpacity);
            this.setShadow("drop-shadow(0 0 20px #6cc4ffff)");
            break;
          }
        }
      } else {
        this.pressed = true;
        this.updatePosition(e);
        this.setOpacity(this.options.touchedOpacity);
        this.setShadow("drop-shadow(0 0 20px #6cc4ffff)");
      }
    };

    const handleMove = (e) => {
      if (this.pressed && this.activeTouchId !== null) {
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === this.activeTouchId) {
            this.updatePosition(e.touches[i]);
            break;
          }
        }
      }
    };

    const handleEnd = (e) => {
      if (e.changedTouches) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.activeTouchId) {
            this.activeTouchId = null;
            this.pressed = false;
            if (this.options.autoReturnToCenter) {
              this.movedX = this.centerX;
              this.movedY = this.centerY;
            }
            this.draw();
            this.callback(this.getStatus());
            this.setOpacity(this.options.basicOpacity);
            this.setShadow("drop-shadow(0 0 12px #ffffff)");
            break;
          }
        }
      } else {
        this.pressed = false;
        if (this.options.autoReturnToCenter) {
          this.movedX = this.centerX;
          this.movedY = this.centerY;
        }
        this.draw();
        this.callback(this.getStatus());
        this.setOpacity(this.options.basicOpacity);
        this.setShadow("drop-shadow(0 0 12px #ffffff)");
      }
    };

    if ("ontouchstart" in document.documentElement) {
      this.canvas.addEventListener("touchstart", handleStart, {
        passive: false,
      });
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd, { passive: false });
      document.addEventListener("touchcancel", handleEnd, { passive: false });
    } else {
      this.canvas.addEventListener("mousedown", handleStart);
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
    }
  }

  updatePosition(e) {
    let x, y;
    if (e.touches) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    } else {
      x = e.pageX;
      y = e.pageY;
    }

    x -= this.canvas.getBoundingClientRect().left;
    y -= this.canvas.getBoundingClientRect().top;

    this.movedX = Math.max(
      this.internalRadius,
      Math.min(this.canvas.width - this.internalRadius, x)
    );
    this.movedY = Math.max(
      this.internalRadius,
      Math.min(this.canvas.height - this.internalRadius, y)
    );

    const dx = this.movedX - this.centerX;
    const dy = this.movedY - this.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.externalRadius) {
      this.movedX = this.centerX + (dx / distance) * this.externalRadius;
      this.movedY = this.centerY + (dy / distance) * this.externalRadius;
    }

    this.draw();
    this.callback(this.getStatus());
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.beginPath();
    this.context.arc(
      this.centerX,
      this.centerY,
      this.externalRadius,
      0,
      Math.PI * 2,
      false
    );
    this.context.lineWidth = this.options.externalLineWidth;
    this.context.strokeStyle = this.options.externalStrokeColor;
    this.context.stroke();

    this.context.beginPath();
    this.context.arc(
      this.movedX,
      this.movedY,
      this.internalRadius,
      0,
      Math.PI * 2,
      false
    );
    this.context.fillStyle = this.options.internalFillColor;
    this.context.fill();
    this.context.lineWidth = this.options.internalLineWidth;
    this.context.strokeStyle = this.options.internalStrokeColor;
    this.context.stroke();
  }

  getStatus() {
    const dx = this.movedX - this.centerX;
    const dy = this.movedY - this.centerY;
    const x = ((dx / this.maxMoveStick) * 100).toFixed();
    const y = ((dy / this.maxMoveStick) * 100).toFixed();
    const direction = this.getCardinalDirection(dx, dy);

    const isActive = Math.abs(x) > 0 || Math.abs(y) > 0;

    return { x, y, direction, isActive };
  }

  getCardinalDirection(dx, dy) {
    let angle = Math.atan2(dx, -dy);
    angle = (angle + Math.PI / 4 + 2 * Math.PI) % (2 * Math.PI);
    const directions = ["NW", "N", "NE", "E", "SE", "S", "SW", "W"];
    const index = Math.round(angle / (Math.PI / 4)) % 8;
    return directions[index];
  }

  setOpacity(opacity) {
    this.container.style.opacity = opacity.toString();
  }

  setShadow(filter) {
    this.container.style.filter = filter;
  }
}

export { JoyStick };

// Example:
//   const joystick = new JoyStick(null, {
//     title: "joystick",
//     width: 200,
//     height: 200,
//     internalFillColor: "#808080",
//     internalLineWidth: 4,
//     internalStrokeColor: "#ebf8e1",
//     externalLineWidth: 2,
//     externalStrokeColor: "#919191",
//     autoReturnToCenter: true,
//     basicOpacity: 0.65,
//     touchedOpacity: 0.45,
//     offsetX: 40,
//     offsetY: 40,
//     callback: (e) => {
//       console.log("Joystick Status:", e);
//     },
//   });
