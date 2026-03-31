"use client";

import { createContext, useContext } from "react";

type Lang = "en" | "fr";

export const DocsLocaleContext = createContext<Lang>("en");

export function useDocsLocale(): Lang {
  return useContext(DocsLocaleContext);
}
