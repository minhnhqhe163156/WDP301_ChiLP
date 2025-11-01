const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Tìm user theo email trước
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          // Nếu chưa có, tạo mới
          const displayName = profile.displayName || 'User';
          console.log('[Passport] Google profile displayName:', displayName);
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: displayName,
            picture_avatar: profile.photos[0].value,
            is_active: true,
            role: "customer",
          });
          console.log('[Passport] Created user with name:', user.name);
        } else {
          // Nếu đã có user, cập nhật googleId nếu chưa có
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          console.log('[Passport] Found existing user with name:', user.name);
        }
        return done(null, user);
      } catch (err) {
        console.error('[Passport] Error:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
