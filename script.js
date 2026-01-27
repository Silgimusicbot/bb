const config = {
    githubUsername: "Silgimusicbot", 
    repoName: "bb",              
    startDate: "2025-08-03T00:00:00",    
    meetingCount: 83,                    
    musicTitle: "Cəmaləm Üçün"
};

const audio = document.getElementById('music-file');
const playBtn = document.querySelector('.play-btn');
const seekSlider = document.querySelector('.seek_slider');
const volumeSlider = document.querySelector('.volume_slider');
const trackArt = document.getElementById('track-art');

let allImages = []; 
let currentImgIdx = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('meet-count').innerText = config.meetingCount;
    updateCounter();
    setInterval(updateCounter, 1000);
});

document.getElementById('enter-btn').addEventListener('click', () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    fetchImages();
    audio.play().catch(() => console.log("Musiqi üçün klik lazımdır"));
    trackArt.classList.add('playing');
    playBtn.querySelector('i').classList.replace('fa-play-circle', 'fa-pause-circle');
});

function updateCounter() {
    const diff = new Date() - new Date(config.startDate);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    document.getElementById('days').innerText = d;
    document.getElementById('hours').innerText = h < 10 ? '0'+h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0'+m : m;
    document.getElementById('seconds').innerText = s < 10 ? '0'+s : s;
}

async function fetchImages() {
    const stack = document.getElementById('gallery-stack');
    try {
        const res = await fetch(`https://api.github.com/repos/${config.githubUsername}/${config.repoName}/contents/gallery`);
        const files = await res.json();
        allImages = files.filter(f => f.name.match(/\.(jpg|jpeg|png|webp)$/i));
        
        if(allImages.length > 0) {
            stack.innerHTML = allImages.slice(-3).map((img, i) => 
                `<img src="${img.download_url}" class="stack-item" style="z-index:${i}">`
            ).join('');
            stack.onclick = () => openLightbox(allImages.length - 1);
        }
    } catch (e) { console.error(e); }
}

function openLightbox(index) {
    currentImgIdx = index;
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = allImages[currentImgIdx].download_url;
    lb.classList.add('active');

    document.getElementById('next-btn').onclick = (e) => { e.stopPropagation(); changeImage(1); };
    document.getElementById('prev-btn').onclick = (e) => { e.stopPropagation(); changeImage(-1); };
    document.querySelector('.close-lightbox').onclick = () => lb.classList.remove('active');
    lb.onclick = (e) => { if(e.target === lb) lb.classList.remove('active'); };
}

function changeImage(step) {
    currentImgIdx = (currentImgIdx + step + allImages.length) % allImages.length;
    document.getElementById('lightbox-img').src = allImages[currentImgIdx].download_url;
}

function playpauseTrack() {
    if (audio.paused) {
        audio.play();
        trackArt.classList.add('playing');
        playBtn.querySelector('i').classList.replace('fa-play-circle', 'fa-pause-circle');
    } else {
        audio.pause();
        trackArt.classList.remove('playing');
        playBtn.querySelector('i').classList.replace('fa-pause-circle', 'fa-play-circle');
    }
}

audio.ontimeupdate = () => {
    seekSlider.value = (audio.currentTime / audio.duration) * 100 || 0;
    document.getElementById('curr-time').innerText = formatTime(audio.currentTime);
    document.getElementById('total-duration').innerText = formatTime(audio.duration || 0);
};

seekSlider.oninput = () => audio.currentTime = (seekSlider.value / 100) * audio.duration;
volumeSlider.oninput = () => audio.volume = volumeSlider.value / 100;
function formatTime(s) {
    let m = Math.floor(s/60), sec = Math.floor(s%60);
    return (m<10?'0'+m:m)+":"+(sec<10?'0'+sec:sec);
}
