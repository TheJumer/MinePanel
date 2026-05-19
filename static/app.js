let cart = [];
let allProducts = [];
let currentCategory = null;
let currentLang = localStorage.getItem('storeLang') || 'en';

const i18n = {
    en: {
        hero_support: "Support your favorite", hero_desc: "Get unique perks instantly after payment.", 
        footer_text: "Not an official Minecraft product. All rights reserved.",
        cart_title: "Your Cart", cart_total: "Total:", btn_pay: "Pay", btn_add: "Add to cart", 
        ph_nickname: "Your nickname", ph_promo: "Promo code (if any)",
        lbl_discount: "SALE", lbl_bought: "bought", err_empty_recent: "No purchases yet. Be the first!", 
        msg_added: "Added to cart!", err_nick: "Enter your nickname!",
        err_cart: "Cart is empty", msg_processing: "Processing...", msg_thx: "Thank you!", 
        msg_success: "Purchase successful, delivering items!", err_pay: "Payment error", 
        err_net: "Network error", msg_copied: "IP Copied!", cat_all: "Everything", cat_other: "Other"
    },
    uk: {
        hero_support: "Підтримай улюблений", hero_desc: "Отримай унікальні можливості миттєво після оплати.", 
        footer_text: "Не є офіційним продуктом Minecraft. Всі права захищені.",
        cart_title: "Твій кошик", cart_total: "Разом:", btn_pay: "Оплатити", btn_add: "В кошик", 
        ph_nickname: "Твій нікнейм", ph_promo: "Промокод (якщо є)",
        lbl_discount: "ЗНИЖКА", lbl_bought: "купив", err_empty_recent: "Поки немає покупок. Станьте першим!", 
        msg_added: "Додано в кошик!", err_nick: "Введіть нікнейм!",
        err_cart: "Кошик порожній", msg_processing: "Обробка...", msg_thx: "Дякуємо!", 
        msg_success: "Покупка успішна, донат видається!", err_pay: "Помилка при покупці", 
        err_net: "Помилка мережі", msg_copied: "IP скопійовано!", cat_all: "Усе", cat_other: "Інше"
    },
    ru: {
        hero_support: "Поддержи любимый", hero_desc: "Получи уникальные возможности сразу после оплаты.", 
        footer_text: "Не является официальным продуктом Minecraft. Все права защищены.",
        cart_title: "Твоя корзина", cart_total: "Итого:", btn_pay: "Оплатить", btn_add: "В корзину", 
        ph_nickname: "Твой никнейм", ph_promo: "Промокод (если есть)",
        lbl_discount: "СКИДКА", lbl_bought: "купил", err_empty_recent: "Пока нет покупок. Станьте первым!", 
        msg_added: "Добавлено!", err_nick: "Введите никнейм!",
        err_cart: "Корзина пуста", msg_processing: "Обработка...", msg_thx: "Спасибо!", 
        msg_success: "Покупка успешна, донат выдается!", err_pay: "Ошибка при покупке", 
        err_net: "Ошибка сети", msg_copied: "IP скопирован!", cat_all: "Все", cat_other: "Другое"
    }
};

function t(key) { return i18n[currentLang][key] || key; }

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
    document.getElementById('lang-switcher').value = currentLang;
}

function changeLanguage(lang) {
    currentLang = lang; 
    localStorage.setItem('storeLang', lang); 
    applyTranslations();
    loadCategories();
    renderProductsGrid(); 
    renderRecentTicker();
    if (!document.getElementById('cart-modal').classList.contains('hidden')) openCart();
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations(); 
    loadCategories();
    loadProducts(); 
    loadRecent();
    
    // Оновлюємо онлайн відразу і потім кожні 30 секунд
    updateOnlineStatus();
    setInterval(updateOnlineStatus, 30000);
});

// --- СИСТЕМА ОНЛАЙНУ ---
async function updateOnlineStatus() {
    const ipElem = document.getElementById('server-ip');
    const countElem = document.getElementById('online-count');
    const barElem = document.getElementById('online-bar');
    const maxElem = document.getElementById('max-online-val');
    
    if(!ipElem || !countElem || !barElem || !maxElem) return;
    
    const ip = ipElem.innerText.trim();
    const maxPlayers = parseInt(maxElem.value) || 100;

    try {
        const res = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
        const data = await res.json();
        
        if(data.online) {
            countElem.textContent = data.players.online;
            let percent = (data.players.online / maxPlayers) * 100;
            if(percent > 100) percent = 100;
            barElem.style.width = percent + '%';
            countElem.className = "text-2xl font-extrabold text-emerald-400 tracking-tight";
        } else {
            countElem.textContent = 'OFFLINE';
            countElem.className = "text-xl font-black text-rose-500 tracking-tighter";
            barElem.style.width = '0%';
        }
    } catch(e) {
        countElem.textContent = '---';
    }
}

// --- КАТЕГОРІЇ (САЙДБАР) ---
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const cats = await res.json();
        const list = document.getElementById('categories-list');
        
        let html = `
            <button onclick="filterCategory(null)" class="category-btn w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${currentCategory === null ? 'active' : 'text-slate-400'}">
                <i data-lucide="layers" class="w-4 h-4"></i> ${t('cat_all')}
            </button>
        `;
        
        cats.forEach(c => {
            html += `
                <button onclick="filterCategory(${c.id})" class="category-btn w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${currentCategory === c.id ? 'active' : 'text-slate-400'}">
                    <i data-lucide="chevron-right" class="w-4 h-4 opacity-50"></i> ${c.name}
                </button>
            `;
        });
        
        list.innerHTML = html;
        lucide.createIcons();
    } catch (e) { console.error(e); }
}

function filterCategory(id) {
    currentCategory = id;
    loadCategories(); // Оновити "active" клас
    renderProductsGrid();
}

// --- ТОВАРИ ---
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderProductsGrid();
    } catch (error) { console.error(error); }
}

function renderProductsGrid() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    const filtered = currentCategory === null 
        ? allProducts 
        : allProducts.filter(p => p.category_id === currentCategory);

    filtered.forEach(p => {
        const hasDiscount = p.discount_price !== null && p.discount_price < p.price;
        const card = `
            <div onclick="openProductModal(${p.id})" class="glass rounded-[2rem] p-7 flex flex-col items-center text-center group hover:border-indigo-500/40 transition-all duration-500 relative cursor-pointer shadow-xl">
                ${hasDiscount ? `<div class="absolute top-5 right-5 bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg tracking-widest z-20">${t('lbl_discount')}</div>` : ''}
                <div class="relative mb-6">
                    <div class="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-700"></div>
                    <img src="${p.icon_url}" class="w-36 h-32 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]">
                </div>
                <h3 class="text-xl font-bold mb-4 text-white group-hover:text-indigo-300 transition-colors">${p.name}</h3>
                
                <div class="mt-auto w-full">
                    <div class="mb-5 flex flex-col">
                        ${hasDiscount ? 
                            `<span class="text-slate-500 line-through text-xs font-bold mb-1">${p.price} ₴</span><span class="text-3xl font-black text-emerald-400">${p.discount_price} ₴</span>` : 
                            `<span class="text-3xl font-black text-white">${p.price} ₴</span>`}
                    </div>
                    <button onclick="event.stopPropagation(); addToCart(${p.id})" class="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-600/20 hover:border-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <i data-lucide="shopping-bag" class="w-4 h-4"></i> ${t('btn_add')}
                    </button>
                </div>
            </div>`;
        const div = document.createElement('div');
        div.innerHTML = card;
        grid.appendChild(div.firstElementChild);
    });
    lucide.createIcons();
}

// --- ВІКНА ТОВАРУ ---
function openProductModal(id) {
    const p = allProducts.find(x => x.id === id);
    if(!p) return;
    document.getElementById('pm-img').src = p.icon_url;
    document.getElementById('pm-name').textContent = p.name;
    document.getElementById('pm-desc').textContent = p.description;
    const hasDiscount = p.discount_price !== null && p.discount_price < p.price;
    document.getElementById('pm-price-container').innerHTML = hasDiscount ? 
        `<span class="text-slate-500 line-through text-lg mr-2">${p.price} ₴</span><span class="text-3xl font-black text-emerald-400">${p.discount_price} ₴</span>` : 
        `<span class="text-3xl font-black text-white">${p.price} ₴</span>`;
    document.getElementById('pm-add-btn').onclick = () => { addToCart(p.id); closeProductModal(); };
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('product-modal-content').classList.remove('scale-95'); }, 10);
    lucide.createIcons();
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('opacity-0'); document.getElementById('product-modal-content').classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

// --- ФУНКЦІЇ ФУТЕРА (УМОВИ / КОНТАКТИ) ---
function openTermsModal() {
    const m = document.getElementById('terms-modal');
    m.classList.remove('hidden');
    setTimeout(() => { m.classList.remove('opacity-0'); document.getElementById('terms-content').classList.remove('scale-95'); }, 10);
}
function closeTermsModal() {
    const m = document.getElementById('terms-modal');
    m.classList.add('opacity-0'); document.getElementById('terms-content').classList.add('scale-95');
    setTimeout(() => m.classList.add('hidden'), 300);
}
function openContactModal() {
    const m = document.getElementById('contact-modal');
    m.classList.remove('hidden');
    setTimeout(() => { m.classList.remove('opacity-0'); document.getElementById('contact-content').classList.remove('scale-95'); }, 10);
}
function closeContactModal() {
    const m = document.getElementById('contact-modal');
    m.classList.add('opacity-0'); document.getElementById('contact-content').classList.add('scale-95');
    setTimeout(() => m.classList.add('hidden'), 300);
}

// --- КОШИК ---
function addToCart(id) {
    cart.push(id); updateCartCount();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: t('msg_added'), showConfirmButton: false, timer: 1500, background: '#0f172a', color: '#fff' });
}
function updateCartCount() { 
    const count = cart.length;
    if(document.getElementById('cart-count')) document.getElementById('cart-count').textContent = count;
    if(document.getElementById('cart-count-mob')) document.getElementById('cart-count-mob').textContent = count;
}
function openCart() {
    const list = document.getElementById('cart-items');
    let total = 0;
    list.innerHTML = cart.map((id, index) => {
        const p = allProducts.find(x => x.id === id);
        if(!p) return '';
        const price = p.discount_price || p.price;
        total += price;
        return `<div class="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5"><div class="flex items-center gap-3"><img src="${p.icon_url}" class="w-10 h-10 object-contain"><span class="font-bold text-sm text-white">${p.name}</span></div><div class="flex items-center gap-4"><span class="text-emerald-400 font-bold">${price} ₴</span><button onclick="removeFromCart(${index})" class="text-rose-500 hover:bg-rose-500/20 p-2 rounded-lg transition-colors"><i data-lucide="x" class="w-4 h-4"></i></button></div></div>`;
    }).join('');
    document.getElementById('cart-total').textContent = `${total} ₴`;
    document.getElementById('cart-modal').classList.remove('hidden');
    lucide.createIcons();
}
function removeFromCart(index) { cart.splice(index, 1); updateCartCount(); openCart(); }
function closeCart() { document.getElementById('cart-modal').classList.add('hidden'); }

let skinTimeout = null;
function updateCartSkin(nickname) {
    clearTimeout(skinTimeout);
    skinTimeout = setTimeout(() => {
        const img = document.getElementById('cart-player-head');
        img.src = nickname.length >= 3 ? `https://minotar.net/helm/${nickname}/100.png` : `https://minotar.net/helm/Steve/100.png`;
    }, 500);
}

async function checkout() {
    const player = document.getElementById('cart-nickname').value.trim();
    const promo = document.getElementById('cart-promo').value.trim();
    if (!player) return Swal.fire({icon:'error', title:'Error', text: t('err_nick'), background: '#0f172a', color: '#fff'});
    if (cart.length === 0) return Swal.fire({icon:'error', title:'Error', text: t('err_cart'), background: '#0f172a', color: '#fff'});
    const btn = document.getElementById('pay-btn');
    btn.innerHTML = t('msg_processing'); btn.disabled = true;
    try {
        const res = await fetch('/api/buy_cart', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ player_name: player, items: cart.map(id => ({id})), promocode: promo || null }) });
        if (res.ok) {
            Swal.fire({icon:'success', title: t('msg_thx'), text: t('msg_success'), background: '#0f172a', color: '#fff'});
            cart = []; updateCartCount(); closeCart(); loadRecent();
            document.getElementById('cart-promo').value = '';
        } else { Swal.fire({icon:'error', title:'Error', text: t('err_pay'), background: '#0f172a', color: '#fff'}); }
    } catch (e) { Swal.fire({icon:'error', title:'Error', text: t('err_net'), background: '#0f172a', color: '#fff'}); } 
    finally { btn.innerHTML = t('btn_pay'); btn.disabled = false; }
}

// --- ІНШЕ ---
async function loadRecent() {
    try {
        const res = await fetch('/api/recent_purchases');
        const data = await res.json();
        const ticker = document.getElementById('recent-ticker');
        if(data.length === 0) { ticker.innerHTML = `<span class="text-slate-500 px-6">${t('err_empty_recent')}</span>`; return; }
        ticker.innerHTML = [...data, ...data].map(p => `<div class="inline-flex items-center gap-3 px-8 border-r border-white/5"><img src="https://minotar.net/helm/${p.player}/24.png" class="rounded-lg shadow-lg"><span class="font-bold text-slate-200">${p.player}</span><span class="text-[10px] text-slate-500 uppercase tracking-widest">${t('lbl_bought')} донат</span><img src="${p.icon}" class="w-5 h-5 object-contain"></div>`).join('');
    } catch (e) { console.error(e); }
}

function copyIP() {
    const ip = document.getElementById('server-ip').innerText;
    navigator.clipboard.writeText(ip);
    Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: t('msg_copied'), background: '#1e293b', color: '#fff' });
}