
const wiiGameList = document.querySelector("[wii-games-template]")
const wiiGameListContainer = document.querySelector("[wii-games-container]")
const templateGameBox = wiiGameList.content.cloneNode(true).children[0]
if(sessionStorage.getItem("currentRankGames") === null){
    sessionStorage.setItem("currentRankGames", 0)
}

let currentRankGames = parseInt(sessionStorage.getItem("currentRankGames"));



let listGames = []
let gamesOnPage = 10;
if (window.screen.width <= 486){
    gamesOnPage = 7;
}

fetch("./wiitdb.xml")
    .then(resp => {
        return resp.text();
    })
    .then(data => {
        let parser = new DOMParser(),
            xmlDoc = parser.parseFromString(data, "text/xml")
        let Games = [... xmlDoc.querySelectorAll("game")]
        Games.forEach(GamesID => {
            if(GamesID.querySelector("type").textContent === "" && GamesID.querySelector("region").textContent === "PAL" && !GamesID.querySelector('locale[lang="EN"]').querySelector("title").textContent.includes("(Demo)") && GamesID.querySelector("languages").textContent.includes("FR" || "EN")){
                listGames.push(GamesID)
            }
        })
        showWiiGames(listGames, currentRankGames);
        
    });




function showWiiGames(Games, currentIndex, searchText){
    let currentIndexPage = 0; // c'est pour le synopsis trop long pour faire les changemets sur la bonne div
    if(searchText !== undefined){
        let GameFiltered = []
        for(let i = 0; i < Games.length; i++){
            if(Games[i].querySelector('locale[lang="FR"]') !== null){
                if(Games[i].querySelector('locale[lang="FR"]').querySelector("title").textContent.toLowerCase().includes(searchText)){
                    GameFiltered.push(Games[i])
                }
            } else {
                if(Games[i].querySelector('locale[lang="EN"]').querySelector("title").textContent.toLowerCase().includes(searchText)){
                    GameFiltered.push(Games[i])
                }
            }
        }
        Games = GameFiltered;

    }
    let maxPage = Math.ceil(Games.length / gamesOnPage);
    let currentPage = Math.ceil(currentIndex / gamesOnPage)+1;
    document.getElementById("page-indicator").innerHTML =  "Page " + currentPage + " sur " + maxPage
    if(Games.length === 0){
        document.getElementById("no-result").textContent = "Pas de résultat pour " + searchText
        document.getElementById("page-indicator").style.display = "none"
    } else {
        document.getElementById("no-result").textContent = ""
        document.getElementById("page-indicator").style.display = "block"
    }
    for(let i = currentIndex; i < currentIndex+gamesOnPage; i++){
        if(i < Games.length){
            const templateGameBox = wiiGameList.content.cloneNode(true).children[0]
            const gameTitle = templateGameBox.querySelector("[wii-game-title]")
            const gameCover = templateGameBox.querySelector("[wii-game-cover]")
            //Définiton de l'image
            gameCover.src = "Wii_covers/" + Games[i].querySelector("id").textContent + ".png"
            gameCover.alt = "Pas de cover trouvé pour ce jeu"

            //définition du titre
            let gameTitleText;

            if(Games[i].querySelector('locale[lang="FR"]') !== null){
                gameTitle.textContent = Games[i].querySelector('locale[lang="FR"]').querySelector("title").textContent
                gameTitleText = Games[i].querySelector('locale[lang="FR"]').querySelector("title").textContent
            } else {
                gameTitle.textContent = Games[i].querySelector('locale[lang="EN"]').querySelector("title").textContent
                gameTitleText = Games[i].querySelector('locale[lang="EN"]').querySelector("title").textContent
            }

            // Donner la date de sortie, les genres et les éditeurs
            const gamePublished = templateGameBox.querySelector("[wii-game-published]")

            // Date Sortie
            let gamePublished_day = Games[i].querySelector("date").getAttribute("day")
            let gamePublished_month = Games[i].querySelector("date").getAttribute("month")
            let gamePublished_year = Games[i].querySelector("date").getAttribute("year")
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
            if(Games[i].querySelector("genre") !== null){
                gameGenres.innerHTML += " " + Games[i].querySelector("genre").textContent
            } else {
                gameGenres.innerHTML += " Inconnu"
            }
            

            // Editeurs

            const gameEditors = templateGameBox.querySelector("[wii-game-editors]")
            if(Games[i].querySelector("publisher").textContent === ""){
                gameEditors.innerHTML += " Inconnu"
            } else {
                gameEditors.innerHTML += " " + Games[i].querySelector("publisher").textContent
            }

            //Synopsis

            const gameSynopsis = templateGameBox.querySelector("[wii-game-synopsis]")
            if(Games[i].querySelector('locale[lang="FR"]') !== null){
                if(Games[i].querySelector('locale[lang="FR"]').querySelector("synopsis").textContent !== ""){
                    gameSynopsis.innerHTML += Games[i].querySelector('locale[lang="FR"]').querySelector("synopsis").textContent
                } else {
                    gameSynopsis.innerHTML += "Il n'y a pas de synopsis disponible pour ce jeu."
                }
            } else {
                if(Games[i].querySelector('locale[lang="EN"]').querySelector("synopsis").textContent === ""){
                    gameSynopsis.innerHTML += "Il n'y a pas de synopsis disponible pour ce jeu."
                }
            }

            // Bouton (Pour l'instant par défaut c'est en oui)

            const gameButton = templateGameBox.querySelector("[wii-game-button]")
            gameButton.classList.add("add")
            gameButton.textContent = "➕ Ajouter à ma collection"
            gameButton.addEventListener("click", () => {
                if(localStorage.getItem("password") === "test"){
                    console.log(gameID)
                } else {
                    console.log("ta pas le droit")
                }
               

            })

            // Dans la collection ou pas (Pour l'instant par défaut c'est en non)

            const gameOwned = templateGameBox.querySelector("[wii-game-owned]")
            gameOwned.classList.add("no")
            gameOwned.innerHTML = "NON"

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

let outputSearch;
const searchInput = document.getElementById("search")
searchInput.addEventListener("input", output => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box")
    for(let i = 0; i < gamesPage.length; i++){
        document.getElementById("games-list").removeChild(gamesPage[i])
    } 
    outputSearch = output.target.value.toLowerCase()
    sessionStorage.setItem("currentRankGames", 0)
    currentRankGames = 0;
    showWiiGames(listGames, currentRankGames, outputSearch)
})


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



document.getElementById("next-page").addEventListener("click", () => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box")
    for(let i = 0; i < gamesPage.length; i++){
        document.getElementById("games-list").removeChild(gamesPage[i])
    }
    if(outputSearch === undefined){
        sessionStorage.setItem("currentRankGames", currentRankGames+gamesOnPage)
    }
    currentRankGames = currentRankGames+gamesOnPage
    showWiiGames(listGames, currentRankGames, outputSearch)


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
    showWiiGames(listGames, currentRankGames, outputSearch)



});



