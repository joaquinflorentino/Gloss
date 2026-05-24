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
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `
            <p class="label">Word</p>
            <p class="word">${card.word}</p>
            <p class="label">Original sentence</p>
            <p class="sentence">${card.sentence}</p>
            <p class="label">Meaning in context</p>
            <p class="meaning">${card.meaning}</p>
            <p class="source">${card.source}</p>
        `;
        container.appendChild(el);
    })
}