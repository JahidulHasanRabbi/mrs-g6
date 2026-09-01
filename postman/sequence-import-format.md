# Game Sequence Import — file format

Applies to the **Import Sequence** / **Export Sequence** buttons on all three
admin game pages, in each one's Sequence table header:

| Page | Sequence table |
| :---- | :---- |
| Smash Egg (`/admin/smash-egg`) | Smash Sequences |
| Lucky Spin (`/admin/lucky-spin` → Spin Sequence Setting) | Spin Sequence Table |
| Penalty Kick (`/admin/penalty-kick`) | Kick Sequences |

Accepted uploads: **`.csv`, `.xls`, `.xlsx`, `.xlsb`, `.ods`** — max 5MB. Only the
**first worksheet** is read.

Ready-made templates: `public/assets/admin/templates/{smash,spin,kick}-sequence-template.csv`.
The **Download template** button inside the modal is better — it emits the same
format pre-filled with that game's *real* reward IDs and names. **Export Sequence**
downloads the live sequence in this same column order, as a `.xlsx`, so a file you
export can be edited and re-imported as-is.

## Columns

| \# | Column | Required | Description |
| ----: | :---- | :---- | :---- |
| **1** | `Item Order` | No | The slot in the sequence, `1` or greater. A leading `#` is allowed. If the column is missing entirely, top-to-bottom row order is used instead. |
| **2** | `Item ID` | No | The reward's short numeric ID — the same `ID` column shown in that game's reward table. When both are filled, **ID wins** over the name. |
| **3** | `Item Name` | Yes\* | Must match an existing reward on that game, case- and whitespace-insensitive. |

\* One of `Item Name` or `Item ID` must identify the reward.

Header names are matched loosely — `Item Order` / `Position` / `Order` / `No` / `#`
all work, as do `Item Name` / `Reward Name` / `Reward` / `Item` / `Prize` / `Name`, and
`Item ID` / `Reward ID` / `ID` / `Item UUID` / `Reward UUID` / `UUID`. Column order does
not matter when a header row is present; a file with **no header row at all** is read
positionally as `Item Order, Item ID, Item Name`. Blank rows are skipped.

## Example

```csv
Item Order,Item ID,Item Name
1,12,Free Credit 10
2,,Token x5
3,7,Grand Prize
4,,Token x5
```

## Behaviour

- **Replace, not merge.** A successful import **deletes the game's entire existing
  sequence** and writes the file's rows as the new one.
- The whole file is validated locally *before* anything is sent. The modal previews
  every row with a per-row status, and the Import button stays hidden while any
  row is flagged. Rejected rows: unknown reward name/ID, a name matching more
  than one reward, a non-numeric or missing order, and duplicate orders.
- After a local pass with no flagged rows, the resolved rows are sent to the
  bulk import endpoint in **one request**. The backend re-validates against
  live reward state (a row can still be rejected there — e.g. the reward was
  archived after the file was built), so the modal also shows the server's
  own `success_count` / `failed_count` / per-row reasons once the import runs.
- **Ordering comes from `Item Order`**, not from where the row sits in the file.
- Order values need not be contiguous — `1, 5, 9` imports as three slots in that
  order.
- Every import — full success, partial, or total failure — is recorded in that
  game's **Sequence Import History** table below the sequence table. Its
  **Details** link opens the full row-by-row breakdown (saved/failed + reason).

## Backend note

The bulk endpoint (`POST /{game}/{…}-sequence-imports/`) takes the whole file's
rows in one call: `{ rows: [{ item_uuid, item_name, item_order }] }`. It purges
the old sequence and writes the new one only if at least one row passes; if
every row fails, the live sequence is left untouched and the import is still
recorded in history with `status: FAILED`. The UI resolves each row's `Item ID`
or `Item Name` to that reward's real UUID client-side before sending — the file
format never carries UUIDs directly.
