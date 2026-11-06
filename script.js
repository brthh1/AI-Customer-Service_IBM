/* =====================================================
   Bertha Store – AI Customer Service Assistant
   script.js

   Architecture:
     1. KNOWLEDGE BASE     – store data & FAQ
     2. RESPONSE ENGINE    – intent matching & answer building
     3. UI CONTROLLER      – DOM manipulation & events

   The response engine is decoupled from the UI so it can be
   replaced with an LLM API integration in the future.
   ===================================================== */

'use strict';

/* =====================================================
   1. KNOWLEDGE BASE
   ===================================================== */
const KB = {
  store: {
    name: 'Bertha Store',
    type: 'Toko online fashion dan aksesoris',
    email: 'cs@berthastore.id',
    phone: '0811-2345-6789',
    hours: 'Senin – Sabtu, 08.00 – 21.00 WIB',
  },

  products: [
    { name: 'Kaos',   price: 75000,  keywords: ['kaos', 't-shirt', 'tshirt', 'baju kaos', 'kaus'] },
    { name: 'Kemeja', price: 120000, keywords: ['kemeja', 'shirt', 'baju kemeja'] },
    { name: 'Hoodie', price: 150000, keywords: ['hoodie', 'hoddie', 'jaket hoodie', 'sweater hoodie', 'hoodie jacket'] },
    { name: 'Topi',   price: 45000,  keywords: ['topi', 'cap', 'hat', 'kupluk'] },
    { name: 'Tas',    price: 100000, keywords: ['tas', 'bag', 'handbag', 'ransel', 'totebag'] },
  ],

  order: {
    steps: [
      'Pilih produk yang Anda inginkan dari katalog kami.',
      'Masukkan produk ke keranjang belanja.',
      'Isi data pengiriman (nama, alamat, nomor telepon).',
      'Pilih metode pembayaran.',
      'Konfirmasi pesanan dan lakukan pembayaran.',
      'Pesanan Anda akan segera diproses dan dikirimkan.',
    ],
  },

  payment: {
    methods: ['Transfer Bank (BCA, Mandiri, BNI, BRI)', 'E-Wallet (GoPay, OVO, DANA, ShopeePay)', 'Virtual Account', 'QRIS'],
    note: 'Pembayaran dikonfirmasi otomatis dalam 1×24 jam setelah transfer.',
  },

  shipping: {
    estimate: '2–5 hari kerja',
    couriers: ['JNE', 'J&T Express', 'SiCepat', 'AnterAja'],
    note: 'Estimasi pengiriman dihitung setelah pesanan diproses dan pembayaran dikonfirmasi.',
    freeShipping: 'Gratis ongkos kirim untuk pembelian minimal Rp200.000.',
  },

  return: {
    maxDays: 3,
    conditions: ['Produk rusak atau cacat saat diterima', 'Produk tidak sesuai dengan pesanan (salah warna/ukuran/model)'],
    process: [
      'Hubungi customer service melalui email atau WhatsApp dalam 3 hari setelah barang diterima.',
      'Lampirkan foto produk yang bermasalah.',
      'Tim kami akan memproses permintaan retur dalam 1–2 hari kerja.',
      'Produk pengganti atau refund akan dikirimkan setelah retur disetujui.',
    ],
    notAccepted: 'Pengembalian tidak berlaku untuk produk yang sudah digunakan atau kerusakan akibat kelalaian pembeli.',
  },
};

/* =====================================================
   2. RESPONSE ENGINE
   ===================================================== */

/**
 * Normalise text: lowercase, remove punctuation, trim extra spaces.
 * @param {string} text
 * @returns {string}
 */
function normalise(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')   // strip punctuation
    .replace(/\s+/g, ' ')        // collapse whitespace
    .trim();
}

/**
 * Check whether the normalised input contains ANY of the supplied keywords.
 * @param {string} norm   – normalised user input
 * @param {string[]} keys – keywords to test
 * @returns {boolean}
 */
function hasKeyword(norm, keys) {
  return keys.some((k) => norm.includes(k));
}

/**
 * Format a number as Indonesian Rupiah.
 * @param {number} n
 * @returns {string}
 */
function toRupiah(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

/* --------- Intent definitions --------- */
const INTENTS = [

  /* ---- GREETINGS ---- */
  {
    id: 'greeting',
    keywords: ['halo', 'hai', 'hi', 'hello', 'hey', 'selamat pagi', 'selamat siang',
               'selamat sore', 'selamat malam', 'pagi', 'siang', 'sore', 'malam',
               'assalamualaikum', 'holla', 'helo', 'good morning', 'good afternoon'],
    respond() {
      const hour = new Date().getHours();
      let salam = 'Halo';
      if (hour >= 4  && hour < 11) salam = 'Selamat pagi';
      else if (hour >= 11 && hour < 15) salam = 'Selamat siang';
      else if (hour >= 15 && hour < 19) salam = 'Selamat sore';
      else salam = 'Selamat malam';
      return `${salam}! 👋 Selamat datang di **Bertha Store**.\n\nSaya adalah asisten virtual yang siap membantu Anda.\n\nAda yang bisa saya bantu hari ini? Anda bisa bertanya tentang produk, pemesanan, pembayaran, pengiriman, atau kebijakan retur kami. 😊`;
    },
  },

  /* ---- THANKS ---- */
  {
    id: 'thanks',
    keywords: ['terima kasih', 'makasih', 'thanks', 'thank you', 'thx', 'tq', 'tengkyu',
               'thank', 'mksh', 'mantap', 'bagus', 'oke', 'oke banget', 'baik', 'sip',
               'keren', 'luar biasa'],
    respond() {
      return `Sama-sama! 😊 Senang bisa membantu Anda.\n\nJika ada pertanyaan lain, jangan ragu untuk bertanya ya. Kami selalu siap melayani! ✨`;
    },
  },

  /* ---- GOODBYE ---- */
  {
    id: 'goodbye',
    keywords: ['bye', 'sampai jumpa', 'dadah', 'da', 'selamat tinggal', 'pamit',
               'makasih ya', 'makasi ya', 'see you', 'see ya'],
    respond() {
      return `Sampai jumpa! 👋 Terima kasih telah menghubungi Bertha Store.\n\nJika ada pertanyaan lain, kami selalu siap membantu. Selamat berbelanja! 🛍️`;
    },
  },

  /* ---- ALL PRODUCTS ---- */
  {
    id: 'product_list',
    keywords: ['daftar produk', 'produk apa', 'apa saja produk', 'list produk',
               'katalog', 'barang apa', 'jual apa', 'koleksi', 'semua produk',
               'produk yang ada', 'produk kalian', 'produk bertha', 'ada apa saja',
               'lihat produk', 'show produk', 'produk tersedia'],
    respond() {
      const rows = KB.products.map(
        (p) => `  • **${p.name}** — ${toRupiah(p.price)}`
      ).join('\n');
      return `Berikut daftar produk yang tersedia di **Bertha Store**: 🛍️\n\n${rows}\n\nSemua produk tersedia dalam berbagai warna dan ukuran. Apakah ada produk tertentu yang ingin Anda ketahui lebih lanjut?`;
    },
  },

  /* ---- SINGLE PRODUCT PRICE ---- */
  {
    id: 'product_price',
    keywords: ['harga', 'berapa', 'price', 'cost', 'jual', 'beli', 'dijual',
               'berapa harganya', 'harganya berapa', 'mau beli', 'mau tau harga',
               'ingin tahu harga', 'harga produk'],
    respond(norm) {
      const matched = KB.products.filter((p) => hasKeyword(norm, p.keywords));

      if (matched.length === 0) {
        // Ask about specific product
        const all = KB.products.map((p) => `**${p.name}** (${toRupiah(p.price)})`).join(', ');
        return `Kami menjual: ${all}.\n\nSilakan sebutkan produk mana yang ingin Anda ketahui harganya, ya! 😊`;
      }

      if (matched.length === 1) {
        const p = matched[0];
        return `Harga **${p.name}** di Bertha Store adalah **${toRupiah(p.price)}**. 🏷️\n\nApakah Anda tertarik untuk melakukan pemesanan?`;
      }

      const rows = matched.map((p) => `  • **${p.name}** — ${toRupiah(p.price)}`).join('\n');
      return `Berikut harga produk yang Anda tanyakan:\n\n${rows}\n\nAda yang bisa saya bantu lebih lanjut? 😊`;
    },
  },

  /* ---- ORDER ---- */
  {
    id: 'order',
    keywords: ['cara pesan', 'cara order', 'cara beli', 'cara belanja', 'bagaimana memesan',
               'bagaimana cara', 'proses pemesanan', 'proses order', 'langkah pesan',
               'pemesanan', 'order', 'beli', 'checkout', 'cara berbelanja', 'mau order',
               'mau pesan', 'gimana cara pesan', 'gimana pesan'],
    respond() {
      const steps = KB.order.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n');
      return `Berikut langkah-langkah pemesanan di **Bertha Store**: 🛒\n\n${steps}\n\nJika mengalami kendala saat berbelanja, jangan ragu untuk menghubungi tim kami di **${KB.store.email}** atau **${KB.store.phone}**. 😊`;
    },
  },

  /* ---- PAYMENT ---- */
  {
    id: 'payment',
    keywords: ['bayar', 'pembayaran', 'payment', 'transfer', 'metode bayar',
               'cara bayar', 'cara pembayaran', 'bisa bayar', 'e-wallet', 'ewallet',
               'gopay', 'ovo', 'dana', 'shopeepay', 'virtual account', 'qris',
               'metode pembayaran', 'opsi bayar', 'opsi pembayaran'],
    respond() {
      const methods = KB.payment.methods.map((m) => `  • ${m}`).join('\n');
      return `Bertha Store menyediakan berbagai metode pembayaran: 💳\n\n${methods}\n\n📌 *${KB.payment.note}*\n\nJika ada kendala dalam proses pembayaran, silakan hubungi CS kami.`;
    },
  },

  /* ---- SHIPPING ---- */
  {
    id: 'shipping',
    keywords: ['kirim', 'pengiriman', 'shipping', 'ekspedisi', 'kurir', 'ongkir',
               'estimasi kirim', 'lama kirim', 'berapa hari', 'kapan sampai',
               'delivery', 'jne', 'j&t', 'sicepat', 'anteraja', 'ongkos kirim',
               'gratis ongkir', 'free ongkir', 'info kirim', 'info pengiriman'],
    respond() {
      const couriers = KB.shipping.couriers.map((c) => `  • ${c}`).join('\n');
      return `Informasi pengiriman **Bertha Store**: 🚚\n\n📦 **Estimasi:** ${KB.shipping.estimate}\n\n**Mitra kurir kami:**\n${couriers}\n\n🎁 **${KB.shipping.freeShipping}**\n\n📌 *${KB.shipping.note}*`;
    },
  },

  /* ---- RETURN ---- */
  {
    id: 'return',
    keywords: ['retur', 'return', 'kembalikan', 'pengembalian', 'refund', 'tukar',
               'tukar barang', 'barang rusak', 'barang salah', 'tidak sesuai',
               'komplain', 'complain', 'klaim', 'claim', 'kebijakan retur',
               'syarat retur', 'cara retur', 'prosedur retur'],
    respond() {
      const conds = KB.return.conditions.map((c) => `  • ${c}`).join('\n');
      const proc  = KB.return.process.map((s, i) => `  ${i + 1}. ${s}`).join('\n');
      return `Kebijakan pengembalian barang **Bertha Store**: ↩️\n\n**⏳ Batas waktu:** ${KB.return.maxDays} hari setelah barang diterima.\n\n**✅ Kondisi yang dapat diretur:**\n${conds}\n\n**📋 Prosedur retur:**\n${proc}\n\n⚠️ *${KB.return.notAccepted}*`;
    },
  },

  /* ---- STORE INFO ---- */
  {
    id: 'store_info',
    keywords: ['tentang toko', 'info toko', 'informasi toko', 'bertha store itu',
               'jam buka', 'jam operasional', 'kontak', 'contact', 'hubungi',
               'email', 'nomor', 'telepon', 'whatsapp', 'cs bertha', 'customer service'],
    respond() {
      return `Informasi **Bertha Store**: 🏪\n\n🏷️ **Jenis toko:** ${KB.store.type}\n⏰ **Jam operasional:** ${KB.store.hours}\n📧 **Email:** ${KB.store.email}\n📱 **Telepon/WA:** ${KB.store.phone}\n\nTim kami siap membantu selama jam operasional! 😊`;
    },
  },

  /* ---- SIZE / STOCK ---- */
  {
    id: 'size_stock',
    keywords: ['ukuran', 'size', 'stok', 'stock', 'tersedia', 'available',
               'warna', 'color', 'pilihan ukuran', 'ada ukuran', 'ada warna',
               'pilihan warna', 'varian'],
    respond() {
      return `Untuk informasi ukuran, warna, dan ketersediaan stok yang lebih lengkap, silakan kunjungi halaman katalog kami atau hubungi customer service di:\n\n📧 **${KB.store.email}**\n📱 **${KB.store.phone}**\n\nTim kami dengan senang hati akan membantu Anda! 😊`;
    },
  },

  /* ---- PROMO / DISCOUNT ---- */
  {
    id: 'promo',
    keywords: ['promo', 'diskon', 'discount', 'sale', 'voucher', 'kupon', 'coupon',
               'cashback', 'flash sale', 'harbolnas', 'potongan harga', 'murah'],
    respond() {
      return `Saat ini informasi promo dan diskon terbaru tersedia di media sosial resmi kami.\n\nUntuk mengetahui promo yang sedang berjalan, silakan hubungi:\n📧 **${KB.store.email}**\n📱 **${KB.store.phone}**\n\nAtau ikuti akun resmi kami agar tidak ketinggalan promo eksklusif! 🎉`;
    },
  },
];

/**
 * Main response function.
 * Takes raw user input, matches against intents, and returns a response string.
 * @param {string} userInput
 * @returns {string}
 */
function getResponse(userInput) {
  if (!userInput || !userInput.trim()) {
    return 'Maaf, saya tidak menerima pesan. Silakan ketik pertanyaan Anda.';
  }

  const norm = normalise(userInput);

  /* --- Check product-specific price queries first (higher specificity) --- */
  const hasProductKeyword = KB.products.some((p) => hasKeyword(norm, p.keywords));
  const hasPriceKeyword   = hasKeyword(norm, INTENTS.find((i) => i.id === 'product_price').keywords);

  if (hasProductKeyword && hasPriceKeyword) {
    return INTENTS.find((i) => i.id === 'product_price').respond(norm);
  }

  /* --- Match intents in order --- */
  for (const intent of INTENTS) {
    if (hasKeyword(norm, intent.keywords)) {
      return typeof intent.respond === 'function'
        ? intent.respond(norm)
        : intent.respond;
    }
  }

  /* --- Check if user mentions a product name without price keywords --- */
  if (hasProductKeyword) {
    return INTENTS.find((i) => i.id === 'product_price').respond(norm);
  }

  /* --- Fallback --- */
  return `Maaf, saya belum memiliki informasi mengenai pertanyaan tersebut. 🙏\n\nUntuk bantuan lebih lanjut, silakan hubungi tim customer service kami:\n📧 **${KB.store.email}**\n📱 **${KB.store.phone}**\n⏰ ${KB.store.hours}\n\nAtau coba tanyakan salah satu topik berikut:\n  • Daftar produk & harga\n  • Cara pemesanan\n  • Metode pembayaran\n  • Estimasi pengiriman\n  • Kebijakan retur`;
}

/* =====================================================
   3. UI CONTROLLER
   ===================================================== */

const UI = {
  messagesEl: null,
  inputEl:    null,
  sendBtn:    null,
  clearBtn:   null,
  quickEl:    null,

  TYPING_DELAY_MIN: 700,
  TYPING_DELAY_MAX: 1500,

  /** Initialise DOM references and attach events */
  init() {
    this.messagesEl = document.getElementById('chat-messages');
    this.inputEl    = document.getElementById('user-input');
    this.sendBtn    = document.getElementById('btn-send');
    this.clearBtn   = document.getElementById('btn-clear');
    this.quickEl    = document.getElementById('quick-replies');

    /* Bind events */
    this.sendBtn.addEventListener('click',   () => this.handleSend());
    this.clearBtn.addEventListener('click',  () => this.handleClear());
    this.inputEl.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.inputEl.addEventListener('input',   () => this.autoResize());

    /* Quick reply buttons */
    this.quickEl.querySelectorAll('.quick-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        this.submitMessage(query);
      });
    });

    /* Render welcome message */
    this.renderWelcome();
  },

  /** Auto-resize textarea */
  autoResize() {
    const el = this.inputEl;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  },

  /** Handle Enter / Shift+Enter */
  handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSend();
    }
  },

  /** Read input and dispatch */
  handleSend() {
    const text = this.inputEl.value.trim();
    if (!text) return;
    this.submitMessage(text);
  },

  /** Clear conversation */
  handleClear() {
    this.messagesEl.innerHTML = '';
    this.renderWelcome();
    this.inputEl.value = '';
    this.inputEl.style.height = 'auto';
    this.quickEl.classList.remove('hidden');
  },

  /** Core dispatch: add user bubble → typing → bot bubble */
  submitMessage(text) {
    /* Hide quick replies after first interaction */
    this.quickEl.classList.add('hidden');

    /* Render user message */
    this.addMessage('user', text);

    /* Clear input */
    this.inputEl.value = '';
    this.inputEl.style.height = 'auto';
    this.sendBtn.disabled = true;

    /* Show typing indicator */
    const typingId = this.showTyping();

    /* Simulate processing delay */
    const delay = this.TYPING_DELAY_MIN +
      Math.random() * (this.TYPING_DELAY_MAX - this.TYPING_DELAY_MIN);

    setTimeout(() => {
      this.hideTyping(typingId);
      const response = getResponse(text);
      this.addMessage('bot', response);
      this.sendBtn.disabled = false;
    }, delay);
  },

  /** Get current HH:MM */
  getTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },

  /**
   * Render a chat bubble.
   * Converts **bold** markdown to <strong> and \n to <br>.
   */
  addMessage(role, text) {
    const row = document.createElement('div');
    row.classList.add('msg-row', role);

    const avatar = document.createElement('div');
    avatar.classList.add('msg-avatar');
    avatar.textContent = role === 'bot' ? 'B' : '👤';
    avatar.setAttribute('aria-hidden', 'true');

    const bubble = document.createElement('div');
    bubble.classList.add('msg-bubble');

    /* Process text: bold markdown then newlines */
    const formatted = this.formatText(text);

    const msgContent = document.createElement('span');
    msgContent.innerHTML = formatted;

    const time = document.createElement('span');
    time.classList.add('msg-time');
    time.textContent = this.getTime();
    time.setAttribute('aria-label', `Dikirim pukul ${this.getTime()}`);

    bubble.appendChild(msgContent);
    bubble.appendChild(time);

    row.appendChild(avatar);
    row.appendChild(bubble);

    this.messagesEl.appendChild(row);
    this.scrollToBottom();
  },

  /**
   * Convert **text** → <strong>text</strong> and \n → <br>
   * @param {string} text
   * @returns {string} safe HTML string
   */
  formatText(text) {
    /* Escape HTML first */
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    /* Bold: **text** */
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    /* Italic: *text* */
    safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');

    /* Newlines */
    safe = safe.replace(/\n/g, '<br>');

    return safe;
  },

  /** Show animated typing indicator, return its DOM id */
  showTyping() {
    const id = 'typing-' + Date.now();

    const row = document.createElement('div');
    row.classList.add('typing-row');
    row.id = id;

    const avatar = document.createElement('div');
    avatar.classList.add('msg-avatar');
    avatar.style.cssText = 'background: linear-gradient(135deg, #1a3a5c, #2f80ed); color: #fff; box-shadow: 0 2px 6px rgba(47,128,237,.3);';
    avatar.textContent = 'B';
    avatar.setAttribute('aria-hidden', 'true');

    const bubble = document.createElement('div');
    bubble.classList.add('typing-bubble');
    bubble.setAttribute('aria-label', 'Asisten sedang mengetik');

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.classList.add('typing-dot');
      bubble.appendChild(dot);
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    this.messagesEl.appendChild(row);
    this.scrollToBottom();

    return id;
  },

  /** Remove typing indicator by id */
  hideTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  /** Render initial welcome card */
  renderWelcome() {
    const card = document.createElement('div');
    card.classList.add('welcome-card');
    card.innerHTML = `
      <div class="welcome-avatar" aria-hidden="true">B</div>
      <p class="welcome-title">Halo! Saya Bertha 👋</p>
      <p class="welcome-sub">
        Asisten virtual <strong>Bertha Store</strong> siap membantu Anda.<br>
        Tanyakan apa saja seputar produk, pemesanan, pembayaran,<br>
        pengiriman, atau kebijakan retur kami.
      </p>
    `;
    this.messagesEl.appendChild(card);
    this.scrollToBottom();
  },

  /** Smooth scroll to bottom of messages */
  scrollToBottom() {
    requestAnimationFrame(() => {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    });
  },
};

/* =====================================================
   BOOT
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});
