import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import * as THREE from "three";
import { useCardAnimation } from "~/components/Card/hooks/useCardAnimation";
import { useCamera } from "~/hooks/useCamera";
import { useScene } from "~/hooks/useScene";

export type FrameCallback = (deltaSeconds: number) => void;

interface ThreeContextValue {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  subscribe: (callback: FrameCallback) => () => void;
}

const ThreeContext = createContext<ThreeContextValue | null>(null);

export function useThree(): ThreeContextValue {
  const context = useContext(ThreeContext);

  if (!context) {
    throw new Error("useThree must be use inside <ThreeProvider>");
  }

  return context;
}

export function ThreeProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const subscribersRef = useRef(new Set<FrameCallback>());

  const { scene } = useScene();
  const { camera } = useCamera();

  const subscribe = useCallback((callback: FrameCallback) => {
    const subscribers = subscribersRef.current;

    subscribers.add(callback);

    return () => {
      subscribers.delete(callback);
    };
  }, []);

  useCardAnimation(canvasRef, {
    scene,
    camera,
    onFrame: (deltaSeconds: number) => {
      subscribersRef.current.forEach((callback) => callback(deltaSeconds));
    },
  });

  const value = useMemo(
    () => ({ scene, camera, subscribe }),
    [scene, camera, subscribe],
  );

  return (
    <ThreeContext.Provider value={value}>
      <canvas ref={canvasRef} className="threejs" />
      {children}
    </ThreeContext.Provider>
  );
}
