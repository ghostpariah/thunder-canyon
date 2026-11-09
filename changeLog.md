# Changelog

## [1.8.6] - 2026-11-07

### New Features

- Improved calendar navigation across month and year boundaries to better maintain scheduled job visibility.
- Added stronger handling for holiday and day-block rendering in the monthly calendar view.
- Enhanced job scheduling logic so the calendar more accurately reflects the selected date range.

### Bug Fixes

- Fixed a bug where jobs scheduled in December could appear in both the current year and the following year.
- Corrected year matching for calendar preview dates so January preview cells on December calendars no longer show the wrong year’s jobs.
- Resolved inconsistencies in scheduled job counts when dates roll over into the next month or year.
- Fixed issue where editing notes for scheduled job failed, if field was empty to start.
- fixed issue deleting completed jobs. CLicking on can deleted jobs but didn't reload page.
