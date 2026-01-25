"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const userRoutesModule = __importStar(require("./routes/user_routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // Parses incoming requests with JSON payloads
app.use(express_1.default.urlencoded({ extended: true }));
// Static folder for uploaded files (Images)
app.use('/uploads', express_1.default.static('src/uploads'));
// Routes
app.use('/auth', auth_routes_1.default);
const userRoutes = userRoutesModule.default;
app.use('/user', userRoutes);
const post_routes_1 = __importDefault(require("./routes/post_routes"));
app.use('/posts', post_routes_1.default);
const comment_routes_1 = __importDefault(require("./routes/comment_routes"));
app.use('/', comment_routes_1.default);
// DB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_db';
if (process.env.NODE_ENV !== 'test') {
    mongoose_1.default.connect(mongoUrl)
        .then(() => console.log('Connected to Local MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}
exports.default = app;
//# sourceMappingURL=app.js.map