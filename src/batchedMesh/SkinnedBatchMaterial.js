import * as THREE from "three";

export class SkinnedBatchMaterial {
  constructor({ maps, unitsData, animLodDistance }) {
    this.material = new THREE.MeshStandardMaterial({
      allowOverride: false,
      fog: false,
      transparent: false,
      side: THREE.FrontSide,
    });

    this.batchedMesh = null;

    this.material.update = this;

    this.textures = maps;
    this.unitsData = unitsData;
    this.animLodDistance = animLodDistance;

    this.instanceManageTexture = null;
    this.instanceManageArr = null;

    this.materialData = {};

    this.frameEvents = {};
    this.patterns = {};

    this._unitsSetup(this.unitsData);

    this._patchMaterial();
    this._createInstancesManageTexture(unitsData);

    this._transitionEvents = {};
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  _unitsSetup(unitsData) {
    Object.entries(unitsData).forEach(([name, data], unitIndex) => {
      const { rawMatrices, boneInverses, bonesAmount } = data;

      this._prepareMatrices(
        name,
        rawMatrices,
        boneInverses,
        bonesAmount,
        unitIndex
      );
    });
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  _prepareMatrices(name, rawMatrices, boneInverses, bonesAmount, unitIndex) {
    const dataTextureWidth = bonesAmount * 4;
    const framesAmount = rawMatrices.length / (dataTextureWidth * 4);

    const finalMatricesArr = new Float32Array(
      dataTextureWidth * 4 * framesAmount
    );

    const tmpM = new THREE.Matrix4();
    const tmpI = new THREE.Matrix4();

    for (let f = 0; f < framesAmount; f++) {
      for (let b = 0; b < bonesAmount; b++) {
        const srcOffset = (f * bonesAmount + b) * 16;
        tmpM.fromArray(rawMatrices, srcOffset);
        tmpI.fromArray(boneInverses[b].elements, 0);
        tmpM.multiplyMatrices(tmpM, tmpI);
        tmpM.toArray(finalMatricesArr, srcOffset);
      }
    }

    this._createBoneTextures(
      name,
      finalMatricesArr,
      dataTextureWidth,
      framesAmount,
      unitIndex
    );
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  _createBoneTextures(
    name,
    finalMatricesArr,
    dataTextureWidth,
    framesAmount,
    unitIndex
  ) {
    this.materialData[name] = {};
    const unitFinalData = this.materialData[name];

    const boneAtlas = new THREE.DataTexture(
      finalMatricesArr,
      dataTextureWidth,
      framesAmount,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    boneAtlas.needsUpdate = true;
    boneAtlas.flipY = false;
    boneAtlas.minFilter = THREE.NearestFilter;
    boneAtlas.magFilter = THREE.NearestFilter;
    boneAtlas.generateMipmaps = false;

    unitFinalData.boneAtlas = boneAtlas;

    unitFinalData.boneAtlasArr = finalMatricesArr;

    unitFinalData.unitIndex = unitIndex;
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  _createInstancesManageTexture(unitsData) {
    let totalInstancesAllUnits = 0;

    Object.values(unitsData).forEach((unit) => {
      totalInstancesAllUnits += unit.instancesAmount;
    });

    const instanceManageArr = new Float32Array(totalInstancesAllUnits * 4);

    const instanceManageTexture = new THREE.DataTexture(
      instanceManageArr,
      1,
      totalInstancesAllUnits,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    instanceManageTexture.needsUpdate = true;
    instanceManageTexture.flipY = false;
    instanceManageTexture.minFilter = THREE.NearestFilter;
    instanceManageTexture.magFilter = THREE.NearestFilter;
    instanceManageTexture.generateMipmaps = false;

    this.instanceManageTexture = instanceManageTexture;
    this.instanceManageArr = instanceManageArr;
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  _patchMaterial() {
    const boneAtlasOne = Object.values(this.materialData)[0].boneAtlas;
    const boneAtlasTwo = Object.values(this.materialData)[1].boneAtlas;
    const boneAtlasThree = Object.values(this.materialData)[2].boneAtlas;

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.instanceManageTexture = {
        value: this.instanceManageTexture,
      };
      shader.uniforms.boneAtlasOne = { value: boneAtlasOne };
      shader.uniforms.boneAtlasOneSize = {
        value: new THREE.Vector2(
          boneAtlasOne.image.width,
          boneAtlasOne.image.height
        ),
      };
      shader.uniforms.boneAtlasTwo = { value: boneAtlasTwo };
      shader.uniforms.boneAtlasTwoSize = {
        value: new THREE.Vector2(
          boneAtlasTwo.image.width,
          boneAtlasTwo.image.height
        ),
      };
      shader.uniforms.boneAtlasThree = { value: boneAtlasThree };
      shader.uniforms.boneAtlasThreeSize = {
        value: new THREE.Vector2(
          boneAtlasThree.image.width,
          boneAtlasThree.image.height
        ),
      };
      shader.uniforms.animLodDistance = {
        value: this.animLodDistance || new THREE.Vector2(2000, 5000),
      };
      shader.uniforms.maps = { value: this.textures };

      shader.vertexShader =
        `
          uniform sampler2D instanceManageTexture;

          uniform sampler2D boneAtlasOne;
          uniform sampler2D boneAtlasTwo;
          uniform sampler2D boneAtlasThree;

          uniform vec2 boneAtlasOneSize;
          uniform vec2 boneAtlasTwoSize;
          uniform vec2 boneAtlasThreeSize;

          uniform vec2 animLodDistance;

          attribute vec4 skinIndex;
          attribute vec4 skinWeight;

          attribute float unitIndex; // 0 → boneAtlasOne, 1 → boneAtlasTwo
          attribute float instanceIndex;
          attribute float mapIndex;
          attribute float instancesAmount;
          varying float vMapIndex;
          varying vec2 vUv;


          mat4 getBoneMatrix(float boneIdx,
                            float frame,
                            float unitIndex)   // 0,1,2
          {
              vec2 size;
              vec4 v0, v1, v2, v3;

              if (unitIndex < 0.5) {                      // atlas 0
                  size = boneAtlasOneSize;
                  float x = boneIdx * 4.0 + 0.5;
                  float y = frame + 0.5;
                  vec2 uv = vec2(x / size.x, y / size.y);
                  v0 = texture(boneAtlasOne, uv);
                  v1 = texture(boneAtlasOne, uv + vec2(1.0 / size.x, 0.0));
                  v2 = texture(boneAtlasOne, uv + vec2(2.0 / size.x, 0.0));
                  v3 = texture(boneAtlasOne, uv + vec2(3.0 / size.x, 0.0));
              }
              else if (unitIndex < 1.5) {                 // atlas 1
                  size = boneAtlasTwoSize;
                  float x = boneIdx * 4.0 + 0.5;
                  float y = frame + 0.5;
                  vec2 uv = vec2(x / size.x, y / size.y);
                  v0 = texture(boneAtlasTwo, uv);
                  v1 = texture(boneAtlasTwo, uv + vec2(1.0 / size.x, 0.0));
                  v2 = texture(boneAtlasTwo, uv + vec2(2.0 / size.x, 0.0));
                  v3 = texture(boneAtlasTwo, uv + vec2(3.0 / size.x, 0.0));
              }
              else {                                      // atlas 2
                  size = boneAtlasThreeSize;
                  float x = boneIdx * 4.0 + 0.5;
                  float y = frame + 0.5;
                  vec2 uv = vec2(x / size.x, y / size.y);
                  v0 = texture(boneAtlasThree, uv);
                  v1 = texture(boneAtlasThree, uv + vec2(1.0 / size.x, 0.0));
                  v2 = texture(boneAtlasThree, uv + vec2(2.0 / size.x, 0.0));
                  v3 = texture(boneAtlasThree, uv + vec2(3.0 / size.x, 0.0));
              }
              return mat4(v0, v1, v2, v3);
          }

          vec4 skinVertexClose(vec4 pos, float frame, float nextFrame, float mixFactor, float unitIndex) {
              mat4 skinMatrixCurrent =
                  getBoneMatrix(skinIndex.x, frame, unitIndex) * skinWeight.x +
                  getBoneMatrix(skinIndex.y, frame, unitIndex) * skinWeight.y +
                  getBoneMatrix(skinIndex.z, frame, unitIndex) * skinWeight.z +
                  getBoneMatrix(skinIndex.w, frame, unitIndex) * skinWeight.w;

              mat4 skinMatrixNext =
                  getBoneMatrix(skinIndex.x, nextFrame, unitIndex) * skinWeight.x +
                  getBoneMatrix(skinIndex.y, nextFrame, unitIndex) * skinWeight.y +
                  getBoneMatrix(skinIndex.z, nextFrame, unitIndex) * skinWeight.z +
                  getBoneMatrix(skinIndex.w, nextFrame, unitIndex) * skinWeight.w;

              mat4 skinMatrix = mat4(
                mix(skinMatrixCurrent[0], skinMatrixNext[0], mixFactor),
                mix(skinMatrixCurrent[1], skinMatrixNext[1], mixFactor),
                mix(skinMatrixCurrent[2], skinMatrixNext[2], mixFactor),
                mix(skinMatrixCurrent[3], skinMatrixNext[3], mixFactor)
              );
              return skinMatrix * pos;
          }

          vec4 skinVertexMiddle(vec4 pos, float frame, float nextFrame, float mixFactor, float unitIndex)
          {
              // --- pick the two largest weights (and their indices) ----------
              vec4 w   = skinWeight;
              vec4 idx = skinIndex;

              // bubble-sort the first three positions to bring the two biggest to .x and .y
              if (w.y > w.x) { float tw = w.x;  w.x  = w.y;  w.y  = tw;
                              float ti = idx.x; idx.x = idx.y; idx.y = ti; }
              if (w.z > w.y) { float tw = w.y;  w.y  = w.z;  w.z  = tw;
                              float ti = idx.y; idx.y = idx.z; idx.z = ti; }
              if (w.y > w.x) { float tw = w.x;  w.x  = w.y;  w.y  = tw;
                              float ti = idx.x; idx.x = idx.y; idx.y = ti; }

              float bone0 = idx.x;
              float bone1 = idx.y;
              float w0    = w.x;
              float w1    = w.y;

              // --- fetch matrices for both bones -----------------------------
              mat4 m0c = getBoneMatrix(bone0, frame,     unitIndex);
              mat4 m0n = getBoneMatrix(bone0, nextFrame, unitIndex);
              mat4 m1c = getBoneMatrix(bone1, frame,     unitIndex);
              mat4 m1n = getBoneMatrix(bone1, nextFrame, unitIndex);

              mat4 skinMatrixCurrent = m0c * w0 + m1c * w1;
              mat4 skinMatrixNext    = m0n * w0 + m1n * w1;

              mat4 skinMatrix = mat4(
                  mix(skinMatrixCurrent[0], skinMatrixNext[0], mixFactor),
                  mix(skinMatrixCurrent[1], skinMatrixNext[1], mixFactor),
                  mix(skinMatrixCurrent[2], skinMatrixNext[2], mixFactor),
                  mix(skinMatrixCurrent[3], skinMatrixNext[3], mixFactor)
              );
              return skinMatrix * pos;
          }

          vec4 skinVertexFar(vec4 pos, float frame, float unitIndex)
          {
              // strongest bone only
              float boneIdx = skinIndex.x;
              if (skinWeight.y > skinWeight.x) boneIdx = skinIndex.y;
              if (skinWeight.z > max(skinWeight.x, skinWeight.y)) boneIdx = skinIndex.z;
              if (skinWeight.w > max(max(skinWeight.x, skinWeight.y), skinWeight.z)) boneIdx = skinIndex.w;

              mat4 skinMatrix = getBoneMatrix(boneIdx, frame, unitIndex);
              return skinMatrix * pos;
          }

          vec3 getInstanceData(float index, float textureHeight) {
              // Since texture width is 4 (RGBA), we sample at x=0.5 (center of first texel)
              // and move down rows based on instanceIndex
              vec4 data = texture2D(instanceManageTexture, vec2(0.5, ((index) + 0.5) / textureHeight));
              // Assuming data.r = frame, data.g = nextFrame, data.b = mixFactor
              return vec3(data.r, data.g, data.b);
          }

        ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        `#include <project_vertex>`,
        `
          vec4 distanceCheckPos = vec4(transformed, 1.0);
          
          #ifdef USE_BATCHING
            distanceCheckPos = batchingMatrix * distanceCheckPos;
          #endif

          #ifdef USE_INSTANCING

            distanceCheckPos = instanceMatrix * distanceCheckPos;

          #endif
          
          distanceCheckPos = modelMatrix * distanceCheckPos;

          vec3 delta = distanceCheckPos.xyz - cameraPosition;           
          float dist2 = dot(delta, delta);                              
          float lodClose  = animLodDistance.x * animLodDistance.x;              
          float lodFar  = animLodDistance.y * animLodDistance.y;              
          
          // Get frame data from texture
          float finalInstanceIndex = unitIndex * instancesAmount + instanceIndex;
          float textureHeight = float(textureSize(instanceManageTexture, 0).y);
          vec3 instanceData = getInstanceData(finalInstanceIndex, textureHeight);
          
          if (dist2 >= lodFar) {
              // far – 1 bone, no interpolation
              transformed = skinVertexFar(vec4(transformed, 1.0), instanceData.x, unitIndex).xyz;
          } else if (dist2 >= lodClose) {
              // mid – 2 bones, interpolated
              transformed = skinVertexMiddle(vec4(transformed, 1.0), instanceData.x, instanceData.y, instanceData.z, unitIndex).xyz;
          } else {
              // close – 4 bones, interpolated
              transformed = skinVertexClose(vec4(transformed, 1.0), instanceData.x, instanceData.y, instanceData.z, unitIndex).xyz;
          }

          vUv = uv;
          vMapIndex = mapIndex;

          #include <project_vertex> 
      `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <map_pars_fragment>`,
        `
         uniform sampler2DArray maps;
         varying float vMapIndex;
         varying vec2 vUv;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <map_fragment>`,
        `
         diffuseColor *= texture(maps, vec3(vUv.x, vUv.y, vMapIndex));
        `
      );
    };
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  _triggerTransitionEvent(unitName, animName, frame, callback) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    if (!this.materialData[unitName].animations?.[animName]) {
      console.warn(`Animation ${animName} not found for unit ${unitName}`);
      return;
    }

    const anim = this.materialData[unitName].animations[animName];
    const clampedFrame = Math.min(Math.max(0, frame), anim.frameCount - 2);

    // Create private event key with instance-specific prefix
    const eventKey = `_transition|${unitName}|${animName}|${clampedFrame}`;
    this._transitionEvents[eventKey] = callback;
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  _removeTransitionEvent(unitName, animName, frame) {
    const eventKey = `_transition|${unitName}|${animName}|${frame}`;
    delete this._transitionEvents[eventKey];
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  setAnimationFrames(
    unitName,
    animName,
    startFrame,
    endFrame,
    fps = 30,
    transit = false
  ) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    if (!this.materialData[unitName].animations) {
      this.materialData[unitName].animations = {};
    }

    const frameCount = Math.abs(endFrame - startFrame) + 1;
    const duration = frameCount / fps;

    this.materialData[unitName].animations[animName] = {
      startFrame,
      endFrame,
      fps,
      frameCount,
      duration,
      isTransit: transit,
      isReversed: startFrame > endFrame,
      transitions: {},
    };
  }

  setAnimationTransitions(unitName, animName, transitions = {}) {
    if (!this.materialData[unitName]?.animations?.[animName]) {
      console.warn(
        !this.materialData[unitName]
          ? `Unit ${unitName} not found`
          : "Set animation frames first!"
      );
      return;
    }

    Object.assign(
      this.materialData[unitName].animations[animName].transitions,
      transitions
    );
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  playAnimation(unitName, localInstanceId, animName, mode = "loop", speed = 1) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    if (!["loop", "once", "pingpong"].includes(mode)) {
      console.warn(`Invalid animation mode: ${mode}`);
      return;
    }

    const anim = this.materialData[unitName].animations?.[animName];
    if (!anim) {
      console.warn(`Animation ${animName} not found for unit ${unitName}`);
      return;
    }

    const instanceDataTexture = this.instanceManageTexture;
    const instanceDataArr = this.instanceManageArr;

    const unitOffset =
      this.materialData[unitName].unitIndex *
      this.unitsData[unitName].instancesAmount *
      4;
    const instanceOffset = localInstanceId * 4;
    const finalOffset = unitOffset + instanceOffset;

    // Initialize frames based on direction
    if (anim.isReversed) {
      instanceDataArr[finalOffset] = anim.startFrame;
      instanceDataArr[finalOffset + 1] = anim.startFrame - 1;
    } else {
      instanceDataArr[finalOffset] = anim.startFrame;
      instanceDataArr[finalOffset + 1] = anim.startFrame + 1;
    }
    instanceDataArr[finalOffset + 2] = 0;
    instanceDataArr[finalOffset + 3] = speed;

    // Store animation metadata
    if (!this.materialData[unitName].instanceStates) {
      this.materialData[unitName].instanceStates = {};
    }

    this.materialData[unitName].instanceStates[localInstanceId] ??= {};

    const state = this.materialData[unitName].instanceStates[localInstanceId];

    Object.assign(state, {
      animName,
      mode,
      speed,
      currentTime: 0,
      currentFrame: anim.startFrame,
      nextFrame: anim.isReversed ? anim.startFrame - 1 : anim.startFrame + 1,
      mixFactor: 0,
    });

    instanceDataTexture.needsUpdate = true;
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  playAnimationBatched(
    unitName,
    startInstanceId,
    endInstanceId,
    animName,
    mode = "loop",
    speed = 1
  ) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    if (!["loop", "once", "pingpong"].includes(mode)) {
      console.warn(`Invalid animation mode: ${mode}`);
      return;
    }

    const anim = this.materialData[unitName].animations?.[animName];
    if (!anim) {
      console.warn(`Animation ${animName} not found for unit ${unitName}`);
      return;
    }

    // Validate instance range
    const maxInstances = this.unitsData[unitName].instancesAmount;
    if (startInstanceId < 0 || startInstanceId > endInstanceId) {
      console.warn(
        `Invalid instance range: ${startInstanceId}-${endInstanceId}`
      );
      return;
    }

    let lastInstance = endInstanceId;

    if (endInstanceId >= maxInstances) lastInstance = maxInstances - 1;

    // Apply animation to each instance in the range
    for (let i = startInstanceId; i <= lastInstance; i++) {
      this.playAnimation(unitName, i, animName, mode, speed);
    }
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  transitionToAnimation(
    unitName,
    localInstanceId,
    targetAnimName,
    targetAnimMode = "loop",
    targetAnimSpeed = 1.0,
    transitionClipName = null,
    transitionClipSpeed = 1.0,
    onComplete = null
  ) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    if (!transitionClipName || !targetAnimName) return;

    const currentAnim =
      this.materialData[unitName].instanceStates?.[localInstanceId]?.animName;

    if (currentAnim === targetAnimName) return;

    const currentLastFrame =
      this.materialData[unitName].animations[currentAnim]?.frameCount - 2;

    const transitionLastFrame = transitionClipName
      ? this.materialData[unitName].animations[transitionClipName]?.frameCount -
        2
      : 0;

    if (currentAnim) {
      this._triggerTransitionEvent(
        unitName,
        currentAnim,
        currentLastFrame,
        (e) => {
          this.pauseAnimation(e.unitName, e.instanceId);

          this._triggerTransitionEvent(
            e.unitName,
            transitionClipName,
            transitionLastFrame,
            (transitionEvent) => {
              this.playAnimation(
                transitionEvent.unitName,
                transitionEvent.instanceId,
                targetAnimName,
                targetAnimMode,
                targetAnimSpeed
              );
              if (onComplete)
                onComplete({
                  unitName: transitionEvent.unitName,
                  instanceId: transitionEvent.instanceId,
                  sourceAnimation: currentAnim,
                  targetAnimation: targetAnimName,
                  transitionAnimation: transitionClipName,
                  timestamp: performance.now(),
                });
            }
          );

          this.playAnimation(
            e.unitName,
            e.instanceId,
            transitionClipName,
            "once",
            transitionClipSpeed
          );
        }
      );
    }
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  triggerEvent(unitName, animName, frame, callback) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    if (!this.materialData[unitName].animations?.[animName]) {
      console.warn(`Animation ${animName} not found for unit ${unitName}`);
      return;
    }

    const anim = this.materialData[unitName].animations[animName];

    // Clamp the frame number to valid range
    const clampedFrame = Math.min(Math.max(0, frame), anim.frameCount - 2);

    // Create event key and store callback
    const eventKey = `${unitName}|${animName}|${clampedFrame}`;
    this.frameEvents[eventKey] = callback;
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  removeEvent(unitName, animName, frame) {
    const eventKey = `${unitName}|${animName}|${frame}`;
    delete this.frameEvents[eventKey];
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */

  get isMaterial() {
    return true;
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  getMaterial() {
    return this.material;
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  getInstanceAnimationData(unitName, instanceIndex) {
    if (
      !this.materialData ||
      !this.materialData[unitName] ||
      !this.materialData[unitName].instanceStates ||
      !(instanceIndex in this.materialData[unitName].instanceStates)
    )
      return;

    return this.materialData[unitName].instanceStates[instanceIndex].animName;
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  setBatchedMesh(batchedMesh) {
    if (!batchedMesh) return;

    this.batchedMesh = batchedMesh;
  }
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  setTransitionPattern(
    unitName,
    minDistance = 0,
    maxDistance = 1,
    animationName,
    mode = "loop",
    speed = 1,
    transitionClipName = null,
    transitionClipSpeed = 1
  ) {
    if (!this.batchedMesh)
      return console.warn("setPattern Error - Set batched mesh first!");

    if (
      !this.materialData ||
      !this.materialData[unitName] ||
      !unitName ||
      !animationName ||
      maxDistance <= minDistance
    )
      return;

    if (!this.materialData[unitName].instanceStates)
      this.materialData[unitName].instanceStates = {};

    const batchedMesh = this.batchedMesh;

    if (
      !batchedMesh.lodInfo ||
      !batchedMesh.lodInfo[unitName] ||
      !batchedMesh.lodInfo[unitName].unitDist
    )
      return;

    if (!this.patterns[unitName]) this.patterns[unitName] = {};
    if (!this.patterns[unitName].animations)
      this.patterns[unitName].animations = [];
    if (!this.patterns[unitName].minDistances)
      this.patterns[unitName].minDistances = [];
    if (!this.patterns[unitName].maxDistances)
      this.patterns[unitName].maxDistances = [];
    if (!this.patterns[unitName].modes) this.patterns[unitName].modes = [];
    if (!this.patterns[unitName].speeds) this.patterns[unitName].speeds = [];
    if (!this.patterns[unitName].transitionClips)
      this.patterns[unitName].transitionClips = [];
    if (!this.patterns[unitName].transitionSpeeds)
      this.patterns[unitName].transitionSpeeds = [];

    this.patterns[unitName].animations.push(animationName);
    this.patterns[unitName].minDistances.push(minDistance);
    this.patterns[unitName].maxDistances.push(maxDistance);
    this.patterns[unitName].modes.push(mode);
    this.patterns[unitName].speeds.push(speed);
    this.patterns[unitName].transitionClips.push(transitionClipName);
    this.patterns[unitName].transitionSpeeds.push(transitionClipSpeed);
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  stopAnimation(unitName, localInstanceId) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    const instanceDataTexture = this.instanceManageTexture;
    const instanceDataArr = this.instanceManageArr;

    const unitOffset =
      this.materialData[unitName].unitIndex *
      this.unitsData[unitName].instancesAmount *
      4;
    const instanceOffset = localInstanceId * 4;
    const finalOffset = unitOffset + instanceOffset;

    // Reset animation data in the texture
    instanceDataArr[finalOffset] = 0; // current frame
    instanceDataArr[finalOffset + 1] = 0; // next frame
    instanceDataArr[finalOffset + 2] = 0; // mix factor
    instanceDataArr[finalOffset + 3] = 0; // speed

    // Remove the instance state if it exists
    if (this.materialData[unitName].instanceStates) {
      delete this.materialData[unitName].instanceStates[localInstanceId];
    }

    // Update the texture
    instanceDataTexture.needsUpdate = true;
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  stopAnimationBatched(unitName, startInstanceId, endInstanceId) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    // Validate instance range
    const maxInstances = this.unitsData[unitName].instancesAmount;
    if (startInstanceId < 0 || startInstanceId > endInstanceId) {
      console.warn(
        `Invalid instance range: ${startInstanceId}-${endInstanceId}`
      );
      return;
    }

    let lastInstance = endInstanceId;
    if (endInstanceId >= maxInstances) lastInstance = maxInstances - 1;

    // Stop animation for each instance in the range
    for (let i = startInstanceId; i <= lastInstance; i++) {
      this.stopAnimation(unitName, i);
    }
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  pauseAnimation(unitName, localInstanceId) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    // Get the current animation state
    const state = this.materialData[unitName].instanceStates?.[localInstanceId];
    if (!state) {
      console.warn(`No active animation for instance ${localInstanceId}`);
      return;
    }

    // Set speed to 0 while preserving all other state
    const instanceDataTexture = this.instanceManageTexture;
    const instanceDataArr = this.instanceManageArr;

    const unitOffset =
      this.materialData[unitName].unitIndex *
      this.unitsData[unitName].instancesAmount *
      4;
    const instanceOffset = localInstanceId * 4;
    const finalOffset = unitOffset + instanceOffset;

    // Keep current frame data but set speed to 0
    instanceDataArr[finalOffset + 3] = 0;

    // Update the instance state
    state.speed = 0;

    // Update the texture
    instanceDataTexture.needsUpdate = true;
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  resumeAnimation(unitName, localInstanceId, newSpeed = 1) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    // Get the current animation state
    const state = this.materialData[unitName].instanceStates?.[localInstanceId];
    if (!state) {
      console.warn(`No paused animation for instance ${localInstanceId}`);
      return;
    }

    const instanceDataTexture = this.instanceManageTexture;
    const instanceDataArr = this.instanceManageArr;

    const unitOffset =
      this.materialData[unitName].unitIndex *
      this.unitsData[unitName].instancesAmount *
      4;
    const instanceOffset = localInstanceId * 4;
    const finalOffset = unitOffset + instanceOffset;

    // Restore speed
    instanceDataArr[finalOffset + 3] = newSpeed;

    // Update the instance state
    state.speed = newSpeed;

    // Update the texture
    instanceDataTexture.needsUpdate = true;
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  updateAnimations(delta) {
    const instanceDataTexture = this.instanceManageTexture;
    const instanceDataArr = this.instanceManageArr;

    Object.entries(this.materialData).forEach(([unitName, unitData]) => {
      if (!unitData.instanceStates) return;

      const unitOffset =
        unitData.unitIndex * this.unitsData[unitName].instancesAmount * 4;

      Object.entries(unitData.instanceStates).forEach(([instanceId, state]) => {
        const instanceOffset = parseInt(instanceId) * 4;
        const finalOffset = unitOffset + instanceOffset;

        if (!state) return;

        // Normal animation update
        const anim = unitData.animations[state.animName];
        if (!anim) return;

        // Store previous time for event checking
        const prevTime = state.currentTime;
        state.currentTime += delta * state.speed;

        // Calculate current frame based on animation mode
        let relativeFrame, framePosition;
        if (state.mode === "pingpong") {
          const cycleDuration = anim.duration * 2;
          state.currentTime = state.currentTime % cycleDuration;
          const t =
            state.currentTime < anim.duration
              ? state.currentTime / anim.duration
              : 2 - state.currentTime / anim.duration;
          framePosition = t * (anim.frameCount - 1);
        } else {
          if (state.mode === "loop") {
            state.currentTime = state.currentTime % anim.duration;
          } else if (state.mode === "once") {
            state.currentTime = Math.min(state.currentTime, anim.duration);
          }
          framePosition =
            (state.currentTime / anim.duration) * (anim.frameCount - 1);
        }

        // Handle frame calculation based on direction
        if (anim.isReversed) {
          state.currentFrame =
            anim.startFrame -
            Math.min(Math.floor(framePosition), anim.frameCount - 1);
          state.nextFrame =
            anim.startFrame -
            Math.min(Math.ceil(framePosition), anim.frameCount - 1);
        } else {
          state.currentFrame =
            anim.startFrame +
            Math.min(Math.floor(framePosition), anim.frameCount - 1);
          state.nextFrame =
            anim.startFrame +
            Math.min(Math.ceil(framePosition), anim.frameCount - 1);
        }
        state.mixFactor = framePosition - Math.floor(framePosition);

        // Check for frame events
        const prevRelativeFrame = Math.floor(
          (prevTime / anim.duration) * (anim.frameCount - 1)
        );

        relativeFrame = Math.floor(framePosition);

        if (relativeFrame >= anim.frameCount) {
          relativeFrame = anim.frameCount - 1;
        }

        if (prevRelativeFrame !== relativeFrame) {
          const eventKey = `${unitName}|${state.animName}|${relativeFrame}`;
          if (this.frameEvents[eventKey]) {
            this.frameEvents[eventKey]({
              unitName,
              instanceId: parseInt(instanceId),
              animName: state.animName,
              frame: relativeFrame,
              absoluteFrame: anim.isReversed
                ? anim.startFrame - relativeFrame
                : anim.startFrame + relativeFrame,
              framesAmount: anim.frameCount,
              lastFrame: anim.frameCount - 1,
            });
          }

          const privateEventKey = `_transition|${unitName}|${state.animName}|${relativeFrame}`;
          if (this._transitionEvents[privateEventKey]) {
            this._transitionEvents[privateEventKey]({
              unitName,
              instanceId: parseInt(instanceId),
              animName: state.animName,
              frame: relativeFrame,
              absoluteFrame: anim.isReversed
                ? anim.startFrame - relativeFrame
                : anim.startFrame + relativeFrame,
              framesAmount: anim.frameCount,
              lastFrame: anim.frameCount - 1,
            });
            // Remove the private event after triggering
            this._removeTransitionEvent(
              unitName,
              state.animName,
              relativeFrame
            );
          }
        }

        state.localFrame = relativeFrame;

        this._checkStates(unitName, instanceId);

        // Update instance data texture
        instanceDataArr[finalOffset] = state.currentFrame;
        instanceDataArr[finalOffset + 1] = state.nextFrame;
        instanceDataArr[finalOffset + 2] = state.mixFactor;
        instanceDataArr[finalOffset + 3] = state.speed;
      });
    });

    instanceDataTexture.needsUpdate = true;
  }

  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  /* ======================> STATES* <=============================*/
  /* ------------------------------------------------------------- */
  /* ------------------------------------------------------------- */
  setDistanceState(
    unitName,
    stateName,
    { min = 0, max = Infinity, anim = null, mode = "loop", speed = 1 } = {}
  ) {
    if (!this.materialData?.[unitName] || !unitName || !stateName) return;

    this.materialData[unitName].stateTypes ??= {
      distance: {},
    };

    const { distance } = this.materialData[unitName].stateTypes;

    distance[stateName] = {
      min,
      max,
      anim,
      mode,
      speed,
    };
  }

  getDistanceState(unitName, instanceId) {
    if (!this.batchedMesh) return console.warn("Set batched mesh first!");
    if (!this.materialData?.[unitName]?.stateTypes || !unitName || !instanceId)
      return;
    if (!this.materialData?.[unitName]?.instanceStates?.[instanceId]) return;

    const { batchedMesh } = this;
    const unitLodInfo = batchedMesh.lodInfo?.[unitName];

    if (!unitLodInfo?.unitDist) return;

    const unitStateTypes = this.materialData[unitName].stateTypes;
    const unitStates = this.materialData[unitName].instanceStates;

    if (!unitStateTypes?.distance) {
      console.warn("Use setDistanceState first!");
      return;
    }

    if (!unitStates[instanceId].currentDistanceState) {
      Object.assign(unitStates[instanceId], {
        currentDistanceState: null,
        lastDistanceState: null,
        transitionTriggered: false,
        transitionActive: false,
      });
    }

    const instanceStates = unitStates[instanceId];

    const currentInstanceDistance = unitLodInfo.unitDist[instanceId];
    const statesDistance = unitStateTypes.distance;

    const [newState] =
      Object.entries(statesDistance).find(
        ([_, data]) =>
          currentInstanceDistance <= data.max &&
          currentInstanceDistance >= data.min
      ) || [];

    if (newState && instanceStates.currentDistanceState !== newState) {
      instanceStates.lastDistanceState =
        instanceStates.currentDistanceState || newState;

      instanceStates.currentDistanceState = newState;
    }

    return {
      instanceStates,
    };
  }

  _checkStates(unitName, instanceId) {
    if (!this.materialData[unitName]) {
      console.warn(`Unit ${unitName} not found`);
      return;
    }

    if (!this.materialData[unitName]?.stateTypes) {
      return;
    }

    const { instanceStates } = this.getDistanceState(unitName, instanceId);

    const { currentDistanceState } = instanceStates;

    if (instanceStates) {
      const unitStates = this.materialData[unitName].stateTypes;

      const statesDistance = unitStates.distance;

      const currentState = currentDistanceState;

      if (!statesDistance?.[currentState]?.anim || !currentState) {
        return;
      }

      const finalAnimName = statesDistance[currentState].anim;
      const finalAnimSpeed = statesDistance[currentState].speed || 0.5;
      const finalAnimMode = statesDistance[currentState].mode || "loop";

      const currentAnim =
        this.materialData[unitName].instanceStates?.[instanceId]?.animName;

      if (currentAnim === finalAnimName) return;

      const isCurrentAnimTransit =
        this.materialData[unitName].animations?.[currentAnim]?.isTransit;

      const currentFrameLocal =
        this.materialData[unitName].instanceStates?.[instanceId]?.localFrame;

      const currentAnimLastFrame =
        this.materialData[unitName].animations[currentAnim]?.frameCount - 2;

      const { transitionTriggered, transitionActive } = instanceStates;

      if (!transitionTriggered && !transitionActive) {
        if (
          !isCurrentAnimTransit &&
          currentFrameLocal >= currentAnimLastFrame
        ) {
          instanceStates.transitionTriggered ||= true;
          instanceStates.transitionActive ||= true;

          this.pauseAnimation(unitName, instanceId);

          const currentAnimTransition =
            this.materialData[unitName].animations[currentAnim].transitions[
              finalAnimName
            ];

          if (!currentAnimTransition) return;

          this.playAnimation(
            unitName,
            instanceId,
            currentAnimTransition,
            "once",
            1.5
          );
        }
      } else if (transitionTriggered && transitionActive) {
        if (isCurrentAnimTransit) {
          if (currentFrameLocal >= currentAnimLastFrame) {
            instanceStates.transitionTriggered = false;
            instanceStates.transitionActive = false;

            this.playAnimation(
              unitName,
              instanceId,
              finalAnimName,
              finalAnimMode,
              finalAnimSpeed
            );
          }
        }
      }
    }
  }
}
