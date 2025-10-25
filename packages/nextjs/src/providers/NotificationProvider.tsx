"use client";

import React, { createContext, useContext } from "react";
import { notification } from "antd";

type NotificationApi = ReturnType<typeof notification.useNotification>[0];

const NotificationApiContext = createContext<NotificationApi | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [api, contextHolder] = notification.useNotification();

  return (
    <NotificationApiContext.Provider value={api}>
      {contextHolder}
      {children}
    </NotificationApiContext.Provider>
  );
};

export function useNotificationApi(): NotificationApi {
  const api = useContext(NotificationApiContext);

  if (!api) {
    throw new Error(
      "useNotificationApi должен использоваться внутри NotificationProvider",
    );
  }

  return api;
}
