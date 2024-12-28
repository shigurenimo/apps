import { Box, Button, HStack, SimpleGrid, Stack } from "@chakra-ui/react"
import { useSpringValue } from "@react-spring/web"
import { useEffect, useState } from "react"

type Dungeon = number[][]

function getWallDistances(
  dungeon: Dungeon,
  x: number,
  y: number,
  directionAngle: number,
  numRays: number,
  eyeOffset: number,
): number[] {
  const distances = []

  const FOV = (80 * Math.PI) / 180

  const playerAngle = directionAngle

  // プレイヤーの位置をセルの中心に調整
  let startX = x + 0.5
  let startY = y + 0.5

  // 視点の位置をセルの中心と面の間で補間
  startX += Math.cos(playerAngle) * 0.5 * eyeOffset
  startY += Math.sin(playerAngle) * 0.5 * eyeOffset

  const screenWidth = numRays
  const halfFOV = FOV / 2

  for (let i = 0; i < numRays; i++) {
    // レイのスクリーン上の位置
    const cameraX = (2 * i) / (screenWidth - 1) - 1 // -1から1の範囲
    const rayAngle = playerAngle + Math.atan(cameraX * Math.tan(halfFOV))

    let distance = 0
    const maxDistance = 30
    const stepSize = 0.05

    let hit = false

    while (!hit && distance < maxDistance) {
      distance += stepSize

      const rayX = startX + distance * Math.cos(rayAngle)
      const rayY = startY + distance * Math.sin(rayAngle)

      const mapX = Math.floor(rayX)
      const mapY = Math.floor(rayY)

      // 境界チェック
      if (
        mapX < 0 ||
        mapX >= dungeon[0].length ||
        mapY < 0 ||
        mapY >= dungeon.length
      ) {
        hit = true
        distance = maxDistance
        break
      }

      if (dungeon[mapY][mapX] === 1) {
        hit = true
        // 垂直距離の計算（魚眼効果の補正）
        const perpendicularDistance =
          distance * Math.cos(rayAngle - playerAngle)

        distances.push(perpendicularDistance)
        break
      }
    }

    if (!hit) {
      distances.push(maxDistance)
    }
  }

  return distances
}

// ダンジョン例
const dungeon: Dungeon = [
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1],
  [1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
]

/**
 * レイの本数
 */
const numRays = 32

export default function Route() {
  const cells = dungeon.flat()

  const [position, setPosition] = useState([1, 0])

  const [targetPosition, setTargetPosition] = useState<[number, number] | null>(
    null,
  )

  const [isMoving, setIsMoving] = useState(false)

  const [directionAngle, setDirectionAngle] = useState(0) // 角度で管理
  const [targetDirectionAngle, setTargetDirectionAngle] = useState<
    number | null
  >(null)

  const [isRotating, setIsRotating] = useState(false)

  const playerIndex =
    Math.floor(position[1]) * dungeon[0].length + Math.floor(position[0])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!targetPosition) return
    setIsMoving(true)

    let animationFrameId: number
    const startTime = performance.now()
    const duration = 500 // 移動にかかる時間（ミリ秒）

    const startX = position[0]
    const startY = position[1]
    const deltaX = targetPosition[0] - startX
    const deltaY = targetPosition[1] - startY

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const t = Math.min(elapsedTime / duration, 1) // 0から1までの値

      // イージング関数（線形補間）
      const newX = startX + deltaX * t
      const newY = startY + deltaY * t

      setPosition([newX, newY])

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        // アニメーション終了
        setIsMoving(false)
        setTargetPosition(null)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [targetPosition])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (targetDirectionAngle === null) return
    setIsRotating(true)

    let animationFrameId: number
    const startTime = performance.now()
    const duration = 500 // 回転にかかる時間（ミリ秒）

    const startAngle = directionAngle
    let deltaAngle = targetDirectionAngle - startAngle

    // 角度の差を -π から π の範囲に正規化
    deltaAngle = ((deltaAngle + Math.PI) % (2 * Math.PI)) - Math.PI

    const animateRotation = (currentTime: number) => {
      const elapsedTime = currentTime - startTime

      /**
       * 0から1までの値
       */
      const t = Math.min(elapsedTime / duration, 1)

      // 線形補間
      const newAngle = startAngle + deltaAngle * t

      setDirectionAngle(newAngle)

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animateRotation)
        return
      }

      // アニメーション終了
      setIsRotating(false)
      setTargetDirectionAngle(null)

      // 角度を -π から π の範囲に正規化
      let normalizedAngle = newAngle % (2 * Math.PI)
      if (normalizedAngle > Math.PI) {
        normalizedAngle -= 2 * Math.PI
      } else if (normalizedAngle < -Math.PI) {
        normalizedAngle += 2 * Math.PI
      }
      setDirectionAngle(normalizedAngle)
    }

    animationFrameId = requestAnimationFrame(animateRotation)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [targetDirectionAngle])

  const onMove = () => {
    if (isMoving || isRotating) return // 移動中や回転中は無視
    const x = position[0] + Math.cos(directionAngle)
    const y = position[1] + Math.sin(directionAngle)

    if (dungeon[Math.floor(y)]?.[Math.floor(x)] === 0) {
      setTargetPosition([x, y])
    }
  }

  const onTurnLeft = () => {
    if (isMoving || isRotating) return
    const newAngle = directionAngle - (90 * Math.PI) / 180
    setTargetDirectionAngle(newAngle)
  }

  const onTurnRight = () => {
    if (isMoving || isRotating) return
    const newAngle = directionAngle + (90 * Math.PI) / 180
    setTargetDirectionAngle(newAngle)
  }

  const wallDistances = getWallDistances(
    dungeon,
    position[0],
    position[1],
    directionAngle,
    numRays,
    -0.5,
  )

  /**
   * RGBA
   */
  const getWallColor = (distance: number) => {
    const maxDistance = 4
    const alpha = Math.min(1 - distance / maxDistance, 1)
    return `rgba(0, 0, 0, ${alpha})`
  }

  const maxWallHeight = 40

  return (
    <Stack p={4}>
      <HStack>
        <Box w={80}>
          <SimpleGrid columns={16} gap={0}>
            {cells.map((cell, index) => {
              const cellX = index % dungeon[0].length
              const cellY = Math.floor(index / dungeon[0].length)
              const isPlayerCell =
                Math.floor(position[0]) === cellX &&
                Math.floor(position[1]) === cellY
              if (isPlayerCell) {
                return (
                  <Box
                    key={index.toFixed()}
                    aspectRatio={1}
                    bg={"blue.400"}
                    position="relative"
                  />
                )
              }

              return (
                <Box
                  key={index.toFixed()}
                  aspectRatio={1}
                  bg={cell === 1 ? "gray.800" : "gray.200"}
                  position="relative"
                />
              )
            })}
          </SimpleGrid>
        </Box>
        <Box w={"420px"} h={80}>
          <SimpleGrid
            h={"100%"}
            columns={numRays}
            gap={0}
            alignItems={"center"}
          >
            {wallDistances.map((distance, index) => {
              // 距離が0の場合を避けるために、最小値を設定
              const correctedDistance = Math.max(distance, 0.1)
              // 壁の高さを距離に反比例させて計算
              const wallHeight = maxWallHeight / correctedDistance + 80
              return (
                <Box
                  key={index.toFixed()}
                  width="100%"
                  height={`${wallHeight}px`}
                  backgroundColor={getWallColor(distance)}
                />
              )
            })}
          </SimpleGrid>
        </Box>
      </HStack>
      <HStack>
        <Button onClick={onMove}>{"move"}</Button>
        <Button onClick={onTurnLeft}>{"turn left"}</Button>
        <Button onClick={onTurnRight}>{"turn right"}</Button>
      </HStack>
    </Stack>
  )
}
