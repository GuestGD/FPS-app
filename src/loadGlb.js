import { GLTFLoader, DRACOLoader } from "three/examples/jsm/Addons.js";

const draco = new DRACOLoader();
draco.setDecoderPath("draco/gltf/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(draco);

export async function loadGlb(scene, gltfPath) {
  const gltf = await new Promise((resolve, reject) => {
    gltfLoader.load(gltfPath, resolve, null, reject);
  });
  
  return gltf.scene;
}
