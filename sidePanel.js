let allCards = [];

chrome.storage.local.get('cards', (result) => {
    allCards = result.cards || [];
    renderCards();
});

document.getElementById('search').addEventListener('input', renderCards);
document.getElementById('sort').addEventListener('change', renderCards);

function renderCards() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const sort = document.getElementById('sort').value;
    const container = document.getElementById('cards-container');

    let filtered = allCards.filter(card => card.word.toLowerCase().includes(query));
    filtered.sort((a, b) => sort === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);

    if (filtered.length === 0) {
        container.innerHTML = `<p class="empty">${query ? "No cards match your search." : "No saved cards yet. Highlight a word to get started."}</p>`;
        return;
    }

    container.innerHTML = '';
    filtered.forEach(card => {
        const boldedSentence = card.sentence.replace(
            new RegExp(`(${card.word})`, "gi"),
            `<span style="font-weight:600; color:#111;">$1</span>`
        );
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `
            <p class="label">Word</p>
            <p class="word">${card.word}</p>
            <p class="label">Original sentence</p>
            <p class="sentence">${boldedSentence}</p>
            <p class="label">Meaning in context</p>
            <p class="meaning">${card.meaning}</p>
            <p class="source">${card.source}</p>
            <button class="delete-btn" data-word="${card.word}" data-timestamp="${card.timestamp}">&times;</button>
        `;
        container.appendChild(el);

        el.querySelector('.delete-btn').addEventListener('click', () => {
        allCards = allCards.filter(c => c.timestamp !== card.timestamp);
        chrome.storage.local.set({ cards: allCards }, renderCards);
    });
    });
}

chrome.storage.onChanged.addListener((changes) => {
    if (changes.cards) {
        allCards = changes.cards.newValue || [];
        renderCards();
    }
});