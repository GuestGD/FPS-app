import * as THREE from "three";

const audioPaths = {
  soldierAttack: "assets/sounds/soldierAttack.mp3",
  mutantAttack: "assets/sounds/mutantAttack.mp3",
  zombieAttack: "assets/sounds/zombieAttack.mp3",
};

export async function loadSoundAssets(scene, camera) {
  const soundSources = {};
  const audioLoader = new THREE.AudioLoader();

  const listener = new THREE.AudioListener();
  camera.add(listener);

  // Create an array of promises for all sound loads
  const loadPromises = Object.entries(audioPaths).map(([name, path]) => {
    return audioLoader.loadAsync(path).then((buffer) => {
      const audioSource = new THREE.PositionalAudio(listener);
      audioSource.detune = -1000;

      scene.add(audioSource);

      audioSource.setBuffer(buffer);
      audioSource.setRefDistance(2000);
      audioSource.setRolloffFactor(1);
      audioSource.setDistanceModel("inverse");

      soundSources[name] = audioSource;
    });
  });

  // Wait for all sounds to load
  await Promise.all(loadPromises);

  scene.userData.sound = soundSources;
}
