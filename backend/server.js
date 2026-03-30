const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 2000;

// Path to Angular build output
const ANGULAR_DIST_PATH = path.join(__dirname, "..", "dist", "simpleditorplugin");
const ANGULAR_INDEX = path.join(ANGULAR_DIST_PATH, "index.html");

// Use Angular app (set to true to serve Angular login component)
const isAngularBuilt = true;

console.log("Using Angular app");
console.log("Angular dist path:", ANGULAR_DIST_PATH);

// Proxy /ibase requests to WildFly server on port 9090
app.use('/ibase', createProxyMiddleware({
    target: 'http://localhost:9090',
    changeOrigin: true,
    pathRewrite: (path, req) => {
        // Express strips the mount path '/ibase', so we need to prepend it back
        return '/ibase' + path;
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} /ibase${req.url} -> http://localhost:9090/ibase${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('[Proxy] Error:', err.message);
        res.status(502).json({ error: 'Proxy error', message: err.message });
    }
}));

if (isAngularBuilt) {
    // Serve Angular app
    console.log("Serving Angular app from:", ANGULAR_DIST_PATH);

    // Serve static files from Angular build
    app.use(express.static(ANGULAR_DIST_PATH));

    // SPA routing - serve index.html for all non-file routes
    app.get('*', (req, res) => {
        res.sendFile(ANGULAR_INDEX);
    });
} else {
    // Fall back to standalone login page and legacy editor
    console.log("Angular app not built, serving standalone login from:", __dirname);

    // Path to frontend folder
    const FRONTEND_PATH = path.join(__dirname, "..", "frontend");

    // Serve static files from backend folder
    app.use(express.static(__dirname));

    // Serve static files from frontend folder
    app.use(express.static(FRONTEND_PATH));

    // Serve login page as default
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "login.html"));
    });

    // Explicit login route
    app.get("/login", (req, res) => {
        res.sendFile(path.join(__dirname, "login.html"));
    });

    // Editor route (legacy)
    app.get("/editor", (req, res) => {
        res.sendFile(path.join(FRONTEND_PATH, "simpleEditor.html"));
    });
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("API calls proxied via /ibase -> http://localhost:9090");
    if (!isAngularBuilt) {
        console.log("NOTE: Angular app not built. Using standalone login page.");
        console.log("      Run 'ng build' to use the Angular app instead.");
    }
});
