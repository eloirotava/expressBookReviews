const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    try {
      if (!req.session || !req.session.authorization) {
        return res.status(401).json({ message: "Not logged in" });
      }
  
      const token = req.session.authorization.accessToken;
      if (!token) {
        return res.status(401).json({ message: "Missing access token" });
      }
  
      // IMPORTANTE: use o MESMO secret usado quando você criou o token no login (ex: 'access')
      jwt.verify(token, "access", (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
  
        // opcional: deixar info do usuário disponível pras rotas
        req.user = decoded;
        next();
      });
    } catch (e) {
      return res.status(500).json({ message: "Authentication error" });
    }
  });
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
