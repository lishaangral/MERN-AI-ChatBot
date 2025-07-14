import { connect, disconnect } from 'mongoose';

export default async function connectToDatabase() {
    try {
        await connect(process.env.MONGODB_URL);
    } catch (error) {
        console.log(error);
        throw new error("Cannot Connect to MonogoDB");
    }
}

async function disconnectFromDatabase() {
    try {
        await disconnect();
    } catch (error) {
        console.log(error);
        throw new error("Cannot Disconnect from MonogoDB");
    }
}

export { connectToDatabase, disconnectFromDatabase };