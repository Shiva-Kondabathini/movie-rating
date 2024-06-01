import { children, useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>Movie Rating App</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
/*function WatchedBox() {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMovieList watched={watched} />
        </>
      )}
    </div>
  );
}*/
function MovieList({ movies, handelSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handelSelectMovie={handelSelectMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handelSelectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => handelSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>
        {movie.Title}:{movie.Type}
      </h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, handelDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imbID}
          handelDeleteMovie={() => handelDeleteMovie(movie.imdbID)}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, handelDeleteMovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <button className="btn-delete" onClick={handelDeleteMovie}>
        X
      </button>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Loader() {
  return <p className="loader">Loading...</p>;
}

const KEY = "91044428";
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);

  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  //const tempQuery = "Interstellar";
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [watched, setWatched] = useState(function () {
    const storedWatched = localStorage.getItem("watched");
    return storedWatched ? JSON.parse(storedWatched) : [];
  });

  function handelAddWatched(newWatechedMovie) {
    setWatched([...watched, newWatechedMovie]);
  }
  function handelSelectMovie(id) {
    setSelectedMovie(id === selectedMovie ? null : id);
  }
  function handelCloseMovie() {
    setSelectedMovie(null);
  }
  function handelDeleteMovie(id) {
    setWatched(watched.filter((watched) => watched.imdbID !== id));
  }
  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovieData() {
        setIsloading(true);
        setError("");
        try {
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("api error");
          }
          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("movie not found");
          }
          setMovies(data.Search);
        } catch (error) {
          error.name === "AbortError" ? setError("") : setError(error.message);
        } finally {
          setIsloading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      handelCloseMovie();
      fetchMovieData();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isloading ? <Loader /> : <MovieList movies={movies} />} */}
          {isloading && <Loader />}
          {!isloading && !error && (
            <MovieList movies={movies} handelSelectMovie={handelSelectMovie} />
          )}
          {error && <ErrorMsg errMsg={error} />}
        </Box>
        <Box>
          {selectedMovie ? (
            <MovieDetails
              selectedMovie={selectedMovie}
              handelCloseMovie={handelCloseMovie}
              handelAddWatched={handelAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />

              <WatchedMovieList
                watched={watched}
                handelDeleteMovie={handelDeleteMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function MovieDetails({
  selectedMovie,
  handelCloseMovie,
  handelAddWatched,
  watched,
}) {
  const [movie, SetMovie] = useState({});
  const [isloading, setIsloading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const isWatched = watched
    .map((movie) => movie.imdbID)
    .includes(selectedMovie);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedMovie
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Gener: gener,
  } = movie;

  function onAddWatched() {
    const newWatechedMovie = {
      imdbID: selectedMovie,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    handelAddWatched(newWatechedMovie);
    handelCloseMovie();
  }
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsloading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovie}`
        );
        const data = await res.json();
        SetMovie(data);
        setIsloading(false);
      }
      getMovieDetails();
    },
    [selectedMovie]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = title;
      return function () {
        document.title = " Use Popcorn";
      };
    },

    [title]
  );
  return (
    <div className="details">
      {isloading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handelCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{gener}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched ? (
                <p>You rated this movie with {watchedUserRating} ⭐</p>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    color="red"
                    size="24"
                    onSetRating={setUserRating}
                  />
                  {userRating && <p>This movie was rated {userRating} stars</p>}
                  {userRating && (
                    <button className="btn-add" onClick={onAddWatched}>
                      + Add to list
                    </button>
                  )}
                </>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Staring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function ErrorMsg({ errMsg }) {
  return <p className="error">{errMsg}</p>;
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
