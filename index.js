var express = require("express"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  morgan = require("morgan"),
  cors = require("cors"),
  restful = require("node-restful"),
  mongoose = require("mongoose");
const { createDB } = require("./src/db");
var app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false
  })
);
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(methodOverride());

createDB(mongoose);

var Area = mongoose.Schema({
  titulo: String
});

var area_reg = (app.area = restful
  .model("area", Area)
  .methods(["get", "post", "put", "delete"]));

area_reg.register(app, "/area");

var Grupo = mongoose.Schema({
  nome_grupo: String,
  descricao: String,
  id_area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "area"
  }
});

var grupo_reg = (app.grupo = restful
  .model("grupo", Grupo)
  .methods(["get", "post", "put", "delete"]));

grupo_reg.register(app, "/grupo");

var Projeto = mongoose.Schema({
  titulo: String,
  foto: String,
  id_grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "grupo"
  },
  links: [
    {
      link: String,
      textoLink: String
    }
  ],
  alunos: [
    {
      nome: String,
      turma: String,
      turno: String
    }
  ]
});

var projeto_reg = (app.projeto = restful
  .model("projeto", Projeto)
  .methods(["get", "post", "put", "delete"]));

projeto_reg.register(app, "/projeto");

app.listen(3000);
