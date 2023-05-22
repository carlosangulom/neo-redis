const express = require("express");
var router = express.Router();
const neo4j = require("neo4j-driver");
const cache = require("./cache");
var driver = neo4j.driver(
  "neo4j+s://a95af617.databases.neo4j.io",
  neo4j.auth.basic("neo4j", "4xVF28_zyPA2889T0oTV1ZR_nYpvx8d7G7fsFosNS6k")
);

// Q3. Para una obra en específico se requiere únicamente la descripción y costo base;
// así como (únicamente) el nombre del cliente para el que se desarrolló la obra.

router
  .route("/obra/:idObra")
  .all(cache)
  .get(async (req, res) => {
    const Q3 =
      "MATCH (c:Cliente)-[:TIENE]->(o:Obra {idObra:$idObra}) RETURN c.nombre AS clienteNombre, o.descripcion AS obraDescripcion, o.costo_base as costoBase";
    const session = driver.session();
    await session
      .run(Q3, {
        idObra: req.params.idObra,
      })
      .then((result) => {
        data = result.records.map((record) => ({
          nombreCliente: record.get("clienteNombre"),
          descripcionObra: record.get("obraDescripcion"),
          costoBase: record.get("costoBase"),
        }));
        res.json({ data });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close);
  });

// Q4. Se requiere calcular el total de pagos asociados a los empleados
// participantes en una obra en específico.

router
  .route("/obra/pago/:idObra")
  .all(cache)
  .get(async (req, res) => {
    const Q4 =
      "match (o:Obra {idObra:$idObra}) - [f:Emplea] -> (e:Empleado) return sum(e.pago) as pago";
    const session = driver.session();
    await session
      .run(Q4, {
        idObra: req.params.idObra,
      })
      .then((result) => {
        Pago = result.records.at(0).get("pago");

        res.json({ Pago });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close);
  });

// Q7. Crear una obra asociada a un Cliente
router
  .route("/obra/nueva/:rfc")
  .all(cache)
  .post(async (req, res) => {
    const Q7 = `
    match (c:Cliente {RFC:$rfc})
    merge (c) - [:TIENE] -> (o:Obra {idObra:$idObra, descripcion: $descripcion, costo_base:$costo_base})
    return c.nombre as clienteNombre, o
    `;
    const session = driver.session();
    await session
      .run(Q7, {
        rfc: req.params.rfc,
        idObra: req.body.idObra,
        descripcion: req.body.descripcion,
        costo_base: req.body.costo_base,
      })
      .then((result) => {
        cliente = result.records.at(0).get("clienteNombre");
        obra = result.records.at(0).get("o").properties;
        data = {
          Cliente: cliente,
          Obra: obra,
        };
        res.json({ data });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close());
  });

// Q10. Actualizar los datos de una obra
router
  .route("/obra/:idObra")
  .all(cache)
  .put(async (req, res) => {
    const Q10 = `
    match (o:Obra {idObra:$idObra})
    set o.descripcion=$descripcion, o.costo_base=$costo_base
    return o
    `;
    const session = driver.session();
    await session
      .run(Q10, {
        idObra: req.params.idObra,
        descripcion: req.body.descripcion,
        costo_base: req.body.costo_base,
      })
      .then((result) => {
        obra = result.records.map((record) => {
          return record.get("o").properties;
        });
        res.json({ Obra: obra });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close());
  });

module.exports = router;
