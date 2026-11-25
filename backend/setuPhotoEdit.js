const SOURCE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const OUTPUT_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
// Leave room for the rest of the JSON response within Vercel's 4.5 MB limit.
const MAX_OUTPUT_BASE64_LENGTH = 4_000_000;

async function editSetuPhoto({ apiKey, photo, request, instruction }) {
  if (!SOURCE_PHOTO_TYPES.has(photo.mime_type) || !/^[A-Za-z0-9+/]+={0,2}$/.test(photo.data)) {
    throw new Error('Unsupported source photo');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
      'Api-Revision': '2026-05-20',
    },
    body: JSON.stringify({
      model: 'gemini-nano-banana-2.1',
      store: false,
      input: [
        {
          type: 'text',
          text: [
            'Edit the attached source photo into one photorealistic after image of the exact same site.',
            'Preserve framing, camera position, perspective, scale, existing lighting, and the position of every untouched feature. Do not crop, zoom, restage, add labels, or draw an overlay.',
            'Make only the requested changes. For a finish or color change, follow the exact surface edges and preserve the geometry, hardware, highlights and shadows.',
            'For a new fixture or furniture, match the real surfaces and vanishing lines, and render plausible materials, occlusion, reflections and contact shadows.',
            'The latest customer request takes priority over design notes. Preserve everything outside the requested work.',
            `Customer request: ${request}`,
            `Design notes: ${instruction}`,
          ].join('\n'),
        },
        { type: 'image', ...photo },
      ],
      response_format: { type: 'image', mime_type: 'image/jpeg', image_size: '1K' },
    }),
    signal: AbortSignal.timeout(50_000),
  });

  if (!response.ok) {
    throw new Error(`Gemini image editing returned HTTP ${response.status}`);
  }

  const result = await response.json();
  const image = (result.steps || [])
    .filter((step) => step.type === 'model_output')
    .flatMap((step) => step.content || [])
    .findLast((part) => part.type === 'image' && OUTPUT_PHOTO_TYPES.has(part.mime_type) && part.data);

  if (
    !image || typeof image.data !== 'string' || image.data === photo.data ||
    image.data.length > MAX_OUTPUT_BASE64_LENGTH || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)
  ) {
    throw new Error('No usable edited photo returned');
  }

  return `data:${image.mime_type};base64,${image.data}`;
}

module.exports = { editSetuPhoto };
