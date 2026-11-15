# Sources: "The Number That Keeps Breaking Computers" (long-02-int-max)

Checked 15 Nov 2026. Arithmetic verified in Python (see bottom).

| Claim in the script | Source |
|---|---|
| YouTube's Dec 2014 post: never expected views above a 32-bit integer (2,147,483,647); "…but that was before we met PSY"; upgraded to 64-bit | TIME, https://time.com/3619615/gangnam-style-youtube-2/ · GMA News (full post text), https://gmanetwork.com/news/hashtag/content/390946/gangnam-style-breaks-youtube-views-counter/story |
| Days later YouTube told Variety it was "an easter egg" and the counter had moved to 64-bit "months ago" | TIME update (same URL) · GeekWire, https://www.geekwire.com/2014/psys-gangnam-style-defies-math-breaks-youtubes-counter/ |
| View count 2,152,814,218 that week (end value of the on-screen counter) | GMA News (above) |
| Boeing 787: counter in the generator control units "will overflow after 248 days of continuous power", GCUs go to failsafe, possible loss of all AC power; found in laboratory testing; interim fix = periodic power deactivation; later new GCU software | FAA AD 2015-09-07, https://www.federalregister.gov/documents/2015/05/01/2015-10066/airworthiness-directives-the-boeing-company-airplanes · superseding AD 2018-20-15, https://www.govinfo.gov/content/pkg/FR-2018-10-16/html/2018-22152.htm |
| The FAA did not publish the counter's width or tick rate; 2^31 hundredths of a second = 248.55 days is the widely noted inference | The Register, https://www.theregister.com/2015/05/01/787_software_bug_can_shut_down_planes_generators · own arithmetic |
| Deep Impact: last contact 8 Aug 2013, contact lost between 11 and 14 Aug, declared lost 19/20 Sept 2013 | Mission status (U. Maryland), https://epoxi.astro.umd.edu/1mission/status.shtml |
| NASA: exact cause not known; "a potential problem with computer time tagging" that could have led to loss of orientation control, affecting antennas and solar arrays | NASA/JPL, https://www.jpl.nasa.gov/news/nasas-deep-space-comet-hunter-mission-comes-to-an-end |
| 2^32 tenths of a second after 1 Jan 2000 = 11 Aug 2013 00:38:49.6; reboot loop (suspected, per mission scientist via National Geographic) | tz mailing list thread quoting NatGeo, https://lists.iana.org/hyperkitty/list/tz@iana.org/thread/NI7O3HXGFIUJCEZOA7VY2OK5Z5HXAKFR/ · own arithmetic |
| Berkshire Hathaway Class A above $421,000 in May 2021; Nasdaq feeds store prices in 32 bits with four decimals, max $429,496.7295; Nasdaq suspended the price on some feeds until an upgrade | WSJ via Daring Fireball, https://daringfireball.net/linked/2021/05/05/berkshire-32-bit-ints · The Register, https://www.theregister.com/2021/05/07/bug_warren_buffett_rollover/ |
| Year 2038: signed 32-bit Unix time ends 03:14:07 UTC on 19 Jan 2038, wraps to 13 Dec 1901 20:45:52 | own arithmetic (standard result) |
| 64-bit seconds last about 292 billion years | own arithmetic: 2^63 s / 31,557,600 s per year = 292.3 billion |

Not real data (illustrative animation only): the share-price curve, the per-unit tick counters on the jet, the number of control units drawn.

```
2**31 / 100 / 86400                      = 248.551 days
2000-01-01 + 2**32 / 10 s                = 2013-08-11 00:38:49.6
1970-01-01 + (2**31 - 1) s               = 2038-01-19 03:14:07
1970-01-01 - 2**31 s                     = 1901-12-13 20:45:52
1,794,700,800 (15 Nov 2026) / 2,147,483,647 = 83.6 %
```
