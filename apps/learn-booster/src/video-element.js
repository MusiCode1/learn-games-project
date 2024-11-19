import logger from './logger.js';

function volumeFade(videoElement, action, duration = 2000) {
    // מקבל את הווידאו, הפעולה ("fadeIn" או "fadeOut"), ומשך הזמן (במילישניות)
    const step = 50; // כמה זמן כל צעד (במילישניות)
    const maxVolume = 1.0; // הווליום המרבי
    const volumeStep = maxVolume / (duration / step);

    if (action === 'fadeIn') {
        videoElement.volume = 0; // התחלה מווליום אפס
        videoElement.play(); // הפעלת הסרטון

        const fadeInInterval = setInterval(() => {
            if (videoElement.volume < maxVolume) {
                videoElement.volume = Math.min(maxVolume, videoElement.volume + volumeStep);
            } else {
                clearInterval(fadeInInterval);
            }
        }, step);
    } else if (action === 'fadeOut') {
        const fadeOutInterval = setInterval(() => {
            if (videoElement.volume > 0) {
                videoElement.volume = Math.max(0, videoElement.volume - volumeStep);
            } else {
                clearInterval(fadeOutInterval);
                videoElement.pause(); // עצירת הסרטון כשהווליום אפס
            }
        }, step);
    } else {
        console.error('Invalid action. Use "fadeIn" or "fadeOut".');
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// פונקציה להזרקת ה-HTML לדף
export function createVideoHTML(videoURL) {

    // יצירת אלמנט div חדש עבור המודאל
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('dir', 'rtl');

    // יצירת אלמנט div חדש עבור המיכל של הווידאו
    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container';

    // יצירת אלמנט card חדש
    const card = document.createElement('div');
    card.className = 'card';

    // הוספת כותרת
    const title = document.createElement('h1');
    title.innerText = 'הגיע הזמן לסרטון!';

    // יצירת אלמנט ווידאו
    const video = document.createElement('video');
    video.controls = false;
    const source = document.createElement('source');
    source.src = videoURL;
    //source.type = 'video/mp4';
    video.onclick = () =>
        (video.paused) ?
            video.play() : video.pause();


    // הוספת המקורות לווידאו
    video.appendChild(source);
    video.innerHTML += 'הדפדפן שלך אינו תומך בתגית הווידאו.';

    // הוספת אלמנטים ל-card
    card.appendChild(title);
    card.appendChild(video);

    // הוספת ה-card ל-mainContainer
    mainContainer.appendChild(card);
    modal.appendChild(mainContainer); // הוספת mainContainer למודאל

    const css = document.createElement('link');

    css.href = new URL('./style.css', import.meta.url).href;
    css.rel = 'stylesheet';

    document.head.appendChild(css);

    const modalManager = {

        status: 'hide',

        show() {
            this.status = 'show';
            modal.classList.add('show');

            volumeFade(video, 'fadeIn');
        },

        hide() {
            this.status = 'hide';
            modal.classList.remove('show');

            volumeFade(video, 'fadeOut');
        },

        toggle() {
            if (this.status === 'show') {
                this.hide()
            } else {
                this.show()
            }
        }
    }

    logger.log()

    return { modal, modalManager };
}


