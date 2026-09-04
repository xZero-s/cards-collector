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
      antialias: true,
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

    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    let hoverTargetX = 0;
    let hoverTargetY = 0;
    const maxHoverAngle = Math.PI / 12;

    let pitch = 0;
    let yaw = 0;
    const lerpSpeed = 0.05;

    window.addEventListener("mousemove", (e: MouseEvent) => {
      // Update vettore NDC per Raycaster e Hover
      mouseNDC.x = (e.clientX / innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / innerHeight) * 2 + 1;
    });

    function animate() {
      requestAnimationFrame(animate);

      renderer.setSize(innerWidth, innerHeight);
      const maxPixelRatio = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(maxPixelRatio);

      // hover animation
      raycaster.setFromCamera(mouseNDC, camera);
      const intersects = raycaster.intersectObject(pivot, true);

      if (intersects.length > 0) {
        const flipMultiplier = Math.cos(yaw);

        hoverTargetX = mouseNDC.y * maxHoverAngle * flipMultiplier;
        hoverTargetY = mouseNDC.x * maxHoverAngle;
      } else {
        hoverTargetX = 0;
        hoverTargetY = 0;
      }

      const finalTargetX = hoverTargetX;
      const finalTargetY = hoverTargetY;

      pitch = THREE.MathUtils.lerp(pitch, finalTargetX, lerpSpeed);
      yaw = THREE.MathUtils.lerp(yaw, finalTargetY, lerpSpeed);

      card.rotation.x = pitch;
      pivot.rotation.y = yaw;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      renderer.dispose();
    };
  }, [camera, scene]);

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
