import { useRef, useState } from "react";
import { useCamera } from "~/hooks/useCamera";
import { useScene } from "~/hooks/useScene";
import { useCard } from "./hooks/useCard";
import { useCardInteractions } from "./hooks/useCardInteractions";
import { useCardAnimation } from "./hooks/useCardAnimation";

export function Card(frontCard?: string, backCard?: string) {
  const [cardBackgrounds, setCardBackgrounds] = useState([
    frontCard ?? "",
    backCard ?? "",
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scene } = useScene();
  const { camera } = useCamera();
  const { card, pivot } = useCard({ scene });
  const { update } = useCardInteractions({ camera, card, pivot });

  useCardAnimation(canvasRef, { scene, camera, onFrame: update });

  return <canvas ref={canvasRef} className="threejs" />;
}
