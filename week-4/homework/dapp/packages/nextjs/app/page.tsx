"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ApiData } from "~~/components/ApiData";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  if (connectedAddress)
    return (
      <div>
        <ApiData address={connectedAddress as `0x${string}`}></ApiData>
      </div>
    );

  return <></>;
};

export default Home;
