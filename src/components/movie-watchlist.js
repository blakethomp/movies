import React from 'react';
import { graphql, StaticQuery } from 'gatsby';

const Watchlist = () => {
    return (
        <StaticQuery
            query={graphql`
                query watchlist {
                    allWatchlist(sort: {fields: added, order: DESC}) {
                        edges {
                            node {
                                title
                                year
                                url
                                genre
                                director
                                rating
                            }
                        }
                    }
                }
            `}
            render={({ allWatchlist: { edges: movies } }) => {
                if (movies.length === 0) {
                    return;
                }

                return (
                    <>
                        <h2 className="text-2xl">Watchlist</h2>
                        <ul className="mt-4">
                            {movies.map(({ node: movie }, i) => {
                                return (
                                    <li key={i} className={ `${i > 0 ? 'mt-2' : ''}`}>
                                        <h3 className="text-sm leading-tight"><a href={movie.url} className="no-underline hover:underline">{movie.title} ({movie.year})</a></h3>
                                        <div className="text-xs italic">{movie.genre}</div>
                                        <div className="text-xs"><strong>Rating: </strong>{movie.rating ? `${movie.rating}/10` : 'n/a'}</div>
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                )
            }}
        />
    )
}

export default Watchlist;
