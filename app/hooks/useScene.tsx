import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useScene() {
  const scene = useRef<THREE.Scene<THREE.Object3DEventMap>>(null);
  if (scene.current === null) {
    scene.current = new THREE.Scene();
  }

  useEffect(() => {
    if (!scene.current) return;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const pointLight = new THREE.PointLight(0xffffff, 0.9);
    pointLight.position.set(1, 1, 1);

    scene.current.add(ambientLight, pointLight);

    return () => {
      scene.current?.remove(ambientLight, pointLight);
      ambientLight.dispose();
      pointLight.dispose();
    };
  }, [scene]);

  return {
    scene: scene.current,
  };
}
