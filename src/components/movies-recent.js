import React from 'react';
import { StaticQuery, graphql } from "gatsby";
import MoviesList from './movies-list';
import CTAButton from './cta-button';

const MoviesRecent = () => {
    return (
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
                    }
                }
            `}
            render={({ allContentfulMovie: { edges: movies }}) => {
                return (
                    <div className="my-8">
                        <h2>Recently Finished</h2>
                        <MoviesList movies={movies} />
                        <CTAButton to="all" text="Full Viewing History" />
                    </div>
                )
            }}
        />
    )
}

export default MoviesRecent;
