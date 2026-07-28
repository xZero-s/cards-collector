import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useScene } from "./useScene";

interface Planet {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  material: THREE.MeshStandardMaterial;
  moons: Moon[];
}

interface Moon {
  name: string;
  radius: number;
  distance: number;
  material?: THREE.MeshStandardMaterial;
  speed: number;
  color?: number;
}

export function usePlanets() {
  const [planets, setPlanets] = useState<Planet[]>([]);

  const sphereGeometry = useRef(new THREE.SphereGeometry(1, 32, 32));
  const textureLoader = useRef(new THREE.TextureLoader());

  const { scene } = useScene();

  useEffect(() => {
    const sunTexture = textureLoader.current.load(
      "/static/textures/solar-system/sun-texture-2k.png",
    );
    const sunMaterial = new THREE.MeshStandardMaterial({
      map: sunTexture,
    });
    const sun = new THREE.Mesh(sphereGeometry.current, sunMaterial);
    sun.scale.setScalar(5);
    scene.add(sun);
  }, []);

  function createPlanet(
    name: string,
    radius: number,
    distance: number,
    speed: number,
    moons: Moon[],
    texturePath: string,
  ) {
    const planetTexture = textureLoader.current.load(texturePath);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
    });

    const planet: Planet = {
      name: name,
      radius: radius,
      distance: distance,
      speed: speed,
      material: planetMaterial,
      moons: moons,
    };

    const moonTexturePath = textureLoader.current.load(
      "/static/textures/solar-system/moon-texture-2k.png",
    );

    if (moons) {
      planet.moons.forEach(
        (moon) =>
          (moon.material = new THREE.MeshStandardMaterial({
            map: moonTexturePath,
          })),
      );
    }

    setPlanets((prev) =>
      prev.some((p) => p.name === planet.name) ? prev : [...prev, planet],
    );
  }

  function addMoonToPlanet(planetName: string, moon: Moon) {
    setPlanets((prev) =>
      prev.map((planet) =>
        planet.name === planetName &&
        !planet.moons.some((m) => m.name === moon.name)
          ? { ...planet, moons: [...planet.moons, moon] }
          : planet,
      ),
    );
  }

  function removePlanet(planet: Planet) {
    planet.material.dispose();

    if (planet.moons) {
      planet.moons.forEach((moon) => moon.material?.dispose());
    }

    setPlanets((prev) => prev.filter((p) => p.name !== planet.name));
  }

  function removeAllPlanets() {
    setPlanets([]);
  }

  function createMesh(planet: Planet | Moon): THREE.Mesh {
    const mesh = new THREE.Mesh(sphereGeometry.current, planet.material);
    mesh.scale.setScalar(planet.radius);
    mesh.position.x = planet.distance;

    return mesh;
  }

  return {
    planets,
    createPlanet,
    addMoonToPlanet,
    removePlanet,
    removeAllPlanets,
    createMesh,
  };
}
