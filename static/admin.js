let adminProducts = [];
let currentLang = localStorage.getItem('adminLang') || 'en';

const i18n = {
    en: {
        page_title: "Admin Panel - MinePanel",
        menu_dashboard: "Dashboard", menu_products: "Products", menu_promo: "Promo Codes", menu_test: "Test Delivery", menu_settings: "Settings", menu_store: "To Store", menu_logout: "Logout", menu_appearance: "Appearance", menu_security: "Security",
        dash_title: "Store Overview", dash_revenue: "Total Revenue", dash_sold: "Items Sold", dash_recent: "Recent Transactions",
        tbl_player: "Player", tbl_item: "Item", tbl_date: "Date", tbl_status: "Status", tbl_icon: "Icon / Name", tbl_cmd: "Command", tbl_price: "Price", tbl_actions: "Actions",
        prod_title: "Product Management", prod_create: "Create New Product", btn_upload: "Select image from PC", btn_create_prod: "Create Product",
        promo_title: "Promo Code Management", btn_create_promo: "Create Promo Code", promo_discount: "Discount", promo_used: "Uses", promo_expires: "Expires", promo_unlimited: "Unlimited",
        test_title: "Test Delivery", test_desc: "Verify server connection without real payments.", btn_issue_test: "Issue Test",
        set_title: "System Settings", set_site: "Site Settings", btn_save_site: "Save Site Data", set_delivery: "Delivery Method", set_rcon: "RCON Settings", btn_save_rcon: "Save Connection",
        set_ds_desc: "Send purchase reports", lbl_webhook: "Webhook URL", lbl_bot: "Bot Name", lbl_color: "Embed Color (DEC)", btn_save_ds: "Save Discord",
        edit_title: "Edit Product", btn_change_img: "Change Image", btn_save_changes: "Save Changes",
        ph_name: "Name", ph_price: "Regular Price (₴)", ph_discount: "Discount Price (empty = no discount)", ph_cmd: "Command {player} (without /)", ph_desc: "Description",
        ph_site_name: "Server Name", ph_site_ip: "Server IP (play.server.com)", ph_promo_code: "Code (e.g. SUMMER)", ph_promo_percent: "Percent %", ph_promo_limit: "Limit (0 = unlimited)",
        msg_uploading: "Uploading...", msg_uploaded: "Uploaded!", msg_err_upload: "Error. Try again.", msg_saved: "Saved!", msg_site_saved: "Site settings updated. Refresh store.", msg_method_changed: "Method changed!",
        msg_prod_created: "Product created!", msg_prod_updated: "Product updated!", msg_promo_created: "Promo created!", msg_deleted: "Deleted!",
        alert_del_title: "Delete item?", alert_del_text: "This action cannot be undone!", alert_yes: "Yes, delete", alert_cancel: "Cancel",
        test_modal_title: "Issuing:", test_ph_nick: "Player nickname", btn_send: "Send Command", msg_success: "Success", msg_error: "Error",
        set_plugin: "Plugin Settings", plugin_placeholder: "Plugin settings will be added later.", lbl_plugin_secret: "Plugin Secret Key",
        cat_manage: "Category Management", ph_new_cat: "New Category (e.g. Currency)", btn_add: "Add", cat_none: "No Category", alert_del_cat: "Delete category?", alert_cat_warn: "Products in this category will become uncategorized.",
        app_texts: "Server Branding", lbl_site_title: "Browser Tab Title", lbl_favicon: "Favicon URL (Icon in tab)", lbl_logo: "Shop Logo", lbl_hero_title: "Hero Title ({server_name} allowed)", lbl_hero_sub: "Subtitle", btn_save_texts: "Save Branding",
        app_bg: "Background Settings", lbl_bg_type: "Background Type", bg_color: "Solid Color (Default)", bg_image: "Image (JPG/PNG)", bg_video: "Live Wallpaper (MP4/GIF)", lbl_bg_url: "Background Media URL", lbl_bg_blur: "Blur Background", btn_save_bg: "Save Background",
        sec_title: "Security Settings", sec_csrf: "CSRF Protection (Anti-Hacking)", sec_csrf_desc: "Blocks forged cross-site requests. Disable this if you encounter persistent 'CSRF blocked' errors on item creation.",
        sec_creds_title: "Change Admin Credentials", ph_new_user: "New Username", ph_new_pass: "New Password (min 12 chars)", btn_save_creds: "Update Access Data", msg_creds_saved: "Username and password updated successfully!"
    },
    uk: {
        page_title: "Адмін Панель - MinePanel",
        menu_dashboard: "Дашборд", menu_products: "Товари", menu_promo: "Промокоди", menu_test: "Тест видачі", menu_settings: "Налаштування", menu_store: "В магазин", menu_logout: "Вийти", menu_appearance: "Вигляд", menu_security: "Захист",
        dash_title: "Огляд магазину", dash_revenue: "Загальний дохід", dash_sold: "Продано товарів", dash_recent: "Останні транзакції",
        tbl_player: "Гравець", tbl_item: "Товар", tbl_date: "Дата", tbl_status: "Статус", tbl_icon: "Іконка / Назва", tbl_cmd: "Команда", tbl_price: "Ціна", tbl_actions: "Дії",
        prod_title: "Управління товарами", prod_create: "Створити новий товар", btn_upload: "Вибрати файл", btn_create_prod: "Створити товар",
        promo_title: "Управління промокодами", btn_create_promo: "Створити промокод", promo_discount: "Знижка", promo_used: "Використано", promo_expires: "Діє до", promo_unlimited: "Безліміт",
        test_title: "Тестування видачі донату", test_desc: "Перевірте підключення сервера без реальної оплати.", btn_issue_test: "Видати тест",
        set_title: "Налаштування системи", set_site: "Налаштування сайту", btn_save_site: "Зберегти дані сайту", set_delivery: "Метод видачі донату", set_rcon: "Налаштування RCON", btn_save_rcon: "Зберегти з'єднання",
        set_ds_desc: "Надсилати звіти про покупки", lbl_webhook: "URL вебхуку", lbl_bot: "Ім'я Бота", lbl_color: "Колір збоку (DEC)", btn_save_ds: "Зберегти Discord",
        edit_title: "Редагування товару", btn_change_img: "Змінити картинку", btn_save_changes: "Зберегти зміни",
        ph_name: "Назва", ph_price: "Звичайна ціна (₴)", ph_discount: "Ціна зі знижкою (пустий = без знижки)", ph_cmd: "Команда {player} (без /)", ph_desc: "Опис",
        ph_site_name: "Назва сервера", ph_site_ip: "IP сервера (play.server.com)", ph_promo_code: "Код (напр. SUMMER)", ph_promo_percent: "Відсоток %", ph_promo_limit: "Ліміт (0 = безліміт)",
        msg_uploading: "Завантаження...", msg_uploaded: "Фото завантажено!", msg_err_upload: "Помилка. Спробуйте ще раз.", msg_saved: "Збережено!", msg_site_saved: "Налаштування сайту оновлено.", msg_method_changed: "Метод змінено!",
        msg_prod_created: "Товар створено!", msg_prod_updated: "Товар оновлено!", msg_promo_created: "Промокод створено!", msg_deleted: "Видалено!",
        alert_del_title: "Видалити об'єкт?", alert_del_text: "Дію неможливо скасувати!", alert_yes: "Так, видалити", alert_cancel: "Скасувати",
        test_modal_title: "Видаємо:", test_ph_nick: "Нікнейм гравця", btn_send: "Відправити", msg_success: "Успішно", msg_error: "Помилка",
        set_plugin: "Налаштування плагіну", plugin_placeholder: "Налаштування плагіну будуть додані пізніше.", lbl_plugin_secret: "Секретний ключ плагіну",
        cat_manage: "Керування категоріями", ph_new_cat: "Назва нової категорії", btn_add: "Додати", cat_none: "Без категорії", alert_del_cat: "Видалити категорію?", alert_cat_warn: "Товары з цієї категорії залишаться, але без категорії.",
        app_texts: "Брендинг сервера", lbl_site_title: "Заголовок вкладки браузера", lbl_favicon: "Favicon (Іконка вкладки)", lbl_logo: "Логотип магазину", lbl_hero_title: "Головний заголовок ({server_name} дозволено)", lbl_hero_sub: "Підзаголовок", btn_save_texts: "Зберегти брендинг",
        app_bg: "Фон", lbl_bg_type: "Тип фону", bg_color: "Звичайний колір", bg_image: "Картинка (JPG/PNG)", bg_video: "Живі шпалери (MP4/GIF/WEBM)", lbl_bg_url: "Посилання на медіа-файл", lbl_bg_blur: "Розмити фон (Blur)", btn_save_bg: "Зберегти фон",
        sec_title: "Налаштування захисту", sec_csrf: "CSRF Захист (Анти-Злом)", sec_csrf_desc: "Блокує підроблені запити від хакерів. Вимкніть цей захист, якщо у вас постійно виникає помилка 'CSRF заблоковано' при створенні товарів.",
        sec_creds_title: "Зміна логіну та пароля", ph_new_user: "Новий логін", ph_new_pass: "Новий пароль (мінімум 12 символів)", btn_save_creds: "Оновити дані доступу", msg_creds_saved: "Логін і пароль успішно змінено!"
    },
    ru: {
        page_title: "Админ Панель - MinePanel",
        menu_dashboard: "Дашборд", menu_products: "Товары", menu_promo: "Promo Codes", menu_test: "Тест выдачи", menu_settings: "Настройки", menu_store: "В магазин", menu_logout: "Выйти", menu_appearance: "Внешний вид", menu_security: "Защита",
        dash_title: "Обзор магазина", dash_revenue: "Общий доход", dash_sold: "Продано товаров", dash_recent: "Последние транзакции",
        tbl_player: "Игрок", tbl_item: "Товар", tbl_date: "Дата", tbl_status: "Статус", tbl_icon: "Иконка / Название", tbl_cmd: "Команда", tbl_price: "Цена", tbl_actions: "Действия",
        prod_title: "Управление товарами", prod_create: "Создать новый товар", btn_upload: "Выбрать файл", btn_create_prod: "Создать товар",
        promo_title: "Управление промокодами", btn_create_promo: "Создать промокод", promo_discount: "Скидка", promo_used: "Использовано", promo_expires: "Действует до", promo_unlimited: "Безлимит",
        test_title: "Тестирование выдачи", test_desc: "Проверьте подключение сервера без реальной оплаты.", btn_issue_test: "Выдать тест",
        set_title: "Настройки системы", set_site: "Настройки сайта", btn_save_site: "Сохранить данные", set_delivery: "Метод выдачи доната", set_rcon: "Настройки RCON", btn_save_rcon: "Сохранить соединение",
        set_ds_desc: "Отправлять отчеты о покупках", lbl_webhook: "URL вебхука", lbl_bot: "Имя Бота", lbl_color: "Цвет сбоку (DEC)", btn_save_ds: "Сохранить Discord",
        edit_title: "Редактирование товара", btn_change_img: "Изменить картинку", btn_save_changes: "Сохранить изменения",
        ph_name: "Название", ph_price: "Обычная цена (₴)", ph_discount: "Цена со скидкой (пустой = без)", ph_cmd: "Команда {player} (без /)", ph_desc: "Описание",
        ph_site_name: "Название сервера", ph_site_ip: "IP сервера (play.server.com)", ph_promo_code: "Код (напр. SUMMER)", ph_promo_percent: "Процент %", ph_promo_limit: "Лимит (0 = безлимит)",
        msg_uploading: "Загрузка...", msg_uploaded: "Фото загружено!", msg_err_upload: "Ошибка. Попробуйте еще раз.", msg_saved: "Сохранено!", msg_site_saved: "Настройки сайта обновлены.", msg_method_changed: "Метод изменен!",
        msg_prod_created: "Товар создан!", msg_prod_updated: "Товар обновлен!", msg_promo_created: "Промокод создан!", msg_deleted: "Удалено!",
        alert_del_title: "Удалить объект?", alert_del_text: "Действие невозможно отменить!", alert_yes: "Да, удалить", alert_cancel: "Отмена",
        test_modal_title: "Выдаем:", test_ph_nick: "Никнейм игрока", btn_send: "Отправить", msg_success: "Успешно", msg_error: "Ошибка",
        set_plugin: "Настройки плагина", plugin_placeholder: "Настройки плагина будут добавлены позже.", lbl_plugin_secret: "Секретный ключ плагина",
        cat_manage: "Управление категориями", ph_new_cat: "Название новой категории", btn_add: "Добавить", cat_none: "Без категории", alert_del_cat: "Удалить категорию?", alert_cat_warn: "Товары из этой категории останутся без категории.",
        app_texts: "Брендинг сервера", lbl_site_title: "Заголовок вкладки браузера", lbl_favicon: "Favicon (Иконка вкладки)", lbl_logo: "Логотип магазина", lbl_hero_title: "Главный заголовок ({server_name} разрешено)", lbl_hero_sub: "Подзаголовок", btn_save_texts: "Сохранить брендинг",
        app_bg: "Фон", lbl_bg_type: "Тип фона", bg_color: "Обычный цвет", bg_image: "Картинка (JPG/PNG)", bg_video: "Живые обои (MP4/GIF/WEBM)", lbl_bg_url: "Ссылка на медиа-файл", lbl_bg_blur: "Размыть фон (Blur)", btn_save_bg: "Сохранить фон",
        sec_title: "Настройки защиты", sec_csrf: "CSRF Защита (Анти-Взлом)", sec_csrf_desc: "Блокирует поддельные запросы от хакеров. Отключите эту защиту, если у вас постоянно возникает ошибка 'CSRF заблокировано' при создании товаров.",
        sec_creds_title: "Смена логина и пароля", ph_new_user: "Новый логин", ph_new_pass: "Новый пароль (минимум 12 символов)", btn_save_creds: "Обновить данные доступа", msg_creds_saved: "Логин и пароль успешно изменены!"
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
    localStorage.setItem('adminLang', lang);
    applyTranslations();
    loadCategories(); 
    loadProducts();
    loadPromos();
    loadSecuritySettings();
    
    const method = document.getElementById('btn-rcon').classList.contains('bg-indigo-600/10') ? 'rcon' : 'plugin';
    updateDeliveryUI(method);
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    loadStats();
    loadCategories();
    loadProducts();
    loadPromos();
    loadSettings();
    loadDbConfig();
    loadSecuritySettings();
});

function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const targetedBtn = document.getElementById(`btn-${tabName}`);
    if (targetedBtn) targetedBtn.classList.add('active');
    
    ['stats', 'products', 'promo', 'test', 'settings', 'appearance', 'security'].forEach(tab => { 
        const tabEl = document.getElementById(`tab-${tab}`);
        if (tabEl) tabEl.classList.add('hidden'); 
    });
    
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.remove('hidden');
}

// Універсальна функція обробки помилок
async function handleResponseError(res) {
    if (!res.ok) {
        let errorMsg = t('msg_error');
        try {
            const data = await res.json();
            if (Array.isArray(data.detail)) {
                errorMsg = data.detail.map(e => e.msg).join('<br>');
            } else if (data.detail) {
                errorMsg = data.detail;
            }
        } catch (e) {
            errorMsg = "Сервер повернув помилку " + res.status;
        }
        Swal.fire({ icon: 'error', title: t('msg_error'), html: errorMsg, background: '#0f172a', color: '#fff' });
        throw new Error(errorMsg);
    }
}

// --- ФАЙЛИ ТА ЗАВАНТАЖЕННЯ ---
async function handleFileUpload(input, iconInputId, previewImgId, previewDivId, labelId) {
    if (!input.files || !input.files[0]) return;
    const formData = new FormData();
    formData.append('file', input.files[0]);
    
    const originalLabelHtml = document.getElementById(labelId).innerHTML;
    document.getElementById(labelId).innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-slate-400"></i>`;
    lucide.createIcons();

    try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        await handleResponseError(res);
        const data = await res.json();
        
        document.getElementById(iconInputId).value = data.url;
        
        if (previewImgId && document.getElementById(previewImgId)) {
            document.getElementById(previewImgId).src = data.url;
        }
        if (previewDivId && document.getElementById(previewDivId)) {
            document.getElementById(previewDivId).classList.remove('hidden');
            document.getElementById(previewDivId).classList.add('flex');
        }
        
        document.getElementById(labelId).innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>`;
        lucide.createIcons();
        setTimeout(() => { document.getElementById(labelId).innerHTML = originalLabelHtml; lucide.createIcons(); }, 3000);
    } catch (e) {
        document.getElementById(labelId).innerHTML = originalLabelHtml;
        input.value = '';
        lucide.createIcons();
    }
}

// --- ПОШУК ТА СТАТИСТИКА ---
let searchTimeout;
function filterStats(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { loadStats(query); }, 400);
}

async function loadStats(searchQuery = '') {
    try {
        const url = searchQuery ? `/api/admin/stats?search=${encodeURIComponent(searchQuery)}` : '/api/admin/stats';
        const res = await fetch(url);
        if (res.status === 401) window.location.href = '/login';
        const data = await res.json();
        
        document.getElementById('stat-revenue').textContent = `${data.total_revenue} ₴`;
        document.getElementById('stat-orders').textContent = data.total_orders;
        
        document.getElementById('recent-purchases-list').innerHTML = data.recent.map(p => `
            <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="px-8 py-4 flex items-center gap-3"><img src="https://minotar.net/helm/${p.player_name}/32.png" class="w-8 h-8 rounded-md"><span class="font-medium text-white">${p.player_name}</span></td>
                <td class="px-8 py-4 text-indigo-400 font-medium">${p.product_name}</td>
                <td class="px-8 py-4 text-slate-400 text-sm">${p.date}</td>
                <td class="px-8 py-4"><span class="px-3 py-1 rounded-full text-xs font-medium ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}">${p.status}</span></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

// --- НАЛАШТУВАННЯ ТА ВИГЛЯД ---
function toggleDS() {
    const isEnabled = document.getElementById('ds-toggle').checked;
    document.getElementById('ds-settings').classList.toggle('hidden', !isEnabled);
    const header = document.getElementById('ds-header');
    if (isEnabled) header.classList.add('mb-6'); else header.classList.remove('mb-6');
}

async function loadSettings() {
    try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
            const s = await res.json();
            
            // Appearance & Branding
            if (document.getElementById('a-server-name')) {
                document.getElementById('a-server-name').value = s.server_name || '';
                document.getElementById('a-server-ip').value = s.server_ip || '';
                document.getElementById('a-site-title').value = s.site_title || '';
                document.getElementById('a-favicon').value = s.site_favicon || '';
                document.getElementById('a-logo').value = s.site_logo || '';
                document.getElementById('a-hero-title').value = s.hero_title || '';
                document.getElementById('a-hero-sub').value = s.hero_subtitle || '';
                
                // Social Links
                if(document.getElementById('s-dc-url')) {
                    document.getElementById('s-dc-url').value = s.dc_url || '';
                    document.getElementById('s-dc-mode').value = s.dc_mode || 'none';
                    document.getElementById('s-tg-url').value = s.tg_url || '';
                    document.getElementById('s-tg-mode').value = s.tg_mode || 'none';
                    document.getElementById('s-yt-url').value = s.yt_url || '';
                    document.getElementById('s-yt-mode').value = s.yt_mode || 'none';
                }
                
                document.getElementById('a-bg-type').value = s.bg_type || 'color';
                document.getElementById('a-bg-url').value = s.bg_url || '';
                document.getElementById('a-bg-blur').checked = s.bg_blur === 'true';

                // Online Settings
                if(document.getElementById('a-show-online')) {
                    document.getElementById('a-show-online').checked = s.show_online === 'true';
                    document.getElementById('a-max-online').value = s.max_online || '100';
                    document.getElementById('a-mc-version').value = s.mc_version || '1.16.5';
                }

                // Footer Info
                if(document.getElementById('a-contact-email')) {
                    document.getElementById('a-contact-email').value = s.contact_email || '';
                    document.getElementById('a-terms-text').value = s.terms_text || '';
                }
            }
            
            // Delivery
            updateDeliveryUI(s.delivery_method || 'rcon');
            document.getElementById('s-rcon-ip').value = s.rcon_ip || '';
            document.getElementById('s-rcon-port').value = s.rcon_port || '';
            document.getElementById('s-rcon-password').value = s.rcon_password || '';
            
            // Discord
            document.getElementById('ds-toggle').checked = s.discord_enabled === 'true';
            toggleDS();
            document.getElementById('ds-webhook').value = s.discord_webhook || '';
            document.getElementById('ds-name').value = s.discord_name || 'MineStore Bot';
            document.getElementById('ds-color').value = s.discord_color || '5814783';
            document.getElementById('ds-title').value = s.discord_title || '🎉 Нова покупка!';
            document.getElementById('ds-desc').value = s.discord_desc || 'Гравець **{player}** придбав **{product}** за **{price} ₴**';
        }
    } catch (e) { console.error(e); }
}

async function loadDbConfig() {
    try {
        const res = await fetch('/api/admin/db_config');
        if (res.ok) {
            const data = await res.json();
            document.getElementById('s-db-url').value = data.db_url || '';
        }
    } catch (e) { console.error(e); }
}

// Збереження Branding
document.getElementById('app-branding-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { 
        server_name: document.getElementById('a-server-name').value,
        server_ip: document.getElementById('a-server-ip').value,
        site_title: document.getElementById('a-site-title').value, 
        site_favicon: document.getElementById('a-favicon').value,
        site_logo: document.getElementById('a-logo').value,
        hero_title: document.getElementById('a-hero-title').value,
        hero_subtitle: document.getElementById('a-hero-sub').value
    };
    try {
        const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_saved'), background: '#1e293b', color: '#fff' });
    } catch(err) {}
});

// Збереження Social Links
document.getElementById('app-social-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { 
        dc_url: document.getElementById('s-dc-url').value,
        dc_mode: document.getElementById('s-dc-mode').value,
        tg_url: document.getElementById('s-tg-url').value,
        tg_mode: document.getElementById('s-tg-mode').value,
        yt_url: document.getElementById('s-yt-url').value,
        yt_mode: document.getElementById('s-yt-mode').value
    };
    try {
        const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_saved'), background: '#1e293b', color: '#fff' });
    } catch(err) {}
});

// Збереження Фону
document.getElementById('app-bg-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { 
        bg_type: document.getElementById('a-bg-type').value, 
        bg_url: document.getElementById('a-bg-url').value,
        bg_blur: document.getElementById('a-bg-blur').checked ? 'true' : 'false'
    };
    try {
        const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_saved'), background: '#1e293b', color: '#fff' });
    } catch(err) {}
});

// Збереження Online Settings
document.getElementById('app-online-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { 
        show_online: document.getElementById('a-show-online').checked ? 'true' : 'false',
        max_online: document.getElementById('a-max-online').value,
        mc_version: document.getElementById('a-mc-version').value
    };
    try {
        const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_saved'), background: '#1e293b', color: '#fff' });
    } catch(err) {}
});

// Збереження Footer Settings
document.getElementById('app-footer-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { 
        contact_email: document.getElementById('a-contact-email').value,
        terms_text: document.getElementById('a-terms-text').value
    };
    try {
        const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_saved'), background: '#1e293b', color: '#fff' });
    } catch(err) {}
});

// Збереження Бази Даних
document.getElementById('db-config-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dbUrl = document.getElementById('s-db-url').value;
    try {
        const res = await fetch('/api/admin/db_config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ db_url: dbUrl }) });
        await handleResponseError(res);
        const data = await res.json();
        Swal.fire({ icon: 'success', title: 'Saved!', text: data.message, background: '#1e293b', color: '#fff' });
    } catch(err) {}
});

async function saveDeliveryMethod(method) {
    try {
        const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delivery_method: method }) });
        await handleResponseError(res);
        updateDeliveryUI(method);
        Swal.fire({ toast: true, position: 'top-end', title: t('msg_method_changed'), icon: 'success', timer: 2000, showConfirmButton: false, background: '#1e293b', color: '#fff' });
    } catch(err) {}
}

function updateDeliveryUI(method) {
    const rconBtn = document.getElementById('btn-rcon');
    const pluginBtn = document.getElementById('btn-plugin');
    const rconForm = document.getElementById('rcon-settings-form');
    const pluginBox = document.getElementById('plugin-settings-container');
    const titleText = document.getElementById('delivery-title');

    const activeClass = "p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-600/10 text-white font-bold transition-all transform scale-105";
    const inactiveClass = "p-4 rounded-2xl border-2 border-slate-800 text-slate-400 font-bold transition-all hover:border-slate-600";
    
    if (method === 'rcon') { 
        rconBtn.className = activeClass; pluginBtn.className = inactiveClass;
        rconForm.classList.remove('hidden'); pluginBox.classList.add('hidden');
        titleText.innerHTML = t('set_rcon');
    } else { 
        pluginBtn.className = activeClass; rconBtn.className = inactiveClass;
        rconForm.classList.add('hidden'); pluginBox.classList.remove('hidden');
        titleText.innerHTML = t('set_plugin');
    }
}

document.getElementById('rcon-settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { rcon_ip: document.getElementById('s-rcon-ip').value, rcon_port: document.getElementById('s-rcon-port').value, rcon_password: document.getElementById('s-rcon-password').value };
    try {
        const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_saved'), background: '#1e293b', color: '#fff' });
    } catch(err) {}
});

async function saveDSSettings() {
    const data = { 
        discord_enabled: document.getElementById('ds-toggle').checked ? 'true' : 'false', 
        discord_webhook: document.getElementById('ds-webhook').value, 
        discord_name: document.getElementById('ds-name').value, 
        discord_color: document.getElementById('ds-color').value,
        discord_title: document.getElementById('ds-title').value,
        discord_desc: document.getElementById('ds-desc').value
    };
    try {
        const res = await fetch('/api/admin/settings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_saved'), background: '#1e293b', color: '#fff' });
    } catch(err) {}
}

// --- КАТЕГОРІЇ ---
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const cats = await res.json();
        
        const container = document.getElementById('categories-tags');
        container.innerHTML = cats.map(c => `
            <div class="bg-indigo-600/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-3 text-sm text-indigo-300 font-medium">
                ${c.name}
                <button onclick="deleteCategory(${c.id})" class="text-indigo-400 hover:text-rose-400 transition-colors"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
        `).join('');
        
        const options = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        const defaultOption = `<option value="">${t('cat_none')}</option>`;
        document.getElementById('p-category').innerHTML = defaultOption + options;
        document.getElementById('e-category').innerHTML = defaultOption + options;
        
        lucide.createIcons();
    } catch (e) { console.error(e); }
}

async function addCategory() {
    const name = document.getElementById('new-cat-name').value.trim();
    if(!name) return;
    try {
        const res = await fetch('/api/admin/categories', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name })
        });
        await handleResponseError(res);
        document.getElementById('new-cat-name').value = '';
        loadCategories();
    } catch(err) {}
}

async function deleteCategory(id) {
    const confirmDelete = await Swal.fire({
        title: t('alert_del_cat'), text: t('alert_cat_warn'), icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', cancelButtonColor: '#334155', confirmButtonText: t('alert_yes'), cancelButtonText: t('alert_cancel'), background: '#0f172a', color: '#fff'
    });
    if (confirmDelete.isConfirmed) {
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            await handleResponseError(res);
            loadCategories(); loadProducts();
            Swal.fire({ toast: true, position: 'top-end', title: t('msg_deleted'), icon: 'success', timer: 2000, showConfirmButton: false, background: '#1e293b', color: '#fff' });
        } catch(err) {}
    }
}

// --- ТОВАРИ ---
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        adminProducts = await res.json();
        document.getElementById('admin-products-list').innerHTML = adminProducts.map(p => {
            const priceHtml = p.discount_price ? `<span class="line-through text-slate-500 text-xs">${p.price} ₴</span><br><span class="text-emerald-400 font-bold">${p.discount_price} ₴</span>` : `<span class="text-indigo-400 font-bold">${p.price} ₴</span>`;
            return `
            <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="px-8 py-4"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center p-2"><img src="${p.icon_url}" class="max-h-full object-contain"></div><div><p class="font-bold text-white text-lg">${p.name}</p><p class="text-xs text-slate-500">ID: ${p.id}</p></div></div></td>
                <td class="px-8 py-4"><p class="text-xs text-emerald-500/70 font-mono bg-emerald-500/10 inline-block px-2 py-1 rounded">${p.command}</p></td>
                <td class="px-8 py-4 text-xl">${priceHtml}</td>
                <td class="px-8 py-4 text-right"><div class="flex justify-end gap-2"><button onclick="openEditModal(${p.id})" class="p-3 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"><i data-lucide="edit" class="w-5 h-5"></i></button><button onclick="deleteProduct(${p.id})" class="p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"><i data-lucide="trash-2" class="w-5 h-5"></i></button></div></td>
            </tr>
            `;
        }).join('');

        document.getElementById('test-products-container').innerHTML = adminProducts.map(p => `
            <div class="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col items-center text-center hover:border-indigo-500 transition-colors">
                <img src="${p.icon_url}" class="w-20 h-20 object-contain mb-4">
                <h3 class="text-lg font-bold text-white mb-2">${p.name}</h3>
                <p class="text-xs text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded mb-6 w-full truncate">${p.command}</p>
                <button onclick="openTestModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-bold transition-colors">${t('btn_issue_test')}</button>
            </div>
        `).join('');
        lucide.createIcons();
    } catch (e) { console.error(e); }
}

document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const catVal = document.getElementById('p-category').value;
    const payload = {
        name: document.getElementById('p-name').value, description: document.getElementById('p-desc').value,
        price: parseFloat(document.getElementById('p-price').value), command: document.getElementById('p-cmd').value, icon_url: document.getElementById('p-icon').value,
        category_id: catVal ? parseInt(catVal) : null
    };
    try {
        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_success'), text: t('msg_prod_created'), background: '#1e293b', color: '#fff' });
        document.getElementById('add-product-form').reset();
        document.getElementById('upload-preview').classList.add('hidden');
        document.getElementById('file-label').textContent = t('btn_upload');
        document.getElementById('p-icon').value = "/static/uploads/default.png";
        loadProducts();
    } catch(err) {}
});

function openEditModal(id) {
    const p = adminProducts.find(x => x.id === id);
    if(!p) return;
    document.getElementById('e-id').value = p.id; document.getElementById('e-name').value = p.name; document.getElementById('e-price').value = p.price;
    document.getElementById('e-discount').value = p.discount_price || ''; document.getElementById('e-cmd').value = p.command; document.getElementById('e-desc').value = p.description;
    document.getElementById('e-icon').value = p.icon_url; document.getElementById('e-preview-img').src = p.icon_url;
    document.getElementById('e-category').value = p.category_id || '';
    document.getElementById('e-upload-preview').classList.remove('hidden'); document.getElementById('e-upload-preview').classList.add('flex');
    document.getElementById('e-file-label').textContent = t('btn_change_img');
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() { document.getElementById('edit-modal').classList.add('hidden'); }

document.getElementById('edit-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('e-id').value;
    const discountVal = document.getElementById('e-discount').value;
    const catVal = document.getElementById('e-category').value;
    const payload = {
        name: document.getElementById('e-name').value, description: document.getElementById('e-desc').value,
        price: parseFloat(document.getElementById('e-price').value), discount_price: discountVal ? parseFloat(discountVal) : null,
        command: document.getElementById('e-cmd').value, icon_url: document.getElementById('e-icon').value,
        category_id: catVal ? parseInt(catVal) : null
    };
    try {
        const res = await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: t('msg_saved'), text: t('msg_prod_updated'), background: '#1e293b', color: '#fff' });
        closeEditModal(); loadProducts();
    } catch(err) {}
});

async function deleteProduct(id) {
    const confirmDelete = await Swal.fire({
        title: t('alert_del_title'), text: t('alert_del_text'), icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', cancelButtonColor: '#334155', confirmButtonText: t('alert_yes'), cancelButtonText: t('alert_cancel'), background: '#0f172a', color: '#fff'
    });
    if (confirmDelete.isConfirmed) {
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            await handleResponseError(res);
            loadProducts();
            Swal.fire({ toast: true, position: 'top-end', title: t('msg_deleted'), icon: 'success', timer: 2000, showConfirmButton: false, background: '#1e293b', color: '#fff' });
        } catch(err) {}
    }
}

// --- ПРОМОКОДИ ---
async function loadPromos() {
    try {
        const res = await fetch('/api/admin/promocodes');
        const promos = await res.json();
        document.getElementById('promo-list').innerHTML = promos.map(p => {
            const dateText = p.expires_at ? new Date(p.expires_at).toLocaleString() : t('promo_unlimited');
            const usesText = p.max_uses > 0 ? `${p.uses} / ${p.max_uses}` : `${p.uses} / ∞`;
            return `
            <div class="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center relative overflow-hidden group">
                <div>
                    <div class="font-bold text-indigo-400 text-xl font-mono">${p.code}</div>
                    <div class="text-sm text-slate-400 mt-1">${t('promo_discount')}: <span class="text-emerald-400 font-bold">${p.discount_percent}%</span></div>
                    <div class="text-xs text-slate-500 mt-2">${t('promo_used')}: ${usesText}</div>
                    <div class="text-xs text-slate-500">${t('promo_expires')}: ${dateText}</div>
                </div>
                <div class="flex flex-col gap-2 items-end z-10">
                    <div class="w-3 h-3 rounded-full ${p.is_active ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'} mb-2"></div>
                    <button onclick="deletePromo(${p.id})" class="text-rose-500 hover:bg-rose-500/20 p-2 rounded-lg transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>`;
        }).join('');
        lucide.createIcons();
    } catch(e) { console.error(e); }
}

document.getElementById('add-promo-form').onsubmit = async (e) => {
    e.preventDefault();
    let expireVal = document.getElementById('promo-date').value;
    if(expireVal) { expireVal = new Date(expireVal).toISOString(); } else { expireVal = null; }
    const data = { code: document.getElementById('promo-code').value.toUpperCase(), discount_percent: parseInt(document.getElementById('promo-percent').value), max_uses: parseInt(document.getElementById('promo-limit').value) || 0, expires_at: expireVal };
    try {
        const res = await fetch('/api/admin/promocodes', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
        await handleResponseError(res);
        document.getElementById('add-promo-form').reset(); loadPromos();
        Swal.fire({icon: 'success', title: t('msg_success'), text: t('msg_promo_created'), background: '#1e293b', color: '#fff'});
    } catch(err) {}
};

async function deletePromo(id) {
    const confirmDelete = await Swal.fire({ title: t('alert_del_title'), text: t('alert_del_text'), icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#334155', confirmButtonText: t('alert_yes'), cancelButtonText: t('alert_cancel'), background: '#0f172a', color: '#fff' });
    if (confirmDelete.isConfirmed) { 
        try {
            const res = await fetch(`/api/admin/promocodes/${id}`, { method: 'DELETE' }); 
            await handleResponseError(res);
            loadPromos(); 
        } catch(err) {}
    }
}

// --- ТЕСТ ВИДАЧІ ---
async function openTestModal(productId, productName) {
    const { value: nickname } = await Swal.fire({ title: `${t('test_modal_title')} ${productName}`, input: 'text', inputLabel: t('test_ph_nick'), inputPlaceholder: 'Steve', showCancelButton: true, confirmButtonText: t('btn_send'), cancelButtonText: t('alert_cancel'), background: '#0f172a', color: '#fff', confirmButtonColor: '#4f46e5' });
    if (nickname) {
        try {
            const res = await fetch('/api/admin/test_delivery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player_name: nickname, product_id: productId }) });
            await handleResponseError(res);
            const result = await res.json();
            Swal.fire({ icon: 'success', title: t('msg_success'), text: result.message, background: '#0f172a', color: '#fff' }); loadStats(); 
        } catch(err) {}
    }
}

// --- НАЛАШТУВАННЯ ЗАХИСТУ ---
async function loadSecuritySettings() {
    try {
        const res = await fetch('/api/admin/security/status');
        if (res.ok) {
            const data = await res.json();
            const toggle = document.getElementById('sec-csrf-toggle');
            if (toggle) toggle.checked = data.csrf_enabled;
        }
    } catch(e) { console.error(e); }
}

async function saveSecuritySettings() {
    const toggle = document.getElementById('sec-csrf-toggle');
    if (!toggle) return;
    const isEnabled = toggle.checked;
    try {
        const res = await fetch('/api/admin/security/csrf', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ enabled: isEnabled }) 
        });
        await handleResponseError(res);
        Swal.fire({ toast: true, position: 'top-end', title: t('msg_saved'), icon: 'success', timer: 2000, showConfirmButton: false, background: '#1e293b', color: '#fff' });
    } catch(e) {
        toggle.checked = !isEnabled;
    }
}

document.getElementById('form-credentials')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUser = document.getElementById('new-admin-user').value;
    const newPass = document.getElementById('new-admin-pass').value;
    
    try {
        const res = await fetch('/api/admin/security/credentials', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: newUser, password: newPass })
        });
        await handleResponseError(res);
        Swal.fire({ icon: 'success', title: 'Успіх!', text: t('msg_creds_saved'), background: '#1e293b', color: '#fff' });
        document.getElementById('form-credentials').reset();
    } catch(e) {}
});