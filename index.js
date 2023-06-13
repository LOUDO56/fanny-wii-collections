
// --------- Partie setup --------- //


const express = require('express');
const fs = require('fs');
const xml2js = require('xml2js')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();
const app = express();
require('dotenv').config({ path: 'mdp.env' });
const port = process.env.PORT;



const db = new sqlite3.Database('./wiigames.db', sqlite3.OPEN_READWRITE, (err)=>{
	if (err) return console.error(err.message);
	console.log("Connected to database")
});


app.listen(port, () => {
	console.log("Server started at port", port)
});

app.use(cors())



// --------- Partie intéraction --------- //



//Fonction principale pour retourner les jeux
app.get("/gamelist", (req, res) => {
	const request = req.query.filter;
	let sql = `SELECT * FROM gamelist ORDER BY title;`
	if(request === 'games-owned') {sql = `SELECT * FROM gamelist WHERE owned = true ORDER BY title;`}
	if(request === 'games-not-owned') {sql = `SELECT * FROM gamelist WHERE owned = false ORDER BY title;`}
	db.all(sql, (err, data) => {
		if (err) return console.error("Erreur durant récupération jeux", err.message)
		res.json(data)
	});
})


//Fonction qui permet de savoir combien de jeu nous avons
app.get('/howmanygameowned', (req, res) => {
	db.get(`SELECT COUNT(*) FROM gamelist WHERE owned = true`, (err, row) => {
		if (err) return console.error("Erreur lors de la récupération de nombre de jeuz possedés", err.message);
		res.json({count: row['COUNT(*)']});
	});
});




// Fonction qui permet de vérifier si le jeu est possédé ou non pour l'affichage HTML
app.get('/jeuxpossedes', (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT owned FROM gamelist WHERE id = ?;`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {

			if (row.owned === 1) {
				res.json({result: true})
			} else {
				res.json({result: false})
			}
	}
	});
});



// Fonction qui permet d'ajouter un jeu ou le supprimer
app.get('/ajoutsuppr', (req, res) => {
	if(req.query.password !== process.env.MDP){return;}
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT owned FROM gamelist WHERE id = ?;`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {

			if (row.owned === 1) {
				db.run(`UPDATE gamelist SET owned = 0, when_added = 0 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during deleting game owned to database: ", err.message);
				});
				res.json({result: true})
			} else {
				db.run(`UPDATE gamelist SET owned = 1, when_added = ? WHERE id = ?;`, [Date.now(), gameID], (err) => {
					if (err) return console.error("Error during inserting game owned to database: ", err.message);
				});
				res.json({result: false})
			}
		}
	});
});