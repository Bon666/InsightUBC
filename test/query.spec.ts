import { expect } from "chai";
import { executeQuery } from "../src/query/executor.js";

describe("Query Engine", () => {
  const data = [
    { courses_dept: "cpsc", courses_avg: 85, courses_instructor: "A", courses_uuid: "1" },
    { courses_dept: "cpsc", courses_avg: 90, courses_instructor: "B", courses_uuid: "2" },
    { courses_dept: "math", courses_avg: 70, courses_instructor: "C", courses_uuid: "3" }
  ];

  it("filters with GT", () => {
    const q = {
      WHERE: { GT: { courses_avg: 80 } },
      OPTIONS: { COLUMNS: ["courses_dept", "courses_avg"], ORDER: "courses_avg" }
    };
    const r = executeQuery(data as any, q);
    expect(r).to.have.length(2);
    expect(r[0].courses_avg).to.equal(85);
    expect(r[1].courses_avg).to.equal(90);
  });

  it("GROUP/APPLY COUNT distinct", () => {
    const q = {
      WHERE: {},
      TRANSFORMATIONS: {
        GROUP: ["courses_dept"],
        APPLY: [{ numInstr: { COUNT: "courses_instructor" } }]
      },
      OPTIONS: { COLUMNS: ["courses_dept", "numInstr"], ORDER: { dir: "DOWN", keys: ["numInstr"] } }
    };
    const r = executeQuery(data as any, q);
    expect(r).to.deep.equal([
      { courses_dept: "cpsc", numInstr: 2 },
      { courses_dept: "math", numInstr: 1 }
    ]);
  });

  it("wildcard IS", () => {
    const q = {
      WHERE: { IS: { courses_dept: "cp*" } },
      OPTIONS: { COLUMNS: ["courses_dept", "courses_avg"] }
    };
    const r = executeQuery(data as any, q);
    expect(r).to.have.length(2);
  });
});
