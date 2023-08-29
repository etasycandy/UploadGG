const express = require("express");
const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const documentRoute = require("./document.route");

let router = express.Router();

const defaultRoutes = [
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/documents",
    route: documentRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
