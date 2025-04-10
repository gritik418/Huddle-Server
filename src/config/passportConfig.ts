import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../constants/keys.js";
import User from "../models/User.js";
import { generateUniqueUsername } from "../utils/generateUsername.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      if (profile._json?.email_verified === false) {
        return cb(new Error("Email not verified"));
      }

      const email = profile.emails?.[0]?.value || "";

      const user: User | null = await User.findOne({
        email,
      });

      if (user && user.isVerified) {
        return cb(null, user);
      }

      const firstName = profile.name?.givenName || "";
      const lastName = profile.name?.familyName || "";
      const avatar = profile.photos?.[0]?.value || "";

      const username = await generateUniqueUsername(firstName, lastName);

      const newUser = new User({
        firstName,
        lastName,
        username,
        email,
        profilePicture: avatar,
        isVerified: true,
        provider: "google",
      });

      const savedUser = await newUser.save();

      return cb(null, savedUser);
    }
  )
);
