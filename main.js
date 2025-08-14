import * as THREE from "three";

import { setupScene } from "./src/setupScene";
import { updateControls } from "./src/setupControls";
import { DebugInspector } from "./src/debug/DebugInspector";
import "./src/styles/main.css";

const clock = new THREE.Clock();

const { scene, camera, renderer, batchedEnemies } = await setupScene();

const inspector = new DebugInspector(renderer, 12);

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Debug updates
  inspector.update();

  // Game logic updates
  updateControls(scene);

  // if (batchedEnemies) {
    batchedEnemies.update(camera);
    batchedEnemies.material.update.updateAnimations(delta);
  // }

  renderer.render(scene, camera);
}

animate();
