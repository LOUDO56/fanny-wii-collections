
const wiiGameList = document.querySelector("[wii-games-template]")
const wiiGameListContainer = document.querySelector("[wii-games-container]")
const templateGameBox = wiiGameList.content.cloneNode(true).children[0]
if(sessionStorage.getItem("currentRankGames") === null){
    sessionStorage.setItem("currentRankGames", 0)
    sessionStorage.setItem("currentPage", 1)
}
let currentRankGames = parseInt(sessionStorage.getItem("currentRankGames"));
let currentPage = parseInt(sessionStorage.getItem("currentPage"))


let listGames = []

fetch("./wiitdb.xml")
    .then(resp => {
        return resp.text();
    })
    .then(data => {
        let parser = new DOMParser(),
            xmlDoc = parser.parseFromString(data, "text/xml")
        let Games = [... xmlDoc.querySelectorAll("game")]
        Games.forEach(GamesID => {
            if(GamesID.querySelector("type").textContent === "" && GamesID.querySelector("region").textContent === "PAL" && !GamesID.querySelector('locale[lang="EN"]').querySelector("title").textContent.includes("(Demo)") && GamesID.querySelector("languages").textContent.includes("FR")){
                listGames.push(GamesID)
            }
        })
        gameNextPage(listGames, currentRankGames, 0);
        
    });




function gameNextPage(Games, currentIndex, page){
    let currentIndexPage = 0; // c'est pour le synopsis trop long pour faire les changemets sur la bonne div
    for(let i = currentIndex; i < currentIndex+10; i++){
        if(i < Games.length){
            if(Games[i].querySelector("type").textContent === "" && Games[i].querySelector("region").textContent === "PAL" && !Games[i].querySelector('locale[lang="EN"]').querySelector("title").textContent.includes("(Demo)") && Games[i].querySelector("languages").textContent.includes("FR")){
                const templateGameBox = wiiGameList.content.cloneNode(true).children[0]
                const gameTitle = templateGameBox.querySelector("[wii-game-title]")
                const gameCover = templateGameBox.querySelector("[wii-game-cover]")
                //Définiton de l'image
                gameCover.src = "Wii_covers/" + Games[i].querySelector("id").textContent + ".png"
                gameCover.alt = "Pas de cover trouvé pour ce jeu"
    
                //définition du titre
                if(Games[i].querySelector('locale[lang="FR"]') !== null){
                    gameTitle.textContent = Games[i].querySelector('locale[lang="FR"]').querySelector("title").textContent
                } else {
                    gameTitle.textContent = Games[i].querySelector('locale[lang="EN"]').querySelector("title").textContent
                }
    
                // Donner la date de sortie, les genres et les éditeurs
                const gamePublished = templateGameBox.querySelector("[wii-game-published]")
    
                // Date Sortie
                let gamePublished_day = Games[i].querySelector("date").getAttribute("day")
                let gamePublished_month = Games[i].querySelector("date").getAttribute("month")
                let gamePublished_year = Games[i].querySelector("date").getAttribute("year")
    
                // On met un 0 si ils sont inférieur a 10 pour plus de netteté
                if(gamePublished_day < 10){
                    gamePublished_day = "0" + gamePublished_day
                }
    
                if(gamePublished_month < 10){
                    gamePublished_month = "0" + gamePublished_month.toString()
                }
    
                gamePublished.innerHTML += " " + gamePublished_day + "/" + gamePublished_month + "/" + gamePublished_year
    
                // Genres
                const gameGenres = templateGameBox.querySelector("[wii-game-genres]")
                gameGenres.innerHTML += " " + Games[i].querySelector("genre").textContent
    
                // Editeurs
    
                const gameEditors = templateGameBox.querySelector("[wii-game-editors]")
                gameEditors.innerHTML += " " + Games[i].querySelector("publisher").textContent
    
                //Synopsis
    
                const gameSynopsis = templateGameBox.querySelector("[wii-game-synopsis]")
                let synopsisTooLong = false;
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
    
                // Dans la collection ou pas (Pour l'instant par défaut c'est en non)
    
                const gameOwned = templateGameBox.querySelector("[wii-game-owned]")
                gameOwned.classList.add("no")
                gameOwned.innerHTML = "NON"
    
                // Ensuite on ajoute la div
                wiiGameListContainer.append(templateGameBox)
    
                // Et après on vérifie si le synopsis est trop long, dans ce cas on ajoute le bouton 'Lire la suite'
                const gameSynopsisText = document.querySelectorAll(".game-synopsis")
                if(gameSynopsisText[currentIndexPage].offsetHeight < gameSynopsisText[currentIndexPage].scrollHeight){
                    const readMore = document.querySelectorAll(".read-more")
                    readMore[currentIndexPage].style.display = "block"
                }
    
                currentIndexPage++;
            }
        }
    };
    readMoreButtonEvent()


}


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


document.getElementById("page-indicator").innerHTML =  "Page " + currentPage + " sur " + Math.ceil(1136 / 15)

const buttonNextPage = document.getElementById("next-page");
const buttonPreviousPage = document.getElementById("previous-page");
if(currentRankGames < listGames.length){
    buttonNextPage.style.display = "none";
}

if(currentRankGames < 10){
    buttonPreviousPage.style.display = "none";
}

document.getElementById("next-page").addEventListener("click", () => {
    sessionStorage.setItem("currentRankGames", currentRankGames+10)
    sessionStorage.setItem("currentPage", currentPage+1)
    location.reload();

});

document.getElementById("previous-page").addEventListener("click", () => {
    sessionStorage.setItem("currentRankGames", currentRankGames-10)
    sessionStorage.setItem("currentPage", currentPage-1)

    location.reload();

});

