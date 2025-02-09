const recommendationsContainer = document.querySelector(".recommendations");

// Load books from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
    renderList("toReadBooks", document.querySelector(".list-to-read"), moveToReading);
    renderList("readingBooks", document.querySelector(".list-reading"), moveToFinished);
    renderList("finishedBooks", document.querySelector(".list-finished"));
});

// Dropdown functionality
let dropDown = document.querySelector("select");
dropDown.addEventListener("change", function () {
    let query = dropDown.value;
    fetchBooks(query);
});

// Search functionality
let searchBar = document.querySelector("#search-bar");
searchBar.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        let query2 = searchBar.value.trim();
        fetchBooks(query2);
    }
});

// Fetch books from Google API
async function fetchBooks(query = "history") {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=30`);
        const data = await response.json();
        displayBooks(data.items);
    } catch (error) {
        console.error("Error fetching books:", error);
        recommendationsContainer.innerHTML = `<p>Failed to load recommendations.</p>`;
    }
}

// Display books
function displayBooks(books) {
    recommendationsContainer.innerHTML = "";
    books.forEach((book) => {
        const title = book.volumeInfo.title || "Unknown Title";
        const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "Unknown Author";
        const thumbnail = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x192?text=No+Cover";
        const buyLink = book.saleInfo?.buyLink || null;

        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        bookCard.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <h3>${title}</h3>
            <p>${authors}</p>
            <button onclick="addToRead('${title}', '${authors}', '${thumbnail}', '${buyLink}')">Add to Library</button>
        `;
        recommendationsContainer.appendChild(bookCard);
    });
}

fetchBooks();

// btn functionality

const allBtn = document.querySelectorAll(".btn")
allBtn.forEach((btn)=>{
    btn.addEventListener("click", function(e){
        const selectedCategory = e.target.getAttribute("value")

        const allCont = document.querySelectorAll(".outer")
        allCont.forEach((container)=>{
            if(container.getAttribute("value") === selectedCategory){
                container.style.display = 'block'
            }
            else{
                container.style.display = 'none'
            }
        })
    })
})

// Render books from localStorage
function renderList(storageKey, container, moveFunction) {
    container.innerHTML = "";
    let books = JSON.parse(localStorage.getItem(storageKey)) || [];

    books.forEach((book) => {
        const bookEntry = document.createElement("div");
        bookEntry.classList.add("book-entry");

        bookEntry.innerHTML = `
            <img src="${book.thumbnail}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>${book.authors}</p>
            <button class="buy-button" ${book.buyLink ? `onclick="window.open('${decodeURIComponent(book.buyLink)}', '_blank')"` : "disabled"} 
                    style="${book.buyLink ? "" : "background-color: gray; cursor: not-allowed;"}">
                ${book.buyLink ? "Buy Now" : "Not Available"}
            </button>
        `;

        // Remove button
        const removeButton = document.createElement("button");
        removeButton.textContent = "X";
        removeButton.classList.add("remove-button");
        removeButton.onclick = () => removeBook(book.title, storageKey, container);

        bookEntry.appendChild(removeButton);

        // Move button if applicable
        if (moveFunction) {
            const moveButton = document.createElement("button");
            moveButton.textContent = storageKey === "toReadBooks" ? "Start Reading" : "Finished";
            moveButton.onclick = () => moveFunction(book.title, book.authors, book.thumbnail, book.buyLink);
            bookEntry.appendChild(moveButton);
        }

        container.appendChild(bookEntry);
    });
}

// Add book to "To Read"
function addToRead(title, authors, thumbnail, buyLink) {
    let books = JSON.parse(localStorage.getItem("toReadBooks")) || [];
    books.push({ title, authors, thumbnail, buyLink });
    localStorage.setItem("toReadBooks", JSON.stringify(books));
    renderList("toReadBooks", document.querySelector(".list-to-read"), moveToReading);
}

// Move book to "Reading"
function moveToReading(title, authors, thumbnail, buyLink) {
    updateStorage("toReadBooks", "readingBooks", title, authors, thumbnail, buyLink);
    renderList("toReadBooks", document.querySelector(".list-to-read"), moveToReading);
    renderList("readingBooks", document.querySelector(".list-reading"), moveToFinished);
}

// Move book to "Finished"
function moveToFinished(title, authors, thumbnail, buyLink) {
    updateStorage("readingBooks", "finishedBooks", title, authors, thumbnail, buyLink);
    renderList("readingBooks", document.querySelector(".list-reading"), moveToFinished);
    renderList("finishedBooks", document.querySelector(".list-finished"));
}

// Update localStorage when moving books
function updateStorage(from, to, title, authors, thumbnail, buyLink) {
    let fromBooks = JSON.parse(localStorage.getItem(from)) || [];
    let toBooks = JSON.parse(localStorage.getItem(to)) || [];

    fromBooks = fromBooks.filter((book) => book.title !== title);
    toBooks.push({ title, authors, thumbnail, buyLink });

    localStorage.setItem(from, JSON.stringify(fromBooks));
    localStorage.setItem(to, JSON.stringify(toBooks));
}

// Remove book from list
function removeBook(title, storageKey, container) {
    let books = JSON.parse(localStorage.getItem(storageKey)) || [];
    books = books.filter((book) => book.title !== title);
    localStorage.setItem(storageKey, JSON.stringify(books));
    renderList(storageKey, container, storageKey === "toReadBooks" ? moveToReading : storageKey === "readingBooks" ? moveToFinished : null);
}

// Toggle Settings Panel
function toggleSettings() {
    const panel = document.getElementById("settings-panel");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");

darkModeToggle.addEventListener("change", function () {
    if (this.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
    }
});

// Load Dark Mode
window.addEventListener("load", function () {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }
});
