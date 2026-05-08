const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

const userDataPath = app.getPath('userData')
const tasksFile = path.join(userDataPath, 'tasks.json')
const settingsFile = path.join(userDataPath, 'settings.json')

// Helper function to read/write JSON files safely
function readJSONFile(filePath, defaultData) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
  }
  return defaultData
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    return false
  }
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Open the DevTools for development
  // mainWindow.webContents.openDevTools()
  
  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  const { Menu } = require('electron');
  Menu.setApplicationMenu(null);
  
  // IPC Handlers
  ipcMain.handle('get-tasks', () => readJSONFile(tasksFile, []))
  ipcMain.handle('save-tasks', (event, tasks) => writeJSONFile(tasksFile, tasks))
  
  ipcMain.handle('get-settings', () => readJSONFile(settingsFile, { apiKey: '', baseUrl: '' }))
  ipcMain.handle('save-settings', (event, settings) => writeJSONFile(settingsFile, settings))

  // Basic API bridge for AI fetch (to bypass CORS and secure the API Key)
  ipcMain.handle('fetch-ai', async (event, prompt) => {
    const settings = readJSONFile(settingsFile, { apiKey: '', baseUrl: '' })
    if (!settings.apiKey) {
      return { error: 'API Key is missing. Please configure it in settings.' }
    }

    try {
      // Logic: uses the provided Base URL. If it fits common API patterns (like containing 'googleapis'), 
      // handle as structured AI request. Defaults to generic OpenAI-compatible logic otherwise.
      const aiEndpoint = settings.baseUrl;
      
      const isGemini = aiEndpoint && aiEndpoint.includes('googleapis.com');
      
      let payload;
      let headers = { 'Content-Type': 'application/json' };
      let url = isGemini ? `${aiEndpoint}?key=${settings.apiKey}` : aiEndpoint;
      
      if (!url) {
        return { error: 'API 地址未配置。请在设置中填写 Base URL。' };
      }

      if (isGemini) {
        payload = {
          contents: [{ parts: [{ text: prompt }] }]
        };
      } else {
        // OpenAI-compatible
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
        const modelName = settings.model || 'gpt-3.5-turbo'
        payload = {
          model: modelName,
          messages: [{ role: 'user', content: prompt }]
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { error: `API Error ${response.status}: ${errorText}` }
      }

      const data = await response.json()
      
      // Debug: log the full raw response structure
      console.log('[CoPlan AI] Raw response:', JSON.stringify(data, null, 2));

      // Defensive: handle empty/blocked Gemini responses
      if (isGemini) {
        const candidates = data.candidates;
        if (!candidates || candidates.length === 0) {
          const reason = data.promptFeedback?.blockReason || 'No candidates returned';
          return { error: `Gemini blocked the request: ${reason}` };
        }
        const cand = candidates[0];
        if (!cand || !cand.content || !cand.content.parts || cand.content.parts.length === 0) {
          const reason = cand?.finishReason || 'Empty content';
          return { error: `Gemini returned no content (finishReason: ${reason})` };
        }
        return { result: cand.content.parts[0].text };
      } else {
        // OpenAI-compatible endpoint
        try {
          const choices = data.choices;
          if (!choices || choices.length === 0) {
            return { error: `API returned no choices. Raw keys: ${Object.keys(data).join(', ')}` };
          }
          const msg = choices[0]?.message;
          if (!msg) {
            return { error: `choices[0].message is missing. choices[0] = ${JSON.stringify(choices[0])}` };
          }
          return { result: msg.content };
        } catch (parseErr) {
          return { error: `Response parse error: ${parseErr.message}. Raw response keys: ${Object.keys(data || {}).join(', ')}` };
        }
      }
    } catch (e) {
      console.error('Fetch AI Error:', e)
      return { error: e.message }
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
