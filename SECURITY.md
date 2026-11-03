# Security

Aftercode is an AI coding app that can read and modify project files and run commands with the permissions available to the account running its agent server.

## Security model

- The agent permission prompts are safeguards for the user; they are not an operating-system sandbox.
- Run the agent server only on networks you trust. Require authentication before allowing connections from other devices, and use HTTPS for traffic across untrusted networks.
- Prompts and selected project content are sent to the model provider configured in the app. Review that provider's data handling terms.
- External tools, plugins, and model providers are outside Aftercode's security boundary.

## Report a vulnerability

Please report security issues privately through [GitHub Security Advisories](https://github.com/xreamm1/aftercode/security/advisories/new). Include the affected version, impact, and reproduction steps. Do not publish exploit details before a fix is available, and do not include API keys or other secrets in the report.

The Aftercode maintainers will acknowledge the report and coordinate next steps through the advisory.
