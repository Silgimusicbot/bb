// ================= KONFİQURASİYA =================
const config = {
    githubUsername: "SENIN_GITHUB_ADIN", // GitHub istifadəçi adın
    repoName: "REPO_ADIN",              // Repozitoriyanın adı
    startDate: "2023-01-01T00:00:00",
    meetingCount: 15,
    musicTitle: "Cəmaləm Üçün"
};
// =================================================

const audio = document.getElementById('music-file');
const galleryStack = document.getElementById('gallery-stack');

// 1. GitHub-dan şəkilləri avtomatik çəkmək
async function fetchImages() {
    const url = `https://api.github.com/repos/${config.githubUsername}/${config.repoName}/contents/gallery`;
    
    try {
        const response = await fetch(url);
        const files = await response.json();
        
        // Şəkil formatlarını süzgəcdən keçiririk
        const imageFiles = files.filter(file => 
            file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );

        renderGallery(imageFiles);
    } catch (error) {
        console.error("Şəkillər yüklənmədi:", error);
    }
}

function renderGallery(images) {
    // Üst-üstə yığılan hissə üçün son 4 şəkli götürürük
    let stackHTML = '';
    const lastImages = images.slice(-4); 
    
    lastImages.forEach((img, index) => {
        stackHTML += `<img src="${img.download_url}" class="stack-item" style="z-index: ${index}">`;
    });
    galleryStack.innerHTML = stackHTML;

    // Qalereyaya klik edəndə ilk şəkildən başlayaraq lightbox açılır
    galleryStack.onclick = () => {
        openLightbox(images, 0);
    };
}

// 2. Lightbox (Açılan Qalereya) Funksiyası
let currentIdx = 0;
function openLightbox(images, index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    currentIdx = index;

    lightbox.style.display = 'flex';
    lightboxImg.src = images[currentIdx].download_url;

    document.querySelector('.next').onclick = () => {
        currentIdx = (currentIdx + 1) % images.length;
        lightboxImg.src = images[currentIdx].download_url;
    };

    document.querySelector('.prev').onclick = () => {
        currentIdx = (currentIdx - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIdx].download_url;
    };
}

// 3. Zaman Sayğacı
function updateCounter() {
    const start = new Date(config.startDate).getTime();
    const now = new Date().getTime();
    const diff = now - start;

    document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
    document.getElementById('hours').innerText = Math.floor((diff / (1000 * 60 * 60)) % 24);
    document.getElementById('minutes').innerText = Math.floor((diff / 1000 / 60) % 60);
    document.getElementById('seconds').innerText = Math.floor((diff / 1000) % 60);
}

// 4. Musiqi və Giriş Kontrolu
document.getElementById('enter-btn').addEventListener('click', () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    audio.play();
    setInterval(updateCounter, 1000);
    fetchImages(); // Şəkilləri bura daxil olanda çəkirik
});

// Digər player funksiyaları (səs, bar sürüşdürmə) əvvəlki kodla eynidir...
