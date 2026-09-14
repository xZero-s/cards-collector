import { useCallback, useEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

const MAX_HOVER_ANGLE = Math.PI / 12;
const LERP_SPEED = 0.05;
const REFERENCE_FPS = 120;
const DRAG_SPEED = 0.01;
const SWIPE_TRESHOLD = 150;
const GLARE_DISTANCE = 1.2;
const GLARE_INTENSITY = 0.8;

interface CardTiltProps {
  width: number;
  height: number;
}

type PointerCaptureTarget = {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
  hasPointerCapture(pointerId: number): boolean;
};

function captureTarget(e: ThreeEvent<PointerEvent>) {
  return e.target as unknown as PointerCaptureTarget;
}

export function useCardTilt({ width, height }: CardTiltProps) {
  const pivotRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Group>(null);
  const uvRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const glareRef = useRef<THREE.PointLight>(new THREE.PointLight());

  const isOverRef = useRef(false);
  const isDraggingRef = useRef(false);

  const pitchRef = useRef(0);
  const yawRef = useRef(0);
  const currentFlipAngleRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragTargetYRef = useRef(0);

  const onPointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isOverRef.current = true;
    if (!isDraggingRef.current) document.body.style.cursor = "grab";
  }, []);

  const onPointerOut = useCallback(() => {
    isOverRef.current = false;
    if (!isDraggingRef.current) document.body.style.cursor = "default";
  }, []);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    captureTarget(e).setPointerCapture(e.pointerId);

    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    document.body.style.cursor = "grabbing";
  }, []);

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartXRef.current;
      dragTargetYRef.current =
        currentFlipAngleRef.current + deltaX * DRAG_SPEED;
      return;
    }

    if (e.uv) uvRef.current?.set(e.uv.x * 2 - 1, e.uv.y * 2 - 1);
  }, []);

  const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return;

    captureTarget(e).releasePointerCapture(e.pointerId);
    isDraggingRef.current = false;

    const deltaX = e.clientX - dragStartXRef.current;

    if (Math.abs(deltaX) > SWIPE_TRESHOLD) {
      currentFlipAngleRef.current += Math.sign(deltaX) * Math.PI;
    }

    dragTargetYRef.current = currentFlipAngleRef.current;
    document.body.style.cursor = isOverRef.current ? "grab" : "default";
  }, []);

  useEffect(() => () => void (document.body.style.cursor = "default"), []);

  useFrame((_state, deltaSeconds) => {
    const pivot = pivotRef.current;
    const card = cardRef.current;
    if (!pivot || !card) return;

    let hoverTargetX = 0;
    let hoverTargetY = 0;

    if (isOverRef.current) {
      const flipMultiplier = Math.cos(yawRef.current);

      hoverTargetX = uvRef.current.y * MAX_HOVER_ANGLE * flipMultiplier;
      hoverTargetY = uvRef.current.x * MAX_HOVER_ANGLE;
    }

    const time = 1 - Math.exp(-LERP_SPEED * REFERENCE_FPS * deltaSeconds);

    pitchRef.current = THREE.MathUtils.lerp(
      pitchRef.current,
      hoverTargetX,
      time,
    );
    yawRef.current = THREE.MathUtils.lerp(
      yawRef.current,
      dragTargetYRef.current + hoverTargetY,
      time,
    );

    glareRef.current.intensity = THREE.MathUtils.lerp(
      glareRef.current.intensity,
      isOverRef.current ? GLARE_INTENSITY : 0,
      time,
    );

    glareRef.current.visible = isOverRef.current;
    glareRef.current.position.set(
      uvRef.current.x * (width / 2),
      uvRef.current.y * (height / 2),
      GLARE_DISTANCE,
    );

    card.rotation.x = pitchRef.current;
    pivot.rotation.y = yawRef.current;
  });

  return {
    pivotRef,
    cardRef,
    glareRef,
    handlers: {
      onPointerOver,
      onPointerOut,
      onPointerMove,
      onPointerDown,
      onPointerUp,
    },
  };
}
