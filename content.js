const tooltip = document.createElement('div');
tooltip.id = 'gloss-tooltip';
tooltip.innerHTML = `<button id="gencard-btn">✦ Generate Card</button>`
tooltip.style.cssText = `
    position: absolute;
    font-family: sans-serif;
    z-index: 999999;
    display: none;`;
document.body.appendChild(tooltip);

const genCardBtn = document.getElementById('gencard-btn');
genCardBtn.style.cssText = `
    background: #4f8ef7;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold`;

let selectionActive = false;

document.addEventListener('mouseup', (e) => {
    chrome.storage.local.get('glossActive', (result) => {
        if (!result.glossActive) return;
        if (tooltip.contains(e.target)) {
            hideTooltip();
            return;
        }
        if (document.getElementById('contextcard-card')?.contains(e.target)) return;

        const selected = window.getSelection().toString().trim();
        if (selected.length > 2 && selected.split(' ').length < 16 && !selectionActive) {
            const range = window.getSelection().getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const x = rect.left + window.scrollX + (rect.width / 2);
            const y = rect.bottom + window.scrollY;
            showTooltip(x, y);

            selectionActive = true;
        }
        else {
            hideTooltip();
            selectionActive = false;
        }
    })
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
    tooltip.style.top = `${y + 10}px`;
    tooltip.style.display = 'block';
    tooltip.style.transform = 'translateX(-50%)'
}

function hideTooltip() {
    tooltip.style.display = 'none';
}

async function generateContextCard(word, context) {
    chrome.storage.local.get('glossLang', (result) => {
        const lang = result.glossLang || 'English';
        generateMeaning(word, context, lang, (meaning) => {
            showCard(word, extractSentence(context.trim(), word), meaning, context.trim());
        });
    });
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
        <div style="display:flex; justify-content:space-between; align-items:center; margin:0; padding:0;">
            <p style="font-size:22px; font-weight:500; color:#111; margin:0; padding:0; line-height:1.2; font-family:sans-serif;">${word}</p>
            <button id="cc-close-btn" style="background:none; border:none; font-size:25px; color:#999; cursor:pointer; flex-shrink:0; padding:0; margin:0; line-height:1;">&times;</button>
        </div>
        <p id="cc-loading-text" style="font-size:13px; color:#999; margin:6px 0 0 0; padding:0; font-family:sans-serif; line-height:1.4;">Generating...</p>
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
        overflow: hidden;
        max-height: 100px;
        transition: max-height 0.4s ease;
        display: flex;
        flex-direction: column;
    `;

    document.body.appendChild(card);

    const cardRect = card.getBoundingClientRect();
    if (cardRect.right > window.innerWidth) {
        card.style.left = `${window.innerWidth - card.offsetWidth - 16 + window.scrollX}px`;
    }

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

function showCard(word, sentence, meaning, context) {
    const card = document.getElementById('contextcard-card');
    if (!card) return

    card.innerHTML = `
        <div id="cc-header" style="display:flex; justify-content:space-between; align-items:flex-start; padding:0 0 8px 0;">
            <div style="display:flex; flex-direction:column;">
                <p style="font-size:10px; font-weight:500; color:#999; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px 0;">Word</p>
                <p style="font-size:22px; font-weight:500; color:#111; margin:0;">${word}</p>
            </div>
            <div style="display:flex; flex-direction:row; align-items:center; gap:8px;">
                <select id="cc-lang-select" style="font-size:11px; border:0.5px solid #ddd; border-radius:6px; padding:2px 4px; color:#555; background:white; cursor:pointer;">
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="French">French</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Korean">Korean</option>
                    <option value="German">German</option>
                </select>
                <button id="cc-close-btn" style="background:none; border:none; font-size:25px; color:#999; cursor:pointer;">&times;</button>
            </div>
        </div>
        <div id="cc-body" style="flex:1; overflow-y:auto; min-height:0;">
            <p class="cc-label">Meaning in context</p>
            <p class="cc-meaning">${meaning}</p>
            <button id="cc-save-btn">Save card</button>
        </div>
    `;
    
    card.querySelectorAll(".cc-label").forEach(el => {
        el.style.cssText = `font-size:10px; font-weight:500; color:#999; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px;`;
    });
    card.querySelector(".cc-meaning").style.cssText = `font-size:13px; color:#111; line-height:1.6; margin:0 0 16px;`;

    const saveBtn = card.querySelector("#cc-save-btn");
    saveBtn.style.cssText = `width:100%; padding:8px; font-size:13px; border-radius:8px; background:white; border:0.5px solid #ccc; color:#111; cursor:pointer; box-sizing:border-box; text-align:center;`;
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
    closeBtn.style.cssText = `top:10px; right:12px; background:none; border:none; font-size:25px; color:#999; cursor:pointer;`;
    closeBtn.addEventListener('click', () => card.remove());

    const header = card.querySelector('#cc-header');
    header.style.cursor = 'grab';

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    header.addEventListener('mousedown', (e) => {
        if (e.target === closeBtn || e.target === langSelect) return;
        isDragging = true;
        dragOffsetX = e.clientX - card.getBoundingClientRect().left;
        dragOffsetY = e.clientY - card.getBoundingClientRect().top;
        header.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        card.style.left = `${e.clientX - dragOffsetX + window.scrollX}px`;
        card.style.top = `${e.clientY - dragOffsetY + window.scrollY}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
        }
    });

    const langSelect = card.querySelector('#cc-lang-select');

    chrome.storage.local.get('glossLang', (result) => {
        if (result.glossLang) langSelect.value = result.glossLang;
    });

    langSelect.addEventListener('change', () => {
        const lang = langSelect.value;
        chrome.storage.local.set({ glossLang: lang });

        const meaningEl = card.querySelector('.cc-meaning');
        meaningEl.textContent = 'Generating...';
        meaningEl.style.color = '#999';

        generateMeaning(word, context, lang, (newMeaning) => {
            meaningEl.textContent = newMeaning;
            meaningEl.style.color = '#111';
        });
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            card.style.maxHeight = '300px';
            
            setTimeout(() => {
                const cardRect = card.getBoundingClientRect();
                if (cardRect.bottom > window.innerHeight) {
                    const y = parseInt(card.style.top);
                    card.style.top = `${y - (cardRect.bottom - window.innerHeight) - 16}px`;
                }
            }, 400);    
        });
    });
}

async function generateMeaning(word, context, language, callback) {
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
                        
                        Explain what "${word}" means in this specific context in 2-3 simple sentences. Respond in ${language}. Plain text only, no formatting.`
                    }]
                }]
            })
        }
    );

    const data = await response.json();
    if (!response.ok) return;
    callback(data.candidates[0].content.parts[0].text);
}