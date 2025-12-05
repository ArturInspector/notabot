"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  BoltIcon,
  ChartBarIcon,
  HomeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  ERC20_READ_ABI,
  HMT_ADDRESS,
  HMT_DECIMALS,
  HMT_SYMBOL,
} from "../utils/contracts";

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
    label: "NeoBot 2.0",
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
          "group relative inline-flex items-center gap-2 text-sm font-semibold tracking-tight transition-all duration-200 whitespace-nowrap";

        // Desktop: компактная таблетка
        const desktopClasses =
          "px-3 py-1 rounded-full hover:bg-[#20274a] hover:shadow-[0_0_0_1px_rgba(148,163,255,0.35)]";

        // Mobile: крупные тап-зоны
        const mobileClasses = "w-full px-3 py-3 rounded-xl hover:bg-[#111528]";

        const activeClasses =
          "bg-[radial-gradient(circle_at_top,_#323b7c,_#141937)] text-slate-50 " +
          "shadow-[0_18px_45px_rgba(15,23,42,0.95)] ring-1 ring-indigo-400/60";

        const inactiveClasses = "text-slate-200/80 hover:text-slate-50";

        return (
          <li key={href} className={mobile ? "w-full" : ""}>
            <Link
              href={href}
              passHref
              onClick={onNavigate}
              title={!mobile ? label : undefined} // для иконок на десктопе подсказка
              className={[
                baseClasses,
                mobile ? mobileClasses : desktopClasses,
                isActive ? activeClasses : inactiveClasses,
              ].join(" ")}
            >
              {/* Иконка в кружке */}
              <span
                className={`flex items-center justify-center rounded-full p-1.5 ring-1 ${
                  "bg-[#272f5b] ring-indigo-400/70 text-indigo-100"
                }`}
              >
                {icon}
              </span>

              {/* Текст */}
              <span className="relative">
                {/* Мобилка: всегда показываем текст */}
                {/* Десктоп: показываем только на xl+ */}
                <span
                  className={[
                    mobile
                      ? "font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c4d5ff] via-[#e0b5ff] to-[#9ae6ff]"
                      : "hidden xl:inline font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c4d5ff] via-[#e0b5ff] to-[#9ae6ff]",
                  ].join(" ")}
                >
                  {label}
                </span>

                {/* Подчёркивание — только на десктопе, когда текст виден */}
                {!mobile && (
                  <span
                    className={`pointer-events-none absolute -bottom-1 left-0 h-0.5 rounded-full transition-all hidden xl:block
                      ${
                        isActive
                          ? "w-full bg-indigo-300/90"
                          : "w-0 bg-slate-300/30 group-hover:w-full"
                      }`}
                  />
                )}
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
  useOutsideClick(burgerMenuRef, () =>
    burgerMenuRef?.current?.removeAttribute("open")
  );

  const [activeChain, setActiveChain] = useState<"ethereum" | "solana">(
    "ethereum"
  );
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
      return tokenBalanceRaw
        ? formatUnits(tokenBalanceRaw as bigint, HMT_DECIMALS)
        : "0";
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
    <header
      className="
        sticky top-0 z-40 
        border-b border-[#171b33]
        bg-[radial-gradient(circle_at_top,_#202a63,_#050816_60%)]
        backdrop-blur-2xl
        shadow-[0_18px_45px_rgba(0,0,0,0.85)]
      "
    >
      <div
        className="
          navbar mx-auto max-w-6xl
          px-3 sm:px-4 lg:px-6
          gap-3
          text-slate-100
        "
      >
        {/* LEFT – бренд + бургер */}
        <div className="navbar-start flex-1 min-w-0 items-center">
          {/* Mobile: бургер + маленький логотип */}
          <details
            ref={burgerMenuRef}
            className="dropdown lg:hidden mr-1"
          >
            <summary className="btn btn-ghost btn-sm rounded-xl px-2 shadow-none hover:bg-[#111528]">
              <Bars3Icon className="h-5 w-5" />
            </summary>

            {/* СПИСОК МЕНЮ (HeaderMenuLinks) */}
            <ul
              className="
                dropdown-content menu mt-3 w-64 
                rounded-2xl border border-[#1e2442]
                bg-[#050816]/95 
                p-3 space-y-1 
                shadow-[0_22px_60px_rgba(0,0,0,0.9)]
                backdrop-blur-xl
                z-[100]
              "
            >
              <HeaderMenuLinks mobile={true} onNavigate={closeMobileMenu} />
            </ul>
            
            {/* БЛОК СЕТЕЙ И КОШЕЛЬКОВ (ВЫНЕСЕН ИЗ UL) */}
            <div
                className="
                    dropdown-content mt-3 w-64 
                    rounded-2xl border border-[#1e2442]
                    bg-[#050816]/95 
                    p-3 space-y-2
                    shadow-[0_22px_60px_rgba(0,0,0,0.9)]
                    backdrop-blur-xl
                    z-[100]
                    -mt-2 -ml-3
                    [padding-top:0]
                    [margin-top:2px]
                "
            >
                <div className="border-t border-[#1f2544] pt-2">
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">
                        Network
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="join join-horizontal w-fit rounded-full ring-1 ring-[#2c355f] bg-[#0d1224]">
                            <button
                                className={`join-item btn btn-xs rounded-l-full ${
                                    activeChain === "ethereum"
                                        ? "btn-primary shadow-md"
                                        : "btn-ghost text-slate-300/80"
                                }`}
                                onClick={() => setActiveChain("ethereum")}
                            >
                                ETH
                            </button>
                            <button
                                className={`join-item btn btn-xs rounded-r-full ${
                                    activeChain === "solana"
                                        ? "btn-primary shadow-md"
                                        : "btn-ghost text-slate-300/80"
                                }`}
                                onClick={() => setActiveChain("solana")}
                            >
                                SOL
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-2">
                    {activeChain === "ethereum" ? (
                        <>
                            {HMT_ADDRESS && address ? (
                                <div className="mb-2 flex items-center gap-2 rounded-xl bg-[#0b1020] px-2 py-1 ring-1 ring-[#2a325c]">
                                    <div className="badge badge-primary badge-outline badge-sm">
                                        {HMT_SYMBOL}
                                    </div>
                                    <div className="font-mono text-xs tabular-nums">
                                        {parseFloat(tokenBalance).toFixed(2)}
                                    </div>
                                </div>
                            ) : null}
                            <div className="flex justify-start">
                                <RainbowKitCustomConnectButton />
                            </div>
                        </>
                    ) : (
                        <WalletMultiButton className="!h-8 !rounded-full !px-3 !text-xs !bg-gradient-to-r !from-[#7c5cff] !to-[#4db5ff] !text-slate-900 !border-0 !shadow-lg hover:!brightness-110 active:!brightness-95 transition-all" />
                    )}
                </div>
            </div>
          </details>

          {/* Mobile brand */}
          <Link
            href="/"
            passHref
            className="
              flex lg:hidden items-center gap-2 shrink-0
              rounded-xl bg-[#0c1022]/90 px-2 py-1 text-xs font-semibold
              ring-1 ring-[#22284b] shadow-[0_12px_35px_rgba(0,0,0,0.8)]
            "
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_30%_0,#7c5cff,#222a63)] text-[11px] font-black text-slate-50 shadow-[0_12px_30px_rgba(15,23,42,0.8)]">
              NA
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold">NeoBot</span>
              <span className="text-[10px] text-slate-400">
                One source, More blockchain
              </span>
            </span>
          </Link>

          {/* Desktop brand */}
          <Link
            href="/"
            passHref
            className="
              hidden lg:flex items-center gap-3 shrink-0 
              rounded-2xl pr-2 py-1
            "
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_0,#7c5cff,#202654)] ring-1 ring-indigo-400/70 shadow-[0_15px_35px_rgba(15,23,42,0.95)]">
              <span className="text-sm font-black text-slate-50">NA</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold tracking-tight">
                NeoBot
              </span>
              <span className="text-[11px] text-slate-300/80">
                One source, More blockchain
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER – десктоп-меню */}
        <div className="navbar-center hidden lg:flex flex-none justify-center">
          <nav className="w-fit">
            <ul
              className="
                flex items-center gap-1
                rounded-full 
                bg-[#111425]/95
                px-2 py-1.5
                ring-1 ring-[#252c52]
                shadow-[0_16px_40px_rgba(0,0,0,0.85)]
                backdrop-blur-xl
              "
            >
              <HeaderMenuLinks />
            </ul>
          </nav>
        </div>

        {/* RIGHT – сети + кошельки */}
        <div className="navbar-end flex-1 min-w-0 flex justify-end items-center gap-2">
          {/* переключатель сетей */}
          <div
            className="
              hidden lg:flex
              items-stretch
              rounded-full 
              ring-1 ring-[#252c52]
              bg-[#0c1224]/95
              backdrop-blur-md
              shadow-[0_16px_40px_rgba(0,0,0,0.85)]
            "
          >
            <button
              className={`btn btn-xs sm:btn-sm rounded-l-full !rounded-r-none !h-full ${
                activeChain === "ethereum"
                  ? "btn-primary shadow-md"
                  : "btn-ghost text-slate-300/85"
              }`}
              onClick={() => setActiveChain("ethereum")}
            >
              <span className="hidden xl:inline">Ethereum</span>
              <span className="xl:hidden">ETH</span>
            </button>
            <button
              className={`btn btn-xs sm:btn-sm rounded-r-full !rounded-l-none !h-full ${
                activeChain === "solana"
                  ? "btn-primary shadow-md"
                  : "btn-ghost text-slate-300/85"
              }`}
              onClick={() => setActiveChain("solana")}
            >
              <span className="hidden xl:inline">Solana</span>
              <span className="xl:hidden">SOL</span>
            </button>
          </div>

          {/* кошельки */}
          {activeChain === "ethereum" ? (
            <div className="hidden lg:flex items-center gap-2 min-w-0">
              {HMT_ADDRESS && address ? (
                <div
                  className="
                    hidden xl:flex items-center gap-2
                    rounded-xl bg-[#0b1020]/95
                    px-2 py-1
                    ring-1 ring-[#252c52]
                    backdrop-blur-md
                  "
                >
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
            </div>
          ) : (
            <div className="min-w-0 hidden lg:block">
              <WalletMultiButton className="!h-9 !rounded-full !px-4 !text-xs !bg-gradient-to-r !from-[#7c5cff] !to-[#4db5ff] !text-slate-900 !border-0 !shadow-lg hover:!brightness-110 active:!brightness-95 transition-all" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};