import React from "react";
import { Composition } from "remotion";
import { FPS } from "./lib/ui";
import { PASSWORD_HASH_FRAMES, PasswordHash } from "./videos/password-hash/PasswordHash";

// One <Composition> per video. id = backlog slug in PascalCase.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PasswordHash" component={PasswordHash} durationInFrames={PASSWORD_HASH_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
