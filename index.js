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

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let users = [];

const User = mongoose.model("User", { name: String, password: String });
// read all users save in DataBase
const getAllUsers = async () => {
  let allUsers = await User.find({});
  console.log(allUsers);
  return allUsers;
};

// // REGISTER A USER
// app.post("/createUser", async (req, res) => {
//   const name = req.body.name;
//   const hashedPassword = await bcrypt.hash(req.body.password, 10);
//   users.push({ name: name, password: hashedPassword });
//   // save in database
//   const newUser = new User({ name: name, password: hashedPassword });
//   newUser.save().then(() => console.log("user save in database"));
//   res.status(201).send(users);
//   console.log(users);
// });

// accessTokens
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}
// refreshTokens
let refreshTokens = [];
function generateRefreshToken(user) {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "20m"
  });
  refreshTokens.push(refreshToken);
  return refreshToken;
}

//AUTHENTICATE LOGIN AND RETURN JWT TOKEN
app.post("/login", async (req, res) => {
  if (users.length === 0) {
    //get all users
    users = await getAllUsers();
  }
  const user = users.find((c) => c.name === req.body.name);
  //check to see if the user exists in the list of registered users
  if (user == null) res.status(404).send("User does not exist!");
  //if user does not exist, send a 400 response
  if (await bcrypt.compare(req.body.password, user.password)) {
    const accessToken = generateAccessToken({ user: req.body.name });
    const refreshToken = generateRefreshToken({ user: req.body.name });
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } else {
    res.status(401).send("Password Incorrect!");
  }
});

//REFRESH TOKEN API
app.post("/refreshToken", (req, res) => {
  if (!refreshTokens.includes(req.body.token))
    res.status(400).send("Refresh Token Invalid");
  refreshTokens = refreshTokens.filter((c) => c !== req.body.token);
  //remove the old refreshToken from the refreshTokens list
  const accessToken = generateAccessToken({ user: req.body.name });
  const refreshToken = generateRefreshToken({ user: req.body.name });
  //generate new accessToken and refreshTokens
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((c) => c !== req.body.token);
  //remove the old refreshToken from the refreshTokens list
  res.status(204).send("Logged out!");
});


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

var PORT = process.env.PORT || 8080;

app.listen(PORT);
