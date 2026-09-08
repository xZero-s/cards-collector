import * as THREE from "three";
import { useCardRedesign } from "./hooks/useCard";
import { useCardTilt } from "./hooks/useCardInteractions";

const GAP = 0.01;
const FALLBACK_FRONT_COLOR = 0x00ff00;
const FALLBACK_BACK_COLOR = 0x0000ff;

interface CardProps {
  frontTexture?: string;
  backTexture?: string;
  width: number;
  height: number;
  radius: number;
}

export function CardRedesign({
  frontTexture,
  backTexture,
  width,
  height,
  radius,
}: CardProps) {
  const geometry = useCardRedesign({
    frontTexture,
    backTexture,
    width,
    height,
    radius,
  });
  const { pivotRef, cardRef, handlers } = useCardTilt();

  return (
    <>
      <group ref={pivotRef}>
        <group ref={cardRef}>
          <mesh geometry={geometry}>
            <meshBasicMaterial
              color={FALLBACK_FRONT_COLOR}
              side={THREE.FrontSide}
            />
          </mesh>

          <mesh geometry={geometry} position={[0, 0, -GAP]}>
            <meshBasicMaterial
              color={FALLBACK_BACK_COLOR}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      </group>

      <mesh geometry={geometry} {...handlers}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}
