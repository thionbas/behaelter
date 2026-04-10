const { jsPDF } = window.jspdf;

// GHS Picker (Limit 6)
const ghsPicker = document.getElementById('ghsPicker');
for (let i = 1; i <= 9; i++) {
    const id = i.toString().padStart(3, '0');
    const div = document.createElement('div');
    div.className = "flex flex-col items-center p-1 border-2 rounded hover:border-[#064e3b] cursor-pointer";
    div.innerHTML = `<img src="ghs_${id}.png" class="w-8 h-8 object-contain pointer-events-none"><input type="checkbox" value="${id}" class="ghs-check hidden">`;
    div.onclick = () => {
        const cb = div.querySelector('input');
        const count = document.querySelectorAll('.ghs-check:checked').length;
        if (!cb.checked && count >= 6) return alert("Max. 6 Symbole");
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

    // Vorschau Texte
    const pEl = document.getElementById('pPlant');
    pEl.innerText = plant;
    pEl.style.fontSize = (pSize * 0.8) + "px"; // Skalierung für Browser-View

    const sEl = document.getElementById('pSubstance');
    sEl.innerText = substance;
    sEl.style.fontSize = (sSize * 0.8) + "px";

    document.getElementById('pSignal').innerText = signal;

    // Vorschau GHS
    const ghsZone = document.getElementById('pGhs');
    ghsZone.innerHTML = '';
    document.querySelectorAll('.ghs-check:checked').forEach(cb => {
        const img = document.createElement('img');
        img.src = `ghs_${cb.value}.png`;
        ghsZone.appendChild(img);
    });
}

document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', updatePreview));

// PDF Druck (A4 Landscape)
document.getElementById('pdfBtn').onclick = () => {
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    
    let plant = document.getElementById('plantPart').value;
    let substance = document.getElementById('substanceName').value;
    const tCase = document.getElementById('textCase').value;
    const signal = document.getElementById('signal').value;
    const pSize = parseInt(document.getElementById('plantSize').value);
    const sSize = parseInt(document.getElementById('substanceSize').value);
    const selectedGhs = Array.from(document.querySelectorAll('.ghs-check:checked')).map(cb => cb.value);

    if(tCase === 'upper') {
        plant = plant.toUpperCase();
        substance = substance.toUpperCase();
    }

    const midX = 148.5; // Mitte A4 Landscape (297 / 2)

    // 1. ANLAGENTEIL (Oben) - Zentriert bei Y=40
    doc.setFont("helvetica", "bold");
    doc.setFontSize(pSize * 1.8); // Faktor für Druckgröße
    doc.text(plant, midX, 45, { align: 'center', maxWidth: 270 });

    // 2. STOFFNAME (Mitte) - Zentriert bei Y=110
    doc.setFontSize(sSize * 1.8);
    doc.text(substance, midX, 110, { align: 'center', maxWidth: 270 });

    // 3. GHS & SIGNAL (Unten)
    const iconSize = 42; 
    const gap = 6;
    const totalW = (selectedGhs.length * iconSize) + ((selectedGhs.length - 1) * gap);
    let startX = midX - (totalW / 2);

    for(let g = 0; g < selectedGhs.length; g++) {
        doc.addImage(`ghs_${selectedGhs[g]}.png`, 'PNG', startX + (g * (iconSize + gap)), 145, iconSize, iconSize);
    }

    if(signal) {
        doc.setFontSize(30);
        doc.setFont("helvetica", "bolditalic");
        doc.text(signal, midX, 198, { align: 'center' });
    }

    doc.save(`Behaelter_${plant || 'Label'}.pdf`);
};

updatePreview();
