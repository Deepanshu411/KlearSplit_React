/**
   * Updates the balance by either adding or subtracting the given amount.
   *
   * @param balance - The current balance (as a string).
   * @param amount - The amount to be added or subtracted from the balance.
   * @param isAddition - A boolean flag indicating whether the amount should be added (true) or subtracted (false).
   *
   * @returns A string representing the updated balance after performing the addition or subtraction.
   */
const updateBalance = (
  balance: string,
  amount: number,
  isAddition: boolean
): string => {
  return JSON.stringify(parseFloat(balance) + (isAddition ? amount : -amount));
};

export default updateBalance;
