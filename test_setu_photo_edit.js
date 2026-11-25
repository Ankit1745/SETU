const { mock, test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

process.env.VERCEL = '1';
process.env.GEMINI_API_KEY = 'mock-key';
mock.method(require('./backend/db'), 'connectDB', async () => false);
const app = require('./backend/server');

const sourcePhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGMoDnMCAAJLAQz7p0MRAAAAAElFTkSuQmCC';
const editedPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGMo7ykAAALxAXTop/PUAAAAAElFTkSuQmCC';
const customerRequest = 'Change just the lower kitchen cabinet doors to matte sage green. Keep the sink in place.';
const instruction = 'Recolor the lower cabinet door surfaces to matte sage green while retaining their handles.';

test('SETU returns an edited photo only when Gemini supplies a real image result', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const localFetch = globalThis.fetch;

  async function sendChat({ photo = sourcePhoto, editRequested = true, enabled = true, editResponse }) {
    let requestToEditor;
    process.env.ENABLE_PAID_NANO_BANANA = String(enabled);
    const upstream = t.mock.method(globalThis, 'fetch', async (url, options) => {
      const body = JSON.parse(options.body);
      if (url.endsWith(':generateContent?key=mock-key')) {
        return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({
          intentMode: 'build_design',
          replyText: 'I suggest matte sage green on the lower cabinet doors.',
          visualPreviewReady: editRequested,
          photoEditInstruction: instruction,
          quotation: { includeQuotation: true, grandTotal: 6450 },
        }) }] } }] });
      }
      assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/interactions');
      requestToEditor = body;
      return editResponse;
    });
    try {
      const response = await localFetch(`http://127.0.0.1:${server.address().port}/api/ai/setu-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: customerRequest }],
          imageBase64: photo,
        }),
      });
      assert.equal(response.status, 200);
      const { data } = await response.json();
      assert.equal(data.quotation.grandTotal, 6450);
      return { data, requestToEditor };
    } finally {
      upstream.mock.restore();
    }
  }

  const success = await sendChat({ editResponse: Response.json({
    steps: [
      { type: 'model_output', content: [{ type: 'text', text: 'Edited' }] },
      { type: 'model_output', content: [{
        type: 'image',
        mime_type: 'image/png',
        data: editedPhoto.split(',')[1],
      }] },
    ],
  }) });
  assert.equal(success.data.visualPreviewReady, true);
  assert.equal(success.data.editedImageBase64, editedPhoto);
  assert.equal(success.requestToEditor.input[1].data, sourcePhoto.split(',')[1]);
  assert.match(success.requestToEditor.input[0].text, /Keep the sink in place/);
  assert.ok(success.requestToEditor.input[0].text.includes(instruction));
  assert.equal(success.requestToEditor.store, false);

  const cases = [
    { input: { enabled: false }, status: 'disabled', editorCalled: false },
    { input: { photo: '' }, status: 'needs_photo', editorCalled: false },
    { input: { editRequested: false }, status: undefined, editorCalled: false },
    {
      input: { editResponse: Response.json({
        steps: [{ type: 'model_output', content: [{
          type: 'image',
          mime_type: 'image/png',
          data: sourcePhoto.split(',')[1],
        }] }],
      }) },
      status: 'failed',
      editorCalled: true,
    },
    { input: { editResponse: Response.json({ steps: [] }) }, status: 'failed', editorCalled: true },
    { input: { editResponse: new Response(null, { status: 429 }) }, status: 'failed', editorCalled: true },
  ];
  for (const { input, status, editorCalled } of cases) {
    const { data, requestToEditor } = await sendChat(input);
    assert.equal(Boolean(requestToEditor), editorCalled);
    assert.equal(data.photoEditStatus, status);
    assert.equal(data.visualPreviewReady, false);
    assert.equal(data.editedImageBase64, null);
  }
});
