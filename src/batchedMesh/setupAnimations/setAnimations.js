export default function setAnimations(material) {
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
}
