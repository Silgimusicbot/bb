// ================= KONFİQURASİYA =================
const config = {
    githubUsername: "Silgimusicbot", 
    repoName: "bb",              
    startDate: "2025-08-03T00:00:00", // Sayğacın başlama tarixi
    meetingCount: 84,                  // Görüş sayı
    musicTitle: "Cəmaləm Üçün"
};
// =================================================

const audio = document.getElementById('music-file');
const playBtn = document.querySelector('.play-btn');
const seekSlider = document.querySelector('.seek_slider');
const volumeSlider = document.querySelector('.volume_slider');
const currTimeText = document.getElementById('curr-time');
const totalDurText = document.getElementById('total-duration');
const trackArt = document.getElementById('track-art');

let allImages = []; 
let currentImgIdx = 0;
let isPlaying = false;

// 1. Sayt açılan kimi işləməli olanlar
document.addEventListener('DOMContentLoaded', () => {
    // Görüş sayını HTML-ə yaz
    const meetEl = document.getElementById('meet-count');
    if(meetEl) meetEl.innerText = config.meetingCount;

    // Taymeri başlat
    updateCounter();
    setInterval(updateCounter, 1000);
});

// 2. Giriş Düyməsi (Xoş gəldin ekranını keçmək)
document.getElementById('enter-btn').addEventListener('click', () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    
    // Şəkilləri GitHub-dan çək
    fetchImages();
    
    // Musiqini başlat
    if (audio) {
        initVisualizer(audio);
        audio.play().then(() => {
            isPlaying = true;
            if(trackArt) trackArt.classList.add('playing');
            const icon = playBtn.querySelector('i');
            if(icon) icon.classList.replace('fa-play-circle', 'fa-pause-circle');
        }).catch(e => console.log("Musiqi avtomatik başlatma bloklandı."));
    }
});

// 3. Zaman Sayğacı Funksiyası
function updateCounter() {
    const start = new Date(config.startDate).getTime();
    const now = new Date().getTime();
    const diff = now - start;

    if (isNaN(diff)) return;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if(document.getElementById('days')) document.getElementById('days').innerText = d;
    if(document.getElementById('hours')) document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
    if(document.getElementById('minutes')) document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
    if(document.getElementById('seconds')) document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
}

// 4. GitHub Qalereya Funksiyası
async function fetchImages() {
    const stack = document.getElementById('gallery-stack');
    if(!stack) return;

    const url = `https://api.github.com/repos/${config.githubUsername}/${config.repoName}/contents/gallery`;
    
    try {
        const response = await fetch(url);
        const files = await response.json();
        
        // Şəkil formatlarını seçirik
        allImages = files.filter(f => f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i));

        if(allImages.length > 0) {
            let html = '';
            // Son 4 şəkli mərkəzdə stack kimi göstər
            allImages.slice(-4).forEach((img, idx) => {
                html += `<img src="${img.download_url}" class="stack-item" style="z-index:${idx}">`;
            });
            stack.innerHTML = html;
            
            // Üstünə basanda animasiyalı Lightbox aç
            stack.onclick = () => openLightbox(allImages.length - 1);
        }
    } catch (e) {
        console.error("Qalereya xətası:", e);
    }
}

// 1. Şəkli dəyişmək funksiyası
function changeImage(step) {
    if (allImages.length === 0) return;
    
    currentImgIdx = (currentImgIdx + step + allImages.length) % allImages.length;
    const lbImg = document.getElementById('lightbox-img');
    
    if (lbImg) {
        lbImg.style.opacity = "0"; // Keçid effekti
        setTimeout(() => {
            lbImg.src = allImages[currentImgIdx].download_url;
            lbImg.style.opacity = "1";
        }, 150);
    }
}

// 2. Lightbox-u açmaq funksiyası
function openLightbox(index) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const nBtn = document.getElementById('next-btn');
    const pBtn = document.getElementById('prev-btn');

    if (!lb || !lbImg) {
        console.error("Lightbox və ya Şəkil elementi tapılmadı! HTML-i yoxla.");
        return;
    }

    currentImgIdx = index;
    lbImg.src = allImages[currentImgIdx].download_url;
    
    // Lightbox-u göstər
    lb.style.display = "flex";
    lb.classList.add('active');

    // Düymələr mövcuddursa funksiya təyin et
    if (nBtn) {
        nBtn.onclick = (e) => { e.stopPropagation(); changeImage(1); };
    }
    if (pBtn) {
        pBtn.onclick = (e) => { e.stopPropagation(); changeImage(-1); };
    }

    // Bağlamaq funksiyası
    const closeBtn = document.querySelector('.close-lightbox');
    if (closeBtn) {
        closeBtn.onclick = () => {
            lb.style.display = "none";
            lb.classList.remove('active');
        };
    }
}



// 6. Musiqi Player Funksiyaları
function playpauseTrack() {
    if (audio.paused) {
        audio.play();
        if(trackArt) trackArt.classList.add('playing');
        playBtn.querySelector('i').classList.replace('fa-play-circle', 'fa-pause-circle');
    } else {
        audio.pause();
        if(trackArt) trackArt.classList.remove('playing');
        playBtn.querySelector('i').classList.replace('fa-pause-circle', 'fa-play-circle');
    }
}

if(audio) {
    audio.ontimeupdate = () => {
        if (audio.duration) {
            seekSlider.value = (audio.currentTime / audio.duration) * 100;
            currTimeText.innerText = formatTime(audio.currentTime);
            totalDurText.innerText = formatTime(audio.duration);
        }
    };
    
    function formatTime(sec) {
        let m = Math.floor(sec / 60);
        let s = Math.floor(sec % 60);
        return (m < 10 ? "0"+m : m) + ":" + (s < 10 ? "0"+s : s);
    }
}

if(seekSlider) {
    seekSlider.oninput = () => { audio.currentTime = (seekSlider.value / 100) * audio.duration; };
}

if(volumeSlider) {
    volumeSlider.oninput = () => { audio.volume = volumeSlider.value / 100; };
}
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart-particle');
    heart.innerHTML = '🤍'; // Ürək simvolu
    
    // Təsadüfi yer və ölçü
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = Math.random() * 20 + 10 + "px";
    heart.style.duration = Math.random() * 2 + 3 + "s";
    
    document.body.appendChild(heart);
    
    // Animasiya bitəndən sonra ürəyi silirik ki, sayt ağırlaşmasın
    setTimeout(() => {
        heart.remove();
    }, 4000);
}

// Hər 500 millisaniyədən (yarım saniyə) bir yeni ürək yaransın
setInterval(createHeart, 500);

// MƏKTUB MƏZMUNLARI
const letters = {
    "miss": {
        title: "Darıxanda...",
        text: "Bilirəm, məsafələr bəzən adamın ürəyini sıxır. Amma unutma ki, biz eyni səmaya baxırıq. Darıxmaq əslində sevgimizin nə qədər güclü olduğunu göstərir. İndi gözlərini yum, dərindən nəfəs al və əlini ürəyinin üzərinə qoy. Hiss etdin? Mən tam ordayam, səninləyəm. Səni çox sevirəm."
    },
    "sad": {
        title: "Kefin olmayanda...",
        text: "Bilirəm, bəzən hər şey üst-üstə gəlir, insan sadəcə susmaq və dünyadan qaçmaq istəyir. Əgər hazırda özünü elə hiss edirsənsə, bil ki, mən həmişə burdayam. Hətta bəzən bu kədərin səbəbi mən olsam belə, bil ki, bu heç vaxt istəyərək olmayıb. Səni incitdiyim anlar üçün məni bağışla... Mən bəlkə hər problemi həll edə bilmərəm, amma səninlə birlikdə hər şeyə qarşı dura bilərəm. İstədiyin an mənə söykənə bilərsən. Sənin hər halın mənim üçün dəyərlidir, təkcə güləndə yox. Sakitləş, dincəl və unutma: nə olursa olsun, mən həmişə sənin tərəfindəyəm."
    },
    "happy": {
        title: "Xoşbəxt olanda...",
        text: "Bax bunu eşitmək istəyirəm. Sənin xoşbəxtliyin mənim üçün hər şeydən önəmlidir. Bu günün dadını çıxar, gül, əylən. Sən xoşbəxt olanda mən də dünyanın ən xoşbəxt adamı oluram. Həmişə belə parılda, günəşim!"
    },
    "us": {
        title: "Bizim üçün...",
        text: "Nə yaxşı ki, həyat yollarımızı kəsişdirib. Sən mənim təkcə sevgilim yox, həm də ən yaxşı dostumsan. Səninlə keçən hər saniyə mənim üçün hədiyyədir. Birlikdə hələ neçə gözəl günlərimiz olacaq. Yaxşı ki varsan, Cəmaləm."
    }
};

// Məktub funksiyaları
function openLetter(type) {
    const modal = document.getElementById('letter-modal');
    document.getElementById('letter-title').innerText = letters[type].title;
    document.getElementById('letter-text').innerText = letters[type].text;
    modal.style.display = 'flex';
}
function closeLetter() { document.getElementById('letter-modal').style.display = 'none'; }
const lovePhrases = [
    "Səni sevirəm", "I Love You", "Seni Seviyorum", "Je t'aime", "Ich liebe dich", "Te amo", "Ti amo", "Eu te amo", 
    "Ik hou van jou", "Jag älskar dig", "Jeg elsker deg", "Kocham Cię", "Szeretlek", "Miluji tě", "Te iubesc", 
    "Volim te", "Σ' αγαπώ", "Я тебя люблю", "Men seni sevaman", "S'agapo", "Ana behibek", "Mahal kita", 
    "Wo ai ni", "Aishiteru", "Saranghae", "Ami tomake bhalobashi", "Naku penda", "Mən səni sevirəm"
];

let phraseIndex = 0;

function fastChangeLoveText() {
    const textElement = document.getElementById('changing-love');
    if (!textElement) return;

    // Heç bir effekt olmadan mətni birbaşa dəyişir
    phraseIndex = (phraseIndex + 1) % lovePhrases.length;
    textElement.innerText = lovePhrases[phraseIndex];
}

// Sürət: 200ms (0.2 saniyə) - İldırım sürəti ilə dəyişmə
setInterval(fastChangeLoveText, 200);
let audioContext, analyser, source, canvas, ctx;

function initVisualizer(audioElement) {
    // Əgər artıq yaradılıbsa, yenidən yaratma (xətanın qarşısını alır)
    if (audioContext) return; 

    try {
        // 1. Audio sistemini başlat
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        // 2. Musiqi faylını analizatora bağla
        source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // 3. Parametrlər (FFT size nə qədər kiçik olsa, barlar o qədər qalın olar)
        analyser.fftSize = 64; 
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // 4. Canvas ayarları
        canvas = document.getElementById('visualizer');
        ctx = canvas.getContext('2d');

        function draw() {
            requestAnimationFrame(draw); // Davamlı rəsm çəkir
            analyser.getByteFrequencyData(dataArray); // Səs məlumatını alır

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Ekranı təmizləyir

            const barWidth = (canvas.width / bufferLength) * 2;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2.5; // Barların hündürlüyü

                // Rəng və effekt (Qırmızı/Çəhrayı parıltı)
                ctx.fillStyle = `rgba(254, 118, 150, ${barHeight / 100 + 0.4})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#D1123F";
                
                // Barı çək (aşağıdan yuxarıya doğru)
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 2; // Növbəti bar üçün məsafə
            }
        }
        draw();
    } catch (e) {
        console.error("Vizualizator xətası:", e);
    }
}
async function convertMusic() {
    const url = document.getElementById('youtube-url').value;
    const btn = document.getElementById('convert-btn');
    const loader = document.getElementById('loader');
    const resultDiv = document.getElementById('download-result');
    const dlLink = document.getElementById('download-link');

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        alert('Zəhmət olmasa düzgün YouTube linki daxil edin!');
        return;
    }

    // Vizual keçid
    btn.disabled = true;
    loader.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    // YouTube Video ID-sini çıxarırıq
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();

    // Pulsuz API xidmətindən istifadə edirik (Məsələn: d.tubeapi.org və ya digər sürətli API-lar)
    // Qeyd: Bu, kənar sayta getmədən birbaşa fayl linkini çəkməyə çalışacaq
    const downloadUrl = `https://api.vevioz.com/@api/button/mp3/${videoId}`;
    
    // Prosesi simulyasiya edirik (çünki çevrilmə vaxt aparır)
    setTimeout(() => {
        loader.classList.add('hidden');
        resultDiv.classList.remove('hidden');
        dlLink.href = downloadUrl;
        btn.disabled = false;
    }, 2000);
}

