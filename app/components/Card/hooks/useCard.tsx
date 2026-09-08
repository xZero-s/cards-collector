import { useMemo } from "react";
import * as THREE from "three";

const CURVED_SEGMENTS = 12;

interface CardProps {
  frontTexture?: string;
  backTexture?: string;
  width: number;
  height: number;
  radius: number;
}

export function useCardRedesign({
  frontTexture,
  backTexture,
  width,
  height,
  radius,
}: CardProps) {
  const geometry = useMemo(() => {
    const w = width / 2;
    const h = height / 2;
    const r = Math.min(radius, w, h);

    const shape = new THREE.Shape();
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0);
    shape.lineTo(w, h - r);
    shape.absarc(w - r, h - r, r, 0, Math.PI / 2);
    shape.lineTo(-w + r, h);
    shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI);
    shape.lineTo(-w, -h + r);
    shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5);

    const shapeGeometry = new THREE.ShapeGeometry(shape, CURVED_SEGMENTS);

    const pos = shapeGeometry.attributes.position;
    const uv = shapeGeometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, pos.getX(i) / width + 0.5, pos.getY(i) / height + 0.5);
    }

    uv.needsUpdate = true;

    return shapeGeometry;
  }, [width, height, radius]);

  return geometry;
}
