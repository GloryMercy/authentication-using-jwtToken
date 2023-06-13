const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const hasPriorityAndStatusProperties = (requestQuery) => {
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

//API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  let data = null;
  const { todoId } = request.params;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;
  getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    id = ${todoId};`;
  /*switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    id = ${todoId}
    AND todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    id = ${todoId}
    AND 
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    id = ${todoId}
    AND 
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    id = ${todoId}
    AND 
    todo LIKE '%${search_q}%';`;
  }*/

  data = await db.get(getTodosQuery);
  response.send(data);
});

//API 3 POST
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addToDoTask = `
    INSERT INTO todo(id, todo, priority, status)
    VALUES (${id}, "${todo}", "${priority}", "${status}");`;

  await db.run(addToDoTask);
  response.send("Todo Successfully Added");
});
//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateBody = request.body;
  let updatedColumn = "";
  switch (true) {
    case updateBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
    case updateBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case updateBody.status !== undefined:
      updatedColumn = "Status";
      break;
    default:
      break;
  }
  const valuesInToDOTable = `
        SELECT *
        FROM todo
        WHERE id = ${todoId};
    `;
  const previousValue = await db.get(valuesInToDOTable);
  // assign previous value as default value
  const {
    todo = previousValue.todo,
    priority = previousValue.priority,
    status = previousValue.status,
  } = request.body;

  const addToDoTask = `
        UPDATE todo
        SET
          todo="${todo}",
          priority = "${priority}",
          status = "${status}"
        WHERE
          id = ${todoId};`;

  await db.run(addToDoTask);
  response.send(`${updatedColumn} Updated`);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTaskQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId} ;
  `;
  await db.run(deleteTaskQuery);
  response.send("Todo Deleted");
});

module.exports = app;
