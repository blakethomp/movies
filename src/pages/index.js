import React from "react"
import { graphql } from "gatsby";
import Layout from '../components/layout';
import ViewingsRecent from '../components/viewing-recent';
import ViewingsOverview from '../components/viewing-overview';

const HomePage = ({ data: { allViewings: { edges: allViewings } }, path }) => {
    return (
        <Layout path={path}>
            <ViewingsOverview viewings={allViewings} showLink={true} />
            <ViewingsRecent />
        </Layout>
    )
}

export default HomePage;

export const pageQuery = graphql`
    query HomeQuery {
        allViewings: allContentfulViewing(sort: { fields: dateCompleted, order: DESC }) {
            edges {
                node {
                    dateStarted
                    dateCompleted
                    rating
                    expectedRating
                    didNotFinish
                    movie {
                        genre {
                            name
                        }
                    }
                }
            }
        }
    }
`
