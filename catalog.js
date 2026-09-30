/* Kard — shared catalog: banks, cities and categories.
   Used by the public app (index.html), the admin page (admin.html) and the seed generator.
   Add a bank/city/category here and it appears in the filters and the admin form. */

window.BANKS = [
  { id: 'hbl',       name: 'HBL',                 short: 'HBL',       color: '#00845a' },
  { id: 'ubl',       name: 'UBL',                 short: 'UBL',       color: '#1d5fb4' },
  { id: 'mcb',       name: 'MCB Bank',            short: 'MCB',       color: '#0f7f3e' },
  { id: 'meezan',    name: 'Meezan Bank',         short: 'Meezan',    color: '#6a1b6f' },
  { id: 'alfalah',   name: 'Bank Alfalah',        short: 'Alfalah',   color: '#d6262c' },
  { id: 'scb',       name: 'Standard Chartered',  short: 'StanChart', color: '#0473ea' },
  { id: 'faysal',    name: 'Faysal Bank',         short: 'Faysal',    color: '#0a6b8a' },
  { id: 'askari',    name: 'Askari Bank',         short: 'Askari',    color: '#b3872a' },
  { id: 'bahl',      name: 'Bank AL Habib',       short: 'BAHL',      color: '#8a1c2b' },
  { id: 'allied',    name: 'Allied Bank',         short: 'ABL',       color: '#1b4d8f' },
  { id: 'hmb',       name: 'Habib Metro Bank',    short: 'HabibMetro',color: '#c0392b' },
  { id: 'js',        name: 'JS Bank',             short: 'JS',        color: '#e0731a' },
  { id: 'soneri',    name: 'Soneri Bank',         short: 'Soneri',    color: '#a6371f' },
  { id: 'bankislami',name: 'BankIslami',          short: 'BankIslami',color: '#1a8a5a' },
  { id: 'bop',       name: 'Bank of Punjab',      short: 'BOP',       color: '#1e6b3c' },
  { id: 'nbp',       name: 'National Bank of Pakistan', short: 'NBP', color: '#2a7a3b' },
  // Digital wallets / EMIs that issue their own debit cards
  { id: 'easypaisa', name: 'Easypaisa',           short: 'Easypaisa', color: '#1fa84f', wallet: true },
  { id: 'jazzcash',  name: 'JazzCash',            short: 'JazzCash',  color: '#c8102e', wallet: true },
  { id: 'nayapay',   name: 'NayaPay',             short: 'NayaPay',   color: '#f2541b', wallet: true },
  { id: 'sadapay',   name: 'SadaPay',             short: 'SadaPay',   color: '#12b89a', wallet: true }
];

/* Real card products per issuer (names as the issuers publish them).
   img: true → official card art at cards/<id>.webp; otherwise the app draws the card
   in the bank's color using `tier`. Card art belongs to the issuing banks. */
window.CARD_PRODUCTS = [
  // HBL
  { id: 'hbl-platinum-cc',   bank: 'hbl', name: 'HBL Platinum CreditCard',    type: 'credit', nets: ['Visa'],       tier: 'platinum', img: true },
  { id: 'hbl-gold-cc',       bank: 'hbl', name: 'HBL Gold CreditCard',        type: 'credit', nets: ['Visa'],       tier: 'gold',     img: true },
  { id: 'hbl-green-cc',      bank: 'hbl', name: 'HBL Green CreditCard',       type: 'credit', nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'hbl-fuelsaver-cc',  bank: 'hbl', name: 'HBL FuelSaver CreditCard',   type: 'credit', nets: ['Mastercard'], tier: 'gold',     img: true },
  { id: 'hbl-classic-dc',    bank: 'hbl', name: 'HBL Classic DebitCard',      type: 'debit',  nets: ['Visa', 'Mastercard', 'UnionPay'], tier: 'classic', img: true },
  { id: 'hbl-world-dc',      bank: 'hbl', name: 'HBL World DebitCard',        type: 'debit',  nets: ['Mastercard'], tier: 'platinum', img: true },
  { id: 'hbl-paypak-dc',     bank: 'hbl', name: 'HBL PayPak DebitCard',       type: 'debit',  nets: ['PayPak'],     tier: 'classic',  img: true },
  { id: 'hbl-upi-paypak-dc', bank: 'hbl', name: 'HBL UnionPay PayPak DebitCard', type: 'debit', nets: ['UnionPay', 'PayPak'], tier: 'classic', img: true },
  // UBL
  { id: 'ubl-classic-cc',      bank: 'ubl', name: 'UBL Classic Credit Card',        type: 'credit', nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'ubl-gold-cc',         bank: 'ubl', name: 'UBL Gold Credit Card',           type: 'credit', nets: ['Visa'],       tier: 'gold',     img: true },
  { id: 'ubl-platinum-cc',     bank: 'ubl', name: 'UBL Visa Platinum Credit Card',  type: 'credit', nets: ['Visa'],       tier: 'platinum', img: true },
  { id: 'ubl-infinite-dc',     bank: 'ubl', name: 'UBL Visa Infinite Debit Card',   type: 'debit',  nets: ['Visa'],       tier: 'infinite', img: true },
  { id: 'ubl-signature-dc',    bank: 'ubl', name: 'UBL Mastercard Signature Debit Card', type: 'debit', nets: ['Mastercard'], tier: 'signature', img: true },
  { id: 'ubl-premium-plus-dc', bank: 'ubl', name: 'UBL Visa Premium Plus Debit Card', type: 'debit', nets: ['Visa'],      tier: 'gold',     img: true },
  { id: 'ubl-mc-premium-dc',   bank: 'ubl', name: 'UBL Mastercard Premium Debit Card', type: 'debit', nets: ['Mastercard'], tier: 'platinum', img: true },
  { id: 'ubl-visa-premium-dc', bank: 'ubl', name: 'UBL Visa Premium Debit Card',    type: 'debit',  nets: ['Visa'],       tier: 'platinum', img: true },
  { id: 'ubl-urooj-dc',        bank: 'ubl', name: 'UBL Visa Urooj Debit Card',      type: 'debit',  nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'ubl-freelancer-dc',   bank: 'ubl', name: 'UBL Visa Freelancer Debit Card', type: 'debit',  nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'ubl-classic-dc',      bank: 'ubl', name: 'UBL Visa Classic Debit Card',    type: 'debit',  nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'ubl-unionpay-dc',     bank: 'ubl', name: 'UBL UnionPay Debit Card',        type: 'debit',  nets: ['UnionPay'],   tier: 'classic',  img: true },
  { id: 'ubl-paypak-dc',       bank: 'ubl', name: 'UBL PayPak Debit Card',          type: 'debit',  nets: ['PayPak'],     tier: 'classic',  img: true },
  // MCB
  { id: 'mcb-classic-gold-cc', bank: 'mcb', name: 'MCB Classic / Gold Credit Card', type: 'credit', nets: ['Visa'],       tier: 'gold',     img: true },
  { id: 'mcb-platinum-cc',     bank: 'mcb', name: 'MCB Platinum Credit Card',       type: 'credit', nets: ['Visa'],       tier: 'platinum' },
  { id: 'mcb-signature-dc',    bank: 'mcb', name: 'MCB Visa Signature Debit Card',  type: 'debit',  nets: ['Visa'],       tier: 'signature', img: true },
  { id: 'mcb-platinum-dc',     bank: 'mcb', name: 'MCB Visa Platinum Debit Card',   type: 'debit',  nets: ['Visa'],       tier: 'platinum', img: true },
  { id: 'mcb-gold-dc',         bank: 'mcb', name: 'MCB Visa Gold Debit Card',       type: 'debit',  nets: ['Visa'],       tier: 'gold',     img: true },
  { id: 'mcb-silver-dc',       bank: 'mcb', name: 'MCB Visa Silver Debit Card',     type: 'debit',  nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'mcb-nayab-dc',        bank: 'mcb', name: 'MCB Visa Nayab Debit Card',      type: 'debit',  nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'mcb-paypak-dc',       bank: 'mcb', name: 'MCB PayPak Classic Debit Card',  type: 'debit',  nets: ['PayPak'],     tier: 'classic',  img: true },
  // Meezan (Islamic — debit only)
  { id: 'meezan-classic-dc',  bank: 'meezan', name: 'Meezan Visa Debit Card',            type: 'debit', nets: ['Visa'],       tier: 'classic' },
  { id: 'meezan-platinum-dc', bank: 'meezan', name: 'Meezan Visa Platinum Debit Card',   type: 'debit', nets: ['Visa'],       tier: 'platinum' },
  { id: 'meezan-titanium-dc', bank: 'meezan', name: 'Meezan Mastercard Titanium Debit Card', type: 'debit', nets: ['Mastercard'], tier: 'titanium' },
  { id: 'meezan-paypak-dc',   bank: 'meezan', name: 'Meezan PayPak Debit Card',          type: 'debit', nets: ['PayPak'],     tier: 'classic' },
  // Bank Alfalah
  { id: 'alf-classic-cc',    bank: 'alfalah', name: 'Bank Alfalah Visa Classic Credit Card',  type: 'credit', nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'alf-gold-cc',       bank: 'alfalah', name: 'Bank Alfalah Visa Gold Credit Card',     type: 'credit', nets: ['Visa'],       tier: 'gold',     img: true },
  { id: 'alf-platinum-cc',   bank: 'alfalah', name: 'Bank Alfalah Visa Platinum Credit Card', type: 'credit', nets: ['Visa'],       tier: 'platinum' },
  { id: 'alf-ultra-cc',      bank: 'alfalah', name: 'Bank Alfalah Ultra Cashback Card',       type: 'credit', nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'alf-optimus-cc',    bank: 'alfalah', name: 'Bank Alfalah Optimus Credit Card',       type: 'credit', nets: ['Mastercard'], tier: 'titanium', img: true },
  { id: 'alf-amex-gold-cc',  bank: 'alfalah', name: 'American Express Gold Credit Card',      type: 'credit', nets: ['Amex'],       tier: 'gold',     img: true },
  { id: 'alf-signature-dc',  bank: 'alfalah', name: 'Bank Alfalah Visa Signature Debit Card', type: 'debit',  nets: ['Visa'],       tier: 'signature', img: true },
  { id: 'alf-platinum-dc',   bank: 'alfalah', name: 'Bank Alfalah Visa Platinum Debit Card',  type: 'debit',  nets: ['Visa'],       tier: 'platinum', img: true },
  { id: 'alf-gold-dc',       bank: 'alfalah', name: 'Bank Alfalah Visa Gold Debit Card',      type: 'debit',  nets: ['Visa'],       tier: 'gold',     img: true },
  { id: 'alf-classic-dc',    bank: 'alfalah', name: 'Bank Alfalah Visa Classic Debit Card',   type: 'debit',  nets: ['Visa'],       tier: 'classic',  img: true },
  { id: 'alf-paypak-dc',     bank: 'alfalah', name: 'Bank Alfalah PayPak Classic Debit Card', type: 'debit',  nets: ['PayPak'],     tier: 'classic',  img: true },
  { id: 'alf-upi-paypak-dc', bank: 'alfalah', name: 'Bank Alfalah UnionPay PayPak Platinum Debit Card', type: 'debit', nets: ['UnionPay', 'PayPak'], tier: 'platinum', img: true },
  // Standard Chartered
  { id: 'scb-platinum-cc',        bank: 'scb', name: 'Standard Chartered Mastercard Platinum Credit Card', type: 'credit', nets: ['Mastercard'], tier: 'platinum', img: true },
  { id: 'scb-world-cc',           bank: 'scb', name: 'Standard Chartered Mastercard World Credit Card',    type: 'credit', nets: ['Mastercard'], tier: 'world',    img: true },
  { id: 'scb-visa-gold-cc',       bank: 'scb', name: 'Standard Chartered Visa Gold Credit Card',           type: 'credit', nets: ['Visa'],       tier: 'gold',     img: true },
  { id: 'scb-titanium-cc',        bank: 'scb', name: 'Standard Chartered Mastercard Titanium Credit Card', type: 'credit', nets: ['Mastercard'], tier: 'titanium' },
  { id: 'scb-cashback-cc',        bank: 'scb', name: 'Standard Chartered Mastercard Cashback Credit Card', type: 'credit', nets: ['Mastercard'], tier: 'platinum', img: true },
  { id: 'scb-saadiq-gold-cc',     bank: 'scb', name: 'Saadiq Gold Credit Card',                            type: 'credit', nets: ['Visa'],       tier: 'gold',     img: true },
  { id: 'scb-saadiq-platinum-cc', bank: 'scb', name: 'Saadiq Platinum Credit Card',                        type: 'credit', nets: ['Visa'],       tier: 'platinum', img: true },
  { id: 'scb-priority-dc',        bank: 'scb', name: 'Standard Chartered Priority Platinum Debit Card',    type: 'debit',  nets: ['Mastercard'], tier: 'platinum', img: true },
  { id: 'scb-titanium-dc',        bank: 'scb', name: 'Standard Chartered Titanium Debit Card',             type: 'debit',  nets: ['Mastercard'], tier: 'titanium', img: true },
  { id: 'scb-classic-dc',         bank: 'scb', name: 'Standard Chartered Mastercard Classic Debit Card',   type: 'debit',  nets: ['Mastercard'], tier: 'classic',  img: true },
  { id: 'scb-paypak-dc',          bank: 'scb', name: 'Standard Chartered PayPak Debit Card',               type: 'debit',  nets: ['PayPak'],     tier: 'classic' },
  // Faysal Bank (Islamic)
  { id: 'faysal-noor-titanium-cc', bank: 'faysal', name: 'Faysal Islami Noor Titanium Card', type: 'credit', nets: ['Mastercard'], tier: 'titanium' },
  { id: 'faysal-noor-platinum-cc', bank: 'faysal', name: 'Faysal Islami Noor Platinum Card', type: 'credit', nets: ['Mastercard'], tier: 'platinum' },
  { id: 'faysal-noor-world-cc',    bank: 'faysal', name: 'Faysal Islami Noor World Card',    type: 'credit', nets: ['Mastercard'], tier: 'world' },
  // Askari
  { id: 'askari-classic-cc', bank: 'askari', name: 'Askari Mastercard Classic Credit Card', type: 'credit', nets: ['Mastercard'], tier: 'classic', img: true },
  { id: 'askari-world-cc',   bank: 'askari', name: 'Askari World Mastercard Credit Card',   type: 'credit', nets: ['Mastercard'], tier: 'world',   img: true },
  { id: 'askari-visa-dc',    bank: 'askari', name: 'Askari Visa Debit Card',                type: 'debit',  nets: ['Visa'],       tier: 'classic' },
  { id: 'askari-paypak-dc',  bank: 'askari', name: 'Askari PayPak Debit Card',              type: 'debit',  nets: ['PayPak'],     tier: 'classic' },
  // Bank AL Habib
  { id: 'bahl-platinum-cc',  bank: 'bahl', name: 'AL Habib Platinum Credit Card',   type: 'credit', nets: ['Mastercard'], tier: 'platinum',  img: true },
  { id: 'bahl-gold-cc',      bank: 'bahl', name: 'AL Habib Gold Credit Card',       type: 'credit', nets: ['Mastercard'], tier: 'gold',      img: true },
  { id: 'bahl-classic-cc',   bank: 'bahl', name: 'AL Habib Classic Credit Card',    type: 'credit', nets: ['Mastercard'], tier: 'classic',   img: true },
  { id: 'bahl-signature-dc', bank: 'bahl', name: 'AL Habib Visa Signature Debit Card', type: 'debit', nets: ['Visa'],     tier: 'signature', img: true },
  { id: 'bahl-platinum-dc',  bank: 'bahl', name: 'AL Habib Visa Platinum Debit Card', type: 'debit', nets: ['Visa'],      tier: 'platinum',  img: true },
  { id: 'bahl-gold-dc',      bank: 'bahl', name: 'AL Habib Visa Gold Debit Card',   type: 'debit',  nets: ['Visa'],       tier: 'gold',      img: true },
  { id: 'bahl-silver-dc',    bank: 'bahl', name: 'AL Habib Visa Silver Debit Card', type: 'debit',  nets: ['Visa'],       tier: 'classic',   img: true },
  { id: 'bahl-paypak-dc',    bank: 'bahl', name: 'AL Habib PayPak Debit Card',      type: 'debit',  nets: ['PayPak'],     tier: 'classic' },
  // Allied Bank
  { id: 'abl-platinum-cc',        bank: 'allied', name: 'Allied Visa Platinum Credit Card', type: 'credit', nets: ['Visa'], tier: 'platinum', img: true },
  { id: 'abl-gold-cc',            bank: 'allied', name: 'Allied Visa Gold Credit Card',     type: 'credit', nets: ['Visa'], tier: 'gold',     img: true },
  { id: 'abl-infinite-dc',        bank: 'allied', name: 'Allied Visa Infinite Debit Card',  type: 'debit',  nets: ['Visa'], tier: 'infinite' },
  { id: 'abl-premium-dc',         bank: 'allied', name: 'Allied Visa Premium Debit Card',   type: 'debit',  nets: ['Visa'], tier: 'platinum', img: true },
  { id: 'abl-platinum-dc',        bank: 'allied', name: 'Allied Visa Platinum Debit Card',  type: 'debit',  nets: ['Visa'], tier: 'platinum', img: true },
  { id: 'abl-classic-dc',         bank: 'allied', name: 'Allied Visa Classic Debit Card',   type: 'debit',  nets: ['Visa'], tier: 'classic',  img: true },
  { id: 'abl-upi-paypak-gold-dc', bank: 'allied', name: 'Allied UnionPay PayPak Gold Debit Card', type: 'debit', nets: ['UnionPay', 'PayPak'], tier: 'gold', img: true },
  // Habib Metro
  { id: 'hmb-infinite-dc', bank: 'hmb', name: 'HabibMetro Visa Infinite Debit Card', type: 'debit', nets: ['Visa'],   tier: 'infinite' },
  { id: 'hmb-visa-dc',     bank: 'hmb', name: 'HabibMetro Visa Debit Card',          type: 'debit', nets: ['Visa'],   tier: 'classic' },
  { id: 'hmb-paypak-dc',   bank: 'hmb', name: 'HabibMetro PayPak Debit Card',        type: 'debit', nets: ['PayPak'], tier: 'classic' },
  // JS Bank
  { id: 'js-signature-cc', bank: 'js', name: 'JS Bank Visa Signature Credit Card', type: 'credit', nets: ['Visa'], tier: 'signature', img: true },
  { id: 'js-platinum-cc',  bank: 'js', name: 'JS Bank Visa Platinum Credit Card',  type: 'credit', nets: ['Visa'], tier: 'platinum',  img: true },
  { id: 'js-gold-cc',      bank: 'js', name: 'JS Bank Visa Gold Credit Card',      type: 'credit', nets: ['Visa'], tier: 'gold',      img: true },
  { id: 'js-classic-cc',   bank: 'js', name: 'JS Bank Visa Classic Credit Card',   type: 'credit', nets: ['Visa'], tier: 'classic',   img: true },
  { id: 'js-visa-dc',      bank: 'js', name: 'JS Bank Visa Debit Card',            type: 'debit',  nets: ['Visa'], tier: 'classic' },
  // Soneri
  { id: 'soneri-infinite-cc', bank: 'soneri', name: 'Soneri Visa Infinite Credit Card', type: 'credit', nets: ['Visa'], tier: 'infinite', img: true },
  { id: 'soneri-platinum-cc', bank: 'soneri', name: 'Soneri Visa Platinum Credit Card', type: 'credit', nets: ['Visa'], tier: 'platinum', img: true },
  { id: 'soneri-gold-cc',     bank: 'soneri', name: 'Soneri Visa Gold Credit Card',     type: 'credit', nets: ['Visa'], tier: 'gold',     img: true },
  { id: 'soneri-classic-cc',  bank: 'soneri', name: 'Soneri Visa Classic Credit Card',  type: 'credit', nets: ['Visa'], tier: 'classic',  img: true },
  { id: 'soneri-platinum-dc', bank: 'soneri', name: 'Soneri Mastercard Platinum Debit Card', type: 'debit', nets: ['Mastercard'], tier: 'platinum' },
  { id: 'soneri-paypak-dc',   bank: 'soneri', name: 'Soneri PayPak Debit Card',         type: 'debit',  nets: ['PayPak'], tier: 'classic' },
  // BankIslami
  { id: 'bi-titanium-dc', bank: 'bankislami', name: 'BankIslami Mastercard Titanium Debit Card', type: 'debit', nets: ['Mastercard'], tier: 'titanium', img: true },
  { id: 'bi-classic-dc',  bank: 'bankislami', name: 'BankIslami Mastercard Classic Debit Card',  type: 'debit', nets: ['Mastercard'], tier: 'classic',  img: true },
  { id: 'bi-paypak-dc',   bank: 'bankislami', name: 'BankIslami PayPak Debit Card',              type: 'debit', nets: ['PayPak'],     tier: 'classic',  img: true },
  // Bank of Punjab
  { id: 'bop-world-cc',     bank: 'bop', name: 'BOP Mastercard World Credit Card',     type: 'credit', nets: ['Mastercard'], tier: 'world' },
  { id: 'bop-platinum-cc',  bank: 'bop', name: 'BOP Mastercard Platinum Credit Card',  type: 'credit', nets: ['Mastercard'], tier: 'platinum' },
  { id: 'bop-gold-cc',      bank: 'bop', name: 'BOP Mastercard Gold Credit Card',      type: 'credit', nets: ['Mastercard'], tier: 'gold' },
  { id: 'bop-green-cc',     bank: 'bop', name: 'BOP Green Credit Card',                type: 'credit', nets: ['Mastercard'], tier: 'classic' },
  { id: 'bop-exec-cc',      bank: 'bop', name: 'BOP Executive Business Credit Card',   type: 'credit', nets: ['Mastercard'], tier: 'platinum' },
  { id: 'bop-qalandar-cc',  bank: 'bop', name: 'BOP Lahore Qalandars Business Credit Card', type: 'credit', nets: ['Mastercard'], tier: 'classic' },
  { id: 'bop-platinum-dc', bank: 'bop', name: 'BOP Mastercard Platinum Debit Card', type: 'debit', nets: ['Mastercard'], tier: 'platinum' },
  { id: 'bop-gold-dc',     bank: 'bop', name: 'BOP Mastercard Gold Debit Card',     type: 'debit', nets: ['Mastercard'], tier: 'gold' },
  { id: 'bop-classic-dc',  bank: 'bop', name: 'BOP Mastercard Classic Debit Card',  type: 'debit', nets: ['Mastercard'], tier: 'classic' },
  { id: 'bop-paypak-dc',   bank: 'bop', name: 'BOP PayPak Debit Card',              type: 'debit', nets: ['PayPak'],     tier: 'classic' },
  // NBP
  { id: 'nbp-paypak-dc',   bank: 'nbp', name: 'NBP PayPak Debit Card',   type: 'debit', nets: ['PayPak'],   tier: 'classic' },
  { id: 'nbp-unionpay-dc', bank: 'nbp', name: 'NBP UnionPay Debit Card', type: 'debit', nets: ['UnionPay'], tier: 'classic' },
  // Wallets
  { id: 'ep-visa-dc',       bank: 'easypaisa', name: 'Easypaisa Visa Debit Card',     type: 'debit', nets: ['Visa'],       tier: 'classic', img: true },
  { id: 'ep-unionpay-dc',   bank: 'easypaisa', name: 'Easypaisa UnionPay Debit Card', type: 'debit', nets: ['UnionPay'],   tier: 'classic', img: true },
  { id: 'ep-paypak-dc',     bank: 'easypaisa', name: 'Easypaisa PayPak Debit Card',   type: 'debit', nets: ['PayPak'],     tier: 'classic' },
  { id: 'jc-mastercard-dc', bank: 'jazzcash',  name: 'JazzCash Mastercard Debit Card', type: 'debit', nets: ['Mastercard'], tier: 'classic' },
  { id: 'jc-paypak-dc',     bank: 'jazzcash',  name: 'JazzCash PayPak Debit Card',    type: 'debit', nets: ['PayPak'],     tier: 'classic' },
  { id: 'np-visa-dc',       bank: 'nayapay',   name: 'NayaPay Visa Debit Card',       type: 'debit', nets: ['Visa'],       tier: 'classic', img: true },
  { id: 'sp-mastercard-dc', bank: 'sadapay',   name: 'SadaPay Mastercard Debit Card', type: 'debit', nets: ['Mastercard'], tier: 'classic', img: true }
];

window.CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Gujranwala'
];

window.CATEGORIES = [
  { id: 'dining',        name: 'Dining',            icon: '🍽️', color: '#c2410c' },
  { id: 'fastfood',      name: 'Fast Food',         icon: '🍔', color: '#dc2626' },
  { id: 'cafes',         name: 'Cafes',             icon: '☕', color: '#92400e' },
  { id: 'groceries',     name: 'Groceries',         icon: '🛒', color: '#15803d' },
  { id: 'fashion',       name: 'Fashion',           icon: '👗', color: '#be185d' },
  { id: 'online',        name: 'Online Shopping',   icon: '📦', color: '#7c3aed' },
  { id: 'electronics',   name: 'Electronics & EMI', icon: '📱', color: '#0369a1' },
  { id: 'travel',        name: 'Travel & Hotels',   icon: '✈️', color: '#0e7490' },
  { id: 'fuel',          name: 'Fuel',              icon: '⛽', color: '#b45309' },
  { id: 'entertainment', name: 'Entertainment',     icon: '🎬', color: '#6d28d9' },
  { id: 'health',        name: 'Health',            icon: '💊', color: '#059669' },
  { id: 'beauty',        name: 'Beauty & Salon',    icon: '💇', color: '#db2777' },
  { id: 'bills',         name: 'Telecom & Bills',   icon: '📶', color: '#475569' },
  { id: 'books',         name: 'Books',             icon: '📚', color: '#4d7c0f' }
];

