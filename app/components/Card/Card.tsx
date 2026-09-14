import * as THREE from "three";
import { useCard } from "./hooks/useCard";
import { useCardTilt } from "./hooks/useCardInteractions";
import { useTexture } from "@react-three/drei";

import colorFrontImg from "./textures/onyx/onyx_color.webp";
import roughnessFrontImg from "./textures/onyx/onyx_roughness.webp";

import colorBackImg from "./textures/ground/ground_color.webp";
import normalBackImg from "./textures/ground/ground_normal.webp";
import roughnessBackImg from "./textures/ground/ground_roughness.webp";
import { useMemo } from "react";

const GAP = 0.01;

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

  const [
    colorFrontMap,
    roughnessFrontMap,
    colorBackMap,
    normalBackMap,
    roughnessBackMap,
  ] = useTexture([
    colorFrontImg,
    roughnessFrontImg,
    colorBackImg,
    normalBackImg,
    roughnessBackImg,
  ]);

  colorFrontMap.colorSpace = THREE.SRGBColorSpace;
  colorBackMap.colorSpace = THREE.SRGBColorSpace;

  const thicknessFrontMap = useMemo(() => {
    const t = colorFrontMap.clone();
    t.colorSpace = THREE.NoColorSpace;
    t.needsUpdate = true;

    return t;
  }, [colorFrontMap]);

  return (
    <>
      <pointLight ref={glareRef} visible={false} color={"white"} decay={1} />

      <group ref={pivotRef}>
        <group ref={cardRef}>
          <mesh geometry={geometry}>
            <meshPhysicalMaterial
              map={colorFrontMap}
              normalMap={thicknessFrontMap}
              normalScale={[0.3, 0.3]}
              roughnessMap={roughnessFrontMap}
              side={THREE.FrontSide}
              metalness={0}
              roughness={0.08}
              iridescence={1}
              iridescenceIOR={1.3}
              iridescenceThicknessMap={thicknessFrontMap}
              iridescenceThicknessRange={[100, 800]}
            />
          </mesh>

          <mesh geometry={geometry} position={[0, 0, -GAP]}>
            <meshPhysicalMaterial
              map={colorBackMap}
              normalMap={normalBackMap}
              roughnessMap={roughnessBackMap}
              side={THREE.BackSide}
              metalness={0.6}
              anisotropy={1}
              anisotropyRotation={0}
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
