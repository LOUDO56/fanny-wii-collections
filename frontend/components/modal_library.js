import conf from "../config.js";
import { gameboxmini } from "./gameboxmini.js";

let games = [];

const lib_modal = document.getElementById("lib_modal");
const lib_modal_content = document.getElementById("lib_modal_content");
const lib_btn = document.getElementById("modal_lib_btn");

window.onclick = (event) => {
    if (event.target == lib_modal) {
        lib_modal_content.innerHTML = "";
        lib_modal.style.display = "none";
    }
};

const testImagePath = (path) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = path;
    });
};

const request = async (uri, arg = "") => {
    const response = await fetch(conf.HOST + uri + arg);
    return response;
};

lib_btn.onclick = async () => {
    lib_modal.style.display = "block";

    const gameList = await request("/gamelist");
    games = await gameList.json();

    for (let i = 0; i < 50; i++) {
        if (i < games.length) {

            // Request game owned, convert to json, should return object result true of false
            const gameOwned = await request("/jeuxpossedes", `?gameID=${games[i].id}`);
            const gameOwnedJson = await gameOwned.json();

            // Set cover path
            let coverPath = await testImagePath(conf.IMG_COVERS_PATH + games[i].id + ".png");
            coverPath = coverPath ? conf.IMG_COVERS_PATH : conf.IMG_COVERS_PATH2;

            // Build object with the game's data and create a template with the module "components/gamebox.js"
            const gamebox_data = {
                id: games[i].id,
                title: games[i].title,
                // published: format_published_date([games[i].day, games[i].month, games[i].year]),
                genres: games[i].genres,
                editors: games[i].developer,
                synopsis: games[i].synopsis,
                owned: gameOwnedJson.result,
                covers: coverPath,
            };
            let templateGameBox = gameboxmini(gamebox_data); // create HTML template components/gamebox 

            lib_modal_content.insertAdjacentHTML('beforeend', templateGameBox);

            // Get last game box element on the page
            // const templateNodes = document.getElementsByClassName("game-box");
            // const lastElement = templateNodes[templateNodes.length - 1];
            // Eventual events

        }
    }
};