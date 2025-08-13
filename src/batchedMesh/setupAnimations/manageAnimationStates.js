import * as THREE from "three";
import lookAtCamera from "../behavior/lookAtCamera";
import moveToCamera from "../behavior/moveToCamera";

export function manageAnimationStates(scene, material, instancesPerUnit) {
  const camera = scene.userData.camera;
  const batchedMesh = material.batchedMesh;

  // ==============================================
  //   Soldier animation states
  // ==============================================

  material.setDistanceState(
    "soldier",
    {
      distName: "close",
      min: 0,
      max: 2000,
      states: {
        default: {
          anim: "soldierFire",
          mode: "loop",
          speed: "0.5",
        },
      },
    },
    (e) => {
      lookAtCamera(batchedMesh, e.unitName, e.instanceId, camera, Math.PI);

      if (e.animName.includes("Run")) {
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          camera,
          0.01,
          100,
          true
        );
      }
    }
  );

  material.setDistanceState(
    "soldier",
    {
      distName: "mid",
      min: 2001,
      max: 5000,
      states: {
        default: {
          anim: "soldierRun",
          mode: "loop",
          speed: "0.5",
        },
      },
    },
    (e) => {
      if (e.animName.includes("Run")) {
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          camera,
          0.01,
          0,
          true
        );
      }
    }
  );

  material.setDistanceState("soldier", {
    distName: "far",
    min: 5001,
    max: Infinity,
    states: {
      default: {
        anim: "soldierIdle",
        mode: "loop",
        speed: "0.5",
      },
    },
  });

  // ==============================================
  //   Mutant animation states
  // ==============================================

  material.setDistanceState(
    "mutant",
    {
      distName: "close",
      min: 0,
      max: 500,
      states: {
        default: {
          anim: "mutantPunch",
          mode: "loop",
          speed: "0.5",
        },
      },
    },
    (e) => {
      lookAtCamera(batchedMesh, e.unitName, e.instanceId, camera, Math.PI);

      if (e.animName.includes("Run")) {
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          camera,
          0.01,
          0,
          true
        );
      }
    }
  );

  material.setDistanceState(
    "mutant",
    {
      distName: "mid",
      min: 501,
      max: 5000,
      states: {
        default: {
          anim: "mutantRun",
          mode: "loop",
          speed: "0.5",
        },
      },
    },
    (e) => {
      if (e.animName.includes("Run")) {
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          camera,
          0.01,
          0,
          true
        );
      }
    }
  );

  material.setDistanceState("mutant", {
    distName: "far",
    min: 5001,
    max: Infinity,
    states: {
      default: {
        anim: "mutantDance",
        mode: "loop",
        speed: "0.5",
      },
    },
  });

  // ==============================================
  //   Zombie animation states
  // ==============================================

  material.setDistanceState(
    "zombie",
    {
      distName: "close",
      min: 0,
      max: 600,
      states: {
        default: {
          anim: "zombiePunch",
          mode: "loop",
          speed: "0.5",
        },
        dead: {
          anim: "zombieIdle",
          mode: "once",
          speed: "0.5",
        },
        anyOther: {
          anim: "zombiePunch",
          mode: "once",
          speed: "0.5",
        },
      },
    },
    (e) => {
      lookAtCamera(batchedMesh, e.unitName, e.instanceId, camera, Math.PI);

      if (e.animName.includes("Run")) {
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          camera,
          0.01,
          0,
          true
        );
      }
    }
  );

  material.setDistanceState(
    "zombie",
    {
      distName: "mid",
      min: 601,
      max: 5000,
      states: {
        default: {
          anim: "zombieRun",
          mode: "loop",
          speed: "0.5",
        },
      },
    },
    (e) => {
      if (e.animName.includes("Run")) {
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          camera,
          0.01,
          0,
          true
        );
      }
    }
  );

  material.setDistanceState("zombie", {
    distName: "far",
    min: 5001,
    max: Infinity,
    states: {
      default: {
        anim: "zombieIdle",
        mode: "loop",
        speed: "0.5",
      },
    },
  });

  // ==============================================
  //   Play units animations
  // ==============================================
  material.playAnimationBatched(
    "soldier",
    0,
    instancesPerUnit,
    "soldierIdle",
    "loop",
    0.5
  );
  material.playAnimationBatched(
    "mutant",
    0,
    instancesPerUnit,
    "mutantDance",
    "loop",
    0.5
  );
  material.playAnimationBatched(
    "zombie",
    0,
    instancesPerUnit,
    "zombieIdle",
    "loop",
    0.5
  );
}
