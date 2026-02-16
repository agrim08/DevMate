import { Octokit } from "octokit";
import { encrypt, decrypt } from "../utils/encryption.js";

/**
 * Encrypts the GitHub access token.
 * @param {string} token
 * @returns {string} Encrypted token string (iv:content)
 */
export const encryptToken = (token) => {
  return encrypt(token);
};

/**
 * Decrypts the GitHub access token.
 * @param {string} encryptedToken
 * @returns {string} Decrypted token
 */
export const decryptToken = (encryptedToken) => {
  return decrypt(encryptedToken);
};

/**
 * Fetches GitHub user profile, repos, and contribution calendar.
 * @param {string} accessToken
 * @returns {Promise<Object>} Formatted GitHub data for User model
 */
export const fetchGitHubData = async (accessToken) => {
  const octokit = new Octokit({ auth: accessToken });

  // 1. Fetch User Profile & Repos (Rest API)
  const { data: userProfile } = await octokit.rest.users.getAuthenticated();
  const username = userProfile.login;

  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 50,
    visibility: "public",
  });

  // 2. Aggregate Stars & Languages
  let totalStars = 0;
  const languageMap = new Map();

  for (const repo of repos) {
    totalStars += repo.stargazers_count;
    if (repo.language) {
      languageMap.set(
        repo.language,
        (languageMap.get(repo.language) || 0) + 1
      );
    }
  }

  // Convert Map to Object for simple returning if needed, but Mongoose takes Map.
  // Actually, Mongoose Map type expects an object or Map.

  // 3. Fetch Contribution Calendar (GraphQL)
  const query = `
    query($userName:String!) {
      user(login: $userName){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const graphqlResponse = await octokit.graphql(query, {
    userName: username,
  });

  const calendarData = graphqlResponse.user.contributionsCollection.contributionCalendar;
  
  // Flatten weeks -> days
  const flattenedContributions = [];
  calendarData.weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
        // Only storing date and count to save space
      flattenedContributions.push({
        date: day.date,
        count: day.contributionCount,
      });
    });
  });

  // Sort languages by usage count
  const sortedLanguages = [...languageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10 languages
    .map(entry => entry[0]);

  return {
    username: userProfile.login,
    totalRepos: userProfile.public_repos,
    totalStars,
    languages: languageMap, // Mongoose will handle this if schema is Map
    topLanguages: sortedLanguages, // Add skills derived from languages
    contributionCalendar: flattenedContributions,
    lastSyncedAt: new Date(),
  };
};
