import { useEffect, useRef } from "react";
import { useCard } from "./hooks/useCard";
import { useCardInteractions } from "./hooks/useCardInteractions";
import { useThree } from "~/providers/ThreeProvider";

interface CardProps {
  frontTexture?: string;
  backTexture?: string;
}

export function Card({ frontTexture, backTexture }: CardProps) {
  const { scene, camera, subscribe } = useThree();
  const { card, pivot } = useCard({ scene, frontTexture, backTexture });
  const { update } = useCardInteractions({ camera, card, pivot });

  const updateRef = useRef(update);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(
    () => subscribe((deltaSeconds: number) => updateRef.current(deltaSeconds)),
    [subscribe],
  );

  return null;
}
