import * as THREE from "three";
import { useCardRedesign } from "./hooks/useCard";
import { useCardTilt } from "./hooks/useCardInteractions";

const WIDTH = 1.4;
const HEIGHT = 2;
const RADIUS = 0.12;
const GAP = 0.01;
const FALLBACK_FRONT_COLOR = 0x00ff00;
const FALLBACK_BACK_COLOR = 0x0000ff;

interface CardProps {
  frontTexture?: string;
  backTexture?: string;
}

export function CardRedesign({ frontTexture, backTexture }: CardProps) {
  const { geometry } = useCardRedesign({ frontTexture, backTexture });
  const { pivotRef, cardRef, handlers } = useCardTilt();

  return (
    <>
      <group ref={pivotRef}>
        <group ref={cardRef}>
          <mesh geometry={geometry(WIDTH, HEIGHT, RADIUS)}>
            <meshBasicMaterial
              color={FALLBACK_FRONT_COLOR}
              side={THREE.FrontSide}
            />
          </mesh>

          <mesh
            geometry={geometry(WIDTH, HEIGHT, RADIUS)}
            position={[0, 0, -GAP]}
          >
            <meshBasicMaterial
              color={FALLBACK_BACK_COLOR}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      </group>

      <mesh geometry={geometry(WIDTH, HEIGHT, RADIUS)} {...handlers}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}
