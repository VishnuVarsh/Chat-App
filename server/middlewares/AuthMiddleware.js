import jwt from "jsonwebtoken";

export const verifyToken = (request, response, next) => {
    
    const token = request.cookies?.jwt; // Safely access cookies using optional chaining
   
    if (!token) {
        return response.status(401).send("You are not authenticated!"); // Missing token
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            return response.status(403).send("Token not valid!"); // Invalid token
        }

        // Attach user ID from payload to the request object for further use
        request.userId = payload.userId;
        next(); // Proceed to the next middleware
    });
};
