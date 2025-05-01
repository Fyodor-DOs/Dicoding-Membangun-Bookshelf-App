let editId = null;

function initializeDummyData() {
    if (!localStorage.getItem('readBooks') && !localStorage.getItem('unreadBooks')) {
        const dummyBooks = [
            {
                id: 1,
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                year: 1960,
                isComplete: true,
                createdAt: "2024-01-01T09:00:00Z"
            },
            {
                id: 2,
                title: "1984",
                author: "George Orwell",
                year: 1949,
                isComplete: false,
                createdAt: "2024-01-02T10:00:00Z"
            },
            {
                id: 3,
                title: "Pride and Prejudice",
                author: "Jane Austen",
                year: 1813,
                isComplete: true,
                createdAt: "2024-01-03T11:00:00Z"
            },
            {
                id: 4,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                year: 1925,
                isComplete: false,
                createdAt: "2024-01-04T12:00:00Z"
            },
            {
                id: 5,
                title: "Moby Dick",
                author: "Herman Melville",
                year: 1851,
                isComplete: true,
                createdAt: "2024-01-05T13:00:00Z"
            }
        ];

        const readBooks = dummyBooks.filter(book => book.isComplete);
        const unreadBooks = dummyBooks.filter(book => !book.isComplete);

        localStorage.setItem('readBooks', JSON.stringify(readBooks));
        localStorage.setItem('unreadBooks', JSON.stringify(unreadBooks));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDummyData();
    updateStats();
    displayBooks();
});

function toggleModal() {
    const modal = document.getElementById('modal');
    modal.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
}

function addBook() {
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const year = document.getElementById('year').value;
    const status = document.getElementById('status').value;

    if (!title || !author || !year) {
        alert('Please fill in all required fields!');
        return;
    }

    const currentYear = new Date().getFullYear();
    if (year < 0 || year > currentYear) {
        alert(`Please enter a valid year between 0 and ${currentYear}`);
        return;
    }

    const newBook = {
        id: editId || Date.now(),
        title,
        author,
        year: parseInt(year),
        isComplete: status === 'read',
        createdAt: new Date().toISOString()
    };

    if (editId) {
        ['read', 'unread'].forEach(shelf => {
            let books = JSON.parse(localStorage.getItem(`${shelf}Books`) || '[]');
            books = books.filter(book => book.id !== editId);
            localStorage.setItem(`${shelf}Books`, JSON.stringify(books));
        });
    }

    const targetShelf = newBook.isComplete ? 'read' : 'unread';
    const targetBooks = JSON.parse(localStorage.getItem(`${targetShelf}Books`) || '[]');
    targetBooks.push(newBook);
    localStorage.setItem(`${targetShelf}Books`, JSON.stringify(targetBooks));

    displayBooks();
    toggleModal();
    updateStats();
}

function editBook(id) {
    const allBooks = [
        ...JSON.parse(localStorage.getItem('readBooks') || '[]'),
        ...JSON.parse(localStorage.getItem('unreadBooks') || '[]')
    ];
    const book = allBooks.find(b => b.id === id);

    if (book) {
        editId = id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('year').value = book.year;
        document.getElementById('status').value = book.isComplete ? 'read' : 'unread';
        toggleModal();
    }
}

function moveBook(id, fromShelf) {
    const fromBooks = JSON.parse(localStorage.getItem(`${fromShelf}Books`) || '[]');
    const bookIndex = fromBooks.findIndex(b => b.id === id);
    
    if (bookIndex > -1) {
        const [book] = fromBooks.splice(bookIndex, 1);
        book.isComplete = !book.isComplete;
        
        const toShelf = book.isComplete ? 'read' : 'unread';
        const toBooks = JSON.parse(localStorage.getItem(`${toShelf}Books`) || '[]');
        toBooks.push(book);
        
        localStorage.setItem(`${fromShelf}Books`, JSON.stringify(fromBooks));
        localStorage.setItem(`${toShelf}Books`, JSON.stringify(toBooks));
        
        displayBooks();
        updateStats();
    }
}

function deleteBook(id, shelf) {
    if (confirm('Are you sure you want to delete this book?')) {
        let books = JSON.parse(localStorage.getItem(`${shelf}Books`) || '[]');
        books = books.filter(b => b.id !== id);
        localStorage.setItem(`${shelf}Books`, JSON.stringify(books));
        displayBooks();
        updateStats();
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const allBooks = [
        ...JSON.parse(localStorage.getItem('readBooks') || '[]'),
        ...JSON.parse(localStorage.getItem('unreadBooks') || '[]')
    ];

    const filtered = allBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.year.toString().includes(searchTerm)
    );

    displayBooks(filtered);
}

function displayBooks(books) {
    const renderBook = (book, shelf) => `
        <div class="book-card bg-white p-4 rounded-lg shadow-md mb-3">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-lg">${book.title}</h4>
                    <p class="text-gray-600 text-sm">by ${book.author}</p>
                    <div class="mt-2 text-xs text-gray-500">
                        <span>Published: ${book.year}</span>
                        <span class="mx-2">•</span>
                        <span>Added: ${new Date(book.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick="editBook(${book.id})" class="text-blue-500 hover:text-blue-700 text-sm">
                        ✏️ Edit
                    </button>
                    <button onclick="moveBook(${book.id}, '${shelf}')" 
                        class="text-green-500 hover:text-green-700 text-sm">
                        ${shelf === 'read' ? '⏪ Mark Unread' : '✅ Mark Read'}
                    </button>
                    <button onclick="deleteBook(${book.id}, '${shelf}')" 
                        class="text-red-500 hover:text-red-700 text-sm">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `;

    const unreadList = document.getElementById('unread-list');
    const readList = document.getElementById('read-list');

    if (books) {
        unreadList.innerHTML = books.filter(b => !b.isComplete).map(b => renderBook(b, 'unread')).join('');
        readList.innerHTML = books.filter(b => b.isComplete).map(b => renderBook(b, 'read')).join('');
    } else {
        unreadList.innerHTML = JSON.parse(localStorage.getItem('unreadBooks') || '[]')
            .map(b => renderBook(b, 'unread')).join('');
        readList.innerHTML = JSON.parse(localStorage.getItem('readBooks') || '[]')
            .map(b => renderBook(b, 'read')).join('');
    }
}

function updateStats() {
    const readBooks = JSON.parse(localStorage.getItem('readBooks') || '[]');
    const unreadBooks = JSON.parse(localStorage.getItem('unreadBooks') || '[]');
    
    document.getElementById('total-books').textContent = readBooks.length + unreadBooks.length;
    document.getElementById('completed-books').textContent = readBooks.length;
}