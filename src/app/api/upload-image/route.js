

export async function POST(request) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return Response.json(
        { success: false, message: "ImgBB API key is missing." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return Response.json(
        { success: false, message: "Please select an image." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { success: false, message: "Only JPG, PNG and WEBP are allowed." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { success: false, message: "Image must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const uploadData = new FormData();

    uploadData.append(
      "image",
      Buffer.from(await file.arrayBuffer()).toString("base64")
    );

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadData,
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return Response.json(
        {
          success: false,
          message: result.error?.message || "Image upload failed.",
        },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      imageUrl: result.data.display_url,
    });
  } catch (error) {
    console.error("ImgBB upload error:", error);

    return Response.json(
      { success: false, message: "Unable to upload image." },
      { status: 500 }
    );
  }
}
