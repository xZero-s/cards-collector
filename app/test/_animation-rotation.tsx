import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useResizeWindow } from "~/hooks/useResizeWindow";

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

    const scene = new THREE.Scene();

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: "purple",
      wireframe: true,
    });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

    scene.add(cubeMesh);

    const tempVector = new THREE.Vector3(0, 0, 0);
    cubeMesh.position.copy(tempVector);

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

    // initialize the clock
    const timer = new THREE.Timer();

    const renderloop = () => {
      renderer.setSize(innerWidth, innerHeight);

      const maxPixelRatio = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(maxPixelRatio);

      timer.update(); // Serve per far funzionare il timer

      // apply delta to rotation
      const delta = timer.getDelta();
      cubeMesh.rotation.y += THREE.MathUtils.degToRad(1) * delta * 20; // Permette di gestire le frequenze dei monitor

      // apply sin wave to scale
      const currentTime = timer.getElapsed();
      cubeMesh.scale.x = Math.sin(currentTime) * 5 + 1;

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
