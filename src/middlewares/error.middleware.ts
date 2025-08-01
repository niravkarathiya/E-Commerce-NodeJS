const errorMiddleware = (err: any, req: any, res: any, next: any) => {
    const status = err.status || 500;
    const message = err.message || "BACKEND ERROR";
    const extraDetails = err.extraDetails || "Error from Backend";

    return res.status(status).json({ message, extraDetails });
};


export default errorMiddleware;