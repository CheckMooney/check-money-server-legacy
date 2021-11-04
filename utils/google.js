
const {OAuth2Client} = require('google-auth-library');
const CLIENT_IDS = [
  process.env.CLIENT_ID1,
  process.env.CLIENT_ID2,
  process.env.CLIENT_ID3
]
const client = new OAuth2Client(CLIENT_IDS);

exports.verify = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        // audience: CLIENT_IDS,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return payload;
}
