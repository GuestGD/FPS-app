<!-- omit in toc -->

# 🚀 threeSBML

> **Three js batched mesh animations + lod system.**

---

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [How to import animations](#-how-to-import-animations)
- [Material available methods](#-material-methods)
- [Batched mesh available methods](#-mesh-methods)
- [Usage Examples](#-usage-examples)
- [Demo installation](#-demo-installation)

---

## ✨ Features

- Individual units independent animation while each unit is just an instance of one batched mesh
- Create custom events linked to a certain animation frame
- Create any custom logic based on distance from a unit or it's state (alive, dead, injured, etc.)
- Animation LOD - set distance threshold to make animation simpler reducing gpu work
- Geometry LOD - set distance threshold to use simpler geometry seamlessly while preserving a current animation frame
- Use texture arrays to set textures for each unit type inside a shader efficiently
- One material supports up to 7 unit types with any amount of instances for each (browser available RAM is a limit)

---

## 🏁 Quick Start

1. Export a character's animations using [Blender addon](https://github.com/GuestGD/AnimationFrameExporter)

2. Put BatchedMeshLod.js and SkinnedBatchMaterial.js into your project manually or install using:

```bash
npm i @guestgd/three-sbml

```

3. Import both scripts:

```js
import { SkinnedBatchMaterial } from "./SkinnedBatchMaterial.js";
import { BatchedMeshLod } from "./BatchedMeshLod.js";
```

4. Load every character animations from it's bin file:

```js
export async function loadBinArray(binPath) {
  const response = await fetch(binPath);
  const buffer = await response.arrayBuffer();
  return new Float32Array(buffer);
}
```

5. Load skinned mesh glb

6. Load texture maps of the characters. The maps must be combined to DataArrayTexture or CompressedArrayTexture. KTX2 CompressedArrayTexture is recommended. Here is an example of [KTX-Software](https://github.com/KhronosGroup/KTX-Software) command to create ready to use CompressedArrayTexture with diffuse maps for 3 characters:

```bash
ktx create --format R8G8B8_UNORM --layers 3 --assign-tf linear --encode basis-lz --generate-mipmap --mipmap-filter box difuseEnemy1.png difuseEnemy2.png difuseEnemy3.png enemiesDiffArray.ktx2
```

### IMPORTANT! Use 8 bit maps. WebGL extensions needed for 16/32 bit texture arrays are not widely supported by devices.

Take care of the textures order also. The shader gonna use corresponding index for each map by default.

7. Now create new SkinnedBatchMaterial:

```js
const material = new SkinnedBatchMaterial({
  maps: {
    mapsArray: ktxLoaded.enemiesDiffArray, // diffuseMaps CompressedArrayTexture
    normalMapsArray: null, // normalMaps CompressedArrayTexture. Must be THREE.NoColorSpace
    ormMapsArray: null, // ORM texture contains AOmap in R channel, roughness map in G channel and metalness map in B channel
  },
  unitsData, // must contain unit names with next data for each: rawMatrices, boneInverses, bonesAmount
  animLodDistance, // Vector2 object with distance thresholds allowing to simplify animations on distance. Example: new THREE.Vector2(5000, 15000);
  useAO: false, // this flag defines if shader gonna use R channel from ORM texture
});
```

Example of unitData object structure:

```js
const unitsData = {
  soldier: {
    rawMatrices: soldierLoadedBin,
    boneInverses: soldierSkinnedMesh.skeleton.boneInverses,
    bonesAmount: soldierSkinnedMesh.skeleton.bones.length,
  },
  mutant: {
    rawMatrices: mutantLoadedBin,
    boneInverses: mutantSkinnedMesh.skeleton.boneInverses,
    bonesAmount: mutantSkinnedMesh.skeleton.bones.length,
  },
};
```

8. Create new BatchedMeshLod:

```js
const batchedEnemies = new BatchedMeshLod(
  {
    soldier: {
      geometries: [
        skinnedMeshesLods.soldier[0].geometry, // Prepare geometry LODs in Blender to use it here
        skinnedMeshesLods.soldier[1].geometry,
        skinnedMeshesLods.soldier[2].geometry,
        skinnedMeshesLods.soldier[3].geometry,
        skinnedMeshesLods.soldier[4].geometry,
      ],
      distLod: [2000, 4000, 7000, 20000],
      instancesAmount: 10,
    },
    mutant: {
      geometries: [
        skinnedMeshesLods.mutant[0].geometry,
        skinnedMeshesLods.mutant[1].geometry,
        skinnedMeshesLods.mutant[2].geometry,
        skinnedMeshesLods.mutant[3].geometry,
        skinnedMeshesLods.mutant[4].geometry,
      ],
      distLod: [2000, 3000, 5000, 10000],
      instancesAmount: 20,
    },
  },
  material // or just use any THREE material if you dont need animations
);

scene.add(batchedEnemies);
```

9. Put units to desired position. There are 2 options:

- Use placeGrid() method to place units in a grid

```js
batchedEnemies.placeGrid("soldier", instancesPerUnit, {
  start: new THREE.Vector3(-12000, -100, 8000),
  spacing: new THREE.Vector3(3000, 0, -3000),
  columns: 10,
});
```

- Or use method setMatrix(unitName, instanceIndex, matrix4)

```js
const scaleValue = 200;

const position = new THREE.Vector3(100, 0, 100);
const scale = new THREE.Vector3(scaleValue, scaleValue, scaleValue);
const quaternion = new THREE.Quaternion();

const matrix4 = new THREE.Matrix4();

matrix4.compose(position, quaternion, scale);

setMatrix("soldier", 10, matrix4);
```

10. Let the material get access to LOD distance values and matrices:

```js
material.setBatchedMesh(batchedEnemies);
```

11. Now you are ready to setup animations. The material must know what frame ranges from Float32Array contains certain animations. That's why [Blender addon](https://github.com/GuestGD/AnimationFrameExporter) gonna be so useful. It exports JS helper that contains all necessary lines of code. It allows to just copy-paste all necessary data about frame ranges and transitions. You will find lines like these:

```js
material.setAnimationFrames("soldier", "soldierRest", 0, 0, 30);
material.setAnimationFrames("soldier", "soldierFire", 1, 27, 30);
material.setAnimationFrames("soldier", "soldierIdle", 28, 71, 30);
material.setAnimationFrames("soldier", "soldierRun", 72, 79, 30);
...
...
material.setAnimationTransitions("soldier", "soldierFire", {
  soldierIdle: "soldierFire_To_soldierIdle",
  soldierRun: "soldierFire_To_soldierRun",
});
```

12. At this points you are ready to simply play animations.

Play animation for a range of instances:

```js
material.playAnimationBatched("soldier", 0, 10, "soldierFire", "loop", 0.75);
```

Play animation for a certain instance:

```js
material.playAnimation("soldier", 5, "soldierFire", "loop", 0.75);
```

13. Then in main animate loop:

```js
const delta = new THREE.Clock().getDelta();

batchedEnemies.update(camera);
batchedEnemies.material.update.updateAnimations(delta);
```

### batchedEnemies will not be visible without .update function!

# [⤴️](#-table-of-contents)

## 🔨 How to import animations

Animations must be exported as a flat Float32Array of matrices. There are several ways of doing this:

1. The easiest way - use my [Blender addon](https://github.com/GuestGD/AnimationFrameExporter) . I really recommend using this approach to simplify your pipeline. The addon exports desired units animations allowing to pick a step, creating transition animations for all animation combinations in addition. Also it exports a tiny JS helper with lines of code you can just copy-paste into your project to set animation frames and transition animations.
2. You can manually play an animation of a typical skinned mesh in any three js project and write bones matrices of desired animations for needed frames. Then export it to any format you prefer.
3. Any other way you want.

The final result must be Float32Array containing bones matrices for all desired frames of unit's animations. For example:

- A character has 50 bones. Each bones has 4x4 matrix so 50\*16 = 800. It means each 800 values of this Float32Array is 1 frame of the character animations. Combine all animations frames into one array this way.

# [⤴️](#-table-of-contents)

## 🔨 Material methods

### Animations setup methods:

```js
setAnimationFrames(unitName, animName, startFrame, endFrame, fps, transit);
```

```js
setAnimationTransitions(unitName, animName, (transitions = {}));
```

```js
setBatchedMesh(batchedMesh);
```

### Animations managing methods:

```js
playAnimation(unitName, localInstanceId, animName, mode, speed);
```

```js
playAnimation(unitName, localInstanceId, animName, mode, speed);
```

```js
playAnimationBatched(
  unitName,
  startInstanceId,
  endInstanceId,
  animName,
  mode,
  speed
);
```

```js
stopAnimation(unitName, localInstanceId);
```

```js
stopAnimationBatched(unitName, startInstanceId, endInstanceId);
```

```js
pauseAnimation(unitName, localInstanceId);
```

```js
resumeAnimation(unitName, localInstanceId, newSpeed);
```

### Unit info methods:

```js
isPaused(unitName, localInstanceId);
```

```js
isStopped(unitName, localInstanceId);
```

```js
isPlaying(unitName, localInstanceId);
```

```js
getInstanceAnimationData(unitName, instanceIndex);
```

### Transition method:

```js
transitionToAnimation(
  unitName,
  localInstanceId,
  targetAnimName,
  targetAnimMode,
  targetAnimSpeed,
  transitionClipName,
  transitionClipSpeed,
  onComplete
);
```

### Events methods:

```js
createEvent(unitName, animName, frame, callback);
```

```js
removeEvent(unitName, animName, frame);
```

### Main update method:

```js
updateAnimations(delta);
```

### Unit states methods:

```js
setDistanceState(unitName, config, callBack);
```

```js
getDistanceState(unitName, instanceId);
```

```js
setState(unitName, instanceId, stateName);
```

```js
getState(unitName, instanceId);
```

# [⤴️](#-table-of-contents)

## 🔨 Batched mesh methods

```js
setMatrix(unitName, instanceIndex, matrix4);
```

```js
getMatrix(unitName, instanceIndex);
```

```js
placeGrid(
  unitName,
  count,
  (opts = {
    start,
    spacing,
    columns,
    scale,
    rot,
  })
);
```

```js
setMapIndex(unitName, value);
```

```js
getUnitInstancesAmount(unitName);
```

```js
getUnitInstanceDistance(unitName, instanceIndex);
```

```js
unitLookAt(unitName, instanceIndex, targetVector, rotationOffset);
```

```js
unitMoveTowards(
  unitName,
  instanceIndex,
  targetVector,
  lerpFactor,
  stopDistance,
  rotateToTarget
);
```

# [⤴️](#-table-of-contents)

## 📤 Demo installation

```bash
git clone https://github.com/GuestGD/threeSBML.git
cd threeSBML
npm install
npx vite --host
```
