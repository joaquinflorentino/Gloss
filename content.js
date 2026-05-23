const tooltip = document.createElement('div');
tooltip.id = 'gloss-tooltip';
tooltip.innerHTML = `<button id="gencard-btn">Generate Card</button>`
tooltip.style.cssText = `
    position: absolute;
    padding: 6px 12px;
    font-size: 14px;
    font-family: sans-serif;
    z-index: 999999;
    display: none;`;
document.body.appendChild(tooltip);

const genCardBtn = document.getElementById('gencard-btn');
genCardBtn.style.cssText = `
    background: #4f8ef7;
    color: white;
    border: none;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;`;

let selectionActive = false;

document.addEventListener('mouseup', (e) => {
    if (tooltip.contains(e.target)) {
        hideTooltip();
        return;
    }
    if (document.getElementById('contextcard-card')?.contains(e.target)) return;

    const selected = window.getSelection().toString().trim();
    if (selected.length > 2 && selected.split(' ').length < 16 && !selectionActive) {
        showTooltip(e.pageX, e.pageY);
        selectionActive = true;
    }
    else {
        hideTooltip();
        selectionActive = false;
    }
});

genCardBtn.addEventListener('click', () => {
    const selected = window.getSelection().toString().trim();
    const anchorNode = window.getSelection().anchorNode;
    const context = anchorNode?.parentElement?.closest('p, div, section, article').textContent
        || anchorNode?.textContent.trim() || '';

    showLoadingCard(selected);
    generateContextCard(selected, context);
})

function showTooltip(x, y) {
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.display = 'block';
}

function hideTooltip() {
    tooltip.style.display = 'none';
}

async function generateContextCard(word, context) {
    const cleanContext = context.replace(/[^\x00-\x7F]/g, "[symbol]").trim();

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCx1pXUmrdJzDFG0uCNQ19FoHwxap_8QOo`,
        {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `"${word}" was highlighted in this text: "${cleanContext}"
                        
                        Explain what "${word}" means in this specific context in 2-3 simple sentences for a non-native English speaker.
                        Plain text only, no formatting.`
                    }]
                }]
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error('API error:', JSON.stringify(data));
        return;
    }

    const meaning = data.candidates[0].content.parts[0].text;
    //showCard(word, extractSentence(cleanContext), meaning);
}

function extractSentence(context) {

}

function showLoadingCard(word) {
    const existing = document.getElementById('contextcard-card');
    if (existing) existing.remove();

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const x = rect.left + window.scrollX;
    const y = rect.bottom + window.scrollY;

    const card = document.createElement('div');
    card.id = 'contextcard-card';
    card.innerHTML = `
        <button id="cc-close-btn">✕</button>
        <p class="cc-word" style="font-size:22px; font-weight:500; color:#111; margin: 0 0 4px;">${word}</p>
        <p id="cc-loading-text" style="font-size:13px; color:#999; margin:0;">Generating...</p>
    `;
    card.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y + 16}px;
        width: 300px;
        background: white;
        border: 0.5px solid #ddd;
        border-radius: 12px;
        padding: 0.75rem 1rem;
        z-index: 999999;
        font-family: sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        overflow-y: auto;
        max-height: 100px;
        transition: max-height 0.4s ease;
    `;

    document.body.appendChild(card);

    const closeBtn = document.querySelector('#cc-close-btn');
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 12px;
        background: none;
        border: none;
        font-size: 14px;
        color: #999;
        cursor: pointer;
    `;
    closeBtn.addEventListener('click', () => card.remove());
}

function showCard(word, sentence, meaning) {

}