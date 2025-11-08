"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
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
              className={`${isActive ? "bg-secondary shadow-md" : ""} hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral ${
                mobile 
                  ? "py-2 px-4 text-sm rounded-lg gap-2 flex items-center" 
                  : "py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col"
              }`}
            >
              {icon}
              <span>{label}</span>
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
  
  const [activeChain, setActiveChain] = useState<'ethereum' | 'solana'>('ethereum');

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
    <div className="sticky lg:static top-0 navbar bg-base-100 border-t-indigo-500 min-h-0 shrink-0 justify-between z-20 px-2 sm:px-4 shadow-sm">
      {/* Mobile: Logo + Burger Menu */}
      <div className="navbar-start w-auto lg:w-1/2">
        {/* Mobile Logo - всегда видимый */}
        <Link href="/" passHref className="flex lg:hidden items-center gap-1 mr-2 shrink-0">
          <span className="font-bold text-sm">NotABot</span>
        </Link>
        
        {/* Desktop Logo */}
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex flex-col">
            <span className="font-bold leading-tight">NotABot</span>
            <span className="text-xs opacity-70">One source, More blockchain</span>
          </div>
        </Link>

        {/* Mobile Burger Menu */}
        <details className="dropdown dropdown-bottom lg:hidden" ref={burgerMenuRef}>
          <summary className="btn btn-ghost btn-sm hover:bg-transparent">
            <Bars3Icon className="h-5 w-5" />
          </summary>
          <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300 mt-2">
            <HeaderMenuLinks mobile={true} />
          </ul>
        </details>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>

      {/* Right side: Chain selector + Wallet */}
      <div className="navbar-end flex-nowrap gap-1 sm:gap-2">
        {/* Chain Selector - компактный на мобильных */}
        <div className="join join-horizontal">
          <button 
            className={`join-item btn btn-xs sm:btn-sm ${activeChain === 'ethereum' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveChain('ethereum')}
          >
            <span className="hidden sm:inline">ETH</span>
            <span className="sm:hidden">E</span>
          </button>
          <button 
            className={`join-item btn btn-xs sm:btn-sm ${activeChain === 'solana' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveChain('solana')}
          >
            <span className="hidden sm:inline">SOL</span>
            <span className="sm:hidden">S</span>
          </button>
        </div>

        {/* Token Balance - скрыт на очень маленьких экранах */}
        {activeChain === 'ethereum' ? (
          <>
            {HMT_ADDRESS && address ? (
              <div className="hidden sm:flex items-center gap-1">
                <div className="badge badge-outline badge-sm">{HMT_SYMBOL}</div>
                <div className="font-mono text-xs">{parseFloat(tokenBalance).toFixed(2)}</div>
              </div>
            ) : null}
            <div className="min-w-0">
              <RainbowKitCustomConnectButton />
            </div>
          </>
        ) : (
          <div className="min-w-0">
            <WalletMultiButton style={{ height: '32px', fontSize: '12px' }} />
          </div>
        )}
      </div>
    </div>
  );
};
