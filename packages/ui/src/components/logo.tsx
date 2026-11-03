import aftercodeMark from "../assets/brand/aftercode-mark.png"
import aftercodeWordmark from "../assets/brand/aftercode-wordmark.png"

export const Mark = (props: { class?: string }) => (
  <img
    data-component="aftercode-mark"
    class={props.class}
    src={aftercodeMark}
    alt=""
    aria-hidden="true"
  />
)

export const Splash = (props: { ref?: (element: HTMLImageElement) => void; class?: string }) => (
  <img
    ref={props.ref}
    data-component="aftercode-splash-mark"
    class={props.class}
    src={aftercodeMark}
    alt=""
    aria-hidden="true"
  />
)

export const Logo = (props: { class?: string }) => (
  <img
    data-component="aftercode-logo"
    class={props.class}
    src={aftercodeWordmark}
    alt="Aftercode"
  />
)
