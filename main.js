import * as THREE from './build/three.module.js';

import Stats from './jsm/stats.module.js';

import { OrbitControls } from './jsm/OrbitControls.js';
import { GLTFLoader } from './jsm/GLTFLoader.js';
import { DRACOLoader } from './jsm/DRACOLoader.js';

let stats, controls;
let renderer, scene, camera;
let clock = new THREE.Clock();

let mixer;

init();
animate();

function init() {
  const container = document.querySelector('#container');
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  stats = new Stats();
  container.appendChild(stats.dom);

  // camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    90
  );
  camera.position.set(0, 30, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0xffffff, 15, 52);
  scene.fog = new THREE.FogExp2(0xffffff, 0.01);

  let light = new THREE.HemisphereLight(0xff3f4f, 0x0080a0, 2.0); // sky color, ground color, intensity
  light.position.set(0, 8, 0);
  scene.add(light);

  light = new THREE.DirectionalLight(0xc59fb0, 5);
  light.position.set(-25, 30, 24);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;

  light.shadow.bias = -0.001;
  light.shadow.mapSize.width = 4096;
  light.shadow.mapSize.height = 4096;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 90;
  light.shadow.radius = 2;

  light.shadow.camera.top = 90;
  light.shadow.camera.bottom = -90;
  light.shadow.camera.left = -90;
  light.shadow.camera.right = 90;

  scene.add(light);
  scene.add(light.target);

  let keyMat = new THREE.MeshStandardMaterial({
    // color: 0x4f0b19,
    color: 0x1a544a,
    // emissive: 0x3e6677,
    // emissiveIntensity: -0.1,
    metalness: 0,
    roughness: 0.1
  });

  let blackKeyMat = new THREE.MeshStandardMaterial({
    color: 0x050101,
    metalness: 0,
    roughness: 0.5
  });

  // ground
  let ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 30),
    blackKeyMat
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  ground.receiveShadow = true;

  let grid = new THREE.GridHelper(2000, 20, 0xf00000, 0x0000f0); // size, divisions, colorCenterLine, colorGrid
  grid.material.opacity = 0.8;
  grid.material.transparent = true;
  scene.add(grid);

  let gltfLoader = new GLTFLoader();

  gltfLoader.load('minisynth.glb', gltf => {
    let model = gltf.scene;
    scene.add(model);

    model.scale.set(1, 1, 1);
    model.traverse(obj => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
      if (obj.isMesh) {
        if (obj.name[1] == '#') {
          obj.material = blackKeyMat;
        } else {
          obj.material = keyMat;
        }
      }
    });

    // mixer = new THREE.AnimationMixer(model);
    // let clip1 = gltf.animations[0];
    // let action1 = mixer.clipAction(clip1);
    // action1.play();
    // mixer.clipAction(gltf.animations[0]).play(); // this is the same as the above three lines
  });

  // platform // for fbx loader
  // loader.load('platform.fbx', object => {
  //   object.castShadow = true;
  //   object.receiveShadow = true;
  //   scene.add(object);
  // });

  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  // renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.type = 1;
  renderer.shadowMapSoft = true;

  // for accurate colors
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();

  // if (mixer) mixer.update(delta);
  // controls.update(delta);
  stats.update();

  renderer.render(scene, camera);
}
