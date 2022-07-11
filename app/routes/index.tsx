import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { gql } from "@urql/core";
import { marked } from "marked";

import config from "~/config";
import client from "~/graphql.server";
import { getAllPosts } from "~/lib.server";

type LoaderData = {
  bodyHTML: string;
  updatedAt: string;
};

const QUERY = gql`
  query Homepage($issueQuery: String!) {
    search(first: 1, type: ISSUE, query: $issueQuery) {
      issueCount
      edges {
        node {
          ... on Issue {
            id
            title
            body
            updatedAt
          }
        }
      }
    }
  }
`;

export const loader: LoaderFunction = async () => {
  const allPostsMap = await getAllPosts();
  const { data } = await client
    .query(QUERY, {
      issueQuery: `repo:${config.repo} label:homepage label:post`,
    })
    .toPromise();

  let { body, updatedAt } = data.search.edges[0].node;

  body = body.replace(/#([0-9]+)/, (match: string, issueNumber: string) => {
    const post = allPostsMap?.[parseInt(issueNumber)];
    if (post) {
      return `[${post.title}](/${post.number})`;
    }
    return match;
  });

  return json({ bodyHTML: marked(body), updatedAt } as LoaderData);
};

export default function Index() {
  const { bodyHTML } = useLoaderData() as LoaderData;
  return (
    <article>
      <h1>{config.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: bodyHTML }}></div>
    </article>
  );
}
