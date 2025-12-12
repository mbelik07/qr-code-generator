document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const qrcodeContainer = document.getElementById('qrcode');
    const urlInput = document.getElementById('url-input');
    const textInput = document.getElementById('text-input');
    const colorBgInput = document.getElementById('color-bg');
    const colorFgInput = document.getElementById('color-fg');
    const bgHexDisplay = document.getElementById('bg-hex');
    const fgHexDisplay = document.getElementById('fg-hex');
    const sizeInput = document.getElementById('size-input');
    const sizeValueDisplay = document.getElementById('size-value');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-png');
    
    // State
    let currentType = 'url';
    let correctionLevel = 'H';
    let qrCodeObj = null;

    // Initialize
    generateQR();

    // Event Listeners for Type Switching
    window.switchType = (type) => {
        currentType = type;
        
        // Update UI Tabs
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active', 'text-indigo-600', 'bg-blue-50', 'border-indigo-100');
            btn.classList.add('text-slate-500', 'hover:bg-slate-50');
            // Remove border class from inactive if needed, simplified here
             if(!btn.classList.contains(`btn-${type}`)) {
                btn.style.border = 'none';
             }
        });
        
        const activeBtn = document.getElementById(`btn-${type}`);
        activeBtn.classList.add('active', 'text-indigo-600', 'bg-blue-50', 'border', 'border-indigo-100');
        activeBtn.classList.remove('text-slate-500', 'hover:bg-slate-50');

        // Show/Hide Inputs
        if (type === 'url') {
            document.getElementById('input-group-url').classList.remove('hidden');
            document.getElementById('input-group-text').classList.add('hidden');
        } else {
            document.getElementById('input-group-url').classList.add('hidden');
            document.getElementById('input-group-text').classList.remove('hidden');
        }
    };

    // Event Listeners for Correction Level
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update UI
            document.querySelectorAll('.level-btn').forEach(b => {
                b.classList.remove('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600', 'font-semibold');
                b.classList.add('text-slate-600', 'border-slate-200');
            });
            e.target.classList.add('active', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-600', 'font-semibold');
            e.target.classList.remove('text-slate-600', 'border-slate-200');
            
            // Set Level
            correctionLevel = e.target.dataset.level;
        });
    });

    // Update Hex Displays
    colorBgInput.addEventListener('input', (e) => bgHexDisplay.textContent = e.target.value.toUpperCase());
    colorFgInput.addEventListener('input', (e) => fgHexDisplay.textContent = e.target.value.toUpperCase());

    // Size Slider
    sizeInput.addEventListener('input', (e) => {
        sizeValueDisplay.textContent = `${e.target.value}px`;
    });

    // Generate Button Click
    generateBtn.addEventListener('click', () => {
        generateQR();
    });

    // Download Button Click
    downloadBtn.addEventListener('click', () => {
        downloadQR();
    });

    // Functions
    function generateQR() {
        // Clear previous
        qrcodeContainer.innerHTML = '';
        
        // Get Data
        let data = '';
        if (currentType === 'url') {
            data = urlInput.value.trim();
            if (!data) {
                // Shake effect on empty input
                urlInput.classList.add('border-red-500');
                setTimeout(() => urlInput.classList.remove('border-red-500'), 500);
                return; 
            }
        } else {
            data = textInput.value.trim();
            if (!data) {
                textInput.classList.add('border-red-500');
                setTimeout(() => textInput.classList.remove('border-red-500'), 500);
                return;
            }
        }

        const size = parseInt(sizeInput.value);
        const colorDark = colorFgInput.value;
        const colorLight = colorBgInput.value;

        // Generate
        try {
            // Using QRCode.js library
            qrCodeObj = new QRCode(qrcodeContainer, {
                text: data,
                width: size,
                height: size,
                colorDark : colorDark,
                colorLight : colorLight,
                correctLevel : QRCode.CorrectLevel[correctionLevel || 'H']
            });
            
            // Optional: Visually indicate update
            const wrapper = document.getElementById('qr-container-wrapper');
            wrapper.classList.remove('scale-100');
            wrapper.classList.add('scale-95');
            setTimeout(() => {
                wrapper.classList.remove('scale-95');
                wrapper.classList.add('scale-100');
            }, 100);

        } catch (error) {
            console.error("QR Generation Error:", error);
            alert("Oops! Something went wrong generating the QR code.");
        }
    }

    function downloadQR() {
        const img = qrcodeContainer.querySelector('img');
        if (img && img.src) {
            const link = document.createElement('a');
            link.href = img.src;
            link.download = `qrcode-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No QR Code generated yet!");
        }
    }

});