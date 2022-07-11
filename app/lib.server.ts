import { gql } from "@urql/core";
import config from "./config";
import client from "./graphql.server";

const ALL_POSTS_QUERY = gql`
  query AllPosts($issueQuery: String!) {
    search(first: 100, type: ISSUE, query: $issueQuery) {
      issueCount
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          ... on Issue {
            number
            title
          }
        }
      }
    }
  }
`;

export const getAllPosts = async () => {
  const { data, error } = await client
    .query(ALL_POSTS_QUERY, {
      issueQuery: `repo:${config.repo} label:post`,
    })
    .toPromise();
  if (error) return null;

  const issuesMap: Record<number, { number: number; title: string }> = {};
  data.search.edges.forEach(({ node }: { node: any }) => {
    issuesMap[node.number] = {
      number: node.number,
      title: node.title,
    };
  });

  return issuesMap;
};
