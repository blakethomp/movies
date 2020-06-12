import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import { displayDate, displayDaysWatched } from '../utils/date';
import { documentToPlainTextString  } from '@contentful/rich-text-plain-text-renderer';
import { BsInfoCircleFill } from 'react-icons/bs';
import Rate from 'rc-rate'
import MovieTooltip from './movies-tooltip';

import 'rc-rate/assets/index.css';

const MoviesList = ({ movies, className }) => {
    const tooltipId = 'movielistTooltip';

    return (
        <>
            <ul className={`movies mt-4 ${className}`}>
                {movies.map(({ node: movie }, i) => {
                    return (
                        <li key={movie.id} className={ `clearfix relative md:flex  ${i > 0 ? 'my-8' : ''}`}>
                            {movie.omdb.Poster &&
                                <div className="flex-none mr-4 float-left md:float-none">
                                    <img className="w-24 md:w-32" src={movie.omdb.Poster} alt={`${movie.title} poster`} />
                                </div>
                            }
                            <div className="md:flex flex-col flex-grow">
                                <h3 className="leading-none mb-2 font-normal">
                                    {movie.omdb.Title}
                                </h3>
                                <button id={`tooltip-recent-${i}`} className="absolute top-0 right-0" data-tip={i} data-for={tooltipId} title="More Info" aria-controls={tooltipId}>
                                    <BsInfoCircleFill className="h-6 w-6 text-blue-500 hover:text-blue-800" />
                                </button>
                                <p>{movie.omdb.Plot}</p>
                                {movie.notes &&
                                    <div className="mt-4"><strong>Thoughts:</strong> {documentToPlainTextString(movie.notes.json)}</div>
                                }
                                <div className="clear-left mt-auto flex flex-row flex-wrap justify-between">
                                    <div className="mt-4">
                                        <strong>Finished:</strong> {displayDate(movie.dateCompleted)}, <em>{displayDaysWatched(movie.dateStarted, movie.dateCompleted)}</em>
                                    </div>
                                    <div className="flex flex-col mt-4 self-end">
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

            <MovieTooltip movies={movies} id={tooltipId} />
        </>
    )
}

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

export const movieDetails = graphql`
  fragment MovieDetails on ContentfulMovie {
    imdb
    omdb {
        Title
        Year
        Plot
        Poster
        Genre
        Ratings {
            Source
            Value
        }
        Rated
        Director
        Writer
        Actors
        Country
        Language
        Awards
        Runtime
    }
  }

  fragment MovieListDetails on ContentfulMovie {
    id
    title
    dateStarted
    dateCompleted
    rating
    expectedRating
    notes {
        json
    }
    ...MovieDetails
  }
`
