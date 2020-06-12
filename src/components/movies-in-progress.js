import React from 'react';
import { StaticQuery, graphql } from "gatsby";
import { BsInfoCircleFill } from 'react-icons/bs';
import MovieTooltip from './movies-tooltip';
import { displayDate } from '../utils/date';

const MoviesUnfinished = () => (
    <StaticQuery
        query={graphql`
            query inProgress {
                allContentfulMovie(sort: {fields: dateStarted, order: ASC}, filter: {dateCompleted: {eq: null}, didNotFinish: {ne: true}}) {
                    edges {
                        node {
                            id
                            title
                            dateStarted
                            ...MovieDetails
                        }
                    }
                }
            }
        `}
        render={({ allContentfulMovie: { edges: movies } }) => {
            if (movies.length === 0) {
                return;
            }
            const tooltipId = 'progressTooltip';

            return (
                <>
                    <h2 className="ms-xl">In Progress</h2>
                    <ul className="my-4">
                        {movies.map(({ node: movie }, i) => {
                            return (
                                <li key={movie.id} className={ `relative ${i > 0 ? 'mt-6' : ''}`}>
                                    <h3 className="leading-none ms-lg">
                                        {movie.omdb.Title}
                                    </h3>
                                    {movie.omdb.Poster && <img className="sidebar:w-full my-3" src={movie.omdb.Poster} alt={`${movie.omdb.Title} poster`} />}
                                    <div>
                                        <p>Started: {displayDate(movie.dateStarted)}</p>
                                        <button id={`tooltip-recent-${i}`} className="absolute top-0 right-0" data-tip={i} data-for={tooltipId} title="More Info" aria-controls={tooltipId}>
                                            <BsInfoCircleFill className="h-6 w-6 text-blue-500 hover:text-blue-800" />
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>

                    <MovieTooltip movies={movies} id={tooltipId} />
                </>
            )
        }}
    />
)

export default MoviesUnfinished;
