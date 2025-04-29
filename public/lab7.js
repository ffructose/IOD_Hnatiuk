// lab7.js

// Змінні, які можна змінювати за варіантом:
const N = 16;      // Загальна кількість операцій
const n = 4;       // Послідовних операцій
const s = 4;       // Кількість процесорів

// Обчислення
const beta = n / N;
const R = s / (s * beta + (1 - beta));
const E = R / s;

// Форматування до потрібного вигляду
const betaText = `\\( \\beta = \\frac{${n}}{${N}} = ${(n / N).toFixed(2)} \\)`;
const RText = `\\[
R_3 = \\frac{${s}}{${s} \\cdot ${n}/${N} + \\left(1 - ${n}/${N}\\right)} = 
\\frac{${s} \\cdot ${N}}{${(s * n + (N - n)).toFixed(0)}} = ${R.toFixed(3)}
\\]`;

const EText = `\\[
E_3 = \\frac{R_3}{${s}} = \\frac{${R.toFixed(3)}}{${s}} = ${(E * 100).toFixed(2)}\\%
\\]`;

// Вставка тексту в DOM
const container = document.querySelector('#cont1 .dynamic');
container.innerHTML = `
  <p><strong>Розв’язок.</strong> Використаємо <strong>2-й закон Амдала</strong>. З рисунка 3 можна зробити висновок, що N = ${N}, n = ${n}. Звідси:</p>
  <p style="text-align: center;">${betaText}</p>
  <p>Ширина алгоритму – <i>s</i> = ${s}.</p>
  <p>Тому <strong>прискорення</strong> ${s}-процесорної системи:</p>
  ${RText}
  <p><strong>Ефективність</strong> ${s}-процесорної системи – це прискорення на один процесор:</p>
  ${EText}
`;

// Перезапускаємо MathJax для відображення формул
if (window.MathJax) {
  MathJax.typesetPromise();
}
