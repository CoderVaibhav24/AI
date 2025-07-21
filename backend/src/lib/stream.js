import {StreamChat} from 'stream-chat';
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if(!apiKey || !apiSecret) {
  console.error("Stream API or Secret key is missing.");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamClient = async (userData) => {
  try{
    await streamClient.upsertUser(userData);
    return userData;
  }catch(error){
    console.error("Error creating Stream client:", error);
  }
}

export const generateStreamToken = (userId) => {
  try {
    const token = streamClient.createToken(userId.toString());
    return token;
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
}