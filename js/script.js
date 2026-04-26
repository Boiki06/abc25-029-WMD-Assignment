 /* Check whether browser supports localStorage */
if (typeof(Storage) === "undefined") {
  alert("Sorry, your browser does not support localStorage. Please use a modern browser.");
}


/* Quantity helpers for products and bookings */
function changeQty(qtyId, totalId, price, delta = 1){
  let input = document.getElementById(qtyId);
  if(!input) return;

  let val = parseFloat(input.value) || 1;
  val += delta;
  if(val < 1) val = 1;

  if(input.type === "number" && input.step && parseFloat(input.step) >= 1){
    val = Math.round(val);
  }

  input.value = val;
  updateTotal(qtyId, totalId, price);
}

function decreaseQty(qtyId, totalId, price){
  changeQty(qtyId, totalId, price, -1);
}

function updateTotal(qtyId, totalId, price){
  let qty = parseFloat(document.getElementById(qtyId).value) || 1;
  document.getElementById(totalId).innerText =
    "Total: BWP " + (qty * price).toFixed(2);
}


function updateWeightPrice(sizeId, totalId, pricePerKg){
  let weight = parseFloat(document.getElementById(sizeId).value) || 0;
  let total = weight * pricePerKg;

  document.getElementById(totalId).innerText =
    "Total: BWP " + total.toFixed(2);
}

/* Cart storage helpers using localStorage */
function getCart(){
  try {
    let stored = JSON.parse(localStorage.getItem("cart"));
    return Array.isArray(stored) ? stored : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}


function addToCart(name, price, quantity, type="product"){
  quantity = parseFloat(quantity) || 1;

  let cart = getCart();

  let existing = cart.find(item => item.name === name && item.type === type);

  if(existing){
    existing.quantity += quantity;
    existing.total = existing.quantity * existing.price;
  } else {
    cart.push({
      name,
      price,
      quantity,
      total: price * quantity,
      type
    });
  }

  saveCart(cart);
  updateCartCount();
}


function updateCartCount(){
  let cart = getCart();
  let count = cart.reduce((sum, i) => sum + Number(i.quantity), 0);

  let el = document.getElementById("cart-count");
  if(el) el.innerText = count;
}


function removeItem(index){
  let cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  displayCart();
  updateCartCount();
}


function updateItemQty(index, change){
  let cart = getCart();
  let item = cart[index];

  let step = (item.type === "kg") ? 0.5 : 1;

  item.quantity += change * step;

  if(item.quantity <= 0){
    cart.splice(index, 1);
  } else {
    item.total = item.quantity * item.price;
  }

  saveCart(cart);
  displayCart();
  updateCartCount();
}

function clearCart(){
  localStorage.removeItem("cart");
  displayCart();
  updateCartCount();
}

function checkout(){
  window.location.href = "checkout.html";
}

function getOrders(){
  try {
    let stored = JSON.parse(localStorage.getItem("orders"));
    return Array.isArray(stored) ? stored : [];
  } catch (e) {
    return [];
  }
}

/* Order and user storage helpers */
function saveOrders(orders){
  localStorage.setItem("orders", JSON.stringify(orders));
}

function getUsers(){
  try {
    let stored = JSON.parse(localStorage.getItem("users"));
    return Array.isArray(stored) ? stored : [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser(){
  try {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user){
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function clearCurrentUser(){
  localStorage.removeItem("currentUser");
}

function getUserLabel(user){
  if(!user) return "Guest";
  return user.name || user.email || user.phone || "Guest";
}

function registerUser(event){
  if(event) event.preventDefault();
  let name = document.getElementById("signupName").value.trim();
  let email = document.getElementById("signupEmail").value.trim().toLowerCase();
  let phone = document.getElementById("signupPhone").value.trim();
  if(phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)){
    alert("Please enter a valid phone number.");
    return;
  }
  let password = document.getElementById("signupPassword").value;
  let confirmPassword = document.getElementById("signupConfirmPassword").value;

  if(!name){ alert("Please enter your full name."); return; }
  if(!email && !phone){ alert("Please enter either an email or phone number."); return; }
  if(password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)){
    alert("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    return;
  }
  if(password !== confirmPassword){ alert("Passwords do not match."); return; }

  let users = getUsers();
  let exists = users.find(u => (email && u.email === email) || (phone && u.phone === phone));
  if(exists){ alert("A user with that email or phone already exists."); return; }

  let user = {
    id: Date.now(),
    name,
    email,
    phone,
    password,
    addresses: [],
    defaultAddress: null,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers(users);
  setCurrentUser(user);
  alert("Signup successful. Welcome, " + name + "!");
  window.location.href = "account.html";
}

function loginUser(event){
  if(event) event.preventDefault();
  let identifier = document.getElementById("loginIdentifier").value.trim().toLowerCase();
  let password = document.getElementById("loginPassword").value;

  if(!identifier || !password){ alert("Enter email/phone and password."); return; }

  let users = getUsers();
  let user = users.find(u => (u.email && u.email === identifier) || (u.phone && u.phone === identifier));
  if(!user || user.password !== password){ alert("Invalid login credentials."); return; }

  setCurrentUser(user);
  alert("Welcome back, " + user.name + "!");
  window.location.href = "account.html";
}

function logoutUser(){
  clearCurrentUser();
  alert("You have been logged out.");
  window.location.href = "index.html";
}

function updateUserProfile(event){
  if(event) event.preventDefault();
  let user = getCurrentUser();
  if(!user){ alert("No user signed in."); return; }

  let name = document.getElementById("profileName").value.trim();
  let email = document.getElementById("profileEmail").value.trim().toLowerCase();
  let phone = document.getElementById("profilePhone").value.trim();

  if(!name){ alert("Name cannot be empty."); return; }
  if(!email && !phone){ alert("Enter email or phone number."); return; }

  let users = getUsers();
  let duplicate = users.find(u => u.id !== user.id && ((email && u.email === email) || (phone && u.phone === phone)));
  if(duplicate){ alert("Email or phone is already in use by another account."); return; }

  user.name = name;
  user.email = email;
  user.phone = phone;

  let index = users.findIndex(u => u.id === user.id);
  if(index !== -1){
    users[index] = user;
    saveUsers(users);
  }
  setCurrentUser(user);
  alert("Profile updated successfully.");
  displayAccount();
}

function addSavedAddress(event){
  if(event) event.preventDefault();
  let user = getCurrentUser();
  if(!user){ alert("No user signed in."); return; }

  let label = document.getElementById("addressLabel").value.trim();
  let address = document.getElementById("addressText").value.trim();
  if(!address){ alert("Please enter an address."); return; }

  let existingAddresses = user.addresses || [];
  let newAddress = {
    id: Date.now(),
    label: label || `Address ${existingAddresses.length + 1}`,
    text: address
  };

  user.addresses = existingAddresses;
  user.addresses.push(newAddress);
  if(!user.defaultAddress){
    user.defaultAddress = newAddress.id;
  }

  let users = getUsers();
  let index = users.findIndex(u => u.id === user.id);
  if(index !== -1){
    users[index] = user;
    saveUsers(users);
  }
  setCurrentUser(user);
  document.getElementById("addressLabel").value = "";
  document.getElementById("addressText").value = "";
  alert("Address saved.");
  displayAccount();
}

function setDefaultAddress(addressId){
  let user = getCurrentUser();
  if(!user) return;
  user.defaultAddress = addressId;
  let users = getUsers();
  let index = users.findIndex(u => u.id === user.id);
  if(index !== -1){
    users[index] = user;
    saveUsers(users);
  }
  setCurrentUser(user);
  displayAccount();
}

function deleteSavedAddress(addressId){
  let user = getCurrentUser();
  if(!user) return;
  user.addresses = (user.addresses || []).filter(a => a.id !== addressId);
  if(user.defaultAddress === addressId){
    user.defaultAddress = user.addresses.length ? user.addresses[0].id : null;
  }
  let users = getUsers();
  let index = users.findIndex(u => u.id === user.id);
  if(index !== -1){
    users[index] = user;
    saveUsers(users);
  }
  setCurrentUser(user);
  displayAccount();
}

function setLastReceiptOrder(orderId){
  localStorage.setItem("lastReceiptOrderId", String(orderId));
}

function getLastReceiptOrder(){
  let id = localStorage.getItem("lastReceiptOrderId");
  if(!id) return null;
  let orders = getOrders();
  let match = orders.find(o => String(o.id) === String(id));
  return match || null;
}

/* Display helpers for cart, checkout, tracking and receipts */
function displayCart(){
  let cart = getCart();
  let box = document.getElementById("cartDisplay");
  if(!box) return;

  if(cart.length === 0){
    box.innerHTML = "<p>Your cart is empty</p>";
    return;
  }

  let total = 0;
  let html = "";

  cart.forEach((item, i)=>{
    let itemTotal = item.price * item.quantity;
    total += itemTotal;

    html += `
      <div class="cart-item">

        <div>
          <b>${item.name}</b><br>
          ${item.type === "kg" ? item.quantity + " kg" : "Qty: " + item.quantity}<br>
          <small>Total: BWP ${itemTotal.toFixed(2)}</small>
        </div>

        <div>
          <button onclick="updateItemQty(${i}, -1)">-</button>
          <button onclick="updateItemQty(${i}, 1)">+</button>
        </div>

        <button onclick="removeItem(${i})">✕</button>

      </div>
      <hr>
    `;
  });

  html += `<h2>Grand Total: BWP ${total.toFixed(2)}</h2>`;

  box.innerHTML = html;
}

function displayCheckout(){
  let cart = getCart();
  let box = document.getElementById("checkoutCartDisplay");
  let totalBox = document.getElementById("checkoutTotal");
  if(!box || !totalBox) return;

  if(cart.length === 0){
    box.innerHTML = "<p>Your cart is empty. Add items before checking out.</p>";
    totalBox.innerText = "BWP 0.00";
    document.getElementById("checkoutForm").style.display = "none";
    return;
  }

  let total = 0;
  let html = "";

  cart.forEach((item)=>{
    let itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `
      <div class="cart-item">
        <div>
          <b>${item.name}</b><br>
          ${item.type === "kg" ? item.quantity + " kg" : "Qty: " + item.quantity}<br>
          <small>Unit: BWP ${item.price.toFixed(2)}</small><br>
          <small>Total: BWP ${itemTotal.toFixed(2)}</small>
        </div>
      </div>
    `;
  });

  box.innerHTML = html;
  totalBox.innerText = `BWP ${total.toFixed(2)}`;
  updateCheckoutForm();
  populateCheckoutAddresses();
}

function populateCheckoutAddresses(){
  let user = getCurrentUser();
  let delivery = document.querySelector('input[name="deliveryOption"]:checked');
  let addressSelect = document.getElementById("savedAddressSelect");
  let savedGroup = document.getElementById("savedAddressGroup");
  let addressInput = document.getElementById("deliveryAddress");

  if(!savedGroup || !addressSelect || !addressInput){
    return;
  }

  if(!user || delivery?.value !== "delivery" || !user.addresses?.length){
    savedGroup.style.display = "none";
    addressSelect.innerHTML = "";
    return;
  }

  savedGroup.style.display = "block";
  addressSelect.innerHTML = user.addresses.map(a => `
    <option value="${a.text}" ${user.defaultAddress === a.id ? "selected" : ""}>${a.label}</option>
  `).join("");

  let selected = addressSelect.value;
  if(selected){
    addressInput.value = selected;
  }
}

function updateSavedAddressSelection(){
  let addressSelect = document.getElementById("savedAddressSelect");
  let addressInput = document.getElementById("deliveryAddress");
  if(addressSelect && addressInput){
    addressInput.value = addressSelect.value;
  }
}

function updateCheckoutForm(){
  let cart = getCart();
  let total = cart.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  let delivery = document.querySelector('input[name="deliveryOption"]:checked');
  let payment = document.querySelector('input[name="paymentOption"]:checked');
  let addressGroup = document.getElementById("deliveryAddressGroup");
  let cardGroup = document.getElementById("cardDetailsGroup");
  let deliveryOption = document.querySelector('input[name="deliveryOption"][value="delivery"]');
  let deliveryWarning = document.getElementById("deliveryWarning");

  let canDeliver = total > 100;

  if(deliveryOption){
    deliveryOption.disabled = !canDeliver;
  }

  if(delivery && delivery.value === "delivery" && !canDeliver){
    let pickupOption = document.querySelector('input[name="deliveryOption"][value="pickup"]');
    if(pickupOption){
      pickupOption.checked = true;
      delivery = pickupOption;
    }
  }

  if(deliveryWarning){
    if(!canDeliver){
      deliveryWarning.innerText = "Delivery is only available for orders over BWP 100.00.";
      deliveryWarning.style.display = "block";
    } else {
      deliveryWarning.innerText = "";
      deliveryWarning.style.display = "none";
    }
  }

  if(addressGroup){
    addressGroup.style.display = (delivery && delivery.value === "delivery") ? "block" : "none";
  }

  if(cardGroup){
    cardGroup.style.display = (payment && payment.value === "payNow") ? "block" : "none";
  }

  let payNowOption = document.getElementById("payNowOption");
  let payOnPickupOption = document.getElementById("payOnPickupOption");
  let payOnDeliveryOption = document.getElementById("payOnDeliveryOption");
  let payOnPickupLabel = document.querySelector('label[for="payOnPickupOption"]');
  let payOnDeliveryLabel = document.querySelector('label[for="payOnDeliveryOption"]');

  if(delivery && delivery.value === "pickup"){
    if(payOnDeliveryOption){
      payOnDeliveryOption.disabled = true;
      if(payOnDeliveryLabel) payOnDeliveryLabel.style.display = "none";
      if(payOnDeliveryOption.checked && payNowOption){
        payNowOption.checked = true;
      }
    }
    if(payOnPickupOption){
      payOnPickupOption.disabled = false;
      if(payOnPickupLabel) payOnPickupLabel.style.display = "inline-flex";
    }
  } else if(delivery && delivery.value === "delivery"){
    if(payOnPickupOption){
      payOnPickupOption.disabled = true;
      if(payOnPickupLabel) payOnPickupLabel.style.display = "none";
      if(payOnPickupOption.checked && payNowOption){
        payNowOption.checked = true;
      }
    }
    if(payOnDeliveryOption){
      payOnDeliveryOption.disabled = false;
      if(payOnDeliveryLabel) payOnDeliveryLabel.style.display = "inline-flex";
    }
  }

  payment = document.querySelector('input[name="paymentOption"]:checked');
  if(cardGroup){
    cardGroup.style.display = (payment && payment.value === "payNow") ? "block" : "none";
  }

  populateCheckoutAddresses();
}

function validateCardDetails(){
  let name = document.getElementById("cardName").value.trim();
  let number = document.getElementById("cardNumber").value.replace(/\s+/g, "");
  let expiry = document.getElementById("cardExpiry").value.trim();
  let cvv = document.getElementById("cardCvv").value.trim();

  if(!name){
    alert("Please enter the card holder name.");
    return false;
  }
  if(!/^\d{16}$/.test(number)){
    alert("Please enter a valid 16-digit card number.");
    return false;
  }
  if(!/^\d{2}\/\d{2}$/.test(expiry)){
    alert("Please enter expiry in MM/YY format.");
    return false;
  }
  if(!/^\d{3}$/.test(cvv)){
    alert("Please enter a valid 3-digit CVV.");
    return false;
  }
  return true;
}

function placeOrder(event){
  event.preventDefault();

  let cart = getCart();
  if(cart.length === 0){
    alert("Your cart is empty.");
    return;
  }

  let delivery = document.querySelector('input[name="deliveryOption"]:checked');
  let payment = document.querySelector('input[name="paymentOption"]:checked');
  let address = document.getElementById("deliveryAddress").value.trim();
  let contact = document.getElementById("contactNumber").value.trim();

  if(!delivery){
    alert("Please choose pickup or delivery.");
    return;
  }
  if(!payment){
    alert("Please choose a payment option.");
    return;
  }
  if(!contact){
    alert("Please enter your contact number.");
    return;
  }
  if(delivery.value === "delivery" && !address){
    alert("Please enter the delivery address.");
    return;
  }
  let total = cart.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  if(delivery.value === "delivery" && total <= 100){
    alert("Delivery is only available for orders over BWP 100.00. Please choose pickup or add more items.");
    return;
  }
  if(payment.value === "payNow" && !validateCardDetails()){
    return;
  }
  let user = getCurrentUser();
  let order = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    cart,
    total,
    delivery: delivery.value,
    paymentMethod: payment.value,
    address: delivery.value === "delivery" ? address : "Pickup",
    contact,
    status: delivery.value === "delivery" ? "processed" : "pending pickup",
    paymentStatus: payment.value === "payNow" ? "paid" : "pending",
    trackStep: 0,
    userId: user ? user.id : null,
    userName: user ? user.name : null,
    userEmail: user ? user.email : null,
    userPhone: user ? user.phone : null
  };

  let orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  setLastReceiptOrder(order.id);
  clearCart();
  window.location.href = "thankyou.html";
}

function getLatestOrder(){
  let orders = getOrders();
  return orders.length ? orders[orders.length - 1] : null;
}

function getLatestDeliveryOrder(){
  let orders = getOrders().filter(o => o.delivery === "delivery");
  return orders.length ? orders[orders.length - 1] : null;
}

function advanceOrderStatus(order){
  if(!order || order.delivery !== "delivery") return order;
  let created = new Date(order.createdAt);
  let diffMinutes = Math.floor((new Date() - created) / 60000);
  let status = "processed";
  let step = 0;

  if(diffMinutes >= 4){
    status = "completed";
    step = 4;
  } else if(diffMinutes >= 3){
    status = "arrived";
    step = 3;
  } else if(diffMinutes >= 2){
    status = "on route";
    step = 2;
  } else if(diffMinutes >= 1){
    status = "preparing";
    step = 1;
  }

  order.status = status;
  order.trackStep = step;
  return order;
}

function displayTrack(){
  let order = getLatestDeliveryOrder();
  let box = document.getElementById("trackDisplay");
  if(!box) return;

  if(!order){
    box.innerHTML = '<p>No recent orders found. Place an order first.</p>';
    return;
  }

  if(order.delivery !== "delivery"){
    box.innerHTML = '<p>Your latest order is pickup. Tracking is only available for delivery orders.</p>';
    return;
  }

  order = advanceOrderStatus(order);
  let orders = getOrders();
  orders[orders.length - 1] = order;
  saveOrders(orders);

  let steps = [
    {label: "Processed", key: "processed"},
    {label: "Getting prepared", key: "preparing"},
    {label: "On route", key: "on route"},
    {label: "Arrived", key: "arrived"},
    {label: "Completed", key: "completed"}
  ];

  let html = `<h2>Delivery Tracking</h2><p>Order ID: ${order.id}</p><p>Status: <strong>${order.status}</strong></p><div class="track-steps">`;
  steps.forEach((step, index)=>{
    let statusClass = index <= order.trackStep ? "track-step active" : "track-step";
    html += `<div class="${statusClass}"><span>${step.label}</span></div>`;
  });
  html += `</div><button onclick="displayTrack()">Refresh Status</button>`;

  box.innerHTML = html;
}

function displayThankYou(){
  let order = getLastReceiptOrder();
  let box = document.getElementById("thankyouDetails");
  if(!box) return;

  if(!order){
    box.innerHTML = '<p>Thank you for your visit. No order information was found.</p>';
    return;
  }

  let html = `<h3>Receipt</h3>`;
  html += `<p>Order ID: <strong>${order.id}</strong></p>`;
  html += `<p>Date: <strong>${new Date(order.createdAt).toLocaleString()}</strong></p>`;
  if(order.userName){ html += `<p>Customer: <strong>${order.userName}</strong></p>`; }
  if(order.userEmail){ html += `<p>Email: <strong>${order.userEmail}</strong></p>`; }
  if(order.userPhone){ html += `<p>Phone: <strong>${order.userPhone}</strong></p>`; }
  html += `<p>Delivery: <strong>${order.delivery}</strong></p>`;
  if(order.delivery === "delivery"){
    html += `<p>Address: <strong>${order.address}</strong></p>`;
  }
  html += `<p>Payment: <strong>${order.paymentMethod === "payNow" ? "Paid" : "Pending"}</strong></p>`;
  html += `<div class="receipt-items"><h4>Items</h4>`;
  order.cart.forEach(item => {
    html += `<div><strong>${item.name}</strong> - ${item.type === "kg" ? item.quantity + " kg" : "Qty: " + item.quantity} - BWP ${item.total.toFixed(2)}</div>`;
  });
  html += `</div>`;
  html += `<p>Total: <strong>BWP ${order.total.toFixed(2)}</strong></p>`;
  if(order.delivery === "delivery"){
    html += `<p><a href="track.html">Track your delivery</a></p>`;
  }
  html += `<button type="button" class="button" onclick="window.print()">Print Receipt</button>`;
  box.innerHTML = html;
}

function displayAccount(){
  let box = document.getElementById("accountContent");
  if(!box) return;

  let user = getCurrentUser();
  if(!user){
    box.innerHTML = `
      <div class="booking-box">
        <h3>Not signed in</h3>
        <p>Please <a href="signup.html">Signup</a> or <a href="login.html">Login</a> to view your account details.</p>
      </div>
    `;
    return;
  }

  let orders = getOrders().filter(o => String(o.userId) === String(user.id));
  let html = `
    <div class="booking-box account-section">
      <h3>Profile</h3>
      <form id="profileForm" onsubmit="updateUserProfile(event)">
        <label>Full Name</label>
        <input type="text" id="profileName" value="${user.name}">
        <label>Email</label>
        <input type="email" id="profileEmail" value="${user.email || ""}">
        <label>Phone</label>
        <input type="text" id="profilePhone" value="${user.phone || ""}">
        <button type="submit" class="button">Save Profile</button>
      </form>
      <button onclick="logoutUser()" class="button button-secondary">Logout</button>
    </div>
    <div class="booking-box account-section">
      <h3>Saved Addresses</h3>
  `;

  if(user.addresses?.length){
    html += user.addresses.map(address => `
      <div class="saved-address">
        <p><strong>${address.label}${user.defaultAddress === address.id ? " (Default)" : ""}</strong></p>
        <p>${address.text}</p>
        <div class="button-group">
          <button type="button" onclick="setDefaultAddress(${address.id})">Set Default</button>
          <button type="button" onclick="deleteSavedAddress(${address.id})" class="button button-secondary">Delete</button>
        </div>
      </div>
    `).join("");
  } else {
    html += `<p>No saved addresses yet. Add one below.</p>`;
  }

  html += `
      <form id="addressForm" onsubmit="addSavedAddress(event)">
        <label>Address Label</label>
        <input type="text" id="addressLabel" placeholder="Home, Work, etc.">
        <label>Address</label>
        <textarea id="addressText" placeholder="Enter full address"></textarea>
        <button type="submit" class="button">Save Address</button>
      </form>
    </div>
    <div class="booking-box account-section">
      <h3>Your Notes</h3>
      <textarea id="account-notes" placeholder="Your farming notes..." rows="8">${localStorage.getItem("userNotes_" + user.id) || ""}</textarea>
      <button type="button" onclick="saveAccountNotes()" class="button">Save Notes</button>
    </div>
  `;

  html += `<div class="booking-box"><h3>Order History</h3>`;
  if(orders.length === 0){
    html += `<p>No orders yet. Place an order to see it here.</p>`;
  } else {
    orders.slice().reverse().forEach(order => {
      html += `
        <div class="receipt-item">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Delivery:</strong> ${order.delivery}</p>
          <p><strong>Payment:</strong> ${order.paymentStatus}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total:</strong> BWP ${order.total.toFixed(2)}</p>
          <details>
            <summary>View items</summary>
            ${order.cart.map(item => `<div>${item.name} - ${item.type === "kg" ? item.quantity + " kg" : "Qty: " + item.quantity} - BWP ${item.total.toFixed(2)}</div>`).join("")}
            <div><strong>Contact:</strong> ${order.contact}</div>
            <div><strong>Address:</strong> ${order.address}</div>
          </details>
        </div>
      `;
    });
  }
  html += `</div>`;
  box.innerHTML = html;
}

function displayLogin(){
  let user = getCurrentUser();
  let loginForm = document.getElementById("loginForm");
  if(user && loginForm){
    window.location.href = "account.html";
  }
}

function displaySignup(){
  let user = getCurrentUser();
  let signupForm = document.getElementById("signupForm");
  if(user && signupForm){
    window.location.href = "account.html";
  }
}


/* Booking workflow for farm stays, tours, and packages */
let pendingBooking = null;

function bookNow(type, pricePerNight, maxGuests){

  let checkin = document.getElementById("checkin").value;
  let checkout = document.getElementById("checkout").value;
  let guests = parseInt(document.getElementById("guests").value) || 1;

  if(!checkin || !checkout){
    alert("⚠️ Please select dates.");
    return;
  }

  let checkinDate = new Date(checkin);
  let checkoutDate = new Date(checkout);
  let days = (checkoutDate - checkinDate) / (1000*60*60*24);

  if(type === "Farm Tour"){
    // Weekend-only and at least 7 days ahead
    let dayOfWeek = checkinDate.getDay();
    let today = new Date();
    today.setHours(0,0,0,0);
    let msAhead = checkinDate - today;

    if(dayOfWeek !== 6 && dayOfWeek !== 0){
      alert("⚠️ Farm tours can only be booked for a Saturday or Sunday.");
      return;
    }
    if(msAhead < 7 * 24 * 60 * 60 * 1000){
      alert("⚠️ Farm tours must be booked at least 7 days in advance.");
      return;
    }

    if(days < 1){
      days = 1;
      checkout = checkin;
    }
  } else {
    if(days <= 0){
      alert("⚠️ Invalid dates.");
      return;
    }
  }

  if(guests > maxGuests){
    alert("⚠️ Max " + maxGuests + " guests.");
    return;
  }

  pendingBooking = {
    type,
    pricePerNight,
    maxGuests,
    checkin,
    checkout,
    days,
    guests,
    total: days * pricePerNight * guests
  };

  showBookingSummary();
}

function showBookingSummary(){
  let summary = document.getElementById("bookingSummary");
  let content = document.getElementById("bookingSummaryContent");
  if(!summary || !content) return;

  if(!pendingBooking){
    summary.style.display = "none";
    content.innerHTML = "";
    return;
  }

  summary.style.display = "block";
  content.innerHTML = `
    <p><strong>Package:</strong> ${pendingBooking.type}</p>
    <p><strong>Check-in:</strong> ${pendingBooking.checkin}</p>
    <p><strong>Check-out:</strong> ${pendingBooking.checkout}</p>
    <p><strong>Guests:</strong> ${pendingBooking.guests}</p>
    <p><strong>Nights:</strong> ${pendingBooking.days}</p>
    <p><strong>Price per night:</strong> BWP ${pendingBooking.pricePerNight}</p>
    <p><strong>Total:</strong> BWP ${pendingBooking.total.toFixed(2)}</p>
    ${pendingBooking.type === "Farm Tour" ? `<p class="muted">Farm tour bookings must be made at least 7 days before the tour and only on Saturday or Sunday.</p>` : ""}
    <div style="margin-top: 12px;">
      <button onclick="confirmBookingNow()">Confirm Booking</button>
      <button onclick="cancelPendingBooking()">Cancel</button>
    </div>
  `;
}

function confirmBookingNow(){
  if(!pendingBooking){
    alert("No booking selected.");
    return;
  }

  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(pendingBooking);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  pendingBooking = null;
  showBookingSummary();
  alert("Booking added!");
  displayBookings();
}

function cancelPendingBooking(){
  pendingBooking = null;
  showBookingSummary();
}

function displayBookings(){
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  let box = document.getElementById("bookingDisplay");
  if(!box) return;

  if(bookings.length === 0){
    box.innerHTML = "<p>No bookings yet</p>";
    return;
  }

  let html = "<h3>Your Bookings</h3>";

  bookings.forEach((b,i)=>{
    html += `
      <div>
        <b>${b.type}</b><br>
        ${b.days} nights | ${b.guests} guests<br>
        Price/night: BWP ${b.pricePerNight}<br>
        <b>Total: BWP ${b.total}</b><br>

        <button onclick="confirmBooking(${i})">Add to Cart</button>
        <button onclick="removeBooking(${i})">Remove</button>
      </div>
      <hr>
    `;
  });

  box.innerHTML = html;
}


function confirmBooking(i){
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  let b = bookings[i];

  if(!b || !b.days || b.days <= 0){
    alert("⚠️ Invalid booking.");
    return;
  }

  if(!b.guests || b.guests < 1){
    alert("⚠️ Invalid guests.");
    return;
  }

  let cart = getCart();

  cart.push({
    name: b.type + ` (${b.guests} guests, ${b.days} nights)`,
    price: b.total,
    quantity: 1,
    total: b.total,
    type: "booking"
  });

  saveCart(cart);

  updateCartCount();

  alert("Booking added to cart!");
}


function removeBooking(i){
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.splice(i,1);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  displayBookings();
}


/* Notes, toggles, and page initialization */
function saveNotes(){
  let user = getCurrentUser();
  if(!user){
    alert("Please log in to save notes.");
    return;
  }
  
  let notesTextarea = document.getElementById("user-notes");
  if(!notesTextarea) return;
  
  let notes = notesTextarea.value;
  localStorage.setItem("userNotes_" + user.id, notes);
  alert("Notes saved successfully!");
}

function loadNotes(){
  let user = getCurrentUser();
  let notesTextarea = document.getElementById("user-notes");
  if(!notesTextarea) return;
  
  let notes = "";
  if(user){
    notes = localStorage.getItem("userNotes_" + user.id) || "";
  }
  notesTextarea.value = notes;
}

function saveAccountNotes(){
  let user = getCurrentUser();
  if(!user){
    alert("Please log in to save notes.");
    return;
  }
  
  let notesTextarea = document.getElementById("account-notes");
  if(!notesTextarea) return;
  
  let notes = notesTextarea.value;
  localStorage.setItem("userNotes_" + user.id, notes);
  alert("Notes saved successfully!");
}


function toggleRead(id, button){
  let el = document.getElementById(id);
  if(!el) return;
  
  if(el.style.display === 'none' || el.style.display === ''){
    el.style.display = 'block';
    button.innerText = 'Read Less';
  } else {
    el.style.display = 'none';
    button.innerText = 'Read More';
  }
}


function buyPass(){
  addToCart('Event Pass', 50, 1, 'event');
}

function buyTicket(){
  addToCart('Event Ticket', 30, 1, 'event');
}


/* Page initialization: update UI and load dynamic page content */
window.addEventListener('load', function(){
  updateCartCount();
  displayCart();
  displayBookings();
  displayCheckout();
  displayTrack();
  displayThankYou();

  if (document.getElementById("accountContent")) {
    displayAccount();
  }
  if (document.getElementById("loginForm")) {
    displayLogin();
  }
  if (document.getElementById("signupForm")) {
    displaySignup();
  }

  loadNotes();
});