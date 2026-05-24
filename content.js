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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
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
    showCard(word, extractSentence(cleanContext, word), meaning);
}

function extractSentence(paragraph, word) {
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    const match = sentences.find(s => s.toLowerCase().includes(word.toLowerCase()));

    if (match) {
        if (match.length > 200) {
            const index = match.toLowerCase().indexOf(word.toLowerCase());
            const start = Math.max(0, index - 60);
            const actualStart = start === 0 ? 0 : paragraph.indexOf(' ', start) + 1;
            const end = Math.min(match.length, index + word.length + 60);
            return (actualStart > 0 ? '...' : "") + match.slice(actualStart, end) + (end < match.length ? '...' : '');
        }
        return match;
    }
    
    const index = paragraph.toLowerCase().indexOf(word.toLowerCase());
    const start = Math.max(0, index - 60);
    const actualStart = start === 0 ? 0 : paragraph.indexOf(' ', start) + 1;
    const end = Math.min(paragraph.length, index + word.length + 60);
    return (actualStart > 0 ? '...' : "") + paragraph.slice(actualStart, end) + (end < paragraph.length ? '...' : '');
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
        <button id="cc-close-btn">&times;</button>
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
        font-size: 25px;
        color: #999;
        cursor: pointer;
    `;
    closeBtn.addEventListener('click', () => card.remove());
}

function showCard(word, sentence, meaning) {
    const card = document.getElementById('contextcard-card');
    if (!card) return

    const boldedSentence = sentence.replace(
        new RegExp(`(${word})`, "gi"),
        `<span style="font-weight:600; color:#111;">$1</span>`
    );

    card.innerHTML = `
        <button id="cc-close-btn">&times;</button>
        <p class="cc-label">Word</p>
        <p class="cc-word">${word}</p>
        <p class="cc-label">Original sentence</p>
        <p class="cc-sentence">${boldedSentence}</p>
        <p class="cc-label">Meaning in context</p>
        <p class="cc-meaning">${meaning}</p>
        <button id="cc-save-btn">Save card</button>`;
    
    card.querySelectorAll(".cc-label").forEach(el => {
        el.style.cssText = `font-size:10px; font-weight:500; color:#999; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px;`;
    });
    card.querySelector(".cc-word").style.cssText = `font-size:22px; font-weight:500; color:#111; margin:0 0 14px;`;
    card.querySelector(".cc-sentence").style.cssText = `font-size:13px; color:#555; line-height:1.6; margin:0 0 14px; border-left:2px solid #ddd; padding-left:10px;`;
    card.querySelector(".cc-meaning").style.cssText = `font-size:13px; color:#111; line-height:1.6; margin:0 0 16px;`;

    const saveBtn = card.querySelector("#cc-save-btn");
    saveBtn.style.cssText = `width:100%; padding:8px; font-size:13px; border-radius:8px; background:white; border:0.5px solid #ccc; color:#111; cursor:pointer;`;
    saveBtn.addEventListener("click", () => {
        const cardData = {
            word,
            sentence,
            meaning,
            source: window.location.href,
            timestamp: Date.now()
        };

        chrome.storage.local.get("cards", (result) => {
            const cards = result.cards || [];
            cards.push(cardData);
            chrome.storage.local.set({ cards }, () => {
                saveBtn.textContent = "Saved ✓";
                saveBtn.style.color = "#4f8ef7";
                saveBtn.disabled = true;
            });
        });
    });

    const closeBtn = card.querySelector('#cc-close-btn');
    closeBtn.style.cssText = `position:absolute; top:10px; right:12px; background:none; border:none; font-size:25px; color:#999; cursor:pointer;`;
    closeBtn.addEventListener('click', () => card.remove());

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            card.style.maxHeight = '300px';
        });
    });
}