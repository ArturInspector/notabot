"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
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
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/" },
  { label: "Live", href: "/live" },
  { label: "Analytics", href: "/analytics" },
];

export const HeaderMenuLinks = ({ mobile = false }: { mobile?: boolean }) => {
  const pathname = usePathname();
  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${isActive ? "bg-gradient-to-r from-primary/30 to-primary/20 text-base-content shadow-lg ring-1 ring-primary/30" : "text-base-content/80"} relative transition-all duration-200 hover:bg-base-200/60 hover:shadow-md focus:!bg-base-200/70 active:!text-neutral ${mobile ? "py-2 px-4 text-sm rounded-xl gap-2 flex items-center" : "py-2 px-3 text-sm rounded-full gap-2 grid grid-flow-col"}`}
            >
              {icon}
              <span className="relative">
                {label}
                <span className={`absolute -bottom-1 left-0 h-0.5 rounded-full transition-all ${isActive ? "w-full bg-primary/70" : "w-0 group-hover:w-full bg-base-content/20"}`} />
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

  return (
    <div className="sticky lg:static top-0 navbar min-h-0 z-20 px-2 sm:px-4 border-b border-base-300/60 bg-gradient-to-b from-base-100/90 to-base-100/70 backdrop-blur-md">
      <div className="navbar-start w-auto lg:w-1/2">
        <Link href="/" passHref className="flex lg:hidden items-center gap-2 mr-2 shrink-0">
          <span className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-xs font-bold bg-base-200/70 ring-1 ring-base-300/70 shadow-sm">
            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">NA</span>
            NotABot
          </span>
        </Link>
        <Link href="/" passHref className="hidden lg:flex items-center gap-3 ml-2 mr-6 shrink-0">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 ring-1 ring-primary/30 shadow-md">
            <span className="font-black text-sm text-primary">NA</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold tracking-tight text-base">NotABot</span>
            <span className="text-[11px] opacity-70">One source, More blockchain</span>
          </div>
        </Link>
        <details className="dropdown dropdown-bottom lg:hidden" ref={burgerMenuRef}>
          <summary className="btn btn-ghost btn-sm hover:bg-base-200/60 rounded-xl">
            <Bars3Icon className="h-5 w-5" />
          </summary>
          <ul className="dropdown-content menu bg-base-100/95 rounded-2xl z-[1] w-60 p-2 shadow-2xl border border-base-300/70 mt-2 backdrop-blur-md">
            <HeaderMenuLinks mobile={true} />
          </ul>
        </details>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-nowrap gap-1 sm:gap-2">
        <div className="join join-horizontal rounded-full ring-1 ring-base-300/70 bg-base-200/60 backdrop-blur-sm shadow-sm">
          <button
            className={`join-item btn btn-xs sm:btn-sm rounded-l-full ${activeChain === "ethereum" ? "btn-primary shadow-md" : "btn-ghost text-base-content/80"}`}
            onClick={() => setActiveChain("ethereum")}
          >
            <span className="hidden sm:inline">ETH</span>
            <span className="sm:hidden">E</span>
          </button>
          <button
            className={`join-item btn btn-xs sm:btn-sm rounded-r-full ${activeChain === "solana" ? "btn-primary shadow-md" : "btn-ghost text-base-content/80"}`}
            onClick={() => setActiveChain("solana")}
          >
            <span className="hidden sm:inline">SOL</span>
            <span className="sm:hidden">S</span>
          </button>
        </div>
        {activeChain === "ethereum" ? (
          <>
            {HMT_ADDRESS && address ? (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-base-200/60 ring-1 ring-base-300/70 backdrop-blur-sm">
                <div className="badge badge-primary badge-outline badge-sm">{HMT_SYMBOL}</div>
                <div className="font-mono text-xs tabular-nums">{parseFloat(tokenBalance).toFixed(2)}</div>
              </div>
            ) : null}
            <div className="min-w-0">
              <RainbowKitCustomConnectButton />
            </div>
          </>
        ) : (
          <div className="min-w-0">
            <WalletMultiButton className="!h-8 sm:!h-9 !rounded-full !px-3 !text-xs !bg-gradient-to-r !from-primary/80 !to-primary !text-primary-content !border-0 !shadow-lg hover:!brightness-110 active:!brightness-95 transition-all" style={{ height: "36px", fontSize: "12px" }} />
          </div>
        )}
      </div>
    </div>
  );
};
