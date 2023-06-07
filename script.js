

fetch("./wiitdb.xml")
    .then(function(resp){
        return resp.text();
    })
    .then(function(data){
        let parser = new DOMParser(),
            xmlDoc = parser.parseFromString(data, "text/xml")
        const GamesListById = []
        const Games = [... xmlDoc.querySelectorAll("game")]
        Games.forEach(GamesID => {
            console.log(GamesID.querySelector("type").textContent )
            if(GamesID.querySelector("type").textContent === "" && GamesID.querySelector("region").textContent === "PAL" && GamesID.querySelector("languages").textContent.includes("FR")){
                GamesListById.push(
                    GamesID.querySelector("id").textContent,
                );
            }
        })
        console.log(GamesListById.length)
        const random_id = GamesListById[Math.floor(Math.random() * GamesListById.length)];
        console.log(random_id)
        const covers = "Wii_Covers/" + random_id + ".png";
        const image = document.createElement("img")
        image.src = covers;
        image.alt = "La cover pour ce jeu n'a pas été trouvée :("
        console.log(image.src);
        const container = document.getElementById("return-result")
        container.appendChild(image);
        
    });