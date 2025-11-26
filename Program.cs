using System;
using System.IO;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace VoxelChristmas
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }

    public class MainForm : Form
    {
        private WebView2 webView;
        private Label loadingLabel;

        public MainForm()
        {
            Text = "A Voxel Christmas";
            WindowState = FormWindowState.Maximized;
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.CenterScreen;
            
            // Set background color to match splash screen (prevents black screen)
            BackColor = Color.FromArgb(5, 5, 16);

            // Create loading label that shows immediately
            loadingLabel = new Label
            {
                Text = "❄️ Loading...",
                Font = new Font("Segoe UI", 24, FontStyle.Bold),
                ForeColor = Color.FromArgb(200, 220, 255),
                BackColor = Color.Transparent,
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock = DockStyle.Fill,
                Padding = new Padding(0)
            };
            Controls.Add(loadingLabel);
            loadingLabel.BringToFront();

            // Create and add WebView2 control (behind loading label)
            webView = new WebView2 
            { 
                Dock = DockStyle.Fill,
                BackColor = Color.FromArgb(5, 5, 16) // Match background
            };
            Controls.Add(webView);
            webView.SendToBack(); // Keep loading label on top

            // Initialize WebView2
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            try
            {
                // Get the base directory
                string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
                string htmlPath = Path.Combine(baseDirectory, "index.html");
                
                if (!File.Exists(htmlPath))
                {
                    MessageBox.Show($"Could not find index.html at: {htmlPath}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    Application.Exit();
                    return;
                }

                // Initialize WebView2
                await webView.EnsureCoreWebView2Async();

                // Set default background color to match splash screen
                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.DefaultBackgroundColor = Color.FromArgb(5, 5, 16);
                
                // Also set the WebView2 background explicitly
                webView.BackColor = Color.FromArgb(5, 5, 16);
                
                // Make WebView2 transparent until content loads (prevents black flash)
                webView.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled = false;

                // Set up virtual host name mapping to serve files via HTTP (fixes CORS for ES modules)
                // This allows ES modules to load without CORS errors
                webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "app.local",
                    baseDirectory,
                    CoreWebView2HostResourceAccessKind.Allow);

                // Set up message handler for JavaScript to C# communication (before navigation)
                webView.CoreWebView2.WebMessageReceived += (sender, e) =>
                {
                    string message = e.TryGetWebMessageAsString();
                    if (message == "quit")
                    {
                        // Close the application
                        this.Invoke((MethodInvoker)delegate
                        {
                            this.Close();
                        });
                    }
                };

                // Navigate using the virtual host name (HTTP instead of file://)
                webView.CoreWebView2.Navigate("http://app.local/index.html");

                // Hide loading label once DOM content is loaded
                webView.CoreWebView2.DOMContentLoaded += (sender, e) =>
                {
                    if (loadingLabel != null)
                    {
                        if (loadingLabel.InvokeRequired)
                        {
                            loadingLabel.Invoke((MethodInvoker)delegate
                            {
                                loadingLabel.Visible = false;
                            });
                        }
                        else
                        {
                            loadingLabel.Visible = false;
                        }
                    }
                };

                // Optional: Enable DevTools (comment out for production)
                // webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error initializing WebView2: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Application.Exit();
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            webView?.Dispose();
            base.OnFormClosing(e);
        }
    }
}

