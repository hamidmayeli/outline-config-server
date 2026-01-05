const authentication = (req, res, next) => {
    if (req.path === "/api/v1/auth/login" && req.method === "POST") {
            res.jsonp({
                id: 1,
                name: "John Doe",
                token: "the-token",
            });
    }
    else {
        next();
    }
};

const root = (req, res, next) => {
    if ((req.path === "/" || req.path === "") && req.method === "HEAD") {
        res.status(200).end();
    }
    else {
        authentication(req, res, next);
    }
};

module.exports = root;

