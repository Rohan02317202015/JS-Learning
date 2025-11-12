
import { CashTender, PayPalPayment, CryptoPayment } from './definition.js';
import { PaymentFactory } from './definition.js';
import { Wallet } from './definition.js';


// Factory example behavior
document.addEventListener('DOMContentLoaded', () => {
  const payPaypal = document.getElementById('payPaypal');
  const payCrypto = document.getElementById('payCrypto');
  const payCash = document.getElementById('payCash');
  const amountInput = document.getElementById('amountInput');

  // Load wallet with initiatial balances
  loadWallet();

  // Adding Payment registry to the Factory
  addPaymentMethodsInRegistry();

  function setDisabled(disabled) {
    [payPaypal, payCrypto, payCash].forEach(b => { if (b) b.disabled = disabled; });
  }

  // initially disabled
  setDisabled(true);

  // store collected paypal credentials
  let paypalCredentials = null;

  // allow only numbers
  amountInput.addEventListener('input', (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    e.target.value = val;
    const num = parseFloat(val);
    setDisabled(!(num > 0));
  });

  // modal helpers
  function openModal(html) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    content.innerHTML = html;
    overlay.classList.add('active');
  }
  function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

  if (payPaypal) payPaypal.addEventListener('click', () => {
    openModal(`<h3>Pay with Paypal</h3>
      <div class="row"><label>Email</label><input id="paypalEmail" type="email" /></div>
      <div class="row"><label>Password</label><input id="paypalPwd" type="password" /></div>
      <div class="actions"><button class="cancel" id="modalCancel">Cancel</button><button class="submit" id="modalSubmit">Pay</button></div>
    `);

    const modalContent = document.getElementById('modalContent');
    const cancelBtn = modalContent.querySelector('#modalCancel');
    const submitBtn = modalContent.querySelector('#modalSubmit');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (submitBtn) submitBtn.addEventListener('click', () => {
      const emailEl = document.getElementById('paypalEmail');
      const pwdEl = document.getElementById('paypalPwd');
      const email = emailEl ? emailEl.value.trim() : '';
      const pwd = pwdEl ? pwdEl.value : '';

      // basic validation
      if (!email) { alert('Please enter your PayPal email'); return; }
      if (!pwd) { alert('Please enter your PayPal password'); return; }

      // store credentials in variable
      paypalCredentials = { email, password: pwd };

      closeModal();

      doPaymentViaPaypal(amountInput.value, paypalCredentials);
    });
  });

  if (payCrypto) payCrypto.addEventListener('click', () => {
    openModal(`<h3>Pay with Crypto</h3>
      <div class="row"><label>Currency</label><select id="cryptoSelect"><option>BTC</option><option>ETH</option><option>DOG</option><option>LIT</option><option>XRP</option></select></div>
      <div class="actions"><button class="cancel" id="modalCancel">Cancel</button><button class="submit" id="modalSubmit">Pay</button></div>
    `);
    document.getElementById('modalContent').querySelector('#modalCancel').addEventListener('click', closeModal);
    document.getElementById('modalContent').querySelector('#modalSubmit').addEventListener('click', () => {
      const cryptoType = document.getElementById('cryptoSelect').value;
      closeModal();
      doPaymentViaCrypto(amountInput.value, cryptoType);
    });
  });

  if (payCash) payCash.addEventListener('click', () => {
    doPaymentViaCash(amountInput.value);
  });

  // modal overlay close
  document.getElementById('modalOverlay').addEventListener('click', (e) => { if (e.target.id === 'modalOverlay') closeModal(); });
});



function loadWallet() {
    const wallet = Wallet.getInstance();
    wallet.depositCash(500); // add initial cash
    wallet.depositCrypto('BTC', 87); // add initial crypto
    wallet.depositCrypto('ETH', 7); // add initial crypto
    wallet.depositCrypto('LIT', 12); // add initial crypto

    return wallet;
}

function addPaymentMethodsInRegistry(){
    PaymentFactory.registerPaymentMethod('CASH', CashTender);
    PaymentFactory.registerPaymentMethod('PAYPAL', PayPalPayment);
    PaymentFactory.registerPaymentMethod('CRYPTO', CryptoPayment);
}

function doPaymentViaCash(amount){
    // create wallet with some cash
    const wallet = Wallet.getInstance();
    // create payment method via Factory
    const cashPayment = PaymentFactory.createPaymentMethod('CASH', { name: 'John Doe' });
    // process payment
    cashPayment.processPayment(amount, wallet);
}

function doPaymentViaPaypal(amount, credentials){
    const wallet = Wallet.getInstance();
    const paypalPayment = PaymentFactory.createPaymentMethod('PAYPAL', { name: 'John Doe', email: credentials.email, password: credentials.password });
    paypalPayment.processPayment(amount, wallet);
}

function doPaymentViaCrypto(amount, cryptoType){
    const wallet = Wallet.getInstance();
    const cryptoPayment = PaymentFactory.createPaymentMethod('CRYPTO', { name: 'John Doe', cryptoType: cryptoType });
    cryptoPayment.processPayment(amount, wallet);
}