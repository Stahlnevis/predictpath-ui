import asyncio
import subprocess
import os
import signal
from typing import List
from fastapi import FastAPI, WebSocket, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import glob
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Directory of Tools
TOOLS_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UPLOADS_DIR = os.path.join(TOOLS_ROOT, "Tool1", "data", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

class ToolRunRequest(BaseModel):
    tool_name: str
    command: str
    cwd: str

class ResetRequest(BaseModel):
    type: str  # "soft" or "hard"

@app.get("/")
def health_check():
    return {"status": "ok", "tools_root": TOOLS_ROOT}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOADS_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "path": f"data/uploads/{file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reset")
async def reset_system(request: ResetRequest):
    deleted_files = []
    
    artifacts = [
        {"path": os.path.join(TOOLS_ROOT, "Tool1", "data", "output"), "type": "dir"},
        {"path": os.path.join(TOOLS_ROOT, "Tool1", "data", "dlq"), "type": "dir"},
        {"path": os.path.join(TOOLS_ROOT, "Tool1", "ingestion_summary.json"), "type": "file"},
        {"path": os.path.join(TOOLS_ROOT, "Tool1", "status.json"), "type": "file"},
        {"path": os.path.join(TOOLS_ROOT, "Tool1", "ingestion_summary.json"), "type": "file"},
        # Tool 2
        {"path": os.path.join(TOOLS_ROOT, "Tool2", "path_report.json"), "type": "file"},
        # Tool 6 Report (Visuals)
        {"path": os.path.join(TOOLS_ROOT, "Tool6", "status.json"), "type": "file"},
        {"path": os.path.join(TOOLS_ROOT, "Tool3", "trajectory_forecast.json"), "type": "file"},
        {"path": os.path.join(TOOLS_ROOT, "Tool4", "response_plan.json"), "type": "file"},
        {"path": os.path.join(TOOLS_ROOT, "Tool5", "execution_report.json"), "type": "file"},
        {"path": os.path.join(TOOLS_ROOT, "Tool5", "execution_audit.log"), "type": "file"},
    ]
    
    if request.type == "hard":
        artifacts.append({"path": os.path.join(TOOLS_ROOT, "Tool6", "data", "governance.db"), "type": "file"})

    try:
        for artifact in artifacts:
            path = artifact["path"]
            if os.path.exists(path):
                if artifact["type"] == "file":
                    os.remove(path)
                    deleted_files.append(os.path.basename(path))
                elif artifact["type"] == "dir":
                    for item in os.listdir(path):
                        item_path = os.path.join(path, item)
                        if os.path.isfile(item_path):
                            os.remove(item_path)
                        elif os.path.isdir(item_path):
                            shutil.rmtree(item_path)
                    deleted_files.append(f"{os.path.basename(path)}/*")
                    
        return {"status": "success", "deleted": deleted_files, "mode": request.type}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")

@app.websocket("/ws/run")
async def websocket_run(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        tool_dir = data.get("tool_dir")
        command_str = data.get("command")
        
        cwd = os.path.join(TOOLS_ROOT, tool_dir)
        
        await websocket.send_text(f"> cd {tool_dir}\n")
        await websocket.send_text(f"> {command_str}\n")
        
        # FORCE UTF-8 ENCODING for Subprocess
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        # Also try to disable Rich legacy windows renderer if possible, or force color system
        # env["TERM"] = "xterm-256color" 
        
        process = await asyncio.create_subprocess_shell(
            command_str,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env
        )
        
        async def stream_output(stream):
            while True:
                line = await stream.readline()
                if not line:
                    break
                decoded = line.decode('utf-8', errors='replace')
                await websocket.send_text(decoded)

        await asyncio.gather(
            stream_output(process.stdout),
            stream_output(process.stderr)
        )
        await process.wait()
        await websocket.send_text(f"\n[Process exited with code {process.returncode}]")
        await websocket.close()
        
    except Exception as e:
        await websocket.send_text(f"\nError: {str(e)}")
        await websocket.close()

@app.get("/api/file")
def read_file(path: str):
    abs_path = os.path.abspath(os.path.join(TOOLS_ROOT, path))
    if not abs_path.startswith(TOOLS_ROOT):
        raise HTTPException(status_code=403, detail="Access denied")
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="File not found")
    with open(abs_path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
