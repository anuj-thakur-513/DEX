import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

/**
 * getEtherBalance: Retrieves the ether balance of the user or the contract
 */
export const getEtherBalance = async (provider, address, contract = false) => {
  try {
    // If the caller has set the `contract` boolean to true, retrieve the balance of
    // ether in the `exchange contract`, if it is set to false, retrieve the balance
    // of the user's address
    if (contract) {
      const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
      return balance;
    } else {
      const balance = await provider.getBalance(address);
      return balance;
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
};

/**
 * getONITokensBalance: Retrieves the Onigiri tokens in the account
 * of the provided `address`
 */
export const getONITokensBalance = async (provider, address) => {
  try {
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    );
    const balanceOfOnigiriTokens = await tokenContract.balanceOf(address);
    return balanceOfOnigiriTokens;
  } catch (err) {
    console.error(err);
  }
};

/**
 * getONILPTokensBalance: Retrieves the amount of ONILP tokens in the account
 * of the provided `address`
 */
export const getONILPTokensBalance = async (provider, address) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    const balanceOfONILPTokens = await exchangeContract.balanceOf(address);
    return balanceOfONILPTokens;
  } catch (err) {
    console.error(err);
  }
};

/**
 * getReserveOfONITokens: Retrieves the amount of ONI tokens in the
 * exchange contract address
 */
export const getReserveOfONITokens = async (provider) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    const reserve = await exchangeContract.getReserve();
    return reserve;
  } catch (err) {
    console.error(err);
  }
};
