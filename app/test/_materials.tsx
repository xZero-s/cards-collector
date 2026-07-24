import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useResizeWindow } from "~/hooks/useResizeWindow";
import { Pane } from "tweakpane";

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    cameraRef.current = new THREE.PerspectiveCamera(
      35,
      innerWidth / innerHeight,
      0.5,
      30,
    );
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !cameraRef.current) return;

    const canvas = canvasRef.current;
    const camera = cameraRef.current;

    // initialize the pane
    const pane = new Pane();

    const scene = new THREE.Scene();

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
    const planeGeometry = new THREE.PlaneGeometry(1, 1);

    // initialize material
    /* --- Mesh Basic Material + FOG ---
    const material = new THREE.MeshBasicMaterial();
    material.color = new THREE.Color(0x00ff00);
    material.transparent = true;
    material.opacity = 0.5;
    material.side = THREE.DoubleSide; // Se vogliamo vedere entrambi i lati di un plane, THREE.FrontSide solo per il fronte
    material.fog = true; // True di default

    // initialize fog
    const fog = new THREE.Fog(0xffffff, 1, 10);
    scene.fog = fog;
    scene.background = new THREE.Color(0xffffff); // Per funzionare bene, lo sfondo deve essere dello stesso colore del fog */

    // --- Mesh Lambert Material ---
    // const material = new THREE.MeshLambertMaterial();

    /* --- Mesh Phong Material ---
    const material = new THREE.MeshPhongMaterial();
    material.shininess = 50;
    material.color = new THREE.Color("red");

    pane.addBinding(material, "shininess", {
      min: 0,
      max: 100,
      step: 1,
    });*/

    /* --- Mesh Standard Material ---
    const material = new THREE.MeshStandardMaterial();
    material.color = new THREE.Color("green");

    pane.addBinding(material, "metalness", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    pane.addBinding(material, "roughness", {
      min: 0,
      max: 1,
      step: 0.01,
    });*/

    // --- Mesh Physical Material ---
    const material = new THREE.MeshPhysicalMaterial();
    material.color = new THREE.Color("green");

    pane.addBinding(material, "metalness", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    pane.addBinding(material, "roughness", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    pane.addBinding(material, "reflectivity", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    pane.addBinding(material, "clearcoat", {
      min: 0,
      max: 1,
      step: 0.01,
    });

    // initialize the meshes
    const cubeMesh = new THREE.Mesh(cubeGeometry, material);

    const cubeMesh2 = new THREE.Mesh(torusKnotGeometry, material);
    cubeMesh2.position.x = 1.5;

    const plane = new THREE.Mesh(planeGeometry, material);
    plane.position.x = -1.5;

    scene.add(cubeMesh);
    scene.add(cubeMesh2);
    scene.add(plane);

    // initialize the light
    const light = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(light);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(1, 1, 1);
    scene.add(pointLight);

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

      // Anti-Alising
      const maxPixelRatio = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(maxPixelRatio);

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
