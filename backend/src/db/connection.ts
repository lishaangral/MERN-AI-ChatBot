import { connect, disconnect } from 'mongoose';

async function connectToDatabase() {
    try {
        const uri = process.env.MONGODB_URL;
        if (!uri) throw new Error("MONGODB_URL not defined in environment");
        await connect(uri);
    } catch (error) {
        console.log(error);
        throw new Error("Cannot Connect to MonogoDB");
    }
}

async function disconnectFromDatabase() {
    try {
        await disconnect();
    } catch (error) {
        console.log(error);
        throw new Error("Cannot Disconnect from MonogoDB");
    }
}

export { connectToDatabase, disconnectFromDatabase };