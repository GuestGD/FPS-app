import { PointerLockControls } from "three/examples/jsm/Addons.js";
import { JoyStick } from "./mobileControls/Joystick";
import { MobileCameraRotator } from "./mobileControls/MobileCameraRotator";
import { isMobile } from "./mobileControls/isMobile";
import * as THREE from "three";

const keys = {};
let joystick, joyData, cameraRotator, pointerLock, mobileDevice;
const speed = 25;

export function setupControls(camera, renderer) {
  mobileDevice = isMobile();

  pointerLock = new PointerLockControls(camera, renderer.domElement);

  document.body.onclick = () => {
    pointerLock.lock();

    if (mobileDevice) {
      document.body.requestFullscreen();
    }
  };

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */

  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  if (mobileDevice) {
    joystick = new JoyStick(null, {
      title: "joystick",
      width: 120,
      height: 120,
      internalFillColor: "#808080",
      internalLineWidth: 4,
      internalStrokeColor: "#ebf8e1",
      externalLineWidth: 2,
      externalStrokeColor: "#919191",
      autoReturnToCenter: true,
      basicOpacity: 0.65,
      touchedOpacity: 0.45,
      offsetX: 50,
      callback: (e) => {},
    });

    cameraRotator = new MobileCameraRotator({
      camera: camera,
      rotationArea: document.querySelector(".mobile-rotation-area"),
      rotationSpeed: 0.01,
      inertiaFactor: 0.003,
      pitchLimit: Math.PI / 2,
      damping: 0.95,
    });
  }

  return {};
}

export function updateControls(scene) {
  if (!pointerLock) return;

  if (joystick) {
    joyData = joystick.getStatus();
  }

  if (joyData && joyData.isActive) {
    const x = parseInt(joyData.x) / 100;
    const y = parseInt(joyData.y) / 100;

    pointerLock.moveForward(-y * speed);
    pointerLock.moveRight(x * speed);
  }

  if (cameraRotator) cameraRotator.update();

  if (keys["KeyW"]) {
    pointerLock.moveForward(speed);
  }
  if (keys["KeyS"]) {
    pointerLock.moveForward(-speed);
  }
  if (keys["KeyD"]) {
    pointerLock.moveRight(speed);
  }
  if (keys["KeyA"]) {
    pointerLock.moveRight(-speed);
  }

  // TESTS
  // const material = scene.userData.material;
  // const camera = scene.userData.camera;
  // const mesh = scene.userData.material.batchedMesh;

  if (keys["KeyR"]) {
    const soundSource = scene.userData.sound;

    const pickRand = Math.ceil(Math.random() * 2);
    const sound = Object.values(soundSource)[2];
    if (!sound.isPlaying) {
      sound.play();
    }
  }
}
