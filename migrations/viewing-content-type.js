const dotenv = require("dotenv");
const contentful = require('contentful-management');


if (process.env.ENVIRONMENT !== "production") {
  dotenv.config();
}

module.exports = async function (migration, context) {
    const client = contentful.createClient({
        accessToken: context.accessToken,
    });
    const space = await client.getSpace(context.spaceId);
    const environment = await space.getEnvironment(context.environmentId);

    const viewing = migration.createContentType('viewing', {
        name: 'Viewing',
        description: 'Viewing instance of a Movie',
        displayField: 'title',
    });

    const title = viewing.createField('title', {
        name: 'Title',
        type: 'Symbol',
        required: true,
    });

    const dateStarted = viewing.createField('dateStarted', {
        name: 'Date Started',
        type: 'Date',
        required: true,
    });
    viewing.changeFieldControl('dateStarted', 'builtin', 'datePicker', {
        format: 'dateonly'
    });

    const dateCompleted = viewing.createField('dateCompleted', {
        name: 'Date Completed',
        type: 'Date',
    });
    viewing.changeFieldControl('dateCompleted', 'app', '5NtuMzMFY8yh3ChEKzLHGW');

    const expectedRating = viewing.createField('expectedRating', {
        "name": "Expected Rating",
        "type": "Integer",
        "localized": false,
        "required": true,
        "validations": [
            {
                "range": {
                    "min": 1,
                    "max": 5
                }
            }
        ]
    });
    viewing.changeFieldControl('expectedRating', 'builtin', 'rating', {
        "stars": "5"
    });

    const rating = viewing.createField('rating', {
        "name": "Rating",
        "type": "Integer",
        "localized": false,
        "required": false,
        "validations": [
            {
                "range": {
                    "min": 1,
                    "max": 5
                }
            }
        ]
    });
    viewing.changeFieldControl('rating', 'builtin', 'rating', {
        "stars": "5"
    });

    const notes = viewing.createField('notes', {
        name: 'Notes',
        type: 'RichText',
        validations: [
            {
                "nodes": {}
            },
            {
                "enabledMarks": [
                "bold",
                "italic",
                "underline"
                ],
                "message": "Only bold, italic, and underline marks are allowed"
            },
            {
                "enabledNodeTypes": [],
                "message": "Nodes are not allowed"
            }
        ]
    });

    const didNotFinish = viewing.createField('didNotFinish', {
        name: 'Did Not Finish',
        type: 'Boolean',
    });

    const validationProps = viewing.createField('validation_props', {
        name: 'Validation Properties',
        type: 'Object',
        required: true,
        disabled: true,
        omitted: true,
    });

    const validation = viewing.createField('validation', {
        "name": "Validation",
        "type": "Boolean",
        "localized": false,
        "required": true,
        "omitted": true
    });
    viewing.changeFieldControl('validation', 'app', '1hGNh1kmGm86eoO76FrpZp');

    const movie = migration.editContentType('movie');
    movie.createField('viewings', {
        name: 'Viewings',
        type: 'Array',
        items: {
            "type": "Link",
            "validations": [
                {
                    "linkContentType": [
                         "viewing"
                    ]
                }
            ],
            "linkType": "Entry"
        }
    });


}
