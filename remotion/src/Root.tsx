import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// Scene durations: 270+360+420+600+480+330+480+330+330+300 = 3900
// Transition overlaps: 9 × 25 = 225
// Net duration: 3675 frames = 122.5s ≈ 2:02

const DURATION = 3675;
const FPS = 30;

export const RemotionRoot = () => (
  <>
    <Composition
      id="landscape"
      component={MainVideo}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="portrait"
      component={MainVideo}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
