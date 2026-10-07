import { stegaClean } from '@sanity/client/stega';
import FigureCaption from '@/components/RichText/FigureCaption';
import { blockLayout } from '@/components/RichText/layout';
import uid from '@/lib/uid';
import { aspectOf } from './aspects';
import SceneCanvas from './SceneCanvas';
import styles from '@/styles/components/ThreeScene.module.scss';

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
    zoom,
    loadOnClick,
    poster,
    modelBytes
  } = props;

  const layout = blockLayout(stegaClean(size), stegaClean(align));
  const aspect = aspectOf(stegaClean(aspectRatio));
  const cleanModel = stegaClean(model);

  return (
    <div className={styles.column}>
      <figure
        id={uid(props)}
        className={styles.figure}
        {...layout}
        style={{ '--aspect': aspect }}>
        {/* Takes focus from the load button when the scene replaces it. */}
        <div className={styles.frame} tabIndex={loadOnClick ? -1 : undefined}>
          {/* A live edit can swap the model or the facade on a mounted scene;
              a fresh instance keeps the old load state from carrying over. */}
          <SceneCanvas
            key={`${cleanModel}|${!!loadOnClick}`}
            model={cleanModel}
            background={stegaClean(background?.hex)}
            lights={stegaClean(lights?.hex)}
            environmentSource={stegaClean(environmentSource)}
            environmentPreset={stegaClean(environmentPreset)}
            environment={stegaClean(environment)}
            environmentBackground={environmentBackground}
            keyLight={keyLight}
            bloom={stegaClean(bloom)}
            grain={stegaClean(grain)}
            vignette={stegaClean(vignette)}
            orbitControls={orbitControls}
            zoom={zoom}
            loadOnClick={loadOnClick}
            poster={stegaClean(poster)}
            blockSize={layout['data-size']}
            modelBytes={modelBytes}
            label={stegaClean(caption)}
          />
        </div>
        <FigureCaption caption={caption} source={source} />
      </figure>
    </div>
  );
}
