import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

const MAX_HOVER_ANGLE = Math.PI / 12;
const LERP_SPEED = 0.05;
const REFERENCE_FPS = 120;
const DRAG_SPEED = 0.01;
const SWIPE_TRESHOLD = 150;

interface CardInteractionsOptions {
  camera: THREE.PerspectiveCamera;
  card: React.RefObject<THREE.Group | null>;
  pivot: React.RefObject<THREE.Group | null>;
}

export function useCardInteractions({
  camera,
  card,
  pivot,
}: CardInteractionsOptions) {
  const raycasterRef = useRef<THREE.Raycaster>(null);
  const mouseNDCRef = useRef<THREE.Vector2>(null);

  const isDraggingRef = useRef<boolean>(false);
  const currentFlipAngleRef = useRef<number>(0);
  const dragStartXRef = useRef<number>(0);
  const dragTargetYRef = useRef<number>(0);

  const pitchRef = useRef<number>(0);
  const yawRef = useRef<number>(0);

  const cursorRef = useRef<string>("default");

  const isOverCard = useCallback(() => {
    if (!pivot.current || !raycasterRef.current || !mouseNDCRef.current)
      return false;

    raycasterRef.current.setFromCamera(mouseNDCRef.current, camera);
    return raycasterRef.current.intersectObject(pivot.current, true).length > 0;
  }, [camera, pivot]);

  const setCursor = useCallback((next: string) => {
    if (cursorRef.current === next) return;

    cursorRef.current = next;
    document.body.style.cursor = next;
  }, []);

  useEffect(() => {
    raycasterRef.current = new THREE.Raycaster();
    mouseNDCRef.current = new THREE.Vector2();

    function onMouseMoveEvent(e: MouseEvent) {
      if (mouseNDCRef.current === null) return;

      // Update vettore NDC per Raycaster e Hover
      mouseNDCRef.current.x = (e.clientX / innerWidth) * 2 - 1;
      mouseNDCRef.current.y = -(e.clientY / innerHeight) * 2 + 1;

      if (isDraggingRef.current) {
        const deltaX = e.clientX - dragStartXRef.current;
        dragTargetYRef.current =
          currentFlipAngleRef.current + deltaX * DRAG_SPEED;
      }
    }

    function onMouseDownEvent(e: MouseEvent) {
      if (!pivot.current || !mouseNDCRef.current || !raycasterRef.current)
        return;

      const isOver = isOverCard();

      if (isOver) {
        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
      }
    }

    function onMouseUpEvent(e: MouseEvent) {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;

      const deltaX = e.clientX - dragStartXRef.current;

      if (Math.abs(deltaX) > SWIPE_TRESHOLD) {
        currentFlipAngleRef.current += Math.sign(deltaX) * Math.PI;
      }

      dragTargetYRef.current = currentFlipAngleRef.current;
    }

    window.addEventListener("mousemove", onMouseMoveEvent);
    window.addEventListener("mousedown", onMouseDownEvent);
    window.addEventListener("mouseup", onMouseUpEvent);

    return () => {
      window.removeEventListener("mousemove", onMouseMoveEvent);
      window.removeEventListener("mousedown", onMouseDownEvent);
      window.removeEventListener("mouseup", onMouseUpEvent);

      document.body.style.cursor = "default";
      cursorRef.current = "default";
    };
  }, [camera, pivot]);

  function update(deltaSeconds: number) {
    if (!pivot.current || !card.current || !mouseNDCRef.current) return;

    const isOver = isOverCard();

    let hoverTargetX = 0;
    let hoverTargetY = 0;

    if (isOver) {
      const flipMultiplier = Math.cos(yawRef.current);

      hoverTargetX = mouseNDCRef.current.y * MAX_HOVER_ANGLE * flipMultiplier;
      hoverTargetY = mouseNDCRef.current.x * MAX_HOVER_ANGLE;
    }

    if (isDraggingRef.current) setCursor("grabbing");
    else setCursor(isOver ? "grab" : "default");

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

    card.current.rotation.x = pitchRef.current;
    pivot.current.rotation.y = yawRef.current;
  }

  return { update };
}
