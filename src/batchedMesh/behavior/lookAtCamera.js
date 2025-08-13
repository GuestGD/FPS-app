export default function lookAtCamera(
  batchedMesh,
  unitName,
  instanceId,
  camera,
  rotation
) {
  if (!batchedMesh || !unitName || !camera) {
    console.warn("lookAtCamera error! Set arguments!");
  }

  const indexValue = Number(instanceId);

  batchedMesh.unitLookAt(unitName, indexValue, camera.position, rotation);
}
