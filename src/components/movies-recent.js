import React from 'react';
import { StaticQuery, graphql, Link } from "gatsby";
import MoviesList from './movies-list';

export default () => (
    <StaticQuery
        query={graphql`
            query recentMovies {
                allContentfulMovie(sort: {fields: dateCompleted, order: DESC}, filter: { dateCompleted: { ne: null } }, limit: 5) {
                    edges {
                        node {
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
                                Plot
                                Poster
                                Ratings {
                                    Source
                                    Value
                                }
                                Rated
                            }
                        }
                    }
                }
            }
        `}
        render={({ allContentfulMovie: { edges: movies }}) => {
            return (
                <div className="my-8">
                    <h2>Recently Finished</h2>
                    <MoviesList movies={movies} />
                    <div className="text-center">
                        <Link to="all" className="rounded-lg p-4 bg-green-700 hover:bg-green-800 text-white uppercase no-underline">Full Viewing History</Link>
                    </div>
                </div>
            )
        }}
    />
)
