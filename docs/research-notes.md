# Research Notes

Last checked: 2026-05-11

## Existing Options

| Project / Option | Fit | Limitation |
| --- | --- | --- |
| [bigzhubak/KM-IT](https://github.com/bigzhubak/KM-IT) | Directly related: old Kunming IT company list. | Single README, no license, no structured data, no source freshness field, no browsing/search UI. |
| [madawei2699/xian-IT](https://github.com/madawei2699/xian-IT) | Good reference for city-level IT discovery. | Focused on Xi'an rather than Kunming. |
| China IT blacklist / company review repos | Useful for risk discovery. | Different purpose: dispute/review oriented, not a neutral company directory. |
| Job boards and company-profile sites | Good for finding candidates. | Data is fragmented, often duplicated, and can drift quickly. |

## Decision

值得自己做，但范围要小：

1. Do not rebuild a review platform.
2. Build a neutral public directory with structured source-backed data.
3. Make contribution and validation easy enough that local developers can keep it alive.

The first release should be a GitHub-friendly static project: JSON dataset, README, issue templates, validation script, and GitHub Pages UI.
