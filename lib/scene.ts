import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';

const rand = gsap.utils.random;

export function initScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 10);

  // Environment for glossy reflections on the glass
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------- Animated gradient backdrop (this is what the glass refracts) ----------
  const bgUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
  };
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 40),
    new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uScroll;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1, 0)), u.x),
            mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x),
            u.y
          );
        }
        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.05; a *= 0.5; }
          return v;
        }

        void main() {
          vec2 uv = vUv;
          float t = uTime * 0.045;

          // domain-warped fbm = slow liquid color field
          float warp = fbm(uv * 2.2 - t);
          float n = fbm(uv * 3.0 + vec2(t, -t * 0.6) + warp * 1.3 + uScroll * 1.5);

          vec3 deep   = vec3(0.03, 0.045, 0.12);
          vec3 violet = vec3(0.26, 0.14, 0.68);
          vec3 cyan   = vec3(0.07, 0.58, 0.72);
          vec3 peach  = vec3(1.0, 0.48, 0.40);

          vec3 col = mix(deep, violet, smoothstep(0.2, 0.8, n));
          col = mix(col, cyan, smoothstep(0.5, 0.92, fbm(uv * 4.0 - t + 2.7 + uScroll)));
          col += peach * pow(smoothstep(0.66, 1.0, fbm(uv * 5.0 + t * 1.4 + uScroll * 2.0)), 2.0) * 0.7;

          // vignette + dithering
          float vig = smoothstep(1.25, 0.35, length(uv - 0.5));
          col *= mix(0.68, 1.0, vig);
          col += (hash(uv * vec2(1920.0, 1080.0) + uTime) - 0.5) * 0.018;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  );
  backdrop.position.z = -9;
  scene.add(backdrop);

  // ---------- Glass objects (refractors) ----------
  const glassGroup = new THREE.Group();
  scene.add(glassGroup);

  const glassMat = new THREE.MeshPhysicalMaterial({
    transmission: 0.95,
    thickness: 0.6,
    roughness: 0.15,
    ior: 1.5,
  });

  const shapes: any[] = [];

  // Main shapes (boxes, dodecs, etc)
  const geos = [
    new THREE.BoxGeometry(0.8, 1.2, 0.6),
    new THREE.DodecahedronGeometry(0.65),
    new THREE.IcosahedronGeometry(0.55),
    new THREE.OctahedronGeometry(0.7),
    new THREE.TetrahedronGeometry(0.8),
  ];

  geos.forEach((geo, i) => {
    const mesh = new THREE.Mesh(geo, glassMat);
    mesh.position.set(rand(-5, 5), rand(-3, 3), rand(-1, 3));
    mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    mesh.userData = {
      baseY: mesh.position.y,
      baseX: mesh.position.x,
      floatAmp: rand(0.6, 1.4),
      floatFreq: rand(0.25, 0.5),
      phase: rand(0, Math.PI * 2),
      spinX: rand(-0.25, 0.25),
      spinY: rand(-0.35, 0.35),
    };
    glassGroup.add(mesh);
    shapes.push(mesh);
  });

  // small random glass shards drifting between the big shapes
  const shardGeo = new THREE.TetrahedronGeometry(0.22, 0);
  for (let i = 0; i < 14; i++) {
    const shard = new THREE.Mesh(shardGeo, glassMat);
    shard.position.set(rand(-7, 7), rand(-4.5, 4.5), rand(-2, 2.5));
    shard.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    shard.scale.setScalar(rand(0.5, 1.6));
    shard.userData = {
      baseY: shard.position.y,
      baseX: shard.position.x,
      floatAmp: rand(0.3, 0.9),
      floatFreq: rand(0.3, 0.7),
      phase: rand(0, Math.PI * 2),
      spinX: rand(-0.8, 0.8),
      spinY: rand(-0.8, 0.8),
    };
    glassGroup.add(shard);
    shapes.push(shard);
  }

  // ---------- Dust particles ----------
  const COUNT = 220;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = rand(-13, 13);
    positions[i * 3 + 1] = rand(-8, 8);
    positions[i * 3 + 2] = rand(-6, 4);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: 0xaad8ff,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scene.add(particles);

  // ---------- Interaction state ----------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scroll = 0; // 0..1 page progress
  let scrollTarget = 0;

  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Tick (driven by gsap.ticker so it stays in sync with DOM tweens) ----------
  gsap.ticker.add((time, deltaMS) => {
    const dt = deltaMS / 1000;

    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3.5);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3.5);
    scroll += (scrollTarget - scroll) * Math.min(1, dt * 4);

    bgUniforms.uTime.value = time;
    bgUniforms.uScroll.value = scroll;

    if (!reduced) {
      shapes.forEach((m) => {
        const u = m.userData;
        m.position.y = u.baseY + Math.sin(time * u.floatFreq + u.phase) * u.floatAmp;
        m.position.x = u.baseX + Math.cos(time * u.floatFreq * 0.7 + u.phase) * u.floatAmp * 0.4;
        m.rotation.x += u.spinX * dt * (1 + scroll * 2.5);
        m.rotation.y += u.spinY * dt * (1 + scroll * 2.5);
      });
      particles.rotation.y = time * 0.015;
      particles.position.y = scroll * 3;
    }

    // shapes drift upward + camera leans as you scroll; pointer adds parallax
    glassGroup.position.y = scroll * 7;
    glassGroup.rotation.z = scroll * 0.35;
    camera.position.x = pointer.x * 0.55;
    camera.position.y = pointer.y * 0.35 - scroll * 0.8;
    camera.lookAt(0, glassGroup.position.y * 0.08 - scroll * 0.8, 0);

    renderer.render(scene, camera);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    setScroll(p: number) {
      scrollTarget = p;
    },
    // a little show-off burst when the page is ready
    intro() {
      shapes.forEach((m, i) => {
        const target = m.scale.x;
        m.scale.setScalar(0.001);
        gsap.to(m.scale, {
          x: target,
          y: target,
          z: target,
          duration: 1.6,
          delay: 0.15 + i * 0.07,
          ease: 'elastic.out(1, 0.55)',
        });
      });
    },
  };
}
