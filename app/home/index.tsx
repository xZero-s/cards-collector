import { Canvas } from "@react-three/fiber";
import { CardRedesign } from "~/components/CardRedesign/Card";

export function HomePage() {
  return (
    <main className="scene">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 35, near: 1, far: 400, position: [0, 0, 5] }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[1, 1, 1]} intensity={0.9} />
        <CardRedesign />
      </Canvas>
    </main>
  );
}
