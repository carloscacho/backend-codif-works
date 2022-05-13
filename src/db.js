function createDB(mongoose) {
  var url = `mongodb+srv://root:${process.env["db_pass"]}@cluster0.ydfbb.mongodb.net/codif?retryWrites=true&w=majority`;
  mongoose.connect(url);
}

module.exports = { createDB };
