import { useEffect, useRef } from "react";
import * as THREE from "three";
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

    const geometry = roundedGeometry(1.4, 2, 0.12);
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

    const pivot = new THREE.Group();
    pivot.add(card);

    scene.add(pivot);

    const minAngleX = -Math.PI / 8;
    const maxAngleX = Math.PI / 8;
    const minAngleY = -Math.PI;
    const maxAngleY = Math.PI / 8;

    let targetPitch = 0;
    let targetYaw = 0;
    let currentPitch = 0;
    let currentYaw = 0;

    const lerpSpeed = 0.05;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    window.addEventListener("mousedown", (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });

    window.addEventListener("mousemove", (e: MouseEvent) => {
      if (isDragging) {
        const deltaMove = {
          x: e.offsetX - previousMousePosition.x,
          y: e.offsetY - previousMousePosition.y,
        };

        const rotationSpeed = 0.01;

        targetPitch += deltaMove.y * rotationSpeed;
        targetPitch = THREE.MathUtils.clamp(targetPitch, minAngleX, maxAngleX);

        targetYaw += deltaMove.x * rotationSpeed;
        targetYaw = THREE.MathUtils.clamp(targetYaw, minAngleY, maxAngleY);
      }

      previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
      targetPitch = 0;
    });

    const renderloop = () => {
      renderer.setSize(innerWidth, innerHeight);
      const maxPixelRatio = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(maxPixelRatio);

      currentPitch = THREE.MathUtils.lerp(currentPitch, targetPitch, lerpSpeed);
      currentYaw = THREE.MathUtils.lerp(currentYaw, targetYaw, lerpSpeed);

      pivot.rotation.x = currentPitch;
      card.rotation.y = currentYaw;

      window.requestAnimationFrame(renderloop);
      renderer.render(scene, camera);
    };

    renderloop();

    return () => {
      renderer.dispose();
    };
  }, []);

  function roundedGeometry(
    width: number,
    height: number,
    radius: number,
    curvedSegments: number = 12,
  ) {
    const w = width / 2;
    const h = height / 2;
    const r = Math.min(radius, w, h);

    const shape = new THREE.Shape();
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0);
    shape.lineTo(w, h - r);
    shape.absarc(w - r, h - r, r, 0, Math.PI / 2);
    shape.lineTo(-w + r, h);
    shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI);
    shape.lineTo(-w, -h + r);
    shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5);

    const geometry = new THREE.ShapeGeometry(shape, curvedSegments);

    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, pos.getX(i) / width + 0.5, pos.getY(i) / height + 0.5);
    }

    uv.needsUpdate = true;

    return geometry;
  }

  return (
    <main>
      <canvas ref={canvasRef} className="threejs" />
    </main>
  );
}
