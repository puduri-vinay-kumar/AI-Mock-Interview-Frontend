"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Bot, LogOut, Menu, MoonStar, UserCircle2, X } from "lucide-react";
import { useState } from "react";

import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { GlowButton } from "@/components/ui/glow-button";
import { GlassCard } from "@/components/ui/glass-card";
import { navLinks } from "@/data/mock";
import { cn } from "@/lib/utils";

type NavbarProps = {
  showProfile?: boolean;
};

export function Navbar({ showProfile = false }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const status = useAuthStore((state) => state.status);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const logout = useLogout();
  const shouldShowProfile = showProfile && isHydrated && (status === "authenticated" || Boolean(token));
  const displayName = user?.name ?? "Candidate";
  const displayEmail = user?.email ?? "Signed in";
  const links = shouldShowProfile
    ? [
        { label: "Home", href: "/" },
        { label: "Setup", href: "/setup" },
        { label: "History", href: "/history" },
        { label: "Profile", href: "/profile" }
      ]
    : navLinks;

  return (
    <div className="container-shell pt-4 sm:pt-6">
      <GlassCard className="rounded-[26px] px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-2.5 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
              <Bot className="size-6 text-violet-200" />
            </div>
            <div>
              <span className="font-[var(--font-heading)] text-xl font-bold text-white sm:text-2xl">
                AI Interview
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {links.map((link) => {
              const isHashLink = link.href.startsWith("#");
              const isActive = isHashLink ? false : pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm transition-colors duration-200",
                    isActive
                      ? "bg-white/8 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {shouldShowProfile ? (
              <div className="flex items-center gap-3">
                <button className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10">
                  <MoonStar className="size-5" />
                </button>
                <div className="hidden text-right xl:block">
                  <div className="text-sm font-medium text-white">{displayName}</div>
                  <div className="text-xs text-slate-400">{displayEmail}</div>
                </div>
                <div className="rounded-full bg-gradient-to-br from-violet-500 to-blue-500 p-[1px] shadow-[0_0_25px_rgba(99,102,241,0.35)]">
                  <div className="rounded-full bg-slate-950/90 p-1">
                    <UserCircle2 className="size-9 text-slate-100" />
                  </div>
                </div>
                <button
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10"
                  onClick={logout}
                  aria-label="Logout"
                >
                  <LogOut className="size-5" />
                </button>
              </div>
            ) : (
              <>
                <button className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10">
                  <MoonStar className="size-5" />
                </button>
                <GlowButton href="/login" className="px-5 py-3">
                  Sign in
                </GlowButton>
              </>
            )}
          </div>

          <button
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: open ? "auto" : 0,
            opacity: open ? 1 : 0,
            marginTop: open ? 16 : 0
          }}
          className={cn("overflow-hidden lg:hidden")}
        >
          <div className="space-y-3 border-t border-white/10 pt-4">
            {links.map((link) => {
              const isHashLink = link.href.startsWith("#");
              const isActive = isHashLink ? false : pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "block rounded-2xl px-3 py-2 text-sm transition",
                    isActive
                      ? "bg-white/8 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {shouldShowProfile ? (
              <button
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left"
                onClick={logout}
              >
                <div>
                  <div className="text-sm text-slate-200">{displayName}</div>
                  <div className="text-xs text-slate-400">{displayEmail}</div>
                </div>
                <LogOut className="size-5 text-violet-200" />
              </button>
            ) : (
              <GlowButton href="/login" className="w-full justify-center">
                Sign in
              </GlowButton>
            )}
          </div>
        </motion.div>
      </GlassCard>
    </div>
  );
}
