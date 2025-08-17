import * as THREE from "three";

import { setupScene } from "./src/setupScene";
import { updateControls } from "./src/setupControls";
import { DebugInspector } from "./src/debug/DebugInspector";
import "./src/styles/main.css";

const clock = new THREE.Clock();

const { scene, camera, renderer, batchedEnemies } = await setupScene();

const inspector = new DebugInspector(renderer, 12);

let lastLogTime = 0;

function animate() {
  requestAnimationFrame(animate);

  const start = performance.now();

  const delta = clock.getDelta();

  // Debug updates
  inspector.update();

  // Game logic updates
  updateControls(scene);

  if (batchedEnemies) {
    batchedEnemies.update(camera);
    batchedEnemies.material.updateAnimations(delta);
  }

  renderer.render(scene, camera);

  const end = performance.now();

  if (end - lastLogTime >= 1000) {
    console.log(end - start);
    lastLogTime = end;
  }
}

animate();
