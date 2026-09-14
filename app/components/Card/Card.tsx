import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useCard } from "./hooks/useCard";
import { useCardInteractions } from "./hooks/useCardInteractions";
import "./materials/holographicMaterial";

import colorFrontImg from "./textures/onyx/onyx_color.webp";
import roughnessFrontImg from "./textures/onyx/onyx_roughness.webp";
import grainFoilImg from "./textures/foil/foil_normal.webp";
import colorBackImg from "./textures/ground/ground_color.webp";
import normalBackImg from "./textures/ground/ground_normal.webp";
import roughnessBackImg from "./textures/ground/ground_roughness.webp";

const GAP = 0.01;
const HOLO_GAP = 0.001;

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
  const { pivotRef, cardRef, glareRef, holoRef, handlers } =
    useCardInteractions({
      width,
      height,
    });

  const [
    colorFrontMap,
    roughnessFrontMap,
    grainFoilMap,
    colorBackMap,
    normalBackMap,
    roughnessBackMap,
  ] = useTexture([
    colorFrontImg,
    roughnessFrontImg,
    grainFoilImg,
    colorBackImg,
    normalBackImg,
    roughnessBackImg,
  ]);

  colorFrontMap.colorSpace = THREE.SRGBColorSpace;
  colorBackMap.colorSpace = THREE.SRGBColorSpace;

  // la grana viene ripetuta piu' volte sulla carta: senza RepeatWrapping
  // il wrap di default (ClampToEdge) spalmerebbe i bordi
  grainFoilMap.wrapS = THREE.RepeatWrapping;
  grainFoilMap.wrapT = THREE.RepeatWrapping;

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
          <mesh geometry={geometry} position={[0, 0, HOLO_GAP]}>
            <holographicMaterial
              ref={holoRef}
              uMaskMap={colorFrontMap}
              uGrainMap={grainFoilMap}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.FrontSide}
            />
          </mesh>

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
