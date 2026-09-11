import * as THREE from "three";
import { useCard } from "./hooks/useCard";
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

export function Card({
  frontTexture,
  backTexture,
  width,
  height,
  radius,
}: CardProps) {
  const geometry = useCard({
    frontTexture,
    backTexture,
    width,
    height,
    radius,
  });
  const { pivotRef, cardRef, glareRef, handlers } = useCardTilt({
    width,
    height,
  });

  return (
    <>
      <pointLight ref={glareRef} visible={false} color={"white"} />

      <group ref={pivotRef}>
        <group ref={cardRef}>
          <mesh geometry={geometry}>
            <meshStandardMaterial
              color={FALLBACK_FRONT_COLOR}
              side={THREE.FrontSide}
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>

          <mesh geometry={geometry} position={[0, 0, -GAP]}>
            <meshStandardMaterial
              color={FALLBACK_BACK_COLOR}
              side={THREE.BackSide}
              roughness={0.7}
              metalness={0.1}
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
