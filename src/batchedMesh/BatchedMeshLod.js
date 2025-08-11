import {
  BatchedMesh,
  Vector3,
  Euler,
  Quaternion,
  Matrix4,
  BufferAttribute,
} from "three";

/**
 * @typedef {Object} GridOptions
 * @property {THREE.Vector3} [start=new THREE.Vector3(0,0,0)]
 * @property {THREE.Vector3} [spacing=new THREE.Vector3(600,0,600)]
 * @property {number} [columns=Math.ceil(Math.sqrt(count))]
 * @property {number} [scale=200]
 * @property {THREE.Euler} [rot=new THREE.Euler(-Math.PI/2,0,0)]
 */

const _playerPos = new Vector3();
const _center = new Vector3();
const _mat = new Matrix4();

export class BatchedMeshLod extends BatchedMesh {
  constructor(units, material) {
    const { maxInstances, maxVertices, maxIndices } = countCapacity(units);

    super(maxInstances, maxVertices, maxIndices, material);

    // This is used to set attributes per all lods of one unit easily. Global buffer (one Float32 for all vertices)
    const unitIndexBuf = new Float32Array(maxVertices);
    const instanceIndexBuf = new Float32Array(maxVertices);
    const mapIndexBuf = new Float32Array(maxVertices);
    const instanceAmountBuf = new Float32Array(maxVertices);

    let vertexCursor = 0;
    let globalInstanceCursor = 0;

    this.units = units;
    this.lodPairs = {};
    this.mapIndex = {};

    Object.entries(units).forEach(
      ([unitName, { geometries, instancesAmount = 0 }], unitIndex) => {
        this.units[unitName].startVertex = vertexCursor;
        this.units[unitName].unitTotalVertices = 0;

        this.lodPairs[unitName] = [];
        this.mapIndex[unitName] = unitIndex; // Initialize mapIndex for each unit

        for (let i = 0; i < instancesAmount; i++) {
          for (const geom of geometries) {
            const cloned = geom.clone(); // IMPORTANT: clone
            const geomId = this.addGeometry(cloned);
            const instId = this.addInstance(geomId);
            this.lodPairs[unitName].push({
              geometryId: geomId,
              instanceId: instId,
            });

            const vc = geom.attributes.position.count;
            this.units[unitName].unitTotalVertices += vc;

            instanceIndexBuf.fill(i, vertexCursor, vertexCursor + vc);

            unitIndexBuf.fill(unitIndex, vertexCursor, vertexCursor + vc);

            mapIndexBuf.fill(unitIndex, vertexCursor, vertexCursor + vc);

            instanceAmountBuf.fill(
              instancesAmount,
              vertexCursor,
              vertexCursor + vc
            );

            vertexCursor += vc;
            globalInstanceCursor += 1;
          }
        }
      }
    );

    this.geometry.setAttribute(
      "unitIndex",
      new BufferAttribute(unitIndexBuf, 1, false)
    );
    this.geometry.setAttribute(
      "instanceIndex",
      new BufferAttribute(instanceIndexBuf, 1, false)
    );
    this.geometry.setAttribute(
      "mapIndex",
      new BufferAttribute(mapIndexBuf, 1, false)
    );
    this.geometry.setAttribute(
      "instancesAmount",
      new BufferAttribute(instanceAmountBuf, 1, false)
    );

    unitIndexBuf.needsUpdate = true;
    instanceIndexBuf.needsUpdate = true;
    mapIndexBuf.needsUpdate = true;
    instanceAmountBuf.needsUpdate = true;

    /* ------------------------------------------------------------- */
    /* ------------------------------------------------------------- */
    
    this.lodInfo = {};

    for (const [unitName, { distLod, instancesAmount }] of Object.entries(
      units
    )) {
      const lodCount = distLod.length + 1;
      this.lodInfo[unitName] = {
        lodBase: new Int32Array(instancesAmount), // base index for each instance - the same for all lods
        lodDist: new Float32Array(distLod), // distance thresholds
        lodCount,
        unitDist: {},
      };

      for (let i = 0; i < instancesAmount; i++) {
        this.lodInfo[unitName].lodBase[i] = i * lodCount;
      }
    }

    this.matrices = {};

    for (const [unitName, { instancesAmount }] of Object.entries(units)) {
      this.matrices[unitName] = new Float32Array(instancesAmount * 16);
    }

    this.material = material;
  }

  update(camera) {
    const camPos = _playerPos.setFromMatrixPosition(camera.matrixWorld);

    for (const [
      unitName,
      { lodBase, lodDist, lodCount, unitDist },
    ] of Object.entries(this.lodInfo)) {
      const matrices = this.matrices[unitName];
      const pairs = this.lodPairs[unitName];

      for (let i = 0; i < lodBase.length; i++) {
        // 1. read matrix
        _mat.fromArray(matrices, i * 16);

        // 2. distance check
        const instancePos = _center.setFromMatrixPosition(_mat);

        const dist = camPos.distanceTo(instancePos);

        // 3. pick LoD
        let lod = 0;
        while (lod < lodDist.length && dist > lodDist[lod]) lod++;

        // 4. absolute index in pairs array
        const absIndex = lodBase[i] + lod;

        // 5. set matrix for the chosen LoD instance
        const { instanceId } = pairs[absIndex];
        this.setMatrixAt(instanceId, _mat);

        unitDist[i] = dist; // Update every unit current distance

        // 6. hide the rest
        for (let l = 0; l < lodCount; l++) {
          const other = pairs[lodBase[i] + l].instanceId;
          this.setVisibleAt(other, l === lod);
        }
      }
    }
  }

  setMatrix(unitName, instanceIndex, matrix4) {
    matrix4.toArray(this.matrices[unitName], instanceIndex * 16);
  }

  setMapIndex(unitName, value) {
    if (!(unitName in this.mapIndex)) {
      console.error(`Unit ${unitName} does not exist.`);
      return;
    }

    const unitStartVertex = this.units[unitName].startVertex;
    const unitTotalVertices = this.units[unitName].unitTotalVertices;
    const unitEndVertex = unitStartVertex + unitTotalVertices;

    const mapIndexAttr = this.geometry.attributes.mapIndex.array;
    mapIndexAttr.fill(value, unitStartVertex, unitEndVertex);

    this.geometry.attributes.mapIndex.needsUpdate = true;
    this.mapIndex[unitName] = value;
  }

  getUnitInstancesAmount(unitName) {
    if (!this.units[unitName]) {
      console.error(`Unit ${unitName} does not exist.`);
      return 0;
    }

    return this.units[unitName].instancesAmount;
  }

  getUnitInstanceDistance(unitName, instanceIndex) {
    if (!this.lodInfo?.[unitName].unitDist?.[instanceIndex]) {
      console.error(`Unit ${unitName} unitDist does not exist.`);
      return;
    }

    return this.lodInfo[unitName].unitDist[instanceIndex];
  }

  /**
   * @param {string} unitName
   * @param {number} count
   * @param {GridOptions} opts
   */
  placeGrid(unitName, count, /** @type {GridOptions} */ opts = {}) {
    const start = opts.start || new Vector3(0, 0, 0);
    const spacing = opts.spacing || new Vector3(600, 0, 600);
    const columns = opts.columns || Math.ceil(Math.sqrt(count));
    const scale = opts.scale || 200;
    const rot = opts.rot || new Euler(-Math.PI / 2, 0, 0);

    const pos = new Vector3();
    const scl = new Vector3(scale, scale, scale);
    const quat = new Quaternion().setFromEuler(rot);
    const mat = new Matrix4();

    for (let i = 0; i < count; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);

      pos
        .copy(start)
        .add(new Vector3(col * spacing.x, row * spacing.y, row * spacing.z));

      mat.compose(pos, quat, scl);
      this.setMatrix(unitName, i, mat);
    }
  }
}

function countCapacity(units) {
  let maxInstances = 0;

  for (const { geometries, instancesAmount = 0 } of Object.values(units)) {
    maxInstances += instancesAmount * geometries.length;
  }

  // sum vertices & indices across all clones
  let maxVertices = 0;
  let maxIndices = 0;
  for (const { geometries, instancesAmount = 0 } of Object.values(units)) {
    for (const geo of geometries) {
      maxVertices += geo.attributes.position.count * instancesAmount;
      maxIndices += (geo.index?.count ?? 0) * instancesAmount;
    }
  }

  return { maxInstances, maxVertices, maxIndices };
}
