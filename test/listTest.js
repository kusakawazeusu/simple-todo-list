const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = require("chai").expect;
const server = require("../app");
const fs = require("fs");
const listJsonPath = "lists.json";

chai.use(chaiHttp);

/*
GET /lists
1. 確認 status code
2. 確認 lists 內容
3. 確認 lists 長度
*/

describe("Get lists", function() {
  it("Status code 200", function(done) {
    chai
      .request(server)
      .get("/lists")
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it("Correct list content", function(done) {
    chai
      .request(server)
      .get("/lists")
      .end((err, res) => {
        expect(res.body.result).to.deep.equal(getLists());
        done();
      });
  });

  it("Correct list length", function(done) {
    chai
      .request(server)
      .get("/lists")
      .end((err, res) => {
        expect(res.body.count).to.equal(getLists().length);
        done();
      });
  });
});

/*
GET /lists/{id}
1. 確認 status code
2. 確認 list 內容
*/

describe("Get a single list item", function() {
  describe("Successfully get item", function() {
    it("Status code 200", function(done) {
      let firstID = getLists().slice(0, 1)[0].id;

      chai
        .request(server)
        .get(`/lists/${firstID}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it("Correct item content", function(done) {
      let firstID = getLists().slice(0, 1)[0].id;

      chai
        .request(server)
        .get(`/lists/${firstID}`)
        .end((err, res) => {
          expect(res.body.result).to.deep.equal(
            getLists().find(item => item.id == firstID)
          );
          done();
        });
    });
  });

  describe("Item not found", function() {
    it("Status code 400", function(done) {
      chai
        .request(server)
        .get(`/lists/a`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });

    it("Error message", function(done) {
      chai
        .request(server)
        .get(`/lists/a`)
        .end((err, res) => {
          expect(res.body).to.deep.equal({ message: "Item not found" });
          done();
        });
    });
  });
});

/*
POST /lists
1. 確認 status code
2. 確認是否有真的新增
3. 確認 auto index 是否正確
*/

describe("Create a new list item", function() {
  describe("Successfully created item", function() {
    it("Status code 200", function(done) {
      chai
        .request(server)
        .post(`/lists`)
        .send({ todo: "Test data" })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          deleteLatestItem();
          done();
        });
    });

    it("Correctly append item to json file", function(done) {
      let newContent = `TestData${new Date()}`;
      chai
        .request(server)
        .post(`/lists`)
        .send({ todo: newContent })
        .end((err, res) => {
          expect(getLists().slice(-1)[0].todo).to.equal(newContent);
          deleteLatestItem();
          done();
        });
    });

    it("Correct next_id", function(done) {
      let correctID = getNextID();

      chai
        .request(server)
        .post(`/lists`)
        .send({ todo: "Test data" })
        .end((err, res) => {
          expect(getLists().slice(-1)[0].id).to.equal(correctID);
          deleteLatestItem();
          done();
        });
    });
  });

  describe("Post without todo data", function() {
    it("Status code 400", function(done) {
      chai
        .request(server)
        .post(`/lists`)
        .send({ todo: "" })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });

    it("Error message", function(done) {
      chai
        .request(server)
        .post(`/lists`)
        .send({ todo: "" })
        .end((err, res) => {
          expect(res.body).to.deep.equal({ message: "Bad input: todo" });
          done();
        });
    });

    it("Lists won't get changed with error input", function(done) {
      let originalList = getLists();
      let originalLatestID = getNextID() - 1;
      let afterPostList;
      let afterNextID;
      chai
        .request(server)
        .post(`/lists`)
        .send({ todo: "" })
        .end((err, res) => {
          chai
            .request(server)
            .get(`/lists`)
            .end((err, res) => {
              afterPostList = res.body.result;
              afterNextID = res.body.result.slice(-1)[0].id;
              expect(afterPostList).to.deep.equal(originalList);
              expect(afterNextID).to.equal(originalLatestID);
              done();
            });
        });
    });
  });
});

describe("Checked item", function() {
  let firstItemID = getLists()[0].id;
  describe("Successfully checked a item", function() {
    it("Status code 200", function(done) {
      chai
        .request(server)
        .patch(`/lists/${firstItemID}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          toggleFirstItem();
          done();
        });
    });

    it("Change the checked state", function(done) {
      let expectedState = !getLists()[0].checked;
      chai
        .request(server)
        .patch(`/lists/${firstItemID}`)
        .end((err, res) => {
          expect(expectedState).to.equal(getLists()[0].checked);
          toggleFirstItem();
          done();
        });
    });
  });

  describe("Item not found", function() {
    it("Status code 400", function(done) {
      chai
        .request(server)
        .patch(`/lists/a`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
    });

    it("Error message", function(done) {
      chai
        .request(server)
        .patch(`/lists/a`)
        .end((err, res) => {
          expect(res.body).to.deep.equal({ message: "Item not found" });
          done();
        });
    });
  });
});

function getLists() {
  return JSON.parse(fs.readFileSync(listJsonPath, "utf8")).data;
}

function getNextID() {
  return JSON.parse(fs.readFileSync(listJsonPath, "utf8")).next_index;
}

function deleteLatestItem() {
  lists = JSON.parse(fs.readFileSync(listJsonPath, "utf8"));
  lists.data = lists.data.slice(0, -1);
  lists.next_index -= 1;
  fs.writeFileSync(listJsonPath, JSON.stringify(lists));
}

function toggleFirstItem() {
  lists = JSON.parse(fs.readFileSync(listJsonPath, "utf8"));
  lists.data[0].checked = !lists.data[0].checked;
  fs.writeFileSync(listJsonPath, JSON.stringify(lists));
}
