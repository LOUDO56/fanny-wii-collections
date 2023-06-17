
// --------- Partie setup --------- //


const express = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
require('dotenv').config({ path: 'mdp.env' });
const port = process.env.PORT;

const db = mysql.createPool({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
	port: process.env.PORTDB,
})


app.listen(port, () => {
	console.log("Server started at port", port)
});

app.use(cors())



// --------- Partie intéraction --------- //



//Fonction principale pour retourner les jeux
app.get("/gamelist", (req, res) => {
	const request = req.query.filter;
	let sql = `SELECT * FROM wiigames ORDER BY title;`
	if(request === 'games-owned') {sql = `SELECT * FROM wiigames WHERE owned = true ORDER BY title;`}
	if(request === 'games-not-owned') {sql = `SELECT * FROM wiigames WHERE owned = false ORDER BY title;`}
	db.query(sql, (err, data) => {
		if (err) return console.error("Erreur durant récupération jeux", err.message)
		res.json(data)
	});
})


//Fonction qui permet de savoir combien de jeu nous avons
app.get('/howmanygameowned', (req, res) => {
	db.query(`SELECT COUNT(*) FROM wiigames WHERE owned = true`, (err, row) => {
		if (err) return console.error("Erreur lors de la récupération de nombre de jeuz possedés", err.message);
		res.json({count: row[0]['COUNT(*)']});
	});
});




// Fonction qui permet de vérifier si le jeu est possédé ou non pour l'affichage HTML
app.get('/jeuxpossedes', (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.query(`SELECT owned FROM wiigames WHERE id = ?;`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {

			if (row[0].owned === 1) {
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
	db.query(`SELECT owned FROM wiigames WHERE id = ?;`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {

			if (row[0].owned === 1) {
				db.query(`UPDATE wiigames SET owned = 0 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during deleting game owned to database: ", err.message);
				});
				res.json({result: true})
			} else {
				db.query(`UPDATE wiigames SET owned = 1 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during inserting game owned to database: ", err.message);
				});
				res.json({result: false})
			}
		}
	});
});
