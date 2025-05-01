let editId = null;

document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    displayBooks();
});

function toggleModal() {
    const modal = document.getElementById('modal');
    modal.classList.toggle('hidden');
    
    if (!modal.classList.contains('hidden')) {
        modal.classList.add('modal-enter');
        setTimeout(() => modal.classList.remove('modal-enter'), 300);
    } else {
        modal.classList.add('modal-exit');
        setTimeout(() => modal.classList.remove('modal-exit'), 300);
    }
    
    if (!modal.classList.contains('hidden')) {
        editId = null;
        document.getElementById('title').value = '';
        document.getElementById('author').value = '';
        document.getElementById('year').value = '';
        document.getElementById('status').value = 'unread';
    }
}

function addBook() {
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const yearInput = document.getElementById('year').value;
    const status = document.getElementById('status').value;

    if (!title || !author || !yearInput) {
        alert('Please fill in all fields!');
        return;
    }
    
    const year = parseInt(yearInput);
    if (isNaN(year) || year < 0 || year > new Date().getFullYear()) {
        alert('Please enter a valid publication year!');
        return;
    }

    const book = {
        id: editId || Date.now(),
        title,
        author,
        year,
        isComplete: status === 'read',
        createdAt: new Date().toISOString()
    };

    const shelf = book.isComplete ? 'read' : 'unread';

    try {
        if (editId) {
            ['read', 'unread'].forEach(shelf => {
                let books = JSON.parse(localStorage.getItem(`${shelf}Books`) || '[]');
                books = books.filter(b => b.id !== editId);
                localStorage.setItem(`${shelf}Books`, JSON.stringify(books));
            });
        }

        let books = JSON.parse(localStorage.getItem(`${shelf}Books`) || []);
        books.push(book);
        localStorage.setItem(`${shelf}Books`, JSON.stringify(books));

        displayBooks();
        toggleModal();
        updateStats();
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Failed to save book. Please try again.');
    }
}

function editBook(id) {
    const books = [
        ...JSON.parse(localStorage.getItem('readBooks') || '[]'),
        ...JSON.parse(localStorage.getItem('unreadBooks') || '[]')
    ];
    const book = books.find(b => b.id === id);

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
    const toShelf = fromShelf === 'read' ? 'unread' : 'read';
    
    const bookIndex = fromBooks.findIndex(b => b.id === id);
    if (bookIndex > -1) {
        const [book] = fromBooks.splice(bookIndex, 1);
        book.isComplete = !book.isComplete;
        
        localStorage.setItem(`${fromShelf}Books`, JSON.stringify(fromBooks));
        
        const toBooks = JSON.parse(localStorage.getItem(`${toShelf}Books`) || '[]');
        toBooks.push(book);
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
        <div class="book-card bg-gray-50 p-4 rounded-lg flex justify-between items-start">
            <div>
                <h4 class="font-semibold">${book.title}</h4>
                <p class="text-sm text-gray-600">by ${book.author}</p>
                <div class="mt-2 text-xs text-gray-500">
                    <span>Year: ${book.year}</span>
                    <span class="mx-2">•</span>
                    <span>Added: ${new Date(book.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <button onclick="editBook(${book.id})" class="text-blue-500 hover:text-blue-700">
                    ✏️ Edit
                </button>
                <button onclick="moveBook(${book.id}, '${shelf}')" class="text-green-500 hover:text-green-700">
                    ${shelf === 'read' ? '⏪ Unread' : '✅ Read'}
                </button>
                <button onclick="deleteBook(${book.id}, '${shelf}')" class="text-red-500 hover:text-red-700">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;

    const unreadList = document.getElementById('unread-list');
    const readList = document.getElementById('read-list');

    if (books) {
        unreadList.innerHTML = books
            .filter(b => !b.isComplete)
            .map(b => renderBook(b, 'unread'))
            .join('');
        readList.innerHTML = books
            .filter(b => b.isComplete)
            .map(b => renderBook(b, 'read'))
            .join('');
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