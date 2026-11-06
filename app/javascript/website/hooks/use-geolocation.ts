import { useState } from "react"

import { useI18n } from "@/website/lib/i18n"

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Asks the browser for the device's position. `locate` resolves through
 * `onLocate`; `error` explains a refusal or failure in plain words.
 */
export function useGeolocation(onLocate: (coords: Coordinates) => void) {
  const { t } = useI18n()
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locate = () => {
    if (!navigator.geolocation) {
      setError(t("Your browser can't share its location."))
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false)
        onLocate({ latitude: coords.latitude, longitude: coords.longitude })
      },
      (failure) => {
        setLocating(false)
        setError(
          failure.code === failure.PERMISSION_DENIED
            ? t("Location access was denied.")
            : t("We couldn't find your location."),
        )
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  return { locate, locating, error }
}
