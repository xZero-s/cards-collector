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

    const cubeMesh2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh2.position.x = 2;

    const cubeMesh3 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh3.position.x = -2;

    // group
    const group = new THREE.Group();
    group.add(cubeMesh);
    group.add(cubeMesh2);
    group.add(cubeMesh3);

    group.position.y = 2;
    group.scale.setScalar(2);

    scene.add(group);

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
