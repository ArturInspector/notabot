import React from "react";
import { NotificationProvider } from "./NotificationProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";

interface Props {
  children: React.ReactNode;
}

const AntdProvider: React.FC<Props> = ({ children }) => {
  return (
    <ConfigProvider locale={ruRU}>
      <AntdRegistry>
        <NotificationProvider>{children}</NotificationProvider>
      </AntdRegistry>
    </ConfigProvider>
  );
};

export default AntdProvider;
