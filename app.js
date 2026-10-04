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

document.addEventListener("DOMContentLoaded", loadMediaAutomatically);
