# wii-collection-management
This projects is for my mother who is collectionning all the Wii Games from Europe<br/>
**This project is only in French, all translations are up to you.**

# How this work

This project work with NodeJS and Javascript.<br/>
I use a Full Wii Game list database from <a href="https://www.gametdb.com">GameTDB</a> to maintain the list.<br/>

This website use a database where I put all wii games from Europe who includes English and French language, there is about 1268 games in it.<br/>

The website does not work for more than one person because the purpose of this project is to be accessible only to my mother.<br/>
If you want to use it in your own, just download the source code in ZIP file and modify things on your own.<br/>

# How to use it for your own

- Install [NodeJS](https://nodejs.org/fr) (In case you haven't yet)
- Create a directory, open it, right click and click on "Open in Terminal" **OR** copy the path of your directory, open your terminal and type `cd {path_of_your_directory}`
- Type `git clone https://github.com/LOUDO56/fanny-wii-collections.git` **OR** download it as ZIP file by cliking on `<> Code` and `Download ZIP`

  
  ![image](https://github.com/LOUDO56/fanny-wii-collections/assets/117168736/454327ad-c0b4-420f-9f43-a13606a9d75e)
  
- Type `npm install package.json` in your terminal
- type `node index.js` to launch the server
- Edit `index.html`, remove line 19 and 20
- Edit `script.js`, go to line 43, and change the server link to `http://localhost:4000`
- Open `index.html` file
- Kaboom! Fully interactive wii games list :)


# LICENSE

This project is under [MIT License](https://github.com/LOUDO56/fanny-wii-collections/blob/main/LICENSE)

# Special Thanks

A huge thanks for the amazing work of <a href="https://www.gametdb.com">GameTDB</a> which allows me to have a complete list of wii games <3 

