export default function moveToCamera(
  batchedMesh,
  unitName,
  instanceId,
  camera,
  lerpFactor = 0.01,
  stopDistance = 0,
  lookAtTarget
) {
  if (!batchedMesh || !unitName || !camera) {
    console.warn("lookAtCamera error! Set arguments!");
  }

  const indexValue = Number(instanceId);

  if (indexValue > 0) {
    return;
  }

  batchedMesh.unitMoveTowards(
    unitName,
    instanceId,
    camera.position,
    lerpFactor,
    stopDistance,
    lookAtTarget
  );
}
