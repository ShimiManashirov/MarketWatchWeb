import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import User, { IUser } from '../models/user_model';
import mongoose from 'mongoose';

export const setupPassport = (): void => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        // Google OAuth Strategy
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
                },
                async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
                    try {
                        // Check if user already exists
                        let user = await User.findOne({ email: profile.emails?.[0].value });

                        if (user) {
                            // User exists, return it
                            return done(null, user as any);
                        }

                        // Create new user
                        user = await User.create({
                            email: profile.emails?.[0].value,
                            username: profile.displayName || profile.emails?.[0].value.split('@')[0],
                            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random password for OAuth users
                            image: profile.photos?.[0].value || ''
                        });

                        done(null, user as any);
                    } catch (error) {
                        done(error as Error, undefined);
                    }
                }
            )
        );
    }

    /*
    // Facebook OAuth Strategy
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID || '',
                clientSecret: process.env.FACEBOOK_APP_SECRET || '',
                callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
                profileFields: ['id', 'displayName', 'photos', 'email']
            },
            async (accessToken: string, refreshToken: string, profile: FacebookProfile, done: any) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ email: profile.emails?.[0].value });

                    if (user) {
                        // User exists, return it
                        return done(null, user as any);
                    }

                    // Create new user
                    user = await User.create({
                        email: profile.emails?.[0].value || `${profile.id}@facebook.com`,
                        username: profile.displayName || `facebook_${profile.id}`,
                        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
                        image: profile.photos?.[0].value || ''
                    });

                    done(null, user as any);
                } catch (error) {
                    done(error as Error, undefined);
                }
            }
        )
    );
    */

    // Serialize user for session
    passport.serializeUser((user: any, done) => {
        done(null, user._id.toString());
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await User.findById(id);
            done(null, user as any);
        } catch (error) {
            done(error, null);
        }
    });
};
