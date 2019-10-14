javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()
/**
 * Create scene with three.js
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb4cab4);


/**
 * Create render with three.js
 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


/**
 * Create camera and set postion of camera with three.js
 */
const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.set(0, 0.2, 0.6);


/**
 * Set lighting with three.js
 */
const light0 = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(light0);

const light1 = new THREE.SpotLight(0xffffff, 0.4);
light1.position.set(5, 5, 5);
scene.add(light1);

const light2 = new THREE.SpotLight(0xffffff, 0.4);
light2.position.set(-5, 5, 5);
scene.add(light2);

const light3 = new THREE.SpotLight(0xffffff, 0.5);
light3.position.set(0, 5, -5);
scene.add(light3);


/**
 * Rerender when window resize
 */
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});


/**
 * Add controls with OrbitControls.js
 */
const controls = new THREE.OrbitControls(camera, renderer.domElement);


/**
 * Create 1D array with length of h
 * @param {number} h - length of array
 */
function arr1(h) {
  let result = Array(h);
  for (let i = 0; i < result.length; i++) {
    result[i] = 0;
  }
  return result;
}


/**
 * Create 2D array with width of g and length of h
 * @param {number} g - width of array
 * @param {number} h - height of array
 */
function arr2(g, h) {
  let result = Array(g);
  for (let i = 0; i < result.length; i++) {
    result[i] = arr1(h);
  }
  return result;
}


/**
 * Create 3D array with height of f, width of g and length of h
 * @param {number} f - height of array
 * @param {number} g - width of array
 * @param {number} h - height of array
 */
function arr3(f, g, h) {
  let result = Array(f);
  for (let i = 0; i < result.length; i++) {
    result[i] = arr2(g, h);
  }
  return result;
}


/**
 * copy 1D array a
 * @param {array} a - array to copy
 */
function cparr1(a) {
  return a.slice();
}


/**
 * copy 2D array a
 * @param {array} a - array to copy
 */
function cparr2(a) {
  let result = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = cparr1(a[i]);
  }
  return result;
}


/**
 * copy 3D array a
 * @param {array} a - array to copy
 */
function cparr3(a) {
  let result = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = cparr2(a[i]);
  }
  return result;
}


/**
 * return maxium value of a, b
 * @param {number} a - number 1
 * @param {number} b - number 2
 */
function max(a, b) {
  if (a > b) {
    return a;
  } else {
    return b;
  }
}


/**
 * return minium value of a, b
 * @param {number} a - number 1
 * @param {number} b - number 2
 */
function min(a, b) {
  if (a < b) {
    return a;
  } else {
    return b;
  }
}


/**
 * Initialize constants
 */
// const id = parseInt(window.location.search.substring(1).split('=')[1]);
const id = window.location.search.substring(1).split('=')[1];


let models = JSON.parse(localStorage.getItem('models2D'));
let model = {};

models.forEach((item) => {
  if (item.id === id) {
    model = item;
  }
});

const g  = parseFloat(model.g);
const n  = parseFloat(model.n);
const d  = parseFloat(model.d);
const x  = parseFloat(model.x);
const y  = parseFloat(model.y);
const z  = parseFloat(model.z);
const Nx = parseInt(model.Nx) ;
const Ny = parseInt(model.Ny) ;
const Nz = parseInt(model.Nz) ;

const dt = 0.001;

const title = document.querySelector('#title');
title.innerHTML = `Model ${id} | 2D`;

const dx = x / Nx;
const dy = y / Ny;
const dz = z / Nz;

let vx = arr3(Nx + 1, Nz + 1, Ny + 1);
let temp_vx = arr3(Nx + 1, Nz + 1, Ny + 1);
let vz = arr3(Nx + 1, Nz + 1, Ny + 1);
let temp_vz = arr3(Nx + 1, Nz + 1, Ny + 1);

let h = arr2(Nx, Nz);
let temp_h = arr2(Nx, Nz);


/**
 * Draw cubes with three.js
 */
let cubes = [];
for (let i = 0; i < Nx; i++) {
  let temp = [];
  let geometry = new THREE.BoxGeometry(dx, 1, dz);
  let material = new THREE.MeshLambertMaterial({color: 0x7070e1, wireframe: false, transparent: true});
  material.opacity = 0.6;
  for (let j = 0; j < Nz; j++) {
    let cube = new THREE.Mesh(geometry, material);
    cube.position.set(dx * i - 0.5 * (x - dx), 0.5 * h[i][j] - 0.5 * y, dz * j - 0.5 * (z - dz));
    temp.push(cube);
    scene.add(cube);
  }
  cubes.push(temp);
}


/**
 * Set initial height of water
 */
function initialize(){
  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Nz; j++) {
      if (i + (Nz - j) < 0.9 * Nz) {
        h[i][j] = 0.65 * y;
      } else {
        h[i][j] = 0.4 * y;
      }
    }
  }
}


/**
 *
 * @param {number} i
 * @param {number} j
 */
function partial_h_x(i, j){
  let partial = ((h[i][j] + h[i][j - 1]) - (h[i - 1][j] + h[i - 1][j - 1])) / (2 * dx);
  return partial;
}


/**
 *
 * @param {number} i
 * @param {number} j
 */
function partial_h_z(i, j){
  let partial = ((h[i][j] + h[i - 1][j]) - (h[i][j - 1] + h[i - 1][j - 1])) / (2 * dx);
  return partial;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function partial_vx_x(i, j, k){
  let partial = (temp_vx[i + 1][j][k] - temp_vx[i - 1][j][k]) / (2 * dx);
  return partial;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function partial_vx_z(i, j, k){
  let partial = (temp_vx[i][j + 1][k] - temp_vx[i][j - 1][k]) / (2 * dz);
  return partial;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function partial_vz_x(i, j, k){
  let partial = (temp_vz[i + 1][j][k] - temp_vz[i - 1][j][k]) / (2 * dx);
  return partial;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function partial_vz_z(i, j, k){
  let partial = (temp_vz[i][j + 1][k] - temp_vz[i][j - 1][k]) / (2 * dz);
  return partial;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function laplace_vx(i, j, k){
  let laplace = (temp_vx[i + 1][j][k] - 2 * temp_vx[i][j][k] + temp_vx[i - 1][j][k]) / (dx ** 2) +
                (temp_vx[i][j + 1][k] - 2 * temp_vx[i][j][k] + temp_vx[i][j - 1][k]) / (dz ** 2) +
                (temp_vx[i][j][k + 1] - 2 * temp_vx[i][j][k] + temp_vx[i][j][k - 1]) / (dy ** 2);
  return laplace;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function laplace_vz(i, j, k){
  let laplace = (temp_vz[i + 1][j][k] - 2 * temp_vz[i][j][k] + temp_vz[i - 1][j][k]) / (dx ** 2) +
                (temp_vz[i][j + 1][k] - 2 * temp_vz[i][j][k] + temp_vz[i][j - 1][k]) / (dz ** 2) +
                (temp_vz[i][j][k + 1] - 2 * temp_vz[i][j][k] + temp_vz[i][j][k - 1]) / (dy ** 2);
  return laplace;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function delta_vx(i, j, k){
  let delta = - g * partial_h_x(i, j)
              - temp_vx[i][j][k] * partial_vx_x(i, j, k)
              - temp_vz[i][j][k] * partial_vx_z(i, j, k)
              + (n / d) * laplace_vx(i, j, k);
  return delta * dt;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function delta_vz(i, j, k){
  let delta = - g * partial_h_z(i, j)
              - temp_vx[i][j][k] * partial_vz_x(i, j, k)
              - temp_vz[i][j][k] * partial_vz_z(i, j, k)
              + (n / d) * laplace_vz(i, j, k);
  return delta * dt;
}


/**
 *
 * @param {number} i
 * @param {number} j
 */
function delta_h(i, j){

  let flux1 = 0;
  let flux2 = 0;
  let flux3 = 0;
  let flux4 = 0;


  let height1, height2, height3, height4;

  try { height1 = 0.5 * (temp_h[i - 1][j] + temp_h[i][j]) / dy; }
  catch (error) { height1 = 0; }

  try { height2 = 0.5 * (temp_h[i][j] + temp_h[i + 1][j]) / dy; }
  catch (error) { height2 = 0; }

  try { height3 = 0.5 * (temp_h[i][j - 1] + temp_h[i][j]) / dy; }
  catch (error) { height3 = 0; }

  try { height4 = 0.5 * (temp_h[i][j] + temp_h[i][j + 1]) / dy; }
  catch (error) { height4 = 0; }


  for (let k = 0; k < height1; k++) { flux1 += (vx[i][j][k] + vx[i][j + 1][k]) * 0.5; }
  for (let k = 0; k < height2; k++) { flux2 += (vx[i + 1][j][k] + vx[i + 1][j + 1][k]) * 0.5; }
  for (let k = 0; k < height3; k++) { flux3 += (vz[i][j][k] + vz[i + 1][j][k]) * 0.5; }
  for (let k = 0; k < height4; k++) { flux4 += (vz[i][j + 1][k] + vz[i + 1][j + 1][k]) * 0.5; }

  let delta = (dy / dx) * (flux1 - flux2) * dt + (dy / dz) * (flux3 - flux4) * dt;

  return delta;
}


/**
 * Caculate height of water surface after a dt
 */
function run(){
  for (let i = 1; i < Nx; i++) {
    for (let j = 1; j < Nz; j++) {
      for (let k = 1; k < Ny; k++) {
        vx[i][j][k] += delta_vx(i, j, k)
        vz[i][j][k] += delta_vz(i, j, k)
        if (k * dy > 0.25 * (h[i - 1][j] + h[i][j] + h[i - 1][j - 1] + h[i][j - 1])) {
          vx[i][j][k] = 0;
          vz[i][j][k] = 0;
        }
      }
    }
  }
  temp_vx = cparr3(vx);
  temp_vz = cparr3(vz);

  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Nz; j++) {
      h[i][j] += delta_h(i, j);
      if (h[i][j] < 0){
        h[i][j] = 0;
      } else if (h[i][j] > y){
        h[i][j] = y;
      }
      cubes[i][j].position.y = 0.5 * h[i][j] - 0.5 * y;
      cubes[i][j].scale.y = h[i][j];
    }
  }
  temp_h = cparr2(h);
}


/**
 * Update function of three.js
 */
function update() {
  run();
}


/**
 * Render function of three.js
 */
function render() {
  renderer.render(scene, camera);
}


/**
 * Animate function of three.js
 */
function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}


/**
 * Start animation
 */
initialize();
animate();
