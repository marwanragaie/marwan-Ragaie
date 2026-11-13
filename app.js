document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // --- Tab Navigation ---
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const views = document.querySelectorAll('.app-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.dataset.target;
            
            views.forEach(v => v.classList.remove('active-view'));
            document.getElementById(targetId)?.classList.add('active-view');

            navItems.forEach(n => n.classList.remove('active'));
            document.querySelectorAll(`[data-target="${targetId}"]`).forEach(n => n.classList.add('active'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // --- Address Selector ---
    const addressTrigger = document.getElementById('address-trigger');
    const addressModal = document.getElementById('address-modal');
    const closeAddressModal = document.getElementById('close-address-modal');
    const currentAddressEl = document.getElementById('current-address');
    
    const savedAddr = localStorage.getItem('bytestore_addr') || 'Campus Dorms, Bldg B';
    if(currentAddressEl) currentAddressEl.textContent = savedAddr;

    addressTrigger?.addEventListener('click', () => addressModal.classList.add('open'));
    closeAddressModal?.addEventListener('click', () => addressModal.classList.remove('open'));

    document.querySelectorAll('.address-option').forEach(opt => {
        if(opt.dataset.address === savedAddr) opt.classList.add('selected');
        opt.addEventListener('click', () => {
            document.querySelectorAll('.address-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            const newAddr = opt.dataset.address;
            localStorage.setItem('bytestore_addr', newAddr);
            if(currentAddressEl) currentAddressEl.textContent = newAddr;
            addressModal.classList.remove('open');
            showToast('Delivery location updated!');
        });
    });

    // --- Copy Promo Code ---
    document.querySelectorAll('.promo-badge').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.dataset.code || 'ICA-2330';
            navigator.clipboard?.writeText(code);
            btn.classList.add('copied');
            btn.textContent = 'COPIED! ✓';
            showToast(`Promo code ${code} copied!`);
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.textContent = `CODE: ${code}`;
            }, 2000);
        });
    });

    // --- Cart & Checkout Flow ---
    let cart = JSON.parse(localStorage.getItem('bytestore_cart')) || [];
    const cartModal = document.getElementById('cart-modal');
    const closeCartModal = document.getElementById('close-cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModal = document.getElementById('close-checkout-modal');
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
    const checkoutForm = document.getElementById('checkout-form');
    
    const ordersTriggers = document.querySelectorAll('#orders-nav-trigger');
    const cartBadges = document.querySelectorAll('.cart-badge');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');

    function updateCart() {
        localStorage.setItem('bytestore_cart', JSON.stringify(cart));
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        
        cartBadges.forEach(b => {
            b.textContent = totalQty;
            b.classList.toggle('visible', totalQty > 0);
        });

        if(!cartItemsContainer) return;
        if(cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:#7b7b82; padding:20px;">Your cart is empty.</p>';
            cartTotalAmount.textContent = 'EGP 0';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = cart.map((item, idx) => {
            total += item.price * item.qty;
            return `
                <div class="cart-item-row">
                    <div>
                        <h4 style="font-size:14px; font-weight:700;">${item.name}</h4>
                        <span style="font-size:12px; color:#2c62db;">EGP ${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQty(${idx}, -1)">-</button>
                        <span style="font-weight:700; font-size:13px;">${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
                    </div>
                </div>
            `;
        }).join('');
        cartTotalAmount.textContent = `EGP ${total.toLocaleString()}`;
    }

    window.changeQty = (index, delta) => {
        cart[index].qty += delta;
        if(cart[index].qty <= 0) cart.splice(index, 1);
        updateCart();
    };

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            const found = cart.find(i => i.name === name);
            if(found) found.qty += 1;
            else cart.push({ name, price, qty: 1 });
            updateCart();
            showToast(`Added ${name} to cart`);
        });
    });

    ordersTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            updateCart();
            cartModal.classList.add('open');
        });
    });

    closeCartModal?.addEventListener('click', () => cartModal.classList.remove('open'));
    closeCheckoutModal?.addEventListener('click', () => checkoutModal.classList.remove('open'));

    proceedCheckoutBtn?.addEventListener('click', () => {
        if(cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }
        cartModal.classList.remove('open');
        checkoutModal.classList.add('open');
    });

    checkoutForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        cart = [];
        updateCart();
        checkoutModal.classList.remove('open');
        showToast('Order placed successfully! Delivering soon 🚀');
    });

    function showToast(msg) {
        let t = document.getElementById('toast');
        if(!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2200);
    }

    updateCart();
});