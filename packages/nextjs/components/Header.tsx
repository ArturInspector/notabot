"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BoltIcon, ChartBarIcon, HomeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ERC20_READ_ABI, HMT_ADDRESS, HMT_DECIMALS, HMT_SYMBOL } from "../utils/contracts";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    label: "Live",
    href: "/live",
    icon: <BoltIcon className="h-4 w-4" />,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <ChartBarIcon className="h-4 w-4" />,
  },
  {
    label: "NotABot 2.0",
    href: "/notabot",
    icon: <SparklesIcon className="h-4 w-4" />,
  },
];

const HeaderMenuLinks = ({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;

        const baseClasses =
          "group relative inline-flex items-center gap-2 text-sm font-medium transition-all duration-200";
        const desktopClasses =
          "px-3 py-1.5 rounded-full hover:bg-base-200/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
        const mobileClasses =
          "w-full px-3 py-2 rounded-xl hover:bg-base-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

        const activeClasses =
          "bg-gradient-to-r from-primary/30 to-primary/20 text-base-content shadow-lg ring-1 ring-primary/40";
        const inactiveClasses = "text-base-content/80 hover:text-base-content";

        return (
          <li key={href} className={mobile ? "w-full" : ""}>
            <Link
              href={href}
              passHref
              onClick={onNavigate}
              className={`${baseClasses} ${mobile ? mobileClasses : desktopClasses} ${
                isActive ? activeClasses : inactiveClasses
              }`}
            >
              <span className="flex items-center justify-center rounded-full bg-base-200/80 p-1 ring-1 ring-base-300/70">
                {icon}
              </span>
              <span className="relative">
                {label}
                <span
                  className={`pointer-events-none absolute -bottom-1 left-0 h-0.5 rounded-full transition-all ${
                    isActive ? "w-full bg-primary/80" : "w-0 bg-base-content/20 group-hover:w-full"
                  }`}
                />
              </span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => burgerMenuRef?.current?.removeAttribute("open"));

  const [activeChain, setActiveChain] = useState<"ethereum" | "solana">("ethereum");
  const { address } = useAccount();
  const { connected: solanaConnected } = useWallet();

  const { data: tokenBalanceRaw } = useReadContract({
    abi: ERC20_READ_ABI,
    address: HMT_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && HMT_ADDRESS) },
  });

  const tokenBalance = useMemo(() => {
    try {
      return tokenBalanceRaw ? formatUnits(tokenBalanceRaw as bigint, HMT_DECIMALS) : "0";
    } catch {
      return "0";
    }
  }, [tokenBalanceRaw]);

  const closeMobileMenu = () => {
    if (burgerMenuRef.current?.hasAttribute("open")) {
      burgerMenuRef.current.removeAttribute("open");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-base-300/60 bg-gradient-to-b from-base-100/95 to-base-100/80 backdrop-blur-xl">
      <div className="navbar mx-auto max-w-6xl px-2 sm:px-4">
        {/* LEFT: бренд + мобильный бургер */}
        <div className="navbar-start gap-2">
          {/* Mobile brand */}
          <Link
            href="/"
            passHref
            className="flex items-center gap-2 lg:hidden shrink-0 rounded-xl bg-base-200/80 px-2 py-1 text-xs font-semibold ring-1 ring-base-300/70 shadow-sm"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 ring-1 ring-primary/40 text-[11px] font-black text-primary-content">
              NA
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold">NotABot</span>
              <span className="text-[10px] opacity-70">One source, more chains</span>
            </span>
          </Link>

          {/* Desktop brand */}
          <Link
            href="/"
            passHref
            className="hidden items-center gap-3 lg:flex shrink-0 rounded-xl px-2 py-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/35 to-primary/10 ring-1 ring-primary/40 shadow-md">
              <span className="text-sm font-black text-primary-content">NA</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold tracking-tight">NotABot</span>
              <span className="text-[11px] opacity-75">One source, More blockchain</span>
            </div>
          </Link>

          {/* Mobile menu */}
          <details
            ref={burgerMenuRef}
            className="dropdown dropdown-end lg:hidden ml-1"
          >
            <summary className="btn btn-ghost btn-sm rounded-xl px-2 shadow-none hover:bg-base-200/70">
              <Bars3Icon className="h-5 w-5" />
            </summary>
            <ul className="dropdown-content menu mt-2 w-64 rounded-2xl border border-base-300/80 bg-base-100/95 p-3 shadow-2xl backdrop-blur-md space-y-1">
              <HeaderMenuLinks mobile={true} onNavigate={closeMobileMenu} />
              <li className="mt-2 border-t border-base-300/70 pt-2">
                <span className="text-[11px] uppercase tracking-wide text-base-content/60">
                  Network
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="join join-horizontal w-fit rounded-full ring-1 ring-base-300/70 bg-base-200/70">
                    <button
                      className={`join-item btn btn-xs rounded-l-full ${
                        activeChain === "ethereum"
                          ? "btn-primary shadow-md"
                          : "btn-ghost text-base-content/80"
                      }`}
                      onClick={() => setActiveChain("ethereum")}
                    >
                      ETH
                    </button>
                    <button
                      className={`join-item btn btn-xs rounded-r-full ${
                        activeChain === "solana"
                          ? "btn-primary shadow-md"
                          : "btn-ghost text-base-content/80"
                      }`}
                      onClick={() => setActiveChain("solana")}
                    >
                      SOL
                    </button>
                  </div>
                </div>
              </li>
              <li className="mt-2">
                {activeChain === "ethereum" ? (
                  <>
                    {HMT_ADDRESS && address ? (
                      <div className="mb-2 flex items-center gap-1 rounded-xl bg-base-200/70 px-2 py-1 ring-1 ring-base-300/70">
                        <div className="badge badge-primary badge-outline badge-sm">
                          {HMT_SYMBOL}
                        </div>
                        <div className="font-mono text-xs tabular-nums">
                          {parseFloat(tokenBalance).toFixed(2)}
                        </div>
                      </div>
                    ) : null}
                    <RainbowKitCustomConnectButton />
                  </>
                ) : (
                  <WalletMultiButton className="!h-8 !rounded-full !px-3 !text-xs !bg-gradient-to-r !from-primary/80 !to-primary !text-primary-content !border-0 !shadow-lg hover:!brightness-110 active:!brightness-95 transition-all" />
                )}
              </li>
            </ul>
          </details>

          {/* Desktop nav */}
          <nav className="hidden lg:flex">
            <ul className="flex items-center gap-1 rounded-full bg-base-200/70 px-1.5 py-1 ring-1 ring-base-300/80 shadow-sm">
              <HeaderMenuLinks />
            </ul>
          </nav>
        </div>

        {/* RIGHT: сеть + баланс + кошельки (десктоп) */}
        <div className="navbar-end hidden items-center gap-2 lg:flex">
          <div className="join join-horizontal rounded-full ring-1 ring-base-300/70 bg-base-200/70 backdrop-blur-sm shadow-sm">
            <button
              className={`join-item btn btn-xs sm:btn-sm rounded-l-full ${
                activeChain === "ethereum"
                  ? "btn-primary shadow-md"
                  : "btn-ghost text-base-content/80"
              }`}
              onClick={() => setActiveChain("ethereum")}
            >
              <span className="hidden sm:inline">Ethereum</span>
              <span className="sm:hidden">ETH</span>
            </button>
            <button
              className={`join-item btn btn-xs sm:btn-sm rounded-r-full ${
                activeChain === "solana"
                  ? "btn-primary shadow-md"
                  : "btn-ghost text-base-content/80"
              }`}
              onClick={() => setActiveChain("solana")}
            >
              <span className="hidden sm:inline">Solana</span>
              <span className="sm:hidden">SOL</span>
            </button>
          </div>

          {activeChain === "ethereum" ? (
            <>
              {HMT_ADDRESS && address ? (
                <div className="hidden items-center gap-1 rounded-xl bg-base-200/70 px-2 py-1 ring-1 ring-base-300/80 backdrop-blur-sm md:flex">
                  <div className="badge badge-primary badge-outline badge-sm">
                    {HMT_SYMBOL}
                  </div>
                  <div className="font-mono text-xs tabular-nums">
                    {parseFloat(tokenBalance).toFixed(2)}
                  </div>
                </div>
              ) : null}
              <div className="min-w-0">
                <RainbowKitCustomConnectButton />
              </div>
            </>
          ) : (
            <div className="min-w-0">
              <WalletMultiButton className="!h-9 !rounded-full !px-4 !text-xs !bg-gradient-to-r !from-primary/80 !to-primary !text-primary-content !border-0 !shadow-lg hover:!brightness-110 active:!brightness-95 transition-all" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
