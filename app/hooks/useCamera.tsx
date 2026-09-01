import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useResizeWindow } from "~/hooks/useResizeWindow";

export function useCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  if (cameraRef.current === null) {
    cameraRef.current = new THREE.PerspectiveCamera(35, 1, 1, 400);
  }
  const camera = cameraRef.current;

  useEffect(() => {
    camera.position.z = 5;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, [camera]);

  useResizeWindow(({ width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); // Va chiamata quando si vuole aggiornare dei valori della camera
  });

  return {
    camera,
  };
}
