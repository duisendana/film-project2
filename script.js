
const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genreFilter");
const noResults = document.getElementById("noResults");
const resultsCount = document.getElementById("resultsCount");
const favoriteList = document.getElementById("favoriteList");
const recommendGenre = document.getElementById("recommendGenre");
const recommendButton = document.getElementById("recommendButton");
const recommendResult = document.getElementById("recommendResult");
const movieModal = document.getElementById("movieModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

const movieCards = Array.from(movieGrid.querySelectorAll(".movie-card"));
const favoriteKey = "filmSpaceFavorites";

let favorites = new Set();

try {
    const savedFavorites = JSON.parse(localStorage.getItem(favoriteKey) || "[]");

    if (Array.isArray(savedFavorites)) {
        favorites = new Set(savedFavorites);
    }
} catch (error) {
    favorites = new Set();
}

function saveFavorites() {
    try {
        localStorage.setItem(favoriteKey, JSON.stringify([...favorites]));
    } catch (error) {
        console.warn("Таңдаулыларды сақтау мүмкін болмады.");
    }
}

function getMovieData(card) {
    return {
        id: card.dataset.id,
        name: card.dataset.name,
        genre: card.dataset.genre,
        year: card.dataset.year,
        director: card.dataset.director,
        description: card.dataset.description,
        poster: card.querySelector(".movie-poster img")?.src || ""
    };
}

function createEmptyState(title, description) {
    const container = document.createElement("div");
    container.className = "empty-state";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = description;

    container.append(heading, paragraph);

    return container;
}

function updateFavoriteButtons() {
    movieCards.forEach(card => {
        const button = card.querySelector(".favorite");
        const isFavorite = favorites.has(card.dataset.id);

        button.classList.toggle("is-favorite", isFavorite);
        button.textContent = isFavorite ? "♥" : "♡";
        button.setAttribute("aria-pressed", String(isFavorite));
        button.setAttribute(
            "aria-label",
            isFavorite ? "Таңдаулылардан алып тастау" : "Таңдаулыларға қосу"
        );
    });
}

function renderFavorites() {
    favoriteList.replaceChildren();

    const favoriteCards = movieCards.filter(card =>
        favorites.has(card.dataset.id)
    );

    if (favoriteCards.length === 0) {
        favoriteList.appendChild(
            createEmptyState(
                "Әзірге фильм жоқ",
                "Каталогтан ұнаған фильмнің жүрек белгісін бас."
            )
        );
        return;
    }

    favoriteCards.forEach(card => {
        favoriteList.appendChild(card.cloneNode(true));
    });
}

function filterMovies() {
    const searchTerm = searchInput.value.trim().toLocaleLowerCase();
    const selectedGenre = genreFilter.value;
    let visibleCount = 0;

    movieCards.forEach(card => {
        const name = card.dataset.name.toLocaleLowerCase();
        const genre = card.dataset.genre;

        const matchesSearch = name.includes(searchTerm);
        const matchesGenre =
            selectedGenre === "all" || genre === selectedGenre;

        const isVisible = matchesSearch && matchesGenre;

        card.hidden = !isVisible;

        if (isVisible) {
            visibleCount++;
        }
    });

    resultsCount.textContent = `${visibleCount} фильм`;
    noResults.hidden = visibleCount !== 0;
}

function showMovieDetails(card) {
    const movie = getMovieData(card);

    modalContent.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = movie.name;

    const meta = document.createElement("div");
    meta.className = "modal-meta";

    [movie.year, movie.genre].forEach(value => {
        const item = document.createElement("span");
        item.textContent = value;
        meta.appendChild(item);
    });

    const director = document.createElement("p");
    const directorLabel = document.createElement("strong");
    directorLabel.textContent = "Режиссёр: ";
    director.append(directorLabel, document.createTextNode(movie.director));

    const description = document.createElement("p");
    const descriptionLabel = document.createElement("strong");
    descriptionLabel.textContent = "Фильм туралы: ";
    description.append(
        descriptionLabel,
        document.createTextNode(movie.description)
    );

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "main-button modal-favorite";

    function updateModalFavoriteButton() {
        const isFavorite = favorites.has(movie.id);
        favoriteButton.textContent = isFavorite
            ? "♥ Таңдаулылардан алып тастау"
            : "♡ Таңдаулыларға қосу";
    }

    favoriteButton.addEventListener("click", () => {
        toggleFavorite(movie.id);
        updateModalFavoriteButton();
    });

    updateModalFavoriteButton();

    modalContent.append(title, meta, director, description, favoriteButton);

    if (typeof movieModal.showModal === "function") {
        movieModal.showModal();
    } else {
        movieModal.setAttribute("open", "");
    }
}

function toggleFavorite(movieId) {
    if (favorites.has(movieId)) {
        favorites.delete(movieId);
    } else {
        favorites.add(movieId);
    }

    saveFavorites();
    updateFavoriteButtons();
    renderFavorites();
}

function recommendMovie() {
    const selectedGenre = recommendGenre.value;

    const availableMovies = movieCards.filter(card =>
        selectedGenre === "all" || card.dataset.genre === selectedGenre
    );

    if (availableMovies.length === 0) {
        recommendResult.textContent = "Бұл жанрда фильм табылмады.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableMovies.length);
    const movie = getMovieData(availableMovies[randomIndex]);

    recommendResult.replaceChildren();

    const year = document.createElement("span");
    year.className = "recommend-year";
    year.textContent = `${movie.year} · ${movie.genre}`;

    const title = document.createElement("h3");
    title.textContent = movie.name;

    const description = document.createElement("p");
    description.textContent = movie.description;

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "details-button recommend-details";
    detailsButton.textContent = "Фильм туралы оқу";

    detailsButton.addEventListener("click", () => {
        showMovieDetails(availableMovies[randomIndex]);
    });

    recommendResult.append(year, title, description, detailsButton);
}

searchInput.addEventListener("input", filterMovies);
genreFilter.addEventListener("change", filterMovies);
recommendButton.addEventListener("click", recommendMovie);

movieGrid.addEventListener("click", event => {
    const favoriteButton = event.target.closest(".favorite");
    const detailsButton = event.target.closest(".details-button");

    if (favoriteButton) {
        event.stopPropagation();

        const card = favoriteButton.closest(".movie-card");
        toggleFavorite(card.dataset.id);
        return;
    }

    if (detailsButton) {
        event.stopPropagation();

        const card = detailsButton.closest(".movie-card");
        showMovieDetails(card);
        return;
    }

    const card = event.target.closest(".movie-card");

    if (card) {
        showMovieDetails(card);
    }
});

movieGrid.addEventListener("keydown", event => {
    if (
        event.target.classList.contains("movie-card") &&
        (event.key === "Enter" || event.key === " ")
    ) {
        event.preventDefault();
        showMovieDetails(event.target);
    }
});

favoriteList.addEventListener("click", event => {
    const favoriteButton = event.target.closest(".favorite");
    const detailsButton = event.target.closest(".details-button");

    if (favoriteButton) {
        event.stopPropagation();

        const card = favoriteButton.closest(".movie-card");
        toggleFavorite(card.dataset.id);
        return;
    }

    if (detailsButton) {
        event.stopPropagation();

        const card = detailsButton.closest(".movie-card");
        const originalCard = movieCards.find(
            item => item.dataset.id === card.dataset.id
        );

        if (originalCard) {
            showMovieDetails(originalCard);
        }

        return;
    }

    const card = event.target.closest(".movie-card");

    if (card) {
        const originalCard = movieCards.find(
            item => item.dataset.id === card.dataset.id
        );

        if (originalCard) {
            showMovieDetails(originalCard);
        }
    }
});

favoriteList.addEventListener("keydown", event => {
    if (
        event.target.classList.contains("movie-card") &&
        (event.key === "Enter" || event.key === " ")
    ) {
        event.preventDefault();

        const originalCard = movieCards.find(
            card => card.dataset.id === event.target.dataset.id
        );

        if (originalCard) {
            showMovieDetails(originalCard);
        }
    }
});

closeModal.addEventListener("click", () => {
    movieModal.close();
});

movieModal.addEventListener("click", event => {
    if (event.target === movieModal) {
        movieModal.close();
    }
});

updateFavoriteButtons();
renderFavorites();
filterMovies();
