import { Card } from "~/components/Card/Card";
import { ThreeProvider } from "~/providers/ThreeProvider";

export function HomePage() {
  return (
    <main>
      <ThreeProvider>
        <Card />
      </ThreeProvider>
    </main>
  );
}
