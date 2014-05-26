module.exports = {
  context: __dirname + "/www",
  entry: {
    cca: [
        "./cca_modules/cca.js",
      ],
  },
  output: {
    // Make sure to use [name] or [id] in output.filename
    //  when using multiple entry points
    path: __dirname + "/www/dist",

    filename: "[name].bundle.js",
    chunkFilename: "[id].bundle.js",

    library: "[name]",
    libraryTarget: "umd",
  }
};
