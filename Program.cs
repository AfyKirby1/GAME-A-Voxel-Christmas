using System;
using System.IO;
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

        public MainForm()
        {
            Text = "A Voxel Christmas";
            WindowState = FormWindowState.Maximized;
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.CenterScreen;

            // Create and add WebView2 control
            webView = new WebView2 { Dock = DockStyle.Fill };
            Controls.Add(webView);

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

                // Enable autoplay for media (helps with background music)
                webView.CoreWebView2.Settings.IsAutoplayEnabled = true;

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

