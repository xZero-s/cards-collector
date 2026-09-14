import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, type ThreeElement } from "@react-three/fiber";

/*
 * varying -> qualificatore di storage
 * vec2 -> vettore di 2 float (equivalente GLSL di THREE.Vector2)
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vViewLocal;

  void main() {
    vUv = uv;

    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vec3 viewDirWorld = normalize( cameraPosition - worldPosition.xyz );

    vec3 cardX = normalize( ( modelMatrix * vec4( 1.0, 0.0, 0.0, 0.0 ) ).xyz );
    vec3 cardY = normalize( ( modelMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );

    vViewLocal = vec2( dot( viewDirWorld, cardX ), dot( viewDirWorld, cardY ) );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMaskMap;
  uniform sampler2D uGrainMap;
  uniform vec2 uDirection;
  uniform float uBandCount;
  uniform float uSweep;
  uniform float uStrength;
  uniform float uSaturation;
  uniform float uGrainRepeat;
  uniform float uGrainAmount;
  uniform vec2 uGlare;
  uniform float uGlareStrength;

  varying vec2 vUv;
  varying vec2 vViewLocal;

  const vec3 LUMINANCE = vec3( 0.2126, 0.7152, 0.0722 );
  const float MASK_FLOOR = 0.3;
  // le bande non restano dritte: una componente perpendicolare le incurva
  const float BEND = 0.4;
  // l'inclinazione contribuisce, ma e' il puntatore a guidare
  const float VIEW_SWEEP = 1.2;
  // a riposo l'holo resta acceso, l'hover lo porta al massimo
  const float HOLO_FLOOR = 0.55;

  vec3 hsv2rgb( vec3 c ) {
    vec4 K = vec4( 1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0 );
    vec3 p = abs( fract( c.xxx + K.xyz ) * 6.0 - K.www );
    return c.z * mix( K.xxx, clamp( p - K.xxx, 0.0, 1.0 ), c.y );
  }

  void main() {
    vec2 direction = normalize( uDirection );
    vec2 across = vec2( -direction.y, direction.x );

    // il puntatore trascina il gradiente invece di ritagliare una zona:
    // copre tutta la carta, quindi da' molta piu' escursione dei 15 gradi
    // di MAX_HOVER_ANGLE
    vec2 pointer = uGlare - 0.5;

    float axis = dot( vUv - 0.5, direction );
    float bend = dot( vUv - 0.5, across );
    float drift = dot( pointer, direction );
    float view = dot( vViewLocal, direction );

    float hue = fract(
      axis * uBandCount
      + bend * uBandCount * BEND
      + drift * uSweep
      + view * VIEW_SWEEP
    );

    vec3 holo = hsv2rgb( vec3( hue, uSaturation, 1.0 ) );

    float luminance = dot( texture2D( uMaskMap, vUv ).rgb, LUMINANCE );
    float mask = mix( MASK_FLOOR, 1.0, luminance );

    // grana fine: senza, l'effetto legge come un gradiente CSS invece che
    // come un foil stampato
    float grainSample = texture2D( uGrainMap, vUv * uGrainRepeat ).g;
    float grain = mix( 1.0 - uGrainAmount, 1.0 + uGrainAmount, grainSample );

    float hover = mix( HOLO_FLOOR, 1.0, uGlareStrength );

    gl_FragColor = vec4( holo * uStrength * mask * grain * hover, 1.0 );
  }
`;

const uniforms = {
  uMaskMap: null as THREE.Texture | null,
  uGrainMap: null as THREE.Texture | null,
  uDirection: new THREE.Vector2(0.7, 0.7),
  uBandCount: 1.4,
  uSweep: 1.8,
  uStrength: 0.55,
  uSaturation: 0.35,
  uGrainRepeat: 4,
  uGrainAmount: 0.22,
  uGlare: new THREE.Vector2(0.5, 0.5),
  uGlareStrength: 0,
};

const HolographicMaterial = shaderMaterial(
  uniforms,
  vertexShader,
  fragmentShader,
);

export type HolographicMaterialImpl = InstanceType<typeof HolographicMaterial>;

extend({ HolographicMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    holographicMaterial: ThreeElement<typeof HolographicMaterial>;
  }
}
