import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { gql } from "@urql/core";
import config from "~/config";
import client from "~/graphql.server";

const QUERY = gql`
  query Homepage($issueQuery: String!) {
    search(first: 1, type: ISSUE, query: $issueQuery) {
      issueCount
      edges {
        node {
          ... on Issue {
            id
            title
            bodyHTML
            updatedAt
          }
        }
      }
    }
  }
`;

export const loader: LoaderFunction = async () => {
  const { data, error, operation } = await client
    .query(QUERY, { issueQuery: `repo:${config.repo} label:homepage` })
    .toPromise();

  const { bodyHTML, updatedAt } = data.search.edges[0].node;

  return json({ data: { bodyHTML, updatedAt } });
};

export default function Index() {
  const { data } = useLoaderData();
  return (
    <div className="content-wrap">
      <article>
        <h1>{config.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: data.bodyHTML }}></div>
      </article>
    </div>
  );
}
