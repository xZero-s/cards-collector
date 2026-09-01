import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useCamera } from "~/hooks/useCamera";
import { usePlanets } from "~/hooks/usePlanets";
import { useScene } from "~/hooks/useScene";

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { planets, createPlanet, createMesh } = usePlanets();
  const { scene } = useScene();
  const { camera } = useCamera();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // initialize the renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });

    // createPlanet(
    //   "Mercury",
    //   0.5,
    //   10,
    //   0.01,
    //   [],
    //   "/static/textures/solar-system/mercury-texture-2k.png",
    // );

    createPlanet(
      "Venus",
      0.8,
      15,
      0.007,
      [],
      "/static/textures/solar-system/venus-texture-2k.png",
    );

    createPlanet(
      "Earth",
      1,
      20,
      0.005,
      [
        {
          name: "Moon",
          radius: 0.3,
          distance: 3,
          speed: 0.015,
        },
      ],
      "/static/textures/solar-system/earth-texture-2k.png",
    );

    createPlanet(
      "Mars",
      0.7,
      25,
      0.003,
      [
        {
          name: "Phobos",
          radius: 0.1,
          distance: 2,
          speed: 0.02,
        },
        {
          name: "Deimos",
          radius: 0.2,
          distance: 3,
          speed: 0.015,
          color: 0xffffff,
        },
      ],
      "/static/textures/solar-system/mars-texture-2k.png",
    );

    const planetMeshes = planets.map((planet) => {
      // Appunto: earth.add(moon); -> si possono aggiugnere mesh come figlie di altre mesh per posizionarle
      // earth.rotation.y += 0.01; // quando la mesh ruota, automaticamente le sue figlie ruotano attorno alla mesh

      const planetMesh = createMesh(planet);

      if (planet.moons) {
        planet.moons.forEach((moon) => {
          const moonMesh = createMesh(moon);
          planetMesh.add(moonMesh);
        });
      }

      scene.add(planetMesh);

      return planetMesh;
    });

    // instantiate the controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true; // Dumping -> permette di avere delle rotazioni fluide quando si ruota la camera
    // controls.autoRotate = true;

    // initialize timer
    const timer = new THREE.Timer();

    // render the scene
    const renderloop = () => {
      renderer.setSize(innerWidth, innerHeight);

      // add animation
      timer.update();

      planetMeshes.forEach((planet, index) => {
        planet.rotation.y += planets[index].speed;
        planet.position.x =
          Math.sin(planet.rotation.y) * planets[index].distance;
        planet.position.z =
          Math.cos(planet.rotation.y) * planets[index].distance;

        planet.children.forEach((moon, moonIndex) => {
          moon.rotation.y += planets[index].moons[moonIndex].speed;
          moon.position.x =
            Math.sin(moon.rotation.y) *
            planets[index].moons[moonIndex].distance;
          moon.position.z =
            Math.cos(moon.rotation.y) *
            planets[index].moons[moonIndex].distance;
        });
      });

      // Anti-Alising
      const maxPixelRatio = Math.min(devicePixelRatio, 2); // Se PixelRatio è >=3, fissa il maxPixelRatio a 2
      renderer.setPixelRatio(maxPixelRatio);

      controls.update(); // Serve se controls.enableDamping = true o quando controls.autoRotate = true
      renderer.render(scene, camera);
      window.requestAnimationFrame(renderloop);
    };

    renderloop();

    return () => {
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <main>
      <canvas ref={canvasRef} className="threejs" />
    </main>
  );
}
