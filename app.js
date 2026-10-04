const state = {
  user: JSON.parse(localStorage.getItem("rr_user") || "null"),
  orders: JSON.parse(localStorage.getItem("rr_orders") || "[]")
};

function save() {
  localStorage.setItem("rr_user", JSON.stringify(state.user));
  localStorage.setItem("rr_orders", JSON.stringify(state.orders));
}

function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "show";
  setTimeout(() => { t.className = ""; }, 3000);
}

function enterSite() {
  localStorage.setItem("rr_age_ok", "1");
  const gate = document.getElementById("ageGate");
  if (gate) gate.style.display = "none";
}

function toggleMenu() {
  const nav = document.getElementById("nav");
  if (nav) nav.classList.toggle("open");
}

function closeMenu() {
  const nav = document.getElementById("nav");
  if (nav) nav.classList.remove("open");
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("open");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("open");
}

function requireLogin(next) {
  if (state.user) {
    if (next) next();
    return true;
  }
  openModal("loginModal");
  window._afterLogin = next;
  return false;
}

function sendOtp() {
  const p = document.getElementById("phone");
  if (!p || p.value.length < 10) {
    alert("Please enter a valid 10-digit mobile number");
    return;
  }
  const area = document.getElementById("otpArea");
  if (area) area.hidden = false;
  toast("OTP sent (Demo: 123456)");
}

function verifyOtp() {
  const otp = document.getElementById("otp");
  const p = document.getElementById("phone");
  if (!otp || otp.value !== "123456") {
    alert("Invalid OTP! Use: 123456");
    return;
  }
  state.user = { phone: p.value, member: false };
  save();
  closeModal("loginModal");
  toast("Logged in successfully!");
  if (window._afterLogin) {
    window._afterLogin();
    window._afterLogin = null;
  }
}

function openAccount() {
  requireLogin(() => {
    const b = document.getElementById("accountBody");
    if (b) {
      b.innerHTML = `
        <p><strong>Mobile:</strong> ${state.user.phone}</p>
        <p><strong>Membership:</strong> ${state.user.member ? "Active" : "None"}</p>
        <p><strong>Purchased Items:</strong> ${state.orders.length}</p>
      `;
    }
    openModal("accountModal");
  });
}

let pendingPay = null;

function openPayment(title, amount, type, meta = {}) {
  requireLogin(() => {
    pendingPay = { title, amount, type, meta, id: "ORD" + Date.now() };
    const t = document.getElementById("payTitle");
    const a = document.getElementById("payAmount");
    const link = document.getElementById("upiLink");
    if (t) t.textContent = title;
    if (a) a.textContent = "₹" + amount;
    if (link) link.href = `upi://pay?pa=917679669353@upi&pn=RIYA%20ROY&am=${amount}&cu=INR`;
    openModal("paymentModal");
  });
}

function buyContent(title, category, amount) {
  openPayment(title, amount, category);
}

function buyMembership(plan, amount) {
  openPayment("Membership - " + plan, amount, "Membership", { plan });
}

function submitPromotion(e) {
  e.preventDefault();
  const service = document.getElementById("promoService").value;
  openPayment(service, 30, "Promotion");
}

function submitCollab(e) {
  e.preventDefault();
  alert("Collaboration request sent successfully!");
  e.target.reset();
}

function markPaymentPending() {
  if (!pendingPay) return;
  state.orders.push(pendingPay);
  save();
  closeModal("paymentModal");
  toast("Payment marked as done!");
}

function legal(title) {
  alert(title + " details will be updated soon.");
}

function showAdmin() {
  openModal("adminModal");
}

window.openAdmin = showAdmin;

// GitHub Assets Folder Auto-Scanner
async function loadMediaAutomatically() {
  const repoOwner = "rik8945-ctrl";
  const repoName = "riya-roy-creation";
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/assets`;

  const videoGrid = document.querySelector("#premium-video .content-grid");
  const photoGrid = document.querySelector("#premium-photo .content-grid");

  try {
    const response = await fetch(apiUrl);
    const files = await response.json();

    if (!Array.isArray(files)) return;

    const videos = files.filter(f => f.name.endsWith('.mp4'));
    const photos = files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f.name));

    if (videoGrid && videos.length > 0) {
      videoGrid.innerHTML = videos.map((v, i) => `
        <article class="content-card">
          <div class="media video-thumb">
            <video muted preload="metadata" src="assets/${v.name}" controls playsinline></video>
            <span class="lock">🔒</span>
          </div>
          <div class="card-body">
            <h3>Premium Video #${String(i + 1).padStart(2, '0')}</h3>
            <p>Member access or lifetime single purchase.</p>
            <button class="btn small primary" onclick="buyContent('Premium Video #${i + 1}','Premium Video',49)">Unlock ₹49</button>
          </div>
        </article>
      `).join("");
    }

    if (photoGrid && photos.length > 0) {
      photoGrid.innerHTML = photos.map((p, i) => `
        <article class="content-card">
          <div class="media photo-thumb">
            <img src="assets/${p.name}" alt="Premium Photo">
            <span class="lock">🔒</span>
          </div>
          <div class="card-body">
            <h3>Premium Photo #${String(i + 1).padStart(2, '0')}</h3>
            <p>View inside the website. No download.</p>
            <button class="btn small primary" onclick="buyContent('Premium Photo #${i + 1}','Premium Photo',19)">Unlock ₹19</button>
          </div>
        </article>
      `).join("");
    }
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("rr_age_ok") === "1") {
    const gate = document.getElementById("ageGate");
    if (gate) gate.style.display = "none";
  }
  loadMediaAutomatically();
});
