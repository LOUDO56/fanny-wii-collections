export const gamebox = (gamedata) => {
    return `
    <div class="game-box ${gamedata.id}">
        <div class="game-header">
            <div class="img-cover"><img wii-game-cover src="${gamedata.covers}${gamedata.id}.png" alt="${gamedata.covers ? gamedata.title : "Pas de cover trouvé pour ce jeu"}" /></div>
            <div class="game-information">
                <div class="game-information-header">
                    <h2 class="game-title" wii-game-title>${gamedata.title}</h2>
                    <div>
                        <p class="game-is-owned">Dans la collection
                            <p wii-game-owned class="${gamedata.owned ? "oui" : "no"}">${gamedata.owned ? "OUI" : "NON"}</p>
                        </p>
                    </div>
                </div>
                <div class="game-information-body">
                    <div class="game-little-info">
                        <p class="game-published" wii-game-published><strong>Sortie:</strong> ${gamedata.published}</p>
                        <p class="game-genres" wii-game-genres><strong>Genres:</strong> ${gamedata.genres ? gamedata.genres : " Inconnu"}</p>
                        <p class="game-editors" wii-game-editors><strong>Éditeurs:</strong> ${gamedata.editors ? gamedata.editors : " Inconnu"}</p>
                    </div>
                    <div class="game-synopsis" wii-game-synopsis>
                        <strong>Synopsis:</strong> ${gamedata.synopsis}
                    </div>
                    <button class="read-more">Lire la suite</button>
                </div>
            </div>
        </div>
        <hr>
        <div class="game-footer">
            <div class="button-add-rem">
                <button wii-game-button class="${gamedata.owned ? "rem" : "add"}" onclick="${gamedata.addRemoveEvent}">${gamedata.owned ? "➖ Supprimer de ma collection" : "➕ Ajouter à ma collection"}</button>
            </div>
        </div>
    </div>
    `;
};