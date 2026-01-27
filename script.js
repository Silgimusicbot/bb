// ================= KONFİQURASİYA =================
const config = {
    githubUsername: "Silgimusicbot", 
    repoName: "bb",              
    startDate: "2025-08-03T00:00:00",    
    meetingCount: 83,                    
    musicTitle: "Cəmaləm Üçün"
};
// =================================================

const audio = document.getElementById('music-file');
const playBtn = document.querySelector('.play-btn');
const playBtnIcon = playBtn ? playBtn.querySelector('i') : null;
const seekSlider = document.querySelector('.seek_slider');
const volumeSlider = document.querySelector('.volume_slider');
const currTimeText = document.getElementById('curr-time');
const totalDurText = document.getElementById('total-duration');
const trackArt = document.getElementById('track-art');

let isPlaying = false;

// 1. Sayt açılan kimi işləməli olanlar
document.addEventListener('DOMContentLoaded', () => {
    // Rəqəmi dərhal yaz
    if(document.getElementById('meet-count')) {
        document.getElementById('meet-count').innerText = config.meetingCount;
    }
    // Taymeri başlat
    updateCounter();
    setInterval(updateCounter, 1000);
});

// 2. Giriş Düyməsi
document.getElementById('enter-btn').addEventListener('click', () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    
    // Şəkilləri və musiqini daxil olanda aktiv et
    fetchImages();
    playTrack();
});

// 3. Taymer Funksiyası
function updateCounter() {
    const start = new Date(config.startDate).getTime();
    const now = new Date().getTime();
    const diff = now - start;

    if (isNaN(diff)) return;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    // HTML-də elementlər varsa doldur
    if(document.getElementById('days')) document.getElementById('days').innerText = d;
    if(document.getElementById('hours')) document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
    if(document.getElementById('minutes')) document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
    if(document.getElementById('seconds')) document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
}

// 4. Qalereya (GitHub API)
async function fetchImages() {
    const stack = document.getElementById('gallery-stack');
    if(!stack) return;

    const url = `https://api.github.com/repos/${config.githubUsername}/${config.repoName}/contents/gallery`;
    
    try {
        const response = await fetch(url);
        const files = await response.json();
        
        const images = files.filter(f => f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i));

        if(images.length > 0) {
            let html = '';
            // Son 4 şəkli stack kimi düz
            images.slice(-4).forEach((img, idx) => {
                html += `<img src="${img.download_url}" class="stack-item" style="z-index:${idx}">`;
            });
            stack.innerHTML = html;
            
            // Üstünə basanda lightbox (böyütmə) işləsin
            stack.onclick = () => {
                const lb = document.getElementById('lightbox');
                const lbImg = document.getElementById('lightbox-img');
                lb.style.display = 'flex';
                lbImg.src = images[images.length - 1].download_url;
                
                document.querySelector('.close-lightbox').onclick = () => lb.style.display = 'none';
            };
        }
    } catch (e) {
        console.error("Qalereya xətası:", e);
    }
}

// 5. Musiqi Player Funksiyaları
function playpauseTrack() {
    if (!isPlaying) playTrack();
    else pauseTrack();
}

function playTrack() {
    if(!audio) return;
    audio.play().then(() => {
        isPlaying = true;
        if(trackArt) trackArt.classList.add('playing');
        if(playBtnIcon) playBtnIcon.classList.replace('fa-play-circle', 'fa-pause-circle');
    }).catch(e => console.log("Play bloklandı"));
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    if(trackArt) trackArt.classList.remove('playing');
    if(playBtnIcon) playBtnIcon.classList.replace('fa-pause-circle', 'fa-play-circle');
}

if(audio) {
    audio.ontimeupdate = () => {
        if (audio.duration) {
            seekSlider.value = (audio.currentTime / audio.duration) * 100;
            currTimeText.innerText = formatTime(audio.currentTime);
            totalDurText.innerText = formatTime(audio.duration);
        }
    };
}

function formatTime(sec) {
    let m = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return (m < 10 ? "0"+m : m) + ":" + (s < 10 ? "0"+s : s);
}

if(seekSlider) {
    seekSlider.oninput = () => {
        audio.currentTime = (seekSlider.value / 100) * audio.duration;
    };
}

if(volumeSlider) {
    volumeSlider.oninput = () => {
        audio.volume = volumeSlider.value / 100;
    };
}
