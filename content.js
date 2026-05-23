const tooltip = document.createElement('div');
tooltip.id = 'gloss-tooltip';
tooltip.innerHTML = `<button id="gloss-btn">Generate Card</button>`
tooltip.style.cssText = `
    position: absolute;
    padding: 6px 12px;
    font-size: 14px;
    font-family: sans-serif;
    z-index: 999999;
    display: none;`;
document.body.appendChild(tooltip);

const btn = document.getElementById('gloss-btn');
btn.style.cssText = `
    background: #4f8ef7;
    color: white;
    border: none;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;`;

let lastSelected = '';

document.addEventListener('mouseup', (e) => {
    const selected = window.getSelection().toString().trim();
    if (selected.length > 2 && selected.split(' ').length < 16 && selected !== lastSelected) {
        lastSelected = selected;
        showTooltip(e.pageX, e.pageY);
    }
    else {
        lastSelected = '';
        tooltip.style.display = 'none';
    }
});

function showTooltip(x, y) {
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.display = 'block';
}