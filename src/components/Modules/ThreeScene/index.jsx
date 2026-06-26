import { stegaClean } from '@sanity/client/stega';
import uid from '@/lib/uid';
import SceneCanvas from './SceneCanvas';

// Server component: the query resolves the chosen model source to a single URL,
// which this passes to the client island. Only the WebGL canvas is client-side
// (SceneCanvas) — that's the most SSR you can get, since WebGL can't run on the
// server.
export default function ThreeScene(props) {
  const {
    model,
    lights,
    background,
    height,
    width,
    environmentSource,
    environmentPreset,
    environment,
    environmentBackground,
    orbitControls,
    zoom
  } = props;

  return (
    <section id={uid(props)}>
      <SceneCanvas
        model={stegaClean(model)}
        background={stegaClean(background?.hex)}
        lights={stegaClean(lights?.hex)}
        height={stegaClean(height)}
        width={stegaClean(width)}
        environmentSource={stegaClean(environmentSource)}
        environmentPreset={stegaClean(environmentPreset)}
        environment={stegaClean(environment)}
        environmentBackground={environmentBackground}
        orbitControls={orbitControls}
        zoom={zoom}
      />
    </section>
  );
}
