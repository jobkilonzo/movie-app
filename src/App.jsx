import { use, useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite'

const BASE_API_URL = "https://api.themoviedb.org/3"

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () =>  {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState([])

  useDebounce(()=> setDebounceSearchTerm(searchTerm), 1000, [searchTerm])
  const fetchMovies = async (query='') => {
    setIsLoading(true)
    setErrorMessage('')
    try{
      const endpoint = query ? `${BASE_API_URL}/search/movie?query=${encodeURIComponent(query)}`
      : 
      `${BASE_API_URL}/discover/movie?sort_by=popular.desc`

      const response = await fetch(endpoint, API_OPTIONS)
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }
      const data = await response.json()
      if(data.response === 'False'){
        setErrorMessage(data.Error || 'Failed to fetch movies')
        setMovieList([])
        return
      }
      setMovieList(data.results || [])
      if(query && data.results.length>0){
        await updateSearchCount(query, data.results[0])
      }
    }catch(error){
      console.log(`Error fetching movies: ${error}`)
      setErrorMessage("Error fetching movies. Please try again later.")
    }finally{
      setIsLoading(false)
    }
  }
  const loadTrendingMovies = async() =>{
    try{
      const movies = await getTrendingMovies()
      setTrendingMovies(movies)
    }catch(error){
      console.error("Errorfetching trending movies")
    }
  }
  useEffect(()=>{
    fetchMovies(debounceSearchTerm)

  }, [debounceSearchTerm])
  useEffect(()=>{
    loadTrendingMovies()
  }, [])
  return (
    <main>
      <div className='pattern'>
        <div className='wrapper'>
          <header>
            <img src='./hero.png' alt='Hero Banner'/>
            <h1>Find <span className='text-gradient'>Movies</span> Your'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          </header>
          {trendingMovies.length > 0 && (
            <section  className='trending'>
              <h2>
                Trending movies
              </h2>
              <ul>
                {trendingMovies.map((movie, index)=> (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className='all-movies'>
            <h2>All movies</h2>

            {isLoading ? (<Spinner/>) : errorMessage? (<P className="text-red-500">{errorMessage}</P>):(
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
            )}
          </section>
          <h1 className='text-white'>{searchTerm}</h1>
        </div>
      </div>
    </main>
  )
}

export default App
