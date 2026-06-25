import { stegaClean } from '@sanity/client/stega';
import uid from '@/lib/uid';
import RichText from '@/components/RichText';
import SceneCanvas from './SceneCanvas';

// Server component: the section wrapper and the intro rich text render on the
// server. Only the WebGL canvas is a client island (SceneCanvas), which is the
// most SSR you can get — WebGL can't run server-side.
export default function ThreeScene(props) {
  const { intro, model, lights, background, orbitControls, zoom } = props;

  return (
    <section id={uid(props)}>
      {intro && <RichText value={intro} />}
      <SceneCanvas
        model={stegaClean(model?.secure_url)}
        background={stegaClean(background?.hex)}
        lights={stegaClean(lights?.hex)}
        orbitControls={orbitControls}
        zoom={zoom}
      />
    </section>
  );
}
