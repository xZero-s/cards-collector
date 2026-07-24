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

    /*const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: "purple",
      wireframe: true,
    });*/
    const vertices = new Float32Array([0, 0, 0, 0, 2, 0, 2, 0, 0]);
    const bufferAttribute = new THREE.BufferAttribute(vertices, 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", bufferAttribute);

    const geometryMaterial = new THREE.MeshBasicMaterial({
      color: "purple",
      wireframe: true,
    });
    const geometryMesh = new THREE.Mesh(geometry, geometryMaterial);

    scene.add(geometryMesh);

    const tempVector = new THREE.Vector3(0, 0, 0);
    geometryMesh.position.copy(tempVector);

    if (!axesHelperRef.current) return;
    scene.add(axesHelperRef.current);

    if (!camera) return;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.autoRotate = true;

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
