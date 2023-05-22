const express = require("express");
var router = express.Router();
const neo4j = require("neo4j-driver");
const cache = require("./cache");
var driver = neo4j.driver(
  "neo4j+s://a95af617.databases.neo4j.io",
  neo4j.auth.basic("neo4j", "4xVF28_zyPA2889T0oTV1ZR_nYpvx8d7G7fsFosNS6k")
);

// Q2. Se requieren consultar todos los datos de un empleado
// (incluyendo la actividad que desarrolló) y los datos de las obras en las que participó

router
  .route("/empleado/:rfc")
  .all(cache)
  .get(async (req, res) => {
    const Q2 =
      "match (o:Obra) - [:Emplea] -> (e:Empleado {RFC:$rfc}) return e, o";
    const session = driver.session();
    await session
      .run(Q2, {
        rfc: req.params.rfc,
      })
      .then((result) => {
        empleado = result.records.at(0).get("e").properties;
        obras = result.records.map((record) => ({
          obra: record.get("o").properties,
        }));
        data = {
          Empleado: empleado,
          Obras: obras,
        };
        res.json({ data });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close);
  });

// Q8. Crear un empleado asociado a una obra
router
  .route("/empleado/nuevo/:idObra")
  .all(cache)
  .post(async (req, res) => {
    const Q8 = `
    match (o:Obra {idObra:$idObra}) 
    merge (o) - [:Emplea] -> (e:Empleado { RFC: $rfc, nombre: $nombre, celular:$celular, actividades:$actividades, pago:$pago})
    return o.descripcion as descripcion, e
    `;
    const session = driver.session();
    await session
      .run(Q8, {
        idObra: req.params.idObra,
        rfc: req.body.rfc,
        nombre: req.body.nombre,
        celular: req.body.celular,
        actividades: req.body.actividades,
        pago: req.body.pago,
      })
      .then((result) => {
        obra = result.records.at(0).get("descripcion");
        empleado = result.records.at(0).get("e").properties;
        data = {
          Obra: obra,
          Empleado: empleado,
        };
        res.json({ data });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close());
  });

// Q11. Actualizar los datos de un empleado
router
  .route("/empleado/:rfc")
  .all(cache)
  .put(async (req, res) => {
    const Q11 = `
  match (e:Empleado {RFC:$rfc})
  set e.nombre=$nombre, e.celular=$celular, e.actividades=$actividades, e.pago=$pago
  return e
  `;
    const session = driver.session();
    await session
      .run(Q11, {
        rfc: req.params.rfc,
        nombre: req.body.nombre,
        celular: req.body.celular,
        actividades: req.body.actividades,
        pago: req.body.pago,
      })
      .then((result) => {
        empleado = result.records.map((record) => {
          return record.get("e").properties;
        });
        res.json({ Empleado: empleado });
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => session.close());
  });

module.exports = router;
