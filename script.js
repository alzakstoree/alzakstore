// بيانات الألعاب مع التقييمات
const gamesData = {
    pubg: [
        { name: '60 UC', price: '0.99', badge: 'أساسي', icon: 'fa-coins', rating: 4.5, reviews: 128 },
        { name: '300 UC + 25', price: '4.99', badge: 'شائع', icon: 'fa-gem', rating: 4.7, reviews: 256 },
        { name: '600 UC + 60', price: '9.99', badge: 'الأكثر', icon: 'fa-crown', rating: 4.9, reviews: 512 },
        { name: '1500 UC + 300', price: '24.99', badge: 'VIP', icon: 'fa-crown', rating: 4.8, reviews: 128 },
        { name: '3000 UC + 850', price: '49.99', badge: 'VIP+', icon: 'fa-crown', rating: 4.9, reviews: 64 },
        { name: '6000 UC + 2000', price: '99.99', badge: 'ذهبية', icon: 'fa-crown', rating: 5.0, reviews: 32 }
    ],
    freefire: [
        { name: '100 دايموند', price: '0.99', badge: 'أساسي', icon: 'fa-gem', rating: 4.4, reviews: 96 },
        { name: '310 دايموند + 10', price: '2.99', badge: 'شائع', icon: 'fa-gem', rating: 4.6, reviews: 184 },
        { name: '520 دايموند + 30', price: '4.99', badge: 'شائع', icon: 'fa-gem', rating: 4.7, reviews: 223 },
        { name: '1060 دايموند + 120', price: '9.99', badge: 'الأكثر', icon: 'fa-crown', rating: 4.8, reviews: 445 },
        { name: '2180 دايموند + 320', price: '19.99', badge: 'VIP', icon: 'fa-crown', rating: 4.8, reviews: 167 }
    ]
};

// الكوبونات
const coupons = {
    'WELCOME10': 10,
    'SAVE20': 20,
    'VIP50': 50
};

// كلمة سر المدير
const ADMIN_PASSWORD = '1234';

let currentGame = {};
let currentDiscount = 0;
let lastPlayerId = localStorage.getItem('lastPlayerId') || '';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// تحميل الصفحة
window.onload = function() {
    loadPacks();
    updateAdminPanel();
    updateCartBadge();
    startCountdown();
    document.getElementById('playerId').value = lastPlayerId;
    showToast('✨ مرحباً بك في ALZAK STORE');
};

// تحميل الباقات
function loadPacks() {
    for (let game in gamesData) {
        const container = document.getElementById(`${game}PacksGrid`);
        if (!container) continue;
        
        container.innerHTML = '';
        gamesData[game].forEach(pack => {
            container.innerHTML += `
                <div class="pack-card">
                    <span class="pack-badge">${pack.badge}</span>
                    <div class="pack-icon"><i class="fas ${pack.icon}"></i></div>
                    <div class="pack-name">${pack.name}</div>
                    <div class="pack-price">$${pack.price}</div>
                    <button class="buy-btn" onclick="openPurchaseModal('${gameName(game)}', '${pack.name}', '${pack.price}')">
                        <i class="fas fa-shopping-cart"></i> اشتري
                    </button>
                </div>
            `;
        });
    }
}

// اسم اللعبة
function gameName(game) {
    return game === 'pubg' ? 'PUBG Mobile' : 'Free Fire';
}

// إظهار الباقات
function showPacks(game) {
    hideAllPacks();
    document.getElementById(game + 'Packs').classList.add('show');
}

// إخفاء الباقات
function hidePacks(game) {
    document.getElementById(game + 'Packs').classList.remove('show');
}

function hideAllPacks() {
    document.querySelectorAll('.packs-section').forEach(s => s.classList.remove('show'));
}

// فلترة
function filterGames(game, element) {
    document.querySelectorAll('.cat').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    hideAllPacks();
}

// فتح نافذة الشراء
function openPurchaseModal(game, pack, price) {
    showLoading();
    setTimeout(() => {
        currentGame = { game, pack, price };
        currentDiscount = 0;
        document.getElementById('modalGameName').textContent = game;
        document.getElementById('modalGamePack').textContent = pack;
        document.getElementById('modalGamePrice').textContent = price;
        document.getElementById('finalPrice').textContent = price;
        document.getElementById('playerId').value = localStorage.getItem('lastPlayerId') || '';
        document.getElementById('couponCode').value = '';
        document.getElementById('progressFill').style.width = '25%';
        document.getElementById('purchaseModal').classList.add('show');
        hideLoading();
    }, 500);
}

// إغلاق النافذة
function closeModal() {
    document.getElementById('purchaseModal').classList.remove('show');
}

// تطبيق الكوبون
function applyCoupon() {
    const code = document.getElementById('couponCode').value.toUpperCase().trim();
    
    if (coupons[code]) {
        currentDiscount = coupons[code];
        showToast(`🎉 تم تطبيق خصم ${currentDiscount}%`);
        playSuccessSound('success');
    } else {
        showToast('❌ كوبون غير صالح', 'error');
    }
}

// نسخ النص
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ تم النسخ إلى الحافظة');
        playSuccessSound('success');
    }).catch(() => {
        showToast('❌ فشل النسخ', 'error');
    });
}

// إرسال واتساب
function sendToWhatsApp() {
    const playerId = document.getElementById('playerId').value.trim();
    
    if (!playerId) {
        showToast('❌ أدخل معرف اللعبة أولاً', 'error');
        return;
    }

    const message = `🛍️ طلب جديد من ALZAK STORE
اللعبة: ${currentGame.game}
الباقة: ${currentGame.pack}
معرف اللعبة: ${playerId}
المبلغ: $${currentGame.price}`;

    window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(message)}`, '_blank');
    
    document.getElementById('progressFill').style.width = '75%';
    saveOrder();
    showToast('✅ تم فتح واتساب، أرسل الإيصال');
    playSuccessSound('success');
}

// تأكيد الطلب
function confirmOrder() {
    const playerId = document.getElementById('playerId').value.trim();
    
    if (!playerId) {
        showToast('❌ أدخل معرف اللعبة أولاً', 'error');
        return;
    }

    localStorage.setItem('lastPlayerId', playerId);
    showLoading();
    
    setTimeout(() => {
        saveOrder();
        document.getElementById('progressFill').style.width = '100%';
        showToast('✅ تم حفظ الطلب بنجاح');
        playSuccessSound('success');
        hideLoading();
        
        setTimeout(() => {
            closeModal();
            document.getElementById('progressFill').style.width = '0%';
        }, 1500);
    }, 1000);
}

// حفظ الطلب
function saveOrder() {
    const playerId = document.getElementById('playerId').value.trim();
    
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        ...currentGame,
        playerId: playerId,
        date: new Date().toLocaleString(),
        status: 'pending'
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    updateCartBadge();
    updateAdminPanel();
}

// تحديث عداد السلة
function updateCartBadge() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = orders.length;
}

// عرض طلباتي
function showMyOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const myOrdersList = document.getElementById('myOrdersList');
    
    if (orders.length === 0) {
        myOrdersList.innerHTML = '<p style="text-align: center; color: #666;">لا توجد طلبات سابقة</p>';
    } else {
        myOrdersList.innerHTML = orders.slice(-5).reverse().map(o => `
            <div style="background: #1a1a1a; border-radius: 15px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #fbbf24;">${o.game}</span>
                    <span class="status ${o.status}">${o.status === 'pending' ? '⏳ قيد الانتظار' : '✅ مكتمل'}</span>
                </div>
                <div>الباقة: ${o.pack}</div>
                <div>المعرف: ${o.playerId}</div>
                <div>المبلغ: $${o.price}</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">${o.date}</div>
            </div>
        `).join('');
    }
    
    document.getElementById('myOrdersModal').classList.add('show');
}

function closeMyOrders() {
    document.getElementById('myOrdersModal').classList.remove('show');
}

// تحديث لوحة المدير
function updateAdminPanel() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'pending').length;
    
    const total = orders.reduce((sum, o) => sum + parseFloat(o.price), 0);
    document.getElementById('totalRevenue').textContent = '$' + total.toFixed(2);

    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.date).toDateString() === today).length;
    document.getElementById('todayOrders').textContent = todayOrders;

    const ordersList = document.getElementById('ordersList');
    if (ordersList) {
        ordersList.innerHTML = orders.slice(-5).reverse().map(o => `
            <div class="order-row" onclick="markAsCompleted('${o.date}')" style="cursor: pointer;">
                <span>${o.game}</span>
                <span>${o.pack}</span>
                <span>${o.playerId}</span>
                <span>$${o.price}</span>
                <span class="status ${o.status}">${o.status === 'pending' ? '⏳' : '✅'}</span>
            </div>
        `).join('');
    }
}

// تحديث حالة الطلب
function markAsCompleted(date) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o.date === date);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = orders[orderIndex].status === 'pending' ? 'completed' : 'pending';
        localStorage.setItem('orders', JSON.stringify(orders));
        updateAdminPanel();
        showToast('✅ تم تحديث حالة الطلب');
    }
}

// دوال المدير
function showAdminLogin() {
    document.getElementById('adminLogin').classList.add('show');
}

function closeAdminLogin() {
    document.getElementById('adminLogin').classList.remove('show');
    document.getElementById('adminPassword').value = '';
}

function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        closeAdminLogin();
        document.getElementById('adminPanel').classList.toggle('show');
        showToast('✅ مرحباً بالمدير');
    } else {
        showToast('❌ كلمة سر خطأ', 'error');
    }
}

// تبديل الثيم
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.querySelector('.admin-btn i');
    if (document.body.classList.contains('light-mode')) {
        icon.className = 'fas fa-sun';
        showToast('🌞 الوضع النهاري');
    } else {
        icon.className = 'fas fa-moon';
        showToast('🌙 الوضع الليلي');
    }
}

// مؤشر التحميل
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// عداد تنازلي
function startCountdown() {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    
    function updateCountdown() {
        const now = new Date();
        const diff = endTime - now;
        
        if (diff <= 0) {
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// صوت الإشعار
function playSuccessSound(type = 'success') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch(e) {
        console.log('Audio not supported');
    }
}

// إشعارات
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}