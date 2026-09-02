// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { StagePage, stageMetadata, type StageRouteParams } from "@/features/context/StagePage";
import { stageStaticParams } from "@/features/context/routes";

const DOMAIN = "feeding";

// Static public age routes: one page per stage bin, nothing else (broad age state only).
export const dynamicParams = false;

export function generateStaticParams() {
  return stageStaticParams(DOMAIN);
}

export function generateMetadata(props: StageRouteParams): Promise<Metadata> {
  return stageMetadata(DOMAIN, props);
}

export default function Page(props: StageRouteParams) {
  return <StagePage domain={DOMAIN} {...props} />;
}
