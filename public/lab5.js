document.addEventListener("DOMContentLoaded", () => {
    const pi = [5, 4, 6, 9, 12, 8, 5, 5, 10, 8, 7, 8, 9, 7];
  
    const subsystems = {
      "Підсистема 1": [1, 2, 3, 4, 5],
      "Підсистема 2": [6, 7, 8, 9],
      "Підсистема 3": [10, 11, 12, 13]
    };
  
    const resultsDiv = document.getElementById("results");
  
    let totalPerformance = 0;
    let html = "";
  
    for (let [name, indexes] of Object.entries(subsystems)) {
      const minPi = Math.min(...indexes.map(i => pi[i]));
      const realPerf = minPi * indexes.length;
      totalPerformance += realPerf;
  
      html += `<h3 class="section-title">${name}</h3>`;
      html += `<p>Мінімальна продуктивність: ${minPi}</p>`;
      html += `<p>Реальна продуктивність підсистеми: ${realPerf}</p>`;
  
      html += `<table>
        <tr>
          <th>№ пристрою</th>
          <th>πᵢ</th>
          <th>Завантаження pᵢ = π_min / πᵢ</th>
        </tr>`;
  
      for (let i of indexes) {
        const load = (minPi / pi[i]).toFixed(3);
        html += `<tr>
          <td>${i}</td>
          <td>${pi[i]}</td>
          <td>${load}</td>
        </tr>`;
      }
  
      html += `</table>`;
    }
  
    // Додати загальну продуктивність
    html += `<h3 class="section-title">Загальна реальна продуктивність системи</h3>
             <p><strong>${totalPerformance}</strong></p>`;
  
    // Несумісність (виводимо пристрої з найменшими πᵢ в кожній підсистемі)
    html += `<h3 class="section-title">Несумісність та причини</h3><ul>`;
    for (let [name, indexes] of Object.entries(subsystems)) {
      const minIndex = indexes.reduce((a, b) => pi[a] < pi[b] ? a : b);
      html += `<li>${name}: Пристрій ${minIndex} (π = ${pi[minIndex]}) обмежує продуктивність</li>`;
    }
    html += `</ul>`;
  
    // Пропозиції
    html += `<h3 class="section-title">Пропозиції щодо покращення</h3>
             <p>Для уникнення несумісності, мінімальні продуктивності у підсистемах мають бути однаковими або близькими. 
             Наприклад:</p>
             <ul>
               <li>Підсистема 1: π ≥ 9</li>
               <li>Підсистема 2: π ≥ 10</li>
               <li>Підсистема 3: π ≥ 9</li>
             </ul>`;
  
    resultsDiv.innerHTML = html;
  });
  