const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

async function connectDB() {
  try {
    const connect = await mongoose.connect(DB);
    console.log(`Database connected: ${connect.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
}
connectDB();

console.log(process.env.NODE_ENV);
console.log(process.env.DATABASE);
console.log(mongoose.Connection.name);

app.listen(process.env.PORT || 3000, () => {
  console.log(`App running on port ${process.env.PORT || 3000}...`);
});
