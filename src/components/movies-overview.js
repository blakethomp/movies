import React from 'react';
import { StaticQuery, graphql } from "gatsby";
import { daysWatched } from '../utils/date';

export default () => (
    <StaticQuery
        query={graphql`
            query allMovies {
                allContentfulMovie(filter: { dateCompleted: { ne: null } }) {
                    edges {
                        node {
                            title
                            dateStarted
                            dateCompleted
                            rating
                            expectedRating
                        }
                    }
                }
            }
        `}
        render={({ allContentfulMovie: { edges: movies }}) => {
            return (
                <>
                    <div><strong>Watched this year:</strong> {movies.length}</div>
                    <div><strong>Average rating:</strong> {averageRating(movies)}</div>
                    <div><strong>Average days to finish:</strong> {averageDays(movies)}</div>

                </>
            )
        }}
    />
)

function averageRating(movies) {
    const total = movies.reduce((total, next) => {
        return total + next.node.rating;
    }, 0);
    const average = total / movies.length;
    return average.toFixed(2);
}

function averageDays(movies) {
    const total = movies.reduce((total, next) => {
        return total + daysWatched(next.node.dateStarted, next.node.dateCompleted);
    }, 0);
    const average = total / movies.length;
    return average.toFixed(0);
}
