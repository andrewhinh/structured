#!/usr/bin/env ts-node

// docs-scraper/scripts/crawl.ts

import axios from "axios";
import cheerio from "cheerio";
import { URL } from "url";
import fs from "fs";
import path from "path";

export async function getWebpageHtml(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch the URL");
    }
  } catch (error) {
    throw error;
  }
}

export function getLinksFromHtml(
  htmlContent: string,
  rootUrl: string,
): Set<string> {
  const forwardLinks: Set<string> = new Set();
  const $ = cheerio.load(htmlContent);

  $("a[href]").each((index, element) => {
    const href = $(element).attr("href")!;
    const fullUrl = new URL(href, rootUrl).toString();
    forwardLinks.add(fullUrl);
  });

  return forwardLinks;
}

export async function crawl(
  url: string,
  depth: number = 1,
  visitedUrls: Set<string> = new Set(),
  withOperation: (url: string, htmlContent: string, forwardLinks: Set<string> | string[]) => Promise<void> = async () => {}
): Promise<Set<string>> {
  if (depth < 1 || visitedUrls.has(url)) return visitedUrls;

  // console.log(`Crawling: ${url}`);
  visitedUrls.add(url);

  try {
    const htmlContent = await getWebpageHtml(url);
    const links = getLinksFromHtml(htmlContent, url);
    const forwardLinks = new Set([...links].filter(x => !visitedUrls.has(x)));

    await withOperation(url, htmlContent, forwardLinks);

    const promises: Promise<Set<string>>[] = [];
    for (const forwardLink of forwardLinks) {
      promises.push(crawl(forwardLink, depth - 1, visitedUrls, withOperation));
    }

    const nestedResults = await Promise.all(promises);
    for (const resultSet of nestedResults) {
      for (const nestedUrl of resultSet) {
        visitedUrls.add(nestedUrl);
      }
    }
  } catch (error: any) {
    console.error("ERROR crawling:", error.message);
  }

  return visitedUrls;
}

export async function crawlFromFile(
  rootUrl: string,
  filePath: string,
  depth: number = 1,
  visitedUrls: Set<string> = new Set(),
  withOperation: (url: string, htmlContent: string, forwardLinks: Set<string> | string[]) => Promise<void> = async () => {}
): Promise<Set<string>> {
  try {
    const htmlContent = fs.readFileSync(filePath, "utf-8");
    const links = getLinksFromHtml(htmlContent, rootUrl);
    const forwardLinks = new Set([...links].filter(x => !visitedUrls.has(x)));

    const promises: Promise<Set<string>>[] = [];
    for (const forwardLink of forwardLinks) {
      promises.push(crawl(forwardLink, depth, visitedUrls, withOperation));
    }

    const results = await Promise.all(promises);
    for (const resultSet of results) {
      for (const nestedUrl of resultSet) {
        visitedUrls.add(nestedUrl);
      }
    }
  } catch (error: any) {
    console.error("ERROR crawling:", error.message);
  }

  return visitedUrls;
}

// Create data directory if it doesn't exist
const dataDirectory = path.join(__dirname, "..", "data");
// const scrapedPagesDirectory = path.join(__dirname, "..", "data", "scraped-pages");
const scrapedPagesDirectory = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory);
}
if (!fs.existsSync(scrapedPagesDirectory)) {
  fs.mkdirSync(scrapedPagesDirectory);
}

const folderNameFromUrl = (url: string) => url
  .replace(/https?:\/\//, "")
  .replace(/[^a-zA-Z0-9]/g, "_");

const jsonFileNameFromUrl = (url: string) => url
  .replace(/https?:\/\//, "")
  .replace(/[^a-zA-Z0-9]/g, "_")
  .concat(".json");


// Helper function to create a data sub-directory if it doesn't exist
export function createDataDirectory(subpath: string) {
  const dirpath = path.join(scrapedPagesDirectory, subpath);
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath);
  }
}

// Helper function to write results to a file
export const writeResultsToFile = async (url: string, htmlContent: string, forwardLinks: Set<string> | string[]) => {
  // Extract domain the given URL
  const domain = new URL(url).hostname;
  createDataDirectory(domain);

  const dirpath = path.join(scrapedPagesDirectory, domain);

  // Convert the URL into a filename-friendly string
  // Create the full path for the output file
  const outputPath = path.join(dirpath, jsonFileNameFromUrl(url));

  const htmlText = cheerio.load(htmlContent)("html").text().trim();
  const htmlArticleHtml = cheerio.load(htmlContent)("article").html()?.trim();
  const htmlArticleText = cheerio.load(htmlContent)("article").text().trim();

  // Output the results to a file
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ url, htmlContent, htmlText, htmlArticleHtml, htmlArticleText, forwardLinks }, null, 4),
  );
  console.log(`File created: ${outputPath}`);
};

// (async () => {
//   try {
//     const filePath = path.join(dataDirectory, "ufuncs-math-section.html");
//     const forwardLinks = new Set<string>();
//     getForwardLinks(
//       fs.readFileSync(filePath, "utf-8"),
//       new Set(),
//       "https://numpy.org/",
//     ).forEach((link) => {
//       forwardLinks.add(link);
//     });
//     console.debug(forwardLinks);
//     crawlFromFile("https://numpy.org/", filePath, 2, new Set(), async (url: string, htmlContent: string, /*forwardLinks: string[]*/) => {
//       // console.debug(url);
//       if (url.includes("https://numpy.org/doc/stable/reference/generated/")) {
//         forwardLinks.add(url);
//       }
//       // await writeResultsToFile(url, htmlContent, forwardLinks);
//     });
//   } catch (error: any) {
//     console.error(error);
//   }
// })();

// // List of URLs to be crawled
// const urls = [
//   // "https://python.readthedocs.io/en/latest/genindex-all.html",
//   "https://numpy.org/doc/stable/reference/index.html",
//   // Add more URLs as needed
// ];

const urls = [
  'https://numpy.org/doc/stable/reference/generated/numpy.add.html#numpy.add',
  'https://numpy.org/doc/stable/reference/generated/numpy.subtract.html#numpy.subtract',
  'https://numpy.org/doc/stable/reference/generated/numpy.multiply.html#numpy.multiply',
  'https://numpy.org/doc/stable/reference/generated/numpy.matmul.html#numpy.matmul',
  'https://numpy.org/doc/stable/reference/generated/numpy.divide.html#numpy.divide',
  'https://numpy.org/doc/stable/reference/generated/numpy.logaddexp.html#numpy.logaddexp',
  'https://numpy.org/doc/stable/reference/generated/numpy.logaddexp2.html#numpy.logaddexp2',
  'https://numpy.org/doc/stable/reference/generated/numpy.true_divide.html#numpy.true_divide',
  'https://numpy.org/doc/stable/reference/generated/numpy.floor_divide.html#numpy.floor_divide',
  'https://numpy.org/doc/stable/reference/generated/numpy.negative.html#numpy.negative',
  'https://numpy.org/doc/stable/reference/generated/numpy.positive.html#numpy.positive',
  'https://numpy.org/doc/stable/reference/generated/numpy.power.html#numpy.power',
  'https://numpy.org/doc/stable/reference/generated/numpy.float_power.html#numpy.float_power',
  'https://numpy.org/doc/stable/reference/generated/numpy.remainder.html#numpy.remainder',
  'https://numpy.org/doc/stable/reference/generated/numpy.mod.html#numpy.mod',
  'https://numpy.org/doc/stable/reference/generated/numpy.fmod.html#numpy.fmod',
  'https://numpy.org/doc/stable/reference/generated/numpy.divmod.html#numpy.divmod',
  'https://numpy.org/doc/stable/reference/generated/numpy.absolute.html#numpy.absolute',
  'https://numpy.org/doc/stable/reference/generated/numpy.fabs.html#numpy.fabs',
  'https://numpy.org/doc/stable/reference/generated/numpy.rint.html#numpy.rint',
  'https://numpy.org/doc/stable/reference/generated/numpy.sign.html#numpy.sign',
  'https://numpy.org/doc/stable/reference/generated/numpy.heaviside.html#numpy.heaviside',
  'https://numpy.org/doc/stable/reference/generated/numpy.conj.html#numpy.conj',
  'https://numpy.org/doc/stable/reference/generated/numpy.conjugate.html#numpy.conjugate',
  'https://numpy.org/doc/stable/reference/generated/numpy.exp.html#numpy.exp',
  'https://numpy.org/doc/stable/reference/generated/numpy.exp2.html#numpy.exp2',
  'https://numpy.org/doc/stable/reference/generated/numpy.log.html#numpy.log',
  'https://numpy.org/doc/stable/reference/generated/numpy.log2.html#numpy.log2',
  'https://numpy.org/doc/stable/reference/generated/numpy.log10.html#numpy.log10',
  'https://numpy.org/doc/stable/reference/generated/numpy.expm1.html#numpy.expm1',
  'https://numpy.org/doc/stable/reference/generated/numpy.log1p.html#numpy.log1p',
  'https://numpy.org/doc/stable/reference/generated/numpy.sqrt.html#numpy.sqrt',
  'https://numpy.org/doc/stable/reference/generated/numpy.square.html#numpy.square',
  'https://numpy.org/doc/stable/reference/generated/numpy.cbrt.html#numpy.cbrt',
  'https://numpy.org/doc/stable/reference/generated/numpy.reciprocal.html#numpy.reciprocal',
  'https://numpy.org/doc/stable/reference/generated/numpy.gcd.html#numpy.gcd',
  'https://numpy.org/doc/stable/reference/generated/numpy.lcm.html#numpy.lcm',
];

(async () => {
  try {
    // Iterate over the URLs and call the crawl function for each
    for (const url of urls) {
      try {
        await crawl(url, 1, new Set(), async (url: string, htmlContent: string, forwardLinks: Set<string> | string[]) => {
          await writeResultsToFile(url, htmlContent, forwardLinks);
        });
      } catch (error) {
        console.error(`Failed to crawl: ${url}`, error);
      }
    }
  } catch (error: any) {
    console.error(error);
  }
})();
