import { RequestTokens } from "./RequestTokens";
import { TokenAddressFromApi } from "./TokenAddressFromApi";

export const ApiData = (params: { address: `0x${string}` }) => {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing API Coupling</h2>
        <TokenAddressFromApi></TokenAddressFromApi>
        <RequestTokens address={params.address}></RequestTokens>
      </div>
    </div>
  );
};
