import * as THREE from "three";
import { setupControls } from "./setupControls";
import { loadSkybox } from "./loadSkybox";
import { loadKtx2 } from "./loadKtx2";
import { createEnemies } from "./batchedMesh/createEnemies";
import { isMobile } from "./mobileControls/isMobile";
import { setupLilGui } from "./debug/setupLilGui";

export async function setupScene() {
  // ==============================================
  //   SELECT ENEMIES AMOUNT FIRST
  // ==============================================
  const { instancesPerUnit, pixelRatio } = await setupLilGui();

  // ==============================================
  //   SCENE SETUP
  // ==============================================
  const scene = new THREE.Scene();
  scene.backgroundIntensity = 1.0;

  // ==============================================
  //   CAMERA SETUP
  // ==============================================
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100000
  );

  camera.position.y += 200;
  camera.position.z += 10000;

  // ==============================================
  //   RENDERER SETUP
  // ==============================================
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    reverseDepthBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setPixelRatio(
    isMobile() ? pixelRatio : devicePixelRatio
  );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  document.body.onresize = (e) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight, false);

    renderer.domElement.style.width = window.innerWidth + "px";
    renderer.domElement.style.height = window.innerHeight + "px";
  };

  // ==============================================
  //   CONTROLS SETUP
  // ==============================================
  setupControls(camera, renderer);

  // ==============================================
  //   TERRAIN SETUP
  // ==============================================

  const skybox = await loadSkybox(scene, "assets/hdrSkybox/skybox1k.hdr");

  const groundSize = Math.max(500 * instancesPerUnit, 50000);
  const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);

  const repeatValue = Math.max(1 * instancesPerUnit, 50);

  const groundDiff = await loadKtx2(renderer, "assets/groundDiff.ktx2");
  groundDiff.colorSpace = THREE.SRGBColorSpace;
  groundDiff.wrapS = THREE.RepeatWrapping;
  groundDiff.wrapT = THREE.RepeatWrapping;
  groundDiff.repeat.set(repeatValue, repeatValue);

  const groundNorm = await loadKtx2(renderer, "assets/groundNorm.ktx2");
  groundNorm.colorSpace = THREE.NoColorSpace;
  groundNorm.wrapS = THREE.RepeatWrapping;
  groundNorm.wrapT = THREE.RepeatWrapping;
  groundNorm.repeat.set(repeatValue, repeatValue);

  const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundDiff,
    normalMap: groundNorm,
    normalScale: new THREE.Vector2(1, 1).multiplyScalar(1.1),
    side: THREE.FrontSide,
    transparent: false,
  });

  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.position.y -= 100;
  groundMesh.setRotationFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    THREE.MathUtils.degToRad(-90)
  );
  scene.add(groundMesh);

  // ==============================================
  //   ENEMIES SETUP
  // ==============================================

  const { batchedEnemies } = await createEnemies(
    scene,
    renderer,
    instancesPerUnit
  );

  // Temp

  scene.userData.camera = camera;

  return { scene, camera, renderer, batchedEnemies };
}
