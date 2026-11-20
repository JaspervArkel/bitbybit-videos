import React from "react";
import { Composition, Still } from "remotion";
import { FPS } from "./lib/ui";
import { PASSWORD_HASH_FRAMES, PasswordHash } from "./videos/password-hash/PasswordHash";
import { INT_MAX_FRAMES, IntMax } from "./videos/int-max/IntMax";
import { IntMaxThumb } from "./videos/int-max/Thumb";
import { CPU_SECOND_FRAMES, CpuSecond } from "./videos/cpu-second/CpuSecond";
import { LOADING_BARS_FRAMES, LoadingBars } from "./videos/loading-bars/LoadingBars";
import { ARIANE_5_FRAMES, Ariane5 } from "./videos/ariane-5/Ariane5";
import { FPGA_FRAMES, Fpga } from "./videos/fpga/Fpga";
import { FRAME_PACING_FRAMES, FramePacing } from "./videos/frame-pacing/FramePacing";
import { AI_IMAGE_NUMBERS_FRAMES, AiImageNumbers } from "./videos/ai-image-numbers/AiImageNumbers";
import { TERABYTE_931_FRAMES, Terabyte931 } from "./videos/terabyte-931/Terabyte931";

// One <Composition> per video. id = backlog slug in PascalCase.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PasswordHash" component={PasswordHash} durationInFrames={PASSWORD_HASH_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Terabyte931" component={Terabyte931} durationInFrames={TERABYTE_931_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="CpuSecond" component={CpuSecond} durationInFrames={CPU_SECOND_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="LoadingBars" component={LoadingBars} durationInFrames={LOADING_BARS_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Ariane5" component={Ariane5} durationInFrames={ARIANE_5_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Fpga" component={Fpga} durationInFrames={FPGA_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="FramePacing" component={FramePacing} durationInFrames={FRAME_PACING_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="AiImageNumbers" component={AiImageNumbers} durationInFrames={AI_IMAGE_NUMBERS_FRAMES} fps={FPS} width={1080} height={1920} />
    {/* long-form (16:9) */}
    <Composition id="IntMax" component={IntMax} durationInFrames={INT_MAX_FRAMES} fps={FPS} width={1920} height={1080} />
    <Still id="IntMaxThumb" component={IntMaxThumb} width={1280} height={720} />
  </>
);
