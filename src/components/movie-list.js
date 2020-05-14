import React from 'react';
import { StaticQuery, graphql } from "gatsby";
import Img from 'gatsby-image'

export default () => (
    <StaticQuery
        query={graphql`
            query allMovies {
                allContentfulMovie(sort: {fields: dateCompleted, order: DESC}, limit: 5) {
                    edges {
                        node {
                            title
                            dateCompleted
                            poster {
                                fixed(width: 157, height: 250, resizingBehavior: SCALE) {
                                    ...GatsbyContentfulFixed_tracedSVG
                                }
                                description
                            }
                            imdb
                            omdb {
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
        render={({ allContentfulMovie: { edges } }) => (
            <section>
                <h2>Recently Watched</h2>
                <ul className="movies">
                    {edges.map(({ node }, i) => {
                        return (
                            <li key={ i } className={ `flex  ${i > 0 ? 'mt-6' : ''}`}>
                                { node.poster && <Img className="flex-none w-32 mr-4" fixed={ node.poster.fixed } alt={ node.poster.description } />}
                                { node.omdb.Poster && <img className="flex-none w-32 mr-4" src={ node.omdb.Poster } alt={ `${ node.title } poster` } />}
                                <div className="flex-grow-0">
                                    <h3><a href={node.imdb} className="no-underline hover:underline">{node.title}</a></h3>
                                    <p>{node.omdb.Plot}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </section>
        )}
    />
)
