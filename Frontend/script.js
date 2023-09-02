const wiiGameList = document.querySelector("[wii-games-template]")
const wiiGameListContainer = document.querySelector("[wii-games-container]")
if(sessionStorage.getItem("currentRankGames") === null){
    sessionStorage.setItem("currentRankGames", 0)
}


let currentRankGames = parseInt(sessionStorage.getItem("currentRankGames"));

let filter;
let listGames = []
let gamesOnPage = 10;
if (window.screen.width <= 486){
    gamesOnPage = 7;
}

let lengame = 0;

// const link_db = 'https://wii-fanny-collection.onrender.com'
const link_db = 'https://fannywiicollec.ddns.net'
//const link_db = 'http://192.168.1.41:4000'
// const link_db = 'http://localhost:4000'


if(link_db.includes('localhost')){document.querySelector('.dev-mode').textContent = 'Mode développeur activé'} // Savoir si je suis sur localhost ou non

fetch(link_db + "/gamelist")
    .then(resp =>{
        return resp.json()
    })

    .then(
        data => {
            listGames = data;
            lengame = listGames.length
            showWiiGames(listGames, currentRankGames);
        }
    )


function showWiiGames(Games, currentIndex, searchText){
    let currentIndexPage = 0; // c'est pour le synopsis trop long pour faire les changemets sur la bonne div\
    let howManyGameOwned;
    fetch(link_db + `/howmanygameowned`)
        .then(resp => {
            return resp.json();
        })

        .then(data => {
            howManyGameOwned = data.count
            document.getElementById("how-may-game-owned").textContent = "J'ai " + howManyGameOwned + " jeux sur " + lengame + " en tout"
        })

    // Filtre de recherche
    if(searchText !== undefined){
        const keyWords = searchText.split(' ')
        Games = Games.filter(game => {
            let titlegame = game.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // enlève les accents
            return keyWords.every(keyWord => titlegame.includes(keyWord)) || game.id.toLowerCase() === searchText;
        });
        

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
        if (filter === "games-owned"){
            document.getElementById("no-result").textContent = "Je ne possède aucun jeu wii"
        } else if (filter === "games-owned"){
            document.getElementById("no-result").textContent = "Je possède tous les jeux wii !"
        } else if (filter === "wish-list"){
            document.getElementById("no-result").textContent = "Je n'ai pas ajouté de souhait"
        } else {
            document.getElementById("no-result").textContent = "Pas de résultat pour " + searchText
        }
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
            const gameID = Games[i].id
            gameCover.alt = "Games ID " + Games[i].id;
            //Définiton de l'image a partir du serveur pour éviter les erreurs
            gameCover.src = "Frontend/Images/Covers/cover_loading.png"
            fetch(link_db + `/img?gameID=${gameID}`)
                .then(resp => resp.json())
                .then(data => {
                    gameCover.src = data.img_path;
                })

            //définition du titre

            gameTitle.textContent = Games[i].title


            // Donner la date de sortie, les genres et les éditeurs
            const gamePublished = templateGameBox.querySelector("[wii-game-published]")

            // Date Sortie
            let gamePublished_day = Games[i].day
            let gamePublished_month = Games[i].month
            let gamePublished_year = Games[i].year
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
            gameGenres.innerHTML += " " + Games[i].genres

            // Développeurs

            const gameDev = templateGameBox.querySelector("[wii-game-editors]")
            gameDev.innerHTML += " " + Games[i].developer


            //Synopsis

            const gameSynopsis = templateGameBox.querySelector("[wii-game-synopsis]")
            Games[i].synopsis = Games[i].synopsis.replaceAll("\\n", "\n")
            Games[i].synopsis = Games[i].synopsis.replaceAll("\\r", "")
            Games[i].synopsis = Games[i].synopsis.replaceAll('\\"', "\"")
            gameSynopsis.innerHTML += Games[i].synopsis


            // Bouton et verif si jeux possedés
            const gameOwned = templateGameBox.querySelector("[wii-game-owned]")
            const gameButton = templateGameBox.querySelector("[wii-game-button-collection]")
            const wishListButton = templateGameBox.querySelector("[wii-game-button-wishlist]")
            fetch(link_db + `/jeuxpossedes?gameID=${gameID}`)
                .then(resp => resp.json())
                .then(data => {
                    if(data.result === false){
                        gameButton.classList.toggle("add")
                        gameButton.textContent = "➕ Ajouter à ma collection"
                        gameOwned.classList.toggle("no")
                        gameOwned.innerHTML = "NON"
                        wishListButton.style.display = 'block'
                    } else {
                        wishListButton.style.display = "none";
                        gameButton.classList.toggle("rem")
                        gameButton.textContent = "➖ Supprimer de ma collection"
                        gameOwned.classList.toggle("oui")
                        gameOwned.innerHTML = "OUI"
                    }
                    })
                .catch(error => {
                    console.log('Erreur lors de la requête :', error);
            });

            fetch(link_db + `/inwishlist?gameID=${gameID}`)
                .then(resp => resp.json())
                .then(data => {
                    if(data.result === true){
                        wishListButton.innerHTML = "Ajouter à ma liste de souhait"
                    } else {
                        wishListButton.innerHTML = "Supprimer de ma liste de souhait"
                    }
                    })
                .catch(error => {
                    console.log('Erreur lors de la requête :', error);
            });

            wishListButton.addEventListener("click", () => {
                const password = document.getElementById('mdp-value').value
                fetch(link_db + `/wishlist?gameID=${gameID}&password=${password}`)
                    .then(resp => resp.json())
                    .then(data => {
                        if(data.result === true){
                            wishListButton.innerHTML = "Supprimer de ma liste de souhait"
                        } else {
                            wishListButton.innerHTML = "Ajouter à ma liste de souhait"
                        }
                    })
                    .catch(error => {
                        console.log('Erreur lors de la requête :', error);
                });
            });
            gameButton.addEventListener("click", (e) => {
                const password = document.getElementById('mdp-value').value
                fetch(link_db + `/ajoutsuppr?gameID=${gameID}&password=${password}`)
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
                        document.getElementById("how-may-game-owned").textContent = "J'ai " + howManyGameOwned + " jeux sur 1268 en tout"
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
let link
const searchInput = document.getElementById("search")
searchInput.addEventListener("input", output => {
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box")
    for(let i = 0; i < gamesPage.length; i++){
        document.getElementById("games-list").removeChild(gamesPage[i])
    } 
    outputSearch = output.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    let titleToSearch = outputSearch.replaceAll(" ", "+")
    link = `https://www.gametdb.com/Wii/Search?action=search&q=group%3DWii&submit=Search&id=&region=&type=%3DWii&title_EN=${titleToSearch}&title_FR=&title_DE=&title_ES=&title_IT=&title_NL=&title_PT=&title_SE=&title_DK=&title_NO=&title_FI=&title_GR=&title_TR=&title_JA=&title_KO=&title_ZHTW=&title_ZHCN=&title_RU=&developer=&publisher=&year=&month=&day=&genre=&rating=&descriptor=&players=&acc_other=&online_players=&online_online=&online_download=&online_score=&online_messageboard=&online_nintendods=&online_wiimmfi=&size_1=&crc=&md5=&sha1=&case_color=`
    sessionStorage.setItem("currentRankGames", 0)
    currentRankGames = 0;
    showWiiGames(listGames, currentRankGames, outputSearch)
})


document.getElementById("search_id").addEventListener("click", () => {
    window.open(link, "_blank")
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
    showWiiGames(listGames, currentRankGames , outputSearch)

});



document.getElementById("filter").addEventListener('change', (e) => {
    filter = e.target.value;
    const gamesPage = document.getElementById("games-list").querySelectorAll(".game-box")
    for(let i = 0; i < gamesPage.length; i++){
        document.getElementById("games-list").removeChild(gamesPage[i])
    }
        
    fetch(link_db + "/gamelist?filter=" + filter)
        .then(resp =>{
            return resp.json()
        })

        .then(
            data => {
                listGames = data;
                showWiiGames(listGames, 0, outputSearch);
            }
        )
});
