import { stegaClean } from '@sanity/client/stega';
import FigureCaption from '@/components/RichText/FigureCaption';
import { blockLayout } from '@/components/RichText/layout';
import uid from '@/lib/uid';
import SceneCanvas from './SceneCanvas';
import styles from '@/styles/components/ThreeScene.module.scss';

// Fixed lookup rather than parsing the string: the schema offers these four and
// an unknown value should not reach CSS.
const ASPECTS = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '21:9': '21 / 9'
};

// Server component: the query resolves the chosen model source to a single URL,
// which this passes to the client island. Only the WebGL canvas is client-side
// (SceneCanvas): that is the most SSR you can get, since WebGL cannot run on the
// server.
export default function ThreeScene(props) {
  const {
    model,
    lights,
    background,
    aspectRatio,
    size,
    align,
    caption,
    source,
    environmentSource,
    environmentPreset,
    environment,
    environmentBackground,
    keyLight,
    bloom,
    grain,
    vignette,
    orbitControls,
    zoom
  } = props;

  const layout = blockLayout(stegaClean(size), stegaClean(align));
  const aspect = ASPECTS[stegaClean(aspectRatio)] || ASPECTS['16:9'];

  return (
    <div className={styles.column}>
      <figure
        id={uid(props)}
        className={styles.figure}
        {...layout}
        style={{ '--aspect': aspect }}>
        <div className={styles.frame}>
          <SceneCanvas
            model={stegaClean(model)}
            background={stegaClean(background?.hex)}
            lights={stegaClean(lights?.hex)}
            environmentSource={stegaClean(environmentSource)}
            environmentPreset={stegaClean(environmentPreset)}
            environment={stegaClean(environment)}
            environmentBackground={environmentBackground}
            keyLight={keyLight}
            bloom={stegaClean(bloom)}
            grain={grain}
            vignette={vignette}
            orbitControls={orbitControls}
            zoom={zoom}
          />
        </div>
        <FigureCaption caption={caption} source={source} />
      </figure>
    </div>
  );
}
