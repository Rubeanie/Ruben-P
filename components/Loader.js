import * as React from "react";
import { useProgress } from "@react-three/drei";
import Icon from "./Icon";
import ProgressBar from "react-customizable-progressbar";
import Var from "../styles/abstracts/_colors.module.scss";

const defaultDataInterpolation = (p) => `${p.toFixed(2)}%`;

function Loader({
  dataInterpolation = defaultDataInterpolation,
  initialState = (active) => active,
}) {
  const { active, progress } = useProgress();
  const progressRef = React.useRef(0);
  const rafRef = React.useRef(0);
  const progressSpanRef = React.useRef(null);
  const [shown, setShown] = React.useState(initialState(active));
  React.useEffect(() => {
    let t;
    if (active !== shown) t = setTimeout(() => setShown(active), 300);
    return () => clearTimeout(t);
  }, [shown, active]);
  const updateProgress = React.useCallback(() => {
    if (!progressSpanRef.current) return;
    progressRef.current += (progress - progressRef.current) / 2;
    if (progressRef.current > 0.95 * progress || progress === 100)
      progressRef.current = progress;
    progressSpanRef.current.innerText = dataInterpolation(progressRef.current);
    if (progressRef.current < progress)
      rafRef.current = requestAnimationFrame(updateProgress);
  }, [dataInterpolation, progress]);
  React.useEffect(() => {
    updateProgress();
    return () => cancelAnimationFrame(rafRef.current);
  }, [updateProgress]);
  return shown ? (
    <html>
      <div className="loading" style={{ opacity: active ? 1 : 0 }}>
        <div className="item">
          <div className="row">
            <ProgressBar
              radius={100}
              progress={progress}
              cut={/* 130 */ 0}
              rotate={/* 155 */ 90}
              initialAnimation={true}
              strokeColor={Var.foreground_color}
              transition=".4s ease"
              strokeLinecap="square"
              trackTransition=".1s ease"
              trackStrokeLinecap="butt"
              trackStrokeColor={Var.midground_color}
            >
              <div className="indicator">
                <div className="inner">
                  <Icon className="icon" />
                </div>
              </div>
              <span className="percentage" ref={progressSpanRef} />
            </ProgressBar>
          </div>
        </div>
        {/*  */}
        {/*           <span className="data">
            <progressSpanRef />
          </span> */}
      </div>
    </html>
  ) : null;
}

export { Loader };
