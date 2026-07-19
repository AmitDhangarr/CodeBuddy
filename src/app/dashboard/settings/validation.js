/**
 * Add this to lib/validation.js, next to validateGithubUrl, and export it.
 *
 * validateGithubUrl (existing) expects a REPO url: github.com/user/repo
 * validateGithubProfileUrl (new)  expects a PROFILE url: github.com/user
 *
 * They're different because a profile link must NOT have a repo path after
 * the username — that's the bug: reusing validateGithubUrl for the
 * integrations tab was rejecting valid profile-only links, or accepting
 * repo links it shouldn't (depending on how strict the repo regex is).
 */
export function validateGithubProfileUrl(url, { required = false } = {}) {
  const trimmed = (url || "").trim();

  if (!trimmed) {
    return required ? "GitHub profile URL is required." : "";
  }

  // https://github.com/username  (optional trailing slash, no repo path)
  const match = trimmed.match(
    /^https?:\/\/(www\.)?github\.com\/([a-zA-Z\d](?:[a-zA-Z\d-]{0,38}))\/?$/i
  );

  if (!match) {
    return "Enter a valid GitHub profile URL, e.g. https://github.com/yourusername (not a repo link).";
  }

  // GitHub usernames can't start/end with a hyphen or have consecutive hyphens.
  const username = match[2];
  if (/^-|-$|--/.test(username)) {
    return "That doesn't look like a valid GitHub username.";
  }

  return "";
}