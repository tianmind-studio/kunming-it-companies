## Summary

-

## What changed

- [ ] Updated `data/companies.json`
- [ ] Updated CSV source files such as `data/source-leads.csv`, `data/events.csv`, `data/communities.csv`, or `data/gov-projects.csv`
- [ ] Updated static site files (`index.html`, `styles.css`, `script.js`, `submit.html`, `submit.js`)
- [ ] Updated public docs, issue templates, CI, or validation scripts
- [ ] Ran `npm run generate:companies`
- [ ] Ran `npm run export:csv`
- [ ] Ran `npm run generate:data-quality`
- [ ] Ran `npm run data:diff` when company data changed
- [ ] Ran `npm run validate`
- [ ] Ran `npm run build:site`

## Data checklist

- [ ] Each new or changed company has at least one public source URL.
- [ ] Each new or changed company keeps `source_url`, `source_type`, `verification_status`, `last_checked`, and `confidence_score`.
- [ ] Recruiting-platform entries are public company pages or source seeds; I did not convert a search page into `internship` / `hiring`.
- [ ] Community and event entries are public pages; I did not add private group QR codes or private contacts.
- [ ] I did not add private phone numbers, private WeChat IDs, private chat screenshots, or unverifiable negative claims.
- [ ] I did not invent internship, hiring, salary, layoff, or cooperation information.
- [ ] Descriptions are neutral and source-backed.
- [ ] Existing valid data was not deleted without explanation.

## Privacy and public-source boundary

- [ ] This PR does not publish private contact details, screenshots, customer/private material, tokens, cookies, contracts, or payment records.
- [ ] If this PR removes or corrects sensitive content, the explanation avoids repeating the sensitive content.
- [ ] Any opportunity wording is phrased as a search hint, not as a confirmed job, outsourcing need, or partnership.

## Sources

Paste source links here:

-

## Notes

-
