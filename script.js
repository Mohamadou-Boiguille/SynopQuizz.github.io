let test = 0;
let trying;
let fondEcran;
let movieList = (movie = page = trailer = "");
// have to change const name to upper case
const noRepeat = ["tab"];
const history = [];
const answer = document.querySelector("#answer");
const synopsis = document.querySelector("#synopsis");
const form = document.querySelector("#form");
const bouton = document.querySelector("#bouton");
const imageDiv = document.querySelector("#imageHolder");
const trailerDiv = document.querySelector("#trailerDiv");
const placeholder = document.querySelector(".placeholder").attributes
  .dataplaceholder;
const historyDiv = document.querySelector("#historyDiv");
document.body.addEventListener("load", (event) => console.log(event.target));
// -----------------------

bouton.addEventListener("click", start);

function start() {
  while (synopsis.firstChild) {
    synopsis.removeChild(synopsis.firstChild);
  }
  synopsis.innerHTML = imageDiv.innerHTML = trailerDiv.innerHTML = "";
  placeholder.value = movieList = movie = page = trailer = chosenMovie = "";
  trying = 4;
  bouton.value = "Film suivant";
  randomize();
  document.querySelector(".answer").style.display = "inline";
  document.querySelector("#solutionDiv").style.display = "none";
  answer.focus();
  answer.value = "";
}

function randomize() {
  movie = Math.floor(Math.random() * 19);
  page = Math.floor(Math.random() * 50 + 1);
  getMovies();
}

const getMovies = async function () {
  let response = await fetch(
    `
https://api.themoviedb.org/3/movie/top_rated?api_key=6237246c3e030da8bda37ce27d3d28fb&language=fr-FR&region=FR&page=${page}`
  );
  let data = await response.json();
  movieList = data;
  checkToStart();
};

function checkToStart() {
  chosenMovie = movieList.results[movie];
  historyDiv.classList.replace("historyColumn", "historyRow");
  if (chosenMovie.overview == "") {
    console.log(`falsy no OV - reloading`);
    //randomize();
  } else if (noRepeat.indexOf(chosenMovie.id) !== -1) {
    console.log(`falsy already exist ${chosenMovie.title.substring(0, 15)}`);
    //randomize();
  } else if (chosenMovie.title.length > 40) {
    console.log(`falsy title too long ${chosenMovie.title.length}`);
    //randomize();
  } else if (chosenMovie.release_date.substring(0,4) < 1980) {
    console.log(`falsy too old ${chosenMovie.release_date}`);
    } else if (chosenMovie.popularity < 20) {
      console.log(`falsy not popular enough`);
    } else {
      noRepeat.push(chosenMovie.id);
      console.log(`truthy ${movie} ${page} start`);
      synopsis.innerHTML = `${chosenMovie.overview} <br><br>`;
      hint();
      trailerList();
      return;
    }
  randomize();
};

const trailerList = async function () {
  let response = await fetch(
    `https://api.themoviedb.org/3/movie/${chosenMovie.id}/videos?api_key=6237246c3e030da8bda37ce27d3d28fb&language=fr-FR`
  );
  let data = await response.json();
  let trailerArr = data.results;
  for (var i = 0; i < trailerArr.length; i++) {
    if (trailerArr[i].site.toLowerCase() == "youtube") {
      trailer = trailerArr[i].key;
      return;
    }
  }
};

function hint(onOff, x) {
  let hint = "";
  for (let i = 0; i < chosenMovie.title.length; i++) {
    if (!/[a-zA-Z]/.test(chosenMovie.title[i])) {
      hint += chosenMovie.title[i];
    } else if (onOff == 1 && i % x == 0) {
      hint += chosenMovie.title[i];
    } else {
      hint += "_";
    }
  }
  placeholder.value = hint;
  let pluriel = "s";
  if (trying == 1) {
    pluriel = "";
  }
  document.querySelector(
    "#trying"
  ).innerHTML = `<span class="gameFont">Il vous reste ${trying} tentative${pluriel}</span>`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  verify();
});

function verify() {
  trying--;
  if (caseFix(answer.value) == caseFix(chosenMovie.title)) {
    solution("btn btn-success", "Bravo, vous avez trouvé !");
    console.log("win");
  } else if (trying === 0) {
    solution("btn btn-danger", "Perdu ! Vous deviez trouver :");
    console.log("loose");
  } else if (trying <= 2 || trying >= 0) {
    hint(1, trying * 2);
  }
  answer.value = "";
  answer.focus();
}

function caseFix(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\u0300-\u036f]/gi, "")
    .toLowerCase();
}

function solution(winOrLoose, wolMessage) {
  document.querySelector(".answer").style.display = "none";
  imageDiv.innerHTML = `<a href="https://www.themoviedb.org/movie/${chosenMovie.id}" target="_blank">
    <img src="https://image.tmdb.org/t/p/w500${chosenMovie.poster_path}" alt="jaquette"><a>`;
  synopsis.innerHTML = `<h4>${wolMessage}</h4><h2>${chosenMovie.title}</h2><p>Note TMDB : ${chosenMovie.vote_average}</p>`;
  trailerLink = `<iframe
  width="330"
  height="200"
  src="https://www.youtube.com/embed/${trailer}"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>`;
  let lastMovie = {};
  lastMovie.poster = `https://image.tmdb.org/t/p/w500${chosenMovie.poster_path}`;
  lastMovie.title = chosenMovie.title;
  lastMovie.link = "https://www.themoviedb.org/movie/" + chosenMovie.id;
  history.push(lastMovie);

  if (trailer !== "") {
    trailerDiv.innerHTML = trailerLink;
  }

  document.querySelector("#solutionDiv").style.display = "";
  document.querySelector(
    "#historyDiv"
  ).innerHTML += `<button type="button" class="${winOrLoose}"><a href="https://www.themoviedb.org/movie/${chosenMovie.id}"} target="_blank">${chosenMovie.title}</a></button>`;
  fader();
  historyDiv.classList.replace("historyRow", "historyColumn");
}

function delay(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

async function fader() {
  for (let i = 46; i < 100; i++) {
    await delay(2);
    document.querySelector("#fadedBg").style.background = `linear-gradient(
    to right bottom,
    hsl(0, 0%, 100%) 20%,
    rgba(255, 255, 255, ${i / 100}))`;
    console.log("fade");
  }

  document.body.style.backgroundImage = `url("https://image.tmdb.org/t/p/original/${chosenMovie.backdrop_path}")`;
  await delay(400);

  for (let i = 99; i > 45; i--) {
    await delay(7);
    document.querySelector("#fadedBg").style.background = `linear-gradient(
    to right bottom,
    hsl(0, 0%, 100%) 20%,
    rgba(255, 255, 255, ${i / 100}))`;
    console.log("unfade");
  }
}

function theEnd() {

}