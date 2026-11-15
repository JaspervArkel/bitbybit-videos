import React from "react";
import { Composition } from "remotion";
import { FPS } from "./lib/ui";
import { PASSWORD_HASH_FRAMES, PasswordHash } from "./videos/password-hash/PasswordHash";
import { TERABYTE_931_FRAMES, Terabyte931 } from "./videos/terabyte-931/Terabyte931";

// One <Composition> per video. id = backlog slug in PascalCase.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PasswordHash" component={PasswordHash} durationInFrames={PASSWORD_HASH_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Terabyte931" component={Terabyte931} durationInFrames={TERABYTE_931_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
