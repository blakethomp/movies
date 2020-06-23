import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import { displayDate, displayDaysWatched } from '../utils/date';
import { documentToPlainTextString  } from '@contentful/rich-text-plain-text-renderer';
import { BsInfoCircleFill } from 'react-icons/bs';
import Rate from 'rc-rate'
import MovieTooltip from './movie-tooltip';

import 'rc-rate/assets/index.css';

const ViewingList = ({ viewings, className }) => {
    const tooltipId = 'viewinglistTooltip';

    return (
        <>
            <ul className={`movies mt-4 ${className}`}>
                {viewings.map(({ node: viewing, node: { movie: [ movie ] } }, i) => {
                    const omdbPoster = movie.omdb.Poster && movie.omdb.Poster !== 'N/A';
                    const omdbPlot = movie.omdb.Plot && movie.omdb.Plot !== 'N/A';

                    return (
                        <li key={viewing.id} className={ `clearfix relative md:flex  ${i > 0 ? 'my-8' : ''}`}>
                            {omdbPoster &&
                                <div className="flex-none mr-4 float-left md:float-none">
                                    <img className="w-24 md:w-32" src={movie.omdb.Poster} alt={`${movie.title} poster`} />
                                </div>
                            }
                            {!omdbPoster && movie.poster &&
                                <div className="flex-none mr-4 float-left md:float-none">
                                    <Img className="w-24 md:w-32" fluid={movie.poster.fluid} alt={`${movie.title} poster`} />
                                </div>
                            }
                            <div className="md:flex flex-col flex-grow">
                                <h3 className="leading-none mb-2 font-normal">
                                    {movie.title}
                                </h3>
                                <button id={`tooltip-recent-${i}`} className="absolute top-0 right-0" data-tip={i} data-for={tooltipId} title="More Info" aria-controls={tooltipId}>
                                    <BsInfoCircleFill className="h-6 w-6 text-blue-500 hover:text-blue-800" />
                                </button>
                                <p>{omdbPlot ? movie.omdb.Plot : movie.description.description}</p>
                                {viewing.notes &&
                                    <div className="mt-4"><strong>Thoughts:</strong> {documentToPlainTextString(viewing.notes.json)}</div>
                                }
                                <div className="clear-left mt-auto flex flex-row flex-wrap justify-between">
                                    <div className="mt-4">
                                        <strong>Finished:</strong> {displayDate(viewing.dateCompleted)}, <em>{displayDaysWatched(viewing.dateStarted, viewing.dateCompleted)}</em>
                                    </div>
                                    <div className="flex flex-col mt-4 self-end">
                                        <div>
                                            <Rate value={viewing.rating} disabled={true} style={{'pointerEvents': 'none'}}/>
                                            <span className={ratingColor(viewing.rating, viewing.expectedRating)}>({viewing.expectedRating})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>

            <MovieTooltip viewings={viewings} id={tooltipId} />
        </>
    )
}

ViewingList.propTypes = {
    viewings: PropTypes.array.isRequired,
    className: PropTypes.string
}

ViewingList.defaultProps = {
    className: ''
}

export default ViewingList;

function ratingColor(rating, expectedRating) {
    if (rating > expectedRating) {
        return 'text-green-600';
    } else if (rating < expectedRating) {
        return 'text-red-600';
    }
}

export const movieDetails = graphql`
    fragment MovieDetails on ContentfulViewing {
        movie {
            title
            description {
                description
            }
            poster {
                fluid(maxWidth: 300) {
                    ...GatsbyContentfulFluid
                }
            }
            imdb
            genre {
                name
            }
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
    }

    fragment MovieListDetails on ContentfulViewing {
        id
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
