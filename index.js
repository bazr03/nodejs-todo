const express = require("express");
const graphqlHttp = require("express-graphql");
const app = express();

require("dotenv").config({ path: "variables.env" });
const Auth = require("./middlewares/auth");
const DBconnection = require("./config/db");
const graphqlSchema = require("./graphql/schema");
const graphqlResolvers = require("./graphql/resolvers.js");

app.use(express.json({ extended: true }));
app.use(Auth);
// prevenir errores de CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept,X-Requested-With"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
    // de esta forma no llegamos a next() lo que ocasiona que no lleguemos a
    // /grapql pero aun asi tener una respuesta valida status 200
  }
  //console.log(res);
  next();
});

// app.use("/graphql", (req, res) => {
//   graphqlHttp({
//     schema: graphqlSchema,
//     rootValue: graphqlResolvers,
//     graphiql: true,
//     context: { errorName },
//     customFormatErrorFn: err => {
//       console.log(err.originalError);
//       //errors.report(err, req); // log the error
//       if (!err.originalError) {
//         console.log(err);
//         return err;
//       }
//       return formatError.getError(err);
//       // return {
//       //   message: "my custom message",
//       //   statusCode: 401
//       // };
//     }
//   })(req, res);
// });

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
    customFormatErrorFn(err) {
      console.log(err.originalError);
      //errors.report(err, req); // log the error
      if (!err.originalError) {
        console.log(err);
        return err;
      }
      const data = err.originalError.data; // creado en el resolver
      const message = err.message || "An error ocurred!"; // pull out by default by graphql
      const code = err.originalError.code || 500;
      console.log("data: ", data, " message: ", message, " status: ", code);
      return { message: message, statusCode: code, data: data };
    }
  })
);

// Conectar a la base de datos
DBconnection();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
