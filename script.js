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
const playBtnIcon = playBtn.querySelector('i');
const seekSlider = document.querySelector('.seek_slider');
const volumeSlider = document.querySelector('.volume_slider');
const currTimeText = document.getElementById('curr-time');
const totalDurText = document.getElementById('total-duration');
const trackArt = document.getElementById('track-art');

let isPlaying = false;

// 1. Giriş və Musiqi Başlatma
document.getElementById('enter-btn').addEventListener('click', () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    
    // Görüş sayını və sayğacı işə sal
    document.getElementById('meet-count').innerText = config.meetingCount;
    setInterval(updateCounter, 1000);
    
    // Şəkilləri çək
    fetchImages();
    
    // Musiqini başlat
    playTrack();
});

// 2. Play / Pause Funksiyası
function playpauseTrack() {
    if (!isPlaying) playTrack();
    else pauseTrack();
}

function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        trackArt.classList.add('playing');
        playBtnIcon.classList.replace('fa-play-circle', 'fa-pause-circle');
    }).catch(error => console.log("Musiqi çalınmadı:", error));
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    trackArt.classList.remove('playing');
    playBtnIcon.classList.replace('fa-pause-circle', 'fa-play-circle');
}

// 3. Zaman və Slider Yeniləmə
audio.ontimeupdate = () => {
    if (audio.duration) {
        // Sliderin yerini yenilə
        const seekPosition = (audio.currentTime / audio.duration) * 100;
        seekSlider.value = seekPosition;

        // Yazılı saniyələri yenilə
        currTimeText.innerText = formatTime(audio.currentTime);
        totalDurText.innerText = formatTime(audio.duration);
    }
};

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = "0" + sec;
    if (min < 10) min = "0" + min;
    return min + ":" + sec;
}

// Slider ilə musiqini irəli-geri çəkmək
seekSlider.oninput = () => {
    const seekTo = audio.duration * (seekSlider.value / 100);
    audio.currentTime = seekTo;
};

// 4. Səs Tənzimləmə
function setVolume() {
    audio.volume = volumeSlider.value / 100;
}

// Volume sliderinə hadisə əlavə et
if(volumeSlider) {
    volumeSlider.addEventListener('input', setVolume);
}
