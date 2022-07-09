/*
query { 
  search(first: 100, type: ISSUE, query: "repo:aravindballa/public-garden") {
  	issueCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    edges {
      node {
        ... on Issue {
          id
          title,
          # bodyText,
          author {
            login
          }
          updatedAt
          timelineItems(first:50) {
            edges {
              node {
                ... on CrossReferencedEvent {
                  referencedAt
                  source {
                    ... on Issue {
                      id
                      title
                      # bodyText
                      resourcePath
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

*/

export default function Note() {
  return <p>hi</p>;
}
