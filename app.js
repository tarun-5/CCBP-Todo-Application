const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");

app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const outPutResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    due_date: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;
  let data = null;
  let getTodoQuery = "";

  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `
                    SELECT * FROM todo WHERE priority = "${priority}" AND status = "${status}";`;
          data = await db.all(getTodoQuery);
          response.send(data.map((a) => outPutResult(a)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCategoryAndStatusProperty(request.Query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `
                    SELECT * FROM todo WHERE category = "${category}" AND status = "${status}";`;
          data = await db.all(getTodoQuery);
          response.send(data.map((a) => outPutResult(a)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryAndPriorityProperty(request.Query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodoQuery = `
                    SELECT * FROM todo WHERE category = "${category}" AND priority = "${priority}";`;
          data = await db.all(getTodoQuery);
          response.send(data.map((a) => outPutResult(a)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodoQuery = `
                    SELECT * FROM todo WHERE priority = "${priority}";`;
        data = await db.all(getTodoQuery);
        response.send(data.map((a) => outPutResult(a)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodoQuery = `
                    SELECT * FROM todo WHERE status = "${status}";`;
        data = await db.all(getTodoQuery);
        response.send(data.map((a) => outPutResult(a)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    case hasSearchProperty(request.query):
      getTodoQuery = `
                    SELECT * FROM todo WHERE todo LIKE "%${search_q}%";`;
      data = await db.all(getTodoQuery);
      response.send(data.map((a) => outPutResult(a)));
      break;

    case hasCategoryAndPriorityProperty(request.Query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodoQuery = `
                    SELECT * FROM todo WHERE category = "${category}";`;
        data = await db.all(getTodoQuery);
        response.send(data.map((a) => outPutResult(a)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      getTodoQuery = `SELECT * FROM todo;`;
      data = await db.all(getTodoQuery);
      response.send(data.map((a) => outPutResult(a)));
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoIdQuery = `
    SELECT * FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.get(getTodoIdQuery);
  response.send(outPutResult(dbResponse));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const requestQuery = `SELECT * FROM todo WHERE due_date = ${newDate};`;
    const dbResponse = await db.all(requestQuery);
    response.send(dbResponse.map((a) => outPutResult(a)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM 
    todo 
    WHERE 
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
