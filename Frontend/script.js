const wiiGameList = document.querySelector("[wii-games-template]");
const wiiGameListContainer = document.querySelector("[wii-games-container]");
if (sessionStorage.getItem("currentRankGames") === null) {
    sessionStorage.setItem("currentRankGames", 0);
}

let currentRankGames = parseInt(sessionStorage.getItem("currentRankGames"));

let filter;
let listGames = [];
let gamesOnPage = 10;
if (window.screen.width <= 486) {
    gamesOnPage = 7;
}

let lengame = 0;
let link_db;

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}


link_db = 'https://fannywiicollec.ddns.net';


document.querySelector(".login").addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = {
        passwd: $("#mdp-value").val()
    };

    $.post(link_db + "/login", formData, (res) => {
        if (res.result === true) {
            location.reload();
            setCookie("token", res.token, 120)
        } else {
            document.querySelector(".bad-passwd").textContent = "Mauvais mot de passe.";
            document.querySelector(".bad-passwd").style.display = "block";

        }
    });


})


async function isConnected(){
    const token = getCookie("token")
    if(token !== ""){
        document.querySelector("#security-mdp").style.display = "none";
        document.querySelector(".login").remove();
    } else {
        document.querySelector(".coin-container").style.display = "none";
        document.querySelector(".not-connected").textContent = "Tu n'es pas connecté. Tu ne peux pas voir la liste des jeux."
        return;
    }
    try {
        document.querySelector(".coin-container").style.display = "flex";
        let filter = sessionStorage.getItem('currentFilter');
        let rq;
        if (filter === null){
            rq = "/gamelist"
        } else {
            rq = "/gamelist?filter=" + filter
        }
        const reqWiiGames = await fetch(link_db + rq, {
            headers: {
                "authorization" : "Barer " + token
            }
        })
        const wiiGames = await reqWiiGames.json();
        listGames = wiiGames;
        if(sessionStorage.getItem('lengame') == null){
            sessionStorage.setItem('lengame', listGames.length)
        }
        lengame = sessionStorage.getItem('lengame');

        showWiiGames(wiiGames, currentRankGames);
        fetch(link_db + `/howmanygameowned`, {
            headers: {
                "authorization" : "Barer " + token
            }
        })
            .then((resp) => {
                return resp.json();
            })
    
            .then((data) => {
                howManyGameOwned = data.count;
                document.getElementById("how-may-game-owned").textContent =
                    "J'ai " +
                    howManyGameOwned +
                    " jeux sur " +
                    lengame +
                    " en tout";
            });

    
    } catch (e) {
        document.querySelector(".coin-container").style.display = "none";
        console.log("Erreur durant récup des jeux wii : " + e)
        document.querySelector(".not-connected").textContent = "Le serveur ne répond pas. Il est peut être hors-service."
    }

}

isConnected()

async function loadCover(gameCover, imgLink){
    var img = new Image();
    gameCover.src = imgLink
    gameCover.src = "Images/Covers/cover_loading.png";
    const res = await fetch(imgLink);
    if(res.status == 200){
        gameCover.src = imgLink;
    } else {
        gameCover.src = "Images/Covers/cover_not_found.png";
    }
    
}
    
function showWiiGames(Games, currentIndex, searchText) {
    let currentIndexPage = 0; // c'est pour le synopsis trop long pour faire les changemets sur la bonne div\
    const token = getCookie("token")

    // Filtre de recherche
    if (searchText !== undefined) {
        const keyWords = searchText.split(" ");
        Games = Games.filter((game) => {
            let titlegame = game.title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, ""); // enlève les accents
            return (
                keyWords.every((keyWord) => titlegame.includes(keyWord)) ||
                game.id.toLowerCase() === searchText
            );
        });
    }
    

    let maxPage = Math.ceil(Games.length / gamesOnPage);
    let currentPage = Math.ceil(currentIndex / gamesOnPage) + 1;
    document.getElementById("page-indicator").innerHTML =
        "Page " + currentPage + " sur " + maxPage;

    if (currentPage === maxPage && maxPage === 1) {
        document.getElementById("page-indicator").style.display = "none";
    } else {
        document.getElementById("page-indicator").style.display = "block";
    }

    if (Games.length === 0) {
        if (filter === "games-owned") {
            document.getElementById("no-result").textContent =
                "Je ne possède aucun jeu wii";
        } else if (filter === "games-owned") {
            document.getElementById("no-result").textContent =
                "Je possède tous les jeux wii !";
        } else if (filter === "wish-list") {
            document.getElementById("no-result").textContent =
                "Je n'ai pas ajouté de souhait";
        } 

        if(searchText !== undefined){
            document.getElementById("no-result").textContent =
                "Pas de résultat pour " + searchText;
        }

        document.getElementById("page-indicator").style.display = "none";
        document.getElementById("button-haut-page").style.display = "none";
    } else {
        document.getElementById("no-result").textContent = "";
        document.getElementById("button-haut-page").style.display = "block";
    }

    for (let i = currentIndex; i < currentIndex + gamesOnPage; i++) {
        if (i < Games.length) {
            const templateGameBox =
                wiiGameList.content.cloneNode(true).children[0];
            const gameTitle = templateGameBox.querySelector("[wii-game-title]");
            const gameCover = templateGameBox.querySelector("[wii-game-cover]");
            const gameID = Games[i].id;
            gameCover.alt = "Games ID " + Games[i].id;

            //gameCover.src = "Images/Covers/" + gameID + ".png";
	        loadCover(gameCover, "Images/Covers/" + gameID + ".png")


            //définition du titre

            gameTitle.textContent = Games[i].title;

            // Donner la date de sortie, les genres et les éditeurs
            const gamePublished = templateGameBox.querySelector(
                "[wii-game-published]"
            );

            // Date Sortie
            let gamePublished_day = Games[i].day;
            let gamePublished_month = Games[i].month;
            let gamePublished_year = Games[i].year;
            gamePublished.innerHTML += " ";

            // On met un 0 si ils sont inférieur a 10 pour plus de netteté
            if (gamePublished_day < 10 && gamePublished_day !== "") {
                gamePublished_day = "0" + gamePublished_day;
            }
            if (gamePublished_month < 10 && gamePublished_month !== "") {
                gamePublished_month = "0" + gamePublished_month;
            }

            if (gamePublished_day !== "") {
                gamePublished.innerHTML += gamePublished_day + "/";
            }
            if (gamePublished_month !== "") {
                gamePublished.innerHTML += gamePublished_month + "/";
            }
            if (gamePublished_year !== "") {
                gamePublished.innerHTML += gamePublished_year;
            }

            if (
                gamePublished_day === "" &&
                gamePublished_month === "" &&
                gamePublished_year === ""
            ) {
                gamePublished.innerHTML += "Inconnu";
            }

            // Genres
            const gameGenres =
                templateGameBox.querySelector("[wii-game-genres]");
            gameGenres.innerHTML += " " + Games[i].genres;

            // Développeurs

            const gameDev = templateGameBox.querySelector("[wii-game-editors]");
            gameDev.innerHTML += " " + Games[i].developer;

            //Synopsis

            const gameSynopsis = templateGameBox.querySelector(
                "[wii-game-synopsis]"
            );
            Games[i].synopsis = Games[i].synopsis.replaceAll("\\n", "\n");
            Games[i].synopsis = Games[i].synopsis.replaceAll("\\r", "");
            Games[i].synopsis = Games[i].synopsis.replaceAll('\\"', '"');
            gameSynopsis.innerHTML += Games[i].synopsis;

            // Bouton et verif si jeux possedés
            const gameOwned = templateGameBox.querySelector("[wii-game-owned]");
            const gameButton = templateGameBox.querySelector(
                "[wii-game-button-collection]"
            );
            const wishListButton = templateGameBox.querySelector(
                "[wii-game-button-wishlist]"
            );
            const textWhenOwned = templateGameBox.querySelector('[wii-game-when-owned]')

            if (Games[i].owned === 0) {
                gameButton.classList.toggle("add");
                gameButton.textContent = "➕ Ajouter à ma collection";
                gameOwned.classList.toggle("no");
                gameOwned.innerHTML = "NON";
                wishListButton.style.display = "block";
            } else {
                wishListButton.style.display = "none";
                gameButton.classList.toggle("rem");
                gameButton.textContent =
                    "➖ Supprimer de ma collection";
                gameOwned.classList.toggle("oui");
                gameOwned.innerHTML = "OUI";
                let date = Games[i].owned_when;
                if(date === null){
                    date = "?"
                }
                textWhenOwned.textContent = "Ajouté le " + date;
            }

            if (Games[i].wish === 0) {
                wishListButton.innerHTML =
                    "Ajouter à ma liste de souhait";
            } else {
                wishListButton.innerHTML =
                    "Supprimer de ma liste de souhait";
            }


            wishListButton.addEventListener("click", () => {
                fetch(link_db + `/wishlist?gameID=${gameID}`, {
                    headers: {
                        "authorization" : "Barer " + token
                    }
                })
                .then((resp) => resp.json())
                .then((data) => {
                    if(data.result === true){
                        wishListButton.innerHTML = "Supprimer de ma liste de souhait";
                        Games[i].wish = 1;
                    } else {
                        wishListButton.innerHTML = "Ajouter à ma liste de souhait";
                        Games[i].wish = 0;
                    }
                })
                .catch((error) => {
                    console.log("Erreur lors de la requête :", error);
                });
            });

            gameButton.addEventListener("click", (e) => {
                fetch(link_db + `/ajoutsuppr?gameID=${gameID}`, {
                    headers: {
                        "authorization" : "Barer " + token
                    }
                })
                    .then((resp) => resp.json())
                    .then((data) => {
                        if (data.result === false) {
                            gameButton.classList.remove("add");
                            gameButton.classList.add("rem");
                            gameButton.textContent =
                                "➖ Supprimer de ma collection";
                            gameOwned.classList.remove("no");
                            gameOwned.classList.add("oui");
                            gameOwned.innerHTML = "OUI";
                            Games[i].owned = 1;
                            howManyGameOwned++;
                        } else {
                            gameButton.classList.remove("rem");
                            gameButton.classList.add("add");
                            gameButton.textContent =
                                "➕ Ajouter à ma collection";
                            gameOwned.classList.remove("oui");
                            gameOwned.classList.add("no");
                            gameOwned.innerHTML = "NON";
                            Games[i].owned = 0;
                            textWhenOwned.textContent = "";
                            howManyGameOwned--;
                        }
                        document.getElementById(
                            "how-may-game-owned"
                        ).textContent =
                            "J'ai " +
                            howManyGameOwned +
                            " jeux sur " +
                            lengame +
                            " en tout";
                    })
                    .catch((error) => {
                        console.log("Erreur lors de la requête :", error);
                    });
            });

            // Dans la collection ou pas (Pour l'instant par défaut c'est en non)

            // Ensuite on ajoute la div
            wiiGameListContainer.append(templateGameBox);

            //Et après on vérifie si le synopsis est trop long, dans ce cas on ajoute le bouton 'Lire la suite'
            const gameSynopsisText =
                document.querySelectorAll(".game-synopsis");
            if (
                gameSynopsisText[currentIndexPage] !== undefined &&
                gameSynopsisText[currentIndexPage].offsetHeight <
                    gameSynopsisText[currentIndexPage].scrollHeight
            ) {
                const readMore = document.querySelectorAll(".read-more");
                readMore[currentIndexPage].style.display = "block";
            }

            currentIndexPage++;

        }
    }
    readMoreButtonEvent();

    document.getElementById("button-haut-page").style.visibility = "visible";
    document.getElementById("page-indicator").style.visibility = "visible";
    document.querySelector(".coin-container").style.display = "none";

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
}

//  Code de recherche
let outputSearch;
let link;
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", (output) => {
    const gamesPage = document
        .getElementById("games-list")
        .querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }
    outputSearch = output.target.value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    let titleToSearch = outputSearch.replaceAll(" ", "+");
    link = `https://www.gametdb.com/Wii/Search?action=search&q=group%3DWii&submit=Search&id=&region=&type=%3DWii&title_EN=${titleToSearch}&title_FR=&title_DE=&title_ES=&title_IT=&title_NL=&title_PT=&title_SE=&title_DK=&title_NO=&title_FI=&title_GR=&title_TR=&title_JA=&title_KO=&title_ZHTW=&title_ZHCN=&title_RU=&developer=&publisher=&year=&month=&day=&genre=&rating=&descriptor=&players=&acc_other=&online_players=&online_online=&online_download=&online_score=&online_messageboard=&online_nintendods=&online_wiimmfi=&size_1=&crc=&md5=&sha1=&case_color=`;
    sessionStorage.setItem("currentRankGames", 0);
    currentRankGames = 0;
    showWiiGames(listGames, currentRankGames, outputSearch);
});

document.getElementById("search_id").addEventListener("click", () => {
    window.open(link, "_blank");
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
    const gamesPage = document
        .getElementById("games-list")
        .querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }
    if (outputSearch === undefined) {
        sessionStorage.setItem(
            "currentRankGames",
            currentRankGames + gamesOnPage
        );
    }
    currentRankGames = currentRankGames + gamesOnPage;
    showWiiGames(listGames, currentRankGames, outputSearch);
});

document.getElementById("previous-page").addEventListener("click", () => {
    const gamesPage = document
        .getElementById("games-list")
        .querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }
    if (outputSearch === undefined) {
        sessionStorage.setItem(
            "currentRankGames",
            currentRankGames - gamesOnPage
        );
    }
    currentRankGames = currentRankGames - gamesOnPage;
    showWiiGames(listGames, currentRankGames, outputSearch);
});

document.getElementById("filter").addEventListener("change", (e) => {
    filter = e.target.value;
    document.querySelector(".coin-container").style.display = "flex";
    document.querySelector(".pageSelect button").style.visibility = "hidden";
    document.getElementById("previous-page").style.visibility = "hidden";
    document.getElementById("next-page").style.visibility = "hidden";
    document.getElementById("page-indicator").style.visibility = "hidden";
    document.getElementById("button-haut-page").style.visibility = "hidden";
    const gamesPage = document
        .getElementById("games-list")
        .querySelectorAll(".game-box");
    for (let i = 0; i < gamesPage.length; i++) {
        document.getElementById("games-list").removeChild(gamesPage[i]);
    }

    fetch(link_db + "/gamelist?filter=" + filter, {
        headers: {
            "authorization" : "Barer " + getCookie("token")
        }
    })
        .then((resp) => {
            return resp.json();
        })

        .then((data) => {
            listGames = data;
            currentRankGames = 0;
            sessionStorage.setItem("currentRankGames", 0);
            sessionStorage.setItem("currentFilter", filter);
            showWiiGames(listGames, 0, outputSearch);
        })

        .catch((error) => {
            document.querySelector(".coin-container").style.display = "none";
            document.querySelector(".not-connected").textContent = "Oula ! Trop vite."
        });
});
