const fs = require("fs");
const path = require("path");

export default function handler(req, res) {
    const filePath = path.join(process.cwd(),
        "public", "next.svg"); // Path to your file
    // Filename for the downloaded file
    const fileName = "gfgNextJs.svg";

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    // Define a mapping of file extensions to content types
    const contentTypeMap = {
        svg: "image/svg+xml",
        ico: "image/x-icon",
        png: "image/png",
        jpg: "image/jpeg",
        pdf: "application/pdf",
        // Add more mappings as needed for other file types
    };

    // Get the file extension
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // Determine the content type based on the file extension
    const contentType =
        contentTypeMap[fileExtension] || "application/octet-stream";

    // Set headers to force download
    res.setHeader("Content-Disposition",
        `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", contentType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
}