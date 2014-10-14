module.exports = {
  context: __dirname + "/www/cdvah",
  entry: {
    cca: [
        "../../src/cca.js",
      ],
  },
  output: {
    // Make sure to use [name] or [id] in output.filename
    //  when using multiple entry points
    path: __dirname + "/www/cdvah/generated",

    filename: "[name].bundle.js",
    chunkFilename: "[id].bundle.js",

    library: "[name]",
    libraryTarget: "umd",
  }
};
