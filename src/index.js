import config from "./config/index.js";
import connectDB from "./config/database.js";
import { server } from "./app.js";
import "./workers/github.worker.js";

const PORT = config.port;

console.log("Connecting to:", config.mongodbUri);
connectDB()
    .then(() => {
        server.on("error", (error) => {
            console.error("SERVER ERROR: ", error);
            throw error;
        });

        server.listen(PORT, () => {
            console.log(`Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MONGO DB connection failed !!! ", err);
    });
