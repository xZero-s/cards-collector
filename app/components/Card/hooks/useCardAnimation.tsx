import { timeStamp } from "console";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useResizeWindow } from "~/hooks/useResizeWindow";

const MAX_PIXEL_RATIO = 2;

type FrameCallback = (delta: number) => void;

interface AnimateOptions {
  scene: THREE.Scene;
  camera: THREE.Camera;
  onFrame?: FrameCallback;
}

export function useCardAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  { scene, camera, onFrame }: AnimateOptions,
) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });

    rendererRef.current = renderer;
    resizeRenderer(renderer);

    const timer = new THREE.Timer();
    timer.connect(document);

    let frameId = 0;

    function animate(timestamp: number) {
      frameId = requestAnimationFrame(animate);
      timer.update(timestamp);
      onFrameRef.current?.(timer.getDelta());

      renderer.render(scene, camera);
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      timer.dispose();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [canvasRef, scene, camera]);

  useResizeWindow(() => {
    if (!rendererRef.current) return;

    resizeRenderer(rendererRef.current);
  });

  return { renderer: rendererRef };
}

function resizeRenderer(renderer: THREE.WebGLRenderer) {
  renderer.setSize(innerWidth, innerHeight);
  const maxPixelRatio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
  renderer.setPixelRatio(maxPixelRatio);
}
