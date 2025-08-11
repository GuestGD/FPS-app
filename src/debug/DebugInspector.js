import * as THREE from "three";

class DebugInspector {
  constructor(renderer, fontSize = 12) {
    if (!renderer || !(renderer instanceof THREE.WebGLRenderer)) {
      console.error("Invalid renderer provided to DrawCallsInspector.");
      return;
    }

    this.renderer = renderer;
    this.fontSize = fontSize || 12;

    // --- FPS bookkeeping ---
    this._lastTime = performance.now();
    this._frames = 0;
    this._fps = 0;

    // --- RAM bookkeeping ---
    if (performance.memory) {
      // Chrome / Edge only
      this._memorySupport = true;
      this._memory = performance.memory;
    } else {
      this._memorySupport = false;
    }

    this.domElement = document.createElement("div");
    Object.assign(this.domElement.style, {
      position: "absolute",
      top: "10px",
      left: "10px",
      color: "#fff",
      fontFamily: "monospace",
      fontSize: `${this.fontSize}px`,
      padding: "5px 8px",
      background: "rgba(0,0,0,0.5)",
      borderRadius: "4px",
      userSelect: "none",
      zIndex: "10000",
    });

    document.body.appendChild(this.domElement);
  }

  update() {
    if (!this.renderer || !(this.renderer instanceof THREE.WebGLRenderer)) {
      console.error("Renderer is no longer valid.");
      return;
    }

    // --- FPS calc every second ---
    const now = performance.now();
    this._frames++;
    if (now >= this._lastTime + 1000) {
      this._fps = Math.round((this._frames * 1000) / (now - this._lastTime));
      this._frames = 0;
      this._lastTime = now;
    }

    // --- Memory (MB) ---
    let ram = "N/A";
    if (this._memorySupport) {
      ram = (this._memory.usedJSHeapSize / 1048576).toFixed(1) + " MB";
    }

    const { calls, triangles } = this.renderer.info.render;

    this.domElement.innerHTML = `
      <div>Draw Calls: ${calls}</div>
      <div>Triangles: ${triangles}</div>
      <div>FPS: ${this._fps}</div>
      <div>RAM: ${ram}</div>
      <div>DevPixRatio: ${window.devicePixelRatio}</div>
    `;
  }
}

export { DebugInspector };
