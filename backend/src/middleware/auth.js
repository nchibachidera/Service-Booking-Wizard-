import jwt from "jsonwebtoken";


// Put this in front of any route that only the provider may use.
// It checks the "Authorization: Bearer <token>" header.
export function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "not signed in" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.providerId = payload.providerId;
        next();
    } catch {
        return res
        .status(401)
        .json({ error: "session expired, please sign in again "})
    }
}