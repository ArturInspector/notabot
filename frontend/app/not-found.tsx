'use client'

import { Button, Result } from 'antd'
import { useRouter } from 'next/navigation'

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <Result
      status="404"
      title="Страница не найдена (404)"
      subTitle="Похоже, вы зашли не туда!"
      extra={<Button type="primary" onClick={() => router.push('/')}>Вернуться на главную</Button>}
    />
  )
}
