/* =========================================================
   RIYA ROY Creation
   Automatic Premium Asset System
========================================================= */


/* =========================
   BASIC STATE
========================= */

const state = {
  user: JSON.parse(localStorage.getItem("rr_user") || "null"),
  orders: JSON.parse(localStorage.getItem("rr_orders") || "[]")
};


function save() {
  localStorage.setItem("rr_user", JSON.stringify(state.user));
  localStorage.setItem("rr_orders", JSON.stringify(state.orders));
}


/* =========================
   ASSET CONFIG
=========================

   IMPORTANT:

   preview-video1.mp4
   premium-video1.mp4

   preview-video2.mp4
   premium-video2.mp4

   Photos can simply be placed in assets.
*/

const ASSET_PATH = "assets/";


/* =========================
   MODAL SYSTEM
========================= */

function openModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "block";
  }
}


function closeModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "none";
  }
}


/* =========================
   TOAST
========================= */

function toast(message) {
  alert(message);
}


/* =========================
   LOGIN
========================= */

let loginNextAction = null;


function requireLogin(next) {

  if (state.user) {
    next();
    return;
  }

  loginNextAction = next;

  openModal("loginModal");
}


function sendOtp() {

  const phone = document.getElementById("loginPhone");

  if (!phone) return;

  const value = phone.value.trim();

  if (!/^[0-9]{10}$/.test(value)) {
    toast("Please enter a valid 10-digit mobile number.");
    return;
  }

  document.getElementById("phoneStep").style.display = "none";
  document.getElementById("otpStep").style.display = "block";

  toast("OTP sent. Demo OTP is 123456.");
}


function verifyOtp() {

  const phone = document.getElementById("loginPhone");
  const otp = document.getElementById("loginOtp");

  if (!phone || !otp) return;

  if (otp.value.trim() !== "123456") {
    toast("Invalid OTP.");
    return;
  }

  state.user = {
    phone: phone.value.trim(),
    member: false
  };

  save();

  closeModal("loginModal");

  const next = loginNextAction;

  loginNextAction = null;

  if (typeof next === "function") {
    next();
  }
}


/* =========================
   ACCOUNT
========================= */

function openAccount() {

  if (!state.user) {
    requireLogin(() => openAccount());
    return;
  }

  const info = document.getElementById("accountInfo");

  if (!info) return;

  info.innerHTML = `
    <p>Mobile: <strong>${escapeHtml(state.user.phone)}</strong></p>

    <div class="gap"></div>

    <p>
      Membership:
      <strong>
        ${state.user.member ? "Active" : "Not Active"}
      </strong>
    </p>

    <div class="gap"></div>

    <p>
      Purchased items:
      <strong>${state.orders.length}</strong>
    </p>
  `;

  openModal("accountModal");
}


function logout() {

  state.user = null;

  save();

  closeModal("accountModal");

  toast("Logged out.");
}


/* =========================
   PAYMENT
========================= */

let pendingPay = null;


function openPayment(title, amount, type, meta = {}) {

  requireLogin(() => {

    pendingPay = {
      title,
      amount,
      type,
      meta,
      id: "ORD" + Date.now()
    };

    const titleElement =
      document.getElementById("paymentTitle");

    const amountElement =
      document.getElementById("paymentAmount");

    const upiLink =
      document.getElementById("upiLink");

    if (titleElement) {
      titleElement.textContent = title;
    }

    if (amountElement) {
      amountElement.textContent = amount;
    }

    if (upiLink) {

      upiLink.href =
        "upi://pay" +
        "?pa=917679669353@upi" +
        "&pn=RIYA%20ROY" +
        "&am=" + encodeURIComponent(amount) +
        "&cu=INR";
    }

    openModal("paymentModal");
  });
}


function markPaymentPending() {

  if (!pendingPay) {
    toast("No payment is pending.");
    return;
  }

  state.orders.push(pendingPay);

  save();

  const item = pendingPay;

  pendingPay = null;

  closeModal("paymentModal");

  toast("Payment marked as done.");

  unlockPurchasedContent(item);
}


/* =========================
   PURCHASE CHECK
========================= */

function hasPurchased(contentId) {

  if (!state.user) {
    return false;
  }

  if (state.user.member) {
    return true;
  }

  return state.orders.some(order => {

    return order.meta &&
           order.meta.contentId === contentId;
  });
}


/* =========================
   BUY CONTENT
========================= */

function buyContent(
  title,
  category,
  amount,
  contentId
) {

  openPayment(
    title,
    amount,
    category,
    {
      contentId: contentId
    }
  );
}


/* =========================
   MEMBERSHIP
========================= */

function buyMembership(plan, amount) {

  openPayment(
    plan,
    amount,
    "Membership",
    {
      membership: true,
      plan: plan
    }
  );
}


/* =========================
   PROMOTION
========================= */

function submitPromotion(event) {

  event.preventDefault();

  const name =
    document.getElementById("promotionName").value.trim();

  const contact =
    document.getElementById("promotionContact").value.trim();

  const details =
    document.getElementById("promotionDetails").value.trim();

  requireLogin(() => {

    openPayment(
      "Promotion Order",
      30,
      "Promotion",
      {
        name,
        contact,
        details
      }
    );

  });
}


/* =========================
   COLLABORATION
========================= */

function submitCollab(event) {

  event.preventDefault();

  const name =
    document.getElementById("collabName").value.trim();

  const contact =
    document.getElementById("collabContact").value.trim();

  const details =
    document.getElementById("collabDetails").value.trim();

  requireLogin(() => {

    toast(
      "Collaboration request received from " +
      name +
      "."
    );

  });
}


/* =========================================================
   AUTOMATIC ASSET LOADING
========================================================= */


/*
   GitHub Pages / normal server directory listing
   does NOT reliably give browser JavaScript a list of
   every file inside /assets.

   Therefore this system uses the GitHub API to discover
   files automatically.
*/

async function getAssetFiles() {

  const repoOwner = "rik8945-ctrl";
  const repoName = "riya-roy-creation";

  const apiUrl =
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/assets`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("Unable to read assets.");
  }

  const files = await response.json();

  if (!Array.isArray(files)) {
    return [];
  }

  return files;
}


/* =========================
   VIDEO LOADER
========================= */

async function loadPremiumVideos(files) {

  const grid =
    document.getElementById("premiumVideoGrid");

  if (!grid) return;

  /*
     Only preview-video*.mp4 is loaded publicly.

     Full premium-video*.mp4 is NOT loaded here.
  */

  const previews = files.filter(file => {

    return /^preview-video.*\.mp4$/i.test(file.name);
  });


  if (previews.length === 0) {

    grid.innerHTML = `
      <div class="empty">
        No premium videos available.
      </div>
    `;

    return;
  }


  grid.innerHTML = "";


  previews.forEach((previewFile, index) => {

    const number =
      String(index + 1).padStart(2, "0");

    /*
       preview-video1.mp4
       becomes
       premium-video1.mp4
    */

    const fullFileName =
      previewFile.name.replace(
        /^preview-/i,
        ""
      );


    const contentId =
      "video-" + previewFile.name;


    const card =
      document.createElement("article");

    card.className = "content-card";


    card.innerHTML = `
      <div class="media video-thumb">

        <video
          class="preview-video"
          muted
          autoplay
          playsinline
          webkit-playsinline
          preload="metadata"
          src="${ASSET_PATH}${encodeURIComponent(previewFile.name)}">
        </video>

        <div class="touch-shield"></div>

        <span class="lock">🔒</span>

        <span class="preview-label">
          3 SEC PREVIEW
        </span>

      </div>

      <div class="card-body">

        <h3>
          Premium Video #${number}
        </h3>

        <p>
          3-second preview. Unlock for full video.
        </p>

        <button
          class="btn primary unlock-video"
          data-content-id="${contentId}"
          data-full-file="${escapeHtml(fullFileName)}"
          data-number="${number}">
          Unlock ₹49
        </button>

      </div>
    `;


    grid.appendChild(card);


    const video =
      card.querySelector(".preview-video");

    setupThreeSecondLoop(video);


    const button =
      card.querySelector(".unlock-video");


    button.addEventListener("click", () => {

      const id =
        button.dataset.contentId;

      if (hasPurchased(id)) {

        showFullVideo(
          card,
          id,
          button.dataset.fullFile,
          number
        );

      } else {

        buyContent(
          `Premium Video #${number}`,
          "Premium Video",
          49,
          id
        );

      }

    });


    /*
       If already purchased, show full video.
    */

    if (hasPurchased(contentId)) {

      showFullVideo(
        card,
        contentId,
        fullFileName,
        number
      );
    }

  });
}


/* =========================
   3 SECOND LOOP
========================= */

function setupThreeSecondLoop(video) {

  if (!video) return;


  video.muted = true;


  video.addEventListener(
    "loadedmetadata",
    () => {

      video.currentTime = 0;

      const playPromise =
        video.play();

      if (
        playPromise &&
        typeof playPromise.catch === "function"
      ) {
        playPromise.catch(() => {});
      }
    }
  );


  video.addEventListener(
    "timeupdate",
    () => {

      if (video.currentTime >= 3) {

        video.currentTime = 0;

        const playPromise =
          video.play();

        if (
          playPromise &&
          typeof playPromise.catch === "function"
        ) {
          playPromise.catch(() => {});
        }
      }

    }
  );


  /*
     Prevent dragging/seeking beyond 3 seconds.
  */

  video.addEventListener(
    "seeking",
    () => {

      if (video.currentTime > 3) {
        video.currentTime = 0;
      }

    }
  );


  /*
     Extra protection if the preview ends
     before exactly 3 seconds.
  */

  video.addEventListener(
    "ended",
    () => {

      video.currentTime = 0;

      const playPromise =
        video.play();

      if (
        playPromise &&
        typeof playPromise.catch === "function"
      ) {
        playPromise.catch(() => {});
      }

    }
  );
}


/* =========================
   SHOW FULL VIDEO
========================= */

function showFullVideo(
  card,
  contentId,
  fullFileName,
  number
) {

  if (!card) return;


  const media =
    card.querySelector(".media");

  if (!media) return;


  /*
     NOW ONLY the full video is loaded.
  */

  media.innerHTML = `

    <video
      controls
      playsinline
      preload="metadata"
      controlsList="nodownload"
      disablepictureinpicture
      src="${ASSET_PATH}${encodeURIComponent(fullFileName)}">
    </video>

  `;


  const button =
    card.querySelector(".unlock-video");


  if (button) {

    button.textContent = "Unlocked ✓";

    button.disabled = true;

    button.style.opacity = ".6";
  }

}


/* =========================================================
   AUTOMATIC PHOTO LOADING
========================================================= */

async function loadPremiumPhotos(files) {

  const grid =
    document.getElementById("premiumPhotoGrid");

  if (!grid) return;


  const photos = files.filter(file => {

    return /\.(png|jpg|jpeg|webp)$/i.test(
      file.name
    );

  });


  if (photos.length === 0) {

    grid.innerHTML = `
      <div class="empty">
        No premium photos available.
      </div>
    `;

    return;
  }


  grid.innerHTML = "";


  photos.forEach((photoFile, index) => {

    const number =
      String(index + 1).padStart(2, "0");


    const contentId =
      "photo-" + photoFile.name;


    const card =
      document.createElement("article");

    card.className = "content-card";


    card.innerHTML = `

      <div class="media photo-thumb">

        <img
          class="photo-preview"
          src="${ASSET_PATH}${encodeURIComponent(photoFile.name)}"
          alt="Premium Photo"
          loading="lazy">

        <span class="lock">🔒</span>

        <span class="preview-label">
          LOCKED
        </span>

      </div>

      <div class="card-body">

        <h3>
          Premium Photo #${number}
        </h3>

        <p>
          Light blurred preview. Unlock to view clearly.
        </p>

        <button
          class="btn primary unlock-photo">
          Unlock ₹19
        </button>

      </div>
    `;


    grid.appendChild(card);


    const image =
      card.querySelector(".photo-preview");

    const button =
      card.querySelector(".unlock-photo");


    if (hasPurchased(contentId)) {

      unlockPhoto(
        card,
        image,
        button
      );

    } else {

      button.addEventListener(
        "click",
        () => {

          if (hasPurchased(contentId)) {

            unlockPhoto(
              card,
              image,
              button
            );

            return;
          }


          buyContent(
            `Premium Photo #${number}`,
            "Premium Photo",
            19,
            contentId
          );

        }
      );

    }

  });
}


/* =========================
   UNLOCK PHOTO
========================= */

function unlockPhoto(
  card,
  image,
  button
) {

  if (!image) return;


  /*
     The same original asset is displayed clearly
     after purchase.
  */

  image.classList.remove(
    "photo-preview"
  );


  image.style.filter = "none";

  image.style.transform = "none";

  image.style.opacity = "1";


  const lock =
    card.querySelector(".lock");

  if (lock) {
    lock.remove();
  }


  const label =
    card.querySelector(".preview-label");

  if (label) {
    label.textContent = "UNLOCKED ✓";
  }


  if (button) {

    button.textContent =
      "Unlocked ✓";

    button.disabled = true;

    button.style.opacity = ".6";
  }

}


/* =========================
   UNLOCK AFTER PAYMENT
========================= */

function unlockPurchasedContent(order) {

  if (!order || !order.meta) {
    return;
  }


  const contentId =
    order.meta.contentId;


  if (!contentId) {

    /*
       Membership purchase
    */

    if (
      order.type === "Membership"
    ) {

      if (state.user) {

        state.user.member = true;

        save();

        toast(
          "Membership activated."
        );

        loadAllPremiumContent();
      }

    }

    return;
  }


  loadAllPremiumContent();
}


/* =========================
   RELOAD PREMIUM CONTENT
========================= */

async function loadAllPremiumContent() {

  try {

    const files =
      await getAssetFiles();

    await loadPremiumVideos(files);

    await loadPremiumPhotos(files);

  } catch (error) {

    console.error(
      "Premium content error:",
      error
    );

  }
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================
   AGE GATE SUPPORT
========================= */

function confirmAge() {

  localStorage.setItem(
    "rr_age_ok",
    "1"
  );

  const gate =
    document.getElementById("ageGate");

  if (gate) {
    gate.style.display = "none";
  }
}


/* =========================
   START WEBSITE
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadAllPremiumContent();

  }
);
