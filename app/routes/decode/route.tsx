import { Box, Flex, Stack, Text, Textarea } from "@chakra-ui/react"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useMemo, useState } from "react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }]
}

export default function Route() {
  const [value, setValue] = useState("")

  const result = useMemo(() => {
    try {
      return decodeURI(value)
    } catch (error) {
      if (error instanceof Error) {
        return error.message
      }
      return ""
    }
  }, [value])

  return (
    <Stack p={4}>
      <Textarea
        placeholder={"Encoded URI"}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
        }}
      />
      <Flex justifyContent={"center"}>
        <Text>{"↓"}</Text>
      </Flex>
      <Textarea value={result} readOnly />
    </Stack>
  )
}
