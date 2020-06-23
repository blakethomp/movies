import React from "react"
import { graphql } from "gatsby";
import Layout from '../components/layout';
import ViewingList from "../components/viewing-list";

const HomePage = ({data: { allViewings: { edges: allViewings } }, path }) => {
    return (
        <Layout title="All Movies" path={path}>
            <ViewingList viewings={allViewings} />
        </Layout>
    )
}

export default HomePage;

export const pageQuery = graphql`
    query allMoviesQuery {
       allViewings: allContentfulViewing(sort: { fields: dateCompleted, order: DESC }, filter: { dateCompleted: { ne: null } }) {
            edges {
                node {
                    ...MovieListDetails
                }
            }
        }
    }
`
