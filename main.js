import * as THREE from './build/three.module.js';

import Stats from './jsm/stats.module.js';

import { OrbitControls } from './jsm/OrbitControls.js';
import { GLTFLoader } from './jsm/GLTFLoader.js';
import { DRACOLoader } from './jsm/DRACOLoader.js';

let stats, controls;
let renderer, scene, camera;
let clock = new THREE.Clock();

let mouse = new THREE.Vector2(),
  INTERSECTED;
let raycaster;

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
  // scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0xffffff, 15, 52);
  // scene.fog = new THREE.FogExp2(0xffffff, 0.02);

  let light = new THREE.HemisphereLight(0xafafaf, 0x101010, 1.0); // sky color, ground color, intensity
  light.position.set(0, 8, 0);
  // scene.add(light);

  light = new THREE.DirectionalLight(0xb59fa0, 6);
  light.position.set(-15, 20, 14);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;

  light.shadow.bias = -0.001;
  light.shadow.mapSize.width = 8192;
  light.shadow.mapSize.height = 8192;
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
    color: 0x2a544a,
    // emissive: 0x3e6677,
    // emissiveIntensity: 0.1,
    metalness: 0,
    roughness: 0.9
  });

  let blackKeyMat = new THREE.MeshStandardMaterial({
    color: 0x152a44,
    metalness: 1,
    roughness: 0.9
  });

  // ground
  let ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(60, 40),
    blackKeyMat
  );
  ground.rotation.x = -Math.PI / 2;
  // scene.add(ground);
  ground.receiveShadow = true;

  let gltfLoader = new GLTFLoader();
  let model;

  gltfLoader.load('minisynth.glb', gltf => {
    model = gltf.scene;
    scene.add(model);

    model.scale.set(1, 1, 1);
    model.traverse(obj => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
      if (obj.isMesh) {
        if (obj.name[5] == '#') {
          obj.material = blackKeyMat;
        } else {
          obj.material = keyMat;
        }
        // obj.material = keyMat;
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

  raycaster = new THREE.Raycaster();

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('mousemove', onDocumentMouseMove, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();

  // controls.update(delta);
  stats.update();

  // renderer.render(scene, camera);
  render();
}

// let selectedObject = null;

function onDocumentMouseMove(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(e) {
  e.preventDefault();
}

function onMouseUp(e) {
  e.preventDefault();
}

function render() {
  camera.updateMatrixWorld();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children, true);
  // let intersects = raycaster.intersectObject('case', true);

  if (intersects.length > 0) {
    console.log(intersects[0]);
    if (
      INTERSECTED != intersects[0].object &&
      intersects[0].object.name[0] == 'k'
    ) {
      if (INTERSECTED) {
        // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        INTERSECTED.rotation.x -= 0.1;
      }

      INTERSECTED = intersects[0].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      // INTERSECTED.material.emissive.setHex(0xff0000);

      INTERSECTED.rotation.x += 0.1;
    }
  } else {
    if (INTERSECTED) {
      // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      INTERSECTED.rotation.x -= 0.1;
    }

    INTERSECTED = null;
  }
  renderer.render(scene, camera);
}

// function getIntersects(x, y) {
//   x = (x / window.innerWidth) * 2 - 1;
//   y = -(y / window.innerHeight) * 2 + 1;

//   mouseVector.set(x, y, 0.5);
//   raycaster.setFromCamera(mouseVector, camera);

//   return raycaster.intersectObject(group, true);
// }
