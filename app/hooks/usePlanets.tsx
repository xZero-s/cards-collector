import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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
  speed: number;
  material: THREE.MeshStandardMaterial;
  color?: number;
}

export function usePlanets() {
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    // add textureLoader
    const textureLoader = new THREE.TextureLoader();

    // adding textures
    const sunTexture = textureLoader.load(
      "static/textures/solar-system/sun-texture-2k.png",
    );
    const mercuryTexture = textureLoader.load(
      "static/textures/solar-system/mercury-texture-2k.png",
    );
    const venusTexture = textureLoader.load(
      "static/textures/solar-system/venus-texture-2k.png",
    );
    const earthTexture = textureLoader.load(
      "static/textures/solar-system/earth-texture-2k.png",
    );
    const marsTexture = textureLoader.load(
      "static/textures/solar-system/mars-texture-2k.png",
    );
    const moonTexture = textureLoader.load(
      "static/textures/solar-system/moon-texture-2k.png",
    );

    // initialize material
    const sunMaterial = new THREE.MeshStandardMaterial({
      map: sunTexture,
    });
    const mercuryMaterial = new THREE.MeshStandardMaterial({
      map: mercuryTexture,
    });
    const venusMaterial = new THREE.MeshStandardMaterial({
      map: venusTexture,
    });
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
    });
    const marsMaterial = new THREE.MeshStandardMaterial({
      map: marsTexture,
    });
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
    });

    const _planets: Planet[] = [
      {
        name: "Mercury",
        radius: 0.5,
        distance: 10,
        speed: 0.01,
        material: mercuryMaterial,
        moons: [],
      },
      {
        name: "Venus",
        radius: 0.8,
        distance: 15,
        speed: 0.007,
        material: venusMaterial,
        moons: [],
      },
      {
        name: "Earth",
        radius: 1,
        distance: 20,
        speed: 0.005,
        material: earthMaterial,
        moons: [
          {
            name: "Moon",
            radius: 0.3,
            distance: 3,
            speed: 0.015,
            material: moonMaterial,
          },
        ],
      },
      {
        name: "Mars",
        radius: 0.7,
        distance: 25,
        speed: 0.003,
        material: marsMaterial,
        moons: [
          {
            name: "Phobos",
            radius: 0.1,
            distance: 2,
            speed: 0.02,
            material: moonMaterial,
          },
          {
            name: "Deimos",
            radius: 0.2,
            distance: 3,
            speed: 0.015,
            material: moonMaterial,
            color: 0xffffff,
          },
        ],
      },
    ];

    setPlanets(_planets);
  }, []);

  function addPlanet(
    name: string,
    radius: number,
    distance: number,
    speed: number,
    material: THREE.MeshStandardMaterial,
    moons: Moon[],
  ) {
    setPlanets([
      ...planets,
      {
        name: name,
        radius: radius,
        distance: distance,
        speed: speed,
        material: material,
        moons: moons,
      },
    ]);
  }

  function createPlanetMesh(planet: Planet): THREE.Mesh {
    // initialize geometry
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

    // create mesh
    const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);

    // set the scale and position
    planetMesh.scale.setScalar(planet.radius);
    planetMesh.position.x = planet.distance;

    return planetMesh;
  }

  return {
    planets,
    createPlanetMesh,
  };
}
