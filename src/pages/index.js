import React from "react"
import { graphql } from "gatsby";
import Layout from '../components/layout';
import MoviesRecent from '../components/movies-recent';
import MoviesInProgress from '../components/movies-in-progress';
import MoviesOverview from '../components/movies-overview';

const HomePage = ({data: { site, allMovies: { edges: allMovies }, pageContext}}) => {
    return (
        <Layout title={site.siteMetadata.title}>
            <div className="flex flex-wrap md:flex-no-wrap">
                <div className="w-full max-w-screen-md md:pr-8">
                    <MoviesOverview movies={allMovies} showLink={true} />
                    <MoviesRecent />
                </div>
                <div className="w-full md:w-40 mt-4 md:mt-0 ml-auto md:flex-none">
                    <MoviesInProgress />
                </div>
            </div>
        </Layout>
    )
}

export default HomePage;

export const pageQuery = graphql`
    query HomeQuery {
        site {
            siteMetadata {
                title
            }
        }
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
