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
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Threading;
using System.Diagnostics;

namespace MazeXInstaller
{
    public class CyberProgressBar : Control
    {
        private int _value = 0;
        private int _maximum = 100;
        private int _minimum = 0;

        public CyberProgressBar()
        {
            this.SetStyle(
                ControlStyles.UserPaint |
                ControlStyles.AllPaintingInWmPaint |
                ControlStyles.OptimizedDoubleBuffer |
                ControlStyles.ResizeRedraw, true);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            this.BackColor = Color.FromArgb(15, 23, 38);
        }

        public int Value
        {
            get { return _value; }
            set
            {
                int clamped = Math.Max(_minimum, Math.Min(_maximum, value));
                if (_value != clamped)
                {
                    _value = clamped;
                    this.Invalidate();
                }
            }
        }

        public int Maximum
        {
            get { return _maximum; }
            set { _maximum = Math.Max(1, value); this.Invalidate(); }
        }

        public int Minimum
        {
            get { return _minimum; }
            set { _minimum = value; this.Invalidate(); }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;

            int w = this.Width;
            int barHeight = 24;

            // 1. Draw Progress Bar Track
            Rectangle trackRect = new Rectangle(0, 0, w, barHeight);
            using (SolidBrush trackBg = new SolidBrush(Color.FromArgb(10, 16, 28)))
            {
                g.FillRectangle(trackBg, trackRect);
            }

            // 2. Draw Progress Bar Fill
            float range = _maximum - _minimum;
            float progress = range > 0 ? (float)(_value - _minimum) / range : 0f;
            int fillWidth = (int)((w - 2) * progress);

            if (fillWidth > 0)
            {
                Rectangle fillRect = new Rectangle(1, 1, fillWidth, barHeight - 2);
                using (LinearGradientBrush fillBrush = new LinearGradientBrush(
                    new Rectangle(0, 0, Math.Max(w, 10), barHeight),
                    Color.FromArgb(0, 204, 136),
                    Color.FromArgb(0, 255, 204),
                    LinearGradientMode.Horizontal))
                {
                    g.FillRectangle(fillBrush, fillRect);
                }

                // Glossy top highlight
                using (Pen sheenPen = new Pen(Color.FromArgb(90, 255, 255, 255), 1))
                {
                    g.DrawLine(sheenPen, 1, 1, fillWidth, 1);
                }
            }

            // 3. Draw Track Border
            using (Pen borderPen = new Pen(Color.FromArgb(30, 48, 77), 1))
            {
                g.DrawRectangle(borderPen, 0, 0, w - 1, barHeight - 1);
            }

            // 4. Center text inside the green loading bar (e.g. "50%")
            string pctText = _value + "%";
            using (GraphicsPath path = new GraphicsPath())
            {
                StringFormat sf = new StringFormat();
                sf.Alignment = StringAlignment.Center;
                sf.LineAlignment = StringAlignment.Center;
                RectangleF textRect = new RectangleF(0, 0, w, barHeight);
                path.AddString(pctText, this.Font.FontFamily, (int)FontStyle.Bold, 12f, textRect, sf);

                using (Pen outlinePen = new Pen(Color.FromArgb(220, 10, 15, 24), 2.5f))
                {
                    outlinePen.LineJoin = LineJoin.Round;
                    g.DrawPath(outlinePen, path);
                }
                using (SolidBrush textBrush = new SolidBrush(Color.White))
                {
                    g.FillPath(textBrush, path);
                }
            }

            // 5. Draw Scale Ruler & Numbers below the bar: 0%, 25%, 50%, 75%, 100%
            int scaleTop = barHeight + 4;
            using (Pen guidePen = new Pen(Color.FromArgb(28, 42, 65), 1))
            {
                g.DrawLine(guidePen, 0, scaleTop, w - 1, scaleTop);
            }

            // Minor ticks at each 10%
            for (int i = 10; i < 100; i += 10)
            {
                if (i % 25 == 0) continue;
                float fx = (w - 1) * (i / 100f);
                bool r = _value >= i;
                using (Pen minTick = new Pen(r ? Color.FromArgb(0, 204, 150) : Color.FromArgb(45, 60, 85), 1))
                {
                    g.DrawLine(minTick, fx, scaleTop, fx, scaleTop + 2.5f);
                }
            }

            // Major ticks and milestone labels
            int[] milestones = new int[] { 0, 25, 50, 75, 100 };
            using (Font scaleFont = new Font("Segoe UI", 7.5f, FontStyle.Bold))
            {
                foreach (int m in milestones)
                {
                    float factor = m / 100f;
                    float tickX = (w - 1) * factor;
                    bool reached = _value >= m;

                    Color tickColor = reached ? Color.FromArgb(0, 255, 204) : Color.FromArgb(71, 85, 105);
                    Color textColor = reached ? Color.FromArgb(0, 255, 204) : Color.FromArgb(100, 116, 139);

                    using (Pen tickPen = new Pen(tickColor, 1.5f))
                    {
                        g.DrawLine(tickPen, tickX, scaleTop, tickX, scaleTop + 5);
                    }

                    string label = m + "%";
                    SizeF lSize = g.MeasureString(label, scaleFont);
                    float lx;
                    if (m == 0)
                        lx = 0;
                    else if (m == 100)
                        lx = w - lSize.Width;
                    else
                        lx = tickX - (lSize.Width / 2f);

                    float ly = scaleTop + 7;

                    using (SolidBrush textBrush = new SolidBrush(textColor))
                    {
                        g.DrawString(label, scaleFont, textBrush, lx, ly);
                    }
                }
            }
        }
    }

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
        private CyberProgressBar progressBar;
        private Label lblTitle;
        private Label lblSubtitle;
        private Label lblStatus;
        private Label lblPercent;
        private Label lblFooter;
        private Panel cardPanel;

        public InstallerForm()
        {
            this.Text = "MazeX Setup & Launcher";
            this.ClientSize = new Size(540, 290);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(10, 15, 24);
            this.ForeColor = Color.White;

            cardPanel = new Panel();
            cardPanel.Location = new Point(20, 20);
            cardPanel.Size = new Size(500, 250);
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
            lblStatus.Location = new Point(22, 88);
            lblStatus.Size = new Size(390, 20);
            cardPanel.Controls.Add(lblStatus);

            lblPercent = new Label();
            lblPercent.Text = "0%";
            lblPercent.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            lblPercent.ForeColor = Color.FromArgb(0, 255, 204);
            lblPercent.Location = new Point(415, 87);
            lblPercent.Size = new Size(63, 20);
            lblPercent.TextAlign = ContentAlignment.TopRight;
            cardPanel.Controls.Add(lblPercent);

            progressBar = new CyberProgressBar();
            progressBar.Location = new Point(22, 114);
            progressBar.Size = new Size(456, 52);
            progressBar.Value = 0;
            cardPanel.Controls.Add(progressBar);

            lblFooter = new Label();
            lblFooter.Text = "Installs automatically to local user profile with desktop shortcut. No admin required.";
            lblFooter.Font = new Font("Segoe UI", 8, FontStyle.Regular);
            lblFooter.ForeColor = Color.FromArgb(148, 163, 184);
            lblFooter.Location = new Point(22, 185);
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
            if (percent >= 0 && percent <= 100)
            {
                progressBar.Value = percent;
                lblPercent.Text = percent + "%";
            }
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
