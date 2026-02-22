"use client";

import { useEffect, useState } from "react";

interface VersionInfo {
  version: string;
  gitHash: string;
  buildDate: string;
}

export function VersionFooter() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    try {
      // Dynamically import the generated version file
      import("../../src/lib/version").then((module) => {
        setVersionInfo({
          version: module.VERSION,
          gitHash: module.GIT_HASH,
          buildDate: module.BUILD_DATE,
        });
      });
    } catch (error) {
      console.error("Failed to load version info:", error);
    }
  }, []);

  if (!versionInfo) {
    return null;
  }

  return (
    <footer className="version-footer">
      <small>
        v{versionInfo.version} ({versionInfo.gitHash}) — {versionInfo.buildDate}
      </small>
    </footer>
  );
}
