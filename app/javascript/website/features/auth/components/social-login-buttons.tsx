import type { ReactNode, SVGProps } from "react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.09 24 12.07Z"
      />
    </svg>
  )
}

interface Provider {
  id: string
  label: string
  icon: ReactNode
}

const PROVIDERS: Provider[] = [
  { id: "google", label: "Google", icon: <GoogleIcon className="size-5" /> },
  {
    id: "facebook",
    label: "Facebook",
    icon: <FacebookIcon className="size-5" />,
  },
]

// UI only for now: the buttons render but no OAuth flow is wired up yet.
export function SocialLoginButtons({ verb }: { verb: "Sign in" | "Sign up" }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3" role="separator">
        <span className="h-px flex-1 bg-[#2B3A32]/15" />
        <span className="text-xs tracking-[0.18em] text-[#2B3A32]/55 uppercase">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-[#2B3A32]/15" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map(({ id, label, icon }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            aria-label={`${verb} with ${label}`}
            title={`${verb} with ${label}`}
            onClick={() =>
              toast.info(`${label} sign-in is coming soon`, {
                id: `social-${id}`,
              })
            }
            className="h-11 rounded-full border-[#2B3A32]/20 bg-transparent text-[#2B3A32] hover:bg-[#2B3A32]/5 hover:text-[#2B3A32]"
          >
            {icon}
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
