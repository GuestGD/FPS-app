import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/Addons.js";

export async function loadSkybox(scene, skyboxURL) {
  return new Promise((resolve, reject) => {
    new RGBELoader()
      .setDataType(THREE.FloatType )
      .load(skyboxURL, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        scene.background = texture;
        scene.environment = texture;

        resolve(texture);
      });
  });
}
