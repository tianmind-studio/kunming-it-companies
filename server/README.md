# Lead Intake API

This directory contains the small same-origin API behind `https://kunming.tianmind.com/api/leads`.

It exists only to collect pending public-source leads from the domestic static site. Submissions are not published automatically and must be reviewed before any public dataset changes.

Default production paths:

```text
/opt/kunming-tech-radar/api/lead_api.py
/opt/kunming-tech-radar/leads/leads.jsonl
```

Default systemd service:

```text
kunming-leads-api.service
```

Health check:

```bash
curl -sS https://kunming.tianmind.com/api/health
```

Review pending leads:

```bash
ssh tianmind-104 "tail -n 20 /opt/kunming-tech-radar/leads/leads.jsonl"
```

Do not copy private contact notes or unverified claims from the JSONL file into public data.
