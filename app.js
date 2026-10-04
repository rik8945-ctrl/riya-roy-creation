/* =====================================================
   RIYA ROY Creation
   Automatic Assets System
===================================================== */

const state = {
  user: JSON.parse(localStorage.getItem("rr_user") || "null"),
  orders: JSON.parse(localStorage.getItem("rr_orders") || "[]")
};

function save() {
  localStorage.setItem("rr_user", JSON.stringify(state.user));
  localStorage.setItem("rr_orders", JSON.stringify(state.orders));
}

const ASSET_PATH = "assets/";

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "block";
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

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
    <p>
      Mobile:
      <strong>${escapeHtml(state.user.phone)}</strong>
    </p>

    <div class="gap"></div>

    <p>
      Membership:
      <strong>${state.user.member ? "Active" : "Not Active"}</strong>
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

    const titleElement = document.getElementById("paymentTitle");
    const amountElement = document.getElementById("paymentAmount");
    const upiLink = document.getElementById("upiLink");

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
        "&am=" +
        encodeURIComponent(amount) +
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

  const order = pendingPay;

  state.orders.push(order);
  save();

  pendingPay = null;

  closeModal("paymentModal");

  toast("Payment marked as done.");

  if (order.type === "Membership") {
    if (state.user) {
      state.user.member = true;
      save();
    }
  }

  loadAllPremiumContent();
}

/* =========================
   BUY CONTENT
========================= */

function buyContent(title, category, amount, contentId) {
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
        name: name,
        contact: contact,
        details: details
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

  requireLogin(() => {

    toast(
      "Collaboration request received from " +
      name
    );

  });
}

/* =====================================================
   GITHUB ASSETS
===================================================== */

async function getAssetFiles() {

  const repoOwner = "rik8945-ctrl";
  const repoName = "riya-roy-creation";

  const apiUrl =
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/assets`;

  const response =
    await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("Could not load assets.");
  }

  const files =
    await response.json();

  if (!Array.isArray(files)) {
    return [];
  }

  return files;
}

/* =====================================================
   PURCHASE CHECK
===================================================== */

function hasPurchased(contentId) {

  if (!state.user) {
    return false;
  }

  if (state.user.member) {
    return true;
  }

  return state.orders.some(order => {

    return (
      order.meta &&
      order.meta.contentId === contentId
    );

  });
}

/* =====================================================
   PREMIUM VIDEOS
===================================================== */

async function loadPremiumVideos(files) {

  const grid =
    document.getElementById(
      "premiumVideoGrid"
    );

  if (!grid) return;

  /*
     Only:
     video1.mp4
     video2.mp4
     video3.mp4

     are detected.

     The first 3 seconds of the same
     video are automatically used
     as the preview.
  */

  const videos =
    files
      .filter(file => {

        return /^video\d+\.mp4$/i
          .test(file.name);

      })
      .sort((a, b) => {

        const na =
          parseInt(
            a.name.match(/\d+/)?.[0] || "0",
            10
          );

        const nb =
          parseInt(
            b.name.match(/\d+/)?.[0] || "0",
            10
          );

        return na - nb;

      });

  if (videos.length === 0) {

    grid.innerHTML = `
      <div class="empty">
        No premium videos available.
      </div>
    `;

    return;
  }

  grid.innerHTML = "";

  videos.forEach(videoFile => {

    const match =
      videoFile.name.match(
        /^video(\d+)\.mp4$/i
      );

    const number =
      String(
        parseInt(
          match?.[1] || "0",
          10
        )
      ).padStart(2, "0");

    const contentId =
      "video-" +
      videoFile.name;

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "content-card";

    card.innerHTML = `

      <div class="media">

        <video
          class="preview-video"
          muted
          autoplay
          playsinline
          webkit-playsinline
          preload="metadata"
          src="${ASSET_PATH}${encodeURIComponent(
            videoFile.name
          )}">
        </video>

        <div class="touch-shield"></div>

        <span class="lock">
          🔒
        </span>

        <span class="preview-label">
          3 SEC PREVIEW
        </span>

      </div>

      <div class="card-body">

        <h3>
          Premium Video #${number}
        </h3>

        <p>
          3-second preview.
          Unlock for full video.
        </p>

        <button
          class="btn primary unlock-video">

          Unlock ₹49

        </button>

      </div>

    `;

    grid.appendChild(card);

    const video =
      card.querySelector(
        ".preview-video"
      );

    const button =
      card.querySelector(
        ".unlock-video"
      );

    setupThreeSecondLoop(video);

    if (
      hasPurchased(contentId)
    ) {

      showFullVideo(
        card,
        videoFile.name,
        number
      );

    }

    button.addEventListener(
      "click",
      () => {

        if (
          hasPurchased(contentId)
        ) {

          showFullVideo(
            card,
            videoFile.name,
            number
          );

        } else {

          buyContent(
            "Premium Video #" +
            number,
            "Premium Video",
            49,
            contentId
          );

        }

      }
    );

  });
}

/* =====================================================
   3 SECOND LOOP
===================================================== */

function setupThreeSecondLoop(video) {

  if (!video) return;

  video.muted = true;

  video.addEventListener(
    "loadedmetadata",
    () => {

      video.currentTime = 0;

      const play =
        video.play();

      if (play) {
        play.catch(() => {});
      }

    }
  );

  video.addEventListener(
    "timeupdate",
    () => {

      if (
        video.currentTime >= 3
      ) {

        video.currentTime = 0;

        const play =
          video.play();

        if (play) {
          play.catch(() => {});
        }

      }

    }
  );

  video.addEventListener(
    "seeking",
    () => {

      if (
        video.currentTime > 3
      ) {

        video.currentTime = 0;

      }

    }
  );

  video.addEventListener(
    "ended",
    () => {

      video.currentTime = 0;

      const play =
        video.play();

      if (play) {
        play.catch(() => {});
      }

    }
  );

}

/* =====================================================
   FULL VIDEO AFTER PURCHASE
===================================================== */

function showFullVideo(
  card,
  fullFileName,
  number
) {

  const media =
    card.querySelector(
      ".media"
    );

  if (!media) return;

  media.innerHTML = `

    <video
      controls
      playsinline
      preload="metadata"
      controlsList="nodownload"
      disablepictureinpicture
      src="${ASSET_PATH}${encodeURIComponent(
        fullFileName
      )}">
    </video>

  `;

  const button =
    card.querySelector(
      ".unlock-video"
    );

  if (button) {

    button.textContent =
      "Unlocked ✓";

    button.disabled = true;

  }

}

/* =====================================================
   PREMIUM PHOTOS
===================================================== */

async function loadPremiumPhotos(files) {

  const grid =
    document.getElementById(
      "premiumPhotoGrid"
    );

  if (!grid) return;

  /*
     Only:
     photo1.jpg
     photo2.jpg
     photo3.jpg
     photo4.jpg

     are treated as premium photos.

     profile.jpg is automatically excluded.
  */

  const photos =
    files
      .filter(file => {

        return /^photo\d+\.(jpg|jpeg|png|webp)$/i
          .test(file.name);

      })
      .sort((a, b) => {

        const na =
          parseInt(
            a.name.match(/\d+/)?.[0] || "0",
            10
          );

        const nb =
          parseInt(
            b.name.match(/\d+/)?.[0] || "0",
            10
          );

        return na - nb;

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

  photos.forEach(photoFile => {

    const match =
      photoFile.name.match(
        /^photo(\d+)\./i
      );

    const number =
      String(
        parseInt(
          match?.[1] || "0",
          10
        )
      ).padStart(2, "0");

    const contentId =
      "photo-" +
      photoFile.name;

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "content-card";

    card.innerHTML = `

      <div class="media">

        <img
          class="photo-preview"
          src="${ASSET_PATH}${encodeURIComponent(
            photoFile.name
          )}"
          alt="Premium Photo"
          loading="lazy">

        <span class="lock">
          🔒
        </span>

        <span class="preview-label">
          LOCKED
        </span>

      </div>

      <div class="card-body">

        <h3>
          Premium Photo #${number}
        </h3>

        <p>
          Light blurred preview.
          Unlock to view clearly.
        </p>

        <button
          class="btn primary unlock-photo">

          Unlock ₹19

        </button>

      </div>

    `;

    grid.appendChild(card);

    const image =
      card.querySelector(
        ".photo-preview"
      );

    const button =
      card.querySelector(
        ".unlock-photo"
      );

    if (
      hasPurchased(contentId)
    ) {

      unlockPhoto(
        card,
        image,
        button
      );

    }

    button.addEventListener(
      "click",
      () => {

        if (
          hasPurchased(contentId)
        ) {

          unlockPhoto(
            card,
            image,
            button
          );

        } else {

          buyContent(
            "Premium Photo #" +
            number,
            "Premium Photo",
            19,
            contentId
          );

        }

      }
    );

  });

}

/* =====================================================
   UNLOCK PHOTO
===================================================== */

function unlockPhoto(
  card,
  image,
  button
) {

  if (!image) return;

  image.classList.remove(
    "photo-preview"
  );

  image.style.filter =
    "none";

  image.style.transform =
    "none";

  image.style.opacity =
    "1";

  const lock =
    card.querySelector(
      ".lock"
    );

  if (lock) {
    lock.remove();
  }

  const label =
    card.querySelector(
      ".preview-label"
    );

  if (label) {

    label.textContent =
      "UNLOCKED ✓";

  }

  if (button) {

    button.textContent =
      "Unlocked ✓";

    button.disabled =
      true;

  }

}

/* =====================================================
   LOAD EVERYTHING
===================================================== */

async function loadAllPremiumContent() {

  try {

    const files =
      await getAssetFiles();

    await loadPremiumVideos(
      files
    );

    await loadPremiumPhotos(
      files
    );

  } catch (error) {

    console.error(
      "Asset loading error:",
      error
    );

  }

}

/* =====================================================
   AGE SUPPORT
===================================================== */

function confirmAge() {

  localStorage.setItem(
    "rr_age_ok",
    "1"
  );

  const gate =
    document.getElementById(
      "ageGate"
    );

  if (gate) {

    gate.style.display =
      "none";

  }

}

/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}

/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadAllPremiumContent();

  }
);
