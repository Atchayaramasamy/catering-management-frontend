document.addEventListener('DOMContentLoaded', () => {
    const menuList = document.getElementById('menuList').getElementsByTagName('tbody')[0];
    const cartList = document.getElementById('cartList').getElementsByTagName('tbody')[0];
    const orderForm = document.getElementById('orderForm');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    const billSection = document.getElementById('bill');
    const orderDetailsSection = document.getElementById('orderDetails');
    const billDetails = document.getElementById('billDetails');
    const errorMessage = document.getElementById('errorMessage');  // Ensure this element exists in your HTML

    let cart = [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));


// Log currentUser to debug
console.log('currentUser:', currentUser);


    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }

    fetch('http://localhost:8081/api/menus/getAll')
        .then(response => response.json())
        .then(menuItems => {
            console.log('Menu items:', menuItems);

            menuItems.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.foodId}</td>
                    <td>${item.foodName}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td><button class="addToCartBtn" data-id="food-${item.foodId}" data-name="${item.foodName}" data-price="${item.price}">Add to Cart</button></td>
                `;
                menuList.appendChild(row);
            });
        })
        .catch(error => console.error('Fetch error:', error));
  
        menuList.addEventListener('click', (event) => {
            if (event.target.classList.contains('addToCartBtn')) {
                const row = event.target.closest('tr');
                const foodId = event.target.dataset.id;  // Changed to use dataset
                const foodName = event.target.dataset.name;  // Changed to use dataset
                const foodPrice = parseFloat(event.target.dataset.price);  // Changed to use dataset
                addToCart(foodId, foodName, foodPrice);
            }
        });

    confirmOrderBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            errorMessage.textContent = 'The cart is empty! Please add any product.';
            return;
        }
        orderDetailsSection.classList.remove('hidden');
        confirmOrderBtn.classList.add('hidden');
    });
    

    orderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const deliveryDate = document.getElementById('deliveryDate').value;
        const deliveryLocation = document.getElementById('deliveryLocation').value;

        if (!deliveryDate || !deliveryLocation || cart.length === 0) {
            errorMessage.textContent = 'Please fill out all fields and add at least one item to the cart.';
            return;
        }

        const order = {
            user: { userId: currentUser.userId },
            deliveryLocation,
            deliveryDate,
            orderStatus: 'PENDING',
            modifiedAt: new Date().toISOString(),
            modifiedBy: currentUser.userName,
            orderDetails: cart.map(item => ({
                menu: { foodId: item.foodId.replace('food-', '') },  // Remove "food-" prefix
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.quantity * item.price
            }))
        };

        console.log('Order to be sent:', JSON.stringify(order, null, 2));  // Added JSON.stringify for clarity

        fetch('http://localhost:8081/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(order => {
            generateBill(order);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            errorMessage.textContent = 'An error occurred while creating the order.';
        });
    });
    function addToCart(foodId, foodName, price) {
        const existingItem = cart.find(item => item.foodId === foodId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ foodId, foodName, price: price, quantity: 1 });
        }
        updateCart();
    }

    function updateCart() {
        cartList.innerHTML = '';
        cart.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.foodName}</td>
                <td>
                    <button class="decrementBtn" data-id="${item.foodId}">-</button>
                    <input type="text" class="quantityBox" data-id="${item.foodId}" value="${item.quantity}">
                    <button class="incrementBtn" data-id="${item.foodId}">+</button>
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.quantity * item.price).toFixed(2)}</td>
                <td><button class="removeFromCartBtn" data-id="${item.foodId}">Remove</button></td>
            `;
            cartList.appendChild(row);
        });
    }

    function generateBill(order) {
        if (!order || !order.user) {
            console.error('Order or user information is missing.');
            return;
        }

        orderDetailsSection.classList.add('hidden');
        billSection.classList.remove('hidden');
        billDetails.innerHTML = `
            <h3>Order ID: ${order.orderId}</h3>
            <h3>Customer: ${order.user.userName || 'N/A'}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Food Item</th>
                        <th>Quantity</th>
                        <th>Unit Price ($)</th>
                        <th>Total ($)</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderDetails.map(detail => `
                        <tr>
                            <td>${detail.menu.foodName}</td>
                            <td>${detail.quantity}</td>
                            <td>${detail.price.toFixed(2)}</td>
                            <td>${detail.totalPrice.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <h3>Total Amount: $${order.totalAmount.toFixed(2)}</h3>
        `;
    }

    function fetchOrderDetails(orderId, userId) {
        fetch(`http://localhost:8081/api/orders/${orderId}?userId=${userId}`)
            .then(response => response.json())
            .then(order => {
                if (order) {
                    generateBill(order);
                } else {
                    throw new Error('Order not found.');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                errorMessage.textContent = 'An error occurred while fetching the order details.';
            });
        }
         
    
    function removeFromCart(foodId) {
        cart = cart.filter(item => item.foodId !== foodId);
        updateCart();
    }
    cartList.addEventListener('click', (event) => {
        if (event.target.classList.contains('removeFromCartBtn')) {
            const foodId = event.target.getAttribute('data-id');
            cart = cart.filter(item => item.foodId !== foodId);
            updateCart();
        } else if (event.target.classList.contains('incrementBtn')) {
            const foodId = event.target.getAttribute('data-id');
            const item = cart.find(item => item.foodId === foodId);
            if (item) {
                item.quantity++;
                updateCart();
            }
        } else if (event.target.classList.contains('decrementBtn')) {
            const foodId = event.target.getAttribute('data-id');
            const item = cart.find(item => item.foodId === foodId);
            if (item && item.quantity > 1) {
                item.quantity--;
                updateCart();
            }
        }});

    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Clear user information from local storage
        localStorage.removeItem('currentUser');

        // Redirect to the login page
        window.location.href = 'login.html';
    });
});