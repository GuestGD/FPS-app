import * as THREE from "three";

const audioPaths = {
  soldierAttack: "assets/sounds/soldierAttack.mp3",
  mutantAttack: "assets/sounds/mutantAttack.mp3",
  zombieAttack: "assets/sounds/mutantAttack.mp3",
};

const sameAudioLimit = 4;

export async function manageAudio(scene, camera) {
  const audioSources = {};

  const audioLoader = new THREE.AudioLoader();

  const listener = new THREE.AudioListener();
  camera.add(listener);

  const loadPromises = Object.entries(audioPaths).map(([name, path]) => {
    return audioLoader.loadAsync(path).then((buffer) => {
      const unitSourceArr = Array.from({ length: sameAudioLimit }, (e) => {
        const audioSource = new THREE.PositionalAudio(listener);

        if (name.includes("soldier")) {
          audioSource.setRefDistance(600);
          audioSource.setVolume(0.2);
        } else {
          audioSource.setRefDistance(100000);
          audioSource.setVolume(1.0);
          audioSource.setDetune(-1000);
          audioSource.setPlaybackRate(1.5);
        }

        audioSource.setBuffer(buffer);
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

  await Promise.all(loadPromises);

  return { audioSources };
}
