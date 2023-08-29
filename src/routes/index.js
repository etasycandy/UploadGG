let express = require("express");
let router = express.Router();
const fs = require("fs");
const multer = require("multer");
var LocalStrategy = require("passport-local").Strategy;
var passport = require("passport");
var bcrypt = require("bcrypt");
const createError = require("http-errors");
const { google } = require("googleapis");

const { User, Document } = require("../models");
const { userService, documentService } = require("../services");
const { authMiddleware } = require("../middlewares");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username })
      .then(function (user) {
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            return done(err);
          }
          if (!result) {
            return done(null, false, {
              message: "Incorrect username and password",
            });
          }
          return done(null, user);
        });
      })
      .catch(function (err) {
        return done(err);
      });
  }),
);

// Configure Google Drive API credentials
const credentials = require("../../credentials.json");
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });
const idFolderDrive = process.env.ID_FOLDER_DRIVE;

// Configure upload image & video
const uriUploadImage = process.env.URI_UPLOAD_IMAGE;
const uriImageDoc = process.env.URI_IMAGE_DOCUMENT;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uriUploadImage);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

const storageDoc = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uriImageDoc);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });
const uploadDoc = multer({ storage: storageDoc });

/* GET document page. */
router.get("/", authMiddleware.requiredLogin, async (req, res) => {
  let documents;
  if (req.query.dateView) {
    documents = await Document.find({
      createdAt: { $gte: new Date(req.query.dateView).toString() },
    });
  } else {
    documents = await Document.find();
  }

  res.render("documents", { title: "Documents List", documents });
});

/* POST document page. */
router.post(
  "/",
  authMiddleware.requiredLogin,
  uploadDoc.array("images"),
  async (req, res) => {
    const folderId = idFolderDrive;
    const images = [];
    let linkVideo;
    let idVideo;

    const uploadPromises = req.files.map(async (file) => {
      if (file.mimetype == "video/mp4") {
        const result = await drive.files.create({
          requestBody: {
            name: file.originalname, //file name
            mimeType: file.mimeType,
            parents: [folderId],
            role: "reader",
            type: "anyone",
          },
          media: {
            mimeType: file.mimeType,
            body: fs.createReadStream(file.path),
          },
          fields: "id, webViewLink, webContentLink",
        });

        idVideo = result.data.id;
        linkVideo = result.data.webViewLink;

        fs.unlinkSync(uriImageDoc + file.filename);
      } else {
        images.push(file.filename);
      }
    });

    await Promise.all(uploadPromises);

    req.body.idVideo = idVideo;
    req.body.video = linkVideo;
    req.body.images = images;
    // console.log("2.body:", req.body);

    await documentService.createDocument(req.body);

    res.redirect("/");
  },
);

/**
 * UPDATE document
 */
router.get(
  "/document/update/:id",
  authMiddleware.requiredLogin,
  async (req, res) => {
    const document = await documentService.getDocumentById(req.params.id);
    res.render("update-document", { title: "Documents List", document });
  },
);

router.post(
  "/document/update/:id",
  authMiddleware.requiredLogin,
  async (req, res) => {
    await documentService.updateDocumentById(req.params.id, req.body);
    res.redirect("/");
  },
);

/**
 * DELETE document
 */
router.post(
  "/document/delete",
  authMiddleware.requiredLogin,
  async (req, res) => {
    const document = await documentService.deleteDocumentById(req.body.idDoc);
    const images = document.images;
    const idVideo = document.idVideo;
    if (images != "") {
      images.forEach((image) => {
        fs.unlinkSync(uriImageDoc + image);
      });
    }
    if (idVideo != "") {
      await drive.files.delete({
        fileId: idVideo,
      });
    }
    res.status(200).json({ success: true });
  },
);

/**
 * Render Login Page
 */
router.get("/login", authMiddleware.requiredLogout, (req, res) => {
  res.render("login", {
    title: "Log in",
    success: "",
    error: "",
    type: "",
  });
});

/**
 * Login a user
 */
router.post(
  "/login",
  async (req, res, next) => {
    try {
      const user = await userService.queryUsers(req.body.username);

      if (!user || !(await user.isPasswordMatch(req.body.password))) {
        throw createError.NotFound("Incorrect username or password!");
      } else {
        next();
      }
    } catch (error) {
      let errors = "";
      if (Array.isArray(error)) {
        errors = error[0].message;
      }
      error.message;
      res.render("login", {
        title: "Login",
        success: "",
        error: errors || "Incorrect username or password!",
        type: "login",
      }); //'Invalid username or password!'
    }
  },
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
);

/**
 * Logout
 */
router.get("/logout", authMiddleware.requiredLogin, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

/**
 * Register page
 */
router.get("/register", authMiddleware.requiredLogout, (req, res) => {
  res.render("register", {
    title: "Register",
    success: "",
    error: "",
    type: "",
  });
});

/**
 * Register a new user
 */
router.post("/register", upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      if (req.file != undefined) {
        req.body.avatar = req.file.filename;
      } else {
        delete req.body.avatar;
      }
      await userService.createUser(req.body);
      res.render("login", {
        title: "Login",
        success: "Sign Up Success!",
        error: "",
        type: "login",
      });
    } else {
      throw createError.NotFound("Username already exists!");
    }
  } catch (error) {
    let errors = "";
    if (Array.isArray(error)) {
      errors = error[0].message;
    }
    error.message;
    res.render("register", {
      title: "Register",
      success: "",
      error: errors || error.message,
      type: "register",
    });
  }
});

router.get(
  "/customer-management",
  authMiddleware.checkAdminRole,
  async (req, res) => {
    const customers = await User.find({ roles: "user" });
    res.render("customer-manager", {
      title: "Customer Manager",
      success: "",
      error: "",
      type: "",
      customers,
    });
  },
);

/**
 * Create a new customer
 */
router.post(
  "/customer-management",
  authMiddleware.checkAdminRole,
  upload.single("avatar"),
  async (req, res) => {
    const customers = await User.find({ roles: "user" });

    try {
      const user = await User.findOne({ username: req.body.username });

      if (!user) {
        if (req.file != undefined) {
          req.body.avatar = req.file.filename;
        } else {
          delete req.body.avatar;
        }

        await userService.createUser(req.body);
        res.redirect("/customer-management");
      } else {
        throw createError.NotFound("Username already exists!");
      }
    } catch (error) {
      let errors = "";

      if (req.file != undefined) {
        fs.unlinkSync(uriUploadImage + req.file.filename);
      }

      if (Array.isArray(error)) {
        errors = error[0].message;
      }
      error.message;
      res.render("customer-manager", {
        title: "Customer Manager",
        success: "",
        error: errors || error.message,
        type: "register",
        customers,
      });
    }
  },
);

/**
 * Update a customer
 */
router.get(
  "/customer-management/update/:id",
  authMiddleware.checkAdminRole,
  async (req, res) => {
    const customer = await userService.getUserById(req.params.id);
    res.render("update-customer", { title: "Customer Manager", customer });
  },
);

router.post(
  "/customer-management/update/:id",
  authMiddleware.checkAdminRole,
  upload.single("avatar"),
  async (req, res) => {
    const customer = await userService.getUserById(req.params.id);

    if (req.file != undefined) {
      req.body.avatar = req.file.filename;

      if (req.body.avatar != "default/user-default.png") {
        fs.unlinkSync(uriUploadImage + customer.avatar);
      }
    }

    if (req.body.passwordSwap != "") {
      req.body.password = req.body.passwordSwap;
      delete req.body.passwordSwap;
    }

    await userService.updateUserById(req.params.id, req.body);
    res.redirect("/customer-management");
  },
);

/**
 * Delete a customer
 */
router.post(
  "/customers/delete",
  authMiddleware.checkAdminRole,
  async (req, res) => {
    const customer = await userService.deleteUserById(req.body.userId);
    const avatar = customer.avatar;
    if (avatar != "default/user-default.png") {
      fs.unlinkSync(uriUploadImage + avatar);
    }
    res.status(200).json({ success: true });
  },
);

/**
 * Forbidden 403 Page
 */
router.get("/error/403", function (req, res) {
  res.render("forbidden", { title: "Forbidden" });
});

module.exports = router;
