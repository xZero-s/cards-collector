import { Canvas } from "@react-three/fiber";
import { Card } from "~/components/Card/Card";

const WIDTH = 1.4;
const HEIGHT = 2;
const RADIUS = 0.12;

export function HomePage() {
  return (
    <main className="scene">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 35, near: 1, far: 400, position: [0, 0, 5] }}
      >
        <ambientLight intensity={0.9} />

        <Card width={WIDTH} height={HEIGHT} radius={RADIUS} />
      </Canvas>
    </main>
  );
}
