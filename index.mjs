import express from 'express';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const rm = require('rick-and-morty-forever');// import fetch from 'node-fetch';


const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

//root route
app.get('/', async (req, res) => {

    let response = await fetch("https://rickandmortyapi.com/api/character");
    let data = await response.json();
    const randomCharacter = data.results[Math.floor(Math.random() * data.results.length)];
    const randomImgUrl = randomCharacter.image;
    console.log(data);
    res.render('home.ejs', {randomImgUrl})
});


app.get('/characters',async (req, res) => {
    const character_name = req.query.characterName;
    const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${character_name}`);
    const data = await response.json();
    if (data.error) {
      return res.status(404).send(`Character "${character_name}" not found`);
    }
    const charInfo = data.results[0];
    const key = charInfo.name.split(' ')[0].toLowerCase();
    const quote = rm(key);

    res.render('characterInfo.ejs', { charInfo, quote });
});

app.get('/episodes', async (req, res) => {
  try {
    const episodeNumber = req.query.episodeNumber;

    if (!episodeNumber) {
      return res.render('episodeInfo.ejs', { episode: null, season: null, characters: [] });
    }

    const epRes = await fetch(`https://rickandmortyapi.com/api/episode/${episodeNumber}`);
    const episode = await epRes.json();

    if (episode.error) {
      return res.status(404).send('Episode not found');
    }

    const season = Number(episode.episode.slice(1, 3));

    const firstFive = (episode.characters || []).slice(0, 5);
    let characters = [];
    if (firstFive.length) {
      const ids = firstFive.map(u => u.split('/').pop()).join(',');
      const chRes = await fetch(`https://rickandmortyapi.com/api/character/${ids}`);
      const chData = await chRes.json();
      characters = Array.isArray(chData) ? chData : [chData];
    }
    res.render('episodeInfo.ejs', { episode, season, characters });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});


app.get('/location',async (req, res) => {
    const count = Math.min(req.query.count || 1, 10);

    let ids = '';
    for (let i = 1; i <= count; i++) {
      ids += i + (i < count ? ',' : '');
    }

    const response = await fetch(`https://rickandmortyapi.com/api/location/${ids}`);
    const data = await response.json();

    const locations = Array.isArray(data) ? data : [data];
    res.render('locationInfo.ejs', { locations });
});

app.listen(3000, () => {
   console.log('server started');
});