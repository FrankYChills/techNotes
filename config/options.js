const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) != -1 || !origin) {
      // localhost is undefined origin so we allow !origin to access
      callback(null, true);
    } else {
      callback(new Error("Not allowed for CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
