export const gameboxmini = (gamedata) => {
    return `
        <div class="card">
            <div class="wrapper">
                <img src="${gamedata.covers}${gamedata.id}.png" style="${gamedata.owned ? '' : 'filter: saturate(0)'}" class="gb_mini_cover" />
            </div>
            <img src="${gamedata.covers}${gamedata.id}.png" class="character" />
        </div>
    `;
};

{/* <img src="" class="title" /> */ }
// style=${gamedata.owned ? 'filter: saturate(0)' : ""}