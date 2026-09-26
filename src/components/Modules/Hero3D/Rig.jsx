'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Color, MathUtils, Vector3 } from 'three';
import { useTheme } from '@/components/ThemeContext';
import { blurFilter, track, turnAt } from '@/lib/hero3d';
import findCounter from './counter';
import createFit from './fit';

const { clamp, damp, degToRad, smoothstep } = MathUtils;
const MODEL = '/models/rp-logo.glb';
const REST_YAW = -0.065;
const TAU = Math.PI * 2;
const Y = new Vector3(0, 1, 0);
// The rest turn: once every 20s.
const SPIN = TAU / 20;
// The scroll turn lands back on the rest face; from there the counter's axis
// runs straight away from the camera.
const FACE = REST_YAW;
const AXIS = new Vector3(0, 0, -1).applyAxisAngle(Y, FACE);
const AHEAD = new Vector3(0, 0, -1);
// The leftover rest spin slows over this last stretch of the turn, so it can
// never run past the face it hands over to.
const MARGIN = Math.PI / 3;
// The rest spin's own speed eases out over early progress while the scroll
// turn takes over, so the two add up to one continuous turn.
const EASE_OUT = 0.035;
// Short enough that the move down the counter never clips the mark's walls.
const NEAR = 0.01;
// How far past filling the frame the approach ends, as a ratio of lens widths.
const OVERFLOW = 1.5;
// The counter's section the approach frames, as a share of the mark's depth
// from its middle (+1 the front).
const PLANE = -0.3;
const HOME = [
  { position: [-6, 1, 7], color: 'secondary', intensity: 110, distance: 70 },
  { position: [0, 1, 8], color: 'primary', intensity: 85, distance: 80 },
  { position: [6, 1, 7], color: 'secondary', intensity: 110, distance: 70 }
];
// Along the counter's axis in logo units, +z towards the camera at the end: a
// primary pair inside the opening lights its walls, a secondary pair sits behind
// it. Every light is there from the first frame and never moves; only levels
// change, so the light set and its shaders never do.
const INSIDE = [0.12, -0.12];
const BEHIND = [-0.32, -0.55];
// The turn's reflection: a narrow, soft spot from the right and behind the
// mark, grazing it so it only catches facet edges.
const STREAK_AT = [5, 0.8, -4.5];
const STREAK = 160;
// A dim fill of the rest lights through the end of the turn.
const FILL = 0.25;
// The counter's lights at their brightest, where the bloom is at full.
const LIT = 1.3;
// A CSS blur that breathes in while the lit opening fills the frame.
const BLUR = [0.7, 0.8, 0.97];
const BLUR_MAX = 4;
// Grain time across the whole move, on top of a second per second of rest spin,
// so the grain only runs while the mark moves.
const GRAIN_MOVE = 4;
// 0 before start, up to 1 at peak and back to 0 by end.
const pulse = (e, [start, peak, end]) =>
  smoothstep(e, start, peak) * (1 - smoothstep(e, peak, end));

// Intensity scale for a light of this colour: the brightness a mid-grey light
// would have, capped so a near-black theme colour can't flood.
function balance(color) {
  const { r, g, b } = new Color(color);
  return Math.min(
    8,
    0.5 / Math.max(0.2126 * r + 0.7152 * g + 0.0722 * b, 1e-3)
  );
}

// Keys on eased progress e. zoom runs the approach down the counter's axis at the
// fov channel's lens, until the lit opening overflows the frame.
const CH = ['t', 'aim', 'r', 's', 'fov', 'vig', 'open', 'zoom'];
const KEYS = [
  [0, 0, 3, 0, 60, 0, 0, 0],
  [0.006, 0, 3, 0, 60, 0, 0, 0],
  [0.5, 0.3, 2.6, 0, 54, 0.4, 0, 0],
  [0.76, 1, 1.3, 0, 35, 1, 0, 0.25],
  [0.89, 1, 0.8, 0, 35, 0, 1, 0.75],
  [1, 1, 0.6, 0, 35, 0, 1.4, 1]
];
// Light levels, [e, level]. The rest lights go down over the turn to a dim
// fill while the reflection streaks the facet edges, and both are gone early
// in the approach. The counter's inside pair comes up as the approach starts
// and fades; the pair behind the opening follows and holds until the content
// scrolls over, then eases out. rim and facet keep the dark mark's edges.
// prettier-ignore
const LIGHTS = {
  home: [[0, 1], [0.006, 1], [0.22, 0.1], [0.5, 0]],
  fill: [[0, 0], [0.12, 0], [0.22, 1], [0.44, 1], [0.54, 0]],
  streak: [[0, 0], [0.006, 0], [0.16, 1], [0.46, 1], [0.56, 0]],
  inside: [[0, 0], [0.42, 0], [0.54, 1], [0.66, 1.2], [0.8, 0]],
  behind: [[0, 0], [0.5, 0], [0.64, 1.1], [0.76, 1.3], [0.86, 1.25], [0.93, 0]],
  rim: [[0, 0], [0.42, 0], [0.6, 0.45], [0.76, 0.3], [0.89, 0]],
  facet: [[0, 0], [0.42, 0], [0.58, 0.4], [0.72, 0]]
};
const TRACKS = {
  ...Object.fromEntries(
    CH.slice(1).map((name, c) => [
      name,
      track(KEYS.map((k) => [k[0], k[c + 1]]))
    ])
  ),
  ...Object.fromEntries(
    Object.entries(LIGHTS).map(([name, k]) => [name, track(k)])
  )
};
const at = (name, e) => TRACKS[name](e);

// The view swings from straight ahead onto the counter's axis, then runs down it.
function shoot(e, hole, view, out) {
  const aim = at('aim', e);
  const wide =
    view.rest + (1 + view.portrait - view.rest) * smoothstep(e, 0.006, 0.5);
  out.dir.copy(AHEAD).lerp(AXIS, aim).normalize();
  out.target
    .copy(hole.centre)
    .multiplyScalar(aim)
    .addScaledVector(AXIS, at('s', e));
  out.fov = at('fov', e);
  let d = at('r', e) * wide;
  const zoom = at('zoom', e);
  if (zoom > 0) {
    // The lens at which the far rim of the opening would clear the frame's
    // corners, then past it; the camera moves in until PLANE's section takes
    // the share of the frame that lens gives it. Even steps in the ratio read
    // as a steady approach.
    const stop = at('r', 1) * wide;
    const fill =
      hole.radius / ((stop + hole.depth) * Math.hypot(1, view.aspect));
    const z = PLANE * hole.depth;
    d =
      z + (d - z) * (fill / OVERFLOW / Math.tan(degToRad(out.fov / 2))) ** zoom;
  }
  out.pos.copy(out.target).addScaledVector(out.dir, -d);
  return out;
}

// Scrolling hands the rest spin over to a full turn back to the front, then the
// camera goes through the counter to the page; progress also drives the beats.
// composed: the composer is on, so it dithers the frame instead of the mark.
export default function Rig({ progress, vignette, stage, composed, levels }) {
  const { nodes, materials } = useGLTF(MODEL);
  const geometry = nodes['RP_-_Logo001'].geometry;
  // A copy: the loader cache shares the mark's material.
  const material = useMemo(() => {
    const copy = materials.Abstract.clone();
    copy.dithering = !composed;
    return copy;
  }, [materials, composed]);
  useEffect(() => () => material.dispose(), [material]);
  const { colors } = useTheme();
  const counter = useMemo(
    () => findCounter(geometry, [-0.36, 0.18]),
    [geometry]
  );
  const fit = useMemo(() => createFit(geometry), [geometry]);
  const hole = useMemo(() => {
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;
    return {
      centre: new Vector3(counter.x, counter.y, 0).applyAxisAngle(Y, FACE),
      radius: counter.r,
      depth: Math.max(max.z, -min.z)
    };
  }, [geometry, counter]);
  const gain = useMemo(
    () => ({
      primary: balance(colors.primary),
      secondary: balance(colors.secondary)
    }),
    [colors]
  );
  const group = useRef(null);
  const home = useRef([]);
  const amb = useRef(null);
  const inside = useRef([]);
  const behind = useRef([]);
  const rim = useRef(null);
  const facet = useRef(null);
  const streak = useRef(null);
  // spin: the rest turn, integrated at omega; to: the face the scroll turn
  // lands on, chosen while the page is at the top; look and filter: the
  // vignette's and the stage's last written styles; e: last frame's progress.
  const run = useRef({
    spin: REST_YAW,
    omega: SPIN,
    to: null,
    yaw: null,
    view: {},
    look: null,
    filter: '',
    e: null
  });
  useEffect(() => {
    const el = stage.current;
    return () => {
      el?.style.removeProperty('filter');
    };
  }, [stage]);
  const shot = useMemo(
    () => ({
      pos: new Vector3(),
      target: new Vector3(),
      dir: new Vector3(),
      fov: 60
    }),
    []
  );

  useFrame(({ size, camera }, frameDelta) => {
    const move = progress.current?.sample();
    if (!move) return;
    const r = run.current;
    // The layer stops drawing once the move is over; don't jump on the way back.
    const delta = Math.min(frameDelta, 0.1);
    const { p, e, reduced } = move;

    // One angle: the rest spin keeps integrating while its speed eases out,
    // and the scroll turn adds the way from it to the rest face nearest a full
    // turn on (180 to 540 degrees, always forwards), so velocity carries
    // through. Back at the top the spin picks up from wherever the mark is.
    const turn = turnAt(p);
    if (r.to === null || p < 1e-5)
      r.to = FACE + Math.round((r.spin + TAU - FACE) / TAU) * TAU;
    const idle = reduced
      ? 0
      : SPIN * Math.exp(-p / EASE_OUT) * clamp((r.to - r.spin) / MARGIN, 0, 1);
    r.omega = reduced ? 0 : damp(r.omega, idle, 4, delta);
    r.spin = reduced ? REST_YAW : Math.min(r.spin + r.omega * delta, r.to);
    let yaw = r.spin + turn * (r.to - r.spin);
    // Near the top, scrolling back up doesn't unwind the turn: what it gives
    // back is folded into the spin, so there the mark only ever goes forwards.
    const keep = 1 - smoothstep(p, 0.05, 0.15);
    if (!reduced && r.yaw !== null && keep > 0) {
      const floor = r.yaw + r.omega * delta * (1 - turn);
      if (yaw < floor) {
        yaw += keep * (floor - yaw);
        r.spin = Math.min((yaw - turn * r.to) / (1 - turn), r.to);
        yaw = r.spin + turn * (r.to - r.spin);
      }
    }
    r.yaw = yaw;
    group.current.rotation.set(0, yaw, 0);
    const a = size.width / size.height;
    // Portrait screens pull the close-ups back so the framing holds across.
    Object.assign(r.view, {
      rest: fit(a),
      portrait: Math.max(1, 1 / a) ** 0.6 - 1,
      aspect: a
    });
    shoot(e, hole, r.view, shot);
    camera.position.copy(shot.pos);
    camera.lookAt(shot.target);
    if (camera.fov !== shot.fov || camera.near !== NEAR) {
      camera.fov = shot.fov;
      camera.near = NEAR;
      camera.updateProjectionMatrix();
    }

    // The glow lights are scaled by their colour's brightness, so a dark
    // theme colour lights as strongly as a pale one and keeps its hue.
    const lit = at('home', e) + FILL * at('fill', e);
    home.current.forEach(
      (light, i) => (light.intensity = HOME[i].intensity * lit)
    );
    amb.current.intensity = 0.1 * lit;
    inside.current.forEach(
      (light) => (light.intensity = 0.45 * at('inside', e) * gain.primary)
    );
    behind.current.forEach(
      (light) => (light.intensity = 0.9 * at('behind', e) * gain.secondary)
    );
    rim.current.intensity = 40 * at('rim', e) * gain.secondary;
    facet.current.intensity = 14 * at('facet', e) * gain.primary;
    streak.current.intensity = STREAK * at('streak', e) * gain.secondary;

    const look = reduced
      ? ''
      : `opacity: ${at('vig', e).toFixed(3)}; transform: scale(${(1 + at('open', e) * 1.5).toFixed(3)})`;
    if (vignette.current && look !== r.look)
      vignette.current.setAttribute('style', (r.look = look));
    const filter = composed ? blurFilter(BLUR_MAX * pulse(e, BLUR)) : '';
    if (stage.current && filter !== r.filter)
      stage.current.style.setProperty('filter', (r.filter = filter));
    Object.assign(levels.current, {
      bloom: clamp(Math.max(at('inside', e), at('behind', e)) / LIT, 0, 1),
      travel:
        levels.current.travel +
        (r.omega * delta) / SPIN +
        Math.abs(e - (r.e ?? e)) * GRAIN_MOVE
    });
    r.e = e;
  });

  return (
    <>
      <group ref={group}>
        <mesh geometry={geometry} material={material} />
        {INSIDE.map((z, i) => (
          <pointLight
            key={`in${i}`}
            ref={(el) => (inside.current[i] = el)}
            position={[counter.x, counter.y, z]}
            color={colors.primary}
            intensity={0}
            distance={0.9}
            decay={2}
          />
        ))}
        {BEHIND.map((z, i) => (
          <pointLight
            key={`behind${i}`}
            ref={(el) => (behind.current[i] = el)}
            position={[counter.x, counter.y, z]}
            color={colors.secondary}
            intensity={0}
            distance={0.9}
            decay={2}
          />
        ))}
      </group>
      <ambientLight ref={amb} intensity={0.1} />
      {HOME.map(({ color, ...light }, i) => (
        <pointLight
          key={i}
          ref={(el) => (home.current[i] = el)}
          decay={2}
          color={colors[color]}
          {...light}
        />
      ))}
      <pointLight
        ref={rim}
        position={[0, 1.5, -3]}
        color={colors.secondary}
        intensity={0}
        distance={12}
        decay={2}
      />
      <pointLight
        ref={facet}
        position={[-4, 2, 5]}
        color={colors.primary}
        intensity={0}
        distance={14}
        decay={2}
      />
      <spotLight
        ref={streak}
        position={STREAK_AT}
        color={colors.secondary}
        intensity={0}
        angle={0.3}
        penumbra={1}
        distance={11}
        decay={2}
      />
    </>
  );
}
