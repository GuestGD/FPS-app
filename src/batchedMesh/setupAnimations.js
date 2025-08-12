import * as THREE from "three";

export function setupAnimations(material, instancesPerUnit) {
  // ==============================================
  //   Soldier animations
  // ==============================================

  //Main animations
  material.setAnimationFrames("soldier", "soldierRest", 0, 0, 30);
  material.setAnimationFrames("soldier", "soldierFire", 1, 27, 30);
  material.setAnimationFrames("soldier", "soldierIdle", 28, 71, 30);
  material.setAnimationFrames("soldier", "soldierRun", 72, 79, 30);

  // Transition animations
  material.setAnimationFrames(
    "soldier",
    "soldierFire_To_soldierIdle",
    80,
    89,
    30,
    true
  );
  material.setAnimationFrames(
    "soldier",
    "soldierFire_To_soldierRun",
    90,
    99,
    30,
    true
  );
  material.setAnimationFrames(
    "soldier",
    "soldierIdle_To_soldierFire",
    100,
    109,
    30,
    true
  );
  material.setAnimationFrames(
    "soldier",
    "soldierIdle_To_soldierRun",
    110,
    119,
    30,
    true
  );
  material.setAnimationFrames(
    "soldier",
    "soldierRun_To_soldierFire",
    120,
    129,
    30,
    true
  );
  material.setAnimationFrames(
    "soldier",
    "soldierRun_To_soldierIdle",
    130,
    139,
    30,
    true
  );

  material.setAnimationTransitions("soldier", "soldierFire", {
    soldierIdle: "soldierFire_To_soldierIdle",
    soldierRun: "soldierFire_To_soldierRun",
  });
  material.setAnimationTransitions("soldier", "soldierIdle", {
    soldierFire: "soldierIdle_To_soldierFire",
    soldierRun: "soldierIdle_To_soldierRun",
  });
  material.setAnimationTransitions("soldier", "soldierRun", {
    soldierFire: "soldierRun_To_soldierFire",
    soldierIdle: "soldierRun_To_soldierIdle",
  });

  material.setDistanceState("soldier", {
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
  });
  material.setDistanceState("soldier", {
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
  });
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
  //   Mutant animations
  // ==============================================

  //Main animations
  material.setAnimationFrames("mutant", "mutantRest", 0, 0, 30);
  material.setAnimationFrames("mutant", "mutantDance", 1, 82, 30);
  material.setAnimationFrames("mutant", "mutantPunch", 83, 94, 30);
  material.setAnimationFrames("mutant", "mutantRun", 95, 103, 30);

  // Transition animations
  material.setAnimationFrames(
    "mutant",
    "mutantDance_To_mutantPunch",
    104,
    113,
    30,
    true
  );
  material.setAnimationFrames(
    "mutant",
    "mutantDance_To_mutantRun",
    114,
    123,
    30,
    true
  );
  material.setAnimationFrames(
    "mutant",
    "mutantPunch_To_mutantDance",
    124,
    133,
    30,
    true
  );
  material.setAnimationFrames(
    "mutant",
    "mutantPunch_To_mutantRun",
    134,
    143,
    30,
    true
  );
  material.setAnimationFrames(
    "mutant",
    "mutantRun_To_mutantDance",
    144,
    153,
    30,
    true
  );
  material.setAnimationFrames(
    "mutant",
    "mutantRun_To_mutantPunch",
    154,
    163,
    30,
    true
  );

  material.setAnimationTransitions("mutant", "mutantDance", {
    mutantPunch: "mutantDance_To_mutantPunch",
    mutantRun: "mutantDance_To_mutantRun",
  });
  material.setAnimationTransitions("mutant", "mutantPunch", {
    mutantDance: "mutantPunch_To_mutantDance",
    mutantRun: "mutantPunch_To_mutantRun",
  });
  material.setAnimationTransitions("mutant", "mutantRun", {
    mutantDance: "mutantRun_To_mutantDance",
    mutantPunch: "mutantRun_To_mutantPunch",
  });

  material.setDistanceState("mutant", {
    distName: "close",
    min: 0,
    max: 2000,
    states: {
      default: {
        anim: "mutantPunch",
        mode: "loop",
        speed: "0.5",
      },
    },
  });
  material.setDistanceState("mutant", {
    distName: "mid",
    min: 2001,
    max: 5000,
    states: {
      default: {
        anim: "mutantRun",
        mode: "loop",
        speed: "0.5",
      },
    },
  });
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
  //   Zombie animations
  // ==============================================

  //Main animations
  material.setAnimationFrames("zombie", "zombieRest", 0, 0, 30);
  material.setAnimationFrames("zombie", "zombieIdle", 1, 54, 30);
  material.setAnimationFrames("zombie", "zombiePunch", 55, 81, 30);
  material.setAnimationFrames("zombie", "zombieRun", 82, 91, 30);

  // Transition animations
  material.setAnimationFrames(
    "zombie",
    "zombieIdle_To_zombiePunch",
    92,
    101,
    30,
    true
  );
  material.setAnimationFrames(
    "zombie",
    "zombieIdle_To_zombieRun",
    102,
    111,
    30,
    true
  );
  material.setAnimationFrames(
    "zombie",
    "zombiePunch_To_zombieIdle",
    112,
    121,
    30,
    true
  );
  material.setAnimationFrames(
    "zombie",
    "zombiePunch_To_zombieRun",
    122,
    131,
    30,
    true
  );
  material.setAnimationFrames(
    "zombie",
    "zombieRun_To_zombieIdle",
    132,
    141,
    30,
    true
  );
  material.setAnimationFrames(
    "zombie",
    "zombieRun_To_zombiePunch",
    142,
    151,
    30,
    true
  );

  material.setAnimationTransitions("zombie", "zombieIdle", {
    zombiePunch: "zombieIdle_To_zombiePunch",
    zombieRun: "zombieIdle_To_zombieRun",
  });
  material.setAnimationTransitions("zombie", "zombiePunch", {
    zombieIdle: "zombiePunch_To_zombieIdle",
    zombieRun: "zombiePunch_To_zombieRun",
  });
  material.setAnimationTransitions("zombie", "zombieRun", {
    zombieIdle: "zombieRun_To_zombieIdle",
    zombiePunch: "zombieRun_To_zombiePunch",
  });

  material.setDistanceState(
    "zombie",
    {
      distName: "close",
      min: 0,
      max: 2000,
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
      let showLog = e.show;
      if (!showLog) {
        showLog = true;
        const matrix = e.matrix;
        const position = new THREE.Vector3().setFromMatrixPosition(matrix);
        matrix.setPosition(new THREE.Vector3(0, 0, 0));
        material.batchedMesh.updateMatrixWorld(true);
        setTimeout(() => {
          showLog = false;
          material.setState(e.unitName, e.instanceId, "dead");
        }, 1000);
      }
    }
  );
  material.setDistanceState("zombie", {
    distName: "mid",
    min: 2001,
    max: 5000,
    states: {
      default: {
        anim: "zombieRun",
        mode: "loop",
        speed: "0.5",
      },
    },
  });
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
