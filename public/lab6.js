document.addEventListener("DOMContentLoaded", () => {
    const defaultPi = [10, 8, 5, 5, 7, 8, 5, 9, 7, 5, 4, 7, 9, 8, 5];
    let pi = [...defaultPi];

    function renderPiVectorTable() {
        const container = document.getElementById("piTableContainer");
        let html = `<table><thead><tr>`;

        for (let i = 0; i < pi.length; i++) {
            html += `<th>π<sub>${i}</sub></th>`;
        }

        html += `</tr></thead><tbody><tr>`;

        for (let i = 0; i < pi.length; i++) {
            html += `<td><input type="number" value="${pi[i]}" data-index="${i}" class="pi-input" /></td>`;
        }

        html += `</tr></tbody></table>`;
        container.innerHTML = html;

        document.querySelectorAll(".pi-input").forEach(input => {
            input.addEventListener("input", (e) => {
                const index = parseInt(e.target.dataset.index);
                pi[index] = Number(e.target.value);
                updateAll();
            });
        });
    }

    document.getElementById("resetPi").addEventListener("click", () => {
        pi = [...defaultPi];
        updateAll();
    });

    function getPiLabels(indices) {
        return indices.map(i => `π${i}`).join(", ");
    }

    function getPiValues(indices) {
        return indices.map(i => pi[i]).join(", ");
    }

    function calculateLoading(subIndex, elementId, pi_min, subsystems) {
        const cont = document.querySelector(`#${elementId} .dynamic`);
        let html = `<p>pᵢ = π(${subIndex}) / πᵢ, для i = ${subsystems[subIndex].join(', ')}</p>`;
        html += `<div class="p-row">`;

        subsystems[subIndex].forEach(i => {
            html += `<p>p${i} = ${pi_min[subIndex]} / ${pi[i]};</p>`;
        });

        html += `</div>`;
        cont.innerHTML += html;
    }

    function updateCalculations() {
        const subsystems = {
            1: [0, 1, 2, 3, 4, 5],
            2: [6, 7, 8, 9],
            3: [10, 11, 12, 13]
        };

        const pi_min = {
            1: Math.min(...subsystems[1].map(i => pi[i])),
            2: Math.min(...subsystems[2].map(i => pi[i])),
            3: Math.min(...subsystems[3].map(i => pi[i]))
        };

        const cont1 = document.getElementById("cont1");
        document.querySelector("#cont1 .dynamic").innerHTML += `<p>π(1) = min{${getPiLabels(subsystems[1])}} = min{${getPiValues(subsystems[1])}} = ${pi_min[1]}</p>`;
        document.querySelector("#cont1 .dynamic").innerHTML += `<p>π(2) = min{${getPiLabels(subsystems[2])}} = min{${getPiValues(subsystems[2])}} = ${pi_min[2]}</p>`;
        document.querySelector("#cont1 .dynamic").innerHTML += `<p>π(3) = min{${getPiLabels(subsystems[3])}} = min{${getPiValues(subsystems[3])}} = ${pi_min[3]}</p>`;

        calculateLoading(1, "cont2", pi_min, subsystems);
        calculateLoading(2, "cont3", pi_min, subsystems);
        calculateLoading(3, "cont4", pi_min, subsystems);

        const cont5 = document.getElementById("cont5");
        const r1 = pi_min[1] * subsystems[1].length;
        const r2 = pi_min[2] * subsystems[2].length;
        const r3 = pi_min[3] * subsystems[3].length;

        document.querySelector("#cont5 .dynamic").innerHTML += `
          <p>r(1) = ${pi_min[1]} × ${subsystems[1].length} = ${r1};</p>
          <p>r(2) = ${pi_min[2]} × ${subsystems[2].length} = ${r2};</p>
          <p>r(3) = ${pi_min[3]} × ${subsystems[3].length} = ${r3};</p>
        `;

        const cont6 = document.getElementById("cont6");
        const total = r1 + r2 + r3;
        document.querySelector("#cont6 .dynamic").innerHTML += `<p>r = ${r1} + ${r2} + ${r3} = <strong>${total}</strong></p>`;



        // cont7 — обчислення завантаженості системи
        const cont7 = document.getElementById("cont7");
        const piSum = pi.slice(0, 14).reduce((sum, val) => sum + val, 0); // π₁ + ... + π₁₃
        const rho = (total / piSum).toFixed(2);
        document.querySelector("#cont7 .dynamic").innerHTML += `
                    <p>π = ${pi.slice(1, 14).join(" + ")} = ${piSum}</p>
                    <p>ρ = r / π = ${total} / ${piSum} ≈ <strong>${rho}</strong></p>
                `;

        // cont8 — обчислення прискорення системи
        const cont8 = document.getElementById("cont8");
        const maxPi = Math.max(...pi.slice(1, 14));
        const S = (total / maxPi).toFixed(2);
        document.querySelector("#cont8 .dynamic").innerHTML += `
                    <p>max π<sub>i</sub> = ${maxPi}</p>
                    <p>S = r / max π<sub>i</sub> = ${total} / ${maxPi} ≈ <strong>${S}</strong></p>
                `;



    }

    function updateAll() {
        document.querySelector("#cont1 .dynamic").innerHTML = "";
        document.querySelector("#cont2 .dynamic").innerHTML = "";
        document.querySelector("#cont3 .dynamic").innerHTML = "";
        document.querySelector("#cont4 .dynamic").innerHTML = "";
        document.querySelector("#cont5 .dynamic").innerHTML = "";
        document.querySelector("#cont6 .dynamic").innerHTML = "";
        document.querySelector("#cont7 .dynamic").innerHTML = "";
        document.querySelector("#cont8 .dynamic").innerHTML = "";


        renderPiVectorTable();
        updateCalculations();
    }

    // початковий рендеринг
    updateAll();
});
