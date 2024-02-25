
// --------- Partie setup --------- //


const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors');
const app = express();
const { rateLimit } = require('express-rate-limit')
require('dotenv').config({path: 'mdp.env'})
const port = 4000;
const cron = require('node-cron');

let db = new sqlite3.Database('wiigames.db')

app.listen(port, () => {
	console.log("Server started at port", port)
});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authenticateToken = require("./middleware.js")


const RetreiveGameLimiter = rateLimit({
	windowMs: 5000,
	max: 3,
})

const addRemLimit = rateLimit({
	windowMs: 5000,
	max: 10
})

// Backup Régulier tous les mois
cron.schedule("0 0 1 * *", () => {
	// Reset si il y a plus de 5 backups
	fs.readdir("db_backup", (err, files) => {
		if(err) console.log("Erreur durant reset backup : " + err);
		if(files.length == 5){
			for (const file of files) {
				fs.unlink("db_backup/" + file, (err) => {
					if (err) throw err;
				});
			}
		}
	});
	const backupDate = new Date();
	const fullDate = backupDate.getDate() + "-" + (backupDate.getMonth() + 1) + "-" + backupDate.getFullYear();
	fs.copyFile("wiigames.db", "db_backup/wiigames-" + fullDate + ".db", (err) =>{
		if(err) console.log("Erreur durant backup : " + err)
	});

})


// --------- Partie intéraction --------- //


app.get('/', (req, res) => {
	res.sendStatus(404);
});

app.post("/login", (req, res) => {
    const password = req.body.passwd;
    if(password != process.env.MDP) {
		return res.send({result: false});
	};
    const token = jwt.sign({"password": password}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "120d" });
    return res.status(200).send({
		result: true,
		token: token
	});
});

app.get("/getToken", (req, res) => {
    res.json(req.cookies)
});


//Fonction principale pour retourner les jeux
app.get("/gamelist", authenticateToken, RetreiveGameLimiter , (req, res) => {
	const request = req.query.filter;
	let sql = `SELECT * FROM wiigames ORDER BY title;`
	if(request === 'games-owned') {sql = `SELECT * FROM wiigames WHERE owned = 1 ORDER BY title;`}
	else if(request === 'games-not-owned') {sql = `SELECT * FROM wiigames WHERE owned = 0 ORDER BY title;`}
	else if(request === 'wish-list') {sql = `SELECT * FROM wiigames INNER JOIN wish_list ON wiigames.id = wish_list.id;`}
	db.all(sql, (err, data) => {
		if (err) return console.error("Erreur durant récupération jeux", err.message);
		res.status(200).json(data);
	});
})



//Fonction qui permet de savoir combien de jeu nous avons
app.get('/howmanygameowned', authenticateToken, (req, res) => {
	db.get(`SELECT COUNT(*) FROM wiigames WHERE owned = 1`, (err, row) => {
		if (err) return console.error("Erreur lors de la récupération de nombre de jeux possedés", err.message);
		res.status(200).json({count: row['COUNT(*)']});
	});
});



// Fonction qui permet d'ajouter un jeu ou le supprimer
app.get('/ajoutsuppr', authenticateToken, addRemLimit, (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT owned FROM wiigames WHERE id = ?;`, [gameID], (err, row) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête :', err.message);
		} else {
			if (row !== undefined && row.owned === 1) {
				db.run(`UPDATE wiigames SET owned = 0 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during deleting game owned to database: ", err.message);
				});
				res.status(200).json({result: true})
			} else {
				db.run(`UPDATE wiigames SET owned = 1 WHERE id = ?;`, [gameID], (err) => {
					if (err) return console.error("Error during inserting game owned to database: ", err.message);
				});
				db.run(`DELETE FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
					if (err) {console.error('Erreur lors de l\'exécution de la requête :', err.message);}
				})
				res.status(200).json({result: false})
			}
		}
	});
});


app.get('/wishlist', authenticateToken, RetreiveGameLimiter, (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT id FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
		if (err) { console.error('Erreur lors de l\'exécution de la requête :', err.message);}
		else {
			if(row === undefined){
				db.run(`INSERT INTO wish_list (id) VALUES (?);`, [gameID], (err, row) => {
					if (err) {console.error('Erreur lors de l\'exécution de la requête :', err.message);}
				})
			} else {
				db.run(`DELETE FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
					if (err) {console.error('Erreur lors de l\'exécution de la requête :', err.message);}
				})
			}
			res.status(200).json({result: row === undefined})
		}
		
	});
});

app.get('/inwishlist', authenticateToken, (req, res) => {
	const gameID = req.query.gameID; // Récupérer l'ID du jeu depuis la requête
	db.get(`SELECT id FROM wish_list WHERE id = ?;`, [gameID], (err, row) => {
		if (err) { console.error('Erreur lors de l\'exécution de la requête :', err.message);}
		else {
			res.status(200).json({result: row === undefined})
		}
	});
});
