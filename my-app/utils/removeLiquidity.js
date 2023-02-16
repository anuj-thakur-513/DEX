import { Contract, providers, utils, BigNumber } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from "../constants";

/**
 * removeLiquidity: Removes the `removeONILPTokensWei` amount of ONILP tokens from
 * liquidity and also the calculated amount of `ether` and `ONI` tokens
 */
export const removeLiquidity = async (signer, removeONILPTokensWei) => {
  // Create a new instance of the exchange contract
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );
  const tx = await exchangeContract.removeLiquidity(removeONILPTokensWei);
  await tx.wait();
};

/**
 * getTokensAfterRemove: Calculates the amount of `Eth` and `ONI` tokens
 * that would be returned back to user after he removes `removeONILPTokenWei` amount
 * of ONILP tokens from the contract
 */
export const getTokensAfterRemove = async (
  provider,
  removeONILPTokenWei,
  _ethBalance,
  onigiriTokenReserve
) => {
  try {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    // Get the total supply of `Onigiri` ONILIP tokens
    const _totalSupply = await exchangeContract.totalSupply();
    // Here we are using the BigNumber methods of multiplication and division
    // The amount of Eth that would be sent back to the user after he withdraws the ONILP token
    // is calculated based on a ratio,
    // Ratio is -> (amount of Eth that would be sent back to the user / Eth reserve) = (ONILP tokens withdrawn) / (total supply of ONILP tokens)
    // By some maths we get -> (amount of Eth that would be sent back to the user) = (Eth Reserve * ONILP tokens withdrawn) / (total supply of ONILP tokens)
    // Similarly we also maintain a ratio for the `ONI` tokens, so here in our case
    // Ratio is -> (amount of ONI tokens sent back to the user / ONI Token reserve) = (ONILP tokens withdrawn) / (total supply of ONILP tokens)
    // Then (amount of ONI tokens sent back to the user) = (ONI token reserve * ONILP tokens withdrawn) / (total supply of ONILP tokens)
    const _removeEther = _ethBalance.mul(removeONILPTokenWei).div(_totalSupply);
    const _removeONI = onigiriTokenReserve
      .mul(removeONILPTokenWei)
      .div(_totalSupply);
    return {
      _removeEther,
      _removeONI,
    };
  } catch (err) {
    console.error(err);
  }
};
