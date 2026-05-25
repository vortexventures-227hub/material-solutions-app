# Forklift Sales Machine Platform Connection Feasibility

This document captures the practical connection status for the 47-platform scope
from `/Users/vortexventures/Desktop/Vortex Ventures/VVAxeOps/audits/platform_registry_47_deep_audit.md`.

## Bottom Line

- All 47 registry platforms are connectable as Forklift Sales Machine destinations.
- They are not all safely connectable as fully automatic public posting targets.
- "Connected" can mean one of four modes:
  - `automatic`: owned database/API write path can publish or sync without manual submit.
  - `api_or_feed`: official API/feed exists, but credentials, OAuth, policy review, product-category approval, or account approval are required.
  - `partner_or_portal`: platform relationship, dealer portal, vendor contact, or paid listing workflow is required.
  - `guarded_manual`: Forklift Sales Machine can generate drafts, receipts, checklists, and tracking, but a human must review/submit.

## Current Production Scope

The live Publish Button currently exposes 11 guarded channels:

1. `materialsolutionsnj`
2. `craigslist`
3. `facebook_marketplace`
4. `machinerytrader`
5. `equipfinder`
6. `machineryats`
7. `ebay`
8. `linkedin`
9. `google_business_profile`
10. `forkliftaction_forum`
11. `youtube`

Only `materialsolutionsnj` is automatic today. The other 10 are guarded
manual/local-draft channels with `mutationPerformed:false`, `submitDisabled:true`,
and Chris-approval guardrails.

## 47-Platform Feasibility Matrix

| Platform | Connectable | Best mode | Notes |
|---|---:|---|---|
| `website` | Yes | `automatic` | Owned storefront/database path. |
| `facebook_marketplace` | Yes | `guarded_manual` | Public Marketplace posting does not have a reliable open posting API path; use guarded drafts unless Chris approves a specific account/path. |
| `facebook_page` | Yes | `api_or_feed` | Meta Page posting is feasible after app/page approval and Page access. |
| `ebay` | Yes | `api_or_feed` | eBay Sell Inventory API path; needs seller OAuth, policies, category/item specifics. |
| `youtube` | Yes | `api_or_feed` | YouTube Data API upload path; needs channel approval, OAuth scope, quota, video asset, audit/privacy handling. |
| `linkedin` | Yes | `api_or_feed` | Company Page posting path; needs page admin, organization URN, Community/Marketing API access. |
| `google_business` | Yes | `api_or_feed` | Google Business Profile Local Posts; needs owner/manager access, account/location IDs, OAuth. |
| `instagram` | Yes | `api_or_feed` | Instagram content publishing; needs business/creator account and Meta permissions. |
| `craigslist` | Yes | `partner_or_portal` | Bulk posting exists for approved use; otherwise guarded manual/human-submit only. |
| `machinerytrader` | Yes | `partner_or_portal` | Sandhills/dealer portal/feed relationship required. |
| `equipfinder` | Yes | `partner_or_portal` | Vendor/contact/listing path must be confirmed. |
| `machineryats` | Yes | `partner_or_portal` | Current domain/portal/listing method must be confirmed. |
| `forkliftaction` | Yes | `partner_or_portal` | Member/business listing/forum/advertising path; rules review required. |
| `ironplanet` | Yes | `partner_or_portal` | Auction/seller relationship workflow. |
| `machinery_pete` | Yes | `partner_or_portal` | Dealer/manual listing relationship. |
| `equipment_trader` | Yes | `partner_or_portal` | Dealer/feed/manual workflow; likely overlaps with other trader channels. |
| `truckpaper` | Yes | `partner_or_portal` | Sandhills/truck listing relationship; should be consolidated unless Chris has account. |
| `commercial_truck_trader` | Yes | `partner_or_portal` | Trader workflow; should be consolidated with Equipment Trader/TruckPaper unless approved. |
| `bigiron_auctions` | Yes | `partner_or_portal` | Auction consignment/partner path. |
| `offerup` | Yes | `guarded_manual` | Mobile-first/manual marketplace path; do not assume public posting API. |
| `nextdoor` | Yes | `guarded_manual` | Business/local posting path; human review recommended. |
| `google_shopping` | Yes | `api_or_feed` | Merchant Center product feed/API path; needs product eligibility and merchant setup. |
| `bing_shopping` | Yes | `api_or_feed` | Merchant/feed export; lower priority and likely second export format. |
| `thomasnet` | Yes | `partner_or_portal` | Supplier profile/listing workflow. |
| `industrynet` | Yes | `partner_or_portal` | Directory listing workflow; low priority. |
| `global_industrial` | Maybe | `partner_or_portal` | Supplier/vendor relationship rather than normal open listing marketplace. |
| `mascus` | Yes | `partner_or_portal` | Dealer/account/feed/manual workflow. |
| `machinesales` | Yes | `partner_or_portal` | Dealer/manual listing workflow. |
| `bidspotter` | Yes | `partner_or_portal` | Auctioneer/seller workflow. |
| `eliftruck` | Yes | `partner_or_portal` | Dealer portal/manual/pastebot path; high-intent forklift audience. |
| `reddit_forklifts` | Yes | `guarded_manual` | Reddit API exists, but subreddit rules, account standing, and commercial-post review are mandatory. |
| `reddit_flipping` | Yes | `guarded_manual` | Technically possible, but likely weak commercial fit. |
| `x_twitter` | Yes | `api_or_feed` | X API post path; needs approved app/token and rate-limit handling. |
| `pinterest` | Yes | `api_or_feed` | Pinterest Pins API path; needs business/token/board setup. |
| `tiktok` | Yes | `api_or_feed` | Content Posting API path; requires explicit user consent, video/photo asset, and audit/visibility handling. |
| `medium_article` | Yes | `api_or_feed` | Medium integration token/manual article workflow. |
| `blog_syndication` | Yes | `automatic` | Owned CMS/database write once blog target is selected. |
| `google_ads_feed` | Yes | `api_or_feed` | Google Ads/Merchant feed integration; needs account/developer token. |
| `yelp_business` | Limited | `partner_or_portal` | Business profile/CTA updates are feasible; inventory marketplace posting is not the right model. |
| `bbb_listing` | Limited | `partner_or_portal` | Business profile/manual listing, not inventory posting. |
| `yellowpages` | Limited | `partner_or_portal` | Directory profile/manual listing, not inventory posting. |
| `industry_newsletters` | Yes | `partner_or_portal` | Submission/contact workflow. |
| `email_blast` | Yes | `api_or_feed` | SendGrid/CRM workflow; requires opted-in contacts and compliance guardrails. |
| `sms_alerts` | Yes | `api_or_feed` | Twilio/SMS workflow; requires consent and opt-out handling. |
| `pr_newswire` | Yes | `partner_or_portal` | Paid distribution/API or portal. |
| `amazon_business` | Maybe | `api_or_feed` | SP-API exists, but category/product eligibility may block heavy equipment listings. |
| `alibaba` | Maybe | `partner_or_portal` | Seller/open-platform/vendor path; category/account approval required. |

## Implementation Rule

Do not promote a platform from `guarded_manual`, `partner_or_portal`, or
`api_or_feed` to live automatic posting until these are true:

1. Chris approves the exact platform/account/target.
2. Required credentials/OAuth/API/vendor access are available.
3. A dry-run or draft receipt passes with `mutationPerformed:false`.
4. A live publish action is explicitly approved for that platform.
5. The resulting listing URL/status is captured in Forklift Sales Machine tracking.

## Recommended Sequencing

1. Keep `materialsolutionsnj` as the canonical green automatic path.
2. Convert one external channel at a time from guarded draft to real integration.
3. Prioritize `ebay`, `linkedin`, `google_business`, `youtube`, `craigslist`,
   and `email_blast` because they have clearer official API/feed/manual paths.
4. Keep dealer/portal channels behind explicit account approval.
5. Treat social/community channels as guarded syndication, not mass auto-posting.
