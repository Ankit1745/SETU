"""
SETU Dedicated ₹0 Free-Tier Unlimited In-Photo GPU Worker (Modal $30/mo Starter Free Compute)
----------------------------------------------------------------------------------------
Deploy once in ~2 minutes to run unlimited pixel-preserving FireRed-Image-Edit-1.1 edits
at zero cost within Modal's $30/month free Starter compute credits (scales to zero when idle):

  1. pip install modal && modal setup   (create free Modal account & set $30 hard spend limit)
  2. modal deploy scripts/free_modal_inphoto_worker.py
  3. Copy the printed HTTPS endpoint URL and set it as Vercel Environment Variable:
       CUSTOM_INPHOTO_EDIT_URL=<printed_url>
     Then redeploy SETU backend (`vercel --prod` or push).

Request JSON : { "imageBase64": "data:image/jpeg;base64,...", "editPrompt": "...", "seed": 42 }
Response JSON: { "success": true, "editedImageBase64": "data:image/png;base64,..." }
"""

import modal

app = modal.App("setu-inphoto-reality-worker")
weights_vol = modal.Volume.from_name("setu-firered-weights", create_if_missing=True)

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "libgl1", "libglib2.0-0")
    .run_commands(
        "git clone --depth=1 https://huggingface.co/spaces/prithivMLmods/FireRed-Image-Edit-1.0-Fast /opt/firered",
        "pip install --no-cache-dir -r /opt/firered/requirements.txt fastapi[standard] pillow",
    )
    .env({"HF_HOME": "/vol/hf_cache"})
)


@app.cls(
    image=image,
    gpu="A100",
    volumes={"/vol": weights_vol},
    scaledown_window=90,
    timeout=180,
)
class SetuInPhotoEditor:
    @modal.enter()
    def load_model(self):
        import sys
        import torch

        sys.path.insert(0, "/opt/firered")
        from qwenimage.pipeline_qwenimage_edit_plus import QwenImageEditPlusPipeline
        from qwenimage.transformer_qwenimage import QwenImageTransformer2DModel

        dtype = torch.bfloat16
        self.pipe = QwenImageEditPlusPipeline.from_pretrained(
            "FireRedTeam/FireRed-Image-Edit-1.1",
            transformer=QwenImageTransformer2DModel.from_pretrained(
                "prithivMLmods/Qwen-Image-Edit-Rapid-AIO-V19",
                torch_dtype=dtype,
                device_map="cuda",
            ),
            torch_dtype=dtype,
        ).to("cuda")
        weights_vol.commit()

    @modal.fastapi_endpoint(method="POST")
    def edit(self, body: dict):
        import base64
        import gc
        from io import BytesIO
        import torch
        from PIL import Image

        raw_uri = (body or {}).get("imageBase64", "")
        prompt = (body or {}).get("editPrompt", "").strip()
        seed = int((body or {}).get("seed") or 42)
        if not raw_uri or not prompt:
            return {"success": False, "error": "imageBase64 and editPrompt are required."}

        b64_part = raw_uri.split(",", 1)[1] if "," in raw_uri else raw_uri
        pil_in = Image.open(BytesIO(base64.b64decode(b64_part))).convert("RGB")

        # Preserve aspect ratio rounded to multiples of 16 up to 896px max edge
        max_side = 896
        w, h = pil_in.size
        scale = min(1.0, max_side / max(w, h))
        target_w = max(256, int((w * scale) // 16) * 16)
        target_h = max(256, int((h * scale) // 16) * 16)

        neg = (
            "worst quality, low quality, text, watermark, signature, blurry, "
            "distorted geometry, cartoon, extra furniture outside target area"
        )
        generator = torch.Generator(device="cuda").manual_seed(seed)

        try:
            out_img = self.pipe(
                image=[pil_in],
                prompt=prompt,
                negative_prompt=neg,
                height=target_h,
                width=target_w,
                num_inference_steps=4,
                generator=generator,
                true_cfg_scale=1.0,
            ).images[0]

            buf = BytesIO()
            out_img.save(buf, format="PNG")
            out_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
            return {
                "success": True,
                "editedImageBase64": f"data:image/png;base64,{out_b64}",
            }
        finally:
            gc.collect()
            torch.cuda.empty_cache()
