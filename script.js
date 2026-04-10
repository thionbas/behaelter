const { jsPDF } = window.jspdf;

// GHS UI Generator (Erhöht auf 6)
const ghsPicker = document.getElementById('ghsPicker');
for (let i = 1; i <= 9; i++) {
    const id = i.toString().padStart(3, '0'); 
    const fileName = `ghs_${id}.png`; 
    
    const div = document.createElement('div');
    div.className = "flex flex-col items-center p-2 border-2 rounded bg-white hover:border-[#064e3b] transition cursor-pointer";
    div.innerHTML = `
        <img src="${fileName}" class="w-10 h-10 object-contain mb-1" onerror="this.style.opacity='0.3';">
        <input type="checkbox" value="${id}" class="ghs-check cursor-pointer">
    `;
    
    div.onclick = (e) => {
        if(e.target.tagName !== 'INPUT') {
            const cb = div.querySelector('input');
            const selected = document.querySelectorAll('.ghs-check:checked');
            if(!cb.checked && selected.length >= 6) { // Jetzt 6 Symbole
                alert("Maximal 6 Symbole erlaubt.");
                return;
            }
            cb.checked = !cb.checked;
            updatePreview();
        }
    };
    ghsPicker.appendChild(div);
}

function updatePreview() {
    let plant = document.getElementById('plantPart').value || "ANLAGENTEIL";
    let substance = document.getElementById('substanceName').value || "STOFFNAME";
    const textCase = document.getElementById('textCase').value;
    const signal = document.getElementById('signal').value;
    
    const pSize = document.getElementById('plantSize').value;
    const sSize = document.getElementById('substanceSize').value;
    
    document.getElementById('plantSizeDisplay').innerText = pSize;
    document.getElementById('substanceSizeDisplay').innerText = sSize;

    if(textCase === 'upper') {
        plant = plant.toUpperCase();
        substance = substance.toUpperCase();
    }

    // Texte in Vorschau
    const plantEl = document.getElementById('pPlant');
    plantEl.innerText = plant;
    plantEl.style.fontSize = (pSize / 10) + "rem";

    const subEl = document.getElementById('pSubstance');
    subEl.innerText = substance;
    subEl.style.fontSize = (sSize / 10) + "rem";

    document.getElementById('pSignal').innerText = signal;

    // GHS in Vorschau
    const ghsZone = document.getElementById('pGhs');
    ghsZone.innerHTML = '';
    const selected = document.querySelectorAll('.ghs-check:checked');
    selected.forEach(cb => {
        const img = document.createElement('img');
        img.src = `ghs_${cb.value}.png`;
        ghsZone.appendChild(img);
    });
}

document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', updatePreview);
});

// PDF Export (A4 Landscape, Drittel-Aufteilung)
document.getElementById('pdfBtn').onclick = async () => {
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    
    let plant = document.getElementById('plantPart').value || "";
    let substance = document.getElementById('substanceName').value || "";
    const textCase = document.getElementById('textCase').value;
    const signal = document.getElementById('signal').value;
    const pSize = parseInt(document.getElementById('plantSize').value);
    const sSize = parseInt(document.getElementById('substanceSize').value);
    const selectedGhs = Array.from(document.querySelectorAll('.ghs-check:checked')).map(cb => cb.value);

    if(textCase === 'upper') {
        plant = plant.toUpperCase();
        substance = substance.toUpperCase();
    }

    const pageWidth = 297;
    const pageHeight = 210;

    // 1. OBERES DRITTEL: Anlagenteil
    doc.setFont("helvetica", "bold");
    doc.setFontSize(pSize * 1.4);
    doc.text(plant, pageWidth / 2, 45, { align: 'center', maxWidth: 280 });

    // 2. MITTLERES DRITTEL: Stoffname
    doc.setFont("helvetica", "bold");
    doc.setFontSize(sSize * 1.4);
    doc.text(substance, pageWidth / 2, 110, { align: 'center', maxWidth: 280 });

    // 3. UNTERES DRITTEL: GHS & Signalwort
    // GHS Symbole
    const iconSize = 40; 
    const gap = 8;
    const totalIconsWidth = (selectedGhs.length * iconSize) + ((selectedGhs.length - 1) * gap);
    let startX = (pageWidth - totalIconsWidth) / 2;
    const iconY = 145;

    for(let g = 0; g < selectedGhs.length; g++) {
        const fileName = `ghs_${selectedGhs[g]}.png`;
        try {
            doc.addImage(fileName, 'PNG', startX + (g * (iconSize + gap)), iconY, iconSize, iconSize);
        } catch(e) { console.error(e); }
    }

    // Signalwort (ganz unten)
    if(signal) {
        doc.setFontSize(24);
        doc.setFont("helvetica", "bolditalic");
        doc.text(signal, pageWidth / 2, 198, { align: 'center' });
    }

    doc.save(`Behaelter_${plant || 'Export'}.pdf`);
};

updatePreview();
