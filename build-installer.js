const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

console.log('--- MazeX Unified Build & Packaging Pipeline ---');

// 1. Pack app.asar
console.log('[1/3] Packaging app.asar...');
function buildAsar(srcFiles, outAsar) {
    const buffers = [];
    let currentOffset = 0;
    const dirTree = { files: {} };

    for (const rel of srcFiles) {
        if (!fs.existsSync(rel)) continue;
        const data = fs.readFileSync(rel);
        const size = data.length;
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        
        const parts = rel.replace(/\\/g, '/').split('/');
        let cur = dirTree;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!cur.files[parts[i]]) cur.files[parts[i]] = { files: {} };
            cur = cur.files[parts[i]];
        }
        const fileName = parts[parts.length - 1];
        cur.files[fileName] = {
            size: size,
            offset: currentOffset.toString(),
            integrity: {
                algorithm: 'SHA256',
                hash: hash,
                blockSize: 4194304,
                blocks: [hash]
            }
        };
        buffers.push(data);
        currentOffset += size;
    }

    const headerJson = JSON.stringify(dirTree);
    const jsonLen = Buffer.byteLength(headerJson, 'utf8');
    const padding = (4 - (jsonLen % 4)) % 4;

    const prefixBuf = Buffer.alloc(16);
    prefixBuf.writeUInt32LE(4, 0);
    prefixBuf.writeUInt32LE(jsonLen + padding + 8, 4);
    prefixBuf.writeUInt32LE(jsonLen + padding + 4, 8);
    prefixBuf.writeUInt32LE(jsonLen, 12);

    const headerBuf = Buffer.from(headerJson, 'utf8');
    const paddingBuf = Buffer.alloc(padding);

    const fullArchive = Buffer.concat([prefixBuf, headerBuf, paddingBuf, ...buffers]);
    fs.writeFileSync(outAsar, fullArchive);
}

const fileList = [
    '.gitignore', 'LICENSE', 'README.md',
    'game.js', 'index.html', 'main.js',
    'package.json', 'server.js', 'style.css',
    'mazex/audio.js', 'mazex/enemies.js', 'mazex/game.js',
    'mazex/index.html', 'mazex/levels.js', 'mazex/maze.js',
    'mazex/player.js', 'mazex/powerups.js', 'mazex/style.css', 'mazex/ui.js'
];

buildAsar(fileList, path.join('dist', 'MazeX-win32-x64', 'resources', 'app.asar'));
console.log('✓ app.asar updated successfully.');

// 2. Pack MazeX-Windows.zip
console.log('[2/3] Compressing portable MazeX-Windows.zip...');
if (fs.existsSync('MazeX-Windows.zip')) fs.unlinkSync('MazeX-Windows.zip');
execSync('tar -a -cf MazeX-Windows.zip -C "dist/MazeX-win32-x64" .');
console.log('✓ MazeX-Windows.zip compressed successfully.');

// 3. Compile MazeX-Setup.exe
console.log('[3/3] Compiling single-file MazeX-Setup.exe installer...');
const installerSource = `
using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;
using System.Drawing;
using System.Threading;
using System.Diagnostics;

namespace MazeXInstaller
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new InstallerForm());
        }
    }

    public class InstallerForm : Form
    {
        private ProgressBar progressBar;
        private Label lblTitle;
        private Label lblSubtitle;
        private Label lblStatus;
        private Label lblFooter;
        private Panel cardPanel;

        public InstallerForm()
        {
            this.Text = "MazeX Setup & Launcher";
            this.ClientSize = new Size(540, 270);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(10, 15, 24);
            this.ForeColor = Color.White;

            cardPanel = new Panel();
            cardPanel.Location = new Point(20, 20);
            cardPanel.Size = new Size(500, 230);
            cardPanel.BackColor = Color.FromArgb(15, 23, 38);
            this.Controls.Add(cardPanel);

            lblTitle = new Label();
            lblTitle.Text = "MAZEX: CYBER ESCAPE";
            lblTitle.Font = new Font("Segoe UI", 15, FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(0, 255, 204);
            lblTitle.Location = new Point(20, 18);
            lblTitle.AutoSize = true;
            cardPanel.Controls.Add(lblTitle);

            lblSubtitle = new Label();
            lblSubtitle.Text = "Escape. Outsmart. Survive.  |  Designed by Lobhas Kulkarni";
            lblSubtitle.Font = new Font("Segoe UI", 9, FontStyle.Regular);
            lblSubtitle.ForeColor = Color.FromArgb(148, 163, 184);
            lblSubtitle.Location = new Point(22, 50);
            lblSubtitle.AutoSize = true;
            cardPanel.Controls.Add(lblSubtitle);

            lblStatus = new Label();
            lblStatus.Text = "Preparing installation package...";
            lblStatus.Font = new Font("Segoe UI", 9, FontStyle.Regular);
            lblStatus.ForeColor = Color.FromArgb(226, 232, 240);
            lblStatus.Location = new Point(22, 95);
            lblStatus.Size = new Size(456, 20);
            cardPanel.Controls.Add(lblStatus);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(22, 122);
            progressBar.Size = new Size(456, 24);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Minimum = 0;
            progressBar.Maximum = 100;
            progressBar.Value = 0;
            cardPanel.Controls.Add(progressBar);

            lblFooter = new Label();
            lblFooter.Text = "Installs automatically to local user profile with desktop shortcut. No admin required.";
            lblFooter.Font = new Font("Segoe UI", 8, FontStyle.Regular);
            lblFooter.ForeColor = Color.FromArgb(100, 116, 139);
            lblFooter.Location = new Point(22, 165);
            lblFooter.Size = new Size(456, 20);
            cardPanel.Controls.Add(lblFooter);

            this.Shown += (s, e) =>
            {
                Thread worker = new Thread(InstallWorker);
                worker.IsBackground = true;
                worker.Start();
            };
        }

        private void UpdateProgress(int percent, string status)
        {
            if (this.InvokeRequired)
            {
                this.BeginInvoke(new Action<int, string>(UpdateProgress), percent, status);
                return;
            }
            if (percent >= 0 && percent <= 100) progressBar.Value = percent;
            if (!string.IsNullOrEmpty(status)) lblStatus.Text = status;
        }

        private void InstallWorker()
        {
            try
            {
                Thread.Sleep(300);
                string installDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MazeX");

                UpdateProgress(5, "Closing any previous running instances...");
                foreach (var p in Process.GetProcessesByName("MazeX"))
                {
                    try { p.Kill(); p.WaitForExit(2000); } catch {}
                }

                UpdateProgress(10, "Extracting game engine and libraries (ffmpeg.dll, directx)...");
                Directory.CreateDirectory(installDir);

                var asm = Assembly.GetExecutingAssembly();
                using (var stream = asm.GetManifestResourceStream("GameData"))
                {
                    if (stream == null)
                    {
                        MessageBox.Show("Game data resource not found.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return;
                    }

                    using (var archive = new ZipArchive(stream, ZipArchiveMode.Read))
                    {
                        int total = archive.Entries.Count;
                        int current = 0;

                        foreach (var entry in archive.Entries)
                        {
                            current++;
                            string destPath = Path.GetFullPath(Path.Combine(installDir, entry.FullName));
                            if (!destPath.StartsWith(installDir, StringComparison.OrdinalIgnoreCase)) continue;

                            if (string.IsNullOrEmpty(entry.Name))
                            {
                                Directory.CreateDirectory(destPath);
                            }
                            else
                            {
                                Directory.CreateDirectory(Path.GetDirectoryName(destPath));
                                entry.ExtractToFile(destPath, true);
                            }

                            int pct = 10 + (int)((float)current / total * 75);
                            if (current % 5 == 0 || current == total)
                            {
                                UpdateProgress(pct, "Extracting: " + entry.Name);
                            }
                        }
                    }
                }

                UpdateProgress(90, "Creating Desktop and Start Menu shortcuts...");
                try
                {
                    Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                    if (shellType != null)
                    {
                        dynamic shell = Activator.CreateInstance(shellType);
                        string exePath = Path.Combine(installDir, "MazeX.exe");

                        string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                        string desktopShortcut = Path.Combine(desktop, "MazeX.lnk");
                        dynamic scDesktop = shell.CreateShortcut(desktopShortcut);
                        scDesktop.TargetPath = exePath;
                        scDesktop.WorkingDirectory = installDir;
                        scDesktop.Description = "MazeX: Cyber Escape by Lobhas Kulkarni";
                        scDesktop.IconLocation = exePath + ",0";
                        scDesktop.Save();

                        string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                        string startShortcut = Path.Combine(startMenu, "MazeX.lnk");
                        dynamic scStart = shell.CreateShortcut(startShortcut);
                        scStart.TargetPath = exePath;
                        scStart.WorkingDirectory = installDir;
                        scStart.Description = "MazeX: Cyber Escape by Lobhas Kulkarni";
                        scStart.IconLocation = exePath + ",0";
                        scStart.Save();
                    }
                }
                catch {}

                UpdateProgress(100, "Installation complete! Launching MazeX...");
                Thread.Sleep(600);

                string runExe = Path.Combine(installDir, "MazeX.exe");
                if (File.Exists(runExe))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = runExe,
                        WorkingDirectory = installDir
                    });
                }

                this.BeginInvoke(new Action(() => this.Close()));
            }
            catch (Exception ex)
            {
                MessageBox.Show("Installation encountered an issue: " + ex.Message, "MazeX Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
                this.BeginInvoke(new Action(() => this.Close()));
            }
        }
    }
}
`;

fs.writeFileSync('installer_tmp.cs', installerSource);
const cscPath = 'C:\\\\Windows\\\\Microsoft.NET\\\\Framework64\\\\v4.0.30319\\\\csc.exe';
const cscCmd = `"${cscPath}" /target:winexe /win32icon:app.ico /out:MazeX-Setup.exe /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll /r:Microsoft.CSharp.dll /resource:MazeX-Windows.zip,GameData installer_tmp.cs`;
execSync(cscCmd);
fs.unlinkSync('installer_tmp.cs');
console.log('✓ MazeX-Setup.exe built successfully.');
