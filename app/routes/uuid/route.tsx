import { Box, Stack, Text } from "@chakra-ui/react"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useState } from "react"
import { Button } from "~/components/ui/button"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }]
}

export default function Route() {
  const [ids, setIds] = useState<string[]>([])

  const onClick = () => {
    const ids = Array.from({ length: 128 }, () => {
      return crypto.randomUUID()
    })
    setIds(ids)
  }

  return (
    <Stack gap={4} p={4}>
      <Button className={"w-full"} onClick={onClick}>
        {"生成"}
      </Button>
      {ids.map((id) => (
        <Box key={id}>
          <Text>{id}</Text>
        </Box>
      ))}
    </Stack>
  )
}
