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
                // Get the path to index.html
                string htmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "index.html");
                
                if (!File.Exists(htmlPath))
                {
                    MessageBox.Show($"Could not find index.html at: {htmlPath}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    Application.Exit();
                    return;
                }

                // Convert to file:// URI
                string htmlUri = new Uri(htmlPath).ToString();

                // Initialize WebView2
                await webView.EnsureCoreWebView2Async();

                // Navigate to the HTML file
                webView.CoreWebView2.Navigate(htmlUri);

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

