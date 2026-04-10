const { jsPDF } = window.jspdf;

// GHS Picker (identisch wie zuvor)
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

    // --- Synchronisierte Skalierung ---
    // Ein A4 Blatt ist 297mm breit. Wenn die Vorschau z.B. 700px breit ist,
    // entspricht 1mm im PDF etwa 2.35px im Browser.
    const previewWidth = document.getElementById('previewCard').offsetWidth;
    const scaleFactor = previewWidth / 297; 
    const ptToMm = 0.3527; // 1pt ist 0.3527mm

    const pEl = document.getElementById('pPlant');
    pEl.innerText = plant;
    // Schriftgröße in px = Punktwert * mm-Faktor * Vorschau-Skalierung
    pEl.style.fontSize = (pSize * ptToMm * scaleFactor) + "px";

    const sEl = document.getElementById('pSubstance');
    sEl.innerText = substance;
    sEl.style.fontSize = (sSize * ptToMm * scaleFactor) + "px";

    const sigEl = document.getElementById('pSignal');
    sigEl.innerText = signal;
    sigEl.style.fontSize = (30 * ptToMm * scaleFactor) + "px";

    const ghsZone = document.getElementById('pGhs');
    ghsZone.innerHTML = '';
    document.querySelectorAll('.ghs-check:checked').forEach(cb => {
        const img = document.createElement('img');
        img.src = `ghs_${cb.value}.png`;
        ghsZone.appendChild(img);
    });
}

// Event Listener
window.addEventListener('resize', updatePreview);
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

    const midX = 148.5; // Horizontale Mitte (297 / 2)

    // 1. ANLAGENTEIL (Mitte des oberen Drittels = 35mm)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(pSize);
    // baseline: 'middle' sorgt dafür, dass y=35 die vertikale MITTE des Textes ist
    doc.text(plant, midX, 35, { align: 'center', baseline: 'middle', maxWidth: 280 });

    // 2. STOFFNAME (Mitte des mittleren Drittels = 105mm)
    doc.setFontSize(sSize);
    doc.text(substance, midX, 105, { align: 'center', baseline: 'middle', maxWidth: 280 });

    // 3. GHS & SIGNAL (Unteres Drittel)
    const iconSize = 45; 
    const gap = 5;
    const totalW = (selectedGhs.length * iconSize) + ((selectedGhs.length - 1) * gap);
    let startX = midX - (totalW / 2);
    
    // GHS Symbole etwas höher im unteren Drittel ansetzen (ca. 165mm)
    for(let g = 0; g < selectedGhs.length; g++) {
        doc.addImage(`ghs_${selectedGhs[g]}.png`, 'PNG', startX + (g * (iconSize + gap)), 145, iconSize, iconSize);
    }

    if(signal) {
        doc.setFontSize(32);
        doc.setFont("helvetica", "bolditalic");
        // Signalwort bei 198mm (kurz vor dem unteren Rand)
        doc.text(signal, midX, 198, { align: 'center', baseline: 'middle' });
    }

    doc.save(`Behaelter_${plant || 'Label'}.pdf`);
};

// Initialer Aufruf
updatePreview();
