import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useResizeWindow } from "~/hooks/useResizeWindow";

// console.log(OrbitControls);

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);

  useEffect(() => {
    // initialize the camera
    /**
      --- ORTOGRAPHIC CAMERA
      const camera = new THREE.OrthographicCamera(
        -1 * window.innerWidth / window.innerHeight,
        1,
        1,
        -1,
        0.1,
        200,
      );
    */

    // --- PERSPECTIVE CAMERA
    cameraRef.current = new THREE.PerspectiveCamera(
      35, // FOV -> più vicino allo 0, più la camera è vicina alla mesh
      innerWidth / innerHeight, // Aspect Ratio
      0.5, // NEAR -> indica entro quanto puoi vedere la mesh. 0.05, Three.js non usa numeri dopo il decimale
      30, // FAR
    );

    // initialize the renderer
    if (canvasRef.current)
      rendererRef.current = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
      });
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !cameraRef.current || !rendererRef.current)
      return;

    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    // initialize the scene
    const scene = new THREE.Scene();

    // add objects to the scene
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cubeMesh);

    if (!camera) return;
    camera.position.z = 5;

    // instantiate the controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true; // Dumping -> permette di avere delle rotazioni fluide quando si ruota la camera
    controls.autoRotate = true;

    // render the scene
    const renderloop = () => {
      renderer.setSize(innerWidth, innerHeight);

      controls.update(); // Serve se controls.enableDamping = true o quando controls.autoRotate = true
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
    cameraRef.current.updateProjectionMatrix(); // Va chiamata quando si vuole aggiornare dei valori della camera
  });

  return (
    <main>
      <canvas ref={canvasRef} className="threejs" />
    </main>
  );
}
