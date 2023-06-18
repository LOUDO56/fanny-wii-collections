import { gamebox } from "./components/gamebox.js";
import conf from "./config.js";

// Just have to change this to https://wii-fanny-collection.onrender.com for it to work for deployment
const HOST = conf.HOST,
    IMG_PATH = conf.IMG_PATH,
    IMG_COVERS_PATH = conf.IMG_COVERS_PATH,
    IMG_COVERS_PATH2 = conf.IMG_COVERS_PATH2,
    MDP_INPUT = conf.MDP_INPUT,
    page_indicator = conf.page_indicator,
    no_result = conf.no_result,
    button_haut_page = conf.button_haut_page;


let filter;
let howManyGamesOwned = 0;
const wiiGameListContainer = document.querySelector("[wii-games-container]");
if (sessionStorage.getItem("currentRankGames") === null) {
    sessionStorage.setItem("currentRankGames", 0);
}
let currentRankGames = parseInt(sessionStorage.getItem("currentRankGames"));

let listGames = [];
const gamesOnPage = 10;
if (window.screen.width <= 486) {
    gamesOnPage = 7;
}

// Send request to the server with host, uri and one or more arguments
const request = async (uri, arg = "") => {
    const response = await fetch(HOST + uri + arg);
    return response;
};

// Format date
const format_published_date = (date) => {
    for (let i = 0; i < date.length; i++) { date[i] = date[i] && date[i] < 10 ? 0 + date[i] : date[i]; }
    return date[0] + "/" + date[1] + "/" + date[2];
};

// Game owned - Change state of button and tag
const addRemoveGame = async (button, tag_owned, gameID) => {
    const password = MDP_INPUT.value;
    const addOrRemove = await request("/ajoutsuppr", `?gameID=${gameID}&password=${password}`);
    if (addOrRemove.status == 200) {
        const addOrRemoveJson = await addOrRemove.json();
        if (addOrRemoveJson.result) {
            if (!addOrRemoveJson.result) {
                button.classList.add("rem");
                button.textContent = "➖ Supprimer de ma collection";
                tag_owned.classList.remove("no");
                tag_owned.classList.add("oui");
                tag_owned.innerHTML = "OUI";
                document.getElementById("how-may-game-owned").textContent = "J'ai " + (howManyGamesOwnedJson.count + 1) + " jeux sur " + lenGame + " en tout";
            } else {
                button.classList.remove("rem");
                button.classList.add("add");
                button.textContent = "➕ Ajouter à ma collection";
                tag_owned.classList.remove("oui");
                tag_owned.classList.add("no");
                tag_owned.innerHTML = "NON";
                document.getElementById("how-may-game-owned").textContent = "J'ai " + (howManyGamesOwnedJson.count - 1) + " jeux sur " + lenGame + " en tout";
            }
        }
    }
};

// Test if path to image valid
const testImagePath = (path) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = path;
    });
};


// Get list of games and convert the response in json then display them
const gameList = await request("/gamelist");
listGames = await gameList.json();
showWiiGames(listGames, currentRankGames);

// async function to use keyword await
async function showWiiGames(Games, currentIndex, searchText) {
    let currentIndexPage = 0; // c'est pour le synopsis trop long pour faire les changemets sur la bonne div\
    let lenGame = Games.length;

    if (searchText) {
        Games = Games.filter((game) => {
            game.title = game.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return game.title.includes(searchText);
        });
    }

    let maxPage = Math.ceil(Games.length / gamesOnPage);
    let currentPage = Math.ceil(currentIndex / gamesOnPage) + 1;
    page_indicator.innerHTML = "Page " + currentPage + " sur " + maxPage;
    if (currentPage === maxPage) {
        page_indicator.style.display = "none";
    } else {
        page_indicator.style.display = "block";
    }
    if (Games.length === 0) {
        if (filter === "games-owned") {
            no_result.textContent = "Je ne possède aucun jeu wii";
        } else if (filter === "games-owned") {
            no_result.textContent = "Je possède tous les jeux wii !";
        } else {
            no_result.textContent = "Pas de résultat pour " + searchText;
        }
        page_indicator.style.display = "none";
        button_haut_page.style.display = "none";
    } else {
        no_result.textContent = "";
        button_haut_page.style.display = "block";
    }

    for (let i = currentIndex; i < currentIndex + gamesOnPage; i++) {
        if (i < Games.length) {

            // Request game owned, convert to json, should return object result true of false
            const gameOwned = await request("/jeuxpossedes", `?gameID=${Games[i].id}`);
            const gameOwnedJson = await gameOwned.json();

            // Set cover path
            let coverPath = await testImagePath(IMG_COVERS_PATH + Games[i].id + ".png");
            coverPath = coverPath ? IMG_COVERS_PATH : IMG_COVERS_PATH2;

            // Build object with the game's data and create a template with the module "components/gamebox.js"
            const gamebox_data = {
                id: Games[i].id,
                title: Games[i].title,
                published: format_published_date([Games[i].day, Games[i].month, Games[i].year]),
                genres: Games[i].genres,
                editors: Games[i].developer,
                synopsis: Games[i].synopsis,
                owned: gameOwnedJson.result,
                covers: coverPath,
            };
            let templateGameBox = gamebox(gamebox_data); // create HTML template components/gamebox 

            // Ensuite on ajoute la div
            wiiGameListContainer.insertAdjacentHTML('beforeend', templateGameBox);

            // Get last game box element on the page
            const templateNodes = document.getElementsByClassName("game-box");
            const lastElement = templateNodes[templateNodes.length - 1];

            // Add event on button add/remove
            const gameButton = lastElement.querySelector("[wii-game-button]");
            const tag_owned = lastElement.querySelector("[wii-game-owned]");
            gameButton.addEventListener("click", (e) => { addRemoveGame(gameButton, tag_owned, Games[i].id, gameOwnedJson.result); });

            //Et après on vérifie si le synopsis est trop long, dans ce cas on ajoute le bouton 'Lire la suite'
            const gameSynopsisText = document.querySelectorAll(".game-synopsis");
            if (gameSynopsisText[currentIndexPage] !== undefined && gameSynopsisText[currentIndexPage].offsetHeight < gameSynopsisText[currentIndexPage].scrollHeight) {
                const readMore = document.querySelectorAll(".read-more");
                readMore[currentIndexPage].style.display = "block";
            }

            currentIndexPage++;
        }
    };

    readMoreButtonEvent();

    // Évenement pour détecter si on peut avancer, reculer d'une page
    const buttonNextPage = document.getElementById("next-page");
    const buttonPreviousPage = document.getElementById("previous-page");
    if (currentPage >= maxPage) {
        buttonNextPage.style.visibility = "hidden";
    } else {
        buttonNextPage.style.visibility = "visible";
    }

    if (currentPage === 1) {
        buttonPreviousPage.style.visibility = "hidden";
    } else {
        buttonPreviousPage.style.visibility = "visible";
    }

    // Display number of games owned
    howManyGamesOwned = await request(`/howmanygameowned`);
    const howManyGamesOwnedJson = await howManyGamesOwned.json();
    document.getElementById("how-may-game-owned").textContent = "J'ai " + howManyGamesOwnedJson.count + " jeux sur " + lenGame + " en tout";

}

//  Code de recherche
let outputSearch;
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", output => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }
    outputSearch = output.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    currentRankGames = 0;
    showWiiGames(listGames, currentRankGames, outputSearch);
});

// Fonction pour l'évent lire la suite
function readMoreButtonEvent() {
    const readMoreButton = document.querySelectorAll(".read-more");
    const gameSynopsisText = document.querySelectorAll(".game-synopsis");
    for (let i = 0; i < readMoreButton.length; i++) {
        readMoreButton[i].addEventListener("click", () => {
            if (readMoreButton[i].textContent === "Lire la suite") {
                gameSynopsisText[i].style.display = "block";
                readMoreButton[i].textContent = "Moins";
            } else {
                gameSynopsisText[i].style.display = "-webkit-box";
                readMoreButton[i].textContent = "Lire la suite";
            }
        });
    }
}


// Event pour quand on page sur page suivante ou page précédente 
document.getElementById("next-page").addEventListener("click", () => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }
    if (outputSearch === undefined) {
        sessionStorage.setItem("currentRankGames", currentRankGames + gamesOnPage);
    }
    currentRankGames = currentRankGames + gamesOnPage;
    showWiiGames(listGames, currentRankGames, outputSearch);
});

document.getElementById("previous-page").addEventListener("click", () => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }
    if (outputSearch === undefined) {
        sessionStorage.setItem("currentRankGames", currentRankGames - gamesOnPage);
    }
    currentRankGames = currentRankGames - gamesOnPage;
    showWiiGames(listGames, currentRankGames, outputSearch);
});



document.getElementById("filter").addEventListener('change', (e) => {
    filter = e.target.value;
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }

    fetch("https://wii-fanny-collection.onrender.com/gamelist?filter=" + filter)
        .then(resp => {
            return resp.json();
        })

        .then(
            data => {
                listGames = data;
                showWiiGames(listGames, 0, outputSearch);
            }
        );
});