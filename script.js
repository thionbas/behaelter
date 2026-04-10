
const { jsPDF } = window.jspdf;

// GHS UI Generator
const ghsPicker = document.getElementById('ghsPicker');
for (let i = 1; i <= 9; i++) {
    const id = i.toString().padStart(3, '0'); 
    const fileName = `ghs_${id}.png`; 
    
    const div = document.createElement('div');
    div.className = "flex flex-col items-center p-2 border-2 rounded bg-white hover:border-[#064e3b] transition cursor-pointer";
    div.innerHTML = `
        <img src="${fileName}" class="w-10 h-10 object-contain mb-1" onerror="this.style.opacity='0.3';">
        <div class="flex items-center gap-1">
            <input type="checkbox" value="${id}" class="ghs-check cursor-pointer">
            <span class="text-[9px] font-bold">GHS ${i}</span>
        </div>
    `;
    
    div.onclick = (e) => {
        if(e.target.tagName !== 'INPUT') {
            const cb = div.querySelector('input');
            const selected = document.querySelectorAll('.ghs-check:checked');
            if(!cb.checked && selected.length >= 5) {
                alert("Maximal 5 Symbole erlaubt.");
                return;
            }
            cb.checked = !cb.checked;
            updatePreview();
        }
    };
    ghsPicker.appendChild(div);
}

function updatePreview() {
    let text = document.getElementById('mainText').value || "TEXT";
    const textCase = document.getElementById('textCase').value;
    const signal = document.getElementById('signal').value;
    const textSize = document.getElementById('textSize').value;
    
    document.getElementById('textSizeDisplay').innerText = textSize;
    const selected = document.querySelectorAll('.ghs-check:checked');

    if(textCase === 'upper') text = text.toUpperCase();
    else if(textCase === 'lower') text = text.toLowerCase();

    // Text & Signalwort
    document.getElementById('pText').innerText = text;
    document.getElementById('pText').style.fontSize = (textSize / 10) + "rem";
    document.getElementById('pSignal').innerText = signal;

    // GHS Symbole
    const ghsZone = document.getElementById('pGhs');
    ghsZone.innerHTML = '';
    selected.forEach(cb => {
        const img = document.createElement('img');
        img.src = `ghs_${cb.value}.png`;
        ghsZone.appendChild(img);
    });
}

document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
});

// PDF Export (A4 Landscape)
document.getElementById('pdfBtn').onclick = async () => {
    // 'l' für landscape, 'mm', 'a4'
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    
    let text = document.getElementById('mainText').value || "TEXT";
    const textCase = document.getElementById('textCase').value;
    const signal = document.getElementById('signal').value;
    const textSize = parseInt(document.getElementById('textSize').value);
    const selectedGhs = Array.from(document.querySelectorAll('.ghs-check:checked')).map(cb => cb.value);

    if(textCase === 'upper') text = text.toUpperCase();
    else if(textCase === 'lower') text = text.toLowerCase();

    const pageWidth = 297;
    const pageHeight = 210;

    // 1. Haupttext zentriert im oberen Bereich
    doc.setFont("helvetica", "bold");
    doc.setFontSize(textSize * 1.5); // Skalierung für A4
    doc.text(text, pageWidth / 2, pageHeight / 3, { align: 'center', maxWidth: 260 });

    // 2. GHS Symbole symmetrisch im unteren Viertel
    const iconSize = 45; // Große Symbole
    const gap = 10;
    const totalIconsWidth = (selectedGhs.length * iconSize) + ((selectedGhs.length - 1) * gap);
    let startX = (pageWidth - totalIconsWidth) / 2;
    const iconY = 140;

    for(let g = 0; g < selectedGhs.length; g++) {
        const fileName = `ghs_${selectedGhs[g]}.png`;
        try {
            doc.addImage(fileName, 'PNG', startX + (g * (iconSize + gap)), iconY, iconSize, iconSize);
        } catch(e) { console.error(e); }
    }

    // 3. Signalwort ganz unten mittig
    if(signal) {
        doc.setFontSize(24);
        doc.setFont("helvetica", "bolditalic");
        doc.text(signal, pageWidth / 2, 195, { align: 'center' });
    }

    doc.save("Behaelter_A4.pdf");
};

updatePreview();
