const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsSection = document.getElementById('results-section');
const resultsGrid = document.getElementById('results-grid');
const resultCount = document.getElementById('result-count');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    performSearch(query);
});

async function performSearch(query) {
    // Show loading, hide others
    loadingState.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    emptyState.classList.add('hidden');
    resultsGrid.innerHTML = '';

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('검색 중 오류가 발생했습니다.');
        }

        const books = await response.json();
        
        if (books.length === 0) {
            showEmptyState();
        } else {
            renderResults(books);
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        loadingState.classList.add('hidden');
    }
}

function renderResults(books) {
    loadingState.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    resultCount.textContent = `총 ${books.length}권의 검색 결과`;

    const featuredBook = books[0];
    const otherBooks = books.slice(1);

    // Create Featured Poster Section
    const featuredSection = document.createElement('div');
    featuredSection.className = 'featured-poster';
    featuredSection.innerHTML = createFeaturedPosterContent(featuredBook);
    resultsGrid.appendChild(featuredSection);

    // Create a wrapper for other results
    const otherGrid = document.createElement('div');
    otherGrid.className = 'other-results-grid';
    
    otherBooks.forEach(book => {
        const bookCard = createBookCard(book);
        otherGrid.appendChild(bookCard);
    });
    
    resultsGrid.appendChild(otherGrid);
}

function createFeaturedPosterContent(book) {
    const cleanTitle = stripHtml(book.title);
    const cleanAuthor = stripHtml(book.author);
    const cleanDescription = stripHtml(book.description);
    const cleanPrice = book.discount ? `${Number(book.discount).toLocaleString()}원` : '가격 정보 없음';

    return `
        <div class="poster-container">
            <div class="poster-badge">오늘의 추천 도서</div>
            <div class="poster-content">
                <div class="poster-image">
                    <img src="${book.image}" alt="${cleanTitle}">
                </div>
                <div class="poster-info">
                    <h2 class="poster-title">${cleanTitle}</h2>
                    <p class="poster-author">${cleanAuthor} 저 | ${book.publisher}</p>
                    <div class="poster-divider"></div>
                    <p class="poster-desc">${cleanDescription}</p>
                    <div class="poster-action">
                        <span class="poster-price">${cleanPrice}</span>
                        <a href="${book.link}" target="_blank" class="poster-btn">도서 상세보기</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showEmptyState() {
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';

    // Clean up title and description from <b> tags
    const cleanTitle = stripHtml(book.title);
    const cleanAuthor = stripHtml(book.author);
    const cleanDescription = stripHtml(book.description);
    const cleanPrice = book.discount ? `${Number(book.discount).toLocaleString()}원` : '가격 정보 없음';

    card.innerHTML = `
        <div class="book-cover-wrapper">
            <img src="${book.image || 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${cleanTitle}" class="book-cover">
        </div>
        <div class="book-info">
            <h3 class="book-title" title="${cleanTitle}">${cleanTitle}</h3>
            <p class="book-author">${cleanAuthor}</p>
            <p class="book-description">${cleanDescription}</p>
            <div class="book-footer">
                <span class="book-price">${cleanPrice}</span>
                <a href="${book.link}" target="_blank" class="view-btn">상세보기</a>
            </div>
        </div>
    `;

    return card;
}

function stripHtml(text) {
    if (!text) return '';
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.body.textContent || "";
}

// Add some interaction to tags
document.querySelectorAll('.search-tags span').forEach(tag => {
    tag.addEventListener('click', () => {
        searchInput.value = tag.textContent.replace('#', '');
        performSearch(searchInput.value);
    });
});
