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

const title = document.getElementById("title");
title.innerHTML = `Model ${id} | 2D`;

const dx = x / Nx;
const dy = y / Ny;
const dz = z / Nz;

let vx = arr3(Nx + 1, Nz + 1, Ny + 1);
let vx_init = arr3(Nx + 1, Nz + 1, Ny + 1);
let vz = arr3(Nx + 1, Nz + 1, Ny + 1);
let vz_init = arr3(Nx + 1, Nz + 1, Ny + 1);

let h = arr2(Nx, Nz);
let h_init = arr2(Nx, Nz);


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


function Guass(x0,z0,sigma,amp,i,j){
  let xd = i*dx - x0;
  let zd = j*dz - z0;
  return amp*2.718**(-(xd**2 + zd**2)/(2*sigma**2))
}

/**
 * Set initial height of water
 */
function initialize(){
  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Nz; j++) {
      /*
      if (i + (Nz - j) < 0.9 * Nz) {
        h[i][j] = 0.65 * y;
      } else {
        h[i][j] = 0.4 * y;
      }*/
      h_init[i][j] = 0.3*y;
      h[i][j] = h_init[i][j] + Guass(Nx*dx*0.5,Nz*dz*0.5,5*dx,0.2*y,i,j);
    }
  }
}

function partial_x_2d(arr, i, j){
  let partial_x_arr = ((arr[i][j] + arr[i][j - 1]) - (arr[i - 1][j] + arr[i - 1][j - 1])) / (2 * dx);
  return partial_x_arr;
}

function partial_z_2d(arr, i, j){
  let partial_z_arr = ((arr[i][j] + arr[i - 1][j]) - (arr[i][j - 1] + arr[i - 1][j - 1])) / (2 * dz);
  return partial_z_arr;
}

function laplace_2d(arr, i ,j){
  let laplace_arr = (arr[i+1][j] + arr[i-1][j] - 2*arr[i][j]) / dx**2 + (arr[i][j+1] + arr[i][j-1] - 2*arr[i][j]) / dz**2;
  return laplace_arr;
}


function partial_x_3d(arr, i, j, k){
  let partial_x_arr = (arr[i + 1][j][k] - arr[i - 1][j][k]) / (2 * dx);
  return partial_x_arr;
}

function partial_y_3d(arr, i, j, k){
  let partial_y_arr = (arr[i][j + 1][k] - arr[i][j - 1][k]) / (2 * dy);
  return partial_y_arr;
}

function partial_z_3d(arr, i, j, k){
  let partial_z_arr = (arr[i][j][k + 1] - arr[i][j][k - 1]) / (2 * dz);
  return partial_z_arr;
}

function laplace_3d(arr, i, j, k){
  let laplace_arr = (arr[i+1][j][k] + arr[i-1][j][k] - 2*arr[i][j][k]) / dx**2;
  laplace_arr += (arr[i][j+1][k] + arr[i][j-1][k] - 2*arr[i][j][k]) / dy**2;
  laplace_arr += (arr[i][j][k+1] + arr[i][j][k-1] - 2*arr[i][j][k]) / dz**2;
  return laplace_arr;
}

/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function f_vx(vx_arg, vz_arg, h_arg, i, j, k){
  let ret = - g * partial_x_2d(h_arg, i, j)
              - vx_arg[i][j][k] * partial_x_3d(vx_arg, i, j, k)
              - vz_arg[i][j][k] * partial_z_3d(vx_arg, i, j, k)
              + (n / d) * laplace_3d(vx_arg, i, j, k);
  return ret;
}


/**
 *
 * @param {number} i
 * @param {number} j
 * @param {number} k
 */
function f_vz(vx_arg, vz_arg, h_arg, i, j, k){
  let ret = - g * partial_z_2d(h_arg, i, j)
              - vx_arg[i][j][k] * partial_x_3d(vz_arg, i, j, k)
              - vz_arg[i][j][k] * partial_z_3d(vz_arg, i, j, k)
              + (n / d) * laplace_3d(vz_arg, i, j, k);
  return ret;
}

function f_h(vx_arg, vz_arg, h_arg, i, j){

  let flux1 = 0;
  let flux2 = 0;
  let flux3 = 0;
  let flux4 = 0;


  let height1, height2, height3, height4;

  try { height1 = 0.5 * (h_arg[i - 1][j] + h_arg[i][j]) / dy; }
  catch (error) { height1 = 0; }

  try { height2 = 0.5 * (h_arg[i][j] + h_arg[i + 1][j]) / dy; }
  catch (error) { height2 = 0; }

  try { height3 = 0.5 * (h_arg[i][j - 1] + h_arg[i][j]) / dy; }
  catch (error) { height3 = 0; }

  try { height4 = 0.5 * (h_arg[i][j] + h_arg[i][j + 1]) / dy; }
  catch (error) { height4 = 0; }


  for (let k = 0; k < height1; k++) { flux1 += (vx_arg[i][j][k] + vx_arg[i][j + 1][k]) * 0.5; }
  for (let k = 0; k < height2; k++) { flux2 += (vx_arg[i + 1][j][k] + vx_arg[i + 1][j + 1][k]) * 0.5; }
  for (let k = 0; k < height3; k++) { flux3 += (vz_arg[i][j][k] + vz_arg[i + 1][j][k]) * 0.5; }
  for (let k = 0; k < height4; k++) { flux4 += (vz_arg[i][j + 1][k] + vz_arg[i + 1][j + 1][k]) * 0.5; }

  let ret = (dy / dx) * (flux1 - flux2) + (dy / dz) * (flux3 - flux4);

  return ret;
}


/**
 * Caculate height of water surface after a dt
 */
function run(){
  vx_0 = cparr3(vx);
  vx_1 = cparr3(vx);
  vx_2 = cparr3(vx);
  vz_0 = cparr3(vz);
  vz_1 = cparr3(vz);
  vz_2 = cparr3(vz);
  h_0 = cparr2(h);
  h_1 = cparr2(h);
  h_2 = cparr2(h);
  for (let i = 1; i < Nx; i++) {
    for (let j = 1; j < Nz; j++) {
      for (let k = 1; k < Ny; k++) {
        vx_1[i][j][k] = vx_0[i][j][k] + f_vx(vx_0, vz_0, h_0, i, j, k)*dt;
        vz_1[i][j][k] = vz_0[i][j][k] + f_vz(vx_0, vz_0, h_0, i, j, k)*dt;
        if (k * dy > 0.25 * (h_0[i - 1][j] + h_0[i][j] + h_0[i - 1][j - 1] + h_0[i][j - 1])) {
          vx_1[i][j][k] = 0;
          vz_1[i][j][k] = 0;
        }
      }
    }
  }
  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Nz; j++) {
      h_1[i][j] = h_0[i][j] + f_h(vx_0, vz_0, h_0, i, j)*dt;
      if (h_1[i][j] < 0){
        h_1[i][j] = 0;
      } else if (h_1[i][j] > y){
        h_1[i][j] = y;
      }
    }
  }
  for (let i = 1; i < Nx; i++) {
    for (let j = 1; j < Nz; j++) {
      for (let k = 1; k < Ny; k++) {
        vx_2[i][j][k] = 3./4 * vx_0[i][j][k] + 1./4 * (vx_1[i][j][k] + f_vx(vx_1, vz_1, h_1, i, j, k)*dt);
        vz_2[i][j][k] = 3./4 * vz_0[i][j][k] + 1./4 * (vz_1[i][j][k] + f_vz(vx_1, vz_1, h_1, i, j, k)*dt);
        if (k * dy > 0.25 * (h_1[i - 1][j] + h_1[i][j] + h_1[i - 1][j - 1] + h_1[i][j - 1])) {
          vx_2[i][j][k] = 0;
          vz_2[i][j][k] = 0;
        }
      }
    }
  }
  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Nz; j++) {
      h_2[i][j] = 3./4 * h_0[i][j] + 1./4 * (h_1[i][j] + f_h(vx_1, vz_1, h_1, i, j)*dt);
      if (h_1[i][j] < 0){
        h_2[i][j] = 0;
      } else if (h_1[i][j] > y){
        h_2[i][j] = y;
      }
    }
  }
  for (let i = 1; i < Nx; i++) {
    for (let j = 1; j < Nz; j++) {
      for (let k = 1; k < Ny; k++) {
        vx[i][j][k] = 1./3 * vx_0[i][j][k] + 2./3 * (vx_2[i][j][k] + f_vx(vx_2, vz_2, h_2, i, j, k)*dt);
        vz[i][j][k] = 1./3 * vz_0[i][j][k] + 2./3 * (vz_2[i][j][k] + f_vz(vx_2, vz_2, h_2, i, j, k)*dt);
        if (k * dy > 0.25 * (h_2[i - 1][j] + h_2[i][j] + h_2[i - 1][j - 1] + h_2[i][j - 1])) {
          vx[i][j][k] = 0;
          vz[i][j][k] = 0;
        }
      }
    }
  }
  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Nz; j++) {
      h[i][j] = 1./3 * h_0[i][j] + 2./3 * (h_2[i][j] + f_h(vx_2, vz_2, h_2, i, j)*dt);
      if (h[i][j] < 0){
        h[i][j] = 0;
      } else if (h[i][j] > y){
        h[i][j] = y;
      }
      cubes[i][j].position.y = 0.5 * h[i][j] - 0.5 * y;
      cubes[i][j].scale.y = h[i][j];
    }
  }
  reset_rate = 0.002;
  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Nz; j++) {
      h[i][j] = h[i][j] * (1-reset_rate) + h_init[i][j] * reset_rate;
      for (let k = 0; k < Ny; k++){
        vx[i][j][k] = vx[i][j][k] * (1-reset_rate) + vx_init[i][j][k] * reset_rate;
        vz[i][j][k] = vz[i][j][k] * (1-reset_rate) + vz_init[i][j][k] * reset_rate;
      }
    }
  }
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