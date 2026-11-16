import React from "react";
import { Composition, Still } from "remotion";
import { FPS } from "./lib/ui";
import { PASSWORD_HASH_FRAMES, PasswordHash } from "./videos/password-hash/PasswordHash";
import { INT_MAX_FRAMES, IntMax } from "./videos/int-max/IntMax";
import { IntMaxThumb } from "./videos/int-max/Thumb";
import { CPU_SECOND_FRAMES, CpuSecond } from "./videos/cpu-second/CpuSecond";
import { TERABYTE_931_FRAMES, Terabyte931 } from "./videos/terabyte-931/Terabyte931";

// One <Composition> per video. id = backlog slug in PascalCase.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PasswordHash" component={PasswordHash} durationInFrames={PASSWORD_HASH_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Terabyte931" component={Terabyte931} durationInFrames={TERABYTE_931_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="CpuSecond" component={CpuSecond} durationInFrames={CPU_SECOND_FRAMES} fps={FPS} width={1080} height={1920} />
    {/* long-form (16:9) */}
    <Composition id="IntMax" component={IntMax} durationInFrames={INT_MAX_FRAMES} fps={FPS} width={1920} height={1080} />
    <Still id="IntMaxThumb" component={IntMaxThumb} width={1280} height={720} />
  </>
);
