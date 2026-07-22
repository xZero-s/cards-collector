import type { Route } from "./+types/home";
import { HomePage } from "../home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Card Collector" },
    { name: "description", content: "Collect them all!" },
  ];
}

export default function Home() {
  return <HomePage />;
}
