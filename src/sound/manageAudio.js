import * as THREE from "three";

const audioPaths = {
  soldierAttack: "assets/sounds/soldierAttack.mp3",
  mutantAttack: "assets/sounds/mutantAttack.mp3",
  zombieAttack: "assets/sounds/mutantAttack.mp3",
};

const sameAudioLimit = 5;

export async function manageAudio(scene, camera) {
  const audioSources = {};

  const audioLoader = new THREE.AudioLoader();

  const listener = new THREE.AudioListener();
  camera.add(listener);

  // Create an array of promises for all sound loads
  const loadPromises = Object.entries(audioPaths).map(([name, path]) => {
    return audioLoader.loadAsync(path).then((buffer) => {
      const unitSourceArr = Array.from({ length: sameAudioLimit }, (e) => {
        const audioSource = new THREE.PositionalAudio(listener);
        audioSource.detune = -100;

        audioSource.setBuffer(buffer);
        audioSource.setRefDistance(2000);
        audioSource.setVolume(1.0);
        audioSource.setRolloffFactor(1);
        audioSource.setDistanceModel("inverse");

        scene.add(audioSource);

        return audioSource;
      });

      audioSources[name] = {};
      audioSources[name].count = Number(0);
      audioSources[name].src = unitSourceArr;
    });
  });

  // Wait for all sounds to load
  await Promise.all(loadPromises);

  return { audioSources };
}
