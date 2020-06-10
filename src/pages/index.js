import React from "react"
import { graphql } from "gatsby";
import Layout from '../components/layout';
import MoviesRecent from '../components/movies-recent';
import MoviesOverview from '../components/movies-overview';

const HomePage = ({ data: { allMovies: { edges: allMovies } }, path }) => {
    return (
        <Layout path={path}>
            <MoviesOverview movies={allMovies} showLink={true} />
            <MoviesRecent />
        </Layout>
    )
}

export default HomePage;

export const pageQuery = graphql`
    query HomeQuery {
        allMovies: allContentfulMovie(sort: { fields: dateCompleted, order: DESC }) {
            edges {
                node {
                    dateStarted
                    dateCompleted
                    rating
                    expectedRating
                    genre {
                        name
                    }
                    didNotFinish
                }
            }
        }
    }
`
