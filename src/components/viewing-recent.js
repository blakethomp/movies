import React from 'react';
import { StaticQuery, graphql } from "gatsby";
import ViewingsList from './viewing-list';
import CTAButton from './cta-button';

const ViewingsRecent = () => {
    return (
        <StaticQuery
            query={graphql`
                query recentViewings {
                    allContentfulViewing(sort: {fields: dateCompleted, order: DESC}, filter: { dateCompleted: { ne: null } }, limit: 5) {
                        edges {
                            node {
                                ...MovieListDetails
                            }
                        }
                    }
                }
            `}
            render={({ allContentfulViewing: { edges: viewings }}) => {
                return (
                    <div className="my-8">
                        <h2>Recently Finished</h2>
                        <ViewingsList viewings={viewings} />
                        <CTAButton to="all" text="Full Viewing History" />
                    </div>
                )
            }}
        />
    )
}

export default ViewingsRecent;
