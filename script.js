document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elements ---
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
    const typeBtns = document.querySelectorAll('.type-btn');
    const frameOptions = document.querySelectorAll('.frame-option');
    const levelBtns = document.querySelectorAll('.level-btn');
    
    // --- State ---
    let currentType = 'url';
    let correctionLevel = 'H';
    let currentFrame = 'none';
    
    // --- Event Bindings ---

    // 1. Type Switching
    typeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type; // use currentTarget to hit the button
            handleTypeSwitch(type);
        });
    });

    // 2. Frame Selection
    frameOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
            const frame = e.currentTarget.dataset.frame;
            handleFrameSelect(frame);
        });
    });

    // 3. Level Selection
    levelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // UI Update
            levelBtns.forEach(b => {
                b.classList.remove('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
                b.classList.add('text-slate-600', 'border-slate-200');
            });
            e.currentTarget.classList.add('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600');
            e.currentTarget.classList.remove('text-slate-600', 'border-slate-200');
            
            correctionLevel = e.currentTarget.dataset.level;
        });
    });

    // 4. Inputs
    sizeInput.addEventListener('input', (e) => {
        sizeValueDisplay.textContent = `${e.target.value}px`;
    });

    frameTextInput.addEventListener('input', updateFrameStyles);
    frameColorInput.addEventListener('input', updateFrameStyles);

    // 5. Actions
    generateBtn.addEventListener('click', generateQR);
    
    downloadBtn.addEventListener('click', () => {
        const elementToCapture = frameWrapper;
        
        // Ensure background is transparent/white as needed
        html2canvas(elementToCapture, {
            backgroundColor: null, 
            scale: 2 // High res
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `qr-design-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(err => {
            console.error("Download error:", err);
            alert("Could not generate image. Please try again.");
        });
    });


    // --- Logic Functions ---

    function handleTypeSwitch(type) {
        currentType = type;
        
        // UI Tabs
        typeBtns.forEach(btn => {
            btn.classList.remove('active', 'text-indigo-600', 'bg-blue-50', 'border', 'border-indigo-100');
            btn.classList.add('text-slate-500', 'hover:bg-slate-50');
        });
        
        const activeBtn = document.getElementById(`btn-${type}`);
        if(activeBtn) {
            activeBtn.classList.add('active', 'text-indigo-600', 'bg-blue-50', 'border', 'border-indigo-100');
            activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-50');
        }

        // Toggle Inputs
        if (type === 'url') {
            document.getElementById('input-group-url').classList.remove('hidden');
            document.getElementById('input-group-text').classList.add('hidden');
        } else {
            document.getElementById('input-group-url').classList.add('hidden');
            document.getElementById('input-group-text').classList.remove('hidden');
        }
    }

    function handleFrameSelect(frame) {
        currentFrame = frame;
        
        // Visual selection state
        frameOptions.forEach(el => el.classList.remove('selected'));
        const activeOpt = document.getElementById(`opt-${frame}`);
        if (activeOpt) activeOpt.classList.add('selected');

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
    }

    function updateFrameStyles() {
        if (!frameColorInput || !frameTextInput) return;

        const color = frameColorInput.value;
        const text = frameTextInput.value;

        // Update hex display
        if (frameColorHex) frameColorHex.value = color.toUpperCase();

        // Update Text
        if (frameTextElement) frameTextElement.textContent = text;

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
            frameTextElement.style.left = '0';
            frameTextElement.style.right = '0';
        }
        else if (currentFrame === 'top-bubble') {
            frameWrapper.style.border = `4px solid ${color}`;
            frameWrapper.style.borderRadius = '20px';
            frameWrapper.style.padding = '20px';
            frameWrapper.style.paddingBottom = '20px'; // Reset
            frameTextElement.style.display = 'block';
            frameTextElement.style.background = color;
            frameTextElement.style.color = getContrastYIQ(color); 
            frameTextElement.style.top = '-20px';
            frameTextElement.style.bottom = 'auto';
            frameTextElement.style.position = 'absolute';
            frameTextElement.style.left = '50%';
            frameTextElement.style.right = 'auto';
            frameTextElement.style.transform = 'translateX(-50%)';
            frameTextElement.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            frameTextElement.style.padding = '8px 24px';
            frameTextElement.style.borderRadius = '99px';
            frameTextElement.style.whiteSpace = 'nowrap';
        }
    }
    
    function getContrastYIQ(hexcolor){
        if (!hexcolor) return 'white';
        hexcolor = hexcolor.replace("#", "");
        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? 'black' : 'white';
    }

    function generateQR() {
        // Cleanup old QR
        qrcodeContainer.innerHTML = '';
        
        let data = '';
        if (currentType === 'url') {
            data = urlInput.value.trim();
            if (!data) data = 'https://github.com/mbelik07';
        } else {
            data = textInput.value.trim();
            if (!data) data = 'Hello World';
        }

        const size = parseInt(sizeInput.value) || 300;
        const colorDark = colorFgInput.value;
        const colorLight = colorBgInput.value;

        // Short timeout to ensure DOM is ready for repainting
        setTimeout(() => {
            try {
                new QRCode(qrcodeContainer, {
                    text: data,
                    width: size,
                    height: size,
                    colorDark : colorDark,
                    colorLight : colorLight,
                    correctLevel : QRCode.CorrectLevel[correctionLevel]
                });
                
                // Re-apply frame styles
                updateFrameStyles();
                
            } catch (error) {
                console.error("QR Error", error);
                alert("Error generating code. Please check your text length.");
            }
        }, 10);
    }

    // --- Boot ---
    generateQR();

});