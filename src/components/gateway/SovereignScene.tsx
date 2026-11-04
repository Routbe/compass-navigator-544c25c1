import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Color, Group, ShaderMaterial, TextureLoader } from 'three';
import landAsset from '@/assets/rout-sovereign-land.png.asset.json';

// Original GLSL, informed by GPU time/phase techniques in the MIT R3F/fluid references.
const streamVertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const streamFragment = `uniform float time;uniform vec3 emerald;uniform vec3 cyan;varying vec2 vUv;
float hash(float x){return fract(sin(x*127.1)*43758.5453);}
void main(){float seed=hash(floor(vUv.x*100.));
float line=pow(1.-abs(fract(vUv.x*100.)-.5)*2.,18.);
float flow=fract(vUv.y+time*(.025+seed*.045)+seed);
float trail=pow(flow,14.)*step(.72,seed);
float fade=smoothstep(0.,.22,vUv.y)*(1.-smoothstep(.7,1.,vUv.y));
gl_FragColor=vec4(mix(emerald,cyan,seed),line*(.08+trail*.65)*fade);}`;
const globeVertex = `uniform sampler2D land;uniform float pixelRatio;varying float alpha;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);
alpha=texture2D(land,uv).r*smoothstep(-.15,.75,normalize(normalMatrix*normal).z);
gl_Position=projectionMatrix*mv;gl_PointSize=clamp(16.*pixelRatio/-mv.z,1.,3.2*pixelRatio);}`;
const globeFragment = `uniform vec3 ink;varying float alpha;
void main(){float mask=1.-smoothstep(.32,.5,length(gl_PointCoord-.5));gl_FragColor=vec4(ink,alpha*mask);}`;

function Globe({ ink, reduced, ready }: { ink: string; reduced: boolean; ready: () => void }) {
  const map = useLoader(TextureLoader, landAsset.url);
  const group = useRef<Group>(null);
  const announced = useRef(false);
  const { gl } = useThree();
  const uniforms = useMemo(() => ({ land: { value: map }, ink: { value: new Color(ink) }, pixelRatio: { value: gl.getPixelRatio() } }), [map, ink, gl]);
  const buffers = useMemo(() => {
    const pos: number[] = [], normals: number[] = [], uv: number[] = [];
    for (let row = 1; row < 150; row++) for (let col = 0; col < 150; col++) {
      const lat = row / 150 * Math.PI, lon = col / 150 * Math.PI * 2;
      const x = -Math.cos(lon) * Math.sin(lat), y = Math.cos(lat), z = Math.sin(lon) * Math.sin(lat);
      pos.push(x * 2.35, y * 2.35, z * 2.35); normals.push(x, y, z); uv.push(col / 150, 1 - row / 150);
    }
    return { pos: new Float32Array(pos), normals: new Float32Array(normals), uv: new Float32Array(uv) };
  }, []);
  useFrame((state, delta) => {
    if (!announced.current) { announced.current = true; ready(); }
    if (!group.current || reduced) return;
    group.current.rotation.y += Math.min(delta, .05) * .02;
    const host = state.gl.domElement.closest<HTMLElement>('[data-sovereign-scene]');
    const x = parseFloat(host?.style.getPropertyValue('--lg-x') || '50') / 100 - .5;
    group.current.rotation.x += (x * .08 - group.current.rotation.x) * (1 - Math.exp(-3 * Math.min(delta, .05)));
  });
  return <group ref={group} position={[0, -1.7, 0]} rotation={[0, -1.1, -.12]}>
    <points><bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[buffers.pos, 3]} />
      <bufferAttribute attach="attributes-normal" args={[buffers.normals, 3]} />
      <bufferAttribute attach="attributes-uv" args={[buffers.uv, 2]} />
    </bufferGeometry><shaderMaterial vertexShader={globeVertex} fragmentShader={globeFragment} uniforms={uniforms} transparent depthWrite={false} /></points>
  </group>;
}
function Streams({ emerald, cyan, reduced }: { emerald: string; cyan: string; reduced: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ time: { value: 0 }, emerald: { value: new Color(emerald) }, cyan: { value: new Color(cyan) } }), [emerald, cyan]);
  useFrame((_, delta) => { if (material.current && !reduced) material.current.uniforms.time.value += Math.min(delta, .05); });
  return <mesh frustumCulled={false} renderOrder={-1}><planeGeometry args={[2, 2]} /><shaderMaterial ref={material} uniforms={uniforms} vertexShader={streamVertex} fragmentShader={streamFragment} transparent depthTest={false} depthWrite={false} /></mesh>;
}
export default function SovereignScene({ active, reduced, colors, onReady }: { active: boolean; reduced: boolean; colors: { ink: string; emerald: string; cyan: string }; onReady: () => void }) {
  return <Canvas aria-hidden dpr={[1, 1.5]} flat camera={{ position: [0, 0, 9], fov: 42 }} frameloop={active && !reduced ? 'always' : 'demand'} gl={{ antialias: true, alpha: true }}>
    <Streams {...colors} reduced={reduced} />
    <Suspense fallback={null}><Globe ink={colors.ink} reduced={reduced} ready={onReady} /></Suspense>
  </Canvas>;
}
