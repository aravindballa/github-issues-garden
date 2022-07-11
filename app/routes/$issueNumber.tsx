import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { gql } from "@urql/core";
import { marked } from "marked";
import invariant from "tiny-invariant";
import config from "~/config";
import client from "~/graphql.server";
import { getAllPosts } from "~/lib.server";

type LoaderData = {
  title: string;
  bodyHTML: string;
  updatedAt: string;
  timelineItems: { title: string; bodyText: string; number: number }[];
};

const ISSUE_QUERY = gql`
  query IssueDetails($owner: String!, $repo: String!, $issueNumber: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $issueNumber) {
        title
        body
        updatedAt
        timelineItems(first: 50) {
          edges {
            node {
              ... on CrossReferencedEvent {
                referencedAt
                source {
                  ... on Issue {
                    number
                    title
                    bodyText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const loader: LoaderFunction = async ({ params }) => {
  const { issueNumber } = params;
  invariant(issueNumber, "issueNumber is required");

  const allPostsMap = await getAllPosts();
  const { data } = await client
    .query(ISSUE_QUERY, {
      owner: config.repo.split("/")[0],
      repo: config.repo.split("/")[1],
      issueNumber: parseInt(issueNumber),
    })
    .toPromise();

  let {
    title,
    body,
    updatedAt,
    timelineItems: issueTimelineItems,
  } = data.repository.issue;

  body = body.replace(/#([0-9]+)/, (match: string, issueNumber: string) => {
    const post = allPostsMap?.[parseInt(issueNumber)];
    if (post) {
      return `[${post.title}](/${post.number})`;
    }
    return match;
  });

  const timelineItems =
    issueTimelineItems?.edges
      .filter(({ node }: { node: any }) => "source" in node)
      .map(({ node }: { node: any }) => {
        return {
          number: node.source.number,
          title: node.source.title,
          bodyText: node.source.bodyText.replace(
            /#([0-9]+)/,
            (match: string, number: string) => {
              const post = allPostsMap?.[parseInt(number)];
              if (post) {
                return `<span class="${
                  number === issueNumber ? "highlight" : ""
                }">${post.title}</span>`;
              }
              return match;
            }
          ),
        };
      }) || [];

  return json<LoaderData>({
    title,
    bodyHTML: marked(body),
    updatedAt,
    timelineItems,
  });
};

export default function Post() {
  const { title, bodyHTML, timelineItems } = useLoaderData() as LoaderData;
  return (
    <article>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: bodyHTML }}></div>
      {timelineItems.length > 0 && (
        <div className="referred-in">
          <hr />
          <h2>Referred in</h2>
          {timelineItems.map((item) => (
            <div key={item.number}>
              <Link to={`/${item.number}`}>
                <h3>{item.title}</h3>
              </Link>
              <p dangerouslySetInnerHTML={{ __html: item.bodyText }} />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
