import { Wordmark } from "@opencode/ui/wordmark"

export function AnimatedWordmark(props: { active: boolean }) {
  return (
    <Wordmark
      class="settings-about-wordmark"
      muted={false}
      style={{ opacity: props.active ? 0.4 : 0.2 }}
    />
  )
}
