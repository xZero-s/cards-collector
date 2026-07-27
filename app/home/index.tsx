import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { usePlanets } from "~/hooks/usePlanets";
import { useResizeWindow } from "~/hooks/useResizeWindow";

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const { planets, createPlanetMesh } = usePlanets();

  useEffect(() => {
    // initialize the camera
    cameraRef.current = new THREE.PerspectiveCamera(
      35,
      innerWidth / innerHeight,
      0.1,
      400,
    );
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !cameraRef.current) return;

    const canvas = canvasRef.current;
    const camera = cameraRef.current;

    // initialize the scene
    const scene = new THREE.Scene();

    // initialize geometry
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

    // initialize meshes
    const planetMeshes = planets.map((planet) => {
      // Appunto: earth.add(moon); -> si possono aggiugnere mesh come figlie di altre mesh per posizionarle
      // earth.rotation.y += 0.01; // quando la mesh ruota, automaticamente le sue figlie ruotano attorno alla mesh

      // create the mesh
      const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);

      // set the scale and position
      planetMesh.scale.setScalar(planet.radius);
      planetMesh.position.x = planet.distance;

      // add it to scene
      scene.add(planetMesh);

      planet.moons.forEach((moon) => {
        const moonMesh = new THREE.Mesh(sphereGeometry, moon.material);
        moonMesh.scale.setScalar(moon.radius);
        moonMesh.position.x = moon.distance;
        planetMesh.add(moonMesh);
      });

      return planetMesh;
    });

    // add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    if (!camera) return;
    camera.position.z = 35;

    // initialize the renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
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

      // Anti-Alising
      const maxPixelRatio = Math.min(devicePixelRatio, 2); // Se PixelRatio è >=3, fissa il maxPixelRatio a 2
      renderer.setPixelRatio(maxPixelRatio);

      controls.update(); // Serve se controls.enableDamping = true o quando controls.autoRotate = true
      renderer.render(scene, camera);
      window.requestAnimationFrame(renderloop);
    };

    renderloop();

    return () => {
      renderer.dispose();
    };
  }, []);

  useResizeWindow(({ width = innerWidth, height = innerHeight }) => {
    if (!cameraRef.current) return;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix(); // Va chiamata quando si vuole aggiornare dei valori della camera
  });

  return (
    <main>
      <canvas ref={canvasRef} className="threejs" />
    </main>
  );
}
