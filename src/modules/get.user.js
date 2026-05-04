import User from "../models/User.model.js";
import redis from "../clients/redis.js";

function GetUser(req, res) {
  const authString = req.query.auth;

  redis.get(`user:${authString}`).then((cachedUser) => {
    if (cachedUser) {
        console.log("Cache hit for user: ", cachedUser);
      redis.incr("hit");
      res.send(cachedUser);
    } else {
      User.find({ authString: authString })
        .then((user) => {
          if (user.length > 0) {
            redis.set(`user:${authString}`, JSON.stringify(user[0]), {
              ex: 3600, // Expire in 1 hour
            }); // Cache for 1 hour
            redis.incr("miss");
            res.send(user[0]);
          } else {
            res.status(404).send("User not found");
          }
        })
        .catch((err) => {
          res.status(500).send("Internal server error");
        });
    }
  });
}

export default GetUser;
