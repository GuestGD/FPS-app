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

```bash
import { SkinnedBatchMaterial } from "./SkinnedBatchMaterial.js";
import { BatchedMeshLod } from "./BatchedMeshLod.js";
```

4. Load every character animations from it's bin file:

```bash
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

```bash
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

```bash
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

```bash
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
    material // or use just any THREE material if you dont need animations
  );

  scene.add(batchedEnemies);
```

9. Then in main animate loop:

```bash
    const delta = new THREE.Clock().getDelta();

    batchedEnemies.update(camera);
    batchedEnemies.material.update.updateAnimations(delta);
```

### batchedEnemies will not be visible without .update function!

## 🔨 Material methods

### Animations setup methods:

```bash
  setAnimationFrames(
    unitName,
    animName,
    startFrame,
    endFrame,
    fps,
    transit
  )
```

```bash
setAnimationTransitions(unitName, animName, transitions = {})
```

```bash
setBatchedMesh(batchedMesh)
```

### Animations managing methods:

```bash
playAnimation(unitName, localInstanceId, animName, mode, speed)
```

```bash
playAnimation(unitName, localInstanceId, animName, mode, speed)
```

```bash
  playAnimationBatched(
    unitName,
    startInstanceId,
    endInstanceId,
    animName,
    mode,
    speed
  )
```

```bash
stopAnimation(unitName, localInstanceId)
```

```bash
stopAnimationBatched(unitName, startInstanceId, endInstanceId)
```

```bash
pauseAnimation(unitName, localInstanceId)
```

```bash
resumeAnimation(unitName, localInstanceId, newSpeed)
```

### Unit info methods:

```bash
isPaused(unitName, localInstanceId)
```

```bash
isStopped(unitName, localInstanceId)
```

```bash
isPlaying(unitName, localInstanceId)
```

```bash
getInstanceAnimationData(unitName, instanceIndex)
```

### Transition method:

```bash
  transitionToAnimation(
    unitName,
    localInstanceId,
    targetAnimName,
    targetAnimMode,
    targetAnimSpeed,
    transitionClipName,
    transitionClipSpeed,
    onComplete
  )
```

### Events methods:

```bash
createEvent(unitName, animName, frame, callback)
```

```bash
removeEvent(unitName, animName, frame)
```

### Main update method:

```bash
updateAnimations(delta)
```

### Unit states methods:

```bash
setDistanceState(unitName, config, callBack)
```

```bash
getDistanceState(unitName, instanceId)
```

```bash
setState(unitName, instanceId, stateName)
```

```bash
getState(unitName, instanceId)
```

## 🔨 How to import animations

Animations must be exported as a flat Float32Array of matrices. There are several ways of doing this:

1. The easiest way - use my [Blender addon](https://github.com/GuestGD/AnimationFrameExporter) . I really recommend using this approach to simplify your pipeline. The addon exports desired units animations allowing to pick a step, creating transition animations for all animation combinations in addition. Also it exports a tiny JS helper with lines of code you can just copy-paste into your project to set animation frames and transition animations.
2. You can manually play an animation of a typical skinned mesh in any three js project and write bones matrices of desired animations for needed frames. Then export it to any format you prefer.
3. Any other way you want.

The final result must be Float32Array containing bones matrices for all desired frames of unit's animations. For example:

- A character has 50 bones. Each bones has 4x4 matrix so 50\*16 = 800. It means each 800 values of this Float32Array is 1 frame of the character animations. Combine all animations frames into one array this way.

## 📤 Demo installation

```bash
git clone https://github.com/GuestGD/threeSBML.git
cd threeSBML
npm install
npx vite --host
```
