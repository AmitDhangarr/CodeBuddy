export const LIMITS = {
  MESSAGE_MAX: 2000,
  BIO_MAX: 160,
  NAME_MIN: 2,
  PASSWORD_MIN: 8,
};

export function validateEmail(email) {
  if (!email?.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Enter a valid email address.";
  }
  return "";
}

export function validateLoginPassword(password) {
  if (!password) return "Password is required.";
  return "";
}

export function validatePassword(password, { required = false } = {}) {
  if (!password) return required ? "Password is required." : "";
  if (password.length < LIMITS.PASSWORD_MIN) {
    return `Password must be at least ${LIMITS.PASSWORD_MIN} characters.`;
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  return "";
}

export function validatePasswordConfirm(password, confirm) {
  if (password !== confirm) return "Passwords don't match.";
  return "";
}

export function validateName(name) {
  if (!name?.trim()) return "Full name is required.";
  if (name.trim().length < LIMITS.NAME_MIN) {
    return `Name must be at least ${LIMITS.NAME_MIN} characters.`;
  }
  return "";
}

export function validateHandle(handle) {
  if (!handle?.trim()) return "Username is required.";
  const clean = handle.replace(/^@/, "").trim();
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) {
    return "Username must be 3–20 characters: letters, numbers, underscores only.";
  }
  return "";
}

export function validateBio(bio) {
  if (bio && bio.length > LIMITS.BIO_MAX) {
    return `Bio must be ${LIMITS.BIO_MAX} characters or fewer.`;
  }
  return "";
}

export function validatePincode(pincode) {
  if (!pincode?.trim()) return "";
  if (!/^\d{6}$/.test(pincode.trim())) return "PIN code must be exactly 6 digits.";
  return "";
}

export function validateGithubUrl(url, { required = false } = {}) {
  if (!url?.trim()) return required ? "GitHub URL is required." : "";
  const pattern =
    /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
  if (!pattern.test(url.trim())) {
    return "Enter a valid GitHub repo URL (e.g. github.com/user/repo).";
  }
  return "";
}

export function validatePlatformUrl(val, domains) {
  if (!val?.trim()) return "Please enter a URL.";
  let parsed;
  try {
    parsed = new URL(val.trim());
  } catch {
    return "Enter a valid URL starting with https://";
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return "URL must start with https://";
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (!domains.includes(host)) {
    return `URL must be from ${domains.join(" or ")}.`;
  }
  return "";
}

export function validateMessage(content) {
  const trimmed = content?.trim() ?? "";
  if (!trimmed) return "Message cannot be empty.";
  if (trimmed.length > LIMITS.MESSAGE_MAX) {
    return `Message must be ${LIMITS.MESSAGE_MAX} characters or fewer.`;
  }
  return "";
}

export function validateSignupForm({ email, password, confirm, termsAccepted }) {
  const errors = {};
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  const passErr = validatePassword(password, { required: true });
  if (passErr) errors.password = passErr;
  const confirmErr = validatePasswordConfirm(password, confirm);
  if (confirmErr) errors.confirm = confirmErr;
  if (!termsAccepted) {
    errors.terms = "You must accept the Terms and Privacy Policy.";
  }
  return errors;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  const passErr = validateLoginPassword(password);
  if (passErr) errors.password = passErr;
  return errors;
}

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