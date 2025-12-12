// Global Variables
let currentType = 'url';
let correctionLevel = 'H';
let currentFrame = 'none';
let regenTimeout = null;

// --- Global Functions (Attached to window for inline onclicks) ---

window.switchType = function(type) {
    currentType = type;
    
    // UI Updates
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active', 'text-indigo-600', 'bg-blue-50', 'border-indigo-100');
        btn.classList.add('text-slate-500', 'hover:bg-slate-50');
        btn.style.border = "none";
    });
    const activeBtn = document.getElementById(`btn-${type}`);
    if(activeBtn) {
        activeBtn.classList.add('active', 'text-indigo-600', 'bg-blue-50', 'border-indigo-100');
        activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-50');
        activeBtn.style.border = "1px solid #e0e7ff";
    }

    // Hide all inputs first
    document.getElementById('input-group-url').classList.add('hidden');
    document.getElementById('input-group-text').classList.add('hidden');
    document.getElementById('input-group-event').classList.add('hidden');

    // Show selected
    if (type === 'url') {
        document.getElementById('input-group-url').classList.remove('hidden');
        document.getElementById('frame-text-input').value = "Scan Me"; 
    } else if (type === 'text') {
        document.getElementById('input-group-text').classList.remove('hidden');
        document.getElementById('frame-text-input').value = "Read Me";
    } else if (type === 'event') {
        document.getElementById('input-group-event').classList.remove('hidden');
         document.getElementById('frame-text-input').value = "Save Date";
         
         // Set default date if empty
         const d = new Date();
         d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
         if(!document.getElementById('event-start').value) {
             document.getElementById('event-start').value = d.toISOString().slice(0,16);
         }
    }
    
    updateFrameText(document.getElementById('frame-text-input').value);
    triggerRegen();
};

window.selectFrame = function(frame) {
    currentFrame = frame;
    
    document.querySelectorAll('.frame-option').forEach(el => el.classList.remove('selected'));
    document.getElementById(`opt-${frame}`).classList.add('selected');

    const box = document.getElementById('frame-box');
    box.className = 'relative inline-flex flex-col items-center justify-center bg-white transition-all duration-300';
    box.classList.add(`frame-${frame}`);

    const panel = document.getElementById('frame-customization');
    if (frame === 'none') {
        panel.classList.add('hidden');
    } else {
        panel.classList.remove('hidden');
    }
    
    updateBubbleTextContrast();
    triggerRegen(); 
};

window.updateFrameColor = function(color) {
    const box = document.getElementById('frame-box');
    box.style.setProperty('--frame-color', color);
    document.getElementById('frame-color-hex').textContent = color.toUpperCase();
    updateBubbleTextContrast();
    triggerRegen();
};

window.updateFrameText = function(text) {
    const el = document.getElementById('frame-text-el');
    el.textContent = text;
    triggerRegen();
};

window.setCorrection = function(level, btnElement) {
    correctionLevel = level;
    document.querySelectorAll('.level-btn').forEach(b => {
        b.classList.remove('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
        b.classList.add('text-slate-600', 'border-slate-200');
    });
    btnElement.classList.add('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
    btnElement.classList.remove('text-slate-600', 'border-slate-200');

    triggerRegen();
};

window.updateSize = function(val) {
    document.getElementById('size-value').textContent = val + 'px';
};
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('size-input').addEventListener('change', triggerRegen);
});

// --- QR Logic ---
window.generateQR = function() {
    const container = document.getElementById('qrcode');
    if (!container) return;
    container.innerHTML = '';
    
    let data;
    if (currentType === 'url') {
        data = document.getElementById('url-input').value.trim() || "https://github.com/mbelik07";
    } else if (currentType === 'text') {
        data = document.getElementById('text-input').value.trim() || "Hello World";
    } else if (currentType === 'event') {
        data = generateIcalString();
    }

    const size = parseInt(document.getElementById('size-input').value) || 300;
    const colorDark = document.getElementById('color-fg').value;
    const colorLight = document.getElementById('color-bg').value;

    try {
        new QRCode(container, {
            text: data,
            width: size,
            height: size,
            colorDark: colorDark,
            colorLight: colorLight,
            correctLevel: QRCode.CorrectLevel[correctionLevel]
        });
    } catch (e) {
        console.error("Gen Error", e);
    }
};

window.generateIcalString = function() {
    const title = document.getElementById('event-title').value || "Event";
    const loc = document.getElementById('event-location').value || "";
    const url = document.getElementById('event-url').value || "";
    const startStr = document.getElementById('event-start').value;
    const endStr = document.getElementById('event-end').value;

    // Helper to format date for iCal: YYYYMMDDTHHMMSS
    const formatICSDate = (isoStr) => {
        if(!isoStr) return "";
        return isoStr.replace(/[-:]/g, "").replace(".", "") + "00";
    };

    const start = formatICSDate(startStr) || "20240101T090000";
    const end = formatICSDate(endStr) || "20240101T100000";

    // Build the description with the URL if it exists
    let description = "Scanned from QR";
    if (url) {
        description = `Join online: ${url}\\n\\n${description}`;
    }

    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${start}
DTEND:${end}
LOCATION:${loc}
DESCRIPTION:${description}
URL:${url}
END:VEVENT
END:VCALENDAR`;
};


// --- Rendering & Utility ---

window.triggerRegen = function() {
    generateQR();
    
    const imgPreview = document.getElementById('final-preview-image');
    const loading = document.getElementById('loading-msg');
    
    if (imgPreview) imgPreview.style.opacity = '0.5';
    if (loading) loading.style.opacity = '1';

    if (regenTimeout) clearTimeout(regenTimeout);
    
    regenTimeout = setTimeout(() => {
        renderCompositeImage();
    }, 600);
};

window.renderCompositeImage = function() {
    const source = document.getElementById('frame-box');
    const imgPreview = document.getElementById('final-preview-image');
    const loading = document.getElementById('loading-msg');

    html2canvas(source, {
        scale: 2, 
        backgroundColor: null
    }).then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        imgPreview.src = dataUrl;
        imgPreview.style.opacity = '1';
        loading.style.opacity = '0';
    }).catch(err => {
        console.error("Render failed", err);
    });
};

window.downloadDesign = function() {
    const imgPreview = document.getElementById('final-preview-image');
    if(imgPreview && imgPreview.src) {
        const link = document.createElement('a');
        link.download = `QR-${currentType}-${Date.now()}.png`;
        link.href = imgPreview.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

window.downloadICS = function() {
    const icsContent = generateIcalString();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    const title = document.getElementById('event-title').value || "event";
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


function updateBubbleTextContrast() {
    if (currentFrame !== 'top-bubble' && currentFrame !== 'label-strip') return;
    
    const color = document.getElementById('frame-color-input').value;
    const textEl = document.getElementById('frame-text-el');
    
    const hex = color.replace('#','');
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    
    textEl.style.color = (yiq >= 128) ? 'black' : 'white';
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
    triggerRegen();
});