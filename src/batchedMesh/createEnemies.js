import * as THREE from "three";
import { SkinnedBatchMaterial } from "./SkinnedBatchMaterial.js";
import { setupAnimations } from "./setupAnimations.js";
import { BatchedMeshLod } from "./BatchedMeshLod.js";
import { loadKtx2 } from "../loadKtx2.js";
import { loadGlb } from "../loadGlb.js";
import { loadBinArray } from "../loadBinArray.js";

const glbLoaded = {};
const ktxLoaded = {};
const skinnedMeshesLods = {};
const unitsData = {};
const animLodDistance = new THREE.Vector2(8000, 15000);
const geometryLodDistances = [2000, 4000, 7000, 20000];

export async function createEnemies(scene, renderer, instancesPerUnit) {
  // ==============================================
  //   MAPS and GEOMETRY PREPARING
  // ==============================================

  const glbPaths = {
    soldier: "assets/enemies/soldier.glb",
    mutant: "assets/enemies/mutant.glb",
    zombie: "assets/enemies/zombie.glb",
  };

  const mapsPaths = {
    enemiesDiffArray: "assets/enemies/enemiesDiffArray.ktx2",
  };

  const matricesPaths = {
    soldier: "assets/binClips/soldier_animations.bin",
    mutant: "assets/binClips/mutant_animations.bin",
    zombie: "assets/binClips/zombie_animations.bin",
  };

  await Promise.all(
    Object.entries(glbPaths).map(async ([name, path]) => {
      glbLoaded[name] = await loadGlb(scene, path);
      skinnedMeshesLods[name] = [];
    })
  );

  await Promise.all(
    Object.entries(mapsPaths).map(async ([name, path]) => {
      ktxLoaded[name] = await loadKtx2(renderer, path);
    })
  );

  Object.entries(glbLoaded).forEach(([groupName, groupObj]) => {
    groupObj.traverse((child) => {
      if (child.isSkinnedMesh) {
        skinnedMeshesLods[groupName].push(child);
      }
    });
  });

  // ==============================================
  //   UNIT DATA SETUP
  // ==============================================

  await Promise.all(
    Object.entries(matricesPaths).map(async ([unitName, path]) => {
      unitsData[unitName] = {};
      unitsData[unitName].rawMatrices = await loadBinArray(path);
      unitsData[unitName].instancesAmount = instancesPerUnit;
    })
  );

  Object.entries(skinnedMeshesLods).forEach(([unitName, unitGeometry]) => {
    unitsData[unitName].bonesAmount = unitGeometry[0].skeleton.bones.length;
    unitsData[unitName].boneInverses = unitGeometry[0].skeleton.boneInverses;
  });

  // ==============================================
  //   SKINNED BATCHED MATERIAL SETUP
  // ==============================================
  ktxLoaded.enemiesDiffArray.colorSpace = THREE.SRGBColorSpace;

  const material = new SkinnedBatchMaterial({
    maps: {
      mapsArray: ktxLoaded.enemiesDiffArray,
      normalMapsArray: null,
      ormMapsArray: null,
    },
    unitsData,
    animLodDistance,
  });

  // ==============================================
  //   BATCHED MESH SETUP
  // ==============================================
  const batchedEnemies = new BatchedMeshLod(
    {
      soldier: {
        geometries: [
          skinnedMeshesLods.soldier[0].geometry,
          skinnedMeshesLods.soldier[1].geometry,
          skinnedMeshesLods.soldier[2].geometry,
          skinnedMeshesLods.soldier[3].geometry,
          skinnedMeshesLods.soldier[4].geometry,
        ],
        distLod: geometryLodDistances,
        instancesAmount: instancesPerUnit,
      },
      mutant: {
        geometries: [
          skinnedMeshesLods.mutant[0].geometry,
          skinnedMeshesLods.mutant[1].geometry,
          skinnedMeshesLods.mutant[2].geometry,
          skinnedMeshesLods.mutant[3].geometry,
          skinnedMeshesLods.mutant[4].geometry,
        ],
        distLod: geometryLodDistances,
        instancesAmount: instancesPerUnit,
      },
      zombie: {
        geometries: [
          skinnedMeshesLods.zombie[0].geometry,
          skinnedMeshesLods.zombie[1].geometry,
          skinnedMeshesLods.zombie[2].geometry,
          skinnedMeshesLods.zombie[3].geometry,
          skinnedMeshesLods.zombie[4].geometry,
        ],
        distLod: geometryLodDistances,
        instancesAmount: instancesPerUnit,
      },
    },
    material.material
  );

  batchedEnemies.setMapIndex("soldier", 0.0); // INDEX OF KTX2 ARRAY TEXTURE USED IN MATERIAL
  batchedEnemies.setMapIndex("mutant", 1.0);
  batchedEnemies.setMapIndex("zombie", 2.0);

  scene.add(batchedEnemies);

  // ==============================================
  //   BATCHED MESH INSTANCES MATRIX SETUP
  // ==============================================

  batchedEnemies.placeGrid("soldier", instancesPerUnit, {
    start: new THREE.Vector3(-12000, -100, 8000),
    spacing: new THREE.Vector3(3000, 0, -3000),
    columns: 10,
  });

  batchedEnemies.placeGrid("mutant", instancesPerUnit, {
    start: new THREE.Vector3(-11000, -100, 8000),
    spacing: new THREE.Vector3(3000, 0, -3000),
    columns: 10,
  });

  batchedEnemies.placeGrid("zombie", instancesPerUnit, {
    start: new THREE.Vector3(-10000, -100, 8000),
    spacing: new THREE.Vector3(3000, 0, -3000),
    columns: 10,
  });

  batchedEnemies.updateMatrixWorld(true);
  batchedEnemies.computeBoundingBox();

  // ==============================================
  //   SKINNED BATCHED MATERIAL PATTERNS SETUP
  // ==============================================

  material.setBatchedMesh(batchedEnemies);

  setupAnimations(scene, material, instancesPerUnit);

  // Temp
  scene.userData.enemies = batchedEnemies;
  scene.userData.material = material;

  return { batchedEnemies };
}
