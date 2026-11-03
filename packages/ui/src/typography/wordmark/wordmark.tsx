import aftercodeWordmark from "../../assets/brand/aftercode-wordmark.png"
import type { ComponentProps } from "solid-js"

export function Wordmark(
  props: Pick<ComponentProps<"img">, "class" | "style"> & { fade?: boolean; muted?: boolean; outline?: boolean },
) {
  const opacity = () => (props.muted === false ? 1 : props.fade === false ? 0.7 : 0.6)

  return (
    <img
      data-component="aftercode-wordmark"
      src={aftercodeWordmark}
      alt="Aftercode"
      class={props.class}
      style={{ opacity: opacity(), ...props.style }}
    />
  )
}
