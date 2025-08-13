export default function moveToCamera(
  batchedMesh,
  unitName,
  instanceId,
  targetPosition,
  lerpFactor = 0.01,
  stopDistance = 0,
  lookAtTarget
) {
  if (!batchedMesh || !unitName || !targetPosition) {
    console.warn("lookAtCamera error! Set arguments!");
  }

  const indexValue = Number(instanceId);

  if (indexValue > 0) {
    return;
  }

  batchedMesh.unitMoveTowards(
    unitName,
    instanceId,
    targetPosition,
    lerpFactor,
    stopDistance,
    lookAtTarget
  );
}
