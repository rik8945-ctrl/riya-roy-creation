/* =========================================================
   RIYA ROY CREATION
   CORRECTED APP.JS
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

const state = {
  user: JSON.parse(localStorage.getItem("rr_user") || "null"),
  orders: JSON.parse(localStorage.getItem("rr_orders") || "[]")
};


/* =========================================================
   SAVE DATA
========================================================= */

function save() {

  localStorage.setItem(
    "rr_user",
    JSON.stringify(state.user)
  );

  localStorage.setItem(
    "rr_orders",
    JSON.stringify(state.orders)
  );

}


/* =========================================================
   TOAST
========================================================= */

function toast(msg) {

  const t = document.getElementById("toast");

  if (!t) return;

  t.textContent = msg;

  t.className = "show";

  setTimeout(() => {

    t.className = "";

  }, 3000);

}


/* =========================================================
   AGE GATE
========================================================= */

function enterSite() {

  localStorage.setItem(
    "rr_age_ok",
    "1"
  );

  sessionStorage.setItem(
    "age_verified",
    "1"
  );

  const gate =
    document.getElementById("ageGate");

  if (gate) {

    gate.style.display = "none";

  }

}


/* =========================================================
   MENU
========================================================= */

function toggleMenu() {

  const nav =
    document.getElementById("nav");

  if (nav) {

    nav.classList.toggle("open");

  }

}


function closeMenu() {

  const nav =
    document.getElementById("nav");

  if (nav) {

    nav.classList.remove("open");

  }

}


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

  const m =
    document.getElementById(id);

  if (m) {

    m.classList.add("open");

  }

}


function closeModal(id) {

  const m =
    document.getElementById(id);

  if (m) {

    m.classList.remove("open");

  }

}


/* =========================================================
   LOGIN
========================================================= */

function requireLogin(next) {

  if (state.user) {

    if (next) {

      next();

    }

    return true;

  }

  openModal("loginModal");

  window._afterLogin = next;

  return false;

}


/* =========================================================
   SEND OTP
========================================================= */

function sendOtp() {

  const p =
    document.getElementById("phone");

  if (!p || p.value.length !== 10) {

    alert(
      "Please enter a valid 10-digit mobile number"
    );

    return;

  }

  const area =
    document.getElementById("otpArea");

  if (area) {

    area.hidden = false;

  }

  toast(
    "OTP sent (Demo: 123456)"
  );

}


/* =========================================================
   VERIFY OTP
========================================================= */

function verifyOtp() {

  const otp =
    document.getElementById("otp");

  const p =
    document.getElementById("phone");

  if (!otp || otp.value !== "123456") {

    alert(
      "Invalid OTP! Use: 123456"
    );

    return;

  }

  if (!p || p.value.length !== 10) {

    alert(
      "Invalid mobile number"
    );

    return;

  }


  state.user = {

    phone: p.value,

    member: state.user
      ? !!state.user.member
      : false

  };


  save();

  closeModal("loginModal");

  toast(
    "Logged in successfully!"
  );


  if (window._afterLogin) {

    const callback =
      window._afterLogin;

    window._afterLogin = null;

    callback();

  }

}


/* =========================================================
   ACCOUNT
========================================================= */

function openAccount() {

  requireLogin(() => {

    const b =
      document.getElementById(
        "accountBody"
      );

    if (b) {

      b.innerHTML = `

        <p>
          <strong>Mobile:</strong>
          ${escapeHtml(state.user.phone)}
        </p>

        <p>
          <strong>Membership:</strong>
          ${state.user.member
            ? "Active"
            : "None"}
        </p>

        <p>
          <strong>Purchased Items:</strong>
          ${state.orders.length}
        </p>

      `;

    }

    openModal(
      "accountModal"
    );

  });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


/* =========================================================
   PAYMENT
========================================================= */

let pendingPay = null;


function openPayment(
  title,
  amount,
  type,
  meta = {}
) {

  requireLogin(() => {

    pendingPay = {

      title,
      amount,
      type,
      meta,

      id:
        "ORD" +
        Date.now()

    };


    const t =
      document.getElementById(
        "payTitle"
      );

    const a =
      document.getElementById(
        "payAmount"
      );

    const link =
      document.getElementById(
        "upiLink"
      );


    if (t) {

      t.textContent =
        title;

    }


    if (a) {

      a.textContent =
        "₹" + amount;

    }


    if (link) {

      link.href =
        `upi://pay?pa=917679669353@upi&pn=RIYA%20ROY&am=${amount}&cu=INR`;

    }


    openModal(
      "paymentModal"
    );

  });

}


/* =========================================================
   BUY CONTENT
========================================================= */

function buyContent(
  title,
  category,
  amount
) {

  openPayment(
    title,
    amount,
    category
  );

}


/* =========================================================
   BUY MEMBERSHIP
========================================================= */

function buyMembership(
  plan,
  amount
) {

  openPayment(
    "Membership - " + plan,
    amount,
    "Membership",
    {
      plan
    }
  );

}


/* =========================================================
   PROMOTION
========================================================= */

function submitPromotion(e) {

  e.preventDefault();

  const service =
    document.getElementById(
      "promoService"
    ).value;


  openPayment(
    service,
    30,
    "Promotion"
  );

}


/* =========================================================
   COLLABORATION
========================================================= */

function submitCollab(e) {

  e.preventDefault();

  alert(
    "Collaboration request sent successfully!"
  );

  e.target.reset();

}


/* =========================================================
   CHECK IF ITEM IS PURCHASED
========================================================= */

function isItemPurchased(title) {

  return state.orders.some(
    order =>
      order &&
      order.title === title
  );

}


/* =========================================================
   CHECK MEMBERSHIP
========================================================= */

function hasActiveMembership() {

  return !!(
    state.user &&
    state.user.member
  );

}


/* =========================================================
   PAYMENT COMPLETED / MARKED
========================================================= */

function markPaymentPending() {

  if (!pendingPay) {

    return;

  }


  /*
    Prevent duplicate orders.
  */

  const alreadyPurchased =
    state.orders.some(
      order =>
        order.id === pendingPay.id
    );


  if (!alreadyPurchased) {

    state.orders.push(
      pendingPay
    );

  }


  /*
    Membership purchase
  */

  if (
    pendingPay.type ===
    "Membership"
  ) {

    state.user.member = true;

  }


  save();


  const purchasedTitle =
    pendingPay.title;


  closeModal(
    "paymentModal"
  );


  toast(
    "Payment marked as done! Content unlocked."
  );


  pendingPay = null;


  /*
    Refresh locked media
    immediately.
  */

  refreshLockedMedia();


  /*
    Re-apply video preview/unlock state.
  */

  setTimeout(() => {

    setupPremiumVideos();

  }, 100);

}


/* =========================================================
   PREMIUM VIDEO PREVIEW
========================================================= */

function setupPremiumVideos() {

  const videos =
    document.querySelectorAll(
      ".premium-protected-video"
    );


  videos.forEach(video => {

    const title =
      video.dataset.title || "";


    /*
      Purchased / membership users
      can watch the complete video.
    */

    const unlocked =
      isItemPurchased(title) ||
      hasActiveMembership();


    if (unlocked) {

      video.dataset.unlocked =
        "true";

      video.controls = true;

      video.removeAttribute(
        "data-locked"
      );


      /*
        Remove old preview listeners
        by cloning the element.
      */

      return;

    }


    /*
      LOCKED VIDEO
    */

    video.dataset.unlocked =
      "false";

    video.controls = false;

    video.setAttribute(
      "data-locked",
      "true"
    );


    /*
      Start at beginning.
    */

    try {

      video.currentTime = 0;

    } catch (e) {}


    /*
      3-second restriction.
    */

    video.ontimeupdate =
      function () {

        if (
          video.dataset.unlocked !==
          "true" &&
          video.currentTime >= 3
        ) {

          video.currentTime = 3;

          video.pause();

        }

      };


    /*
      Prevent seeking beyond
      the 3-second preview.
    */

    video.onseeking =
      function () {

        if (
          video.dataset.unlocked !==
          "true" &&
          video.currentTime > 3
        ) {

          video.currentTime = 3;

          video.pause();

        }

      };


    /*
      Never allow normal ending
      to continue.
    */

    video.onended =
      function () {

        if (
          video.dataset.unlocked !==
          "true"
        ) {

          video.pause();

          video.currentTime = 3;

        }

      };


    /*
      Automatically start preview.
    */

    const startPreview =
      function () {

        if (
          video.dataset.unlocked ===
          "true"
        ) {

          return;

        }


        video.currentTime = 0;


        const playPromise =
          video.play();


        if (
          playPromise &&
          typeof playPromise.catch ===
          "function"
        ) {

          playPromise.catch(
            () => {}
          );

        }

      };


    if (
      video.readyState >= 1
    ) {

      startPreview();

    } else {

      video.addEventListener(
        "loadedmetadata",
        startPreview,
        {
          once: true
        }
      );

    }

  });

}


/* =========================================================
   REFRESH MEDIA LOCKS
========================================================= */

function refreshLockedMedia() {

  /*
    Refresh video state.
  */

  setupPremiumVideos();


  /*
    Refresh photos.
  */

  const photos =
    document.querySelectorAll(
      ".premium-protected-photo"
    );


  photos.forEach(img => {

    const title =
      img.dataset.title || "";


    const unlocked =
      isItemPurchased(title) ||
      hasActiveMembership();


    const container =
      img.closest(
        ".photo-lock-container"
      );


    if (unlocked) {

      img.classList.add(
        "photo-unlocked"
      );

      if (container) {

        const lock =
          container.querySelector(
            ".locked-badge-center"
          );

        if (lock) {

          lock.style.display =
            "none";

        }

      }

    } else {

      img.classList.remove(
        "photo-unlocked"
      );

      if (container) {

        const lock =
          container.querySelector(
            ".locked-badge-center"
          );

        if (lock) {

          lock.style.display =
            "flex";

        }

      }

    }

  });

}


/* =========================================================
   GITHUB ASSETS AUTO SCANNER
========================================================= */

async function loadMediaAutomatically() {

  const repoOwner =
    "rik8945-ctrl";

  const repoName =
    "riya-roy-creation";

  const apiUrl =
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/assets`;


  const videoGrid =
    document.querySelector(
      "#premium-video .content-grid"
    );


  const photoGrid =
    document.querySelector(
      "#premium-photo .content-grid"
    );


  try {

    const response =
      await fetch(apiUrl);


    if (!response.ok) {

      throw new Error(
        "GitHub Assets request failed"
      );

    }


    const files =
      await response.json();


    if (!Array.isArray(files)) {

      return;

    }


    const videos =
      files.filter(
        f =>
          f.type === "file" &&
          /\.mp4$/i.test(f.name)
      );


    const photos =
      files.filter(
        f =>
          f.type === "file" &&
          /\.(png|jpg|jpeg|webp)$/i.test(
            f.name
          )
      );


    /* =====================================================
       VIDEO CARDS
    ===================================================== */

    if (
      videoGrid &&
      videos.length > 0
    ) {

      videoGrid.innerHTML =
        videos.map(
          (v, i) => {

            const title =
              `Premium Video #${String(
                i + 1
              ).padStart(2, "0")}`;


            const safeTitle =
              escapeHtml(title);


            const purchased =
              isItemPurchased(
                title
              ) ||
              hasActiveMembership();


            return `

              <article
                class="content-card">

                <div
                  class="teaser-video-container">

                  <span
                    class="preview-badge">

                    ${
                      purchased
                        ? "UNLOCKED"
                        : "3s PREVIEW"
                    }

                  </span>


                  <video

                    class="premium-protected-video"

                    data-title="${safeTitle}"

                    ${
                      purchased
                        ? "controls"
                        : ""
                    }

                    muted

                    playsinline

                    webkit-playsinline

                    disablepictureinpicture

                    disableremoteplayback

                    preload="metadata"

                    src="assets/${encodeURIComponent(
                      v.name
                    )}">

                  </video>


                  ${
                    purchased
                      ? ""
                      : `<div class="touch-shield"></div>`
                  }

                </div>


                <div
                  class="card-body">

                  <h3>
                    ${safeTitle}
                  </h3>


                  <p>

                    ${
                      purchased
                        ? "Full HD video unlocked."
                        : "3-second preview only. Full HD video locked."
                    }

                  </p>


                  ${
                    purchased
                      ? `<button
                          class="btn small primary"
                          onclick="openUnlockedVideo('${safeTitle}')">
                          Watch Full Video
                        </button>`
                      : `<button
                          class="btn small primary"
                          onclick="buyContent(
                            '${safeTitle}',
                            'Premium Video',
                            49
                          )">
                          Unlock ₹49
                        </button>`
                  }

                </div>

              </article>

            `;

          }
        ).join("");

    }


    /* =====================================================
       PHOTO CARDS
    ===================================================== */

    if (
      photoGrid &&
      photos.length > 0
    ) {

      photoGrid.innerHTML =
        photos.map(
          (p, i) => {

            const title =
              `Premium Photo #${String(
                i + 1
              ).padStart(2, "0")}`;


            const safeTitle =
              escapeHtml(title);


            const purchased =
              isItemPurchased(
                title
              ) ||
              hasActiveMembership();


            return `

              <article
                class="content-card">

                <div
                  class="teaser-photo-container photo-lock-container">


                  <img

                    class="premium-protected-photo ${
                      purchased
                        ? "photo-unlocked"
                        : ""
                    }"

                    data-title="${safeTitle}"

                    src="assets/${encodeURIComponent(
                      p.name
                    )}"

                    alt="${safeTitle}"

                    draggable="false">

                  </img>


                  ${
                    purchased
                      ? ""
                      : `

                        <div
                          class="locked-badge-center">

                          <span>
                            🔒
                          </span>

                          <strong>
                            LOCKED PHOTO
                          </strong>

                        </div>

                      `
                  }

                </div>


                <div
                  class="card-body">

                  <h3>
                    ${safeTitle}
                  </h3>


                  <p>

                    ${
                      purchased
                        ? "Full HD photo unlocked."
                        : "Premium photo. Full view locked."
                    }

                  </p>


                  ${
                    purchased
                      ? `<button
                          class="btn small primary"
                          onclick="openUnlockedPhoto('${safeTitle}')">
                          View Photo
                        </button>`
                      : `<button
                          class="btn small primary"
                          onclick="buyContent(
                            '${safeTitle}',
                            'Premium Photo',
                            19
                          )">
                          Unlock ₹19
                        </button>`
                  }

                </div>

              </article>

            `;

          }
        ).join("");

    }


    /*
      Apply video and photo protection
      after scanner finishes.
    */

    setupPremiumVideos();

    refreshLockedMedia();


  } catch (err) {

    console.error(
      "Media loading error:",
      err
    );

  }

}


/* =========================================================
   OPEN UNLOCKED VIDEO
========================================================= */

function openUnlockedVideo(title) {

  if (
    !isItemPurchased(title) &&
    !hasActiveMembership()
  ) {

    toast(
      "Please unlock this video first."
    );

    return;

  }


  const videos =
    document.querySelectorAll(
      ".premium-protected-video"
    );


  videos.forEach(video => {

    if (
      video.dataset.title === title
    ) {

      video.controls = true;

      video.dataset.unlocked =
        "true";

      video.play().catch(
        () => {}
      );

    }

  });

}


/* =========================================================
   OPEN UNLOCKED PHOTO
========================================================= */

function openUnlockedPhoto(title) {

  if (
    !isItemPurchased(title) &&
    !hasActiveMembership()
  ) {

    toast(
      "Please unlock this photo first."
    );

    return;

  }


  const photos =
    document.querySelectorAll(
      ".premium-protected-photo"
    );


  photos.forEach(img => {

    if (
      img.dataset.title === title
    ) {

      img.classList.add(
        "photo-unlocked"
      );

      const container =
        img.closest(
          ".photo-lock-container"
        );


      if (container) {

        const lock =
          container.querySelector(
            ".locked-badge-center"
          );


        if (lock) {

          lock.style.display =
            "none";

        }

      }

    }

  });

}


/* =========================================================
   LEGAL
========================================================= */

function legal(title) {

  alert(
    title +
    " details will be updated soon."
  );

}


/* =========================================================
   ADMIN
========================================================= */

function showAdmin() {

  openModal(
    "adminModal"
  );

}

window.openAdmin =
  showAdmin;


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {


    /*
      Age gate compatibility
    */

    if (
      localStorage.getItem(
        "rr_age_ok"
      ) === "1" ||
      sessionStorage.getItem(
        "age_verified"
      ) === "1"
    ) {

      const gate =
        document.getElementById(
          "ageGate"
        );


      if (gate) {

        gate.style.display =
          "none";

      }

    }


    /*
      Load GitHub media.
    */

    loadMediaAutomatically();

  }
);
