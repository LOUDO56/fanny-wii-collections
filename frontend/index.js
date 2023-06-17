import { gamebox } from "./components/gamebox.js";

// Just have to change this to https://wii-fanny-collection.onrender.com for it to work for deployment
const HOST = "http://localhost:3000";
const IMG_PATH = "frontend/Img";
const IMG_COVERS_PATH = IMG_PATH + "/Wii_covers/";

// const wiiGameList = document.querySelector("[wii-games-template]");
const wiiGameListContainer = document.querySelector("[wii-games-container]");
if (sessionStorage.getItem("currentRankGames") === null) {
    sessionStorage.setItem("currentRankGames", 0);
}

const currentRankGames = parseInt(sessionStorage.getItem("currentRankGames"));
// let filter = document.getElementById("filter")
const optionFilter = "none";

const listGames = [];
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
const addRemoveGame = async (button, tag_owned, gameID, owned) => {
    const password = document.getElementById('mdp-value').value;
    const addOrRemove = await request("/ajoutsuppr", `?gameID=${gameID}&password=${password}`);
    const addOrRemoveJson = await addOrRemove.json();

    console.log("addOrRemoveJson", addOrRemoveJson);

    if (!owned) {
        button.classList.add("rem");
        button.textContent = "➖ Supprimer de ma collection";
        tag_owned.classList.remove("no");
        tag_owned.classList.add("oui");
        tag_owned.innerHTML = "OUI";
    } else {
        button.classList.remove("rem");
        button.classList.add("add");
        button.textContent = "➕ Ajouter à ma collection";
        tag_owned.classList.remove("oui");
        tag_owned.classList.add("no");
        tag_owned.innerHTML = "NON";
    }
};

// Get list of games and convert the response in json
const gameList = await request("/gamelist");
const gameListJson = await gameList.json();

gameListJson.forEach(GamesID => {
    if (GamesID.type[0] === "" && GamesID.region[0] === "PAL" && !GamesID.locale[0].title[0].toLowerCase().includes("(demo)") &&
        (GamesID.languages[0].includes("FR") || GamesID.languages[0].includes("EN"))) {
        let isTitleAlreadyPresent;
        if (GamesID.locale[1] && GamesID.locale[1].$.lang === "FR") {
            const title = GamesID.locale[1].title[0].toLowerCase();
            isTitleAlreadyPresent = listGames.some(game => game.locale[1].title[0].toLowerCase() === title);
        } else {
            const title = GamesID.locale[0].title[0].toLowerCase();
            isTitleAlreadyPresent = listGames.some(game => game.locale[0].title[0].toLowerCase() === title);
        }
        if (!isTitleAlreadyPresent) {
            listGames.push(GamesID);
        }
    }

});

showWiiGames(listGames, currentRankGames, optionFilter);

async function showWiiGames(Games, currentIndex, filter, searchText) {
    let currentIndexPage = 0; // c'est pour le synopsis trop long pour faire les changemets sur la bonne div\
    let howManyGameOwned = 0; // TODO à sauvegarder en base de données
    let lenGame = Games.length;

    if (searchText !== undefined) {
        let GameFiltered = [];
        let searchTextFilter;
        for (let i = 0; i < Games.length; i++) {
            if (Games[i].locale[1] !== undefined || Games[i].locale[1].$.lang === "FR") {
                searchTextFilter = Games[i].locale[1].title[0].toLowerCase();
            } else {
                searchTextFilter = Games[i].locale[0].title[0].toLowerCase();
            }

            searchTextFilter = searchTextFilter.replace("é", "e");
            searchTextFilter = searchTextFilter.replace("à", "a");
            if (searchTextFilter.toLowerCase().includes(searchText)) {
                GameFiltered.push(Games[i]);
            }
        }
        Games = GameFiltered;
    }

    let maxPage = Math.ceil(Games.length / gamesOnPage);
    let currentPage = Math.ceil(currentIndex / gamesOnPage) + 1;
    document.getElementById("page-indicator").innerHTML = "Page " + currentPage + " sur " + maxPage;
    if (currentPage === maxPage) {
        document.getElementById("page-indicator").style.display = "none";
    } else {
        document.getElementById("page-indicator").style.display = "block";
    }
    if (Games.length === 0) {
        document.getElementById("no-result").textContent = "Pas de résultat pour " + searchText;
        document.getElementById("page-indicator").style.display = "none";
        document.getElementById("button-haut-page").style.display = "none";
    } else {
        document.getElementById("no-result").textContent = "";
        document.getElementById("button-haut-page").style.display = "block";
    }

    for (let i = currentIndex; i < currentIndex + gamesOnPage; i++) {
        if (i < Games.length) {

            // définition du titre
            let gameTitle = Games[i].locale[1] && Games[i].locale[1].$.lang === "FR"
                ? Games[i].locale[1].title[0]
                : Games[i].locale[0].title[0];

            // Date Sortie
            const formatted_published_date = format_published_date([Games[i].date[0].$.day, Games[i].date[0].$.month, Games[i].date[0].$.year]);

            // Request game owned, convert to json, should return object result true of false
            const gameOwned = await request("/jeuxpossedes", "?gameID=${Games[i].id[0]}");
            const gameOwnedJson = await gameOwned.json();

            // Increment howManyGameOwned variable if owned
            if (gameOwnedJson.result) howManyGameOwned += 1;

            let gameSynopsis;
            if (Games[i].locale[1] && Games[i].locale[1].$.lang === "FR") {
                if (Games[i].locale[1].synopsis[0] !== "") {
                    gameSynopsis = Games[i].locale[1].synopsis[0];
                } else {
                    gameSynopsis = "Il n'y a pas de synopsis disponible pour ce jeu.";
                }
            } else {
                gameSynopsis = "Il n'y a pas de synopsis disponible pour ce jeu.";
            }

            const gamebox_data = {
                id: Games[i].id[0],
                title: gameTitle,
                published: formatted_published_date,
                genres: Games[i].genres,
                editors: Games[i].developer,
                synopsis: gameSynopsis,
                owned: gameOwnedJson.result,
                covers: IMG_COVERS_PATH,
            };
            let templateGameBox = gamebox(gamebox_data);

            // Ensuite on ajoute la div
            wiiGameListContainer.insertAdjacentHTML('beforeend', templateGameBox);

            // Get last game box element on the page
            const templateNodes = document.getElementsByClassName("game-box");
            const lastElement = templateNodes[templateNodes.length - 1];

            // Add event on button add/remove
            const gameButton = lastElement.querySelector("[wii-game-button]");
            const tag_owned = lastElement.querySelector("[wii-game-owned]");
            gameButton.addEventListener("click", (e) => { addRemoveGame(gameButton, tag_owned, Games[i].id[0], gameOwnedJson.result); });

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
    // const howMany = await fetch(HOST + `/howmanygameowned`);
    // const howManyJson = await howMany.json();
    // howManyJson.count;
    document.getElementById("how-may-game-owned").textContent = "J'ai " + howManyGameOwned + " jeux sur " + lenGame + " en tout";

}

//  Code de recherche
let outputSearch;
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", output => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }
    outputSearch = output.target.value.toLowerCase();
    outputSearch = outputSearch.replace(/é/g, "e");
    outputSearch = outputSearch.replace(/à/g, "a");
    outputSearch = outputSearch.replace(/î/g, "i");
    outputSearch = outputSearch.replace(/ï/g, "i");
    outputSearch = outputSearch.replace(/ô/g, "o");
    outputSearch = outputSearch.replace(/ö/g, "o");
    sessionStorage.setItem("currentRankGames", 0);
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