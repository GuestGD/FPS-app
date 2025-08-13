import * as THREE from "three";
import lookAtCamera from "../behavior/lookAtCamera";
import moveToCamera from "../behavior/moveToCamera";

export function manageAnimationStates(scene, material, instancesPerUnit) {
  const camera = scene.userData.camera;
  const batchedMesh = material.batchedMesh;

  // ==============================================
  //   Soldier animation states
  // ==============================================

  const soldierRunSpd = 0.02;
  const soldierCloseMax = 2000;

  material.setDistanceState(
    "soldier",
    {
      distName: "close",
      min: 0,
      max: soldierCloseMax,
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
        const targetPosition = camera.position;
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          targetPosition,
          soldierRunSpd,
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
      min: soldierCloseMax + 1,
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
        const targetPosition = camera.position;
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          targetPosition,
          soldierRunSpd,
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
  const mutantRunSpd = 0.02;
  const mutantCloseMax = 600;
  const mutantOffset = new THREE.Vector3(-100, 0, -20).applyQuaternion(
    camera.quaternion
  );

  material.setDistanceState(
    "mutant",
    {
      distName: "close",
      min: 0,
      max: mutantCloseMax,
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
        const targetPosition = camera.position.clone().add(mutantOffset);
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          targetPosition,
          mutantRunSpd,
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
      min: mutantCloseMax + 1,
      max: 5000,
      states: {
        default: {
          anim: "mutantRun",
          mode: "loop",
          speed: "0.75",
        },
      },
    },
    (e) => {
      if (e.animName.includes("Run")) {
        const targetPosition = camera.position.clone().add(mutantOffset);
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          targetPosition,
          mutantRunSpd,
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
  const zombieRunSpd = 0.02;
  const zombieCloseMax = 750;
  const zombieOffset = new THREE.Vector3(75, 0, -20).applyQuaternion(
    camera.quaternion
  );

  material.setDistanceState(
    "zombie",
    {
      distName: "close",
      min: 0,
      max: zombieCloseMax,
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
        const targetPosition = camera.position.clone().add(zombieOffset);
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          targetPosition,
          zombieRunSpd,
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
      min: zombieCloseMax + 1,
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
        const targetPosition = camera.position.clone().add(zombieOffset);
        moveToCamera(
          batchedMesh,
          e.unitName,
          e.instanceId,
          targetPosition,
          zombieRunSpd,
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
        speed: "0.75",
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
    0.75
  );
  material.playAnimationBatched(
    "zombie",
    0,
    instancesPerUnit,
    "zombieIdle",
    "loop",
    0.75
  );
}
