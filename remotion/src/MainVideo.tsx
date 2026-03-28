import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Platform } from "./scenes/Scene3Platform";
import { Scene4Roles } from "./scenes/Scene4Roles";
import { Scene5Bidding } from "./scenes/Scene5Bidding";
import { Scene6NYSC } from "./scenes/Scene6NYSC";
import { Scene7PM } from "./scenes/Scene7PM";
import { Scene8API } from "./scenes/Scene8API";
import { Scene9Trust } from "./scenes/Scene9Trust";
import { Scene10CTA } from "./scenes/Scene10CTA";
import { PersistentBackground } from "./components/PersistentBackground";

const T = 25; // transition duration
const timing = springTiming({ config: { damping: 200 }, durationInFrames: T });

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={270}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={360}>
          <Scene2Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={420}>
          <Scene3Platform />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={600}>
          <Scene4Roles />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={480}>
          <Scene5Bidding />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={330}>
          <Scene6NYSC />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={480}>
          <Scene7PM />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={330}>
          <Scene8API />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={330}>
          <Scene9Trust />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={300}>
          <Scene10CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
