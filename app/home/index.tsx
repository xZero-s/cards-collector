import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useCamera } from "~/hooks/useCamera";
import { useScene } from "~/hooks/useScene";

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scene } = useScene();
  const { camera } = useCamera();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });

    const geometry = new THREE.PlaneGeometry(1.4, 2);
    const planeMaterialFront = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.FrontSide,
    });
    const planeMaterialBack = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      side: THREE.BackSide,
    });
    const frontCard = new THREE.Mesh(geometry, planeMaterialFront);
    frontCard.position.set(0, 0, 0);

    const backCard = new THREE.Mesh(geometry, planeMaterialBack);
    backCard.position.set(0, 0, -0.01);

    const card = new THREE.Group();
    card.add(frontCard);
    card.add(backCard);
    scene.add(card);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.25;
    controls.minPolarAngle = 1.25;
    controls.maxPolarAngle = 1.75;
    controls.minAzimuthAngle = -0.3;
    controls.maxAzimuthAngle = 0.3;

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
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <main>
      <canvas ref={canvasRef} className="threejs" />
    </main>
  );
}
