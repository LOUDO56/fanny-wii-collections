
const wiiGameList = document.querySelector("[wii-games-template]")
const wiiGameListContainer = document.querySelector("[wii-games-container]")
const templateGameBox = wiiGameList.content.cloneNode(true).children[0]





fetch("./wiitdb.xml")
    .then(resp => {
        return resp.text();
    })
    .then(data => {
        let parser = new DOMParser(),
            xmlDoc = parser.parseFromString(data, "text/xml")
        const GamesListById = []
        const Games = [... xmlDoc.querySelectorAll("game")]
        let i = 0; // a enlever apres
        Games.forEach(GamesID => {
            if(i < 10){ // a enlever apres
                if(GamesID.querySelector("type").textContent === "" && GamesID.querySelector("region").textContent === "PAL" && !GamesID.querySelector('locale[lang="EN"]').querySelector("title").textContent.includes("(Demo)") && GamesID.querySelector("languages").textContent.includes("FR")){
                    const templateGameBox = wiiGameList.content.cloneNode(true).children[0]
                    const gameTitle = templateGameBox.querySelector("[wii-game-title]")
                    const gameCover = templateGameBox.querySelector("[wii-game-cover]")
                    //Définiton de l'image
                    gameCover.src = "Wii_covers/" + GamesID.querySelector("id").textContent + ".png"
                    gameCover.alt = "Pas de cover trouvé pour ce jeu"
    
                    //définition du titre
                    if(GamesID.querySelector('locale[lang="FR"]') !== null){
                        gameTitle.textContent = GamesID.querySelector('locale[lang="FR"]').querySelector("title").textContent
                    } else {
                        gameTitle.textContent = GamesID.querySelector('locale[lang="EN"]').querySelector("title").textContent
                    }
    
                    // Donner la date de sortie, les genres et les éditeurs
                    const gamePublished = templateGameBox.querySelector("[wii-game-published]")

                    // Date Sortie
                    let gamePublished_day = GamesID.querySelector("date").getAttribute("day")
                    let gamePublished_month = GamesID.querySelector("date").getAttribute("month")
                    let gamePublished_year = GamesID.querySelector("date").getAttribute("year")

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
                    gameGenres.innerHTML += " " + GamesID.querySelector("genre").textContent

                    // Editeurs

                    const gameEditors = templateGameBox.querySelector("[wii-game-editors]")
                    gameEditors.innerHTML += " " + GamesID.querySelector("publisher").textContent

                    //Synopsis

                    const gameSynopsis = templateGameBox.querySelector("[wii-game-synopsis]")
                    if(GamesID.querySelector('locale[lang="FR"]') !== null){
                        if(GamesID.querySelector('locale[lang="FR"]').querySelector("synopsis").textContent !== ""){
                            gameSynopsis.innerHTML += GamesID.querySelector('locale[lang="FR"]').querySelector("synopsis").textContent
                        } else {
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

                    wiiGameListContainer.append(templateGameBox)
                    i++; // a enlever apres
                }
            }
            
        })
        
    });
