/**
 * Laboratory 5: Encapsulation Boundary Explorer
 * Invariants: Private state protection, guarded business invariant validation, and immutable object patterns.
 */

export interface EncapsulatedAccount {
  accountNumber: string;
  balance: number;
  isLocked: boolean;
  transactionLog: string[];
}

export interface EncapsulationOperationResult {
  success: boolean;
  account: EncapsulatedAccount;
  errorMessage?: string;
  invariantStatus: "intact" | "violated";
  explanation: string;
}

export function createEncapsulatedAccount(initialBalance = 1000): EncapsulatedAccount {
  return {
    accountNumber: "PRIME-ACC-7890",
    balance: Math.max(0, initialBalance),
    isLocked: false,
    transactionLog: [`Account opened with initial balance $${initialBalance}.00`],
  };
}

export function executeDeposit(
  account: EncapsulatedAccount,
  amount: number
): EncapsulationOperationResult {
  if (account.isLocked) {
    return {
      success: false,
      account,
      errorMessage: "Domain Rule Violation: Account is locked.",
      invariantStatus: "intact",
      explanation: "Encapsulation prevents modifications while the account state is locked.",
    };
  }

  if (isNaN(amount) || amount <= 0) {
    return {
      success: false,
      account,
      errorMessage: "Domain Invariant Violation: Deposit amount must be positive.",
      invariantStatus: "intact",
      explanation: "Guarded mutators prevent corrupting account balances with negative or zero deposits.",
    };
  }

  const updatedBalance = Math.round((account.balance + amount) * 100) / 100;
  const updatedAccount: EncapsulatedAccount = {
    ...account,
    balance: updatedBalance,
    transactionLog: [
      ...account.transactionLog,
      `Deposited $${amount.toFixed(2)} -> New balance: $${updatedBalance.toFixed(2)}`,
    ],
  };

  return {
    success: true,
    account: updatedAccount,
    invariantStatus: "intact",
    explanation: `Successfully deposited $${amount.toFixed(2)}. Invariants strictly preserved.`,
  };
}

export function executeWithdraw(
  account: EncapsulatedAccount,
  amount: number,
  overdraftLimit = 200
): EncapsulationOperationResult {
  if (account.isLocked) {
    return {
      success: false,
      account,
      errorMessage: "Domain Rule Violation: Account is locked.",
      invariantStatus: "intact",
      explanation: "Encapsulation rejects withdrawals on locked accounts.",
    };
  }

  if (isNaN(amount) || amount <= 0) {
    return {
      success: false,
      account,
      errorMessage: "Domain Invariant Violation: Withdrawal amount must be positive.",
      invariantStatus: "intact",
      explanation: "Negative withdrawal attempts are rejected by defensive mutator logic.",
    };
  }

  if (account.balance - amount < -overdraftLimit) {
    return {
      success: false,
      account,
      errorMessage: `Overdraft Exceeded: Requested $${amount.toFixed(2)}, but maximum available with overdraft ($${overdraftLimit}) is $${(account.balance + overdraftLimit).toFixed(2)}.`,
      invariantStatus: "intact",
      explanation: "Encapsulation boundary actively enforces banking liquidity invariants.",
    };
  }

  const updatedBalance = Math.round((account.balance - amount) * 100) / 100;
  const updatedAccount: EncapsulatedAccount = {
    ...account,
    balance: updatedBalance,
    transactionLog: [
      ...account.transactionLog,
      `Withdrew $${amount.toFixed(2)} -> New balance: $${updatedBalance.toFixed(2)}`,
    ],
  };

  return {
    success: true,
    account: updatedAccount,
    invariantStatus: "intact",
    explanation: `Withdrew $${amount.toFixed(2)}. Invariants verified.`,
  };
}

export function simulateDirectFieldCorruption(
  account: EncapsulatedAccount,
  corruptedValue: number
): EncapsulationOperationResult {
  const corruptedAccount: EncapsulatedAccount = {
    ...account,
    balance: corruptedValue,
    transactionLog: [
      ...account.transactionLog,
      `[CORRUPTION EVENT] Direct field access bypassed validation: balance set to $${corruptedValue}.`,
    ],
  };

  return {
    success: true,
    account: corruptedAccount,
    invariantStatus: corruptedValue < 0 ? "violated" : "intact",
    explanation:
      "When fields are public, any external client can bypass validation and assign illegal negative balances or bypass business rules.",
  };
}

