// Global Variables
let currentType = 'url';
let correctionLevel = 'H';
let currentFrame = 'none';

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

    // Toggle Inputs
    if (type === 'url') {
        document.getElementById('input-group-url').classList.remove('hidden');
        document.getElementById('input-group-text').classList.add('hidden');
    } else {
        document.getElementById('input-group-url').classList.add('hidden');
        document.getElementById('input-group-text').classList.remove('hidden');
    }

    generateQR();
};

window.selectFrame = function(frame) {
    currentFrame = frame;
    
    // UI Options State
    document.querySelectorAll('.frame-option').forEach(el => el.classList.remove('selected'));
    document.getElementById(`opt-${frame}`).classList.add('selected');

    // Apply Style Class to Frame Box
    const box = document.getElementById('frame-box');
    
    // Reset classes
    box.className = 'relative inline-flex flex-col items-center justify-center bg-white transition-all duration-300';
    // Add specific frame class
    box.classList.add(`frame-${frame}`);

    // Toggle Customization Panel
    const panel = document.getElementById('frame-customization');
    if (frame === 'none') {
        panel.classList.add('hidden');
    } else {
        panel.classList.remove('hidden');
    }
    
    // Update color contrast for bubble if needed (simple check)
    updateBubbleTextContrast();
};

window.updateFrameColor = function(color) {
    const box = document.getElementById('frame-box');
    // Set CSS Variable
    box.style.setProperty('--frame-color', color);
    
    // UI Text Update
    document.getElementById('frame-color-hex').textContent = color.toUpperCase();
    
    updateBubbleTextContrast();
};

window.updateFrameText = function(text) {
    const el = document.getElementById('frame-text-el');
    el.textContent = text;
};

window.setCorrection = function(level, btnElement) {
    correctionLevel = level;
    
    // UI
    document.querySelectorAll('.level-btn').forEach(b => {
        b.classList.remove('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
        b.classList.add('text-slate-600', 'border-slate-200');
    });
    btnElement.classList.add('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
    btnElement.classList.remove('text-slate-600', 'border-slate-200');

    generateQR();
};

window.updateSize = function(val) {
    document.getElementById('size-value').textContent = val + 'px';
    // Debounce or just generate? For size, usually wait for mouse up, but we can do live
    // Let's rely on the generate button generally for Size to not lag, but the user requested live text
    // We'll leave size as non-live in 'oninput' unless desired. 
    // Wait, I added oninput="updateSize", let's not auto-regen on size drag to avoid lag.
};

window.generateQR = function() {
    const container = document.getElementById('qrcode');
    if (!container) return;
    
    // Clear
    container.innerHTML = '';
    
    // Data
    let data;
    if (currentType === 'url') {
        data = document.getElementById('url-input').value.trim() || "https://github.com/mbelik07";
    } else {
        data = document.getElementById('text-input').value.trim() || "Hello World";
    }

    const size = parseInt(document.getElementById('size-input').value) || 300;
    const colorDark = document.getElementById('color-fg').value;
    const colorLight = document.getElementById('color-bg').value;

    try {
        if(typeof QRCode === 'undefined') {
            console.error("QRCode library not loaded yet.");
            return;
        }

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

window.downloadDesign = function() {
    // Capture the frame-box
    const element = document.getElementById('frame-box');
    
    html2canvas(element, {
        scale: 2,
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'QR-Design.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
};

function updateBubbleTextContrast() {
    if (currentFrame !== 'top-bubble') return;
    
    const color = document.getElementById('frame-color-input').value;
    const textEl = document.getElementById('frame-text-el');
    
    // Simple YIQ
    const hex = color.replace('#','');
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    
    textEl.style.color = (yiq >= 128) ? 'black' : 'white';
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
    generateQR();
});