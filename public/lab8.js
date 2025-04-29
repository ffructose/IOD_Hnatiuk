// lab8.js

const defaultData = {
  variant: 7,
  parallelPart: 0.4,
  processors: 11,
  minPercent: 15,
  maxPercent: 25
};

let currentData = { ...defaultData };

function createEditableTable(data) {
  const container = document.getElementById("piTableContainer");
  container.innerHTML = '';

  const table = document.createElement("table");
  table.innerHTML = `
  <tr><th>Варіант №</th><td>${data.variant}</td></tr>
  <tr><td>Частка паралельних обчислень (1 - \\(\\beta\\))</td>
      <td><input id="parallelPart" type="number" step="0.01" value="${data.parallelPart}"></td></tr>
  <tr><td>Максимальне можливе прискорення у випадку використання l однакових універсальних процесорів</td>
      <td><input id="processors" type="number" value="${data.processors}"></td></tr>
  <tr><td>Необхідно забезпечити від \\(a_1\\) до \\(a_2\\) від максимально можливого прискоренняя</td>
      <td><input id="minPercent" type="number" value="${data.minPercent}">% - 
          <input id="maxPercent" type="number" value="${data.maxPercent}">%</td></tr>
`;
  MathJax.typeset();


  container.appendChild(table);
  MathJax.typeset();
}

function resetDefaults() {
  currentData = { ...defaultData };
  createEditableTable(currentData);
}

function calculateAndDisplay() {
  // Зчитуємо значення
  const p = parseFloat(document.getElementById("parallelPart").value);
  const l = parseInt(document.getElementById("processors").value);
  const a1 = parseFloat(document.getElementById("minPercent").value);
  const a2 = parseFloat(document.getElementById("maxPercent").value);
  const beta = 1 - p;
  const Smax = 1 / beta;

  // Amdahl's Law
  const S_l = l / (l * beta + (1 - beta));
  const S_theor = 1 / beta;

  const rangeMin = (a1 / 100) * S_theor;
  const rangeMax = (a2 / 100) * S_theor;

  // Знаходимо межі l, при яких прискорення входить у діапазон
  const a = (S_theor * (a1 / 100));
  const aa = (S_theor * (a2 / 100));
  const b = beta;
  const c = p;

  const l_min = (a * c) / (1 - a * b);
  const l_max = (aa * c) / (1 - aa * b);

  const cont0 = document.querySelector("#cont0 .dynamic");
  cont0.innerHTML = `$$\\beta = 1 - ${p.toFixed(1)} = ${(1 - p).toFixed(1)}$$`;

  const cont00 = document.querySelector("#cont00 .dynamic");
  cont00.innerHTML = `\\(1 - \\beta = ${p.toFixed(1)}\\)`;
  MathJax.typeset();


  // Виводимо формули у форматі LaTeX
  const cont1 = document.querySelector("#cont1 .dynamic");
  cont1.innerHTML = `
    $$S_{${l}} = \\frac{${l}}{${l} \\cdot ${beta.toFixed(1)} + (1 - ${beta.toFixed(1)})} = ${S_l.toFixed(3)}$$
  `;

  const cont2 = document.querySelector("#cont2 .dynamic");
  cont2.innerHTML = `

    $$
    ${a2 / 100} \\cdot S_{\\text{max}} \\ge S_l \\ge ${a1 / 100} \\cdot S_{\\text{max}},
    $$
    $$
    S_{\\text{max}} =  \\frac{1}{\\beta} = \\frac{1}{${beta.toFixed(1)}} = ${Smax.toFixed(3)}
    $$
    $$
    ${(a2 / 100).toFixed(2)} \\cdot ${Smax.toFixed(3)} \\ge \\frac{l}{l \\cdot ${beta.toFixed(1)} + ${(1 - beta).toFixed(1)}} \\ge ${(a1 / 100).toFixed(2)} \\cdot ${Smax.toFixed(3)},
    $$
    $$
    ${(rangeMax).toFixed(2)} \\ge  \\frac{l}{l \\cdot ${beta.toFixed(1)} + ${(1 - beta).toFixed(1)}} \\ge ${(rangeMin).toFixed(2)},
    $$
    $$
    нижня Межа: l \\ge ${(S_theor * (a1 / 100)).toFixed(2)} \\cdot (l \\cdot ${beta.toFixed(1)} + ${(1 - beta).toFixed(1)}),
    $$
    $$
    верхня Межа: l \\le ${(S_theor * (a2 / 100)).toFixed(2)} \\cdot (l \\cdot ${beta.toFixed(1)} + ${(1 - beta).toFixed(1)}),
    $$
    $$
    нижня Межа: l \\ge ${l_min.toFixed(4)}
    $$
    $$
    l \\in [${l_min.toFixed(4)},\\ ${l_max.toFixed(4)}]
    $$
    ${(Math.ceil(l_min) <= Math.floor(l_max)
      ? `<p><b>Відповідь: ${Math.ceil(l_min)}</b></p>`
      : `<p><b>Відповідь: немає жодного цілого числа в цьому проміжку</b></p>`
    )}
    
  `;



  MathJax.typeset();
}

document.addEventListener("DOMContentLoaded", () => {
  createEditableTable(currentData);
  document.getElementById("resetPi").addEventListener("click", resetDefaults);
  document.getElementById("enterPi").addEventListener("click", calculateAndDisplay);
});
