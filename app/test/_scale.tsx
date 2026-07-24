import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useResizeWindow } from "~/hooks/useResizeWindow";

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

    const scene = new THREE.Scene();

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: "purple",
      wireframe: true,
    });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // scale
    // cubeMesh.scale.y = 2;
    // uso il set per impostare un vettore che mi cambia x,y,z;
    // cubeMesh.scale.set(2, 2, 1);
    cubeMesh.scale.setScalar(0.5);

    scene.add(cubeMesh);

    if (!camera) return;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.autoRotate = false;

    const renderloop = () => {
      renderer.setSize(innerWidth, innerHeight);

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
