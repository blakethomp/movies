import React, { useRef } from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import { displayDate, displayDaysWatched } from '../utils/date';
import { documentToPlainTextString  } from '@contentful/rich-text-plain-text-renderer';
import Rate from 'rc-rate'

import 'rc-rate/assets/index.css';

const MoviesList = ({ movies, className }) => {
    const tooltipRef = useRef(null);

    return (
        <>
            <ul className={`movies mt-4 ${className}`}>
                {movies.map(({ node: movie }, i) => {
                    return (
                        <li key={movie.id} className={ `clearfix md:flex  ${i > 0 ? 'my-8' : ''}`}>
                            {movie.omdb.Poster &&
                                <div className="flex-none mr-4 float-left md:float-none">
                                    <button id={`tooltip-recent-${i}`} data-tip={i} data-for="movieTooltip">
                                        <img className="w-24 md:w-32" src={movie.omdb.Poster} alt={`${movie.title} poster`} />
                                    </button>
                                </div>
                            }
                            <div className="md:flex flex-col flex-grow">
                                <h3 className="leading-none mb-2 font-normal">
                                    <button className="no-underline hover:underline" onClick={
                                        (event) => {
                                            document.querySelector(`#tooltip-recent-${i}`).click();
                                            event.stopPropagation();
                                        }
                                    }>
                                        {movie.omdb.Title}
                                    </button>
                                </h3>
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

            <ReactTooltip
                className="tooltip"
                event="click"
                globalEventOff="click"
                clickable={true}
                place="right"
                id="movieTooltip"
                effect="solid"
                type="info"
                ref={tooltipRef}
                getContent={dataTip => {
                    if (!dataTip) return;
                    const movie = movies[dataTip].node;

                    return (
                        <div className="flex flex-col sidebar:block w-full py-1">
                            <button className="inline-block absolute top-0 right-0 p-2 mr-2" title="Close" onClick={() => tooltipRef.current.setState({show: false})}>X</button>
                            {movie.omdb.Ratings.length > 0 &&
                                <div className="md:w-64 mt-4 sidebar:mt-8 sidebar:float-right sidebar:ml-3 sidebar:mb-1 order-1">
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
                            <div className="order-0">
                                <h2 className="text-lg">{movie.title} ({movie.omdb.Year})</h2>
                                <p className="mb-2">
                                    {movie.omdb.Rated}, {movie.omdb.Runtime}, {movie.omdb.Language}, {movie.omdb.Country}
                                </p>
                                <div className="leading-5">
                                    <strong>Director(s):</strong> {movie.omdb.Director}<br/>
                                    <strong>Writer(s):</strong> {movie.omdb.Writer}<br/>
                                    <strong>Actors:</strong> {movie.omdb.Actors}<br/>
                                    <strong>Genre(s):</strong> {movie.omdb.Genre}<br/>
                                </div>
                            </div>
                            <div className="w-full text-right order-2 clear-right"><a className="text-white inline-block pt-4" href={movie.imdb}>View on IMDb</a></div>
                        </div>
                    )
                }}
            />
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
    id
    title
    dateStarted
    dateCompleted
    rating
    expectedRating
    notes {
        json
    }
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
`
