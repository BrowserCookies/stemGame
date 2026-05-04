import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import requestIp from "request-ip";

function SaveUser(req, res) {
  const userData = JSON.parse(atob(req.query.userData));

  try {
    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    const authStringOrigin = `${userData.username}@${hashedPassword}`;
    const authString = bcrypt.hashSync(authStringOrigin, 10);
    const base64authString = btoa(authString);

    const colorsArr = [
      "#ff9800",
      "#4caf50",
      "#2196f3",
      "#9c27b0",
      "#f44336",
      "#3f51b5",
    ];

    const user = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      authString: authString,
      ip_encrypted: bcrypt.hashSync(requestIp.getClientIp(req), 10),
      color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
    });

    user.save().then((response) => {
      res.send({
        payload: true,
        authString: base64authString,
      });
    });
  } catch (error) {
    console.error("Something went wrong:", error);
    res.status(500).send("Internal Server Error");
  }
}

export default SaveUser;
