import React from 'react';
import { displayDate, displayDaysWatched } from '../utils/date';
import { documentToPlainTextString  } from '@contentful/rich-text-plain-text-renderer';
import Rate from 'rc-rate'

import 'rc-rate/assets/index.css';

export default ({ movies, className }) => (
    <ul className={`movies mt-4 ${className ? className : ''}`}>
        {movies.map(({ node: movie }, i) => {
            const imdbRating = movie.omdb.Ratings.find((element) => element.Source === 'Internet Movie Database');

            return (
                <li key={i} className={ `clearfix md:flex  ${i > 0 ? 'my-8' : ''}`}>
                    {movie.omdb.Poster &&
                        <div className="flex-none mr-4 float-left md:float-none">
                            <img className="w-32" src={movie.omdb.Poster} alt={`${movie.title} poster`} />
                        </div>
                    }
                    <div className="md:flex flex-col flex-grow">
                        <h3 className="leading-none mb-2 font-normal">
                            <a href={movie.imdb} className="no-underline hover:underline">{movie.omdb.Title}</a>
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
                                {imdbRating &&
                                    <div>
                                        <strong>IMDb:</strong> {imdbRating.Value}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </li>
            )
        })}
    </ul>
)

function ratingColor(rating, expectedRating) {
    if (rating > expectedRating) {
        return 'text-green-600';
    } else if (rating < expectedRating) {
        return 'text-red-600';
    }
}
