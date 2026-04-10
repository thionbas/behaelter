const { jsPDF } = window.jspdf;

// GHS Picker
const ghsPicker = document.getElementById('ghsPicker');
for (let i = 1; i <= 9; i++) {
    const id = i.toString().padStart(3, '0');
    const div = document.createElement('div');
    div.className = "flex flex-col items-center p-1 border-2 rounded hover:border-[#064e3b] cursor-pointer bg-white";
    div.innerHTML = `<img src="ghs_${id}.png" class="w-8 h-8 object-contain pointer-events-none"><input type="checkbox" value="${id}" class="ghs-check hidden">`;
    div.onclick = () => {
        const cb = div.querySelector('input');
        if (!cb.checked && document.querySelectorAll('.ghs-check:checked').length >= 6) return;
        cb.checked = !cb.checked;
        div.classList.toggle('border-[#064e3b]', cb.checked);
        div.classList.toggle('bg-green-50', cb.checked);
        updatePreview();
    };
    ghsPicker.appendChild(div);
}

function updatePreview() {
    let plant = document.getElementById('plantPart').value || "ANLAGENTEIL";
    let substance = document.getElementById('substanceName').value || "STOFFNAME";
    const tCase = document.getElementById('textCase').value;
    const signal = document.getElementById('signal').value;
    const pSize = document.getElementById('plantSize').value;
    const sSize = document.getElementById('substanceSize').value;

    document.getElementById('plantSizeDisplay').innerText = pSize;
    document.getElementById('substanceSizeDisplay').innerText = sSize;

    if(tCase === 'upper') {
        plant = plant.toUpperCase();
        substance = substance.toUpperCase();
    }

    // Browser-Vorschau Korrekturfaktor (pt zu px Schätzung)
    const previewFactor = 0.5; 

    const pEl = document.getElementById('pPlant');
    pEl.innerText = plant;
    pEl.style.fontSize = (pSize * previewFactor) + "px";

    const sEl = document.getElementById('pSubstance');
    sEl.innerText = substance;
    sEl.style.fontSize = (sSize * previewFactor) + "px";

    const sigEl = document.getElementById('pSignal');
    sigEl.innerText = signal;
    sigEl.style.fontSize = "24px";

    const ghsZone = document.getElementById('pGhs');
    ghsZone.innerHTML = '';
    document.querySelectorAll('.ghs-check:checked').forEach(cb => {
        const img = document.createElement('img');
        img.src = `ghs_${cb.value}.png`;
        ghsZone.appendChild(img);
    });
}

document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', updatePreview));

document.getElementById('pdfBtn').onclick = () => {
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    
    let plant = document.getElementById('plantPart').value || "";
    let substance = document.getElementById('substanceName').value || "";
    const tCase = document.getElementById('textCase').value;
    const signal = document.getElementById('signal').value;
    const pSize = parseInt(document.getElementById('plantSize').value);
    const sSize = parseInt(document.getElementById('substanceSize').value);
    const selectedGhs = Array.from(document.querySelectorAll('.ghs-check:checked')).map(cb => cb.value);

    if(tCase === 'upper') {
        plant = plant.toUpperCase();
        substance = substance.toUpperCase();
    }

    const midX = 148.5; // Horizontale Mitte

    // 1. ANLAGENTEIL (Oberes Drittel: 0-70mm)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(pSize);
    // Vertikale Zentrierung: 35mm ist die Mitte des Drittels. 
    // Wir addieren ein Drittel der Fontgröße (in mm umgerechnet), um optisch zu zentrieren.
    const pY = 35 + (pSize * 0.353 / 3); 
    doc.text(plant, midX, pY, { align: 'center', maxWidth: 260 });

    // 2. STOFFNAME (Mittleres Drittel: 70-140mm)
    doc.setFontSize(sSize);
    const sY = 105 + (sSize * 0.353 / 3); 
    doc.text(substance, midX, sY, { align: 'center', maxWidth: 260 });

    // 3. GHS & SIGNAL (Unteres Drittel: 140-210mm)
    const iconSize = 45; 
    const gap = 5;
    const totalW = (selectedGhs.length * iconSize) + ((selectedGhs.length - 1) * gap);
    let startX = midX - (totalW / 2);
    const iconY = 150; // Starthöhe für Icons im unteren Drittel

    for(let g = 0; g < selectedGhs.length; g++) {
        doc.addImage(`ghs_${selectedGhs[g]}.png`, 'PNG', startX + (g * (iconSize + gap)), iconY, iconSize, iconSize);
    }

    if(signal) {
        doc.setFontSize(32);
        doc.setFont("helvetica", "bolditalic");
        // Signalwort bei ca 200mm (kurz vor dem unteren Rand)
        doc.text(signal, midX, 202, { align: 'center' });
    }

    doc.save(`A4_Label_${plant || 'Export'}.pdf`);
};

updatePreview();
