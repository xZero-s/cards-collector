import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useResizeWindow } from "~/hooks/useResizeWindow";
import { Pane } from "tweakpane";

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const axesHelperRef = useRef<THREE.AxesHelper>(null);

  useEffect(() => {
    cameraRef.current = new THREE.PerspectiveCamera(
      35,
      innerWidth / innerHeight,
      0.5,
      30,
    );

    axesHelperRef.current = new THREE.AxesHelper(2);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !cameraRef.current) return;

    const canvas = canvasRef.current;
    const camera = cameraRef.current;

    const pane = new Pane();

    const scene = new THREE.Scene();

    // initialize the loader
    const textureLoader = new THREE.TextureLoader();

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);

    // initialize the texture
    const grassTexture = textureLoader.load(
      "static/textures/whispy-grass-meadow-bl/wispy-grass-meadow_albedo.png",
    );
    grassTexture.repeat.set(2, 2);

    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    // grassTexture.wrapS = THREE.MirroredRepeatWrapping;
    // grassTexture.wrapT = THREE.MirroredRepeatWrapping;

    pane.addBinding(grassTexture, "offset", {
      x: {
        min: -1,
        max: 1,
        step: 0.001,
      },
      y: {
        min: -1,
        max: 1,
        step: 0.001,
      },
    });

    const material = new THREE.MeshBasicMaterial();
    material.map = grassTexture;

    const group = new THREE.Group();

    const cube = new THREE.Mesh(cubeGeometry, material);

    const knot = new THREE.Mesh(torusKnotGeometry, material);
    knot.position.x = 1.5;

    const plane = new THREE.Mesh(planeGeometry, material);
    plane.position.x = -1.5;
    plane.rotation.x = -(Math.PI * 0.5);
    plane.scale.set(1000, 1000);

    const sphere = new THREE.Mesh();
    sphere.geometry = sphereGeometry;
    sphere.material = material;
    sphere.position.y = 1.5;

    const cylinder = new THREE.Mesh();
    cylinder.geometry = cylinderGeometry;
    cylinder.material = material;
    cylinder.position.y = -1.5;

    group.add(plane); // cube, knot, sphere, cylinder
    scene.add(group);

    const light = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(light);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const tempVector = new THREE.Vector3(0, 0, 0);
    cube.position.copy(tempVector);

    if (!axesHelperRef.current) return;
    scene.add(axesHelperRef.current);

    if (!camera) return;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    // controls.autoRotate = true;

    /*const renderloop = () => {
      renderer.setSize(innerWidth, innerHeight);

      const maxPixelRatio = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(maxPixelRatio);

      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += 0.01;
        }
      });

      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(renderloop);
    };

    renderloop();*/

    return () => {
      renderer.dispose();
    };
  }, []);

  useResizeWindow(({ width = innerWidth, height = innerHeight }) => {
    if (!cameraRef.current) return;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <main>
      <canvas ref={canvasRef} className="threejs" />
    </main>
  );
}
