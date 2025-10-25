"use client";

import Link from "next/link";
import { Button, Result } from "antd";

export default function NotFoundPage() {
  return (
    <Result
      status="404"
      title="Страница не найдена (404)"
      subTitle="Похоже, вы зашли не туда!"
      extra={
        <Link href={"/"}>
          <Button type="primary">Вернуться на главную</Button>
        </Link>
      }
    />
  );
}
