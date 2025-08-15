import { KTX2Loader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath("basis/");

// IMAGE MUST BE DIMENSION OF 4 (128x128, 256x256 and so on. Not 255x250)
export async function loadKtx2(renderer, texturePath) {
  ktx2Loader.detectSupport(renderer);
  return new Promise((resolve, reject) => {
    ktx2Loader.load(
      texturePath,
      function (texture) {
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.generateMipmaps = false;
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}
