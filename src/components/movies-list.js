import React from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import { displayDate, displayDaysWatched } from '../utils/date';
import { documentToPlainTextString  } from '@contentful/rich-text-plain-text-renderer';
import Rate from 'rc-rate'

import 'rc-rate/assets/index.css';

const MoviesList = ({ movies, className }) => (
    <>
        <ul className={`movies mt-4 ${className}`}>
            {movies.map(({ node: movie }, i) => {
                return (
                    <li key={movie.title} className={ `clearfix md:flex  ${i > 0 ? 'my-8' : ''}`}>
                        {movie.omdb.Poster &&
                            <div className="flex-none mr-4 float-left md:float-none">
                                <a href={movie.imdb} data-tip={i} data-for="movieTooltip"><img className="w-32" src={movie.omdb.Poster} alt={`${movie.title} poster`} /></a>
                            </div>
                        }
                        <div className="md:flex flex-col flex-grow">
                            <h3 className="leading-none mb-2 font-normal">
                                <a href={movie.imdb} className="no-underline hover:underline" data-tip={i} data-for="movieTooltip">{movie.omdb.Title}</a>
                            </h3>
                            <p>{movie.omdb.Plot}</p>
                            {movie.notes &&
                                <div className="my-4"><strong>Thoughts:</strong> {documentToPlainTextString(movie.notes.json)}</div>
                            }
                            <div className="mt-auto flex flex-row flex-wrap justify-between">
                                <div>
                                    <strong>Finished:</strong> {displayDate(movie.dateCompleted)}, <em>{displayDaysWatched(movie.dateStarted, movie.dateCompleted)}</em>
                                </div>
                                <div className="flex flex-col">
                                    <div>
                                        <Rate value={movie.rating} disabled={true} style={{'pointerEvents': 'none'}}/>
                                        <span className={ratingColor(movie.rating, movie.expectedRating)}>({movie.expectedRating})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
        <ReactTooltip className="tooltip" id="movieTooltip" effect="solid" type="info" getContent={dataTip => {
            if (!dataTip) return;
            const movie = movies[dataTip].node;
            return (
                <div className="max-w-lg flex flex-wrap md:flex-no-wrap space-x-4">
                    <div className="w-full">
                        <h2 className="text-lg">{movie.title} ({movie.omdb.Year})</h2>
                        <p className="mb-2">
                            {movie.omdb.Rated}, {movie.omdb.Runtime}, {movie.omdb.Language}, {movie.omdb.Country}
                        </p>
                        <div><strong>Director(s):</strong> {movie.omdb.Director}</div>
                        <div><strong>Writer(s):</strong> {movie.omdb.Writer}</div>
                        <div><strong>Actors:</strong> {movie.omdb.Actors}</div>
                        <div><strong>Genre(s):</strong> {movie.omdb.Genre}</div>
                    </div>
                    {movie.omdb.Ratings.length > 0 &&
                        <div className="md:w-64 max-w-lg min-w-lg">
                            <div className="p-3 border border-solid rounded">
                                <h3 className="text-base mb-2">Is it good?</h3>
                                <ul>
                                    {movie.omdb.Ratings.map(rating => {
                                        let source;
                                        switch (rating.Source.toLowerCase()) {
                                            case 'internet movie database':
                                                source = 'IMDb';
                                                break;
                                            case 'rotten tomatoes':
                                                source = 'RT';
                                                break;
                                            default:
                                                source = rating.Source
                                        }
                                        return (
                                            <li key={rating.Source}><strong>{source}:</strong> {rating.Value}</li>
                                        )
                                    })}
                                    {movie.omdb.Awards && <li><strong>Awards:</strong> {movie.omdb.Awards}</li>}
                                </ul>
                            </div>
                        </div>
                    }
                </div>
            )
        }} />
    </>
)

MoviesList.propTypes = {
    movies: PropTypes.array.isRequired,
    className: PropTypes.string
}

MoviesList.defaultProps = {
    className: ''
}

export default MoviesList;

function ratingColor(rating, expectedRating) {
    if (rating > expectedRating) {
        return 'text-green-600';
    } else if (rating < expectedRating) {
        return 'text-red-600';
    }
}
