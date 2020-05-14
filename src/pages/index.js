import React from "react"
import { graphql } from "gatsby";
import Layout from '../components/layout';
import MovieList from '../components/movie-list';

const HomePage = ({data}) => (
    <Layout title={data.site.siteMetadata.title}>
        <MovieList />
    </Layout>
)

export default HomePage;

export const pageQuery = graphql`
    query HomeQuery {
        site {
            siteMetadata {
                title
            }
        }
    }
`
