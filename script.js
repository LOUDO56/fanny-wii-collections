const wiiGameList = document.querySelector("[wii-games-template]")
const wiiGameListContainer = document.querySelector("[wii-games-container]")
if(sessionStorage.getItem("currentRankGames") === null){
    sessionStorage.setItem("currentRankGames", 0)
}


let currentRankGames = parseInt(sessionStorage.getItem("currentRankGames"));
// let filter = document.getElementById("filter")
let optionFilter = "none"


let listGames = []
let gamesOnPage = 10;
if (window.screen.width <= 486){
    gamesOnPage = 7;
}





fetch("http://localhost:3000/gamelist")
    .then(resp =>{
        return resp.json()
    })

    .then(
        data => {
            data.forEach(GamesID => {
                if(GamesID.type[0] === "" && GamesID.region[0] === "PAL" && !GamesID.locale[0].title[0].toLowerCase().includes("(demo)") &&
                (GamesID.languages[0].includes("FR") || GamesID.languages[0].includes("EN"))){
                    let isTitleAlreadyPresent;
                    if(GamesID.locale[1] && GamesID.locale[1].$.lang === "FR"){
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

            })
            
            showWiiGames(listGames, currentRankGames, optionFilter);
        }
    )



function showWiiGames(Games, currentIndex, filter, searchText){
    let currentIndexPage = 0; // c'est pour le synopsis trop long pour faire les changemets sur la bonne div\
    let howManyGameOwned;
    let lenGame = Games.length;
    // fetch(`http://localhost:3000/howmanygameowned`)
    //     .then(resp => {
    //         return resp.json();
    //     })

    //     .then(data => {
    //         howManyGameOwned = data.count
    //         document.getElementById("how-may-game-owned").textContent = "J'ai " + howManyGameOwned + " jeux sur " + lenGame + " en tout"
    //     })

    if(searchText !== undefined){
        let GameFiltered = []
        let searchTextFilter;
        for(let i = 0; i < Games.length; i++){
            if(Games[i].locale[1] !== undefined || Games[i].locale[1].$.lang === "FR"){
                searchTextFilter = Games[i].locale[1].title[0].toLowerCase()
            } else {
                searchTextFilter = Games[i].locale[0].title[0].toLowerCase()
            }

            searchTextFilter = searchTextFilter.replace("é", "e")
            searchTextFilter = searchTextFilter.replace("à", "a")
            if(searchTextFilter.toLowerCase().includes(searchText)){
                GameFiltered.push(Games[i])
            }
        }
        Games = GameFiltered;

    }
        

    let maxPage = Math.ceil(Games.length / gamesOnPage);
    let currentPage = Math.ceil(currentIndex / gamesOnPage)+1;
    document.getElementById("page-indicator").innerHTML =  "Page " + currentPage + " sur " + maxPage
    if(currentPage === maxPage){
        document.getElementById("page-indicator").style.display = "none"
    } else {
        document.getElementById("page-indicator").style.display = "block"
    }
    if(Games.length === 0){
        document.getElementById("no-result").textContent = "Pas de résultat pour " + searchText
        document.getElementById("page-indicator").style.display = "none"
        document.getElementById("button-haut-page").style.display = "none"
    } else {
        document.getElementById("no-result").textContent = ""
        document.getElementById("button-haut-page").style.display = "block"
    }

    for(let i = currentIndex; i < currentIndex+gamesOnPage; i++){
        if(i < Games.length){
            const templateGameBox = wiiGameList.content.cloneNode(true).children[0]
            const gameTitle = templateGameBox.querySelector("[wii-game-title]")
            const gameCover = templateGameBox.querySelector("[wii-game-cover]")
            const gameID = Games[i].id[0]
            //Définiton de l'image
            gameCover.src = "Wii_covers/" + gameID + ".png"
            gameCover.alt = "Pas de cover trouvé pour ce jeu"

            //définition du titre
            let gameTitleText;

            if(Games[i].locale[1] && Games[i].locale[1].$.lang === "FR"){
                gameTitle.textContent = Games[i].locale[1].title[0]
                gameTitleText = Games[i].locale[1].title[0]
            } else {
                gameTitle.textContent = Games[i].locale[0].title[0]
                gameTitleText = Games[i].locale[0].title[0]
            }

            // Donner la date de sortie, les genres et les éditeurs
            const gamePublished = templateGameBox.querySelector("[wii-game-published]")

            // Date Sortie
            let gamePublished_day = Games[i].date[0].$.day
            let gamePublished_month = Games[i].date[0].$.month
            let gamePublished_year = Games[i].date[0].$.year
            gamePublished.innerHTML += " "

            // On met un 0 si ils sont inférieur a 10 pour plus de netteté
            if(gamePublished_day < 10 && gamePublished_day !== ""){gamePublished_day = "0" + gamePublished_day}
            if(gamePublished_month < 10 && gamePublished_month !== ""){gamePublished_month = "0" + gamePublished_month}

            if(gamePublished_day !== "") {gamePublished.innerHTML += gamePublished_day + "/"};
            if(gamePublished_month !== "") {gamePublished.innerHTML += gamePublished_month + "/"};
            if(gamePublished_year !== "") {gamePublished.innerHTML += gamePublished_year};
            
            if(gamePublished_day === "" && gamePublished_month === ""  && gamePublished_year === ""){gamePublished.innerHTML += "Inconnu"}


            // Genres
            const gameGenres = templateGameBox.querySelector("[wii-game-genres]")
            if(Games[i].genre[0] !== null){
                gameGenres.innerHTML += " " + Games[i].genre[0]
            } else {
                gameGenres.innerHTML += " Inconnu"
            }
            

            // Editeurs

            const gameEditors = templateGameBox.querySelector("[wii-game-editors]")
            if(Games[i].publisher[0] === ""){
                gameEditors.innerHTML += " Inconnu"
            } else {
                gameEditors.innerHTML += " " + Games[i].publisher[0]
            }

            //Synopsis

            const gameSynopsis = templateGameBox.querySelector("[wii-game-synopsis]")
            if(Games[i].locale[1] && Games[i].locale[1].$.lang === "FR"){
                if(Games[i].locale[1].synopsis[0] !== ""){
                    gameSynopsis.innerHTML += Games[i].locale[1].synopsis[0]
                } else {
                    gameSynopsis.innerHTML += "Il n'y a pas de synopsis disponible pour ce jeu."
                }
            } else {
                gameSynopsis.innerHTML += "Il n'y a pas de synopsis disponible pour ce jeu."
            }

            // Bouton et verif si jeux possedés
            const gameOwned = templateGameBox.querySelector("[wii-game-owned]")
            const gameButton = templateGameBox.querySelector("[wii-game-button]")
            fetch(`http://localhost:3000/jeuxpossedes?gameID=${gameID}`)
                    .then(resp => resp.json())
                    .then(data => {
                        if(data.result === false){
                            gameButton.classList.toggle("add")
                            gameButton.textContent = "➕ Ajouter à ma collection"
                            gameOwned.classList.toggle("no")
                            gameOwned.innerHTML = "NON"
                        } else {
                            gameButton.classList.toggle("rem")
                            gameButton.textContent = "➖ Supprimer de ma collection"
                            gameOwned.classList.toggle("oui")
                            gameOwned.innerHTML = "OUI"
                        }
                        })
                    .catch(error => {
                        console.log('Erreur lors de la requête :', error);
                });
            gameButton.addEventListener("click", (e) => {
                fetch(`http://localhost:3000/ajoutsuppr?gameID=${gameID}`)
                    .then(resp => resp.json())
                    .then(data => {
                        if(data.result === false){
                            gameButton.classList.remove("add")
                            gameButton.classList.add("rem")
                            gameButton.textContent = "➖ Supprimer de ma collection"
                            gameOwned.classList.remove("no")
                            gameOwned.classList.add("oui")
                            gameOwned.innerHTML = "OUI"
                            howManyGameOwned++;
                        } else {
                            gameButton.classList.remove("rem")
                            gameButton.classList.add("add")
                            gameButton.textContent = "➕ Ajouter à ma collection"
                            gameOwned.classList.remove("oui")
                            gameOwned.classList.add("no")
                            gameOwned.innerHTML = "NON"
                            howManyGameOwned--;
                        }
                        document.getElementById("how-may-game-owned").textContent = "J'ai " + howManyGameOwned + " jeux sur " + Games.length + " en tout"
                    })
                    .catch(error => {
                        console.log('Erreur lors de la requête :', error);
                });
            });
            
            

            // Dans la collection ou pas (Pour l'instant par défaut c'est en non)



            // Ensuite on ajoute la div
            wiiGameListContainer.append(templateGameBox)

            //Et après on vérifie si le synopsis est trop long, dans ce cas on ajoute le bouton 'Lire la suite'
            const gameSynopsisText = document.querySelectorAll(".game-synopsis")
            if(gameSynopsisText[currentIndexPage] !== undefined && gameSynopsisText[currentIndexPage].offsetHeight < gameSynopsisText[currentIndexPage].scrollHeight){
                const readMore = document.querySelectorAll(".read-more")
                readMore[currentIndexPage].style.display = "block"
            }

            currentIndexPage++;
        }
    };
    readMoreButtonEvent()


    // Évenement pour détecter si on peut avancer, reculer d'une page
    const buttonNextPage = document.getElementById("next-page");
    const buttonPreviousPage = document.getElementById("previous-page");
    if(currentPage >= maxPage){
        buttonNextPage.style.visibility = "hidden";
    } else {
        buttonNextPage.style.visibility = "visible";
    }

    if(currentPage === 1){
        buttonPreviousPage.style.visibility = "hidden";
    } else {
        buttonPreviousPage.style.visibility = "visible";
    }

}


//  Code de recherche
let outputSearch;
const searchInput = document.getElementById("search")
searchInput.addEventListener("input", output => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box")
    for(let i = 0; i < gamesPage.length; i++){
        document.getElementById("games-list").removeChild(gamesPage[i])
    } 
    outputSearch = output.target.value.toLowerCase()
    outputSearch = outputSearch.replace("é", "e")
    outputSearch = outputSearch.replace("à", "a")
    sessionStorage.setItem("currentRankGames", 0)
    currentRankGames = 0;
    showWiiGames(listGames, currentRankGames, optionFilter, outputSearch)
})


// Fonction pour l'évent lire la suite
function readMoreButtonEvent(){
    const readMoreButton = document.querySelectorAll(".read-more")
    const gameSynopsisText = document.querySelectorAll(".game-synopsis")
    for(let i = 0; i < readMoreButton.length; i++){
        readMoreButton[i].addEventListener("click", () => {
            if(readMoreButton[i].textContent === "Lire la suite"){
                gameSynopsisText[i].style.display = "block"
                readMoreButton[i].textContent = "Moins"
            } else {
                gameSynopsisText[i].style.display = "-webkit-box"
                readMoreButton[i].textContent = "Lire la suite"
            }
        });
    }
}


// Event pour quand on page sur page suivante ou page précédente 
document.getElementById("next-page").addEventListener("click", () => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box")
    for(let i = 0; i < gamesPage.length; i++){
        document.getElementById("games-list").removeChild(gamesPage[i])
    }
    if(outputSearch === undefined){
        sessionStorage.setItem("currentRankGames", currentRankGames+gamesOnPage)
    }
    currentRankGames = currentRankGames+gamesOnPage
    showWiiGames(listGames, currentRankGames, optionFilter, outputSearch)


});

document.getElementById("previous-page").addEventListener("click", () => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box")
    for(let i = 0; i < gamesPage.length; i++){
        document.getElementById("games-list").removeChild(gamesPage[i])
    } 
    if(outputSearch === undefined){
        sessionStorage.setItem("currentRankGames", currentRankGames-gamesOnPage)
    }
    currentRankGames = currentRankGames-gamesOnPage
    showWiiGames(listGames, currentRankGames, optionFilter ,outputSearch)



});



// filter.addEventListener('change', (e) => {
//     optionFilter = e.target.value
//     const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box")
//     for(let i = 0; i < gamesPage.length; i++){
//         document.getElementById("games-list").removeChild(gamesPage[i])
//     } 
// });
