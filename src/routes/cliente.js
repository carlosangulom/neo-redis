const express = require("express");
var router = express.Router();
const neo4j = require("neo4j-driver");
const cache = require("./cache");
var driver = neo4j.driver(
  "neo4j://172.17.0.1",
  neo4j.auth.basic("neo4j", "neo4j")
);

// Q1. Se requiere consultar todos los datos del cliente
//     y todos los datos de las obras que pertenecen a dicho cliente.
router
  .route("/cliente/Q1/:rfc")
  .all(cache)
  .get(async (req, res) => {
    const Q1 =
      "match (c:Cliente {RFC:$rfc}) - [t:TIENE] -> (o:Obra) return c,t,o";
    const session = driver.session();
    await session
      .run(Q1, {
        rfc: req.params.rfc,
      })
      .then((result) => {
        cliente = result.records.at(0).get("c").properties;
        obras = result.records.map((record) => ({
          obra: record.get("o").properties,
        }));
        data = {
          Cliente: cliente,
          Obras: obras,
        };
        res.json({ data });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close);
  });

// Q5. Para un cliente en específico se requiere consultar su nombre,
// lista de los empleados que trabajaron en sus obras y la actividad que desarrollaron;
// así como, la descripción de la obra.

router
  .route("/cliente/Q5/:rfc")
  .all(cache)
  .get(async (req, res) => {
    const Q1 =
      "match (c:Cliente {RFC:$rfc}) - [:TIENE]-> (o:Obra) - [:Emplea] -> (e:Empleado) return c.nombre as clienteNombre, e.nombre as empleadoNombre, e.actividades as empleadoActividades, o.descripcion as obraDescripcion order by o.descripcion, e.nombre";
    const session = driver.session();
    await session
      .run(Q1, {
        rfc: req.params.rfc,
      })
      .then((result) => {
        cliente = result.records.at(0).get("clienteNombre");

        let current = "";
        obras = result.records
          .filter((o) => {
            let obra = o.get("obraDescripcion");

            if (obra != current) {
              current = obra;
              return true;
            } else return false;
          })
          .map((record) => {
            return record.get("obraDescripcion");
          });

        empleados = result.records.map((record) => ({
          NombreEmpleado: record.get("empleadoNombre"),
          Actividades: record.get("empleadoActividades"),
        }));
        data = {
          Cliente: cliente,
          Obras: obras,
          Empleados: empleados,
        };
        res.json({ data });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close);
  });

// Q6. Crear clientes
router
  .route("/cliente")
  .all(cache)
  .post(async (req, res) => {
    const Q6 = "merge (c:Cliente {RFC:$rfc, nombre:$nombre, celular:$celular}) return c";
    const session = driver.session();
    await session
      .run(Q6, {
        rfc: req.body.rfc,
        nombre: req.body.nombre,
        celular: req.body.celular,
      })
      .then((result) => {
        cliente = result.records.map((record) => {
          return record.get("c").properties;
        });
        res.json({ Cliente: cliente });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close());
  });

// Q9. Actualizar los datos de un Cliente
router
  .route("/cliente/:rfc")
  .all(cache)
  .put(async (req, res) => {
    const Q9 = `
    match (c:Cliente {RFC:$rfc})
    set c.nombre =$nombre, c.celular=$celular
    return c
    `;
    const session = driver.session();
    await session
      .run(Q9, {
        rfc: req.params.rfc,
        nombre: req.body.nombre,
        celular: req.body.celular,
      })
      .then((result) => {
        cliente = result.records.map((record) => {
          return record.get("c").properties;
        });
        res.json({ Cliente: cliente });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close());
  });

// Q12. Eliminar un cliente, sus obras y empleados asociados
router
  .route("/cliente/:rfc")
  .all(cache)
  .delete(async (req, res) => {
    const Q12 =
      "match (c:Cliente {RFC:$rfc}) - [t:TIENE] -> (o:Obra) detach delete c, o";
    const session = driver.session();
    await session
      .run(Q12, {
        rfc: req.params.rfc,
      })
      .then(() => {
        res.json({ Result: "success" });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close());
  });

module.exports = router;
