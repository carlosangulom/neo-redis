const express = require("express");
const app = express();
const neo4j = require("neo4j-driver");
const bodyParser = require("body-parser");
const datos = require("./assets/data.js");

const cliente = require("./routes/cliente.js");
const empleado = require("./routes/empleado.js");
const obra = require("./routes/obra.js");

const PORT = 3000;

const createData = async () => {
  var driver = neo4j.driver(
    "neo4j+s://a95af617.databases.neo4j.io",
    neo4j.auth.basic("neo4j", "4xVF28_zyPA2889T0oTV1ZR_nYpvx8d7G7fsFosNS6k")
  );

  const session = driver.session();
  Q = "MATCH (n) RETURN count(n) as data_exists";
  await session.run(Q).then((result) => {
    if (result.records[0].get("data_exists") == 0) {
      session.run(datos).then(() => {
        console.log("Datos creados");
        session.close;
      })
    } 
  });
};

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", cliente, empleado, obra);
createData();
app.listen(PORT, () => {
  console.log("Server en http://localhost:" + PORT);
});
