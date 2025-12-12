document.addEventListener('DOMContentLoaded', () => {
    
    // Core Elements
    const qrcodeContainer = document.getElementById('qrcode');
    const captureWrapper = document.getElementById('capture-wrapper');
    const frameWrapper = document.getElementById('frame-wrapper');
    const frameTextElement = document.getElementById('frame-text');
    
    // Inputs
    const urlInput = document.getElementById('url-input');
    const textInput = document.getElementById('text-input');
    const colorBgInput = document.getElementById('color-bg');
    const colorFgInput = document.getElementById('color-fg');
    const sizeInput = document.getElementById('size-input');
    const sizeValueDisplay = document.getElementById('size-value');
    
    // Frame Inputs
    const frameTextInput = document.getElementById('frame-text-input');
    const frameColorInput = document.getElementById('frame-color-input');
    const frameColorHex = document.getElementById('frame-color-hex');
    const frameCustomizationPanel = document.getElementById('frame-customization');
    
    // Buttons
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-png');
    
    // State
    let currentType = 'url';
    let correctionLevel = 'H';
    let currentFrame = 'none';
    
    // --- Initialization ---
    generateQR();
    selectFrame('none'); // Default

    // --- Type Switching ---
    window.switchType = (type) => {
        currentType = type;
        
        // UI Tabs
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active', 'text-indigo-600', 'bg-blue-50', 'border', 'border-indigo-100');
            btn.classList.add('text-slate-500', 'hover:bg-slate-50');
        });
        const activeBtn = document.getElementById(`btn-${type}`);
        activeBtn.classList.add('active', 'text-indigo-600', 'bg-blue-50', 'border', 'border-indigo-100');
        activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-50');

        // Toggle Inputs
        if (type === 'url') {
            document.getElementById('input-group-url').classList.remove('hidden');
            document.getElementById('input-group-text').classList.add('hidden');
        } else {
            document.getElementById('input-group-url').classList.add('hidden');
            document.getElementById('input-group-text').classList.remove('hidden');
        }
    };

    // --- Frame Selection ---
    window.selectFrame = (frame) => {
        currentFrame = frame;
        
        // Visual selection state
        document.querySelectorAll('.frame-option').forEach(el => el.classList.remove('selected'));
        document.getElementById(`frame-opt-${frame}`).parentElement.classList.add('selected');

        // Apply classes to wrapper for CSS styling
        captureWrapper.className = `inline-block p-4 bg-transparent transition-all duration-300 frame-style-${frame}`;
        
        // Handle Frame Inputs Visibility
        if (frame === 'none') {
            frameCustomizationPanel.classList.add('hidden');
            frameWrapper.style.border = 'none';
            frameWrapper.style.padding = '0';
            frameWrapper.style.borderRadius = '0';
            frameTextElement.classList.add('hidden');
        } else {
            frameCustomizationPanel.classList.remove('hidden');
            updateFrameStyles();
        }
    };

    // --- Style Updates ---
    function updateFrameStyles() {
        const color = frameColorInput.value;
        const text = frameTextInput.value;

        // Update hex display
        frameColorHex.value = color.toUpperCase();

        // Update Text
        frameTextElement.textContent = text;

        if (currentFrame === 'simple') {
            frameWrapper.style.border = `12px solid ${color}`;
            frameWrapper.style.borderRadius = '24px';
            frameWrapper.style.padding = '16px';
            frameTextElement.style.display = 'none';
        } 
        else if (currentFrame === 'polaroid') {
            frameWrapper.style.border = `10px solid ${color}`;
            frameWrapper.style.borderRadius = '20px';
            frameWrapper.style.padding = '16px';
            frameWrapper.style.paddingBottom = '50px';
            frameTextElement.style.display = 'block';
            frameTextElement.style.color = color;
            frameTextElement.style.bottom = '12px';
            frameTextElement.style.top = 'auto';
            frameTextElement.style.background = 'transparent';
            frameTextElement.style.boxShadow = 'none';
            frameTextElement.style.position = 'absolute';
        }
        else if (currentFrame === 'top-bubble') {
            frameWrapper.style.border = `4px solid ${color}`;
            frameWrapper.style.borderRadius = '20px';
            frameWrapper.style.padding = '20px';
            frameTextElement.style.display = 'block';
            frameTextElement.style.background = color;
            // Contrast text color for bubble
            frameTextElement.style.color = getContrastYIQ(color); 
            frameTextElement.style.top = '-20px';
            frameTextElement.style.bottom = 'auto';
            frameTextElement.style.position = 'absolute';
            frameTextElement.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }
    }
    
    // Helper for text contrast
    function getContrastYIQ(hexcolor){
        hexcolor = hexcolor.replace("#", "");
        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? 'black' : 'white';
    }


    // --- Event Listeners ---
    
    // Frame Controls
    frameTextInput.addEventListener('input', updateFrameStyles);
    frameColorInput.addEventListener('input', updateFrameStyles);

    // QR Controls
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.level-btn').forEach(b => {
                b.classList.remove('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
                b.classList.add('text-slate-600', 'border-slate-200');
            });
            e.target.classList.add('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
            e.target.classList.remove('text-slate-600', 'border-slate-200');
            correctionLevel = e.target.dataset.level;
        });
    });

    sizeInput.addEventListener('input', (e) => {
        sizeValueDisplay.textContent = `${e.target.value}px`;
    });

    generateBtn.addEventListener('click', generateQR);
    
    // --- Core Logic ---

    function generateQR() {
        // Cleanup
        qrcodeContainer.innerHTML = '';
        
        // Data
        let data = currentType === 'url' ? urlInput.value.trim() : textInput.value.trim();
        if (!data) data = 'https://github.com/mbelik07';

        const size = parseInt(sizeInput.value);
        const colorDark = colorFgInput.value;
        const colorLight = colorBgInput.value;

        try {
            const qr = new QRCode(qrcodeContainer, {
                text: data,
                width: size,
                height: size,
                colorDark : colorDark,
                colorLight : colorLight,
                correctLevel : QRCode.CorrectLevel[correctionLevel || 'H']
            });
            
            // Re-apply frame styles to ensure they wrap the new QR correctly
            updateFrameStyles();
            
        } catch (error) {
            console.error(error);
        }
    }

    // --- Download Logic (Composite) ---
    downloadBtn.addEventListener('click', () => {
        
        // Use html2canvas to screenshot the wrapper div
        // We use 'captureWrapper' to ensuring margins/padding are handled if needed, 
        // or just 'frameWrapper' for the tightest fit. 
        // Let's use frameWrapper to avoid getting the transparent bg of the container.
        
        const elementToCapture = frameWrapper;
        
        html2canvas(elementToCapture, {
            backgroundColor: null, // Transparent if png
            scale: 2 // High res
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `qr-design-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

});