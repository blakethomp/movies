import React from "react"
import { graphql } from "gatsby";
import Layout from '../components/layout';
import MoviesList from "../components/movies-list";

const HomePage = ({data: { site, allMovies: { edges: allMovies }, pageContext}}) => {
    return (
        <Layout title="All Movies">
            <MoviesList movies={allMovies} />
        </Layout>
    )
}

export default HomePage;

export const pageQuery = graphql`
    query allMoviesQuery {
        site {
            siteMetadata {
                title
            }
        }
       allMovies: allContentfulMovie(sort: {fields: dateCompleted, order: DESC}, filter: { dateCompleted: { ne: null } }) {
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
`
