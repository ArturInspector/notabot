import React from 'react'

import { Flex, Spin } from 'antd'

export default function Loader() {
  return (
    <Flex style={{ minHeight: '100vh', width: '100%' }} justify="center" align="center" className="loader">
      <Spin size="large" />
    </Flex>
  )
}
