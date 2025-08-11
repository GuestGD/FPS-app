import * as THREE from 'three';

export class MobileCameraRotator {
  constructor(options) {
    if (!options || typeof options !== 'object') {
      console.warn('MobileCameraRotator: Options object is required');
      return;
    }

    if (!options.camera || !(options.camera instanceof THREE.Camera)) {
      console.warn('MobileCameraRotator: A valid THREE.Camera instance is required');
      return;
    }

    if (!options.rotationArea || !(options.rotationArea instanceof HTMLElement)) {
      console.warn('MobileCameraRotator: A valid DOM element is required for rotationArea');
      return;
    }

    // If any required component is missing, don't initialize
    if (!options.camera || !options.rotationArea) {
      this.isValid = false;
      return;
    }

    // Required options
    this.camera = options.camera;
    this.rotationArea = options.rotationArea;
    this.isValid = true;
    
    // Configuration with defaults
    this.rotationSpeed = options.rotationSpeed || 0.01;
    this.inertiaFactor = options.inertiaFactor || 0.003;
    this.pitchLimit = options.pitchLimit || Math.PI / 2;
    
    // Internal state
    this.yaw = 0;
    this.pitch = 0;
    this.isTouching = false;
    this.activeTouchId = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    
    // Inertia state
    this.tiltState = {
      velocityX: 0,
      velocityY: 0,
      isMoving: false,
      lastInputTime: 0,
      damping: options.damping || 0.95
    };
    
    // Bind methods
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.update = this.update.bind(this);
    
    // Initialize
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    if (!this.isValid) return;
    
    try {
      this.rotationArea.addEventListener('touchstart', this.onTouchStart, { passive: false });
      this.rotationArea.addEventListener('touchmove', this.onTouchMove, { passive: false });
      this.rotationArea.addEventListener('touchend', this.onTouchEnd, { passive: false });
    } catch (error) {
      console.warn('MobileCameraRotator: Failed to setup event listeners', error);
      this.isValid = false;
    }
  }
  
  cleanupEventListeners() {
    if (!this.isValid || !this.rotationArea) return;
    
    try {
      this.rotationArea.removeEventListener('touchstart', this.onTouchStart);
      this.rotationArea.removeEventListener('touchmove', this.onTouchMove);
      this.rotationArea.removeEventListener('touchend', this.onTouchEnd);
    } catch (error) {
      console.warn('MobileCameraRotator: Error while cleaning up event listeners', error);
    }
  }
  
  onTouchStart(e) {
    if (!this.isValid) return;
    
    try {
      const rect = this.rotationArea.getBoundingClientRect();
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          this.touchStartX = touch.clientX;
          this.touchStartY = touch.clientY;
          this.isTouching = true;
          this.activeTouchId = touch.identifier;
          break;
        }
      }
    } catch (error) {
      console.warn('MobileCameraRotator: Error in touch start handler', error);
      this.isTouching = false;
    }
  }
  
  onTouchMove(e) {
    if (!this.isValid || !this.isTouching) return;
    
    try {
      // Find our active touch
      let activeTouch;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.activeTouchId) {
          activeTouch = e.touches[i];
          break;
        }
      }
      
      if (!activeTouch) return;
      
      const touchEndX = activeTouch.clientX;
      const touchEndY = activeTouch.clientY;
      
      this.deltaX = touchEndX - this.touchStartX;
      this.deltaY = touchEndY - this.touchStartY;
      
      this.rotateCamera(this.deltaX, this.deltaY);
      
      this.touchStartX = touchEndX;
      this.touchStartY = touchEndY;
      
      // Update inertia
      this.tiltState.velocityX += this.deltaX * this.rotationSpeed * this.inertiaFactor;
      this.tiltState.velocityY += this.deltaY * this.rotationSpeed * this.inertiaFactor;
      this.tiltState.isMoving = true;
      this.tiltState.lastInputTime = performance.now();
    } catch (error) {
      console.warn('MobileCameraRotator: Error in touch move handler', error);
      this.isTouching = false;
    }
  }
  
  onTouchEnd() {
    if (!this.isValid) return;
    
    try {
      this.isTouching = false;
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.activeTouchId = null;
    } catch (error) {
      console.warn('MobileCameraRotator: Error in touch end handler', error);
    }
  }
  
  rotateCamera(deltaX, deltaY) {
    if (!this.isValid) return;
    
    try {
      // Update rotation angles
      this.yaw -= deltaX * this.rotationSpeed;
      this.pitch = Math.max(
        -this.pitchLimit,
        Math.min(this.pitchLimit, this.pitch - deltaY * this.rotationSpeed)
      );
      
      // Create fresh orientation
      const rotation = new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw)
        .multiply(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            this.pitch
          )
        );
      
      // Apply to camera
      this.camera.quaternion.copy(rotation);
    } catch (error) {
      console.warn('MobileCameraRotator: Error rotating camera', error);
    }
  }
  
  update() {
    if (!this.isValid || !this.tiltState.isMoving) return;
    
    try {
      const now = performance.now();
      const deltaTime = Math.min(100, now - this.tiltState.lastInputTime) / 1000;
      this.tiltState.lastInputTime = now;
      
      if (!this.isTouching) {
        // Apply inertia
        this.rotateCamera(
          this.tiltState.velocityX / deltaTime,
          this.tiltState.velocityY / deltaTime
        );
        
        // Apply damping
        this.tiltState.velocityX *= this.tiltState.damping;
        this.tiltState.velocityY *= this.tiltState.damping;
        
        // Stop when velocity is very small
        if (Math.abs(this.tiltState.velocityX) < 0.01 && Math.abs(this.tiltState.velocityY) < 0.01) {
          this.tiltState.velocityX = 0;
          this.tiltState.velocityY = 0;
          this.tiltState.isMoving = false;
        }
      }
    } catch (error) {
      console.warn('MobileCameraRotator: Error in update', error);
      this.tiltState.isMoving = false;
    }
  }
  
  dispose() {
    this.cleanupEventListeners();
    this.isValid = false;
  }
}

// Example: 
// 
// const rotator = new MobileCameraRotator({
//   camera: yourCamera,
//   rotationArea: document.querySelector('.mobile-rotation-area'),
//   rotationSpeed: 0.01,
//   inertiaFactor: 0.003,
//   pitchLimit: Math.PI / 2,
//   damping: 0.95
// });