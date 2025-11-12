
class BasePaymentMethod {
    constructor(config) {
        this.config = config;
    }

    processPayment(amount, wallet) {
        throw new Error('processPayment method must be implemented');
    }

    logReipt(details) {
        console.log(`
        --------------Payment Receipt--------------
        Paid by: ${details.name}
        Payment Method: ${details.method}
        Amount Paid: ${details.amount}
        --------------------------------------------
        Remaining Balance: ${details.remainingBalance}
        `);
    }
}

export class CashTender extends BasePaymentMethod {
    processPayment(amount, wallet) {
       if(wallet.getCashBalance() < amount) {
           throw new Error('Insufficient cash balance in wallet');
       }
       wallet.withdrawCash(amount);
       this.logReipt({
           name: this.config.name,
           method: 'Cash',
           amount: amount,
           remainingBalance: wallet.getCashBalance()
       });
    }
}

export class PayPalPayment extends BasePaymentMethod {
    processPayment(amount, wallet) {
       if(wallet.getCashBalance() < amount) {
           throw new Error('Insufficient cash balance in wallet');
       }
       wallet.withdrawCash(amount);
       this.logReipt({
           name: `<${this.config.name}> (${this.config.email})`,
           method: 'PayPal',
           amount: amount,
           remainingBalance: wallet.getCashBalance()
       });
    }
}

export class CryptoPayment extends BasePaymentMethod {
    processPayment(amount, wallet) {
        if(wallet.getCryptoBalance(this.config.cryptoType) < amount) {
            throw new Error(`Insufficient ${this.config.cryptoType} balance in wallet`);
        }
        wallet.withdrawCrypto(this.config.cryptoType, amount);
        this.logReipt({
           name: this.config.name,
           method: `Crypto (${this.config.email})`,
           amount: amount,
           remainingBalance: wallet.getCryptoBalance(this.config.cryptoType)
       });
    }
}

export class PaymentFactory {
     static #registry = new Map();

    static registerPaymentMethod(methodType, clazz) {
        PaymentFactory.#registry.set(methodType, clazz);
    }
    static createPaymentMethod(methodType, config) {
        const paymentClass = PaymentFactory.#registry.get(methodType);
        if (!paymentClass) {
            throw new Error(`Unsupported payment method: ${methodType}`);
        }
        return new paymentClass(config);
    }
}


export class Wallet {

    static #instance = null;

    #cashBalance = 0;
    #cryptoBalances = new Map();

    static getInstance() {
        if (!Wallet.#instance) {
            Wallet.#instance = new Wallet();
        }
        return Wallet.#instance;
    }

    depositCash(amount) {
        if(amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }
        this.#cashBalance += amount;
    }

    withdrawCash(amount) {
        if(amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }
        if(amount > this.#cashBalance) {
            throw new Error('Insufficient cash balance');
        }
        this.#cashBalance -= amount;
    }

    getCashBalance() {
        return this.#cashBalance;
    }

    depositCrypto(cryptoType, amount) {
        if(amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }
        const currentBalance = this.#cryptoBalances.get(cryptoType) || 0;
        this.#cryptoBalances.set(cryptoType, currentBalance + amount);
    }

    withdrawCrypto(cryptoType, amount) {
        if(amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }
        const currentBalance = this.#cryptoBalances.get(cryptoType) || 0;
        if(amount > currentBalance) {
            throw new Error(`Insufficient ${cryptoType} balance`);
        }
        this.#cryptoBalances.set(cryptoType, currentBalance - amount);
    }

    getCryptoBalance(cryptoType) {
        return this.#cryptoBalances.get(cryptoType) || 0;
    }

    getCryptoBalances() {
        return this.#cryptoBalances;
    }

    getWalletSummary() {
        return {
            cashBalance: this.#cashBalance,
            cryptoBalances: Object.fromEntries(this.#cryptoBalances)
        };
    }       
}
