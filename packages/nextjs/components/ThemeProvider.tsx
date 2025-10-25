"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import AntdProvider from "~~/src/providers/Antd";

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <AntdProvider>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </AntdProvider>
  );
};
