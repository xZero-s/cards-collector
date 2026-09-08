import { useMemo } from "react";
import * as THREE from "three";

const CURVED_SEGMENTS = 12;

interface CardProps {
  frontTexture?: string;
  backTexture?: string;
}

export function useCardRedesign({ frontTexture, backTexture }: CardProps) {
  function roundedGeometry(width: number, height: number, radius: number) {
    return useMemo(() => {
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

      const geometry = new THREE.ShapeGeometry(shape, CURVED_SEGMENTS);

      const pos = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        uv.setXY(i, pos.getX(i) / width + 0.5, pos.getY(i) / height + 0.5);
      }

      uv.needsUpdate = true;

      return geometry;
    }, [width, height, radius]);
  }

  return {
    geometry: roundedGeometry,
  };
}
