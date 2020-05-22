import React from 'react';
import { StaticQuery, graphql } from "gatsby";
import { displayDate } from '../utils/date';

export default () => (
    <StaticQuery
        query={graphql`
            query inProgress {
                allContentfulMovie(sort: {fields: dateStarted, order: ASC}, filter: {dateCompleted: {eq: null}}) {
                    edges {
                        node {
                            title
                            dateStarted
                            imdb
                            omdb {
                                Title
                                Poster
                                Rated
                            }
                        }
                    }
                }
            }
        `}
        render={({ allContentfulMovie: { edges: movies } }) => {
            return (
                <>
                    <h2 className="text-2xl">In Progress</h2>
                    <ul className="mt-4">
                        {movies.map(({ node: movie }, i) => {
                            return (
                                <li key={ i } className={ `${i > 0 ? 'mt-6' : ''}`}>
                                    <h3 className="leading-none text-xl">
                                        <a href={movie.imdb} className="no-underline hover:underline">{movie.omdb.Title}</a>
                                    </h3>
                                    { movie.omdb.Poster && <img className="w-full my-3" src={ movie.omdb.Poster } alt={ `${ movie.omdb.Title } poster` } />}
                                    <div className="flex-grow-0">
                                        <p>Started: {displayDate(movie.dateStarted)}</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )
        }}
    />
)