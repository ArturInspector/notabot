"use client";

import React, { useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { useOutsideClick, useVerificationStatus } from "~~/hooks/scaffold-eth";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
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
  { label: "Debug Contracts", href: "/debug", icon: <BugAntIcon className="h-4 w-4" /> },
];

export const HeaderMenuLinks = () => {
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
              className={`${isActive ? "bg-secondary shadow-md" : ""} hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
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

  const { address } = useAccount();
  const { count, isLoading } = useVerificationStatus();

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
    <div className="sticky lg:static top-0 navbar border-t-indigo-500 min-h-0 shrink-0 justify-between z-20 px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex flex-col">
            <span className="font-bold leading-tight">NotABot</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        {address && !isLoading && (
          <div className="flex items-center mr-3">
            <div className="badge badge-primary mr-2">My Verifications</div>
            <div className="font-mono text-sm font-bold">{count}/4</div>
          </div>
        )}
        {HMT_ADDRESS ? (
          <div className="flex items-center mr-3">
            <div className="badge badge-outline mr-2">{HMT_SYMBOL}</div>
            <div className="font-mono text-sm">{tokenBalance}</div>
          </div>
        ) : null}
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
