"use client";

import { UploadthingConfigOptions, UploadthingRoot } from "@uploadthing/react";
import { ReactNode } from "react";

export function UploadthingProvider({
  children,
  config,
}: {
  children: ReactNode;
  config?: UploadthingConfigOptions;
}) {
  return (
    <UploadthingRoot config={config}>
      {children}
    </UploadthingRoot>
  );
} 