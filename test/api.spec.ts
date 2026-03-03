import { expect } from "chai";
import request from "supertest";
import app from "../src/server.js";
import JSZip from "jszip";

describe("API", () => {
  it("health", async () => {
    const r = await request(app).get("/health");
    expect(r.status).to.equal(200);
    expect(r.body.status).to.equal("ok");
  });

  it("upload dataset and query", async () => {
    // Build zip in-memory with a JSON file
    const zip = new JSZip();
    zip.file("data.json", JSON.stringify([
      { courses_dept: "cpsc", courses_avg: 85, courses_instructor: "A" },
      { courses_dept: "cpsc", courses_avg: 90, courses_instructor: "B" },
      { courses_dept: "math", courses_avg: 70, courses_instructor: "C" }
    ]));
    const buf = await zip.generateAsync({ type: "nodebuffer" });

    const put = await request(app).put("/dataset/courses").send(buf);
    expect(put.status).to.equal(200);
    expect(put.body.added).to.equal("courses");

    const q = {
      WHERE: { GT: { courses_avg: 80 } },
      OPTIONS: { COLUMNS: ["courses_dept", "courses_avg"], ORDER: { dir: "DOWN", keys: ["courses_avg"] } }
    };
    const post = await request(app).post("/query").send(q);
    expect(post.status).to.equal(200);
    expect(post.body.result).to.have.length(2);
    expect(post.body.result[0].courses_avg).to.equal(90);
  });
});
