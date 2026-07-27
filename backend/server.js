require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Helper to safely extract a numeric cognitive load score
function getLoadValue(load) {
  if (typeof load === 'number') return load;
  if (typeof load === 'object' && load !== null) {
    return load.hesitation || load.score || load.clicks || 0;
  }
  return 0;
}

// Generates valid React TSX code
function createGeneratedCode(prompt, loadRaw) {
  const loadVal = getLoadValue(loadRaw);
  
  return `export default function GeneratedComponent() {
  return (
    <div className="p-6 bg-slate-900/90 border border-cyan-500/40 rounded-xl text-white shadow-2xl space-y-3">
      <div className="flex items-center gap-3">
        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded">
          AI Generation Active
        </span>
        <h2 className="text-xl font-bold text-cyan-300">
          ${prompt || 'Adaptive Dashboard Component'}
        </h2>
      </div>
      <p className="text-slate-300 text-sm">
        Live Cognitive Load Index: <strong className="text-cyan-400">${loadVal}%</strong>
      </p>
      <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs font-mono text-emerald-400">
        ✓ Live Dynamic Component Loaded Successfully!
      </div>
    </div>
  );
}`;
}

app.get('/', (req, res) => {
  res.send('🚀 AuraGen Backend Server is Active!');
});

app.post('/api/generate', (req, res) => {
  const { prompt, cognitiveLoad } = req.body;
  res.json({
    success: true,
    componentType: 'GeneratedComponent',
    code: createGeneratedCode(prompt, cognitiveLoad),
    data: { title: prompt || 'Adaptive View' },
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log(`⚡ Connected: ${socket.id}`);

  socket.on('telemetry', () => {});
  socket.on('telemetry_update', () => {});

  const handleGeneration = (data) => {
    const userPrompt = data?.prompt || 'Adaptive View';
    const rawLoad = data?.cognitiveLoad;
    console.log(`🧠 Generating code for: "${userPrompt}"`);

    const code = createGeneratedCode(userPrompt, rawLoad);
    const payload = {
      success: true,
      result: {
        componentType: 'GeneratedComponent',
        code: code,
        data: { title: userPrompt },
      },
      code: code,
      componentType: 'GeneratedComponent',
    };

    // Broadcast across events expected by AuraContext & TelemetryContext
    socket.emit('ai_generate_response', payload);
    socket.emit('ui_generated', payload);
    socket.emit('generate_aura_code_response', payload);
  };

  socket.on('ai_generate_request', handleGeneration);
  socket.on('generate_ui', handleGeneration);

  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 AuraGen Backend running on http://localhost:${PORT}`);
});