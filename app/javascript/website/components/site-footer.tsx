import { Link } from "@inertiajs/react"

import { signIn, signUp } from "@/routes"
import { Logo } from "@/website/components/brand-mark"

export function SiteFooter() {
  return (
    <footer className="bg-white px-6 py-14 text-[#5B6B5E]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Hand-finished auto care, by appointment.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium text-[#2B3A32]">Visit</p>
            <p className="mt-3 leading-relaxed">
              [STREET ADDRESS]
              <br />
              [CITY, STATE ZIP]
            </p>
          </div>
          <div>
            <p className="font-medium text-[#2B3A32]">Contact</p>
            <p className="mt-3 leading-relaxed">
              [PHONE NUMBER]
              <br />
              [EMAIL ADDRESS]
            </p>
          </div>
          <div>
            <p className="font-medium text-[#2B3A32]">Account</p>
            <p className="mt-3 flex flex-col gap-2">
              <Link href={signIn()} className="hover:text-[#8A6240]">
                Sign in
              </Link>
              <Link href={signUp()} className="hover:text-[#8A6240]">
                Book your visit
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-[#2B3A32]/10 pt-6 text-xs text-[#5E5D59]">
        © {new Date().getFullYear()} Auto Atelier
      </div>
    </footer>
  )
}
