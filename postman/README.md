# Postman collections

Runnable collections for questions that reach support repeatedly.

## AFAQY_Report_Data_Full_Chain.postman_collection.json

Retrieving actual report values, end to end.

`/reports/lists` and `/user_report_templates/lists` return report *definitions*:
column names, codes, formats, aggregation. They describe a report; they never run
it. Integrators regularly mistake that metadata for a broken response.

The values come from a different family, in four calls:

| # | Request | Returns |
|---|---------|---------|
| 1 | `POST /user_reports/add` | the report id — no rows |
| 2 | `POST /user_reports/percentage` | generation progress; poll until 100 |
| 3 | `POST /user_reports/data-summary` | the aggregated summary, one row per vehicle |
| 4 | `POST /user_reports/data-new` | the detail behind one vehicle, by `resource_id` |

**Step 2 is the one people miss.** The report is generated asynchronously, so
reading the rows immediately after creating it returns an empty `data` array with
`status_code 200` and `message "success"` — a valid response that looks like a
failure. That is the most common cause of "the report returns no data".

### Using it

Import into Postman, open the collection **Variables** tab and set `username` and
`password` (or paste a `token` directly). Optionally set `imei` to target one
vehicle, and set `date_from` / `date_to`. Run the requests in order or use the
Runner — `token`, `user_id`, `unit_id` and `report_id` are captured between steps
automatically, and request 4 loops until generation completes.

Change `base_url` to `https://api.afaqy.pro` if the account lives there.

## reply_template.txt

The matching customer-facing answer, covering why the catalog carries no values,
which parameters `add` requires, and the difference between `data-summary` and
`data-new`. Fill in the name and send it with the collection attached.

---

The same chain runs inside the tool itself: **Ready scenarios → Summary report**,
and **Analyse a customer message** emits this answer when the email is pasted in.
