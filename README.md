# InsightUBC (TypeScript Dataset Query Engine)

A production-style dataset query engine:
- Upload dataset (zip) -> parsed into rows and cached
- Query engine supports:
  - WHERE: AND/OR, GT/LT/EQ, IS with wildcards
  - TRANSFORMATIONS: GROUP + APPLY (MAX/MIN/AVG/SUM/COUNT)
  - OPTIONS: COLUMNS + ORDER (single key or multi-key)

## Run
```bash
cd insightubc
npm i
npm test
npm run dev
