import * as React from "react"

const MOBILE_BREAKPOINT = 768

function getMatchMediaQuery() {
  return `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }
  const mql = window.matchMedia(getMatchMediaQuery())
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return false
  }
  return window.matchMedia(getMatchMediaQuery()).matches
}

/**
 * На SSR и при первом клиентском рендере всегда `false`, чтобы разметка совпадала
 * с сервером (сервер не знает ширину окна). После mount подставляется реальное
 * значение `matchMedia` — иначе сайдбар на мобильных рендерит другой DOM и ломает гидрацию.
 */
export function useIsMobile() {
  const mqMobile = React.useSyncExternalStore(subscribe, getSnapshot, () => false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? mqMobile : false
}
