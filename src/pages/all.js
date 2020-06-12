import React from "react"
import { graphql } from "gatsby";
import Layout from '../components/layout';
import MoviesList from "../components/movies-list";

const HomePage = ({data: { allMovies: { edges: allMovies } }, path }) => {
    return (
        <Layout title="All Movies" path={path}>
            <MoviesList movies={allMovies} />
        </Layout>
    )
}

export default HomePage;

export const pageQuery = graphql`
    query allMoviesQuery {
       allMovies: allContentfulMovie(sort: { fields: dateCompleted, order: DESC }, filter: { dateCompleted: { ne: null } }) {
            edges {
                node {
                    ...MovieListDetails
                }
            }
        }
    }
`
