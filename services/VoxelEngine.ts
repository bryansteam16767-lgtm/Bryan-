
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { AppState, SimulationVoxel, RebuildTarget, VoxelData, ThemeType } from '../types';
import { CONFIG, THEMES } from '../utils/voxelConstants';

export class VoxelEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private instanceMesh: THREE.InstancedMesh | null = null;
  private dummy = new THREE.Object3D();
  private floor: THREE.Mesh;
  private pedestal: THREE.Group;
  
  private voxels: SimulationVoxel[] = [];
  private rebuildTargets: RebuildTarget[] = [];
  private state: AppState = AppState.STABLE;
  private currentTheme: ThemeType = 'classic';
  private onStateChange: (state: AppState) => void;
  private onCountChange: (count: number) => void;
  private animationId: number = 0;

  constructor(
    container: HTMLElement, 
    onStateChange: (state: AppState) => void,
    onCountChange: (count: number) => void
  ) {
    this.container = container;
    this.onStateChange = onStateChange;
    this.onCountChange = onCountChange;

    const theme = THEMES[this.currentTheme];

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(theme.bg);
    this.scene.fog = new THREE.Fog(theme.bg, theme.fogNear, theme.fogFar);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(35, 35, 70);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.target.set(0, 5, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(30, 60, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    this.scene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(1000, 1000);
    const floorMat = new THREE.MeshStandardMaterial({ color: theme.floor, roughness: 0.8 });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = CONFIG.FLOOR_Y;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // Pedestal
    this.pedestal = new THREE.Group();
    const pBaseGeo = new THREE.CylinderGeometry(15, 17, 2, 32);
    const pBaseMat = new THREE.MeshStandardMaterial({ color: theme.pedestal });
    const pBase = new THREE.Mesh(pBaseGeo, pBaseMat);
    pBase.position.y = CONFIG.FLOOR_Y + 1;
    pBase.receiveShadow = true;
    pBase.castShadow = true;
    this.pedestal.add(pBase);

    const pTopGeo = new THREE.CylinderGeometry(14, 14, 0.5, 32);
    const pTopMat = new THREE.MeshStandardMaterial({ color: theme.pedestalAccent });
    const pTop = new THREE.Mesh(pTopGeo, pTopMat);
    pTop.position.y = CONFIG.FLOOR_Y + 2.1;
    pTop.receiveShadow = true;
    this.pedestal.add(pTop);

    this.scene.add(this.pedestal);

    this.animate();
  }

  public handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public cleanup() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    if (this.instanceMesh) {
      this.instanceMesh.geometry.dispose();
      (this.instanceMesh.material as THREE.Material).dispose();
    }
  }

  public setAutoRotate(enabled: boolean) {
    this.controls.autoRotate = enabled;
  }

  public setTheme(themeName: ThemeType) {
    this.currentTheme = themeName;
    const theme = THEMES[themeName];
    this.scene.background = new THREE.Color(theme.bg);
    this.scene.fog = new THREE.Fog(theme.bg, theme.fogNear, theme.fogFar);
    (this.floor.material as THREE.MeshStandardMaterial).color.set(theme.floor);
    
    const pBase = this.pedestal.children[0] as THREE.Mesh;
    const pTop = this.pedestal.children[1] as THREE.Mesh;
    (pBase.material as THREE.MeshStandardMaterial).color.set(theme.pedestal);
    (pTop.material as THREE.MeshStandardMaterial).color.set(theme.pedestalAccent);
  }

  public loadInitialModel(data: VoxelData[]) {
    this.state = AppState.STABLE;
    this.onStateChange(AppState.STABLE);
    this.createVoxelsFromData(data);
    this.onCountChange(this.voxels.length);
  }

  public dismantle() {
    if (this.state !== AppState.STABLE) return;
    this.state = AppState.DISMANTLING;
    this.onStateChange(AppState.DISMANTLING);

    this.voxels.forEach(v => {
      v.vx = (Math.random() - 0.5) * 0.8;
      v.vy = Math.random() * 0.5 + 0.2;
      v.vz = (Math.random() - 0.5) * 0.8;
      v.rvx = (Math.random() - 0.5) * 0.2;
      v.rvy = (Math.random() - 0.5) * 0.2;
      v.rvz = (Math.random() - 0.5) * 0.2;
    });
  }

  public rebuild(targetData: VoxelData[]) {
    this.state = AppState.REBUILDING;
    this.onStateChange(AppState.REBUILDING);

    // If counts mismatch, we adjust the pool
    const currentCount = this.voxels.length;
    const targetCount = targetData.length;

    if (targetCount > currentCount) {
      // Add more voxels from thin air (origin)
      for (let i = currentCount; i < targetCount; i++) {
        this.voxels.push(this.createEmptyVoxel(i));
      }
    } else if (targetCount < currentCount) {
      // Mark excess as "rubble" that stays on floor
    }

    this.rebuildTargets = targetData.map((d, i) => ({
      x: d.x,
      y: d.y,
      z: d.z,
      delay: Math.random() * 100,
      isRubble: false
    }));

    // Update colors for the rebuild
    targetData.forEach((d, i) => {
      this.voxels[i].color.set(d.color);
    });

    this.onCountChange(targetCount);
  }

  public async importMeshFile(file: File): Promise<VoxelData[] | null> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const url = URL.createObjectURL(file);
    
    let mesh: THREE.Group | THREE.Object3D;

    try {
      if (extension === 'gltf' || extension === 'glb') {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(url);
        mesh = gltf.scene;
      } else if (extension === 'obj') {
        const loader = new OBJLoader();
        mesh = await loader.loadAsync(url);
      } else {
        return null;
      }

      return this.voxelizeMesh(mesh);
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private voxelizeMesh(object: THREE.Object3D): VoxelData[] {
    // Basic voxelization by sampling
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Normalize scale to roughly 24 units max
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetDim = 24;
    const scale = targetDim / maxDim;
    object.scale.set(scale, scale, scale);
    
    // Re-calculate bounds after scale
    box.setFromObject(object);
    box.getCenter(object.position).multiplyScalar(-1);
    object.position.y -= box.min.y * scale; // Sit on origin y=0

    const scene = new THREE.Scene();
    scene.add(object);
    
    const raycaster = new THREE.Raycaster();
    const voxels: VoxelData[] = [];
    const step = 1.0;

    // Sample volume
    for (let x = box.min.x * scale; x <= box.max.x * scale; x += step) {
      for (let y = box.min.y * scale; y <= box.max.y * scale; y += step) {
        for (let z = box.min.z * scale; z <= box.max.z * scale; z += step) {
          // Inside-out test
          raycaster.set(new THREE.Vector3(x, y, z), new THREE.Vector3(0, 1, 0));
          const intersects = raycaster.intersectObject(object, true);
          
          if (intersects.length > 0 && intersects.length % 2 !== 0) {
            const color = (intersects[0].object as THREE.Mesh).material instanceof THREE.MeshStandardMaterial 
              ? (intersects[0].object as THREE.Mesh).material as THREE.MeshStandardMaterial 
              : { color: new THREE.Color(0xCCCCCC) };

            voxels.push({
              x: Math.round(x),
              y: Math.round(y),
              z: Math.round(z),
              color: (color as any).color.getHex()
            });
          }
        }
      }
    }

    return voxels;
  }

  private createVoxelsFromData(data: VoxelData[]) {
    if (this.instanceMesh) {
      this.scene.remove(this.instanceMesh);
    }

    const geo = new THREE.BoxGeometry(CONFIG.VOXEL_SIZE * 0.95, CONFIG.VOXEL_SIZE * 0.95, CONFIG.VOXEL_SIZE * 0.95);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
    this.instanceMesh = new THREE.InstancedMesh(geo, mat, data.length);
    this.instanceMesh.castShadow = true;
    this.instanceMesh.receiveShadow = true;
    this.scene.add(this.instanceMesh);

    this.voxels = data.map((d, i) => ({
      id: i,
      x: d.x,
      y: d.y,
      z: d.z,
      color: new THREE.Color(d.color),
      vx: 0, vy: 0, vz: 0,
      rx: 0, ry: 0, rz: 0,
      rvx: 0, rvy: 0, rvz: 0
    }));

    this.updateInstanceMesh();
  }

  private createEmptyVoxel(id: number): SimulationVoxel {
    return {
      id,
      x: 0, y: CONFIG.FLOOR_Y + 2, z: 0,
      color: new THREE.Color(0xCCCCCC),
      vx: 0, vy: 0, vz: 0,
      rx: 0, ry: 0, rz: 0,
      rvx: 0, rvy: 0, rvz: 0
    };
  }

  private updateInstanceMesh() {
    if (!this.instanceMesh) return;
    this.voxels.forEach((v, i) => {
      this.dummy.position.set(v.x, v.y, v.z);
      this.dummy.rotation.set(v.rx, v.ry, v.rz);
      this.dummy.updateMatrix();
      this.instanceMesh!.setMatrixAt(i, this.dummy.matrix);
      this.instanceMesh!.setColorAt(i, v.color);
    });
    this.instanceMesh.instanceMatrix.needsUpdate = true;
    if (this.instanceMesh.instanceColor) this.instanceMesh.instanceColor.needsUpdate = true;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();

    if (this.state === AppState.DISMANTLING) {
      this.simulatePhysics();
    } else if (this.state === AppState.REBUILDING) {
      this.simulateRebuild();
    }

    this.renderer.render(this.scene, this.camera);
  };

  private simulatePhysics() {
    this.voxels.forEach(v => {
      v.vy -= 0.02; // Gravity
      v.x += v.vx;
      v.y += v.vy;
      v.z += v.vz;
      v.rx += v.rvx;
      v.ry += v.rvy;
      v.rz += v.rvz;

      // Floor collision
      if (v.y < CONFIG.FLOOR_Y + 0.5) {
        v.y = CONFIG.FLOOR_Y + 0.5;
        v.vy *= -0.4; // Bounce
        v.vx *= 0.8;
        v.vz *= 0.8;
        v.rvx *= 0.5;
        v.rvy *= 0.5;
        v.rvz *= 0.5;
      }
    });
    this.updateInstanceMesh();
  }

  private simulateRebuild() {
    let allFinished = true;
    const lerpSpeed = 0.12;

    this.voxels.forEach((v, i) => {
      if (i >= this.rebuildTargets.length) return;
      const target = this.rebuildTargets[i];
      
      const dx = target.x - v.x;
      const dy = target.y - v.y;
      const dz = target.z - v.z;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (dist > 0.01) {
        v.x += dx * lerpSpeed;
        v.y += dy * lerpSpeed;
        v.z += dz * lerpSpeed;
        v.rx *= 0.9;
        v.ry *= 0.9;
        v.rz *= 0.9;
        allFinished = false;
      } else {
        v.x = target.x;
        v.y = target.y;
        v.z = target.z;
        v.rx = v.ry = v.rz = 0;
      }
    });

    this.updateInstanceMesh();

    if (allFinished) {
      this.state = AppState.STABLE;
      this.onStateChange(AppState.STABLE);
    }
  }

  public getJsonData(): string {
    const data = this.voxels.map(v => ({
      x: Math.round(v.x),
      y: Math.round(v.y),
      z: Math.round(v.z),
      c: v.color.getHex()
    }));
    return JSON.stringify(data);
  }

  public getUniqueColors(): string[] {
    const colors = new Set<string>();
    this.voxels.forEach(v => colors.add('#' + v.color.getHexString()));
    return Array.from(colors);
  }
}
