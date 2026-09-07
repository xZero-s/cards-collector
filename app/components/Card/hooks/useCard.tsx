import { useEffect, useRef } from "react";
import * as THREE from "three";

const WIDTH = 1.4;
const HEIGHT = 2;
const RADIUS = 0.12;
const GAP = 0.01;
const CURVED_SEGMENTS = 12;

const FALLBACK_FRONT_COLOR = 0x00ff00;
const FALLBACK_BACK_COLOR = 0x0000ff;

interface CardOptions {
  scene: THREE.Scene;
  frontTexture?: string;
  backTexture?: string;
}

interface Card {
  pivot: THREE.Group;
  card: THREE.Group;
  dispose: () => void;
}

export function useCard({ scene, frontTexture, backTexture }: CardOptions) {
  const cardRef = useRef<THREE.Group | null>(null);
  const pivotRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const { pivot, card, dispose } = createCard(frontTexture, backTexture);

    cardRef.current = card;
    pivotRef.current = pivot;
    scene.add(pivot);

    return () => {
      scene.remove(pivot);
      dispose();
      cardRef.current = null;
      pivotRef.current = null;
    };
  }, [scene, frontTexture, backTexture]);

  return {
    pivot: pivotRef,
    card: cardRef,
  };
}

function createCard(frontTexture?: string, backTexture?: string): Card {
  const geometry = roundedGeometry();

  const planeMaterialFront = new THREE.MeshBasicMaterial({
    color: FALLBACK_FRONT_COLOR,
    side: THREE.FrontSide,
  });
  const planeMaterialBack = new THREE.MeshBasicMaterial({
    color: FALLBACK_BACK_COLOR,
    side: THREE.BackSide,
  });
  const frontCard = new THREE.Mesh(geometry, planeMaterialFront);
  frontCard.position.set(0, 0, 0);

  const backCard = new THREE.Mesh(geometry, planeMaterialBack);
  backCard.position.set(0, 0, -GAP);

  const card = new THREE.Group();
  card.add(frontCard);
  card.add(backCard);

  const pivot = new THREE.Group();
  pivot.add(card);

  return {
    card,
    pivot,
    dispose() {
      geometry.dispose();
    },
  };
}

function roundedGeometry() {
  const w = WIDTH / 2;
  const h = HEIGHT / 2;
  const r = Math.min(RADIUS, w, h);

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
    uv.setXY(i, pos.getX(i) / WIDTH + 0.5, pos.getY(i) / HEIGHT + 0.5);
  }

  uv.needsUpdate = true;

  return geometry;
}
