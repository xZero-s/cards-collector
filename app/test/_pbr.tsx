import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useResizeWindow } from "~/hooks/useResizeWindow";
import { Pane } from "tweakpane";

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const axesHelperRef = useRef<THREE.AxesHelper>(null);

  useEffect(() => {
    cameraRef.current = new THREE.PerspectiveCamera(
      35,
      innerWidth / innerHeight,
      0.5,
      30,
    );

    axesHelperRef.current = new THREE.AxesHelper(2);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !cameraRef.current) return;

    const canvas = canvasRef.current;
    const camera = cameraRef.current;

    const pane = new Pane();

    const scene = new THREE.Scene();

    const textureLoader = new THREE.TextureLoader();
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const uv2CubeGeometry = new THREE.BufferAttribute(
      cubeGeometry.attributes.uv.array,
      2,
    );
    cubeGeometry.setAttribute("uv2", uv2CubeGeometry);

    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
    const uv2TorusKnotGeometry = new THREE.BufferAttribute(
      torusKnotGeometry.attributes.uv.array,
      2,
    );
    torusKnotGeometry.setAttribute("uv2", uv2TorusKnotGeometry);

    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const uv2PlaneGeometry = new THREE.BufferAttribute(
      planeGeometry.attributes.uv.array,
      2,
    );
    planeGeometry.setAttribute("uv2", uv2PlaneGeometry);

    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const uv2SphereGeometry = new THREE.BufferAttribute(
      sphereGeometry.attributes.uv.array,
      2,
    );
    sphereGeometry.setAttribute("uv2", uv2SphereGeometry);

    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const uv2CylinderGeometry = new THREE.BufferAttribute(
      cylinderGeometry.attributes.uv.array,
      2,
    );
    cylinderGeometry.setAttribute("uv2", uv2CylinderGeometry);

    // initialize the texture
    const grassAlbedo = textureLoader.load(
      "static/textures/whispy-grass-meadow-bl/wispy-grass-meadow_albedo.png",
    );
    const grassAo = textureLoader.load(
      "static/textures/whispy-grass-meadow-bl/wispy-grass-meadow_ao.png",
    );
    const grassHeight = textureLoader.load(
      "static/textures/whispy-grass-meadow-bl/wispy-grass-meadow_height.png",
    );
    const grassMetallic = textureLoader.load(
      "static/textures/whispy-grass-meadow-bl/wispy-grass-meadow_metallic.png",
    );
    const grassNormal = textureLoader.load(
      "static/textures/whispy-grass-meadow-bl/wispy-grass-meadow_normal.png",
    );
    const grassRoughness = textureLoader.load(
      "static/textures/whispy-grass-meadow-bl/wispy-grass-meadow_roughness.png",
    );

    // initialize the material
    const material = new THREE.MeshStandardMaterial();
    material.map = grassAlbedo;

    material.roughnessMap = grassRoughness;
    material.roughness = 1;

    material.metalnessMap = grassMetallic;
    material.metalness = 1;

    material.normalMap = grassNormal;

    // meglio usare solo la normal map piuttosto che la height map, perchè quest'ultima va a modficare la forma della mesh
    material.displacementMap = grassHeight;
    material.displacementScale = 0.1;

    material.aoMap = grassAo;

    pane.addBinding(material, "aoMapIntensity", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    const group = new THREE.Group();

    const cube = new THREE.Mesh(cubeGeometry, material);

    const knot = new THREE.Mesh(torusKnotGeometry, material);
    knot.position.x = 1.5;

    const plane = new THREE.Mesh(planeGeometry, material);
    plane.position.x = -1.5;

    const sphere = new THREE.Mesh();
    sphere.geometry = sphereGeometry;
    sphere.material = material;
    sphere.position.y = 1.5;

    const cylinder = new THREE.Mesh();
    cylinder.geometry = cylinderGeometry;
    cylinder.material = material;
    cylinder.position.y = -1.5;

    group.add(cube, knot, plane, sphere, cylinder);
    scene.add(group);

    const light = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(light);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const tempVector = new THREE.Vector3(0, 0, 0);
    cube.position.copy(tempVector);

    if (!axesHelperRef.current) return;
    scene.add(axesHelperRef.current);

    if (!camera) return;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    // controls.autoRotate = true;

    const renderloop = () => {
      renderer.setSize(innerWidth, innerHeight);

      const maxPixelRatio = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(maxPixelRatio);

      // group auto rotate
      /*group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += 0.01;
        }
      });*/

      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(renderloop);
    };

    renderloop();

    return () => {
      renderer.dispose();
    };
  }, []);

  useResizeWindow(({ width = innerWidth, height = innerHeight }) => {
    if (!cameraRef.current) return;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <main>
      <canvas ref={canvasRef} className="threejs" />
    </main>
  );
}
