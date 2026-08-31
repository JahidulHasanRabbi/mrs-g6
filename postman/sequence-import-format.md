# Game Sequence Import — file format

Applies to the **Import Sequence** button on all three admin game pages:

| Page | Button | Replaces |
| :---- | :---- | :---- |
| Smash Egg (`/admin/smash-egg`) | Import Sequence | Smash Sequence |
| Lucky Spin (`/admin/lucky-spin` → Spin Sequence Setting) | Import Sequence | Spin Sequence |
| Penalty Kick (`/admin/penalty-kick`) | Import Sequence | Kick Sequence |

Accepted uploads: **`.csv`, `.xls`, `.xlsx`, `.xlsb`, `.ods`** — max 5MB. Only the
**first worksheet** is read.

Ready-made templates: `public/assets/admin/templates/{smash,spin,kick}-sequence-template.csv`.
The **Download template** button inside the modal is better — it emits the same
format pre-filled with that game's *real* reward names and UUIDs.

## Columns

| \# | Column | Required | Description |
| ----: | :---- | :---- | :---- |
| **1** | `Position` | No | The slot in the sequence, `1` or greater. A leading `#` is allowed. If the column is missing entirely, top-to-bottom row order is used instead. |
| **2** | `Reward Name` | Yes\* | Must match an existing reward on that game, case- and whitespace-insensitive. |
| **3** | `Reward UUID` | No | The reward's UUID. When both are filled, **UUID wins** over the name. |

\* One of `Reward Name` or `Reward UUID` must identify the reward.

Header names are matched loosely — `Position` / `Order` / `Item Order` / `No` / `#`
all work, as do `Reward Name` / `Reward` / `Item` / `Prize` / `Name`, and
`Reward UUID` / `Item UUID` / `UUID` / `Reward ID`. Column order does not matter,
and a file with no header row at all is read as `Position, Reward Name, Reward UUID`.
Blank rows are skipped.

## Example

```csv
Position,Reward Name,Reward UUID
1,Free Credit 10,
2,Token x5,
3,Grand Prize,
4,Token x5,
```

## Behaviour

- **Replace, not merge.** A successful import **deletes the game's entire existing
  sequence** and writes the file's rows as the new one.
- The whole file is validated *before* anything is written. The modal previews
  every row with a per-row status, and the Import button stays hidden while any
  row is flagged. Rejected rows: unknown reward name/UUID, a name matching more
  than one reward, a non-numeric or missing position, and duplicate positions.
- **Ordering comes from `Position`**, not from where the row sits in the file.
- Positions need not be contiguous — `1, 5, 9` imports as three slots in that
  order.

## Backend note

There is no bulk sequence endpoint, so the import is one `DELETE` per existing
row followed by one `POST` per imported row
(`/{game}/{…}-sequences/`). A network or validation failure part-way through
leaves the sequence **partially written**; the UI says so and reloads the table,
which is then the source of truth. A bulk `POST … /import-sequences/` taking the
full list in one transaction would remove that failure mode.
